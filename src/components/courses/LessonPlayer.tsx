"use client";

import * as React from "react";
import Link from "next/link";
import { CourseData, LessonData } from "@/lib/content";
import { safeStorage } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { InlineLessonEditorModal } from "./InlineLessonEditorModal";
import { CodeSnippetView } from "@/components/ui/CodeSnippetView";
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
  Copy,
  Check,
  Video,
  FileText,
  RotateCcw,
  Volume2,
  Maximize2,
  Minimize2,
  Edit3,
} from "lucide-react";

interface LessonPlayerProps {
  course: CourseData;
  currentLesson: LessonData & {
    moduleTitle: string;
    contentHtml?: string;
    videoUrl?: string;
    codeSnippet?: string;
  };
  allLessons: Array<LessonData & { moduleTitle: string }>;
  currentIndex: number;
  prevLesson: (LessonData & { moduleTitle: string }) | null;
  nextLesson: (LessonData & { moduleTitle: string }) | null;
}

function getEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0&fs=1&enablejsapi=1&modestbranding=1`;
  }
  if (url.includes("embed/")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}autoplay=1&fs=1&enablejsapi=1`;
  }
  return null;
}

export function LessonPlayer({
  course,
  currentLesson,
  allLessons,
  currentIndex,
  prevLesson,
  nextLesson,
}: LessonPlayerProps) {
  const { user } = useAuth();
  const isAuthorized = Boolean(user && (user.role === "admin" || user.role === "superadmin"));

  const [courseState, setCourseState] = React.useState<CourseData>(course);
  const [currentLessonState, setCurrentLessonState] = React.useState<
    LessonData & {
      moduleTitle: string;
      contentHtml?: string;
      videoUrl?: string;
      codeSnippet?: string;
    }
  >(currentLesson);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);

  const [completedLessons, setCompletedLessons] = React.useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"video" | "text">("video");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);

  // Sync props to state if props update
  React.useEffect(() => {
    setCourseState(course);
  }, [course]);

  React.useEffect(() => {
    setCurrentLessonState(currentLesson);
    setIsPlaying(false);
  }, [currentLesson]);

  // Fullscreen change listener & Keyboard Shortcuts (F = Fullscreen)
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    const elem = videoContainerRef.current;
    if (!elem) return;

    const isCurrentlyFull = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);

    if (!isCurrentlyFull) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Load completion state from safeStorage
  React.useEffect(() => {
    try {
      const saved = safeStorage.getItem(`course_progress_${courseState.slug}`);
      if (saved) {
        setCompletedLessons(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error(e);
    }
  }, [courseState.slug]);

  // Reset play state when lesson changes
  React.useEffect(() => {
    setIsPlaying(false);
  }, [currentLesson.slug]);

  const toggleComplete = (lessonSlug: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonSlug)) {
        next.delete(lessonSlug);
      } else {
        next.add(lessonSlug);
      }
      try {
        safeStorage.setItem(`course_progress_${course.slug}`, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isCurrentCompleted = completedLessons.has(currentLessonState.slug);
  const progressPercent = Math.round((completedLessons.size / allLessons.length) * 100);

  // Fallback embed video (YouTube tutorial for Embedded C / RTOS if lesson doesn't have a specific video URL)
  const embedUrl = getEmbedUrl(currentLessonState.videoUrl) || "https://www.youtube-nocookie.com/embed/3V9eqskKs00?autoplay=1&rel=0&fs=1&enablejsapi=1";

  return (
    <div className="min-h-screen pb-20">
      {/* Top Breadcrumb Bar */}
      <div className="bg-bg-panel border-b border-border/80 sticky top-16 z-30 shadow-sm backdrop-blur-md">
        <div className="container py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Link
              href={`/courses/${courseState.slug}`}
              className="inline-flex items-center gap-1.5 text-text-muted hover:text-accent transition-colors font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Khóa học: {courseState.title}</span>
            </Link>
            <span className="text-border">•</span>
            <span className="text-accent font-mono font-bold">
              Bài {currentIndex + 1}/{allLessons.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthorized && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsEditorOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa bài học này (Admin)</span>
              </Button>
            )}

            <span className="text-text-muted font-medium">Tiến độ: <strong className="text-accent">{progressPercent}%</strong></span>
            <div className="w-24 h-2 bg-bg-code rounded-full overflow-hidden border border-border/80">
              <div
                className="h-full bg-gradient-to-r from-accent to-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Lesson Player Section */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            {/* Interactive Video Player Box */}
            <div
              ref={videoContainerRef}
              className="relative aspect-video rounded-2xl md:rounded-3xl bg-black border border-border/80 overflow-hidden shadow-2xl group"
            >
              {isPlaying ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={embedUrl}
                    title={currentLessonState.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  />

                  {/* Floating Fullscreen Toggle Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/70 hover:bg-black/95 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg flex items-center gap-1.5 text-xs font-semibold"
                    title={isFullscreen ? "Thu nhỏ (Esc)" : "Toàn màn hình (F)"}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    <span>{isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsPlaying(true)}
                  className="relative w-full h-full bg-gradient-to-br from-bg-panel via-bg-elevated to-bg-code flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none transition-all duration-300 hover:brightness-105"
                >
                  {/* Background Grid Accent */}
                  <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />

                  {/* Play Button Pulsing */}
                  <div className="relative z-10 w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/60 flex items-center justify-center text-accent group-hover:scale-115 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-2xl shadow-accent/30">
                    <Play className="h-9 w-9 fill-current ml-1" />
                  </div>

                  <div className="relative z-10 mt-4 space-y-1.5 max-w-lg">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 inline-block">
                      {currentLessonState.moduleTitle}
                    </span>
                    <h3 className="text-base sm:text-xl font-extrabold text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                      {currentLessonState.title}
                    </h3>
                    <p className="text-xs text-text-muted flex items-center justify-center gap-2 pt-1">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      <span>Thời lượng: {currentLessonState.duration}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">▶ Bấm để phát video bài giảng</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Title, Completion Button & View Modes */}
            <div className="p-6 rounded-2xl bg-bg-panel border border-border/80 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block">
                    {currentLessonState.moduleTitle}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary">
                    {currentLessonState.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {isAuthorized && (
                    <button
                      onClick={() => setIsEditorOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-sm"
                      title="Soạn thảo trực quan không cần viết thẻ HTML"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Chỉnh sửa (Admin)</span>
                    </button>
                  )}

                  <button
                    onClick={() => toggleComplete(currentLessonState.slug)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex-shrink-0 ${
                      isCurrentCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                        : "bg-accent hover:bg-accent-hover text-white hover:scale-102"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isCurrentCompleted ? "✓ Đã hoàn thành bài học" : "Đánh dấu hoàn thành"}</span>
                  </button>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("video")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === "video"
                      ? "bg-accent text-white shadow-sm"
                      : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video & Thực Hành</span>
                </button>
                <button
                  onClick={() => setActiveTab("text")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === "text"
                      ? "bg-accent text-white shadow-sm"
                      : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lý Thuyết & Giáo Trình</span>
                </button>
              </div>

              {/* Lesson Summary */}
              {currentLessonState.summary && (
                <div className="p-4 rounded-xl bg-accent-muted/40 border border-accent/20 text-xs text-text-secondary leading-relaxed space-y-1">
                  <strong className="text-text-primary font-bold block mb-1">📌 Tóm tắt trọng tâm bài học:</strong>
                  <p>{currentLessonState.summary}</p>
                </div>
              )}
            </div>

            {/* Tab: Video & Practice */}
            {activeTab === "video" && (
              <div className="space-y-6">
                {/* Code Snippet Box with Advanced Syntax Highlighting */}
                {currentLessonState.codeSnippet && (
                  <CodeSnippetView
                    code={currentLessonState.codeSnippet}
                    language="c"
                    filename="firmware_main.c"
                    title="Mã nguồn mẫu thực hành (C/C++ Source Code)"
                  />
                )}

                {/* Terminal Guide Box */}
                <div className="p-4 rounded-xl bg-slate-950 dark:bg-black border border-slate-800 text-xs font-mono text-cyan-400 space-y-1.5 shadow-inner">
                  <p className="text-slate-400">// Lệnh nạp và kiểm tra mã nguồn mẫu trên terminal:</p>
                  <p className="text-emerald-400">$ git clone {courseState.githubRepo || "https://github.com/embedded-aiot-ptit"}</p>
                  <p className="text-emerald-400">$ cd {courseState.slug}/lesson-{currentIndex + 1}</p>
                  <p className="text-emerald-400">$ make build && make flash</p>
                </div>
              </div>
            )}

            {/* Tab: Theory HTML Content */}
            {activeTab === "text" && (
              <div className="p-6 md:p-8 rounded-2xl bg-bg-panel border border-border/80 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                    <BookOpen className="w-4 h-4" />
                    <span>Giáo Trình Lý Thuyết & Kiến Trúc Hệ Thống</span>
                  </div>
                  {isAuthorized && (
                    <button
                      onClick={() => setIsEditorOpen(true)}
                      className="text-xs text-amber-500 hover:underline font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Sửa nội dung này
                    </button>
                  )}
                </div>

                {currentLessonState.contentHtml ? (
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-text-primary leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: currentLessonState.contentHtml }}
                  />
                ) : (
                  <div className="p-8 text-center space-y-3 rounded-2xl bg-bg-elevated/40 border border-dashed border-border">
                    <BookOpen className="w-8 h-8 text-text-muted mx-auto" />
                    <p className="text-xs text-text-muted">
                      Chưa có bài viết lý thuyết chi tiết cho bài học này.
                    </p>
                    {isAuthorized && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditorOpen(true)}
                        className="text-xs text-amber-500 border-amber-500/40 hover:bg-amber-500/10"
                      >
                        + Soạn thảo lý thuyết ngay (Admin)
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Navigation: Prev / Next Lesson */}
            <div className="pt-6 border-t border-border/80 flex items-center justify-between gap-4">
              {prevLesson ? (
                <Link
                  href={`/courses/${courseState.slug}/lesson/${prevLesson.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-bg-panel hover:bg-bg-elevated text-text-secondary hover:text-accent hover:border-accent/40 text-xs font-bold transition-all shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="line-clamp-1">Bài trước: {prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/courses/${courseState.slug}/lesson/${nextLesson.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-bold transition-all shadow-md hover:scale-102"
                >
                  <span className="line-clamp-1">Bài tiếp theo: {nextLesson.title}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href={`/courses/${courseState.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-bold transition-all shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Hoàn tất khóa học!</span>
                </Link>
              )}
            </div>
          </div>

          {/* Curriculum Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 p-5 rounded-2xl md:rounded-3xl bg-bg-panel border border-border/80 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent" />
                  Chương trình khóa học
                </h3>
                <span className="text-[11px] text-accent font-mono font-bold">
                  {completedLessons.size}/{allLessons.length} bài
                </span>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {courseState.curriculum.map((mod, mIdx) => (
                  <div key={mIdx} className="space-y-2">
                    <span className="text-[11px] font-bold text-text-muted uppercase block tracking-wider">
                      {mod.module}
                    </span>
                    <div className="space-y-1.5">
                      {mod.lessons.map((lesson) => {
                        const isCurrent = lesson.slug === currentLessonState.slug;
                        const isCompleted = completedLessons.has(lesson.slug);
                        return (
                          <Link
                            key={lesson.slug}
                            href={`/courses/${courseState.slug}/lesson/${lesson.slug}`}
                            className={`p-2.5 rounded-xl text-xs transition-all flex items-center justify-between block ${
                              isCurrent
                                ? "bg-accent text-white font-bold shadow-md shadow-accent/20"
                                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border/60"
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 opacity-40 flex-shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <span className="text-[10px] opacity-75 font-mono flex-shrink-0">
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

      {/* Admin Live Lesson Editor Modal */}
      {isAuthorized && (
        <InlineLessonEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          course={courseState}
          currentLesson={currentLessonState}
          onLessonUpdated={(updatedLesson, updatedCourse) => {
            setCurrentLessonState(updatedLesson);
            setCourseState(updatedCourse);
          }}
        />
      )}
    </div>
  );
}
