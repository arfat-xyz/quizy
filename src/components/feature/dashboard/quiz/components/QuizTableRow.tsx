import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Group, Question, QuestionType, Choice } from "@prisma/client";
import {
  formatDate,
  getCorrectAnswer,
  getQuestionTypeLabel,
  getQuestionTypeVariant,
  truncateText,
} from "@/components/feature/dashboard/quiz/utils/quizUtils";
import DeleteQuizButton from "@/components/feature/dashboard/quiz/components/DeleteQuizButton";

interface QuizTableRowProps {
  quiz: Question & {
    group: Group;
    choices: Choice[];
  };
}

const QuizTableRow = ({ quiz }: QuizTableRowProps) => {
  return (
    <TableRow key={quiz.id}>
      <TableCell className="font-medium">
        <div className="max-w-xs">{truncateText(quiz?.text || "")}</div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{quiz.group.name}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getQuestionTypeVariant(quiz.type)}>
          {getQuestionTypeLabel(quiz.type)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">
          {quiz.score} point{quiz.score !== 1 ? "s" : ""}
        </Badge>
      </TableCell>
      <TableCell className="max-w-xs">
        <div className="text-muted-foreground text-sm">
          {quiz.type === QuestionType.MCQ ? (
            <div className="space-y-1">
              <span>{getCorrectAnswer(quiz)}</span>
              {quiz.correct.length > 1 && (
                <div className="text-xs text-blue-600">
                  ({quiz.correct.length} selected)
                </div>
              )}
            </div>
          ) : (
            <span>-</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {quiz.type === QuestionType.MCQ ? (
          <span className="text-muted-foreground text-sm">
            {quiz.choices.length} options
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground text-sm">
          {formatDate(quiz.createdAt)}
        </span>
      </TableCell>
      <DeleteQuizButton quizId={quiz.id} quizText={quiz.text} />
    </TableRow>
  );
};

export default QuizTableRow;
