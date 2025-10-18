import TestComponent from "@/components/feature/dashboard/test/components/TestComponent";
import { db } from "@/lib/db";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
import { Role } from "@prisma/client";
import React from "react";
export const metadata = metaDataGeneratorForNormalPage(
  "Test - Arfat",
  "Your Productivity Dashboard on Arfat.",
);
const TestPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const allParams = await searchParams;
  const page = Number(allParams?.page) || 1;
  const limit = Number(allParams?.limit) || 10;
  const skip = (page - 1) * limit;

  // Fetch data in parallel for better performance
  const [groups, positions, trainees, tests, totalCount] = await Promise.all([
    // Fetch all groups
    db.group.findMany({
      orderBy: { name: "asc" },
    }),

    // Fetch all positions
    db.position.findMany({
      orderBy: { name: "asc" },
    }),

    // Fetch trainees
    db.user.findMany({
      where: {
        role: Role.TEST,
      },
      orderBy: { name: "asc" },
    }),

    // Fetch tests with pagination and relations
    db.test.findMany({
      include: {
        position: true,
        assignedTests: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        testSessions: {
          select: {
            id: true,
            submitted: true,
            totalScore: true,
          },
        },
        testGroups: {
          include: {
            group: true,
          },
        },
        _count: {
          select: {
            assignedTests: true,
            testSessions: true,
            testGroups: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),

    // Get total count for pagination
    db.test.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <TestComponent
      groups={groups}
      positions={positions}
      trainees={trainees || []}
      tests={tests}
      currentPage={page}
      limit={limit}
      totalPages={totalPages}
      totalCount={totalCount}
    />
  );
};

export default TestPage;
