"""
Final Bid Optimization Pipeline — robust, ready-for-deadline single-file script.

Features added / fixes since first draft:
- Robust handling of class imbalance (simple random oversampling of wins if requested).
- Graceful handling when there are zero or one positive "won" examples (warnings & fallback).
- Predict_proba safe handling for models without `predict_proba`.
- Option to choose regressor: `ridge` (fast) or `rf` (random forest -> more flexible).
- Input validation, deterministic random seed, reproducible splits.
- Verbose logging and helpful CLI messages for debugging before deadline.
- Saves models to `./ml/models/` and prints evaluation metrics.
- `--dry_run` option to test the whole pipeline on a tiny synthetic dataset without CSV.

How to run (example):
python bid_opt_pipeline_final.py --csv bids.csv --opt_base 100000 --opt_quality 0.72 --opt_min_pct 0.0 --opt_max_pct 0.5 --oversample

Dependencies:
- python 3.8+
- scikit-learn
- pandas
- joblib
- numpy

"""

from __future__ import annotations

import argparse
import os
import sys
import warnings
from dataclasses import dataclass
from typing import Any, Dict, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_squared_error,
    r2_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.utils import resample

# -----------------------------
# Config
# -----------------------------
CLASSIFIER_PATH = "./ml/models/win_classifier_final.pkl"
REGRESSOR_PATH = "./ml/models/profit_regressor_final.pkl"
SEED = 42
REQUIRED_COLS = ["bid_amount", "base_price", "quality_score", "won"]
FEATURES = ["bid_amount", "base_price", "quality_score"]
TARGET_CLASS = "won"
TARGET_PROFIT = "profit_if_won"


@dataclass
class TrainResults:
    clf_metrics: Dict[str, Any]
    reg_metrics: Dict[str, Any]


# -----------------------------
# Utilities
# -----------------------------

def safe_print(*args, **kwargs):
    print(*args, **kwargs)
    sys.stdout.flush()


def load_dataset(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    missing = [c for c in REQUIRED_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    df = df.copy()
    # coerce numeric
    for c in ["bid_amount", "base_price", "quality_score"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")

    df[TARGET_CLASS] = pd.to_numeric(df[TARGET_CLASS], errors="coerce").fillna(0).astype(int)

    # drop rows missing core values
    df = df.dropna(subset=["bid_amount", "base_price", "quality_score", TARGET_CLASS])

    # profit definition: exactly as requested
    df[TARGET_PROFIT] = df["bid_amount"] - df["base_price"]

    if df.empty:
        raise ValueError("No data left after cleaning. Check CSV contents.")

    return df


def make_synthetic_small_dataset(n=200, seed=SEED) -> pd.DataFrame:
    rng = np.random.RandomState(seed)
    base_price = rng.uniform(50000, 150000, size=n)
    # quality between 0..1
    q = rng.uniform(0.0, 1.0, size=n)
    # bid amount = base_price * (1 + markup) with markup depending on quality
    markup = rng.normal(loc=0.05 + 0.1 * (1 - q), scale=0.03, size=n)
    bid = base_price * (1.0 + markup)

    # make win probability higher for lower bid & higher quality
    logits = -0.00005 * (bid - base_price) + 2.0 * q
    prob_win = 1 / (1 + np.exp(-logits))
    wins = (rng.rand(n) < prob_win).astype(int)

    df = pd.DataFrame({
        "bid_amount": bid,
        "base_price": base_price,
        "quality_score": q,
        "won": wins,
    })
    df[TARGET_PROFIT] = df["bid_amount"] - df["base_price"]
    return df


# -----------------------------
# Models
# -----------------------------

def build_classifier(random_state=SEED) -> Pipeline:
    clf = LogisticRegression(max_iter=3000, class_weight="balanced", random_state=random_state)
    pipe = Pipeline([
        ("scale", StandardScaler()),
        ("clf", clf),
    ])
    return pipe


def build_regressor(kind: str = "ridge", random_state=SEED) -> Pipeline:
    if kind == "ridge":
        reg = Ridge(alpha=1.0, random_state=random_state)
    elif kind == "rf":
        reg = RandomForestRegressor(n_estimators=200, random_state=random_state)
    else:
        raise ValueError("regressor kind must be 'ridge' or 'rf'")

    pipe = Pipeline([
        ("scale", StandardScaler()),
        ("reg", reg),
    ])
    return pipe


def predict_win_prob_safe(clf_pipe: Pipeline, X: pd.DataFrame) -> np.ndarray:
    """Return probabilities (floats between 0 and 1). If predict_proba is missing, try decision_function -> logistic."""
    try:
        probs = clf_pipe.predict_proba(X)[:, 1]
    except Exception:
        # fallback to decision_function
        try:
            df = clf_pipe.decision_function(X)
        except Exception:
            # last resort: predict and map {0->0.0,1->1.0}
            preds = clf_pipe.predict(X)
            probs = preds.astype(float)
            return probs
        # squash to probability via logistic
        probs = 1.0 / (1.0 + np.exp(-df))
    return probs


# -----------------------------
# Training
# -----------------------------

def random_oversample(df: pd.DataFrame, target_col: str = TARGET_CLASS, ratio: float = 0.5, seed=SEED) -> pd.DataFrame:
    """
    Simple random oversampling to ensure positive class ratio ~ `ratio` (0<ratio<1).
    Only duplicates positive examples until desired ratio reached.
    """
    if ratio <= 0 or ratio >= 1:
        raise ValueError("ratio must be in (0,1)")

    pos = df[df[target_col] == 1]
    neg = df[df[target_col] == 0]
    if len(pos) == 0:
        warnings.warn("No positive examples to oversample.")
        return df

    cur_ratio = len(pos) / len(df)
    if cur_ratio >= ratio:
        return df

    # target positives count
    target_pos = int(ratio * len(df) / (1.0 - ratio))
    # number to add
    add = max(0, target_pos - len(pos))
    if add == 0:
        return df

    pos_upsampled = resample(pos, replace=True, n_samples=add, random_state=seed)
    df_new = pd.concat([df, pos_upsampled], ignore_index=True)
    return df_new


def train_models(
    df: pd.DataFrame,
    reg_kind: str = "ridge",
    oversample: bool = False,
    oversample_ratio: float = 0.25,
    test_size: float = 0.2,
    random_state: int = SEED,
) -> TrainResults:
    # optionally oversample
    if oversample:
        df = random_oversample(df, TARGET_CLASS, ratio=oversample_ratio, seed=random_state)
        safe_print(f"After oversampling: n={len(df)}, wins={df['won'].sum()} (ratio={df['won'].mean():.3f})")

    X = df[FEATURES]
    y_clf = df[TARGET_CLASS]
    y_reg = df[TARGET_PROFIT]

    # if too few positives for stratify, fallback
    stratify = y_clf if y_clf.nunique() > 1 and y_clf.sum() >= 2 else None
    if stratify is None:
        warnings.warn("Not enough positive/negative samples for stratified split. Using random split.")

    X_train, X_test, y_clf_train, y_clf_test, y_reg_train, y_reg_test = train_test_split(
        X, y_clf, y_reg, test_size=test_size, random_state=random_state, stratify=stratify
    )

    clf_pipe = build_classifier(random_state=random_state)

    # If there are no positive samples in the train set, warn and still fit with class_weight balanced (will be all-zero)
    if y_clf_train.sum() == 0:
        warnings.warn("Training data has 0 positive 'won' samples. Classifier will predict 0-probabilities.")

    clf_pipe.fit(X_train, y_clf_train)

    y_proba = predict_win_prob_safe(clf_pipe, X_test)
    # clamp
    y_proba = np.clip(y_proba, 0.0, 1.0)
    y_pred = (y_proba >= 0.5).astype(int)

    clf_metrics = dict(
        accuracy=float(accuracy_score(y_clf_test, y_pred)),
        roc_auc=float(roc_auc_score(y_clf_test, y_proba)) if len(np.unique(y_clf_test)) > 1 else float("nan"),
        f1=float(f1_score(y_clf_test, y_pred, zero_division=0)),
        confusion_matrix=confusion_matrix(y_clf_test, y_pred).tolist(),
    )

    # Regressor
    reg_pipe = build_regressor(kind=reg_kind, random_state=random_state)
    reg_pipe.fit(X_train, y_reg_train)

    y_reg_pred = reg_pipe.predict(X_test)
    reg_metrics = dict(
        rmse=float(mean_squared_error(y_reg_test, y_reg_pred)),
        r2=float(r2_score(y_reg_test, y_reg_pred)),
    )

    # persist
    os.makedirs(os.path.dirname(CLASSIFIER_PATH), exist_ok=True)
    joblib.dump(clf_pipe, CLASSIFIER_PATH)
    joblib.dump(reg_pipe, REGRESSOR_PATH)

    return TrainResults(clf_metrics=clf_metrics, reg_metrics=reg_metrics)


# -----------------------------
# Inference & Optimizer
# -----------------------------

def load_models() -> Tuple[Pipeline, Pipeline]:
    clf_pipe: Pipeline = joblib.load(CLASSIFIER_PATH)
    reg_pipe: Pipeline = joblib.load(REGRESSOR_PATH)
    return clf_pipe, reg_pipe


def predict_win_prob_single(clf_pipe: Pipeline, bid_amount: float, base_price: float, quality_score: float) -> float:
    X = pd.DataFrame([{"bid_amount": bid_amount, "base_price": base_price, "quality_score": quality_score}])
    return float(predict_win_prob_safe(clf_pipe, X)[0])


def predict_profit_if_won_single(reg_pipe: Pipeline, bid_amount: float, base_price: float, quality_score: float) -> float:
    X = pd.DataFrame([{"bid_amount": bid_amount, "base_price": base_price, "quality_score": quality_score}])
    return float(reg_pipe.predict(X)[0])


def optimize_bid(
    clf_pipe: Pipeline,
    reg_pipe: Pipeline,
    base_price: float,
    quality_score: float,
    min_bid: float | None = None,
    max_bid: float | None = None,
    n_points: int = 201,
    auto_expand: bool = True,
    tol_rel: float = 1e-3,
    min_pwin: float = 1e-4,
    use_profit_formula: bool = False,
) -> Dict[str, Any]:
    if base_price <= 0:
        raise ValueError("base_price must be > 0")

    def exp_profit_at(bid: float) -> float:
        p = predict_win_prob_single(clf_pipe, bid, base_price, quality_score)
        prof = (bid - base_price) if use_profit_formula else \
               predict_profit_if_won_single(reg_pipe, bid, base_price, quality_score)
        return float(p * prof)

    L = float(min_bid) if min_bid is not None else base_price * 0.8
    U = float(max_bid) if max_bid is not None else base_price * 1.2

    def coarse_search(l, u, n=n_points):
        bids = np.linspace(l, u, n)
        vals = np.array([exp_profit_at(b) for b in bids])
        i = int(np.nanargmax(vals))
        return bids[i], float(vals[i]), bids, vals

    best_bid, best_val, bids, vals = coarse_search(L, U)

    if auto_expand:
        expansions = 0
        while True:
            if len(bids) >= 3 and np.argmax(vals) >= len(bids) - 2:
                new_U = U * 1.5
                if predict_win_prob_single(clf_pipe, new_U, base_price, quality_score) < min_pwin:
                    break
                cand_bid, cand_val, bids2, vals2 = coarse_search(U, new_U, max(51, n_points // 2))
                if cand_val > best_val * (1.0 + tol_rel):
                    L, U = U, new_U
                    best_bid, best_val = cand_bid, cand_val
                    bids, vals = bids2, vals2
                    expansions += 1
                    if expansions >= 8:
                        break
                else:
                    break
            else:
                break

    span = max(1.0, 0.1 * max(best_bid, 1.0))
    a = max(base_price * 0.5, best_bid - span)
    b = best_bid + span

    phi = (1 + 5 ** 0.5) / 2
    resphi = 2 - phi
    x1 = a + resphi * (b - a)
    x2 = b - resphi * (b - a)
    f1 = exp_profit_at(x1)
    f2 = exp_profit_at(x2)

    for _ in range(50):
        if f1 < f2:
            a = x1
            x1 = x2
            f1 = f2
            x2 = b - resphi * (b - a)
            f2 = exp_profit_at(x2)
        else:
            b = x2
            x2 = x1
            f2 = f1
            x1 = a + resphi * (b - a)
            f1 = exp_profit_at(x1)
        if abs(b - a) <= max(1e-6, tol_rel * max(best_bid, 1.0)):
            break

    candidates = [(best_bid, best_val), (x1, f1), (x2, f2)]
    final_bid, final_val = max(candidates, key=lambda t: t[1])

    diag_L = min(a, L)
    diag_U = max(b, U)
    diag_bids = np.linspace(diag_L, diag_U, max(101, n_points))
    diag_vals = [exp_profit_at(x) for x in diag_bids]

    p_win_best = predict_win_prob_single(clf_pipe, final_bid, base_price, quality_score)

    if use_profit_formula:
        prof_if_won_best = final_bid - base_price
    else:
        prof_if_won_best = predict_profit_if_won_single(reg_pipe, final_bid, base_price, quality_score)


    return {
        "best_bid": float(final_bid),
        "expected_profit_at_best": float(final_val),
        "p_win_at_best": float(p_win_best),
        "initial_bracket": [float(L), float(U)],
        "auto_expanded": bool(auto_expand),
        "diagnostic_bids": diag_bids.tolist(),
        "diagnostic_exp_profit": [float(v) for v in diag_vals],
    }



# -----------------------------
# CLI
# -----------------------------

def main():
    p = argparse.ArgumentParser(description="Train and run bid optimization pipeline (final, robust).")
    p.add_argument("--csv", type=str, help="Path to CSV with columns: bid_amount, base_price, quality_score, won")
    p.add_argument("--dry_run", action="store_true", help="Run on a synthetic small dataset (no csv required)")
    p.add_argument("--regressor", choices=["ridge", "rf"], default="ridge", help="Regressor type")
    p.add_argument("--oversample", action="store_true", help="Apply simple random oversampling to increase positive ratio")
    p.add_argument("--oversample_ratio", type=float, default=0.25, help="Target positive ratio after oversampling (0<r<1)")
    p.add_argument("--test_size", type=float, default=0.2)
    p.add_argument("--opt_base", type=float, default=None)
    p.add_argument("--opt_quality", type=float, default=None)

    # NEW replacement for percentage-based bounding:
    p.add_argument("--min_bid", type=float, default=None, help="Absolute minimum bid for optimizer (optional)")
    p.add_argument("--max_bid", type=float, default=None, help="Absolute maximum bid for optimizer (optional)")

    # NEW (keep this one)
    p.add_argument("--n_points", type=int, default=201)
    p.add_argument("--auto_expand", action="store_true", help="Auto-expand until true optimum found")
    p.add_argument("--use_profit_formula", action="store_true", help="Force profit = (bid - base_price)")


    args = p.parse_args()

    if not args.dry_run and not args.csv:
        p.error("--csv is required unless --dry_run is used")

    if args.dry_run:
        safe_print("Running dry run with synthetic dataset...")
        df = make_synthetic_small_dataset(n=200, seed=SEED)
    else:
        safe_print(f"Loading CSV: {args.csv}")
        df = load_dataset(args.csv)

    safe_print(f"Loaded data: n={len(df)}, wins={int(df['won'].sum())}, win_ratio={df['won'].mean():.3f}")

    # Train
    safe_print("Training models...")
    results = train_models(df, reg_kind=args.regressor, oversample=args.oversample, oversample_ratio=args.oversample_ratio, test_size=args.test_size, random_state=SEED)

    safe_print("\
=== Classifier Metrics ===")
    for k, v in results.clf_metrics.items():
        safe_print(f"{k}: {v}")

    safe_print("\
=== Regressor Metrics ===")
    for k, v in results.reg_metrics.items():
        safe_print(f"{k}: {v}")

    # optional optimization
    if args.opt_base is not None and args.opt_quality is not None:
        clf_pipe, reg_pipe = load_models()
        safe_print("Running optimizer search...")

    out = optimize_bid(
        clf_pipe, reg_pipe,
        base_price=float(args.opt_base),
        quality_score=float(args.opt_quality),
        min_bid=args.min_bid,
        max_bid=args.max_bid,
        n_points=int(args.n_points),
        auto_expand=bool(args.auto_expand),
        use_profit_formula=bool(args.use_profit_formula),
    )

    safe_print("\
    === Sample Optimization ===")
    safe_print(f"initial_bracket: {out['initial_bracket']}")
    safe_print(f"best_bid: {out['best_bid']}")
    safe_print(f"p_win_at_best: {out['p_win_at_best']}")
    safe_print(f"expected_profit_at_best: {out['expected_profit_at_best']}")
    safe_print(f"auto_expanded: {out['auto_expanded']}")


    safe_print("(Tip: If expected_profit_at_best is very small or negative, consider increasing search range or examine classifier/regressor performance.)")


if __name__ == '__main__':
    main()