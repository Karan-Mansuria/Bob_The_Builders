import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Zap, FileText, TrendingUp, DollarSign, Plus } from "lucide-react";
import { motion } from "motion/react";
import { NeoBackground } from "./neo-background";
import { AutoHideHeader } from "./auto-hide-header";

interface DashboardPageEnhancedProps {
  userEmail: string;
  onNavigateToUpload: () => void;
  onLogout: () => void;
}

export function DashboardPageEnhanced({ userEmail, onNavigateToUpload, onLogout }: DashboardPageEnhancedProps) {
  const recentBids = [
    { name: "City Hall Renovation", status: "Won", amount: "$234,900", confidence: 91 },
    { name: "Bridge Construction", status: "Pending", amount: "$189,500", confidence: 85 },
    { name: "School Building", status: "Won", amount: "$145,750", confidence: 72 },
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
              Welcome back, <span className="text-primary">{userName}</span>
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
              <Card className="p-6 bg-surface border-primary/20 card-shadow rounded-xl hover:border-primary/40 transition-all btn-hover-lift">
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
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-surface border-neo-aqua/20 card-shadow rounded-xl hover:border-neo-aqua/40 transition-all btn-hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-neo-aqua/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-neo-aqua" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-neo-aqua" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-neo-aqua">75%</div>
                  <div className="text-sm text-text-secondary">Success Rate</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-surface border-neo-amber/20 card-shadow rounded-xl hover:border-neo-amber/40 transition-all btn-hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-neo-amber/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-neo-amber" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-neo-amber" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-neo-amber">$2.1M</div>
                  <div className="text-sm text-text-secondary">Total Value</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-surface border-accent-positive/20 card-shadow rounded-xl hover:border-accent-positive/40 transition-all btn-hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-accent-positive/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-accent-positive" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-accent-positive" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-accent-positive">$450K</div>
                  <div className="text-sm text-text-secondary">Cost Saved</div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-12 bg-surface border-primary/30 card-shadow rounded-xl text-center relative overflow-hidden">
              <div className="relative max-w-2xl mx-auto space-y-6">
                <div className="inline-flex p-4 bg-primary/10 rounded-2xl">
                  <Plus className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl text-text-primary">Create New Tender</h2>
                <p className="text-lg text-text-secondary">
                  Upload your tender document and let AI optimize your bid with intelligent analysis
                </p>
                <Button
                  onClick={onNavigateToUpload}
                  className="h-14 px-8 bg-primary hover:bg-primary-700 text-white rounded-xl card-shadow-hover btn-hover-lift focus-ring"
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
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 bg-surface border-neutral-border card-shadow rounded-xl">
              <h3 className="text-xl text-text-primary mb-6">Recent Bids</h3>
              <div className="space-y-4">
                {recentBids.map((bid, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-neutral-border hover:border-primary/30 transition-all btn-hover-lift"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-text-primary">{bid.name}</div>
                        <div className="text-sm text-text-secondary">
                          AI Confidence: {bid.confidence}%
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
                            : "bg-neo-amber/20 text-neo-amber border-neo-amber/30"
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
