"use client";

import { ResearchPaperList } from "@/components/research/ResearchPaperList";
import { useLanguage } from "@/context/LanguageContext";

export default function ResearchPage() {
  const { dict } = useLanguage();

  return (
    <div className="container py-10 md:py-14 space-y-10">
      {/* 1. HERO SECTION */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
          {dict.research.pageTitle}
        </h1>

        <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-3xl mx-auto">
          {dict.research.pageDesc}
        </p>
      </div>

      {/* 2. MAIN RESEARCH PAPERS HUB */}
      <ResearchPaperList />
    </div>
  );
}
