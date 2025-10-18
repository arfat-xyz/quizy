import { Button } from "@/components/ui/button";
import { IBackButtonProps } from "@/interfaces/auth";
import Link from "next/link";

export const BackButton = ({ label, href }: IBackButtonProps) => {
  return (
    <Button variant="link" className="w-full font-normal" size="sm" asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
};
