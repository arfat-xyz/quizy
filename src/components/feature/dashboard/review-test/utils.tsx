// utils.tsx
import { ReviewTestDetailComponentProps } from "@/components/feature/dashboard/review-test/interface";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Clock,
} from "lucide-react";
import React from "react";

export const getMaxScoreForAnswer = (
  answerId: string,
  testSession: ReviewTestDetailComponentProps["testSession"],
) => {
  const answer = testSession.userAnswers.find(a => a.id === answerId);
  return answer ? answer.question.score : 0;
};

export const getPerformanceVariant = (percentage: number) => {
  if (percentage >= 80) return "default";
  if (percentage >= 60) return "secondary";
  if (percentage >= 40) return "outline";
  return "destructive";
};

export const getPerformanceIcon = (percentage: number) => {
  if (percentage >= 80) return <TrendingUp className="h-4 w-4" />;
  if (percentage >= 60) return <CheckCircle className="h-4 w-4" />;
  if (percentage >= 40) return <TrendingDown className="h-4 w-4" />;
  return <XCircle className="h-4 w-4" />;
};

export const getStatusVariant = (status: string) => {
  switch (status) {
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    case "pending":
      return "outline";
    default:
      return "outline";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "accepted":
      return <ThumbsUp className="h-4 w-4" />;
    case "rejected":
      return <ThumbsDown className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "pending":
      return "Under Review";
    default:
      return status;
  }
};
