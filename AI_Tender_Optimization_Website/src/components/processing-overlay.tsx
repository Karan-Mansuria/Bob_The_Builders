import { motion } from "motion/react";
import { Progress } from "./ui/progress";
import { Loader2 } from "lucide-react";

interface ProcessingOverlayProps {
  isVisible: boolean;
  progress: number;
}

export function ProcessingOverlay({ isVisible, progress }: ProcessingOverlayProps) {
  const steps = [
    { label: "Parsing", threshold: 0 },
    { label: "Calculating cost", threshold: 40 },
    { label: "Generating summary", threshold: 70 },
  ];

  const currentStep = steps.reduce((acc, step) => {
    if (progress >= step.threshold) return step.label;
    return acc;
  }, steps[0].label);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.2, 0.9, 0.3, 1] }}
        className="bg-surface border border-neutral-border rounded-xl p-8 max-w-md w-full mx-4 card-shadow"
      >
        <div className="space-y-6">
          {/* Animated icon */}
          <div className="flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Loader2 className="h-8 w-8 text-primary" />
            </motion.div>
          </div>

          {/* Progress message */}
          <div className="text-center space-y-2">
            <h3 className="text-xl text-text-primary">Processing your document</h3>
            <p className="text-sm text-text-secondary">
              Parsing document — extracting tables & line items
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-text-secondary">
              <span>{currentStep}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex justify-between text-xs">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className={`flex items-center gap-1 ${
                  progress >= step.threshold ? "text-primary" : "text-text-secondary"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    progress >= step.threshold ? "bg-primary" : "bg-neutral-border"
                  }`}
                />
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
