import { IFormSuccessProps } from "@/interfaces/auth";
import { BsExclamationCircleFill } from "react-icons/bs";

export const FormError = ({ message }: IFormSuccessProps) => {
  if (!message) return null;
  return (
    <div className="flex items-center space-x-4 rounded-lg bg-red-500/30 p-2 text-red-500">
      <BsExclamationCircleFill className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};
