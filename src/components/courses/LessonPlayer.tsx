"use client";

import * as React from "react";
import Link from "next/link";
import { CourseData, LessonData } from "@/lib/content";
import { safeStorage } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { InlineLessonEditorModal } from "./InlineLessonEditorModal";
import { CourseTableOfContents } from "./CourseTableOfContents";
import { ReadingRewardTracker } from "@/components/gamification/ReadingRewardTracker";
import { extractHeadingsFromContent } from "@/lib/markdown-importer";
import { renderAllMermaidDiagrams } from "@/components/ui/MermaidInitializer";
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
  ExternalLink,
  PanelRightClose,
  PanelRightOpen,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  ListTree,
  Search,
  GraduationCap,
  Zap,
  Home,
  Languages,
} from "lucide-react";
import { parseVideoSource } from "@/lib/video-parser";
import { useLanguage } from "@/context/LanguageContext";

interface LessonPlayerProps {
  course: CourseData;
  currentLesson: LessonData & {
    moduleTitle: string;
    moduleTitleEn?: string;
    contentHtml?: string;
    contentHtmlEn?: string;
    contentMarkdown?: string;
    contentMarkdownEn?: string;
    videoUrl?: string;
    codeSnippet?: string;
  };
  allLessons: Array<LessonData & { moduleTitle: string; moduleTitleEn?: string }>;
  currentIndex: number;
  prevLesson: (LessonData & { moduleTitle: string; moduleTitleEn?: string }) | null;
  nextLesson: (LessonData & { moduleTitle: string; moduleTitleEn?: string }) | null;
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
      moduleTitleEn?: string;
      contentHtml?: string;
      contentHtmlEn?: string;
      contentMarkdown?: string;
      contentMarkdownEn?: string;
      videoUrl?: string;
      codeSnippet?: string;
    }
  >(currentLesson);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);

  const { locale, toggleLocale } = useLanguage();
  const isEn = locale === "en";

  // Bilingual resolution with graceful fallback
  const displayTitle = (isEn && currentLessonState.titleEn) ? currentLessonState.titleEn : currentLessonState.title;
  const displayCourseTitle = (isEn && courseState.titleEn) ? courseState.titleEn : courseState.title;
  const displayModuleTitle = (isEn && (currentLessonState as any).moduleTitleEn) ? (currentLessonState as any).moduleTitleEn : currentLessonState.moduleTitle;
  const displaySummary = (isEn && currentLessonState.summaryEn) ? currentLessonState.summaryEn : currentLessonState.summary;
  const displayContentHtml = (isEn && currentLessonState.contentHtmlEn) ? currentLessonState.contentHtmlEn : currentLessonState.contentHtml;
  const isFallbackToVi = isEn && !currentLessonState.contentHtmlEn;

  const [completedLessons, setCompletedLessons] = React.useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"video" | "text">("video");
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // 3-Column Reading Controls State
  const [showLeftSidebar, setShowLeftSidebar] = React.useState(true);
  const [showRightSidebar, setShowRightSidebar] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Load sidebars visibility preference on mount
  React.useEffect(() => {
    try {
      const savedLeft = safeStorage.getItem("course_left_sidebar_visible");
      if (savedLeft !== null) {
        setShowLeftSidebar(savedLeft === "true");
      }
      const savedRight = safeStorage.getItem("course_right_sidebar_visible");
      if (savedRight !== null) {
        setShowRightSidebar(savedRight === "true");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleLeftSidebar = () => {
    setShowLeftSidebar((prev) => {
      const next = !prev;
      safeStorage.setItem("course_left_sidebar_visible", String(next));
      return next;
    });
  };

  const toggleRightSidebar = () => {
    setShowRightSidebar((prev) => {
      const next = !prev;
      safeStorage.setItem("course_right_sidebar_visible", String(next));
      return next;
    });
  };

  const isFocusMode = !showLeftSidebar && !showRightSidebar;
  const toggleFocusMode = () => {
    if (isFocusMode) {
      setShowLeftSidebar(true);
      setShowRightSidebar(true);
      safeStorage.setItem("course_left_sidebar_visible", "true");
      safeStorage.setItem("course_right_sidebar_visible", "true");
    } else {
      setShowLeftSidebar(false);
      setShowRightSidebar(false);
      safeStorage.setItem("course_left_sidebar_visible", "false");
      safeStorage.setItem("course_right_sidebar_visible", "false");
    }
  };

  const videoContainerRef = React.useRef<HTMLDivElement>(null);

  const videoSource = parseVideoSource(currentLessonState.videoUrl);
  const hasVideo = currentLessonState.hasVideo !== false && Boolean(videoSource);

  // Extract headings H2, H3 from current lesson HTML for Table of Contents
  const headings = React.useMemo(() => {
    if (!displayContentHtml) return [];
    return extractHeadingsFromContent(displayContentHtml);
  }, [displayContentHtml]);

  // Tự động vẽ sơ đồ thuật toán Mermaid trong nội dung bài học
  React.useEffect(() => {
    if (!displayContentHtml) return;
    const timer = setTimeout(() => {
      renderAllMermaidDiagrams();
    }, 100);
    return () => clearTimeout(timer);
  }, [displayContentHtml]);

  // Fullscreen change listener & Keyboard Shortcuts (F = Fullscreen)
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
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
  const progressPercent = Math.round((completedLessons.size / Math.max(1, allLessons.length)) * 100);

  // Sync props to state if props update
  React.useEffect(() => {
    setCourseState(course);
  }, [course]);

  React.useEffect(() => {
    setCurrentLessonState(currentLesson);
    setIsPlaying(false);
    const lessonHasVideo = currentLesson.hasVideo !== false && Boolean(parseVideoSource(currentLesson.videoUrl));
    setActiveTab(lessonHasVideo ? "video" : "text");
  }, [currentLesson]);

  return (
    <div className="min-h-screen pb-20">
      {/* Gamification Reward Tracker (Automatic +25 EXP upon reading) */}
      <ReadingRewardTracker
        articleId={currentLessonState.slug}
        articleType="lesson"
        title={displayTitle}
      />

      {/* Floating Reopen Buttons when Sidebars are Collapsed */}
      <div className="fixed z-40 flex flex-col gap-2">
        {!showLeftSidebar && (
          <button
            type="button"
            onClick={toggleLeftSidebar}
            className="fixed left-4 top-28 z-40 p-2.5 rounded-2xl bg-bg-panel/90 hover:bg-bg-panel border border-border shadow-xl hover:border-accent text-text-muted hover:text-accent backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer group flex items-center gap-2"
            title={isEn ? "Open Course Curriculum" : "Mở lại giáo trình khóa học"}
          >
            <PanelLeft className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold hidden group-hover:inline-block pr-1">
              {isEn ? "Curriculum" : "Hiện giáo trình"}
            </span>
          </button>
        )}

        {!showRightSidebar && headings.length > 0 && (
          <button
            type="button"
            onClick={toggleRightSidebar}
            className="fixed right-4 top-28 z-40 p-2.5 rounded-2xl bg-bg-panel/90 hover:bg-bg-panel border border-border shadow-xl hover:border-accent text-text-muted hover:text-accent backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer group flex items-center gap-2"
            title={isEn ? "Open Table of Contents" : "Mở lại mục lục bài học"}
          >
            <span className="text-xs font-bold hidden group-hover:inline-block pl-1">
              {isEn ? "TOC" : "Hiện mục lục"}
            </span>
            <ListTree className="w-4 h-4 text-accent" />
          </button>
        )}
      </div>

      {/* Top Breadcrumb & Reading Controls Bar */}
      <div className="bg-bg-panel border-b border-border/80 sticky top-16 z-30 shadow-sm backdrop-blur-md">
        <div className="container py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-text-muted overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-none">
            <Link href="/" className="hover:text-accent flex items-center gap-1.5 flex-shrink-0">
              <Home className="w-3.5 h-3.5" />
              <span>{isEn ? "Home" : "Trang chủ"}</span>
            </Link>
            <span className="flex-shrink-0 text-border">/</span>
            <Link href="/courses" className="hover:text-accent flex-shrink-0">
              {isEn ? "Courses" : "Khóa học"}
            </Link>
            <span className="flex-shrink-0 text-border">/</span>
            <Link
              href={`/courses/${courseState.slug}`}
              className="hover:text-accent font-medium text-text-secondary flex-shrink-0"
            >
              {displayCourseTitle}
            </Link>
            <span className="flex-shrink-0 text-border">/</span>
            <span className="text-accent font-bold flex-shrink-0 max-w-[240px] sm:max-w-none truncate">
              {isEn ? "Lesson" : "Bài"} {currentIndex + 1}: {displayTitle}
            </span>
          </nav>

          {/* Controls Toolbar: Reading Modes, Language, Admin Edit */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Desktop Reading Mode Toggles */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-bg-elevated/70 border border-border/80 rounded-2xl shadow-xs">
              {/* Toggle Left Curriculum */}
              <button
                type="button"
                onClick={toggleLeftSidebar}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showLeftSidebar
                    ? "bg-accent/15 text-accent border border-accent/30 shadow-xs"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
                }`}
                title={showLeftSidebar ? "Thu gọn giáo trình bên trái" : "Hiện giáo trình bên trái"}
              >
                <PanelLeft className="w-3.5 h-3.5" />
                <span>{showLeftSidebar ? (isEn ? "Hide Syllabus" : "Ẩn giáo trình") : (isEn ? "Show Syllabus" : "Hiện giáo trình")}</span>
              </button>

              {/* Toggle Right TOC */}
              <button
                type="button"
                onClick={toggleRightSidebar}
                disabled={headings.length === 0}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 ${
                  showRightSidebar
                    ? "bg-accent/15 text-accent border border-accent/30 shadow-xs"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
                }`}
                title={showRightSidebar ? "Thu gọn mục lục bên phải" : "Hiện mục lục bên phải"}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>{showRightSidebar ? (isEn ? "Hide TOC" : "Ẩn mục lục") : (isEn ? "Show TOC" : "Hiện mục lục")}</span>
              </button>

              <span className="w-px h-3.5 bg-border mx-0.5" />

              {/* Focus Mode */}
              <button
                type="button"
                onClick={toggleFocusMode}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isFocusMode
                    ? "bg-gradient-to-r from-accent to-amber-500 text-white shadow-md shadow-accent/20"
                    : "text-text-secondary hover:text-accent hover:bg-bg-elevated"
                }`}
                title="Chế độ đọc tập trung: Ẩn cả 2 cột để mở rộng bài giảng tối đa"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isFocusMode ? (isEn ? "Exit Focus" : "Thoát tập trung") : (isEn ? "Focus Mode" : "Đọc tập trung")}</span>
              </button>
            </div>

            {/* Quick Language Toggle Button */}
            <button
              onClick={toggleLocale}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all bg-bg-elevated hover:bg-bg-code text-text-secondary hover:text-accent border-border/80 shadow-xs"
              title={isEn ? "Chuyển sang Tiếng Việt" : "Switch to English"}
            >
              <Languages className="w-3.5 h-3.5 text-accent" />
              <span>{isEn ? "🇬🇧 EN" : "🇻🇳 VI"}</span>
            </button>

            {isAuthorized && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsEditorOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEn ? "Edit (Admin)" : "Chỉnh sửa (Admin)"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout Container */}
      <div className="container py-6 sm:py-8 max-w-[1600px] mx-auto px-4 sm:px-8 xl:px-12 w-full max-w-full">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start relative">
          {/* COLUMN 1: Course Curriculum Sidebar (Left Column) */}
          {showLeftSidebar && (
            <aside className="w-full lg:w-80 flex-shrink-0 bg-bg-panel border border-border/80 rounded-3xl p-5 shadow-xl lg:sticky lg:top-28 self-start max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
              {/* Top Action Bar */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <Link
                  href={`/courses/${courseState.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-accent transition-colors group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>{isEn ? "Course Overview" : "Tổng quan khóa học"}</span>
                </Link>

                <button
                  type="button"
                  onClick={toggleLeftSidebar}
                  className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border transition-all cursor-pointer"
                  title="Thu gọn giáo trình"
                >
                  <PanelLeftClose className="w-4 h-4 text-text-muted hover:text-accent" />
                </button>
              </div>

              {/* Course Header Card */}
              <div className="p-3.5 rounded-2xl bg-bg-elevated/70 border border-border/70 flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-bg-panel border border-border shadow-inner flex items-center justify-center text-accent flex-shrink-0 font-bold text-base">
                  📚
                </div>
                <div className="min-w-0 flex-1">
                  <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 text-[10px] font-mono font-bold uppercase tracking-wider inline-block mb-1">
                    {courseState.category || "Embedded"}
                  </span>
                  <h2 className="text-xs sm:text-sm font-extrabold text-text-primary line-clamp-2 leading-tight">
                    {displayCourseTitle}
                  </h2>
                </div>
              </div>

              {/* Learning Progress Bar */}
              <div className="p-3.5 rounded-2xl bg-bg-elevated/40 border border-border/60 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-secondary flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-accent" />
                    <span>{isEn ? "Course Progress" : "Tiến độ học tập"}</span>
                  </span>
                  <span className="font-mono font-bold text-accent text-xs">
                    {completedLessons.size}/{allLessons.length} {isEn ? "lessons" : "bài"} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.max(4, progressPercent)}%` }}
                  />
                </div>
              </div>

              {/* Search Box */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isEn ? "Search lessons in course..." : "Tìm bài học trong khóa..."}
                  className="w-full pl-9 pr-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Modules & Lessons List */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                {courseState.curriculum.map((mod, mIdx) => {
                  const filteredModuleLessons = mod.lessons.filter((l) => {
                    if (!searchTerm.trim()) return true;
                    const query = searchTerm.toLowerCase();
                    return (
                      l.title.toLowerCase().includes(query) ||
                      (l.titleEn && l.titleEn.toLowerCase().includes(query))
                    );
                  });

                  if (filteredModuleLessons.length === 0 && searchTerm.trim()) {
                    return null;
                  }

                  return (
                    <div key={mIdx} className="space-y-1.5">
                      <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block px-1">
                        {(isEn && (mod as any).moduleEn) ? (mod as any).moduleEn : mod.module}
                      </span>
                      <div className="space-y-1">
                        {filteredModuleLessons.map((lesson, lIdx) => {
                          const isCurrent = lesson.slug === currentLessonState.slug;
                          const isCompleted = completedLessons.has(lesson.slug);
                          const lessonHasVideo = lesson.hasVideo !== false && Boolean(parseVideoSource(lesson.videoUrl));
                          const lessonTitle = (isEn && lesson.titleEn) ? lesson.titleEn : lesson.title;

                          return (
                            <Link
                              key={lesson.slug}
                              href={`/courses/${courseState.slug}/lesson/${lesson.slug}`}
                              className={`group relative flex items-start gap-2.5 p-2 rounded-xl text-xs transition-all ${
                                isCurrent
                                  ? "bg-accent/15 text-accent font-bold border border-accent/40 shadow-md ring-1 ring-accent/30"
                                  : isCompleted
                                  ? "bg-accent/5 hover:bg-accent/10 border border-accent/20 text-text-primary"
                                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent"
                              }`}
                            >
                              {/* Order / Status Badge */}
                              <span
                                className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${
                                  isCompleted
                                    ? "bg-accent text-white shadow-xs"
                                    : isCurrent
                                    ? "bg-accent text-white shadow-md shadow-accent/30 ring-2 ring-accent/20"
                                    : "bg-bg-elevated text-text-muted group-hover:bg-accent/20 group-hover:text-accent border border-border/80"
                                }`}
                              >
                                {isCompleted ? "✓" : (lesson.order || lIdx + 1)}
                              </span>

                              <div className="flex-1 min-w-0 pr-1">
                                <span className={`line-clamp-2 leading-snug ${isCurrent ? "text-accent font-bold" : isCompleted ? "font-semibold" : ""}`}>
                                  {lessonTitle}
                                </span>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-normal">
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-3 h-3 text-accent/80" />
                                    {lesson.duration}
                                  </span>
                                  {lessonHasVideo && (
                                    <span className="text-cyan-400 font-medium">Video</span>
                                  )}
                                  {isCompleted && (
                                    <span className="text-accent font-semibold">✓</span>
                                  )}
                                </div>
                              </div>

                              {isCurrent && (
                                <ChevronRight className="w-3.5 h-3.5 text-accent flex-shrink-0 self-center" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Collapse Button */}
              <div className="pt-3 mt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={toggleLeftSidebar}
                  className="w-full py-2 px-3 rounded-xl bg-bg-elevated/70 hover:bg-bg-elevated border border-border text-text-muted hover:text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <PanelLeftClose className="w-3.5 h-3.5 text-text-muted" />
                  <span>{isEn ? "Hide Syllabus" : "Ẩn giáo trình khóa học"}</span>
                </button>
              </div>
            </aside>
          )}

          {/* COLUMN 2: Main Lesson Canvas (Center Column) */}
          <main className="flex-1 min-w-0 w-full max-w-full space-y-6">
            {/* Top Video Player or Hero Header Card */}
            {hasVideo ? (
              <div
                ref={videoContainerRef}
                className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-black border border-border/80 shadow-2xl group flex flex-col justify-center items-center"
              >
                {isPlaying && videoSource ? (
                  videoSource.isDirectFile ? (
                    <video
                      src={videoSource.embedUrl}
                      controls
                      autoPlay
                      className="w-full h-full"
                    />
                  ) : (
                    <iframe
                      src={videoSource.embedUrl}
                      title={currentLessonState.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  )
                ) : (
                  <div
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-gradient-to-t from-black/90 via-black/50 to-black/30 group-hover:via-black/40 transition-all p-6 text-center"
                  >
                    <button
                      type="button"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-accent-hover transition-all duration-300 ring-8 ring-accent/20 cursor-pointer"
                      title="Phát video bài giảng"
                    >
                      <Play className="h-8 w-8 ml-1 fill-white" />
                    </button>
                    <div className="mt-4 max-w-md space-y-1">
                      <h3 className="text-white font-bold text-base sm:text-lg line-clamp-2 drop-shadow-md">
                        {displayTitle}
                      </h3>
                      <p className="text-xs text-text-muted flex items-center justify-center gap-2 pt-1">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>Thời lượng: {currentLessonState.duration}</span>
                        {videoSource && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">
                              ▶ Bấm để phát video ({videoSource.providerName})
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-bg-panel via-bg-elevated to-bg-code border border-border/80 p-6 sm:p-8 shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-sm">
                      <BookOpen className="w-3.5 h-3.5" />
                      {isEn ? "Theory & Practical Reading" : "Bài Đọc Lý Thuyết & Thực Hành"}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-accent bg-accent/10 border border-accent/20 inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {isEn ? "Reading time:" : "Thời lượng đọc:"} {currentLessonState.duration || "15 phút"}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">
                    {displayTitle}
                  </h2>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
                    {displaySummary || (isEn ? "This lesson is compiled as deep-dive technical documentation, schematic diagrams and sample source code below." : "Bài học này được biên soạn dưới dạng tài liệu giáo trình kỹ thuật chuyên sâu, sơ đồ mạch và mã nguồn mẫu bên dưới.")}
                  </p>

                  <div className="pt-2 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        setActiveTab("text");
                        const el = document.getElementById("lesson-content-area");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 hover:scale-102 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{isEn ? "Read Theory Content" : "Đọc nội dung lý thuyết"}</span>
                    </button>

                    <button
                      onClick={() => toggleComplete(currentLessonState.slug)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                        isCurrentCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                          : "bg-bg-panel hover:bg-bg-elevated border border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCurrentCompleted ? (isEn ? "Completed" : "Đã hoàn thành") : (isEn ? "Mark as Done" : "Đánh dấu hoàn thành")}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Lesson Controls Bar */}
            <div className="p-4 sm:p-6 rounded-2xl md:rounded-3xl bg-bg-panel border border-border/80 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-1 font-medium">
                    <span>{displayModuleTitle}</span>
                    <span>•</span>
                    <span className="text-accent font-semibold">{isEn ? "Lesson" : "Bài"} {currentIndex + 1}</span>
                  </div>
                  <h1 className="text-base sm:text-xl font-extrabold text-text-primary leading-snug">
                    {displayTitle}
                  </h1>
                </div>

                {/* Completion Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleComplete(currentLessonState.slug)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                      isCurrentCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                        : "bg-accent hover:bg-accent-hover text-white hover:scale-102"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isCurrentCompleted ? (isEn ? "✓ Lesson Completed" : "✓ Đã hoàn thành bài học") : (isEn ? "Mark as Done" : "Đánh dấu hoàn thành")}</span>
                  </button>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {hasVideo && (
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
                )}
                <button
                  onClick={() => setActiveTab("text")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === "text"
                      ? "bg-accent text-white shadow-sm"
                      : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{hasVideo ? (isEn ? "Theory & Syllabus" : "Lý Thuyết & Giáo Trình") : (isEn ? "Comprehensive Syllabus" : "Giáo Trình Lý Thuyết & Thực Hành")}</span>
                </button>
                {!hasVideo && currentLessonState.codeSnippet && (
                  <button
                    onClick={() => setActiveTab("video")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === "video"
                        ? "bg-accent text-white shadow-sm"
                        : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{isEn ? "Source Code" : "Mã C/C++ Mẫu"}</span>
                  </button>
                )}
              </div>

              {/* Fallback Notice if English is not yet translated */}
              {isFallbackToVi && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2.5 shadow-sm">
                  <Languages className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>English version note:</strong> The English translation for this lesson is currently in progress. Displaying the original Vietnamese document below.
                  </span>
                </div>
              )}

              {/* Lesson Summary */}
              {displaySummary && (
                <div className="p-4 rounded-xl bg-accent-muted/40 border border-accent/20 text-xs text-text-secondary leading-relaxed space-y-1">
                  <strong className="text-text-primary font-bold block mb-1">
                    📌 {isEn ? "Lesson Summary & Key Objectives:" : "Tóm tắt trọng tâm bài học:"}
                  </strong>
                  <p>{displaySummary}</p>
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
                    title={isEn ? "Sample Firmware Implementation (C/C++)" : "Mã nguồn mẫu thực hành (C/C++ Source Code)"}
                  />
                )}

                {/* Terminal Guide Box */}
                <div className="p-4 rounded-xl bg-slate-950 dark:bg-black border border-slate-800 text-xs font-mono text-cyan-400 space-y-1.5 shadow-inner">
                  <p className="text-slate-400">// {isEn ? "Terminal commands to flash and test firmware:" : "Lệnh nạp và kiểm tra mã nguồn mẫu trên terminal:"}</p>
                  <p className="text-emerald-400">$ git clone {courseState.githubRepo || "https://github.com/embedded-aiot-ptit"}</p>
                  <p className="text-emerald-400">$ cd {courseState.slug}/lesson-{currentIndex + 1}</p>
                  <p className="text-emerald-400">$ make build && make flash</p>
                </div>
              </div>
            )}

            {/* Tab: Theory HTML Content */}
            {activeTab === "text" && (
              <div id="lesson-content-area" className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-bg-panel border border-border/80 shadow-md space-y-6 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                    <BookOpen className="w-4 h-4" />
                    <span>{isEn ? "Theoretical Syllabus & System Architecture" : "Giáo Trình Lý Thuyết & Kiến Trúc Hệ Thống"}</span>
                  </div>
                  {isAuthorized && (
                    <button
                      onClick={() => setIsEditorOpen(true)}
                      className="text-xs text-amber-500 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEn ? "Edit this lesson" : "Sửa nội dung này"}</span>
                    </button>
                  )}
                </div>

                {displayContentHtml ? (
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-text-primary leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: displayContentHtml }}
                  />
                ) : (
                  <div className="p-8 text-center space-y-3 rounded-2xl bg-bg-elevated/40 border border-dashed border-border">
                    <BookOpen className="w-8 h-8 text-text-muted mx-auto" />
                    <p className="text-xs text-text-muted">
                      {isEn ? "No theory text available for this lesson yet." : "Chưa có bài viết lý thuyết chi tiết cho bài học này."}
                    </p>
                    {isAuthorized && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditorOpen(true)}
                        className="text-xs text-amber-500 border-amber-500/40 hover:bg-amber-500/10"
                      >
                        + {isEn ? "Write theory now (Admin)" : "Soạn thảo lý thuyết ngay (Admin)"}
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
                  <span className="line-clamp-1">
                    {isEn ? "Previous:" : "Bài trước:"} {(isEn && prevLesson.titleEn) ? prevLesson.titleEn : prevLesson.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/courses/${courseState.slug}/lesson/${nextLesson.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-bold transition-all shadow-md hover:scale-102"
                >
                  <span className="line-clamp-1">
                    {isEn ? "Next:" : "Bài tiếp theo:"} {(isEn && nextLesson.titleEn) ? nextLesson.titleEn : nextLesson.title}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href={`/courses/${courseState.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-bold transition-all shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isEn ? "Finish Course!" : "Hoàn tất khóa học!"}</span>
                </Link>
              )}
            </div>
          </main>

          {/* COLUMN 3: Table of Contents & Rewards (Right Column) */}
          {showRightSidebar && (
            <CourseTableOfContents
              headings={headings}
              onCollapse={toggleRightSidebar}
              isCompleted={isCurrentCompleted}
              earnedExp={25}
              isEn={isEn}
            />
          )}
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
