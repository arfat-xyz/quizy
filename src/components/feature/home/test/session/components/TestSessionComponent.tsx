"use client";
import {
  UserTestSession,
  Test,
  Position,
  UserAnswer,
  QuestionType,
} from "@prisma/client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Square,
  CheckSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TestSessionWithDetails extends UserTestSession {
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

interface TestSessionComponentProps {
  testSession: TestSessionWithDetails;
}

const TestSessionComponent = ({ testSession }: TestSessionComponentProps) => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number[]>
  >({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);

  // Get all questions flattened
  const allQuestions = testSession.test.testGroups.flatMap(
    testGroup => testGroup.group.questions,
  );

  const currentQuestion = allQuestions[currentQuestionIndex];

  // Calculate time remaining
  const startTime = new Date(testSession.startedAt);
  const endTime = new Date(
    startTime.getTime() + testSession.test.durationMin * 60000,
  );
  const timeRemaining = Math.max(0, endTime.getTime() - currentTime.getTime());
  const timeRemainingMinutes = Math.floor(timeRemaining / 60000);
  const timeRemainingSeconds = Math.floor((timeRemaining % 60000) / 1000);

  // Initialize selected answers from userAnswers
  useEffect(() => {
    const initialSelected: Record<string, number[]> = {};
    const initialText: Record<string, string> = {};

    testSession.userAnswers.forEach(answer => {
      if (answer.question.type === "MCQ") {
        initialSelected[answer.questionId] = answer.response
          .split(",")
          .map(Number);
      } else {
        initialText[answer.questionId] = answer.response;
      }
    });

    setSelectedAnswers(initialSelected);
    setTextAnswers(initialText);
  }, [testSession.userAnswers]);

  // Timer effect
  useEffect(() => {
    if (testSession.submitted) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Auto-submit if time is up
      if (timeRemaining <= 0) {
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, testSession.submitted]);

  const handleAnswerSelect = (
    questionId: string,
    choiceIndex: number,
    isMultiple: boolean,
  ) => {
    if (testSession.submitted) return;

    setSelectedAnswers(prev => {
      const current = prev[questionId] || [];

      if (isMultiple) {
        const newSelection = current.includes(choiceIndex)
          ? current.filter(idx => idx !== choiceIndex)
          : [...current, choiceIndex];
        return { ...prev, [questionId]: newSelection };
      } else {
        return { ...prev, [questionId]: [choiceIndex] };
      }
    });
  };

  const handleTextAnswerChange = (questionId: string, answer: string) => {
    if (testSession.submitted) return;
    setTextAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const saveAnswer = async (questionId: string) => {
    try {
      const answer =
        currentQuestion.type === "MCQ"
          ? selectedAnswers[questionId]?.join(",") || ""
          : textAnswers[questionId] || "";

      await fetch("/api/test/session/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: testSession.id,
          questionId,
          response: answer,
        }),
      });
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const handleSubmitTest = async () => {
    try {
      // Save all answers first
      for (const question of allQuestions) {
        await saveAnswer(question.id);
      }

      // Submit the test
      const response = await fetch("/api/test/session/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: testSession.id,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  const handleAutoSubmit = async () => {
    try {
      // Save all answers first
      for (const question of allQuestions) {
        await saveAnswer(question.id);
      }

      // Auto-submit the test
      await fetch("/api/test/session/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: testSession.id,
          autoSubmit: true,
        }),
      });

      router.refresh();
    } catch (error) {
      console.error("Error auto-submitting test:", error);
    }
  };

  const getQuestionStatus = (questionIndex: number) => {
    const question = allQuestions[questionIndex];
    const userAnswer = testSession.userAnswers.find(
      a => a.questionId === question.id,
    );

    if (testSession.submitted) {
      const isCorrect = userAnswer?.autoScore === question.score;
      return { answered: true, correct: isCorrect };
    }

    return {
      answered: !!userAnswer?.response,
      correct: false,
    };
  };

  const calculateScore = () => {
    if (!testSession.submitted) return 0;

    const mcqScore = testSession.userAnswers
      .filter(a => a.question.type === "MCQ")
      .reduce((sum, answer) => sum + (answer.autoScore || 0), 0);

    const textScore = testSession.userAnswers
      .filter(a => a.question.type === "TEXT")
      .reduce((sum, answer) => sum + (answer.givenScore || 0), 0);

    return mcqScore + textScore;
  };

  const getMaxScore = () => {
    return allQuestions.reduce((sum, question) => sum + question.score, 0);
  };

  const getAnsweredQuestions = () => {
    return testSession.userAnswers.filter(
      answer => answer.response.trim() !== "",
    );
  };

  const getUnansweredQuestions = () => {
    const answeredQuestionIds = new Set(
      testSession.userAnswers.map(a => a.questionId),
    );
    return allQuestions.filter(
      question => !answeredQuestionIds.has(question.id),
    );
  };

  // Show review section after submission
  if (testSession.submitted && !showReview) {
    return (
      <div className="bg-background min-h-screen py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Results Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Test Submitted Successfully!
            </h1>
            <div className="mb-4 flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-lg">
                {testSession.test.position.name}
              </Badge>
              <Badge
                variant={
                  calculateScore() >= getMaxScore() * 0.7
                    ? "default"
                    : "destructive"
                }
                className="px-4 py-2 text-lg"
              >
                Score: {calculateScore()} / {getMaxScore()}
              </Badge>
            </div>
          </div>

          {/* Results Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-primary text-3xl font-bold">
                    {calculateScore()}
                  </div>
                  <div className="text-muted-foreground">Your Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {getAnsweredQuestions().length}
                  </div>
                  <div className="text-muted-foreground">Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {getUnansweredQuestions().length}
                  </div>
                  <div className="text-muted-foreground">Not Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {allQuestions.length}
                  </div>
                  <div className="text-muted-foreground">Total Questions</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {getAnsweredQuestions().length} / {allQuestions.length}
                  </span>
                </div>
                <Progress
                  value={
                    (getAnsweredQuestions().length / allQuestions.length) * 100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => setShowReview(true)}
              size="lg"
              className="flex items-center gap-2"
            >
              <Eye className="h-5 w-5" />
              Review Your Answers
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="lg"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Additional Info */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="text-muted-foreground text-center">
                <p className="mb-2">
                  You can review your answers below. Note that correct answers
                  are not shown.
                </p>
                <p>
                  For text questions, your answers will be evaluated manually by
                  the administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show detailed review after clicking "Review Your Answers"
  if (testSession.submitted && showReview) {
    return (
      <div className="bg-background min-h-screen py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Review Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowReview(false)}
                className="flex items-center gap-2"
              >
                <EyeOff className="h-4 w-4" />
                Back to Summary
              </Button>
              <h1 className="text-3xl font-bold">Your Answers Review</h1>
            </div>
            <div className="mb-4 flex flex-wrap justify-center gap-4">
              <Badge variant="secondary">
                {getAnsweredQuestions().length} Answered
              </Badge>
              <Badge variant="outline">
                {getUnansweredQuestions().length} Not Answered
              </Badge>
              <Badge variant="default">
                Score: {calculateScore()} / {getMaxScore()}
              </Badge>
            </div>
          </div>

          {/* Answered Questions */}
          {getAnsweredQuestions().length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Answered Questions ({getAnsweredQuestions().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getAnsweredQuestions().map(userAnswer => {
                    const question = allQuestions.find(
                      q => q.id === userAnswer.questionId,
                    );
                    if (!question) return null;

                    return (
                      <div
                        key={userAnswer.id}
                        className="rounded-lg border p-6"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <h3 className="text-lg font-semibold">
                            Question{" "}
                            {allQuestions.findIndex(q => q.id === question.id) +
                              1}
                          </h3>
                          <div className="flex gap-2">
                            <Badge variant="outline">{question.type}</Badge>
                            <Badge
                              variant={
                                userAnswer.autoScore === question.score
                                  ? "default"
                                  : userAnswer.autoScore &&
                                      userAnswer.autoScore > 0
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {userAnswer.autoScore || 0} / {question.score} pts
                            </Badge>
                          </div>
                        </div>

                        <p className="mb-4 text-lg">{question.text}</p>

                        {question.type === "MCQ" && (
                          <div className="space-y-2">
                            <h4 className="mb-2 font-medium">
                              Your Selection:
                            </h4>
                            {question.choices.map((choice, choiceIndex) => {
                              const isSelected = userAnswer.response
                                .split(",")
                                .map(Number)
                                .includes(choiceIndex);

                              return (
                                <div
                                  key={choice.id}
                                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                                    isSelected
                                      ? "border-blue-200 bg-blue-50"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  {isSelected ? (
                                    <CheckSquare className="h-5 w-5 text-blue-600" />
                                  ) : (
                                    <Square className="h-5 w-5 text-gray-400" />
                                  )}
                                  <span
                                    className={
                                      isSelected
                                        ? "font-medium text-blue-800"
                                        : ""
                                    }
                                  >
                                    {choice.text}
                                  </span>
                                  {isSelected && (
                                    <Badge
                                      variant="outline"
                                      className="ml-auto"
                                    >
                                      Your Choice
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {question.type === "TEXT" && (
                          <div className="space-y-3">
                            <div>
                              <h4 className="mb-2 font-medium">Your Answer:</h4>
                              <div className="rounded-lg border bg-gray-50 p-3">
                                {userAnswer.response || "No answer provided"}
                              </div>
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {userAnswer.givenScore !== null ? (
                                <Badge variant="secondary">
                                  Manually Scored: {userAnswer.givenScore} /{" "}
                                  {question.score}
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Awaiting Manual Evaluation
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unanswered Questions */}
          {getUnansweredQuestions().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Questions Not Answered ({getUnansweredQuestions().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUnansweredQuestions().map(question => (
                    <div key={question.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            Question{" "}
                            {allQuestions.findIndex(q => q.id === question.id) +
                              1}
                          </h4>
                          <p className="text-muted-foreground mt-1">
                            {question.text}
                          </p>
                        </div>
                        <Badge variant="destructive">Not Answered</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 text-center">
            <Button onClick={() => router.push("/")}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // Active test session UI (same as before)
  return (
    <div className="bg-background min-h-screen">
      {/* Header with Timer */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{testSession.test.name}</h1>
              <p className="text-muted-foreground">
                {testSession.test.position.name}
              </p>
            </div>

            <div className="text-center">
              <div
                className={`font-mono text-2xl font-bold ${
                  timeRemainingMinutes < 5 ? "text-red-600" : "text-foreground"
                }`}
              >
                {String(timeRemainingMinutes).padStart(2, "0")}:
                {String(timeRemainingSeconds).padStart(2, "0")}
              </div>
              <div className="text-muted-foreground text-sm">
                Time Remaining
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress
              value={(currentQuestionIndex / allQuestions.length) * 100}
              className="h-2"
            />
            <div className="text-muted-foreground mt-1 flex justify-between text-sm">
              <span>
                Question {currentQuestionIndex + 1} of {allQuestions.length}
              </span>
              <span>
                {Math.round((currentQuestionIndex / allQuestions.length) * 100)}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="mb-6 flex flex-wrap gap-2">
          {allQuestions.map((_, index) => {
            const status = getQuestionStatus(index);
            return (
              <Button
                key={index}
                variant={status.answered ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className={
                  currentQuestionIndex === index ? "ring-primary ring-2" : ""
                }
              >
                {index + 1}
              </Button>
            );
          })}
        </div>

        {/* Current Question */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">
                Question {currentQuestionIndex + 1}
              </h2>
              <p className="text-lg">{currentQuestion.text}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">{currentQuestion.type}</Badge>
                <Badge variant="secondary">
                  {currentQuestion.score} points
                </Badge>
                {currentQuestion.correct.length > 1 && (
                  <Badge variant="outline">Multiple Answers</Badge>
                )}
              </div>
            </div>

            {currentQuestion.type === "MCQ" && (
              <div className="space-y-3">
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected =
                    selectedAnswers[currentQuestion.id]?.includes(index) ||
                    false;

                  return (
                    <div
                      key={choice.id}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-accent"
                      }`}
                      onClick={() =>
                        handleAnswerSelect(
                          currentQuestion.id,
                          index,
                          currentQuestion.correct.length > 1,
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                        <span>{choice.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === "TEXT" && (
              <textarea
                value={textAnswers[currentQuestion.id] || ""}
                onChange={e =>
                  handleTextAnswerChange(currentQuestion.id, e.target.value)
                }
                className="focus:ring-primary h-32 w-full resize-none rounded-lg border p-3 focus:ring-2 focus:outline-none"
                placeholder="Type your answer here..."
              />
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => saveAnswer(currentQuestion.id)}
                >
                  Save Answer
                </Button>

                {currentQuestionIndex < allQuestions.length - 1 ? (
                  <Button
                    onClick={() => {
                      saveAnswer(currentQuestion.id);
                      setCurrentQuestionIndex(prev => prev + 1);
                    }}
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button onClick={handleSubmitTest}>Submit Test</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestSessionComponent;
