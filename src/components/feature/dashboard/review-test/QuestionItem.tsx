// QuestionItem.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, X, Save } from "lucide-react";
import MCQAnswer from "./MCQAnswer";
import TextAnswer from "./TextAnswer";
import { TestSessionWithDetails } from "@/components/feature/dashboard/review-test/interface";

// Create a type for individual user answer based on TestSessionWithDetails
type UserAnswerFromSession = TestSessionWithDetails["userAnswers"][0];

interface QuestionItemProps {
  userAnswer: UserAnswerFromSession;
  index: number;
  score: number;
  isEditing: boolean;
  isSaving: boolean;
  onScoreChange: (answerId: string, score: number) => void;
  onToggleEditScore: (answerId: string) => void;
  onSaveScore: (answerId: string) => Promise<void>;
}

const QuestionItem = ({
  userAnswer,
  index,
  score,
  isEditing,
  isSaving,
  onScoreChange,
  onToggleEditScore,
  onSaveScore,
}: QuestionItemProps) => {
  const question = userAnswer.question;
  const isMCQ = question.type === "MCQ";
  const isTEXT = question.type === "TEXT";
  const isCorrect = isMCQ && userAnswer.autoScore === question.score;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Question {index + 1}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-2 py-1 text-xs">
                {question.type}
              </Badge>
              <Badge
                variant={
                  isMCQ ? (isCorrect ? "default" : "destructive") : "secondary"
                }
                className="px-2 py-1 text-xs font-medium"
              >
                {isMCQ
                  ? `${userAnswer.autoScore || 0} / ${question.score}`
                  : `${score} / ${question.score}`}
              </Badge>
            </div>
          </div>
          <p className="text-lg leading-relaxed text-gray-700">
            {question.text}
          </p>
        </div>

        {isTEXT && (
          <div className="flex sm:justify-end">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleEditScore(userAnswer.id)}
                className="flex items-center gap-2 transition-all hover:scale-105"
              >
                <Edit className="h-4 w-4" />
                Edit Score
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleEditScore(userAnswer.id)}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onSaveScore(userAnswer.id)}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {isMCQ ? (
        <MCQAnswer userAnswer={userAnswer} />
      ) : (
        <TextAnswer
          userAnswer={userAnswer}
          score={score}
          isEditing={isEditing}
          onScoreChange={onScoreChange}
        />
      )}
    </div>
  );
};

export default QuestionItem;
