"""
generate_realistic_bids.py
--------------------------
Robust synthetic tender/bidding CSV generator.
Produces a realistic dataset with columns:
  - bid_amount
  - base_price
  - quality_score
  - won
Optional extras included: vendor_id, vendor_type, vendor_rating, date

Usage examples:
  python generate_realistic_bids.py --n 5000 --outfile synthetic_bids.csv --seed 42

This file is safe to drop in your project and run.
"""

from __future__ import annotations
import argparse
from datetime import datetime, timedelta
import numpy as np
import pandas as pd


def generate_realistic_bids_enhanced(n=5000, seed=42, outfile="synthetic_bids_enh.csv",
                                     n_vendors=200, drift_years=1.0,
                                     outlier_frac=0.002, missing_frac=0.005):
    rng = np.random.default_rng(seed)

    # vendor-level heterogeneity
    vendor_ids = rng.integers(0, n_vendors, size=n)
    vendor_type = (vendor_ids % 3)  # 0=lowcost,1=balanced,2=premium
    vendor_rating = np.clip(rng.normal(3.5 + 0.8 * (vendor_type == 2), 0.6, size=n), 1.0, 5.0)

    # time (simulate tenders over time)
    start = datetime.now() - timedelta(days=int(365 * drift_years))
    days = rng.integers(0, int(365 * drift_years), size=n)
    date = [start + timedelta(days=int(d)) for d in days]

    # base_price depends on vendor_type (premiums handle larger tenders)
    base_price = rng.uniform(40000, 120000, size=n) * (1.0 + 0.6 * (vendor_type == 2))

    # quality influenced by vendor rating
    quality_score = np.clip(rng.beta(2.2, 1.8, size=n) + 0.05 * (vendor_rating - 3.5), 0.0, 1.0)

    # markup: lower for lowcost vendors, higher for premium, noise scaled with base_price
    base_markup = np.where(vendor_type == 0, 0.03, np.where(vendor_type == 1, 0.08, 0.15))
    noise_scale = 0.02 + 0.0000001 * base_price
    markup = rng.normal(loc=base_markup + 0.12 * (quality_score - 0.5), scale=noise_scale, size=n)
    markup = np.clip(markup, -0.05, 0.5)
    bid_amount = np.round(base_price * (1.0 + markup), 2)

    # Logistic win model with vendor reputation and date drift
    day_norm = (days - days.min()) / max(1, (days.max() - days.min()))
    drift = 0.2 * day_norm
    logits = (
        -2.0                                          # lower base win rate
        + 4.0 * quality_score                         # high quality helps
        - 0.00003 * (bid_amount - base_price)         # bidding higher DROPS win chance strongly
        + 0.3 * (vendor_rating - 3.5)                 # vendor reputation matters but not too much
        + rng.normal(0, 0.4)                          # noise for randomness
    )

    prob_win = 1.0 / (1.0 + np.exp(-logits))
    won = (rng.random(size=n) < prob_win).astype(int)

    df = pd.DataFrame({
        "date": pd.to_datetime(date),
        "vendor_id": vendor_ids,
        "vendor_type": vendor_type,
        "vendor_rating": np.round(vendor_rating, 2),
        "bid_amount": bid_amount,
        "base_price": np.round(base_price, 2),
        "quality_score": np.round(quality_score, 4),
        "won": won,
    })

    # inject outliers
    k = max(1, int(outlier_frac * n))
    outlier_idx = rng.choice(n, size=k, replace=False)
    df.loc[outlier_idx, "bid_amount"] *= rng.uniform(1.8, 5.0, size=k)

    # inject missingness
    m = int(missing_frac * n)
    if m > 0:
        miss_idx = rng.choice(n, size=m, replace=False)
        df.loc[miss_idx, "quality_score"] = np.nan

    # final CSV
    df.to_csv(outfile, index=False)
    return df


def validate_dataset(df: pd.DataFrame) -> dict:
    checks = {}
    checks['n'] = len(df)
    checks['win_ratio'] = float(df['won'].mean())
    checks['base_min'] = float(df['base_price'].min())
    checks['bid_min'] = float(df['bid_amount'].min())
    checks['quality_range'] = (float(df['quality_score'].min(skipna=True)), float(df['quality_score'].max(skipna=True)))
    checks['outliers_bid_99_9pct'] = float(df['bid_amount'].quantile(0.999)) / float(df['bid_amount'].median())
    return checks


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Enhanced synthetic tender bid generator')
    parser.add_argument('--n', type=int, default=5000)
    parser.add_argument('--outfile', type=str, default='synthetic_bids_enh.csv')
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--n_vendors', type=int, default=200)
    parser.add_argument('--drift_years', type=float, default=1.0)
    args = parser.parse_args()

    df = generate_realistic_bids_enhanced(n=args.n, seed=args.seed, outfile=args.outfile, n_vendors=args.n_vendors, drift_years=args.drift_years)
    print('Generated:', args.outfile)
    print('Validations:', validate_dataset(df))
