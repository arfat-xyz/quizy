import { format } from "date-fns";
export const formatDate = (date: Date) => {
  return format(new Date(date), "MMM dd, yyyy");
};
