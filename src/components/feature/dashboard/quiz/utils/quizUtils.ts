import { QuestionType, Question, Choice } from "@prisma/client";

export const getQuestionTypeLabel = (type: QuestionType): string => {
  switch (type) {
    case QuestionType.MCQ:
      return "Multiple Choice";
    case QuestionType.TEXT:
      return "Text Answer";
    default:
      return type;
  }
};

export const getQuestionTypeVariant = (
  type: QuestionType,
): "secondary" | "default" | "outline" => {
  switch (type) {
    case QuestionType.MCQ:
      return "secondary";
    case QuestionType.TEXT:
      return "default";
    default:
      return "outline";
  }
};

export const getCorrectAnswer = (
  question: Question & { choices: Choice[] },
): string => {
  if (question.type === QuestionType.TEXT) {
    return "Text Answer";
  }

  if (question.type === QuestionType.MCQ && question.correct.length > 0) {
    const correctChoices = question.choices
      .filter(choice => question.correct.includes(choice.index))
      .map(choice => choice.text);

    if (correctChoices.length === 0) {
      return "No correct answer set";
    }

    if (correctChoices.length === 1) {
      return correctChoices[0];
    }

    if (correctChoices.length <= 2) {
      return correctChoices.join(", ");
    }

    return `${correctChoices.length} correct answers`;
  }

  return "No correct answer set";
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
