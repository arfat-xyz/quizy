// app/dashboard/quiz/page.tsx
import QuizComponent from "@/components/feature/dashboard/quiz/components/QuizComponent";
import { db } from "@/lib/db";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
import React from "react";

export const metadata = metaDataGeneratorForNormalPage(
  "Quiz - Arfat",
  "Your Productivity Dashboard on Arfat.",
);

const QuizPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const allParams = await searchParams;
  const page = Number(allParams?.page) || 1;
  const limit = Number(allParams?.limit) || 10;
  const skip = (page - 1) * limit;

  // Fetch data with pagination and relations
  const [quizzes, totalCount, allPositions, allGroups] = await Promise.all([
    db.question.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        group: true,
        choices: true,
      },
    }),
    db.question.count(),
    db.position.findMany(),
    db.group.findMany(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  return (
    <>
      {" "}
      <QuizComponent
        quizzes={quizzes}
        allPositions={allPositions}
        allGroups={allGroups}
        currentPage={page}
        limit={limit}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </>
  );
};

export default QuizPage;
