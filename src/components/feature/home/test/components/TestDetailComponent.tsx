"use client";
import { Test, Position, TestGroup, UserTestSession } from "@prisma/client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  AlertCircle,
  Play,
  CalendarClock,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TestWithDetails extends Test {
  position: Position;
  testGroups: (TestGroup & {
    group: {
      name: string;
      questions: {
        id: string;
        text: string;
        type: string;
        score: number;
        choices: {
          id: string;
          text: string;
        }[];
      }[];
    };
  })[];
  assignedTests: {
    id: string;
    assignedAt: Date;
  }[];
}

interface TestDetailComponentProps {
  test: TestWithDetails;
  activeSession: UserTestSession | null;
  userId: string;
}

const TestDetailComponent = ({
  test,
  activeSession,
  userId,
}: TestDetailComponentProps) => {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins !== 1 ? "s" : ""}`;
    }
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  };

  const isTestToday = () => {
    const today = new Date();
    const testDate = new Date(test.date);

    today.setHours(0, 0, 0, 0);
    testDate.setHours(0, 0, 0, 0);

    return testDate.getTime() === today.getTime();
  };

  const isTestExpired = () => {
    const today = new Date();
    const testDate = new Date(test.date);

    today.setHours(0, 0, 0, 0);
    testDate.setHours(0, 0, 0, 0);

    return testDate < today;
  };

  const isTestFuture = () => {
    const today = new Date();
    const testDate = new Date(test.date);

    today.setHours(0, 0, 0, 0);
    testDate.setHours(0, 0, 0, 0);

    return testDate > today;
  };

  const getTotalQuestions = () => {
    return test.testGroups.reduce((total, testGroup) => {
      return total + testGroup.group.questions.length;
    }, 0);
  };

  const getTotalScore = () => {
    return test.testGroups.reduce((total, testGroup) => {
      return (
        total +
        testGroup.group.questions.reduce((groupTotal, question) => {
          return groupTotal + question.score;
        }, 0)
      );
    }, 0);
  };

  const handleStartTest = async () => {
    try {
      // Create a new test session or resume existing one
      const sessionId = activeSession?.id;

      if (sessionId) {
        // Resume existing session
        router.push(`/test/session/${sessionId}`);
      } else {
        // Create new session and redirect
        const response = await fetch("/api/test/session/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testId: test.id,
            userId: userId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          router.push(`/test/session/${data?.data?.sessionId}`);
        } else {
          throw new Error("Failed to start test session");
        }
      }
    } catch (error) {
      console.error("Error starting test:", error);
      alert("Failed to start test. Please try again.");
    }
  };

  const getStatusMessage = () => {
    if (isTestExpired()) {
      return {
        title: "Test Expired",
        message:
          "This test is no longer available as the test date has passed.",
        icon: AlertCircle,
        variant: "destructive" as const,
      };
    } else if (isTestFuture()) {
      const daysUntilTest = Math.ceil(
        (new Date(test.date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return {
        title: "Test Not Available Yet",
        message: `This test will be available on ${formatDate(test.date)}. ${daysUntilTest} day${daysUntilTest !== 1 ? "s" : ""} remaining.`,
        icon: CalendarClock,
        variant: "outline" as const,
      };
    } else {
      return {
        title: "Test Available",
        message:
          "You can now start this test. Make sure you have a stable internet connection and enough time to complete it.",
        icon: CheckCircle,
        variant: "default" as const,
      };
    }
  };

  const status = getStatusMessage();
  const StatusIcon = status.icon;

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {test.name}
          </h1>
          <div className="mb-4 flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              {test.position.name}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-lg">
              {formatTime(test.durationMin)}
            </Badge>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div
                className={`rounded-full p-3 ${
                  status.variant === "destructive"
                    ? "bg-destructive/10 text-destructive"
                    : status.variant === "outline"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                }`}
              >
                <StatusIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold">{status.title}</h3>
                <p className="text-muted-foreground">{status.message}</p>

                {/* Start Button - Only show if test is today and not expired */}
                {isTestToday() && !isTestExpired() && (
                  <div className="mt-4">
                    <Button
                      onClick={handleStartTest}
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <Play className="h-5 w-5" />
                      {activeSession ? "Resume Test" : "Start Test"}
                    </Button>
                    {activeSession && (
                      <p className="text-muted-foreground mt-2 text-sm">
                        You have an ongoing test session. Click to resume.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Test Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Test Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Test Date:</span>
                <span className="font-medium">{formatDate(test.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">
                  {formatTime(test.durationMin)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-medium">{getTotalQuestions()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Score:</span>
                <span className="font-medium">{getTotalScore()} points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned On:</span>
                <span className="font-medium">
                  {new Date(
                    test.assignedTests[0]?.assignedAt,
                  ).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Question Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Question Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {test.testGroups.map(testGroup => (
                  <div
                    key={testGroup.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <h4 className="font-medium">{testGroup.group.name}</h4>
                      <p className="text-muted-foreground text-sm">
                        {testGroup.group.questions.length} question
                        {testGroup.group.questions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {testGroup.group.questions.reduce(
                        (total, q) => total + q.score,
                        0,
                      )}{" "}
                      pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        {isTestToday() && !isTestExpired() && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Test Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    You have {formatTime(test.durationMin)} to complete the test
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    Do not refresh the page or navigate away during the test
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Answer all questions before submitting</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Once submitted, you cannot change your answers</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestDetailComponent;
