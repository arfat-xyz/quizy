import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
import React from "react";
export const metadata = metaDataGeneratorForNormalPage(
  "Reset Password - Arfat",
  "Reset your password to regain access to your Arfat account and boost your productivity.",
);
const ResetPasswordPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-70px)] w-full items-center justify-center">
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPasswordPage;
