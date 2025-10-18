"use client";
import {
  UserTestSession,
  User,
  Test,
  Position,
  UserAnswer,
  QuestionType,
} from "@prisma/client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User as UserIcon,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Save,
  Edit,
  TrendingUp,
  TrendingDown,
  Check,
  Clock,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DecisionModal from "@/components/feature/dashboard/review-test/DecisionModal";

interface TestSessionWithDetails extends UserTestSession {
  user: Pick<User, "id" | "name" | "email" | "userName">;
  test: Test & {
    position: Position;
    testGroups: {
      group: {
        name: string;
        questions: {
          id: string;
          text: string;
          type: QuestionType;
          score: number;
          correct: number[];
          choices: {
            id: string;
            text: string;
            index: number;
          }[];
        }[];
      };
    }[];
  };
  userAnswers: (UserAnswer & {
    question: {
      id: string;
      text: string;
      type: QuestionType;
      score: number;
      correct: number[];
      choices: {
        id: string;
        text: string;
        index: number;
      }[];
    };
  })[];
}

interface ReviewTestDetailComponentProps {
  testSession: TestSessionWithDetails;
  totalPossibleScore: number;
  currentStatus: string;
}

const ReviewTestDetailComponent = ({
  testSession,
  totalPossibleScore,
  currentStatus,
}: ReviewTestDetailComponentProps) => {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [editingScores, setEditingScores] = useState<Record<string, boolean>>(
    {},
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  // Initialize scores from userAnswers
  useEffect(() => {
    const initialScores: Record<string, number> = {};

    testSession.userAnswers.forEach(answer => {
      if (answer.question.type === "TEXT") {
        initialScores[answer.id] = answer.givenScore || 0;
      }
    });

    setScores(initialScores);
  }, [testSession.userAnswers]);

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startedAt: Date, endedAt: Date | null) => {
    if (!endedAt) return "N/A";

    const durationMs =
      new Date(endedAt).getTime() - new Date(startedAt).getTime();
    const durationMins = Math.floor(durationMs / 60000);

    const hours = Math.floor(durationMins / 60);
    const minutes = durationMins % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleScoreChange = (answerId: string, score: number) => {
    const maxScore = getMaxScoreForAnswer(answerId);
    const newScore = Math.max(0, Math.min(score, maxScore));

    setScores(prev => ({
      ...prev,
      [answerId]: newScore,
    }));
  };

  const getMaxScoreForAnswer = (answerId: string) => {
    const userAnswer = testSession.userAnswers.find(a => a.id === answerId);
    return userAnswer?.question.score || 0;
  };

  const toggleEditScore = (answerId: string) => {
    setEditingScores(prev => ({
      ...prev,
      [answerId]: !prev[answerId],
    }));
  };

  const saveScore = async (answerId: string) => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/admin/evaluate-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answerId: answerId,
          score: scores[answerId],
        }),
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: testSession.id,
          scores: scoreUpdates,
        }),
      });

      if (response.ok) {
        // Exit all edit modes
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
    return totalPossibleScore > 0
      ? (getTotalScore() / totalPossibleScore) * 100
      : 0;
  };

  const getPerformanceVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    if (percentage >= 40) return "outline";
    return "destructive";
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="h-4 w-4" />;
    if (percentage >= 60) return <CheckCircle className="h-4 w-4" />;
    if (percentage >= 40) return <TrendingDown className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getStatusVariant = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <ThumbsUp className="h-4 w-4" />;
      case "rejected":
        return <ThumbsDown className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Under Review";
      default:
        return status;
    }
  };

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

  const textAnswers = testSession.userAnswers.filter(
    a => a.question.type === "TEXT",
  );
  const hasTextAnswers = textAnswers.length > 0;
  const totalScore = getTotalScore();
  const achievedPercentage = getAchievedPercentage();

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          {/* Header Section */}
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
              {/* Status with better visibility */}
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

              {/* Action Buttons with clear hierarchy */}
              <div className="flex flex-wrap gap-3">
                {hasTextAnswers && (
                  <Button
                    onClick={saveAllScores}
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
                  onClick={() => setIsDecisionModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 flex min-w-[150px] items-center gap-2 shadow-sm transition-all"
                  title="Finalize evaluation decision"
                >
                  <Check className="h-4 w-4" />
                  Make Decision
                </Button>
              </div>
            </div>
          </div>

          {/* Progress indicator for saving state */}
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

        {/* Candidate and Test Info */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">
                  {testSession.user.name ||
                    testSession.user.userName ||
                    "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{testSession.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position:</span>
                <Badge variant="outline">
                  {testSession.test.position.name}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge
                  variant={getStatusVariant(status)}
                  className="flex items-center gap-1"
                >
                  {getStatusIcon(status)}
                  {getStatusText(status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Test Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Test Name:</span>
                <span className="font-medium">{testSession.test.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started:</span>
                <span className="text-sm font-medium">
                  {formatDateTime(testSession.startedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="text-sm font-medium">
                  {formatDateTime(testSession.endedAt!)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">
                  {formatDuration(testSession.startedAt, testSession.endedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Score:</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getPerformanceVariant(achievedPercentage)}
                    className="flex items-center gap-1"
                  >
                    {getPerformanceIcon(achievedPercentage)}
                    {totalScore.toFixed(1)} / {totalPossibleScore}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    ({achievedPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Review */}
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
              {testSession.userAnswers.map((userAnswer, index) => {
                const question = userAnswer.question;
                const isMCQ = question.type === "MCQ";
                const isTEXT = question.type === "TEXT";
                const isCorrect =
                  isMCQ && userAnswer.autoScore === question.score;
                const isEditing = editingScores[userAnswer.id];

                return (
                  <div
                    key={userAnswer.id}
                    className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Header Section */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Question Info */}
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Question {index + 1}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="px-2 py-1 text-xs"
                            >
                              {question.type}
                            </Badge>
                            <Badge
                              variant={
                                isMCQ
                                  ? isCorrect
                                    ? "default"
                                    : "destructive"
                                  : "secondary"
                              }
                              className="px-2 py-1 text-xs font-medium"
                            >
                              {isMCQ
                                ? `${userAnswer.autoScore || 0} / ${question.score}`
                                : `${scores[userAnswer.id] || 0} / ${question.score}`}
                            </Badge>
                          </div>
                        </div>

                        {/* Question Text */}
                        <p className="text-lg leading-relaxed text-gray-700">
                          {question.text}
                        </p>
                      </div>

                      {/* Action Button */}
                      {isTEXT && (
                        <div className="flex sm:justify-end">
                          {!isEditing ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEditScore(userAnswer.id)}
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
                                onClick={() => toggleEditScore(userAnswer.id)}
                                className="flex items-center gap-2"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => saveScore(userAnswer.id)}
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

                    {/* Content Section */}
                    {isMCQ ? (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">
                          {`Candidate's Selection:`}
                        </h4>
                        <div className="space-y-3">
                          {question.choices.map((choice, choiceIndex) => {
                            const isSelected = userAnswer.response
                              .split(",")
                              .map(Number)
                              .includes(choiceIndex);
                            const isCorrectAnswer =
                              question.correct.includes(choiceIndex);

                            return (
                              <div
                                key={choice.id}
                                className={`flex items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                                  isCorrectAnswer
                                    ? "border-green-300 bg-green-50 shadow-sm"
                                    : isSelected
                                      ? "border-red-300 bg-red-50 shadow-sm"
                                      : "border-gray-200 bg-gray-50"
                                }`}
                              >
                                {/* Status Icon */}
                                <div className="mt-0.5 flex-shrink-0">
                                  {isCorrectAnswer ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : isSelected ? (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
                                  )}
                                </div>

                                {/* Choice Text */}
                                <div className="flex-1">
                                  <span
                                    className={`text-sm ${
                                      isCorrectAnswer
                                        ? "font-medium text-green-900"
                                        : isSelected
                                          ? "text-red-900"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {choice.text}
                                  </span>
                                </div>

                                {/* Badges */}
                                <div className="flex-shrink-0">
                                  {isCorrectAnswer && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-100 text-green-800"
                                    >
                                      Correct Answer
                                    </Badge>
                                  )}
                                  {isSelected && !isCorrectAnswer && (
                                    <Badge
                                      variant="destructive"
                                      className="bg-red-100 text-red-800"
                                    >
                                      {`Candidate's Choice`}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Candidate's Answer */}
                        <div>
                          <h4 className="mb-3 font-medium text-gray-900">
                            {`Candidate's Answer:`}
                          </h4>
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p className="whitespace-pre-wrap text-gray-700">
                              {userAnswer.response || (
                                <span className="text-gray-500 italic">
                                  No answer provided
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Scoring Section */}
                        {isEditing ? (
                          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                              <Label
                                htmlFor={`score-${userAnswer.id}`}
                                className="min-w-28 font-medium text-gray-900 sm:min-w-24"
                              >
                                Assign Score:
                              </Label>
                              <div className="flex items-center gap-3">
                                <Input
                                  id={`score-${userAnswer.id}`}
                                  type="number"
                                  min="0"
                                  max={question.score}
                                  value={scores[userAnswer.id] || 0}
                                  onChange={e =>
                                    handleScoreChange(
                                      userAnswer.id,
                                      Math.max(
                                        0,
                                        Math.min(
                                          question.score,
                                          parseInt(e.target.value) || 0,
                                        ),
                                      ),
                                    )
                                  }
                                  className="w-20 text-center font-medium"
                                />
                                <span className="text-muted-foreground text-sm whitespace-nowrap">
                                  / {question.score} points
                                </span>
                              </div>

                              {/* Score Guidance */}
                              <div className="mt-2 text-xs text-gray-600 sm:mt-0 sm:ml-4">
                                Enter a score between 0 and {question.score}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                            <span className="font-medium text-gray-900">
                              Current Score:
                            </span>
                            <Badge
                              variant="secondary"
                              className="px-3 py-1 text-sm font-medium"
                            >
                              {scores[userAnswer.id] || 0} / {question.score}
                            </Badge>
                            {scores[userAnswer.id] !== undefined && (
                              <span className="ml-auto text-sm text-gray-600">
                                {Math.round(
                                  ((scores[userAnswer.id] || 0) /
                                    question.score) *
                                    100,
                                )}
                                %
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Modal */}
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
