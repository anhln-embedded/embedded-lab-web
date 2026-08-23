"use client";

import * as React from "react";
import Link from "next/link";
import { cn, getLevelColor, getLevelLabel } from "@/lib/utils";
import { CourseData } from "@/lib/content";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Clock,
  GitBranch,
  Play,
  Lock,
  ChevronRight,
  CheckCircle2,
  Circle,
  ChevronDown,
  ArrowLeft,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface CourseDetailProps {
  course: CourseData;
}

export function CourseDetail({ course }: CourseDetailProps) {
  const [expandedModules, setExpandedModules] = React.useState<Set<number>>(new Set([0]));
  const [completedLessons, setCompletedLessons] = React.useState<Set<string>>(new Set());

  // Load progress from localStorage
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

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const totalLessons = course.curriculum.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const completedCount = completedLessons.size;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const firstLessonSlug = course.curriculum[0]?.lessons[0]?.slug || "1";

  return (
    <article className="container py-12 md:py-16 max-w-5xl space-y-12">
      {/* Top Nav */}
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors group mb-6"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại danh mục khóa học</span>
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={course.price === "free" ? "success" : "warning"} size="md">
            {course.price === "free" ? "Miễn phí (PTIT)" : "Chuyên đề Nâng cao"}
          </Badge>
          <Badge variant="default" size="md" className={getLevelColor(course.level)}>
            {getLevelLabel(course.level)}
          </Badge>
          {course.tags.map((tag) => (
            <Badge key={tag} variant="default" size="sm" className="font-mono">
              #{tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-display-hero font-bold tracking-tight text-text-primary mb-4">
          {course.title}
        </h1>

        <p className="text-body-large text-text-secondary leading-relaxed mb-8 max-w-3xl">
          {course.description}
        </p>

        <div className="flex flex-wrap items-center gap-6 text-xs text-text-muted mb-8 pt-4 border-t border-border/60">
          <span className="flex items-center gap-1.5 font-medium text-text-secondary">
            <BookOpen className="h-4 w-4 text-accent" />
            {totalLessons} bài giảng thực hành
          </span>
          <span className="flex items-center gap-1.5 font-medium text-text-secondary">
            <Clock className="h-4 w-4 text-accent-amber" />
            {course.duration}
          </span>
          {course.instructor && (
            <span className="flex items-center gap-1.5 font-medium text-text-secondary font-mono">
              <GraduationCap className="h-4 w-4 text-accent-cyan" />
              {course.instructor}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 mb-8 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-text-secondary">Tiến độ học tập của bạn:</span>
            <span className="text-accent font-mono">{progress}%</span>
          </div>
          <div className="h-2.5 bg-bg-code rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-amber rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-text-muted font-mono">
            Đã hoàn thành {completedCount} / {totalLessons} bài học
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button
            variant="pill"
            size="lg"
            className="bg-gradient-to-r from-accent to-accent-hover text-white shadow-md hover:shadow-accent font-semibold px-6"
            asChild
          >
            <Link href={`/courses/${course.slug}/lesson/${firstLessonSlug}`}>
              <Play className="h-4 w-4 mr-2 fill-white" />
              <span>{completedCount > 0 ? "Tiếp tục học" : "Bắt đầu học ngay"}</span>
            </Link>
          </Button>

          {course.githubRepo && (
            <a
              href={course.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-text-secondary hover:text-accent transition-colors rounded-pill border border-border bg-bg-panel hover:bg-bg-elevated"
            >
              <GitBranch className="h-4 w-4 text-accent" />
              <span>GitHub Lab Repository</span>
            </a>
          )}
        </div>
      </div>

      {/* Prerequisites */}
      {course.prerequisites.length > 0 && (
        <section className="p-6 rounded-2xl bg-bg-panel border border-border/80 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-amber" />
            Yêu cầu kiến thức tiên quyết (Prerequisites)
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-text-secondary">
            {course.prerequisites.map((req, idx) => (
              <li key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-elevated border border-border/50">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Curriculum Accordion */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">
            Chương Trình Đào Tạo Chi Tiết
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setExpandedModules(
                expandedModules.size === course.curriculum.length
                  ? new Set()
                  : new Set(course.curriculum.map((_, i) => i))
              )
            }
            className="text-xs text-text-muted hover:text-accent"
          >
            {expandedModules.size === course.curriculum.length ? "Thu gọn tất cả" : "Mở rộng tất cả"}
          </Button>
        </div>

        <div className="space-y-4">
          {course.curriculum.map((mod, moduleIndex) => (
            <Card key={mod.module} variant="bordered" className="overflow-hidden bg-bg-panel">
              {/* Module Header */}
              <button
                onClick={() => toggleModule(moduleIndex)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-bg-elevated/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent-muted text-accent font-mono text-xs font-bold">
                    0{moduleIndex + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-text-primary">{mod.module}</h3>
                    <p className="text-xs text-text-muted">{mod.lessons.length} bài học</p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-text-muted transition-transform duration-200",
                    expandedModules.has(moduleIndex) && "rotate-180 text-accent"
                  )}
                />
              </button>

              {/* Lesson Items */}
              {expandedModules.has(moduleIndex) && (
                <div className="border-t border-border/60 divide-y divide-border/40 bg-bg-elevated/20">
                  {mod.lessons.map((lesson) => {
                    const isCompleted = completedLessons.has(lesson.slug);
                    return (
                      <Link
                        key={lesson.slug}
                        href={`/courses/${course.slug}/lesson/${lesson.slug}`}
                        className="p-3.5 sm:px-6 flex items-center justify-between hover:bg-bg-elevated/60 transition-colors group text-xs"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-text-muted group-hover:text-accent flex-shrink-0" />
                          )}
                          <span className="font-medium text-text-secondary group-hover:text-accent transition-colors truncate">
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 font-mono text-text-muted text-[11px]">
                          <span>{lesson.duration}</span>
                          {lesson.free && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                              Free
                            </span>
                          )}
                          <ChevronRight className="h-3.5 w-3.5 text-text-muted group-hover:text-accent transition-transform group-hover:translate-x-1" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>
    </article>
  );
}