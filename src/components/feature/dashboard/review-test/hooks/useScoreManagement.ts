// hooks/useScoreManagement.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMaxScoreForAnswer } from "../utils";
import { TestSessionWithDetails } from "@/components/feature/dashboard/review-test/interface";

export const useScoreManagement = (testSession: TestSessionWithDetails) => {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [editingScores, setEditingScores] = useState<Record<string, boolean>>(
    {},
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialScores: Record<string, number> = {};
    testSession.userAnswers.forEach(answer => {
      if (answer.question.type === "TEXT") {
        initialScores[answer.id] = answer.givenScore || 0;
      }
    });
    setScores(initialScores);
  }, [testSession.userAnswers]);

  const handleScoreChange = (answerId: string, score: number) => {
    const maxScore = getMaxScoreForAnswer(answerId, testSession);
    const newScore = Math.max(0, Math.min(score, maxScore));
    setScores(prev => ({ ...prev, [answerId]: newScore }));
  };

  const toggleEditScore = (answerId: string) => {
    setEditingScores(prev => ({ ...prev, [answerId]: !prev[answerId] }));
  };

  const saveScore = async (answerId: string) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/admin/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId, score: scores[answerId] }),
      });

      if (response.ok) {
        toggleEditScore(answerId);
        router.refresh();
        toast.success("Score saved successfully!");
      } else {
        throw new Error("Failed to save score");
      }
    } catch (error) {
      console.error("Error saving score:", error);
      toast.error("Error saving score. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllScores = async () => {
    try {
      setIsSaving(true);
      const textAnswers = testSession.userAnswers.filter(
        a => a.question.type === "TEXT",
      );
      const scoreUpdates = textAnswers.map(answer => ({
        answerId: answer.id,
        score: scores[answer.id] || 0,
      }));

      const response = await fetch("/api/admin/evaluate-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: testSession.id,
          scores: scoreUpdates,
        }),
      });

      if (response.ok) {
        const newEditingScores = { ...editingScores };
        Object.keys(newEditingScores).forEach(key => {
          newEditingScores[key] = false;
        });
        setEditingScores(newEditingScores);
        router.refresh();
        toast.success("All scores saved successfully!");
      } else {
        throw new Error("Failed to save scores");
      }
    } catch (error) {
      console.error("Error saving scores:", error);
      toast.error("Error saving scores. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalScore = () => {
    const mcqScore = testSession.userAnswers
      .filter(a => a.question.type === "MCQ")
      .reduce((sum, answer) => sum + (answer.autoScore || 0), 0);

    const textScore = testSession.userAnswers
      .filter(a => a.question.type === "TEXT")
      .reduce((sum, answer) => sum + (scores[answer.id] || 0), 0);

    return mcqScore + textScore;
  };

  const getAchievedPercentage = () => {
    const totalPossibleScore = testSession.userAnswers.reduce(
      (sum, answer) => sum + answer.question.score,
      0,
    );
    return totalPossibleScore > 0
      ? (getTotalScore() / totalPossibleScore) * 100
      : 0;
  };

  return {
    scores,
    editingScores,
    isSaving,
    handleScoreChange,
    toggleEditScore,
    saveScore,
    saveAllScores,
    getTotalScore,
    getAchievedPercentage,
  };
};
