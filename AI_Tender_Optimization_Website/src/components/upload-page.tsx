import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Upload, FileText, Sparkles, CheckCircle2, TrendingUp, ArrowLeft, LogOut, User } from "lucide-react";
import { motion } from "motion/react";
import { FloatingImages } from "./floating-images";

type MaterialQuality = "standard" | "high-performance" | "premium";

interface UploadPageProps {
  userEmail: string;
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}

export function UploadPage({ userEmail, onNavigateToDashboard, onLogout }: UploadPageProps) {
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
    },
    "high-performance": {
      totalCost: "$189,500",
      profitMargin: "22%",
      winProbability: "85%",
      timeline: "10 weeks",
      savings: "$18,200",
    },
    premium: {
      totalCost: "$234,900",
      profitMargin: "28%",
      winProbability: "91%",
      timeline: "12 weeks",
      savings: "$25,800",
    },
  };

  const results = mockResults[currentQuality.type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 relative overflow-hidden">
      <FloatingImages />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onNavigateToDashboard} className="hover:text-orange-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">TenderAI Pro</span>
              </div>
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
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl">
              <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Optimize Your Tender
              </span>
            </h1>
            <p className="text-xl text-gray-700">
              Upload your document, select quality, and let AI create the perfect bid
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-orange-200 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-3 rounded-xl">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl">Upload Tender Document</h2>
                </div>

                <label className="block">
                  <div className="border-3 border-dashed border-orange-300 rounded-xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gradient-to-br from-orange-50 to-pink-50">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                    {file ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-8 w-8 text-orange-600" />
                          <span className="text-lg text-gray-900">{file.name}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          File uploaded successfully
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 text-orange-500 mx-auto" />
                        <div>
                          <p className="text-lg text-gray-900">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-600">PDF, DOC, DOCX (max 10MB)</p>
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
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl">Select Material Quality</h2>
                  </div>

                  <div className="space-y-8">
                    <div className="text-center py-6">
                      <motion.div
                        key={currentQuality.label}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                      >
                        <Badge className="text-2xl px-8 py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white border-0">
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
                        className="w-full"
                      />
                      <div className="flex justify-between mt-4">
                        <span className="text-sm text-gray-600">Standard</span>
                        <span className="text-sm text-gray-600">High-Performance</span>
                        <span className="text-sm text-gray-600">Premium</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleOptimizeBid}
                      disabled={isLoading}
                      className="w-full py-6 text-lg bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="h-5 w-5 mr-2" />
                          </motion.div>
                          Optimizing Your Bid...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
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
              <Card className="p-8 bg-gradient-to-br from-white via-orange-50 to-purple-50 backdrop-blur-sm border-2 border-green-300 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl">Optimized Bid Results</h2>
                    <Badge className="ml-auto bg-green-100 text-green-700 border-green-300 px-4 py-2">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Optimization Complete
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200"
                    >
                      <div className="text-sm text-gray-600 mb-2">Total Bid Cost</div>
                      <div className="text-3xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                        {results.totalCost}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200"
                    >
                      <div className="text-sm text-gray-600 mb-2">Profit Margin</div>
                      <div className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {results.profitMargin}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200"
                    >
                      <div className="text-sm text-gray-600 mb-2">Win Probability</div>
                      <div className="text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {results.winProbability}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200"
                    >
                      <div className="text-sm text-gray-600 mb-2">Project Timeline</div>
                      <div className="text-3xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {results.timeline}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9 }}
                      className="bg-white rounded-xl p-6 shadow-lg border-2 border-pink-200"
                    >
                      <div className="text-sm text-gray-600 mb-2">Estimated Savings</div>
                      <div className="text-3xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        {results.savings}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 }}
                      className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-xl p-6 shadow-lg text-white flex items-center justify-center"
                    >
                      <div className="text-center">
                        <div className="text-sm mb-2">AI Confidence</div>
                        <div className="text-3xl">Excellent</div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Submit Bid
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-2 border-orange-300 hover:bg-orange-50 py-6"
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
