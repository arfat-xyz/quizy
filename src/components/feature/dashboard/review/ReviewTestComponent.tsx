"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GlobalPagination from "@/components/shared/GlobalPagination";
import { FileText } from "lucide-react";
import { SubmittedSession } from "@/components/feature/dashboard/review/interface";
import EmptyState from "@/components/feature/dashboard/review/EmptyState";
import SessionsTable from "@/components/feature/dashboard/review/SessionTable";
import PerformanceLegend from "@/components/feature/dashboard/review/PerformanceLegend";
import StatisticsCards from "@/components/feature/dashboard/review/StatisticsCards";

interface ReviewTestComponentProps {
  submittedSessions: SubmittedSession[];
  currentPage: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

const ReviewTestComponent = ({
  submittedSessions,
  currentPage,
  limit,
  totalPages,
  totalCount,
}: ReviewTestComponentProps) => {
  if (submittedSessions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto grid grid-cols-1 px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Test Results Review
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and evaluate submitted tests
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Submitted Tests</span>
              </div>
              <Badge variant="secondary">
                {totalCount} total submission{totalCount !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SessionsTable submittedSessions={submittedSessions} />

            {/* Global Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <GlobalPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={limit}
                  limits={[10, 25, 50, 100]}
                  updateUrl={true}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <PerformanceLegend />
        <StatisticsCards submittedSessions={submittedSessions} />
      </div>
    </div>
  );
};

export default ReviewTestComponent;
