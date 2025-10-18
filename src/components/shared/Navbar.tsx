"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Role } from "@prisma/client";

interface NavbarProps {
  logo?: string;
  logoText?: string;
  isLoggedIn?: boolean;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export function HomeNavbar({
  logo,
  logoText = "Logo",
  isLoggedIn = false,
  user,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto w-4/5 px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold"
            >
              {logo ? (
                <Image
                  width={32}
                  height={32}
                  src={logo || "/placeholder.svg"}
                  alt="Logo"
                  className="h-8 w-8"
                />
              ) : (
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold">
                  {logoText.charAt(0)}
                </div>
              )}
              <span className="hidden sm:inline">{logoText}</span>
            </Link>
          </div>

          {/* Right side - User or Auth buttons */}
          <div className="flex items-center gap-4">
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 transition-colors">
                    {user.avatar ? (
                      <Image
                        width={32}
                        height={32}
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                        {user.name.charAt(0) || "AR"}
                      </div>
                    )}
                    <span className="hidden text-sm font-medium sm:inline">
                      {user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {user && user?.role === Role.ADMIN && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      if (user?.email) {
                        signOut();
                      }
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href={`/auth/login`}>Login</Link> /
                <Link href={`/auth/register`}>Register</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              title="Munu"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-muted rounded-md p-2 transition-colors md:hidden"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="space-y-2 pb-4 md:hidden">
            {!isLoggedIn && (
              <div className="border-border flex gap-2 border-t pt-4">
                <Link href={`/auth/login`}>Login</Link> /
                <Link href={`/auth/register`}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
