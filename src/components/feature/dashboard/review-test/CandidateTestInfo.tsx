// CandidateTestInfo.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserIcon, FileText } from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { getStatusVariant, getPerformanceVariant } from "./utils";
import { ReviewTestDetailComponentProps } from "@/components/feature/dashboard/review-test/interface";
import {
  getPerformanceIcon,
  getStatusIcon,
  getStatusText,
} from "@/components/feature/dashboard/review-test/utils";

interface CandidateTestInfoProps {
  testSession: ReviewTestDetailComponentProps["testSession"];
  status: string;
  totalScore: number;
  totalPossibleScore: number;
  achievedPercentage: number;
}

const CandidateTestInfo = ({
  testSession,
  status,
  totalScore,
  totalPossibleScore,
  achievedPercentage,
}: CandidateTestInfoProps) => {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Candidate Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">
              {testSession.user.name || testSession.user.userName || "Unknown"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{testSession.user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position:</span>
            <Badge variant="outline">{testSession.test.position.name}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Status:</span>
            <Badge
              variant={getStatusVariant(status)}
              className="flex items-center gap-1"
            >
              {getStatusIcon(status)}
              {getStatusText(status)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Test Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Test Name:</span>
            <span className="font-medium">{testSession.test.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Started:</span>
            <span className="text-sm font-medium">
              {formatDateTime(testSession.startedAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Submitted:</span>
            <span className="text-sm font-medium">
              {formatDateTime(testSession.endedAt!)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">
              {formatDuration(testSession.startedAt, testSession.endedAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Score:</span>
            <div className="flex items-center gap-2">
              <Badge
                variant={getPerformanceVariant(achievedPercentage)}
                className="flex items-center gap-1"
              >
                {getPerformanceIcon(achievedPercentage)}
                {totalScore.toFixed(1)} / {totalPossibleScore}
              </Badge>
              <span className="text-muted-foreground text-sm">
                ({achievedPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateTestInfo;
