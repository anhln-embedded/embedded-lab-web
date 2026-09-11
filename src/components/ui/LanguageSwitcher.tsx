"use client";

import * as React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "pill" | "icon" | "mobile";
  className?: string;
}

export function LanguageSwitcher({ variant = "pill", className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("h-8 w-20 rounded-full bg-bg-elevated/50 animate-pulse", className)} />
    );
  }

  // Mobile Drawer Full-Width Variant
  if (variant === "mobile") {
    return (
      <div className={cn("p-3 rounded-2xl bg-bg-elevated/70 border border-border/80 space-y-2", className)}>
        <div className="flex items-center justify-between text-xs font-semibold text-text-muted px-1">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-accent" />
            <span>Ngôn ngữ / Language</span>
          </span>
          <span className="font-mono text-[10px] uppercase font-bold text-accent">
            {locale === "vi" ? "Tiếng Việt" : "English"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-bg-panel border border-border">
          <button
            type="button"
            onClick={() => setLocale("vi")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
              locale === "vi"
                ? "bg-accent text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            )}
          >
            <span>🇻🇳</span>
            <span>Tiếng Việt</span>
          </button>

          <button
            type="button"
            onClick={() => setLocale("en")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
              locale === "en"
                ? "bg-accent text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            )}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop Header Pill Segmented Switcher
  return (
    <div
      className={cn(
        "relative flex items-center p-0.5 rounded-full border border-border/90 bg-white/80 dark:bg-bg-elevated/90 shadow-xs backdrop-blur-md transition-colors",
        className
      )}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLocale("vi")}
        aria-pressed={locale === "vi"}
        title="Chuyển sang Tiếng Việt"
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all duration-200 cursor-pointer select-none",
          locale === "vi"
            ? "bg-accent text-white shadow-sm shadow-accent/20 scale-102"
            : "text-text-muted hover:text-text-primary"
        )}
      >
        <span className="text-xs">🇻🇳</span>
        <span>VI</span>
      </button>

      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        title="Switch to English"
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all duration-200 cursor-pointer select-none",
          locale === "en"
            ? "bg-accent text-white shadow-sm shadow-accent/20 scale-102"
            : "text-text-muted hover:text-text-primary"
        )}
      >
        <span className="text-xs">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
