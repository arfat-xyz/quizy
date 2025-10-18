"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import AuthHeader from "./auth-header";
import { BackButton } from "./back-button";
import { ICardWrapperProps } from "@/interfaces/auth";
import Link from "next/link";

const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  title,
  forgotPasswordHref,
  forgotPasswordLabel = "Forgot your password?",
  footerContent, // Optional custom footer content
}: ICardWrapperProps & { footerContent?: React.ReactNode }) => {
  return (
    <Card className="shadow-md md:w-1/2 xl:w-1/4">
      <CardHeader>
        <AuthHeader label={headerLabel} title={title} />
      </CardHeader>
      <CardContent className="space-y-4">
        {children}

        {/* Forgot Password Link */}
        {forgotPasswordHref && (
          <div className="pt-2 text-right">
            <Link
              href={forgotPasswordHref}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              {forgotPasswordLabel}
            </Link>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        {footerContent}
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
