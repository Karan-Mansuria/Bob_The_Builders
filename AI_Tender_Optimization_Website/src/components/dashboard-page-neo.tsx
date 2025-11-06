import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Zap, FileText, TrendingUp, DollarSign, LogOut, User, Plus } from "lucide-react";
import { motion } from "motion/react";
import { NeoBackground } from "./neo-background";
import { ThemeToggle } from "./theme-toggle";

interface DashboardPageNeoProps {
  userEmail: string;
  onNavigateToUpload: () => void;
  onLogout: () => void;
}

export function DashboardPageNeo({ userEmail, onNavigateToUpload, onLogout }: DashboardPageNeoProps) {
  const recentBids = [
    { name: "City Hall Renovation", status: "Won", amount: "$234,900", confidence: 91 },
    { name: "Bridge Construction", status: "Pending", amount: "$189,500", confidence: 85 },
    { name: "School Building", status: "Won", amount: "$145,750", confidence: 72 },
  ];

  const userName = userEmail.split("@")[0];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <NeoBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full glass-strong z-50 border-b border-slate-300/20 dark:border-slate-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 dark:bg-slate-700 p-2 rounded-xl border border-cyan-500/30">
                <Zap className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-lg text-slate-900 dark:text-white">TenderAI</span>
                <span className="text-xs text-cyan-500 ml-2">Neo-Tech</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <User className="h-4 w-4" />
                <span className="text-sm">{userEmail}</span>
              </div>
              <Button
                variant="ghost"
                onClick={onLogout}
                className="hover:bg-cyan-500/10 hover:text-cyan-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-4xl text-slate-900 dark:text-white">
              Welcome back, <span className="text-cyan-500">{userName}</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
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
              <Card className="p-6 glass-strong border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-cyan-400" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-cyan-500">24</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Bids Optimized</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 glass-strong border-aqua-400/20 hover:border-aqua-400/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-aqua-400/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-aqua-400" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-aqua-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-aqua-400">75%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 glass-strong border-amber-400/20 hover:border-amber-400/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-amber-400" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-amber-400">$2.1M</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Value</div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 glass-strong border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-cyan-400" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl text-cyan-500">$450K</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Cost Saved</div>
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
            <Card className="p-12 glass-strong border-amber-400/30 text-center relative overflow-hidden">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative max-w-2xl mx-auto space-y-6">
                <div className="inline-flex p-4 bg-amber-400/20 rounded-2xl">
                  <Plus className="h-12 w-12 text-amber-400" />
                </div>
                <h2 className="text-3xl text-slate-900 dark:text-white">Create New Tender</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Upload your tender document and let AI optimize your bid with intelligent analysis
                </p>
                <Button
                  onClick={onNavigateToUpload}
                  className="h-14 px-8 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl shadow-lg shadow-amber-500/30 transition-all"
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
            <Card className="p-6 glass-strong border-slate-300/20 dark:border-slate-700/20">
              <h3 className="text-xl text-slate-900 dark:text-white mb-6">Recent Bids</h3>
              <div className="space-y-4">
                {recentBids.map((bid, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-300/20 dark:border-slate-700/20 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="text-slate-900 dark:text-white">{bid.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          AI Confidence: {bid.confidence}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-slate-900 dark:text-white">{bid.amount}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total bid</div>
                      </div>
                      <Badge
                        className={
                          bid.status === "Won"
                            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                            : "bg-amber-400/20 text-amber-400 border-amber-400/30"
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
