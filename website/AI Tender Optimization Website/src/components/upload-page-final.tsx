import { useState, useEffect, useRef } from "react";
import { createJob, getJob } from "../api";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Upload, FileText, Zap, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NeoBackground } from "./neo-background";
import { AutoHideHeader } from "./auto-hide-header";
import { EnhancedCostModal } from "./enhanced-cost-modal";
import { EnhancedProcessingOverlay } from "./enhanced-processing-overlay";
import { AnswerReadyToast } from "./answer-ready-toast";

interface UploadPageFinalProps {
  userEmail: string;
  onNavigateToDashboard: () => void;
  onNavigateToResults: (jobId: string) => void;
  onLogout: () => void;
}

export function UploadPageFinal({ userEmail, onNavigateToDashboard, onNavigateToResults, onLogout }: UploadPageFinalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isOptimized, setIsOptimized] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<{
    base_price?: number;
    best_bid?: number;
    p_win_at_best?: number;
    expected_profit_at_best?: number;
    profit_if_won_at_best?: number;
  } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [costAssumptions, setCostAssumptions] = useState({ 
    miscellaneous: 0, 
    labour: 0, 
    wastage: 0,
    quality: 50 
  });
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsOptimized(false);
      setShowToast(false);
      // Automatically open cost modal with slight delay
      setTimeout(() => setShowCostModal(true), 300);
    }
  };

  const startAnalysis = async (assumptions: { miscellaneous: number; labour: number; wastage: number; quality: number }) => {
    setCostAssumptions(assumptions);
    setShowCostModal(false);
    setIsProcessing(true);
    setProcessingProgress(0);

    // Smooth progress UI while job runs
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Smooth acceleration
        const increment = prev < 30 ? 3 : prev < 70 ? 4 : 5;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    try {
      if (!file) throw new Error("No file selected");
      const qualityScore = Math.max(0, Math.min(1, assumptions.quality / 100));
      const created = await createJob(file, qualityScore);
      setJobId(created.job_id);

      // Poll until complete
      let done = false;
      for (let i = 0; i < 300 && !done; i++) { // up to ~60s at 200ms
        await new Promise((r) => setTimeout(r, 200));
        const status = await getJob(created.job_id);
        if (status.status === "succeeded" && status.result) {
          setJobResult(status.result);
          done = true;
        } else if (status.status === "failed") {
          throw new Error(status.error_message || "Job failed");
        }
      }

      clearInterval(progressInterval);
      setProcessingProgress(100);
      setIsProcessing(false);
      setIsOptimized(true);
      setShowToast(true);
      if (created.job_id) {
        onNavigateToResults(created.job_id);
        return; // navigate away to results page
      }
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err) {
      console.error(err);
      clearInterval(progressInterval);
      setIsProcessing(false);
      setProcessingProgress(0);
      alert("Analysis failed. See console for details.");
    }
  };

  const skipAndUseDefaults = () => {
    startAnalysis({ miscellaneous: 5, labour: 5, wastage: 5, quality: 50 });
  };

  const handleToastOpen = () => {
    setShowToast(false);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // FIX: Properly reset everything when starting new bid
  const handleStartNewBid = () => {
    // Reset all states
    setFile(null);
    setIsOptimized(false);
    setShowToast(false);
    setIsProcessing(false);
    setProcessingProgress(0);
    setShowCostModal(false);
    setCostAssumptions({ miscellaneous: 0, labour: 0, wastage: 0, quality: 50 });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getQualityLabel = (value: number) => {
    if (value <= 33) return "Low Quality";
    if (value <= 66) return "Medium Quality";
    return "High Quality";
  };

  const fmt = (n?: number) => (typeof n === "number" && isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-");

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
              Optimize Your <span className="text-accent-yellow">Tender</span>
            </h1>
            <p className="text-lg text-text-secondary">
              Upload your document and let AI create the perfect bid
            </p>
          </motion.div>

          {/* Upload Section */}
          <AnimatePresence mode="wait">
            {!isOptimized && (
              <motion.div
                key="upload-section"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="p-8 card-gradient border-primary/20 rounded-2xl shadow-lg" 
                  style={{ boxShadow: '0 8px 24px rgba(11, 19, 40, 0.08)' }}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl text-text-primary">Upload Document</h2>
                    </div>

                    <label className="block">
                      <div className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-surface-2 relative overflow-hidden btn-hover-lift">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                        />

                        {file ? (
                          <div className="space-y-3 relative">
                            <div className="flex items-center justify-center gap-3">
                              <FileText className="h-10 w-10 text-primary" />
                              <span className="text-xl text-text-primary">{file.name}</span>
                            </div>
                            <Badge className="bg-accent-positive/20 text-accent-positive border-accent-positive/30">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              File uploaded successfully
                            </Badge>
                          </div>
                        ) : (
                          <div className="space-y-4 relative">
                            <Upload className="h-16 w-16 text-primary mx-auto" />
                            <div>
                              <p className="text-xl text-text-primary">Click to upload or drag and drop</p>
                              <p className="text-sm text-text-secondary mt-2">
                                PDF, DOC, DOCX (max 10MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Section */}
          {isOptimized && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.9, 0.3, 1] }}
            >
              <Card className="p-8 card-gradient border-primary/30 rounded-2xl shadow-xl"
                style={{ boxShadow: '0 12px 32px rgba(11, 19, 40, 0.1)' }}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl text-text-primary">
                          AI Analysis <span className="text-accent-yellow">Complete</span>
                        </h2>
                        <p className="text-sm text-text-secondary">
                          Optimized bid insights & recommendations
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Base Price: ₹{fmt(jobResult?.base_price)}
                    </Badge>
                  </div>

                  {/* Parameters used */}
                  <div className="bg-surface-2 rounded-xl p-4 border border-neutral-border">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-text-primary mb-2">
                          Analysis parameters:
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                          <span>
                            Misc: <strong className="text-text-primary">{costAssumptions.miscellaneous}%</strong>
                          </span>
                          <span>
                            Labour: <strong className="text-text-primary">{costAssumptions.labour}%</strong>
                          </span>
                          <span>
                            Wastage: <strong className="text-text-primary">{costAssumptions.wastage}%</strong>
                          </span>
                          <span>
                            Quality: <strong className="text-accent-yellow">{costAssumptions.quality}/100</strong> ({getQualityLabel(costAssumptions.quality)})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="p-6 rounded-xl card-gradient border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all btn-hover-lift"
                    >
                      <div className="text-sm text-text-secondary mb-2">Recommended Bid</div>
                      <div className="text-3xl text-primary">₹{fmt(jobResult?.best_bid)}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="p-6 rounded-xl card-gradient border border-accent-positive/20 hover:border-accent-positive/40 hover:shadow-lg transition-all btn-hover-lift"
                    >
                      <div className="text-sm text-text-secondary mb-2">Expected Profit</div>
                      <div className="text-3xl text-accent-positive">₹{fmt(jobResult?.expected_profit_at_best)}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-6 rounded-xl card-gradient border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all btn-hover-lift"
                    >
                      <div className="text-sm text-text-secondary mb-2">Win Probability</div>
                      <div className="text-3xl text-primary">{fmt(jobResult?.p_win_at_best && jobResult.p_win_at_best * 100)}%</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="p-6 rounded-xl card-gradient border border-accent-yellow/20 hover:border-accent-yellow/40 hover:shadow-lg transition-all btn-hover-lift"
                    >
                      <div className="text-sm text-text-secondary mb-2">Profit If Won</div>
                      <div className="text-3xl text-accent-yellow">₹{fmt(jobResult?.profit_if_won_at_best)}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="p-6 rounded-xl card-gradient border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all btn-hover-lift"
                    >
                      <div className="text-sm text-text-secondary mb-2">Estimated Savings</div>
                      <div className="text-3xl text-primary">{mockResults.savings}</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="p-6 rounded-xl bg-accent-positive/10 border border-accent-positive/30 flex items-center justify-center btn-hover-lift"
                    >
                      <div className="text-center">
                        <div className="text-sm text-text-primary mb-1">Job</div>
                        <div className="text-2xl text-accent-positive truncate max-w-[260px]">{jobId || "-"}</div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Placeholder Recommendations */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-surface-2 rounded-xl p-6 border border-neutral-border"
                  >
                    <h3 className="text-lg text-text-primary mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-accent-yellow" />
                      Insights
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent-positive mt-0.5 flex-shrink-0" />
                        <span className="text-text-secondary">Bid recommendation balances win probability and profit.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent-positive mt-0.5 flex-shrink-0" />
                        <span className="text-text-secondary">Adjust quality or bid bounds to explore different scenarios.</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <Button 
                      className="flex-1 h-12 bg-primary hover:bg-primary-700 text-white rounded-lg btn-hover-lift focus-ring shadow-lg"
                      style={{ boxShadow: '0 4px 14px rgba(11, 99, 255, 0.3)' }}
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Submit Bid
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border-neutral-border hover:bg-surface-2 rounded-lg btn-hover-lift focus-ring"
                      onClick={handleStartNewBid}
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

      {/* Cost Modal */}
      <EnhancedCostModal
        isOpen={showCostModal}
        onClose={() => setShowCostModal(false)}
        onSubmit={startAnalysis}
        onSkip={skipAndUseDefaults}
      />

      {/* Processing Overlay */}
      <EnhancedProcessingOverlay isVisible={isProcessing} progress={processingProgress} />

      {/* Answer Ready Toast */}
      <AnswerReadyToast
        isVisible={showToast}
        onOpen={handleToastOpen}
        onDismiss={() => setShowToast(false)}
      />
    </div>
  );
}
