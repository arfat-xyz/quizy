// QuestionsReview.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewTestDetailComponentProps } from "@/components/feature/dashboard/review-test/interface";
import {
  getStatusIcon,
  getStatusText,
  getStatusVariant,
} from "@/components/feature/dashboard/review-test/utils";
import QuestionItem from "@/components/feature/dashboard/review-test/QuestionItem";

interface QuestionsReviewProps {
  testSession: ReviewTestDetailComponentProps["testSession"];
  scores: Record<string, number>;
  editingScores: Record<string, boolean>;
  isSaving: boolean;
  onScoreChange: (answerId: string, score: number) => void;
  onToggleEditScore: (answerId: string) => void;
  onSaveScore: (answerId: string) => Promise<void>;
  status: string;
}

const QuestionsReview = ({
  testSession,
  scores,
  editingScores,
  isSaving,
  onScoreChange,
  onToggleEditScore,
  onSaveScore,
  status,
}: QuestionsReviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Questions & Answers Evaluation</span>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>Status:</span>
            <Badge
              variant={getStatusVariant(status)}
              className="flex items-center gap-1"
            >
              {getStatusIcon(status)}
              {getStatusText(status)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {testSession.userAnswers.map((userAnswer, index) => (
            <QuestionItem
              key={userAnswer.id}
              userAnswer={userAnswer}
              index={index}
              score={scores[userAnswer.id] || 0}
              isEditing={editingScores[userAnswer.id]}
              isSaving={isSaving}
              onScoreChange={onScoreChange}
              onToggleEditScore={onToggleEditScore}
              onSaveScore={onSaveScore}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionsReview;
