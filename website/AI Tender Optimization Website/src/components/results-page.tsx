import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { NeoBackground } from "./neo-background";
import { AutoHideHeader } from "./auto-hide-header";
import { getJob, JobStatusResponse } from "../api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ResultsPageProps {
  userEmail: string;
  jobId: string;
  onBack: () => void;
  onLogout: () => void;
}

export function ResultsPage({ userEmail, jobId, onBack, onLogout }: ResultsPageProps) {
  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getJob(jobId);
        if (mounted) setJob(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load job");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  const chartData = useMemo(() => {
    if (!job?.result?.diagnostic_bids || !job?.result?.diagnostic_exp_profit) return [] as { x: number; y: number }[];
    const bids = job.result.diagnostic_bids;
    const vals = job.result.diagnostic_exp_profit;
    return bids.slice(0, Math.min(bids.length, vals.length)).map((b, i) => ({ x: Math.round(b), y: Number(vals[i]) }));
  }, [job]);

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      <NeoBackground />
      <AutoHideHeader userEmail={userEmail} onLogout={onLogout} showBackButton onBackClick={onBack} backLabel="Back" />

      <main className="relative z-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl text-text-primary">Optimization Result</h1>
            <div className="text-text-secondary">Job: <span className="text-text-primary">{jobId}</span></div>
          </div>

          {loading && <div className="text-text-secondary">Loading...</div>}
          {error && <div className="text-accent-yellow">{error}</div>}
          {!loading && !error && job && (
            <div className="space-y-8">
              {/* Optimizer Results */}
              <Card className="p-6">
                <h2 className="text-xl text-text-primary mb-4">Optimizer Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div><div className="text-sm text-text-secondary">Base Price</div><div className="text-2xl text-text-primary">₹{job.result?.base_price?.toLocaleString?.() ?? job.result?.base_price ?? '-'}</div></div>
                  <div><div className="text-sm text-text-secondary">Recommended Bid (best_bid)</div><div className="text-2xl text-text-primary">₹{job.result?.best_bid?.toLocaleString?.() ?? job.result?.best_bid ?? '-'}</div></div>
                  <div><div className="text-sm text-text-secondary">Win Probability (p_win_at_best)</div><div className="text-2xl text-text-primary">{job.result?.p_win_at_best != null ? `${(job.result.p_win_at_best * 100).toFixed(2)}%` : '-'}</div></div>
                  <div><div className="text-sm text-text-secondary">Expected Profit (expected_profit_at_best)</div><div className="text-2xl text-text-primary">₹{job.result?.expected_profit_at_best?.toLocaleString?.() ?? job.result?.expected_profit_at_best ?? '-'}</div></div>
                  <div><div className="text-sm text-text-secondary">Profit If Won (profit_if_won_at_best)</div><div className="text-2xl text-text-primary">₹{job.result?.profit_if_won_at_best?.toLocaleString?.() ?? job.result?.profit_if_won_at_best ?? '-'}</div></div>
                  <div><div className="text-sm text-text-secondary">Status</div><div className="text-2xl text-text-primary capitalize">{job.status}</div></div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <div className="text-sm text-text-secondary mb-1">Initial Bracket</div>
                    <div className="text-text-primary">
                      {job.result?.initial_bracket && job.result.initial_bracket.length === 2 ? (
                        `₹${(job.result.initial_bracket[0] as number)?.toLocaleString?.() ?? job.result.initial_bracket[0]} - ₹${(job.result.initial_bracket[1] as number)?.toLocaleString?.() ?? job.result.initial_bracket[1]}`
                      ) : '-'}
                    </div>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <div className="text-sm text-text-secondary mb-1">Auto Expanded</div>
                    <div className="text-text-primary">{job.result?.auto_expanded ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <div className="text-sm text-text-secondary mb-1">Diagnostic Points</div>
                    <div className="text-text-primary">{job.result?.diagnostic_bids?.length ?? 0}</div>
                  </div>
                </div>
              </Card>

              {/* Extracted Tender Data */}
              {job.result?.extracted_data && (
                <Card className="p-6">
                  <h2 className="text-xl text-text-primary mb-4">Extracted Tender Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(job.result.extracted_data).map(([key, value]) => (
                      <div key={key} className="p-4 bg-surface-2 rounded-lg">
                        <div className="text-sm text-text-secondary mb-1">{key}</div>
                        <div className="text-text-primary font-medium">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Chart */}
              <Card className="p-6 h-80">
                <div className="text-sm text-text-secondary mb-3">Expected Profit vs Bid</div>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="x" tickFormatter={(v) => `${v}`} />
                      <YAxis tickFormatter={(v) => `${v}`} />
                      <Tooltip formatter={(value: number) => value.toLocaleString()} labelFormatter={(l) => `Bid: ₹${Number(l).toLocaleString()}`} />
                      <Line type="monotone" dataKey="y" stroke="#0B63FF" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-text-secondary">No diagnostic data available.</div>
                )}
              </Card>

              <div className="flex gap-4">
                <Button onClick={onBack} variant="outline" className="h-11">Back</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


