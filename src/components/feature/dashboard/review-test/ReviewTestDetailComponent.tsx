"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReviewTestDetailComponentProps } from "@/components/feature/dashboard/review-test/interface";
import DecisionModal from "./DecisionModal";
import { useScoreManagement } from "./hooks/useScoreManagement";
import HeaderSection from "@/components/feature/dashboard/review-test/HeaderSection";
import CandidateTestInfo from "@/components/feature/dashboard/review-test/CandidateTestInfo";
import QuestionsReview from "@/components/feature/dashboard/review-test/QuestionsReview";

const ReviewTestDetailComponent = ({
  testSession,
  totalPossibleScore,
  currentStatus,
}: ReviewTestDetailComponentProps) => {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const {
    scores,
    editingScores,
    isSaving,
    handleScoreChange,
    toggleEditScore,
    saveScore,
    saveAllScores,
    getTotalScore,
    getAchievedPercentage,
  } = useScoreManagement(testSession);

  const handleDecisionSubmit = async (decision: "accepted" | "rejected") => {
    try {
      const response = await fetch("/api/admin/update-assigned-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: testSession.userId,
          testId: testSession.testId,
          status: decision,
        }),
      });

      if (response.ok) {
        setStatus(decision);
        setIsDecisionModalOpen(false);
        router.refresh();
        toast.success(`Candidate ${decision} successfully!`);
      } else {
        throw new Error("Failed to update decision");
      }
    } catch (error) {
      console.error("Error updating decision:", error);
      toast.error("Error updating decision. Please try again.");
    }
  };

  const totalScore = getTotalScore();
  const achievedPercentage = getAchievedPercentage();
  const textAnswers = testSession.userAnswers.filter(
    a => a.question.type === "TEXT",
  );
  const hasTextAnswers = textAnswers.length > 0;

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <HeaderSection
          testSession={testSession}
          status={status}
          hasTextAnswers={hasTextAnswers}
          isSaving={isSaving}
          onSaveAllScores={saveAllScores}
          onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
        />

        <CandidateTestInfo
          testSession={testSession}
          status={status}
          totalScore={totalScore}
          totalPossibleScore={totalPossibleScore}
          achievedPercentage={achievedPercentage}
        />

        <QuestionsReview
          testSession={testSession}
          scores={scores}
          editingScores={editingScores}
          isSaving={isSaving}
          onScoreChange={handleScoreChange}
          onToggleEditScore={toggleEditScore}
          onSaveScore={saveScore}
          status={status}
        />
      </div>

      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        onSubmit={handleDecisionSubmit}
        candidateName={
          testSession.user.name || testSession.user.userName || "Unknown"
        }
        testName={testSession.test.name}
        totalScore={totalScore}
        totalPossibleScore={totalPossibleScore}
        achievedPercentage={achievedPercentage}
        currentStatus={status}
      />
    </div>
  );
};

export default ReviewTestDetailComponent;
