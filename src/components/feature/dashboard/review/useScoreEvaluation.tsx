// scoreUtils.tsx
import { CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import React from "react";

export const useScoreEvaluation = () => {
  const getScoreVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    if (percentage >= 40) return "outline";
    return "destructive";
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="h-3 w-3" />;
    if (percentage >= 60) return <CheckCircle className="h-3 w-3" />;
    if (percentage >= 40) return <TrendingDown className="h-3 w-3" />;
    return <XCircle className="h-3 w-3" />;
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Average";
    return "Poor";
  };

  return {
    getScoreVariant,
    getScoreIcon,
    getScoreLabel,
  };
};
