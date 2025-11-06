import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";

interface CostAssumptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { miscellaneous: number; labour: number; wastage: number }) => void;
  onSkip: () => void;
}

export function CostAssumptionsModal({ isOpen, onClose, onSubmit, onSkip }: CostAssumptionsModalProps) {
  const [miscellaneous, setMiscellaneous] = useState("0");
  const [labour, setLabour] = useState("0");
  const [wastage, setWastage] = useState("0");
  const [errors, setErrors] = useState({ miscellaneous: "", labour: "", wastage: "" });

  const presets = [
    { label: "Low: 1%", value: 1 },
    { label: "Default: 5%", value: 5 },
    { label: "High: 10%", value: 10 },
  ];

  const validateValue = (value: string, field: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) {
      setErrors(prev => ({ ...prev, [field]: "Value must be 0–100%" }));
      return false;
    }
    setErrors(prev => ({ ...prev, [field]: "" }));
    return true;
  };

  const handleMiscChange = (value: string) => {
    setMiscellaneous(value);
    validateValue(value, "miscellaneous");
  };

  const handleLabourChange = (value: string) => {
    setLabour(value);
    validateValue(value, "labour");
  };

  const handleWastageChange = (value: string) => {
    setWastage(value);
    validateValue(value, "wastage");
  };

  const applyPreset = (value: number) => {
    setMiscellaneous(value.toString());
    setLabour(value.toString());
    setWastage(value.toString());
    setErrors({ miscellaneous: "", labour: "", wastage: "" });
  };

  const handleSubmit = () => {
    const miscValid = validateValue(miscellaneous, "miscellaneous");
    const labourValid = validateValue(labour, "labour");
    const wastageValid = validateValue(wastage, "wastage");

    if (miscValid && labourValid && wastageValid) {
      onSubmit({
        miscellaneous: parseFloat(miscellaneous),
        labour: parseFloat(labour),
        wastage: parseFloat(wastage),
      });
    }
  };

  const isValid = !errors.miscellaneous && !errors.labour && !errors.wastage &&
    miscellaneous !== "" && labour !== "" && wastage !== "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-surface border-neutral-border card-shadow">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.22, ease: [0.2, 0.9, 0.3, 1] }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl text-text-primary">Refine cost assumptions</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Quick presets */}
            <div className="space-y-2">
              <Label className="text-sm text-text-secondary">Quick presets</Label>
              <div className="flex gap-2">
                {presets.map((preset) => (
                  <Badge
                    key={preset.label}
                    onClick={() => applyPreset(preset.value)}
                    className="cursor-pointer bg-surface-2 text-text-primary border border-neutral-border hover:bg-primary/10 hover:border-primary transition-all"
                  >
                    {preset.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Miscellaneous cost */}
            <div className="space-y-2">
              <Label htmlFor="misc" className="text-text-primary">
                Miscellaneous cost (%)
              </Label>
              <div className="relative">
                <Input
                  id="misc"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 2.5"
                  value={miscellaneous}
                  onChange={(e) => handleMiscChange(e.target.value)}
                  className={`pr-8 bg-surface-2 border-neutral-border focus:border-primary ${
                    errors.miscellaneous ? "border-destructive" : ""
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                  %
                </span>
              </div>
              {errors.miscellaneous && (
                <p className="text-sm text-destructive">{errors.miscellaneous}</p>
              )}
            </div>

            {/* Labour cost */}
            <div className="space-y-2">
              <Label htmlFor="labour" className="text-text-primary">
                Labour cost (%)
              </Label>
              <div className="relative">
                <Input
                  id="labour"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 2.5"
                  value={labour}
                  onChange={(e) => handleLabourChange(e.target.value)}
                  className={`pr-8 bg-surface-2 border-neutral-border focus:border-primary ${
                    errors.labour ? "border-destructive" : ""
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                  %
                </span>
              </div>
              {errors.labour && (
                <p className="text-sm text-destructive">{errors.labour}</p>
              )}
            </div>

            {/* Wastage cost */}
            <div className="space-y-2">
              <Label htmlFor="wastage" className="text-text-primary">
                Wastage cost (%)
              </Label>
              <div className="relative">
                <Input
                  id="wastage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 2.5"
                  value={wastage}
                  onChange={(e) => handleWastageChange(e.target.value)}
                  className={`pr-8 bg-surface-2 border-neutral-border focus:border-primary ${
                    errors.wastage ? "border-destructive" : ""
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                  %
                </span>
              </div>
              {errors.wastage && (
                <p className="text-sm text-destructive">{errors.wastage}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!isValid}
                className="flex-1 h-11 bg-primary hover:bg-primary-700 text-white btn-hover-lift focus-ring"
              >
                Start analysis
              </Button>
              <Button
                onClick={onSkip}
                variant="outline"
                className="flex-1 h-11 border-neutral-border hover:bg-surface-2 btn-hover-lift focus-ring"
              >
                Skip & use defaults
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
