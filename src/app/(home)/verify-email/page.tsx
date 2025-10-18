import VerifyEmailForm from "@/components/auth/forms/verify-email-form";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
import React from "react";
export const metadata = metaDataGeneratorForNormalPage(
  "Verify Your Email - Arfat",
  "Verify your email address to activate your Arfat account and start boosting your productivity.",
);
const VerifyEmailPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-70px)] w-full items-center justify-center">
      <VerifyEmailForm />
    </div>
  );
};

export default VerifyEmailPage;
