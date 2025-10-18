import { HomeNavbar } from "@/components/shared/Navbar";
import { auth } from "@/lib/auth";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
import React, { ReactNode } from "react";
export const metadata = metaDataGeneratorForNormalPage(
  "Arfat - Empowering Your Productivity",
  "Boost your productivity with Arfat, the ultimate tool for managing tasks and projects efficiently.",
);
export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  return (
    <>
      {" "}
      {session?.user?.id ? (
        <HomeNavbar
          isLoggedIn={!!session?.user?.id}
          logoText="Arfat"
          user={{
            name: session?.user?.name as string,
            email: session?.user?.email as string,
            avatar: session?.user?.image as string,
          }}
        />
      ) : (
        <HomeNavbar logoText="Arfat" />
      )}
      <div className="container mx-auto min-h-[calc(100vh-70px)] w-full sm:px-6 md:w-4/5 lg:px-8">
        {children}
      </div>
    </>
  );
}
