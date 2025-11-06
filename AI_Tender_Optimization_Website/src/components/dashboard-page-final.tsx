import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Zap, FileText, TrendingUp, DollarSign, Plus, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { NeoBackground } from "./neo-background";
import { AutoHideHeader } from "./auto-hide-header";

interface DashboardPageFinalProps {
  userEmail: string;
  onNavigateToUpload: () => void;
  onLogout: () => void;
}

export function DashboardPageFinal({ userEmail, onNavigateToUpload, onLogout }: DashboardPageFinalProps) {
  const recentBids = [
    { name: "City Hall Renovation", status: "Won", amount: "$234,900", confidence: 91, date: "2 days ago" },
    { name: "Bridge Construction", status: "Pending", amount: "$189,500", confidence: 85, date: "5 days ago" },
    { name: "School Building", status: "Won", amount: "$145,750", confidence: 72, date: "1 week ago" },
  ];

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
                  <div className="text-3xl text-primary">24</div>
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
                  <div className="text-3xl text-accent-positive">75%</div>
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
                  <div className="text-3xl text-accent-yellow">$2.1M</div>
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
                  <div className="text-3xl text-primary">$450K</div>
                  <div className="text-sm text-text-secondary">Cost Saved</div>
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

          {/* Recent Bids */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 card-gradient border-neutral-border rounded-2xl shadow-lg"
              style={{ boxShadow: '0 8px 24px rgba(11, 19, 40, 0.08)' }}>
              <h3 className="text-xl text-text-primary mb-6">Recent Bids</h3>
              <div className="space-y-4">
                {recentBids.map((bid, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-5 rounded-xl card-gradient border border-neutral-border hover:border-primary/30 hover:shadow-md transition-all btn-hover-lift"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-text-primary">{bid.name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-text-secondary flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {bid.date}
                          </span>
                          <span className="text-sm text-text-secondary">
                            AI Confidence: <span className="text-primary">{bid.confidence}%</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-text-primary">{bid.amount}</div>
                        <div className="text-sm text-text-secondary">Total bid</div>
                      </div>
                      <Badge
                        className={
                          bid.status === "Won"
                            ? "bg-accent-positive/20 text-accent-positive border-accent-positive/30"
                            : "bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30"
                        }
                      >
                        {bid.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
