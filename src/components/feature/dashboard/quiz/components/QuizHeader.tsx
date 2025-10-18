import React from "react";

interface QuizTableHeaderProps {
  currentPage: number;
  totalCount: number;
  limit: number;
}

const QuizTableHeader = ({
  currentPage,
  totalCount,
  limit,
}: QuizTableHeaderProps) => {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Questions</h2>
        <p className="text-muted-foreground">
          Showing {(currentPage - 1) * limit + 1} to{" "}
          {Math.min(currentPage * limit, totalCount)} of {totalCount} questions
        </p>
      </div>
    </div>
  );
};

export default QuizTableHeader;
