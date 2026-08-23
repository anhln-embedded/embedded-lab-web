import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "./constants";

export { siteConfig };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function readingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getTagColor(tag: string): string {
  const colors = [
    "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
    "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    "bg-rose-500/15 text-rose-400 border border-rose-500/30",
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getLevelColor(level: string): string {
  switch (level) {
    case "beginner":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "intermediate":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "advanced":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

export function getLevelLabel(level: string): string {
  switch (level) {
    case "beginner":
      return "Cơ bản";
    case "intermediate":
      return "Trung cấp";
    case "advanced":
      return "Nâng cao";
    default:
      return level;
  }
}