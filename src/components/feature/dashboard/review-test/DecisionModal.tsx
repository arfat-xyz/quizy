"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Clock,
} from "lucide-react";

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (decision: "accepted" | "rejected") => void;
  candidateName: string;
  testName: string;
  totalScore: number;
  totalPossibleScore: number;
  achievedPercentage: number;
  currentStatus: string;
}

const DecisionModal = ({
  isOpen,
  onClose,
  onSubmit,
  candidateName,
  testName,
  totalScore,
  totalPossibleScore,
  achievedPercentage,
  currentStatus,
}: DecisionModalProps) => {
  const getPerformanceVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    if (percentage >= 40) return "outline";
    return "destructive";
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Average";
    return "Poor";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Final Decision
          </DialogTitle>
          <DialogDescription>
            Make your final decision for this candidate based on their test
            performance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Candidate Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Candidate:</span>
                  <span className="text-sm">{candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Test:</span>
                  <span className="text-sm">{testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Score:</span>
                  <Badge variant={getPerformanceVariant(achievedPercentage)}>
                    {totalScore.toFixed(1)} / {totalPossibleScore} (
                    {achievedPercentage.toFixed(1)}%)
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Performance:</span>
                  <span className="text-sm font-medium">
                    {getPerformanceLabel(achievedPercentage)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Current Status:</span>
                  <Badge
                    variant={getStatusVariant(currentStatus)}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(currentStatus)}
                    {getStatusText(currentStatus)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => onSubmit("rejected")}
              variant="destructive"
              className="flex flex-1 items-center gap-2"
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => onSubmit("accepted")}
              className="flex flex-1 items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
          </div>

          {/* Guidelines */}
          <div className="bg-muted rounded-lg p-3">
            <h4 className="mb-2 text-sm font-medium">Guidelines:</h4>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Accept candidates with good performance (60%+)</li>
              <li>• Consider overall score and answer quality</li>
              <li>• Review text answers for completeness</li>
              <li>• This decision will be recorded in the system</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DecisionModal;
