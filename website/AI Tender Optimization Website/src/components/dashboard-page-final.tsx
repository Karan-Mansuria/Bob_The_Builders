import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Zap, FileText, TrendingUp, DollarSign, Plus, Calendar, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { NeoBackground } from "./neo-background";
import { AutoHideHeader } from "./auto-hide-header";
import { getJobs, JobStatusResponse } from "../api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardPageFinalProps {
  userEmail: string;
  onNavigateToUpload: () => void;
  onLogout: () => void;
}

export function DashboardPageFinal({ userEmail, onNavigateToUpload, onLogout }: DashboardPageFinalProps) {
  const [jobs, setJobs] = useState<JobStatusResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<JobStatusResponse | null>(null);
  const [open, setOpen] = useState(false);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getJobs();
      setJobs(data);
      console.log("[Dashboard] Loaded jobs:", data.length);
    } catch (e: any) {
      console.error("[Dashboard] Error loading jobs:", e);
      setError(e?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // No auto-refresh - user can manually refresh if needed
  }, []);

  const chartData = useMemo(() => {
    if (!selected?.result?.diagnostic_bids || !selected?.result?.diagnostic_exp_profit) return [] as { x: number; y: number }[];
    const bids = selected.result.diagnostic_bids;
    const vals = selected.result.diagnostic_exp_profit;
    return bids.slice(0, Math.min(bids.length, vals.length)).map((b, i) => ({ x: Math.round(b), y: Number(vals[i]) }));
  }, [selected]);

  const userName = userEmail.split("@")[0];

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      <NeoBackground />

      <AutoHideHeader userEmail={userEmail} onLogout={onLogout} />

      <main className="relative z-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-4xl text-text-primary">
              Welcome back, <span className="text-accent-yellow">{userName}</span>
            </h1>
            <p className="text-lg text-text-secondary">
              Here's your tender optimization dashboard
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 card-gradient border-primary/20 rounded-xl hover:border-primary/40 hover:shadow-lg transition-all btn-hover-lift"
                style={{ boxShadow: '0 8px 24px rgba(11, 19, 40, 0.08)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-primary">{jobs.length}</div>
                  <div className="text-sm text-text-secondary">Bids Optimized</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="p-6 card-gradient border-accent-positive/20 rounded-xl hover:border-accent-positive/40 hover:shadow-lg transition-all btn-hover-lift"
                style={{ boxShadow: '0 8px 24px rgba(11, 19, 40, 0.08)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-accent-positive/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-accent-positive" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-accent-positive" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-accent-positive">
                    {jobs.length > 0 
                      ? `${Math.round((jobs.filter(j => j.status === 'succeeded').length / jobs.length) * 100)}%`
                      : '0%'}
                  </div>
                  <div className="text-sm text-text-secondary">Success Rate</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 card-gradient border-accent-yellow/20 rounded-xl hover:border-accent-yellow/40 hover:shadow-lg transition-all btn-hover-lift"
                style={{ boxShadow: '0 8px 24px rgba(11, 19, 40, 0.08)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-accent-yellow/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-accent-yellow" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-accent-yellow" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-accent-yellow">
                    ₹{jobs
                      .filter(j => j.result?.best_bid)
                      .reduce((sum, j) => sum + (j.result?.best_bid || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-text-secondary">Total Value</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="p-6 card-gradient border-primary/20 rounded-xl hover:border-primary/40 hover:shadow-lg transition-all btn-hover-lift"
                style={{ boxShadow: '0 8px 24px rgba(11, 19, 40, 0.08)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-primary">
                    ₹{jobs
                      .filter(j => j.result?.expected_profit_at_best)
                      .reduce((sum, j) => sum + (j.result?.expected_profit_at_best || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-text-secondary">Expected Profit</div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-12 card-gradient border-accent-yellow/30 rounded-2xl text-center relative overflow-hidden shadow-xl"
              style={{ boxShadow: '0 12px 32px rgba(11, 19, 40, 0.1)' }}>
              <div className="relative max-w-2xl mx-auto space-y-6">
                <div className="inline-flex p-4 bg-accent-yellow/10 rounded-2xl">
                  <Plus className="h-12 w-12 text-accent-yellow" />
                </div>
                <h2 className="text-3xl text-text-primary">
                  Create New <span className="text-accent-yellow">Tender</span>
                </h2>
                <p className="text-lg text-text-secondary">
                  Upload your tender document and let AI optimize your bid with intelligent analysis
                </p>
                <Button
                  onClick={onNavigateToUpload}
                  className="h-14 px-8 bg-primary hover:bg-primary-700 text-white rounded-xl btn-hover-lift focus-ring shadow-lg"
                  style={{ boxShadow: '0 4px 14px rgba(11, 99, 255, 0.3)' }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Start New Tender
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Recent Bids (from API) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 card-gradient border-neutral-border rounded-2xl shadow-lg"
              style={{ boxShadow: '0 8px 24px rgba(11, 19, 40, 0.08)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-text-primary">Recent Bids</h3>
                <Button variant="outline" size="sm" onClick={loadJobs} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              {loading && <div className="text-text-secondary">Loading...</div>}
              {error && <div className="text-accent-yellow">{error}</div>}
              {!loading && !error && (
                <div className="space-y-4">
                  {jobs.length === 0 && (
                    <div className="text-text-secondary">No jobs yet. Start one above.</div>
                  )}
                  {jobs.map((j, index) => (
                    <motion.div
                      key={j.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.03 }}
                      className="flex items-center justify-between p-5 rounded-xl card-gradient border border-neutral-border hover:border-primary/30 hover:shadow-md transition-all btn-hover-lift"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-text-primary truncate max-w-[320px]">{j.filename || j.id}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-text-secondary flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {j.created_at ? new Date(j.created_at).toLocaleString() : "-"}
                            </span>
                            {j.result && (
                              <span className="text-sm text-text-secondary">
                                Best Bid: <span className="text-primary">₹{(j.result.best_bid ?? 0).toLocaleString()}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-text-primary capitalize">{j.status}</div>
                          <div className="text-sm text-text-secondary">{j.result ? "Completed" : "In progress"}</div>
                        </div>
                        <Button variant="outline" onClick={() => { setSelected(j); setOpen(true); }} className="h-9">View</Button>
                        <Badge
                          className={
                            j.status === "succeeded"
                              ? "bg-accent-positive/20 text-accent-positive border-accent-positive/30"
                              : j.status === "failed"
                              ? "bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30"
                              : "bg-primary/20 text-primary border-primary/30"
                          }
                        >
                          {j.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Result Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Job Result</DialogTitle>
              </DialogHeader>
              {selected ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4"><div className="text-sm text-text-secondary">Base Price</div><div className="text-xl text-text-primary">₹{selected.result?.base_price?.toLocaleString() ?? '-'}</div></Card>
                    <Card className="p-4"><div className="text-sm text-text-secondary">Best Bid</div><div className="text-xl text-text-primary">₹{selected.result?.best_bid?.toLocaleString() ?? '-'}</div></Card>
                    <Card className="p-4"><div className="text-sm text-text-secondary">Win Probability</div><div className="text-xl text-text-primary">{selected.result?.p_win_at_best != null ? `${(selected.result.p_win_at_best * 100).toFixed(2)}%` : '-'}</div></Card>
                    <Card className="p-4"><div className="text-sm text-text-secondary">Expected Profit</div><div className="text-xl text-text-primary">₹{selected.result?.expected_profit_at_best?.toLocaleString() ?? '-'}</div></Card>
                    <Card className="p-4 col-span-2"><div className="text-sm text-text-secondary">Profit If Won</div><div className="text-xl text-text-primary">₹{selected.result?.profit_if_won_at_best?.toLocaleString() ?? '-'}</div></Card>
                  </div>
                  <div className="h-64">
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
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
