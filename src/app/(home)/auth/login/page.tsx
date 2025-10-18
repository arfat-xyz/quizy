import LoginForm from "@/components/auth/forms/loginForm";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
import React from "react";
export const metadata = metaDataGeneratorForNormalPage(
  "Login - Arfat",
  "Log in to your Arfat account to start boosting your productivity.",
);
const LoginPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-70px)] w-full items-center justify-center">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
