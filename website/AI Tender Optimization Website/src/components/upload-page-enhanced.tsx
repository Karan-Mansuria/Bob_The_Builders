import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Upload, FileText, Zap, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { NeoBackground } from "./neo-background";
import { AutoHideHeader } from "./auto-hide-header";
import { CostAssumptionsModal } from "./cost-assumptions-modal";
import { ProcessingOverlay } from "./processing-overlay";
import { AnswerReadyToast } from "./answer-ready-toast";

type MaterialQuality = "standard" | "high-performance" | "premium";

interface UploadPageEnhancedProps {
  userEmail: string;
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}

export function UploadPageEnhanced({ userEmail, onNavigateToDashboard, onLogout }: UploadPageEnhancedProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sliderValue, setSliderValue] = useState([1]);
  const [showCostModal, setShowCostModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isOptimized, setIsOptimized] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [costAssumptions, setCostAssumptions] = useState({ miscellaneous: 0, labour: 0, wastage: 0 });
  const resultsRef = useRef<HTMLDivElement>(null);

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
      // Automatically open cost assumptions modal
      setTimeout(() => setShowCostModal(true), 300);
    }
  };

  const startAnalysis = (assumptions: { miscellaneous: number; labour: number; wastage: number }) => {
    setCostAssumptions(assumptions);
    setShowCostModal(false);
    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Complete after 2 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setIsOptimized(true);
        setShowToast(true);
        
        // Auto-scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }, 300);
    }, 2000);
  };

  const skipAndUseDefaults = () => {
    startAnalysis({ miscellaneous: 5, labour: 5, wastage: 5 });
  };

  const handleToastOpen = () => {
    setShowToast(false);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <div className="min-h-screen bg-bg relative overflow-hidden">
      <NeoBackground />

      <AutoHideHeader
        userEmail={userEmail}
        onLogout={onLogout}
        showBackButton
        onBackClick={onNavigateToDashboard}
        backLabel="Dashboard"
      />

      <main className="relative z-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-4xl text-text-primary">
              Optimize Your <span className="text-primary">Tender</span>
            </h1>
            <p className="text-lg text-text-secondary">
              Upload your document, select quality, and let AI create the perfect bid
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 bg-surface border-primary/20 card-shadow rounded-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl text-text-primary">Upload document</h2>
                </div>

                <label className="block">
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center hover:border-primary/50 transition-all cursor-pointer bg-surface-2 relative overflow-hidden btn-hover-lift">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />

                    {file ? (
                      <div className="space-y-3 relative">
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-8 w-8 text-primary" />
                          <span className="text-lg text-text-primary">{file.name}</span>
                        </div>
                        <Badge className="bg-accent-positive/20 text-accent-positive border-accent-positive/30">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          File uploaded successfully
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-3 relative">
                        <Upload className="h-12 w-12 text-primary mx-auto" />
                        <div>
                          <p className="text-lg text-text-primary">Click to upload or drag and drop</p>
                          <p className="text-sm text-text-secondary">PDF, DOC, DOCX (max 10MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </Card>
          </motion.div>

          {/* Material Quality Slider */}
          {file && !isProcessing && !isOptimized && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 bg-surface border-neutral-border card-shadow rounded-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neo-aqua/20 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-neo-aqua" />
                    </div>
                    <h2 className="text-2xl text-text-primary">Select Material Quality</h2>
                  </div>

                  <div className="space-y-8">
                    <div className="text-center py-6">
                      <motion.div
                        key={currentQuality.label}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                      >
                        <Badge className="text-xl px-6 py-3 bg-primary text-white border-0 shadow-lg">
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
                      <div className="flex justify-between mt-4 text-sm text-text-secondary">
                        <span>Standard</span>
                        <span>High-Performance</span>
                        <span>Premium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Results Section */}
          {isOptimized && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.32, ease: [0.2, 0.9, 0.3, 1] }}
            >
              <Card className="p-8 bg-surface border-primary/30 card-shadow rounded-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl text-text-primary">AI Analysis Complete</h2>
                        <p className="text-sm text-text-secondary">
                          Optimized bid insights & recommendations
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Confidence: {results.confidence}%
                    </Badge>
                  </div>

                  {/* Cost assumptions used */}
                  <div className="bg-surface-2 rounded-lg p-4 border border-neutral-border">
                    <p className="text-sm text-text-secondary mb-2">Cost assumptions applied:</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-text-primary">
                        Misc: <strong>{costAssumptions.miscellaneous}%</strong>
                      </span>
                      <span className="text-text-primary">
                        Labour: <strong>{costAssumptions.labour}%</strong>
                      </span>
                      <span className="text-text-primary">
                        Wastage: <strong>{costAssumptions.wastage}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="p-6 rounded-xl bg-surface-2 border border-primary/20 hover:border-primary/40 transition-all btn-hover-lift"
                    >
                      <div className="text-sm text-text-secondary mb-2">Total Bid Cost</div>
                      <div className="text-3xl text-primary">{results.totalCost}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="p-6 rounded-xl bg-surface-2 border border-neo-aqua/20 hover:border-neo-aqua/40 transition-all btn-hover-lift"
                    >
                      <div className="text-sm text-text-secondary mb-2">Profit Margin</div>
                      <div className="text-3xl text-neo-aqua">{results.profitMargin}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="p-6 rounded-xl bg-surface-2 border border-primary/20 hover:border-primary/40 transition-all btn-hover-lift"
                    >
                      <div className="text-sm text-text-secondary mb-2">Win Probability</div>
                      <div className="text-3xl text-primary">{results.winProbability}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="p-6 rounded-xl bg-surface-2 border border-neo-amber/20 hover:border-neo-amber/40 transition-all btn-hover-lift"
                    >
                      <div className="text-sm text-text-secondary mb-2">Project Timeline</div>
                      <div className="text-3xl text-neo-amber">{results.timeline}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="p-6 rounded-xl bg-surface-2 border border-primary/20 hover:border-primary/40 transition-all btn-hover-lift"
                    >
                      <div className="text-sm text-text-secondary mb-2">Estimated Savings</div>
                      <div className="text-3xl text-primary">{results.savings}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9 }}
                      className="p-6 rounded-xl bg-accent-positive/20 border border-accent-positive/30 flex items-center justify-center btn-hover-lift"
                    >
                      <div className="text-center">
                        <div className="text-sm text-text-primary mb-1">AI Assessment</div>
                        <div className="text-2xl text-accent-positive">Excellent</div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button className="flex-1 h-12 bg-primary hover:bg-primary-700 text-white rounded-xl btn-hover-lift focus-ring">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Submit Bid
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border-neutral-border hover:bg-surface-2 rounded-xl btn-hover-lift focus-ring"
                      onClick={() => {
                        setIsOptimized(false);
                        setFile(null);
                        setShowToast(false);
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

      {/* Cost Assumptions Modal */}
      <CostAssumptionsModal
        isOpen={showCostModal}
        onClose={() => setShowCostModal(false)}
        onSubmit={startAnalysis}
        onSkip={skipAndUseDefaults}
      />

      {/* Processing Overlay */}
      <ProcessingOverlay isVisible={isProcessing} progress={processingProgress} />

      {/* Answer Ready Toast */}
      <AnswerReadyToast
        isVisible={showToast}
        onOpen={handleToastOpen}
        onDismiss={() => setShowToast(false)}
      />
    </div>
  );
}
