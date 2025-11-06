import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sparkles, Upload, FileText, TrendingUp, Calendar, DollarSign, LogOut, User } from "lucide-react";
import { motion } from "motion/react";
import { FloatingImages } from "./floating-images";

interface DashboardPageProps {
  userEmail: string;
  onNavigateToUpload: () => void;
  onLogout: () => void;
}

export function DashboardPage({ userEmail, onNavigateToUpload, onLogout }: DashboardPageProps) {
  const recentBids = [
    { name: "City Hall Renovation", status: "Won", amount: "$234,900", date: "2025-11-01" },
    { name: "Bridge Construction", status: "Pending", amount: "$189,500", date: "2025-10-28" },
    { name: "School Building", status: "Won", amount: "$145,750", date: "2025-10-25" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 relative overflow-hidden">
      <FloatingImages />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">TenderAI Pro</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-4 w-4" />
                <span className="text-sm">{userEmail}</span>
              </div>
              <Button variant="ghost" onClick={onLogout} className="hover:text-orange-600">
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
            className="text-center space-y-4"
          >
            <h1 className="text-5xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Your Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-700">
              Start optimizing your tenders with AI-powered intelligence
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-gradient-to-br from-orange-500 to-pink-500 text-white border-0 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-8 w-8" />
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="text-3xl mb-1">24</div>
                <div className="text-sm text-white/80">Total Bids</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-pink-500 to-purple-500 text-white border-0 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className="h-8 w-8" />
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="text-3xl mb-1">18</div>
                <div className="text-sm text-white/80">Bids Won</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-br from-purple-500 to-blue-500 text-white border-0 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-8 w-8" />
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="text-3xl mb-1">75%</div>
                <div className="text-sm text-white/80">Win Rate</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="h-8 w-8" />
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="text-3xl mb-1">$2.1M</div>
                <div className="text-sm text-white/80">Total Value</div>
              </Card>
            </motion.div>
          </div>

          {/* Main Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-12 bg-gradient-to-br from-white via-orange-50 to-purple-50 backdrop-blur-sm border-2 border-orange-200 shadow-2xl text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="inline-flex p-4 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-2xl">
                  <Upload className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-4xl">Create New Tender</h2>
                <p className="text-xl text-gray-700">
                  Upload your tender document and let AI optimize your bid for maximum success
                </p>
                <Button
                  onClick={onNavigateToUpload}
                  className="px-8 py-6 text-lg bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white"
                >
                  <Upload className="mr-2 h-5 w-5" />
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
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
              <h3 className="text-2xl mb-6">Recent Bids</h3>
              <div className="space-y-4">
                {recentBids.map((bid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-3 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-lg">{bid.name}</div>
                        <div className="text-sm text-gray-600">{bid.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-lg">{bid.amount}</div>
                      <Badge
                        className={
                          bid.status === "Won"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-yellow-100 text-yellow-700 border-yellow-300"
                        }
                      >
                        {bid.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
