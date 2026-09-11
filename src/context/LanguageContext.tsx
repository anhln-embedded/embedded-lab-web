"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Locale, Dictionary, dictionaries } from "@/locales";
import { safeStorage } from "@/lib/storage";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  dict: Dictionary;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "lab_locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [mounted, setMounted] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    setMounted(true);
    const saved = safeStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "vi") {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    } else {
      // Auto-detect browser language if available, default to vi
      try {
        const browserLang = navigator.language?.toLowerCase() || "";
        if (browserLang.startsWith("en")) {
          // If strictly english browser and no preference saved yet, we could keep vi as primary PTIT site default or en.
          // Let's stick with vi as primary default for PTIT lab.
        }
      } catch {}
      document.documentElement.lang = "vi";
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    safeStorage.setItem(STORAGE_KEY, newLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "vi" ? "en" : "vi");
  }, [locale, setLocale]);

  const dict = useMemo(() => {
    return dictionaries[locale] || dictionaries.vi;
  }, [locale]);

  // Helper function to resolve dot-notated paths e.g. "nav.home" or "home.heroTitlePrefix"
  const t = useCallback(
    (path: string, fallback?: string): string => {
      const keys = path.split(".");
      let current: unknown = dict;

      for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
          current = (current as Record<string, unknown>)[key];
        } else {
          return fallback || path;
        }
      }

      if (typeof current === "string") {
        return current;
      }
      return fallback || path;
    },
    [dict]
  );

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        dict,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
