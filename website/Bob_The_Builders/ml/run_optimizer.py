import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any
from pathlib import Path

# -----------------------
# Load pre-trained models
# -----------------------
# Use absolute path based on this file's location
ML_DIR = Path(__file__).resolve().parent
MODELS_DIR = ML_DIR / "models"
CLASSIFIER_PATH = MODELS_DIR / "win_classifier_final.pkl"
REGRESSOR_PATH  = MODELS_DIR / "profit_regressor_final.pkl"

# Only load models if they exist (for when used as standalone script)
# When imported by backend, models will be loaded separately
try:
    if CLASSIFIER_PATH.exists() and REGRESSOR_PATH.exists():
        clf_pipe = joblib.load(str(CLASSIFIER_PATH))
        reg_pipe = joblib.load(str(REGRESSOR_PATH))
    else:
        clf_pipe = None
        reg_pipe = None
except Exception:
    clf_pipe = None
    reg_pipe = None


# -----------------------
# Helper prediction funcs
# -----------------------
def predict_win_prob_single(clf_pipe, bid_amount, base_price, quality_score):
    rel_markup = (bid_amount - base_price) / base_price
    X = pd.DataFrame([{
        "rel_markup": rel_markup,
        "quality_score": quality_score,
    }])
    try:
        return float(clf_pipe.predict_proba(X)[:, 1][0])
    except:
        return float(clf_pipe.predict(X)[0])



def predict_profit_if_won_single(reg_pipe, bid_amount, base_price, quality_score):
    rel_markup = (bid_amount - base_price) / base_price
    X = pd.DataFrame([{
        "rel_markup": rel_markup,
        "quality_score": quality_score,
    }])
    return float(reg_pipe.predict(X)[0])



# -------------------------------------------------------------
# ✅ YOUR EXACT OPTIMIZER FUNCTION (copy-paste exactly as below)
# -------------------------------------------------------------
def optimize_bid(
    clf_pipe,
    reg_pipe,
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

    # diagnostic sweep
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
        "profit_if_won_at_best": float(prof_if_won_best),
        "initial_bracket": [float(L), float(U)],
        "auto_expanded": bool(auto_expand),
        "diagnostic_bids": diag_bids.tolist(),
        "diagnostic_exp_profit": [float(v) for v in diag_vals],
    }


# -----------------------
# Example
# -----------------------
if __name__ == "__main__":
    if clf_pipe is None or reg_pipe is None:
        print("Error: Models not loaded. Please ensure model files exist in ml/models/")
        exit(1)
    
    base_price = 5792463.004
    quality = 0.5

    result = optimize_bid(
        clf_pipe,
        reg_pipe,
        base_price=base_price,
        quality_score=quality,
        auto_expand=True,
        use_profit_formula=True,
    )

    print("Best Bid:", result["best_bid"])
    print("Win Probability:", result["p_win_at_best"])
    print("Profit if Won:", result["profit_if_won_at_best"])
    print("Expected Profit:", result["expected_profit_at_best"])
