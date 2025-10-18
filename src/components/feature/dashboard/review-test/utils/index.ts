import { TestSessionWithDetails } from "@/components/feature/dashboard/review-test/interface";

export const getMaxScoreForAnswer = (
  answerId: string,
  testSession: TestSessionWithDetails,
) => {
  const userAnswer = testSession.userAnswers.find(a => a.id === answerId);
  return userAnswer?.question.score || 0;
};
export const getPerformanceVariant = (percentage: number) => {
  if (percentage >= 80) return "default";
  if (percentage >= 60) return "secondary";
  if (percentage >= 40) return "outline";
  return "destructive";
};
export const getStatusVariant = (status: string) => {
  switch (status) {
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    case "pending":
      return "outline";
    default:
      return "secondary";
  }
};
