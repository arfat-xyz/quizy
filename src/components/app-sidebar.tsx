"use client";

import * as React from "react";
import { CircleQuestionMark, PaperclipIcon, User2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const staticData = {
  navMain: [
    // {
    //   title: "Playground",
    //   url: "#",
    //   icon: SquareTerminal,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Settings",
    //       url: "/dashboard/settings",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "/dashboard/settings",
    //   icon: SettingsIcon,
    // },
    {
      title: "Trainee",
      url: "/dashboard/trainee",
      icon: User2,
    },
    {
      title: "Quiz",
      url: "/dashboard/quiz",
      icon: CircleQuestionMark,
    },
    {
      title: "Test",
      url: "/dashboard/test",
      icon: PaperclipIcon,
    },
    {
      title: "Review Test",
      url: "/dashboard/review-test",
      icon: PaperclipIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  // Create dynamic user data from session
  const dynamicUserData = {
    user: {
      name: session?.user?.name || "User",
      email: session?.user?.email || "",
      avatar: session?.user?.image || "",
    },
  };

  // Get first letter of name for avatar fallback
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {getInitial(dynamicUserData.user.name)}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {dynamicUserData.user.name}
                  </span>
                  <span className="truncate text-xs">
                    {dynamicUserData.user.email}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={dynamicUserData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
