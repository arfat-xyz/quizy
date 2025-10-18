import TestDetailComponent from "@/components/feature/home/test/components/TestDetailComponent";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

interface TestPageProps {
  params: Promise<{ id: string }>;
}

const TestPage = async ({ params }: TestPageProps) => {
  const { id } = await params;
  const authData = await auth();

  if (!authData?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch test details with related data
  const test = await db.test.findUnique({
    where: {
      id,
      assignedTests: {
        some: {
          userId: authData.user.id,
        },
      },
    },
    include: {
      position: true,
      testGroups: {
        include: {
          group: {
            include: {
              questions: {
                include: {
                  choices: true,
                },
              },
            },
          },
        },
      },
      assignedTests: {
        where: {
          userId: authData.user.id,
        },
      },
    },
  });

  if (!test) {
    notFound();
  }

  // Check if user already has an active test session
  const activeSession = await db.userTestSession.findFirst({
    where: {
      userId: authData.user.id,
      testId: id,
      submitted: false,
      endedAt: null,
    },
  });

  return (
    <TestDetailComponent
      test={test}
      activeSession={activeSession}
      userId={authData.user.id}
    />
  );
};

export default TestPage;
