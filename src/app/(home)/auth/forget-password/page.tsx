import { ForgotPasswordForm } from "@/components/auth/forget-password-form";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
import React from "react";
export const metadata = metaDataGeneratorForNormalPage(
  "Forget Password - Arfat",
  "Reset your password to regain access to your Arfat account and boost your productivity.",
);
const ForgetPasswordPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-70px)] w-full items-center justify-center">
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgetPasswordPage;
