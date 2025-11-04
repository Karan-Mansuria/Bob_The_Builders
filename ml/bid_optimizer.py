
import numpy as np
import pandas as pd
import joblib
import os
import matplotlib.pyplot as plt
from typing import Optional, Dict, Any

# -----------------------------
# Configurable model paths
# -----------------------------
CLASSIFIER_PATH = "./trainingDataset/tender_win_model.pkl"   # joblib payload {'model','scaler'}
REGRESSOR_PATH  = "./trainingDataset/tender_profit_model.pkl" # joblib payload {'model','scaler'} (optional)

# -----------------------------
# Expected feature order
# -----------------------------
FEATURE_ORDER = ['bid_amount', 'base_price', 'quality_score', 'company_experience', 'past_success_rate']

# -----------------------------
# Helpers
# -----------------------------
def load_payload(path: str) -> Optional[Dict[str, Any]]:
    """Load joblib payload or return None if not found."""
    if path is None:
        return None
    if not os.path.exists(path):
        print(f"[bid_optimizer] Warning: model file not found at {path}. Falling back where applicable.")
        return None
    return joblib.load(path)

def make_feature_df(sample: dict) -> pd.DataFrame:
    """Create a single-row DataFrame with columns in FEATURE_ORDER from sample dict.
    Raises KeyError if any expected key is missing.
    """
    # ensure required keys exist
    for k in FEATURE_ORDER:
        if k not in sample:
            raise KeyError(f"Missing required feature '{k}' in sample input.")
    # create DataFrame in exact column order
    df = pd.DataFrame([{k: float(sample[k]) for k in FEATURE_ORDER}])
    return df

def predict_win_prob(classifier_payload: Dict[str, Any], X_df: pd.DataFrame) -> np.ndarray:
    """Return array of P(win) for each row in X_df (unscaled)."""
    if classifier_payload is None:
        raise ValueError("Classifier payload required for win-probability prediction.")
    model = classifier_payload['model']
    scaler = classifier_payload['scaler']
    X_scaled = scaler.transform(X_df)   # must match scaler used in training
    # predict_proba returns Nx2 array; index 1 is probability of class 1 (win)
    proba = model.predict_proba(X_scaled)[:, 1]
    return proba

def predict_profit_if_win(regressor_payload: Optional[Dict[str, Any]], X_df: pd.DataFrame,
                          clamp_non_negative: bool = True) -> np.ndarray:
    """Return predicted profit_if_win for each row. If regressor_payload is None,
    fallback to deterministic profit = base_price - bid_amount.
    X_df must have columns including 'bid_amount' and 'base_price'."""
    if regressor_payload is None:
        profits = (X_df['base_price'] - X_df['bid_amount']).to_numpy(dtype=float)
        if clamp_non_negative:
            profits = np.maximum(0.0, profits)
        return profits

    model = regressor_payload['model']
    scaler = regressor_payload['scaler']
    X_scaled = scaler.transform(X_df)   # must match scaler used in regressor training
    preds = model.predict(X_scaled).astype(float)
    if clamp_non_negative:
        preds = np.maximum(0.0, preds)
    return preds

# -----------------------------
# Core optimizer function
# -----------------------------
def find_optimal_bid(base_price: float,
                     quality_score: float,
                     company_experience: float,
                     past_success_rate: float,
                     classifier_payload: Dict[str, Any],
                     regressor_payload: Optional[Dict[str, Any]] = None,
                     bid_min_factor: float = 0.85,
                     bid_max_factor: float = 1.05,
                     n_steps: int = 101,
                     min_win_prob: float = 0.0,
                     clamp_non_negative_profit: bool = True,
                     plot_curve: bool = True):
    """
    Sweep bid values and return the optimal bid with diagnostics.

    Inputs:
      - base_price, quality_score, company_experience, past_success_rate: tender inputs
      - classifier_payload: loaded joblib payload with {'model','scaler'} (required)
      - regressor_payload: loaded joblib payload with {'model','scaler'} (optional)
      - bid_min_factor, bid_max_factor: factors applied to base_price to define sweep range
      - n_steps: resolution of the sweep
      - min_win_prob: optional constraint (ignore bids with P(win) < min_win_prob)
      - clamp_non_negative_profit: clamp predicted profit to >= 0
      - plot_curve: show matplotlib plot of expected value vs bid

    Returns:
      dict with:
        - best_bid, best_expected_profit, p_win_at_best_bid, profit_if_win_at_best_bid,
        - arrays: bids, p_wins, profits_if_win, expected_values
    """
    if classifier_payload is None:
        raise ValueError("classifier_payload is required (cannot compute P(win) without it).")

    # prepare bid grid
    bids = np.linspace(bid_min_factor * base_price, bid_max_factor * base_price, n_steps).astype(float)

    # build repeated feature rows for vectorized prediction
    samples = []
    for bid in bids:
        samples.append({
            'bid_amount': float(bid),
            'base_price': float(base_price),
            'quality_score': float(quality_score),
            'company_experience': float(company_experience),
            'past_success_rate': float(past_success_rate)
        })
    X_df = pd.DataFrame(samples)[FEATURE_ORDER]  # ensure column order

    # predict probabilities and profits vectorized
    p_wins = predict_win_prob(classifier_payload, X_df)
    profits_if_win = predict_profit_if_win(regressor_payload, X_df, clamp_non_negative=clamp_non_negative_profit)

    expected_values = p_wins * profits_if_win

    # apply min_win_prob constraint (set expected to -inf for bids failing constraint so they won't be chosen)
    if min_win_prob > 0.0:
        mask = p_wins < min_win_prob
        expected_values_masked = expected_values.copy()
        expected_values_masked[mask] = -np.inf
        best_idx = int(np.nanargmax(expected_values_masked))
    else:
        best_idx = int(np.nanargmax(expected_values))

    best_bid = float(bids[best_idx])
    result = {
        'best_bid': best_bid,
        'best_expected_profit': float(expected_values[best_idx]),
        'p_win_at_best_bid': float(p_wins[best_idx]),
        'profit_if_win_at_best_bid': float(profits_if_win[best_idx]),
        'bids': bids,
        'p_wins': p_wins,
        'profits_if_win': profits_if_win,
        'expected_values': expected_values
    }

    # plotting (optional)
    if plot_curve:
        try:
            plt.figure(figsize=(8, 5))
            plt.plot(bids, expected_values, label='Expected Profit', marker='o')
            plt.plot(bids, profits_if_win, label='Profit if win', linestyle='--')
            plt.twinx()
            ax = plt.gca()
            ax2 = ax.twinx()
            # avoid plotting P(win) on same scale; plot as secondary axis
        except Exception:
            # fallback minimal plot: expected profit only
            plt.figure(figsize=(8,5))
            plt.plot(bids, expected_values, label='Expected Profit', marker='o')

        plt.xlabel('Bid Amount')
        plt.ylabel('Expected Profit')
        plt.title('Expected Profit vs Bid Amount')
        plt.grid(True)
        plt.axvline(best_bid, color='red', linestyle='--', label=f'Best bid: {best_bid:.2f}')
        plt.legend()
        plt.tight_layout()
        plt.show()

    return result

# -----------------------------
# Example CLI usage
# -----------------------------
if __name__ == "__main__":
    # Load models (classifier required)
    clf_payload = load_payload(CLASSIFIER_PATH)
    reg_payload = load_payload(REGRESSOR_PATH)  # may be None

    # Example tender input (frontend will supply these)
    sample_base_price = 900000.0
    sample_quality = 8.5
    sample_experience = 6.0
    sample_past_success = 0.75

    print("[bid_optimizer] Running optimizer for sample tender...")

    opt = find_optimal_bid(
        base_price=sample_base_price,
        quality_score=sample_quality,
        company_experience=sample_experience,
        past_success_rate=sample_past_success,
        classifier_payload=clf_payload,
        regressor_payload=reg_payload,
        bid_min_factor=0.85,
        bid_max_factor=1.05,
        n_steps=61,
        min_win_prob=0.0,
        clamp_non_negative_profit=True,
        plot_curve=True
    )

    print("\n=== Result ===")
    print(f"Optimal bid: {opt['best_bid']:.2f}")
    print(f"Expected profit at optimal bid: {opt['best_expected_profit']:.2f}")
    print(f"P(win) at optimal bid: {opt['p_win_at_best_bid']:.3f}")
    print(f"Predicted profit if win at optimal bid: {opt['profit_if_win_at_best_bid']:.2f}")
