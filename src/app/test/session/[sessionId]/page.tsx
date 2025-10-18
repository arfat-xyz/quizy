import TestSessionComponent from "@/components/feature/home/test/session/components/TestSessionComponent";
import { calculateAutoScore } from "@/components/feature/home/test/session/utils/calculate-auto-score";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

interface TestSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

const TestSessionPage = async ({ params }: TestSessionPageProps) => {
  const { sessionId } = await params;
  const authData = await auth();

  if (!authData?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch test session with all related data
  const testSession = await db.userTestSession.findUnique({
    where: {
      id: sessionId,
      userId: authData.user.id,
    },
    include: {
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
  console.log(testSession);
  // Check if test session is submitted or expired
  const now = new Date();
  const endTime = new Date(
    testSession.startedAt.getTime() + testSession.test.durationMin * 60000,
  );

  if (!testSession.submitted && now > endTime) {
    // Auto-submit the test if time is over
    await db.userTestSession.update({
      where: { id: sessionId },
      data: {
        submitted: true,
        endedAt: endTime,
        // Calculate auto scores for MCQ questions
        totalScore: await calculateAutoScore(testSession.id),
      },
    });

    // Refetch the updated session
    const updatedSession = await db.userTestSession.findUnique({
      where: { id: sessionId },
      include: {
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
              include: {
                choices: {
                  orderBy: { index: "asc" },
                },
              },
            },
          },
        },
      },
    });

    return <TestSessionComponent testSession={updatedSession!} />;
  }

  return <TestSessionComponent testSession={testSession} />;
};

export default TestSessionPage;
