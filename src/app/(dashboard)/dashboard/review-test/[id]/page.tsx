import ReviewTestDetailComponent from "@/components/feature/dashboard/review-test/ReviewTestDetailComponent";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

interface ReviewTestDetailPageProps {
  params: Promise<{ id: string }>;
}

const ReviewTestDetailPage = async ({ params }: ReviewTestDetailPageProps) => {
  const { id } = await params;
  const authData = await auth();

  // Check if user is admin
  if (authData?.user?.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }

  // Fetch test session with all details
  const testSession = await db.userTestSession.findUnique({
    where: {
      id: id,
      submitted: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          userName: true,
        },
      },
      test: {
        include: {
          position: true,
          testGroups: {
            include: {
              group: {
                include: {
                  questions: {
                    include: {
                      choices: {
                        orderBy: { index: "asc" },
                      },
                    },
                    orderBy: { createdAt: "asc" },
                  },
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      userAnswers: {
        include: {
          question: {
            include: {
              choices: {
                orderBy: { index: "asc" },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!testSession) {
    notFound();
  }

  // Fetch assigned test status
  const assignedTest = await db.assignedTest.findUnique({
    where: {
      userId_testId: {
        userId: testSession.userId,
        testId: testSession.testId,
      },
    },
    select: {
      status: true,
    },
  });

  // Calculate total possible score
  const totalPossibleScore = testSession.test.testGroups.reduce(
    (total, testGroup) => {
      return (
        total +
        testGroup.group.questions.reduce((groupTotal, question) => {
          return groupTotal + question.score;
        }, 0)
      );
    },
    0,
  );

  return (
    <ReviewTestDetailComponent
      testSession={testSession}
      totalPossibleScore={totalPossibleScore}
      currentStatus={assignedTest?.status || "pending"}
    />
  );
};

export default ReviewTestDetailPage;
