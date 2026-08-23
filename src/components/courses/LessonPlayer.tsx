"use client";

import * as React from "react";
import Link from "next/link";
import { CourseData, LessonData } from "@/lib/content";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Terminal,
  FileCode,
  Sparkles,
  GitBranch,
  Layers,
} from "lucide-react";

interface LessonPlayerProps {
  course: CourseData;
  currentLesson: LessonData & { moduleTitle: string };
  allLessons: Array<LessonData & { moduleTitle: string }>;
  currentIndex: number;
  prevLesson: (LessonData & { moduleTitle: string }) | null;
  nextLesson: (LessonData & { moduleTitle: string }) | null;
}

export function LessonPlayer({
  course,
  currentLesson,
  allLessons,
  currentIndex,
  prevLesson,
  nextLesson,
}: LessonPlayerProps) {
  const [completedLessons, setCompletedLessons] = React.useState<Set<string>>(new Set());

  // Load completion state from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`course_progress_${course.slug}`);
      if (saved) {
        setCompletedLessons(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error(e);
    }
  }, [course.slug]);

  const toggleComplete = (lessonSlug: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonSlug)) {
        next.delete(lessonSlug);
      } else {
        next.add(lessonSlug);
      }
      try {
        localStorage.setItem(`course_progress_${course.slug}`, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const isCurrentCompleted = completedLessons.has(currentLesson.slug);
  const progressPercent = Math.round((completedLessons.size / allLessons.length) * 100);

  return (
    <div className="min-h-screen pb-20">
      {/* Top Breadcrumb Bar */}
      <div className="bg-bg-panel border-b border-border/80 sticky top-16 z-30">
        <div className="container py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center gap-1 text-text-muted hover:text-accent transition-colors font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Khóa học: {course.title}</span>
            </Link>
            <span className="text-border">•</span>
            <span className="text-text-secondary font-mono">
              Bài {currentIndex + 1}/{allLessons.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-text-muted">Tiến độ: {progressPercent}%</span>
            <div className="w-24 h-2 bg-bg-code rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Lesson Player */}
          <div className="lg:col-span-8 space-y-6">
            {/* Video Player Mockup / Lab Interactive Canvas */}
            <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-bg-panel via-bg-elevated to-bg-code border border-border/80 overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-lg group">
              <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent group-hover:scale-110 transition-transform mb-3 shadow-accent">
                <Play className="h-7 w-7 fill-accent ml-1" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1">
                {currentLesson.title}
              </h3>
              <p className="text-xs text-text-muted max-w-md">
                Video bài giảng thực hành & Mô phỏng Lab (Electronics of PTIT) • Thời lượng: {currentLesson.duration}
              </p>
            </div>

            {/* Lesson Info & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
              <div>
                <span className="text-xs font-mono text-accent uppercase tracking-wider block mb-1">
                  {currentLesson.moduleTitle}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {currentLesson.title}
                </h1>
              </div>

              <button
                onClick={() => toggleComplete(currentLesson.slug)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isCurrentCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-accent text-white hover:bg-accent-hover shadow-sm"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isCurrentCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}</span>
              </button>
            </div>

            {/* Lesson Body Content */}
            <div className="space-y-6 text-text-secondary leading-relaxed text-sm">
              <div className="p-6 rounded-2xl bg-bg-panel border border-border/80 space-y-4">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-accent" />
                  Mục tiêu bài học & Hướng dẫn Lab
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {currentLesson.summary ||
                    "Trong bài học này, bạn sẽ thực hành trực tiếp các khái niệm lập trình và đo kiểm vi mạch với sự hướng dẫn của giảng viên và nhóm nghiên cứu Embedded-AIoT Lab."}
                </p>

                <div className="p-4 rounded-xl bg-bg-code border border-border text-xs font-mono text-emerald-400 space-y-1">
                  <p className="text-text-muted">// Lệnh nạp và kiểm tra mã nguồn mẫu trên terminal:</p>
                  <p>$ git clone {course.githubRepo || "https://github.com/embedded-aiot-ptit"}</p>
                  <p>$ cd {course.slug}/lesson-{currentIndex + 1}</p>
                  <p>$ make build && make flash</p>
                </div>
              </div>
            </div>

            {/* Bottom Nav: Prev / Next Lesson */}
            <div className="pt-6 border-t border-border/80 flex items-center justify-between gap-4">
              {prevLesson ? (
                <Link
                  href={`/courses/${course.slug}/lesson/${prevLesson.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-bg-panel text-text-secondary hover:text-accent hover:border-accent/40 text-xs font-semibold transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Bài trước: {prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/courses/${course.slug}/lesson/${nextLesson.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-semibold transition-all shadow-sm"
                >
                  <span>Bài tiếp theo: {nextLesson.title}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href={`/courses/${course.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Hoàn tất khóa học!</span>
                </Link>
              )}
            </div>
          </div>

          {/* Curriculum Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 p-5 rounded-2xl bg-bg-panel border border-border/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent" />
                  Chương trình khóa học
                </h3>
                <span className="text-[11px] text-text-muted font-mono">
                  {completedLessons.size}/{allLessons.length} bài
                </span>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {course.curriculum.map((mod, mIdx) => (
                  <div key={mIdx} className="space-y-2">
                    <span className="text-[11px] font-bold text-text-muted uppercase block">
                      {mod.module}
                    </span>
                    <div className="space-y-1">
                      {mod.lessons.map((lesson) => {
                        const isCurrent = lesson.slug === currentLesson.slug;
                        const isCompleted = completedLessons.has(lesson.slug);
                        return (
                          <Link
                            key={lesson.slug}
                            href={`/courses/${course.slug}/lesson/${lesson.slug}`}
                            className={`p-2.5 rounded-lg text-xs transition-all flex items-center justify-between block ${
                              isCurrent
                                ? "bg-accent text-white font-semibold shadow-sm"
                                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                              {isCompleted ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 opacity-40 flex-shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <span className="text-[10px] opacity-70 font-mono flex-shrink-0">
                              {lesson.duration}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
