import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface EnhancedProcessingOverlayProps {
  isVisible: boolean;
  progress: number;
}

export function EnhancedProcessingOverlay({ isVisible, progress }: EnhancedProcessingOverlayProps) {
  const getMessage = (progress: number) => {
    if (progress < 50) return "Analyzing your document...";
    if (progress < 90) return "Processing data and calculations...";
    return "Finalizing results...";
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 modal-overlay z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.2, 0.9, 0.3, 1] }}
        className="bg-surface border border-neutral-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        style={{ boxShadow: '0 16px 48px rgba(11, 19, 40, 0.12)' }}
      >
        <div className="space-y-6">
          {/* Animated icon */}
          <div className="flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center relative"
            >
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
              <Loader2 className="h-10 w-10 text-primary relative z-10" />
            </motion.div>
          </div>

          {/* Progress message */}
          <div className="text-center space-y-2">
            <motion.p
              key={getMessage(progress)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg text-text-primary"
            >
              {getMessage(progress)}
            </motion.p>
            <p className="text-sm text-text-secondary">
              Please wait while we optimize your bid
            </p>
          </div>

          {/* Progress bar with yellow glow */}
          <div className="space-y-3">
            <div className="relative h-3 bg-neutral-border rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-accent-yellow progress-glow rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Processing...</span>
              <span className="text-accent-yellow">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex justify-between items-center pt-2">
            <div className={`flex items-center gap-2 text-xs ${progress >= 0 ? "text-primary" : "text-text-secondary"}`}>
              <div className={`w-2 h-2 rounded-full ${progress >= 0 ? "bg-primary" : "bg-neutral-border"}`} />
              <span>Analyzing</span>
            </div>
            <div className={`flex items-center gap-2 text-xs ${progress >= 50 ? "text-primary" : "text-text-secondary"}`}>
              <div className={`w-2 h-2 rounded-full ${progress >= 50 ? "bg-primary" : "bg-neutral-border"}`} />
              <span>Processing</span>
            </div>
            <div className={`flex items-center gap-2 text-xs ${progress >= 90 ? "text-primary" : "text-text-secondary"}`}>
              <div className={`w-2 h-2 rounded-full ${progress >= 90 ? "bg-primary" : "bg-neutral-border"}`} />
              <span>Finalizing</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
