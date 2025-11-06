import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { CheckCircle2, X } from "lucide-react";

interface AnswerReadyToastProps {
  isVisible: boolean;
  onOpen: () => void;
  onDismiss: () => void;
}

export function AnswerReadyToast({ isVisible, onOpen, onDismiss }: AnswerReadyToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.15, 0.9, 0.35, 1] }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-surface border border-accent-positive/30 rounded-xl p-4 card-shadow flex items-center gap-4 min-w-[320px]">
            <div className="w-10 h-10 rounded-full bg-accent-positive/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-accent-positive" />
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-text-primary">Answer ready — view results</p>
            </div>
            
            <Button
              onClick={onOpen}
              size="sm"
              className="bg-primary hover:bg-primary-700 text-white h-8 px-4 btn-hover-lift focus-ring"
            >
              Open
            </Button>
            
            <button
              onClick={onDismiss}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
