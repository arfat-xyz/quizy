import ReviewTestComponent from "@/components/feature/dashboard/review/ReviewTestComponent";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const ReviewTestPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const allParams = await searchParams;
  const authData = await auth();

  // Check if user is admin
  if (authData?.user?.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }

  const page = Number(allParams?.page) || 1;
  const limit = Number(allParams?.limit) || 10;
  const skip = (page - 1) * limit;

  // Fetch submitted test sessions with related data
  const [submittedSessions, totalCount] = await Promise.all([
    db.userTestSession.findMany({
      where: {
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
            position: {
              select: {
                name: true,
              },
            },
            testGroups: {
              include: {
                group: {
                  include: {
                    questions: {
                      select: {
                        score: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        userAnswers: {
          include: {
            question: {
              select: {
                score: true,
                type: true,
              },
            },
          },
        },
        _count: {
          select: {
            userAnswers: true,
          },
        },
      },
      orderBy: {
        endedAt: "desc",
      },
      skip,
      take: limit,
    }),
    db.userTestSession.count({
      where: {
        submitted: true,
      },
    }),
  ]);

  // Calculate total possible score for each test
  const sessionsWithScores = submittedSessions.map(session => {
    // Calculate total possible score for the test
    const totalPossibleScore = session.test.testGroups.reduce(
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

    // Calculate achieved score percentage
    const achievedPercentage =
      totalPossibleScore > 0
        ? (session.totalScore / totalPossibleScore) * 100
        : 0;

    return {
      ...session,
      totalPossibleScore,
      achievedPercentage,
    };
  });

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <ReviewTestComponent
      submittedSessions={sessionsWithScores}
      currentPage={page}
      limit={limit}
      totalPages={totalPages}
      totalCount={totalCount}
    />
  );
};

export default ReviewTestPage;
