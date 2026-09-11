"use client";

import { CourseList } from "@/components/courses/CourseList";
import { GraduationCap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function CoursesPage() {
  const { dict } = useLanguage();

  return (
    <div className="container py-12 md:py-16 space-y-12">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent-muted text-accent text-xs font-semibold border border-accent/20">
          <GraduationCap className="h-3.5 w-3.5" />
          {dict.courses.badge}
        </div>
        <h1 className="text-display-hero font-bold tracking-tight text-text-primary">
          {dict.courses.title}
        </h1>
        <p className="text-body-large text-text-secondary leading-relaxed">
          {dict.courses.desc}
        </p>
      </div>

      <CourseList />
    </div>
  );
}