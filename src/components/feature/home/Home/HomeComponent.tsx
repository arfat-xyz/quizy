"use client";
import { Test, UserTestSession } from "@prisma/client";
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
import {
  Calendar,
  Clock,
  AlertCircle,
  Play,
  FileText,
  CheckCircle,
} from "lucide-react";

interface TestWithSessions extends Test {
  testSessions?: UserTestSession[];
}

const HomeComponent = ({
  allTestsForUser,
}: {
  allTestsForUser: TestWithSessions[];
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const isTestExpired = (testDate: Date) => {
    const today = new Date();
    const testDateObj = new Date(testDate);
    // Set both dates to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    testDateObj.setHours(0, 0, 0, 0);

    return testDateObj < today;
  };

  const isTestToday = (testDate: Date) => {
    const today = new Date();
    const testDateObj = new Date(testDate);

    return testDateObj.toDateString() === today.toDateString();
  };

  const hasSubmittedSession = (test: TestWithSessions) => {
    return test.testSessions?.some(session => session.submitted) || false;
  };

  const getLatestSession = (test: TestWithSessions) => {
    return test.testSessions
      ?.filter(session => session.submitted)
      ?.sort(
        (a, b) =>
          new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime(),
      )[0];
  };

  const getTestStatus = (test: TestWithSessions) => {
    if (hasSubmittedSession(test)) {
      const latestSession = getLatestSession(test);
      return {
        status: "Completed",
        variant: "default" as const,
        icon: CheckCircle,
        score: latestSession?.totalScore || 0,
      };
    } else if (isTestExpired(test.date)) {
      return {
        status: "Expired",
        variant: "destructive" as const,
        icon: AlertCircle,
        score: null,
      };
    } else if (isTestToday(test.date)) {
      return {
        status: "Available Today",
        variant: "default" as const,
        icon: Play,
        score: null,
      };
    } else {
      return {
        status: "Upcoming",
        variant: "outline" as const,
        icon: Calendar,
        score: null,
      };
    }
  };

  if (allTestsForUser.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                <Calendar className="text-muted-foreground h-12 w-12" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No Tests Assigned</h3>
              <p className="text-muted-foreground">
                {`You don't have any tests assigned to you at the moment. Please
                check back later.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Tests</h1>
          <p className="text-muted-foreground mt-2">
            View and take your assigned tests
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Assigned Tests</span>
              <Badge variant="secondary" className="ml-2">
                {allTestsForUser.length} test
                {allTestsForUser.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTestsForUser.map(test => {
                    const status = getTestStatus(test);
                    const StatusIcon = status.icon;
                    const hasSubmitted = hasSubmittedSession(test);

                    return (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{test.name}</span>
                            <span className="text-muted-foreground text-xs">
                              ID: {test.id.slice(-8)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            {formatDate(test.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            {formatTime(test.durationMin)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={status.variant}
                              className="flex w-fit items-center gap-1"
                            >
                              <StatusIcon className="h-3 w-3" />
                              {status.status}
                            </Badge>
                            {status.score !== null && (
                              <Badge variant="secondary" className="ml-2">
                                {status.score} pts
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {hasSubmitted ? (
                            <Link
                              href={`/test/session/${getLatestSession(test)?.id}`}
                            >
                              <Button
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                View Results
                              </Button>
                            </Link>
                          ) : isTestExpired(test.date) ? (
                            <Button
                              variant="outline"
                              disabled
                              className="text-muted-foreground"
                            >
                              Expired
                            </Button>
                          ) : (
                            <Link href={`/test/${test.id}`}>
                              <Button className="flex items-center gap-2">
                                <Play className="h-4 w-4" />
                                Start Test
                              </Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                </Badge>
                <span>Available Today - Can be taken now</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                </Badge>
                <span>Upcoming - Will be available on the test date</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                </Badge>
                <span>Completed - View your results</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                </Badge>
                <span>Expired - Test date has passed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeComponent;
