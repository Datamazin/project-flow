import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(date: string | number | Date) {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) {
    return "";
  }

  const now = new Date();
  const diff = target.getTime() - now.getTime();
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];

  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms || unit === "minute") {
      const value = Math.round(diff / ms);
      return formatter.format(value, unit);
    }
  }

  return formatter.format(0, "minute");
}

export function formatTime(timestamp: string | number | Date) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
