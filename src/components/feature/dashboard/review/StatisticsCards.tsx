// StatisticsCards.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmittedSession } from "@/components/feature/dashboard/review/interface";

interface StatisticsCardsProps {
  submittedSessions: SubmittedSession[];
}

const StatisticsCards = ({ submittedSessions }: StatisticsCardsProps) => {
  const averageScore = Math.round(
    submittedSessions.reduce(
      (sum, session) => sum + session.achievedPercentage,
      0,
    ) / submittedSessions.length,
  );

  const passingTests = submittedSessions.filter(
    session => session.achievedPercentage >= 60,
  ).length;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Performance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-primary text-2xl font-bold">
              {averageScore}%
            </div>
            <div className="text-muted-foreground">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {passingTests}
            </div>
            <div className="text-muted-foreground">Passing Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {submittedSessions.length}
            </div>
            <div className="text-muted-foreground">Total Evaluated</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCards;
