"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { homeNav } from "@/constants";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  items?: NavItem[];
}

interface NavbarProps {
  logo?: string;
  logoText?: string;
  isLoggedIn?: boolean;
  user?: {
    name: string;
    email: string;
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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title],
    );
  };

  const renderNavItem = (item: NavItem, isMobile = false) => {
    const hasSubItems = item.items && item.items.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const Icon = item.icon;

    if (isMobile) {
      return (
        <div key={item.title}>
          <button
            onClick={() => hasSubItems && toggleExpanded(item.title)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium transition-colors",
              item.isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted",
            )}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              <span>{item.title}</span>
            </div>
            {hasSubItems && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180",
                )}
              />
            )}
          </button>
          {hasSubItems && isExpanded && (
            <div className="mt-1 space-y-1 pl-4">
              {item.items?.map(subItem => (
                <Link
                  key={subItem.title}
                  href={subItem.url}
                  className="text-foreground hover:bg-muted block rounded-md px-4 py-2 text-sm transition-colors"
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Desktop view
    if (hasSubItems) {
      return (
        <div key={item.title} className="group relative">
          <button
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              item.isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <div className="bg-card border-border invisible absolute left-0 z-50 mt-0 w-48 rounded-md border opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
            {item.items?.map(subItem => (
              <Link
                key={subItem.title}
                href={subItem.url}
                className="text-foreground hover:bg-muted block px-4 py-2 text-sm transition-colors first:rounded-t-md last:rounded-b-md"
              >
                {subItem.title}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.url}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          item.isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted",
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{item.title}</span>
      </Link>
    );
  };
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

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 md:flex">
              {homeNav.map(item => renderNavItem(item, false))}
            </div>
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
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
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
            {homeNav.map(item => renderNavItem(item, true))}
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
