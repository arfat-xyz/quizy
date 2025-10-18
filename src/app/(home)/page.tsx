import HomeComponent from "@/components/feature/home/Home/HomeComponent";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";

export const metadata = metaDataGeneratorForNormalPage(
  "Home - Arfat",
  "Welcome to Arfat, your productivity companion.",
);

export default async function Home() {
  const authData = await auth();
  if (!authData?.user?.id) {
    return (
      <main className="">
        <HomeComponent allTestsForUser={[]} />
      </main>
    );
  }

  const allTestsForUser = await db.test.findMany({
    where: {
      assignedTests: {
        some: {
          userId: authData?.user?.id,
        },
      },
    },
    include: {
      testSessions: {
        where: {
          userId: authData?.user?.id,
        },
      },
    },
  });

  return (
    <main className="">
      <HomeComponent allTestsForUser={allTestsForUser || []} />
    </main>
  );
}
