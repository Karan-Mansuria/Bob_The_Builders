import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { SliderEnhanced } from "./ui/slider-enhanced";
import { motion } from "motion/react";

interface EnhancedCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    miscellaneous: number; 
    labour: number; 
    wastage: number;
    quality: number;
  }) => void;
  onSkip: () => void;
}

export function EnhancedCostModal({ isOpen, onClose, onSubmit, onSkip }: EnhancedCostModalProps) {
  const [miscellaneous, setMiscellaneous] = useState("0");
  const [labour, setLabour] = useState("0");
  const [wastage, setWastage] = useState("0");
  const [quality, setQuality] = useState([50]);
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
        quality: quality[0],
      });
    }
  };

  const isValid = !errors.miscellaneous && !errors.labour && !errors.wastage &&
    miscellaneous !== "" && labour !== "" && wastage !== "";

  // Get quality section and color
  const getQualitySection = (value: number) => {
    if (value <= 33) return { label: "Low", color: "#00B37E" };
    if (value <= 66) return { label: "Medium", color: "#F6C90E" };
    return { label: "High", color: "#FF7043" };
  };

  const qualitySection = getQualitySection(quality[0]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-lg bg-surface border-neutral-border rounded-2xl p-0 shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 16px 48px rgba(11, 19, 40, 0.12)' }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.2, 0.9, 0.3, 1] }}
        >
          {/* Header with gradient background */}
          <div className="card-gradient px-6 py-5 border-b border-neutral-border">
            <DialogHeader>
              <DialogTitle className="text-2xl text-text-primary">
                Refine Cost <span className="text-accent-yellow">Assumptions</span>
              </DialogTitle>
              <p className="text-sm text-text-secondary mt-1">
                Customize your cost parameters for accurate bid optimization
              </p>
            </DialogHeader>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Quick presets */}
            <div className="space-y-2">
              <Label className="text-sm text-text-secondary">Quick presets</Label>
              <div className="flex gap-2">
                {presets.map((preset) => (
                  <Badge
                    key={preset.label}
                    onClick={() => applyPreset(preset.value)}
                    className="cursor-pointer bg-surface-2 text-text-primary border border-neutral-border hover:bg-primary/10 hover:border-primary hover:text-primary transition-all btn-hover-lift"
                  >
                    {preset.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Cost inputs */}
            <div className="space-y-4">
              {/* Miscellaneous cost */}
              <div className="space-y-2">
                <Label htmlFor="misc" className="text-text-primary">
                  Miscellaneous Cost (%)
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
                    className={`pr-10 bg-surface-2 border-neutral-border focus:border-primary h-11 rounded-lg ${
                      errors.miscellaneous ? "border-destructive" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none">
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
                  Labour Cost (%)
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
                    className={`pr-10 bg-surface-2 border-neutral-border focus:border-primary h-11 rounded-lg ${
                      errors.labour ? "border-destructive" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none">
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
                  Wastage Cost (%)
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
                    className={`pr-10 bg-surface-2 border-neutral-border focus:border-primary h-11 rounded-lg ${
                      errors.wastage ? "border-destructive" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none">
                    %
                  </span>
                </div>
                {errors.wastage && (
                  <p className="text-sm text-destructive">{errors.wastage}</p>
                )}
              </div>
            </div>

            {/* Quality Slider (1-100 with 3 partitions) */}
            <div className="space-y-3 p-4 bg-surface-2 rounded-xl border border-neutral-border">
              <div className="flex justify-between items-center">
                <Label className="text-text-primary">Material Quality</Label>
                <div className="flex items-center gap-2">
                  <motion.span
                    key={quality[0]}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                    style={{ color: qualitySection.color }}
                  >
                    {quality[0]}
                  </motion.span>
                  <Badge 
                    style={{ 
                      backgroundColor: `${qualitySection.color}20`,
                      color: qualitySection.color,
                      borderColor: `${qualitySection.color}40`
                    }}
                  >
                    {qualitySection.label}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <SliderEnhanced
                  value={quality}
                  onValueChange={setQuality}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                  style={{
                    '--slider-gradient': `linear-gradient(to right, 
                      #00B37E 0%, 
                      #00B37E 33%, 
                      #F6C90E 33%, 
                      #F6C90E 66%, 
                      #FF7043 66%, 
                      #FF7043 100%)`
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>1 (Low)</span>
                  <span>34</span>
                  <span>67</span>
                  <span>100 (High)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={!isValid}
                className="flex-1 h-12 bg-primary hover:bg-primary-700 text-white btn-hover-lift focus-ring rounded-lg shadow-lg"
                style={{ boxShadow: '0 4px 14px rgba(11, 99, 255, 0.3)' }}
              >
                Start Analysis
              </Button>
              <Button
                onClick={onSkip}
                variant="outline"
                className="flex-1 h-12 border-neutral-border hover:bg-surface-2 btn-hover-lift focus-ring rounded-lg"
              >
                Skip & Use Defaults
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
