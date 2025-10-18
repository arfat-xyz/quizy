import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const formatDuration = (startedAt: Date, endedAt: Date | null) => {
  if (!endedAt) return "N/A";

  const durationMs =
    new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const durationMins = Math.floor(durationMs / 60000);

  const hours = Math.floor(durationMins / 60);
  const minutes = durationMins % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
