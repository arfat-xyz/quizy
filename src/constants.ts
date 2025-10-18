import { FileText, Settings, Users } from "lucide-react";

export const homeNav = [
  {
    title: "Home",
    url: "/",
    icon: FileText,
  },
  {
    title: "Documentation",
    url: "/docs",
    icon: FileText,
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    items: [
      {
        title: "Account",
        url: "/settings/account",
      },
      {
        title: "Preferences",
        url: "/settings/preferences",
      },
      {
        title: "Billing",
        url: "/settings/billing",
      },
    ],
  },
];
