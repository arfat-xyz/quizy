// HeaderSection.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Check } from "lucide-react";
import { getStatusVariant } from "./utils";
import { ReviewTestDetailComponentProps } from "@/components/feature/dashboard/review-test/interface";
import {
  getStatusIcon,
  getStatusText,
} from "@/components/feature/dashboard/review-test/utils";

interface HeaderSectionProps {
  testSession: ReviewTestDetailComponentProps["testSession"];
  status: string;
  hasTextAnswers: boolean;
  isSaving: boolean;
  onSaveAllScores: () => void;
  onOpenDecisionModal: () => void;
}

const HeaderSection = ({
  testSession,
  status,
  hasTextAnswers,
  isSaving,
  onSaveAllScores,
  onOpenDecisionModal,
}: HeaderSectionProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section - Navigation and Title */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/dashboard/review-test">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 transition-all hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </Button>
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              Test Results Review
            </h1>
            <p className="text-muted-foreground mt-1 truncate">
              Evaluating: {testSession.test.name}
            </p>
          </div>
        </div>

        {/* Right Section - Status and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-3">
            <Badge
              variant={getStatusVariant(status)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                {getStatusIcon(status)}
                {getStatusText(status)}
              </span>
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            {hasTextAnswers && (
              <Button
                onClick={onSaveAllScores}
                disabled={isSaving}
                variant="outline"
                className="flex min-w-[140px] items-center gap-2 transition-all"
                title="Save all current scores"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save All Scores
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={onOpenDecisionModal}
              className="bg-primary hover:bg-primary/90 flex min-w-[150px] items-center gap-2 shadow-sm transition-all"
              title="Finalize evaluation decision"
            >
              <Check className="h-4 w-4" />
              Make Decision
            </Button>
          </div>
        </div>
      </div>

      {isSaving && (
        <div className="mt-4">
          <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
            <div className="bg-primary h-full w-1/2 animate-pulse"></div>
          </div>
          <p className="text-muted-foreground mt-1 text-center text-xs">
            Saving your changes...
          </p>
        </div>
      )}
    </div>
  );
};

export default HeaderSection;
