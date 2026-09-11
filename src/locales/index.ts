import { vi } from "./vi";
import { en } from "./en";

export type Locale = "vi" | "en";
export type Dictionary = typeof vi;

export const dictionaries: Record<Locale, Dictionary> = {
  vi,
  en,
};

export { vi, en };
