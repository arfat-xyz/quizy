"use client";
import {
  UserTestSession,
  User,
  Test,
  Position,
  UserAnswer,
} from "@prisma/client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GlobalPagination from "@/components/shared/GlobalPagination";
import {
  Calendar,
  Clock,
  User as UserIcon,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface SubmittedSession extends UserTestSession {
  user: Pick<User, "id" | "name" | "email" | "userName">;
  test: Test & {
    position: Pick<Position, "name">;
    testGroups: {
      group: {
        questions: {
          score: number;
          type: string;
        }[];
      };
    }[];
  };
  userAnswers: (UserAnswer & {
    question: {
      score: number;
      type: string;
    };
  })[];
  _count: {
    userAnswers: number;
  };
  totalPossibleScore: number;
  achievedPercentage: number;
}

interface ReviewTestComponentProps {
  submittedSessions: SubmittedSession[];
  currentPage: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

const ReviewTestComponent = ({
  submittedSessions,
  currentPage,
  limit,
  totalPages,
  totalCount,
}: ReviewTestComponentProps) => {
  // const formatDate = (date: Date) => {
  //   return new Date(date).toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //   });
  // };

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

  const getScoreVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    if (percentage >= 40) return "outline";
    return "destructive";
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="h-3 w-3" />;
    if (percentage >= 60) return <CheckCircle className="h-3 w-3" />;
    if (percentage >= 40) return <TrendingDown className="h-3 w-3" />;
    return <XCircle className="h-3 w-3" />;
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Average";
    return "Poor";
  };

  const calculateAnsweredPercentage = (session: SubmittedSession) => {
    const totalQuestions = session.test.testGroups.reduce(
      (total, testGroup) => {
        return total + testGroup.group.questions.length;
      },
      0,
    );

    return totalQuestions > 0
      ? Math.round((session._count.userAnswers / totalQuestions) * 100)
      : 0;
  };

  if (submittedSessions.length === 0) {
    return (
      <div className="bg-background min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
              <FileText className="text-muted-foreground h-12 w-12" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">No Submitted Tests</h1>
            <p className="text-muted-foreground mb-6">
              There are no submitted tests to review at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto grid grid-cols-1 px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Test Results Review
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and evaluate submitted tests
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Submitted Tests</span>
              </div>
              <Badge variant="secondary">
                {totalCount} total submission{totalCount !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Test & Position</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedSessions.map(session => {
                    const scoreVariant = getScoreVariant(
                      session.achievedPercentage,
                    );
                    const scoreIcon = getScoreIcon(session.achievedPercentage);
                    const scoreLabel = getScoreLabel(
                      session.achievedPercentage,
                    );
                    const answeredPercentage =
                      calculateAnsweredPercentage(session);

                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                              <UserIcon className="text-primary h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {session.user.name ||
                                  session.user.userName ||
                                  "Unknown User"}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {session.user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {session.test.name}
                            </span>
                            <Badge variant="outline" className="mt-1 w-fit">
                              {session.test.position.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            <span className="text-sm">
                              {formatDateTime(session.endedAt!)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <span className="text-sm">
                              {formatDuration(
                                session.startedAt,
                                session.endedAt,
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-row items-center gap-1">
                            <Badge
                              variant={scoreVariant}
                              className="flex w-fit items-center gap-1"
                            >
                              {scoreIcon}
                              {session.totalScore.toFixed(1)} /{" "}
                              {session.totalPossibleScore}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              {session.achievedPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={scoreVariant}
                            className="flex w-fit items-center gap-1"
                          >
                            <Star className="h-3 w-3" />
                            {scoreLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {session._count.userAnswers} answered
                              </Badge>
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {answeredPercentage}% completed
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/review-test/${session.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Global Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <GlobalPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={limit}
                  limits={[10, 25, 50, 100]}
                  updateUrl={true}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                </Badge>
                <span>Excellent (80%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                </Badge>
                <span>Good (60-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                </Badge>
                <span>Average (40-59%)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-3 w-3" />
                </Badge>
                <span>Poor (Below 40%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-primary text-2xl font-bold">
                  {Math.round(
                    submittedSessions.reduce(
                      (sum, session) => sum + session.achievedPercentage,
                      0,
                    ) / submittedSessions.length,
                  )}
                  %
                </div>
                <div className="text-muted-foreground">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    submittedSessions.filter(
                      session => session.achievedPercentage >= 60,
                    ).length
                  }
                </div>
                <div className="text-muted-foreground">Passing Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {submittedSessions.length}
                </div>
                <div className="text-muted-foreground">Total Evaluated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewTestComponent;
