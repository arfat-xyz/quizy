import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = metaDataGeneratorForNormalPage(
  "Arfat - Empowering Your Productivity",
  "Boost your productivity with Arfat, the ultimate tool for managing tasks and projects efficiently.",
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
        <Toaster
          richColors
          closeButton
          // position="top-right"
          toastOptions={{
            classNames: {
              toast: "!rounded-lg !border !shadow-lg",
              error:
                "!bg-destructive !text-destructive-foreground !border-destructive",
              success: "!bg-primary !text-primary-foreground !border-primary",
              info: "!bg-secondary !text-secondary-foreground !border-secondary",
              warning: "!bg-amber-500 !text-amber-950 !border-amber-600",
              closeButton:
                "!bg-transparent !border-transparent hover:!bg-black/10",
            },
          }}
        />
      </body>
    </html>
  );
}
