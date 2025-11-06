import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Upload, FileText, Zap, CheckCircle2, TrendingUp, ArrowLeft, LogOut, User, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { NeoBackground } from "./neo-background";
import { ThemeToggle } from "./theme-toggle";

type MaterialQuality = "standard" | "high-performance" | "premium";

interface UploadPageNeoProps {
  userEmail: string;
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}

export function UploadPageNeo({ userEmail, onNavigateToDashboard, onLogout }: UploadPageNeoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sliderValue, setSliderValue] = useState([1]);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const qualityLabels: { [key: number]: { label: string; type: MaterialQuality } } = {
    0: { label: "Standard", type: "standard" },
    1: { label: "High-Performance", type: "high-performance" },
    2: { label: "Premium / Custom", type: "premium" },
  };

  const currentQuality = qualityLabels[sliderValue[0]];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsOptimized(false);
    }
  };

  const handleOptimizeBid = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsOptimized(true);
    }, 2000);
  };

  const mockResults = {
    standard: {
      totalCost: "$145,750",
      profitMargin: "18%",
      winProbability: "72%",
      timeline: "8 weeks",
      savings: "$12,450",
      confidence: 72,
    },
    "high-performance": {
      totalCost: "$189,500",
      profitMargin: "22%",
      winProbability: "85%",
      timeline: "10 weeks",
      savings: "$18,200",
      confidence: 85,
    },
    premium: {
      totalCost: "$234,900",
      profitMargin: "28%",
      winProbability: "91%",
      timeline: "12 weeks",
      savings: "$25,800",
      confidence: 91,
    },
  };

  const results = mockResults[currentQuality.type];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <NeoBackground />

      {/* Navigation */}
      <nav className="fixed top-0 w-full glass-strong z-50 border-b border-slate-300/20 dark:border-slate-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onNavigateToDashboard}
                className="hover:bg-cyan-500/10 hover:text-cyan-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 dark:bg-slate-700 p-2 rounded-xl border border-cyan-500/30">
                  <Zap className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <span className="text-lg text-slate-900 dark:text-white">TenderAI</span>
                  <span className="text-xs text-cyan-500 ml-2">Neo-Tech</span>
                </div>
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
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-4xl text-slate-900 dark:text-white">
              Optimize Your <span className="text-cyan-500">Tender</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Upload your document, select quality, and let AI create the perfect bid
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 glass-strong border-cyan-500/20">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl text-slate-900 dark:text-white">Upload Tender Document</h2>
                </div>

                <label className="block">
                  <div className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-12 text-center hover:border-cyan-500/50 transition-all cursor-pointer bg-slate-100/30 dark:bg-slate-800/30 relative overflow-hidden">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                    
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="upload-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#upload-grid)" />
                      </svg>
                    </div>

                    {file ? (
                      <div className="space-y-3 relative">
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-8 w-8 text-cyan-500" />
                          <span className="text-lg text-slate-900 dark:text-white">{file.name}</span>
                        </div>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          File uploaded successfully
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-3 relative">
                        <Upload className="h-12 w-12 text-cyan-500 mx-auto" />
                        <div>
                          <p className="text-lg text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">PDF, DOC, DOCX (max 10MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </Card>
          </motion.div>

          {/* Material Quality Slider */}
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-8 glass-strong border-aqua-400/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-aqua-400/20 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-aqua-400" />
                    </div>
                    <h2 className="text-2xl text-slate-900 dark:text-white">Select Material Quality</h2>
                  </div>

                  <div className="space-y-8">
                    <div className="text-center py-6">
                      <motion.div
                        key={currentQuality.label}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                      >
                        <Badge className="text-xl px-6 py-3 bg-cyan-500 text-white border-0 shadow-lg shadow-cyan-500/30">
                          {currentQuality.label}
                        </Badge>
                      </motion.div>
                    </div>

                    <div className="px-4">
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={2}
                        step={1}
                        className="w-full [&_.relative]:h-2 [&_.relative]:bg-slate-200 [&_.relative]:dark:bg-slate-700"
                      />
                      <div className="flex justify-between mt-4 text-sm text-slate-600 dark:text-slate-400">
                        <span>Standard</span>
                        <span>High-Performance</span>
                        <span>Premium</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleOptimizeBid}
                      disabled={isLoading}
                      className="w-full h-14 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl shadow-lg shadow-amber-500/30 transition-all"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap className="h-5 w-5 mr-2" />
                          </motion.div>
                          Optimizing Your Bid...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Optimize Bid
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Results Section */}
          {isOptimized && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-8 glass-strong border-cyan-500/30">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl text-slate-900 dark:text-white">AI Analysis Complete</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Optimized bid insights & recommendations</p>
                      </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-2">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Confidence: {results.confidence}%
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="p-6 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-cyan-500/20"
                    >
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Bid Cost</div>
                      <div className="text-3xl text-cyan-500">{results.totalCost}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="p-6 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-aqua-400/20"
                    >
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Profit Margin</div>
                      <div className="text-3xl text-aqua-400">{results.profitMargin}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="p-6 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-cyan-500/20"
                    >
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Win Probability</div>
                      <div className="text-3xl text-cyan-500">{results.winProbability}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="p-6 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-amber-400/20"
                    >
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Project Timeline</div>
                      <div className="text-3xl text-amber-400">{results.timeline}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9 }}
                      className="p-6 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-cyan-500/20"
                    >
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Estimated Savings</div>
                      <div className="text-3xl text-cyan-500">{results.savings}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 }}
                      className="p-6 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center"
                    >
                      <div className="text-center">
                        <div className="text-sm text-slate-700 dark:text-slate-300 mb-1">AI Assessment</div>
                        <div className="text-2xl text-amber-400">Excellent</div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button className="flex-1 h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl shadow-lg shadow-cyan-500/30 transition-all">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Submit Bid
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                      onClick={() => {
                        setIsOptimized(false);
                        setFile(null);
                      }}
                    >
                      Start New Bid
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
