import React from "react";

const EmptyQuizState = () => {
  return (
    <div className="rounded-lg border p-8 text-center">
      <p className="text-muted-foreground">
        No quizzes found. Create your first quiz to get started.
      </p>
    </div>
  );
};

export default EmptyQuizState;
