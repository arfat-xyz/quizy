import RegisterForm from "@/components/auth/forms/register-form";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
import React from "react";
export const metadata = metaDataGeneratorForNormalPage(
  "Register - Arfat",
  "Create an account on Arfat to start boosting your productivity.",
);
const RegisterPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-70px)] w-full items-center justify-center">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
