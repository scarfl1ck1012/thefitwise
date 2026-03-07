import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getLocalDate(dateObj = new Date()) {
  return new Date(dateObj).toLocaleDateString("en-CA");
}
