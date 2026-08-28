"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TUTORIAL_TOPICS, TutorialTopic, TutorialPost } from "@/lib/tutorials-data";
import { TutorialSidebar } from "@/components/tutorials/TutorialSidebar";
import { TutorialTableOfContents } from "@/components/tutorials/TutorialTableOfContents";
import { TutorialMobileNav } from "@/components/tutorials/TutorialMobileNav";
import { CodeSnippetView } from "@/components/ui/CodeSnippetView";
import { ArticleHistoryModal } from "@/components/tutorials/ArticleHistoryModal";
import { TopCVArticleEditor } from "@/components/tutorials/TopCVArticleEditor";
import { markdownToLabHtml, extractHeadingsFromContent } from "@/lib/markdown-importer";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Share2,
  CheckCircle2,
  User,
  Edit3,
  Flame,
  FileCode,
  Home,
  Check,
  Bookmark,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelRight,
  ListTree,
  History,
  Pencil,
  Save,
  Palette,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{
    topicSlug: string;
    postSlug: string;
  }>;
}

export default function TutorialPostDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { user } = useAuth();

  const [topic, setTopic] = useState<TutorialTopic | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Chế độ ẩn/hiện 2 cột bên cạnh để mở rộng không gian đọc bài viết
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // Modal Sửa Bài Viết (TopCV Visual Editor) & Lịch Sử Sửa Đổi
  const [isTopCVEditorOpen, setIsTopCVEditorOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // --- CHẾ ĐỘ SỬA TRỰC TIẾP TẠI CHỖ (LIVE IN-PLACE CLICK-TO-EDIT) ---
  const [isLiveEditMode, setIsLiveEditMode] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");
  const [editableSummary, setEditableSummary] = useState("");
  const [editableContentHtml, setEditableContentHtml] = useState("");
  const [hasLiveChanges, setHasLiveChanges] = useState(false);
  const [isSavingLive, setIsSavingLive] = useState(false);
  const [liveChangeNote, setLiveChangeNote] = useState("");
  const [liveToast, setLiveToast] = useState<string | null>(null);

  // Theo dõi tiến độ cuộn trang (Top Reading Progress Bar)
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đọc cấu hình ẩn/hiện cột từ localStorage nếu có
  useEffect(() => {
    try {
      const savedLeft = localStorage.getItem("embedded_show_left_sidebar");
      const savedRight = localStorage.getItem("embedded_show_right_sidebar");
      if (savedLeft !== null) setShowLeftSidebar(savedLeft === "true");
      if (savedRight !== null) setShowRightSidebar(savedRight === "true");
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleLeftSidebar = () => {
    setShowLeftSidebar((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("embedded_show_left_sidebar", String(next));
      } catch (e) {}
      return next;
    });
  };

  const toggleRightSidebar = () => {
    setShowRightSidebar((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("embedded_show_right_sidebar", String(next));
      } catch (e) {}
      return next;
    });
  };

  const toggleFocusMode = () => {
    const isCurrentlyFocused = !showLeftSidebar && !showRightSidebar;
    if (isCurrentlyFocused) {
      // Mở lại cả 2 cột
      setShowLeftSidebar(true);
      setShowRightSidebar(true);
      try {
        localStorage.setItem("embedded_show_left_sidebar", "true");
        localStorage.setItem("embedded_show_right_sidebar", "true");
      } catch (e) {}
    } else {
      // Ẩn cả 2 cột để mở to tối đa bài viết
      setShowLeftSidebar(false);
      setShowRightSidebar(false);
      try {
        localStorage.setItem("embedded_show_left_sidebar", "false");
        localStorage.setItem("embedded_show_right_sidebar", "false");
      } catch (e) {}
    }
  };

  useEffect(() => {
    async function loadTopic() {
      try {
        const res = await fetch(`/api/tutorials/${resolvedParams.topicSlug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setTopic(json.data);
        } else {
          setTopic(undefined);
        }
      } catch {
        setTopic(undefined);
      } finally {
        setIsLoading(false);
      }
    }
    loadTopic();
  }, [resolvedParams.topicSlug]);

  const currentPostIndex = topic ? topic.posts.findIndex((p) => p.slug === resolvedParams.postSlug) : -1;
  const currentPost = topic && currentPostIndex !== -1 ? topic.posts[currentPostIndex] : null;
  const prevPost = topic && currentPostIndex > 0 ? topic.posts[currentPostIndex - 1] : null;
  const nextPost = topic && currentPostIndex !== -1 && currentPostIndex < topic.posts.length - 1 ? topic.posts[currentPostIndex + 1] : null;

  // Đồng bộ nội dung vào bộ nhớ sửa trực tiếp khi mở bài viết (Luôn gọi Hook ở đầu component)
  useEffect(() => {
    if (currentPost) {
      setEditableTitle(currentPost.title);
      setEditableSummary(currentPost.summary || "");
      setEditableContentHtml(currentPost.contentHtml || "");
      setHasLiveChanges(false);
    }
  }, [currentPost?.slug, currentPost?.updatedAt]);

  const handleSaveLiveChanges = async () => {
    if (!currentPost || !topic) return;
    setIsSavingLive(true);

    try {
      const res = await fetch(`/api/tutorials/${topic.slug}/articles/${currentPost.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editableTitle.trim() || currentPost.title,
          summary: editableSummary.trim(),
          contentHtml: editableContentHtml,
          readTime: currentPost.readTime,
          codeSnippet: currentPost.codeSnippet?.code,
          codeLang: currentPost.codeSnippet?.language,
          codeFilename: currentPost.codeSnippet?.filename,
          changeSummary: liveChangeNote.trim() || `Sửa trực tiếp trên web bởi ${user?.name || "Admin"}`,
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
              }
            : undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.article) {
        const updatedArticle = json.data.article;
        setTopic((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            posts: prev.posts.map((p) =>
              p.slug === updatedArticle.slug
                ? {
                    ...p,
                    title: updatedArticle.title,
                    summary: updatedArticle.summary || "",
                    contentHtml: updatedArticle.contentHtml || "",
                    updatedAt: new Date().toISOString().split("T")[0],
                  }
                : p
            ),
          };
        });
        setHasLiveChanges(false);
        setLiveChangeNote("");
        setLiveToast("Đã lưu trực tiếp bài viết và ghi nhận lịch sử!");
        setTimeout(() => setLiveToast(null), 3000);
      } else {
        alert(json.error || "Không thể lưu bài viết");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi lưu dữ liệu");
    } finally {
      setIsSavingLive(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-24 text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted text-sm font-medium">Đang tải chuyên đề kỹ thuật...</p>
      </div>
    );
  }

  if (!topic || !currentPost) {
    notFound();
  }

  const isAuthorized = user && (user.role === "superadmin" || user.role === "admin");
  const isFocusMode = !showLeftSidebar && !showRightSidebar;

  // Render HTML và trích xuất Headings cho Table of Contents
  const renderedContentHtml = markdownToLabHtml(editableContentHtml || currentPost.contentHtml || "");
  const headings = extractHeadingsFromContent(renderedContentHtml);

  return (
    <div className="relative min-h-screen w-full max-w-full">
      {/* --- TOP READING PROGRESS BAR --- */}
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-accent via-emerald-400 to-accent transition-all duration-150 shadow-sm"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Buttons when Sidebars are collapsed on Desktop */}
      <div className="hidden lg:block">
        {!showLeftSidebar && (
          <button
            type="button"
            onClick={toggleLeftSidebar}
            className="fixed left-4 top-28 z-40 p-2.5 rounded-2xl bg-bg-panel/90 hover:bg-bg-panel border border-border shadow-xl hover:border-accent text-text-muted hover:text-accent backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer group flex items-center gap-2"
            title="Mở lại danh mục bài học (Sidebar Trái)"
          >
            <PanelLeft className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold hidden group-hover:inline-block pr-1">Hiện giáo trình</span>
          </button>
        )}

        {!showRightSidebar && headings.length > 0 && (
          <button
            type="button"
            onClick={toggleRightSidebar}
            className="fixed right-4 top-28 z-40 p-2.5 rounded-2xl bg-bg-panel/90 hover:bg-bg-panel border border-border shadow-xl hover:border-accent text-text-muted hover:text-accent backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer group flex items-center gap-2"
            title="Mở lại mục lục bài viết (Sidebar Phải)"
          >
            <span className="text-xs font-bold hidden group-hover:inline-block pl-1">Hiện mục lục</span>
            <PanelRight className="w-4 h-4 text-accent" />
          </button>
        )}
      </div>

      <div className="container py-6 sm:py-10 max-w-[1600px] mx-auto px-4 sm:px-8 xl:px-12 w-full max-w-full">
        {/* --- TOP BREADCRUMB & READING CONTROLS TOOLBAR --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 select-none">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-text-muted overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
            <Link href="/" className="hover:text-accent flex items-center gap-1.5 flex-shrink-0">
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </Link>
            <span className="flex-shrink-0 text-border">/</span>
            <Link href="/tutorials" className="hover:text-accent flex-shrink-0">
              Chuyên đề kỹ thuật
            </Link>
            <span className="flex-shrink-0 text-border">/</span>
            <Link href={`/tutorials/${topic.slug}`} className="hover:text-accent font-medium text-text-secondary flex-shrink-0">
              {topic.title}
            </Link>
            <span className="flex-shrink-0 text-border">/</span>
            <span className="text-accent font-bold flex-shrink-0 max-w-[280px] sm:max-w-none truncate">
              {currentPost.title}
            </span>
          </nav>

          {/* Desktop Reading Mode Toggle Buttons (Ẩn/Hiện 2 bên để mở rộng bài viết) */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-bg-panel border border-border/80 rounded-2xl shadow-sm backdrop-blur-md flex-shrink-0 self-start md:self-auto">
            {/* Toggle Left Sidebar */}
            <button
              type="button"
              onClick={toggleLeftSidebar}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showLeftSidebar
                  ? "bg-accent/15 text-accent border border-accent/30 shadow-xs"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
              }`}
              title={showLeftSidebar ? "Thu gọn cột Giáo trình bên trái" : "Hiện cột Giáo trình bên trái"}
            >
              <PanelLeft className="w-3.5 h-3.5" />
              <span>{showLeftSidebar ? "Ẩn giáo trình" : "Hiện giáo trình"}</span>
            </button>

            {/* Toggle Right Sidebar TOC */}
            <button
              type="button"
              onClick={toggleRightSidebar}
              disabled={headings.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 ${
                showRightSidebar
                  ? "bg-accent/15 text-accent border border-accent/30 shadow-xs"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
              }`}
              title={showRightSidebar ? "Thu gọn cột Mục lục bên phải" : "Hiện cột Mục lục bên phải"}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>{showRightSidebar ? "Ẩn mục lục" : "Hiện mục lục"}</span>
            </button>

            <span className="w-px h-4 bg-border mx-0.5" />

            {/* Focus Mode (Toggle Both Sidebars) */}
            <button
              type="button"
              onClick={toggleFocusMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isFocusMode
                  ? "bg-gradient-to-r from-accent to-amber-500 text-white shadow-md shadow-accent/20"
                  : "text-text-secondary hover:text-accent hover:bg-bg-elevated"
              }`}
              title="Chế độ đọc tập trung: Ẩn cả 2 cột 2 bên để bài viết mở rộng cực đại"
            >
              {isFocusMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Thu nhỏ lại</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-accent" />
                  <span>Đọc toàn màn hình</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* --- MOBILE NAVIGATION BAR (CURRICULUM DRAWER & TOC) --- */}
        <TutorialMobileNav
          topic={topic}
          currentPostSlug={currentPost.slug}
          headings={headings}
        />

        {/* --- 3-COLUMN LAYOUT (DYNAMIC WIDTH) --- */}
        <div className="flex flex-col lg:flex-row items-start gap-8 xl:gap-10 w-full max-w-full transition-all duration-300">
          {/* 1. LEFT SIDEBAR: TOPIC CURRICULUM */}
          {showLeftSidebar && (
            <TutorialSidebar
              topic={topic}
              currentPostSlug={currentPost.slug}
              onCollapse={toggleLeftSidebar}
            />
          )}

          {/* 2. MAIN READING AREA (EXPANDS 100% WHEN SIDEBARS ARE COLLAPSED) */}
          <main className="flex-1 min-w-0 w-full space-y-8 sm:space-y-10 transition-all duration-300">
            {/* Header Hero Card */}
            <div className="rounded-3xl bg-bg-panel border border-border/80 p-6 sm:p-10 lg:p-12 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none" />

              {/* Meta row */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-text-muted border-b border-border/60 pb-4 sm:pb-5">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-accent/15 text-accent border border-accent/30 shadow-sm">
                    Bài {currentPost.order} / {topic.posts.length}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-accent" />
                    {currentPost.readTime}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    {currentPost.updatedAt}
                  </span>
                </div>

                {isAuthorized && (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Nút Sửa Nhanh Bài Này (Mở Trình Chỉnh Sửa Trực Quan TopCV) */}
                    <button
                      type="button"
                      onClick={() => setIsTopCVEditorOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-accent via-amber-500 to-accent text-white hover:brightness-110 shadow-lg shadow-accent/25 transition-all cursor-pointer hover:scale-105"
                      title="Mở trình chỉnh sửa trực quan bài viết"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Sửa nhanh bài này</span>
                    </button>

                    {/* Nút Bật/Tắt Chế Độ Sửa Trực Tiếp Tại Chỗ */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLiveEditMode((prev) => !prev);
                        if (!isLiveEditMode) {
                          setLiveToast("Đã BẬT Chế độ sửa trực tiếp! Bạn có thể trỏ chuột vào Tiêu đề, Tóm tắt hoặc Bài viết để sửa ngay.");
                          setTimeout(() => setLiveToast(null), 4000);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                        isLiveEditMode
                          ? "bg-amber-500 text-black shadow-amber-500/30 ring-2 ring-amber-400 animate-pulse"
                          : "bg-bg-elevated hover:bg-bg-panel border border-border text-text-secondary hover:text-accent"
                      }`}
                      title="Trỏ chuột vào bất kỳ đoạn nào trên bài viết để gõ sửa trực tiếp"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      <span>{isLiveEditMode ? "⚡ Đang sửa trực tiếp" : "⚡ Sửa tại chỗ"}</span>
                    </button>

                    {/* Nút Xem Lịch Sử Sửa */}
                    <button
                      type="button"
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-bg-panel border border-border text-xs font-semibold text-text-secondary hover:text-accent transition-all cursor-pointer"
                      title="Xem lịch sử các lần chỉnh sửa bài học này"
                    >
                      <History className="w-3.5 h-3.5 text-accent" />
                      <span className="hidden sm:inline">Lịch sử sửa</span>
                    </button>

                    {/* Nút Sửa Toàn Bộ Chuyên Đề */}
                    <Link
                      href={`/admin/tutorials/${topic.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
                      title="Chỉnh sửa cấu trúc toàn bộ chuyên đề"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Sửa chuyên đề</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Toast thông báo chế độ sửa trực tiếp */}
              {liveToast && (
                <div className="p-3.5 rounded-2xl bg-accent/15 border border-accent/40 text-accent text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <span>{liveToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLiveToast(null)}
                    className="p-1 rounded-lg hover:bg-accent/20 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Title - In-Place Editable when Live Edit Mode is Active */}
              <div className="relative group">
                {isLiveEditMode && (
                  <span className="absolute -top-3 left-2 z-10 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Pencil className="w-2.5 h-2.5" />
                    <span>Trỏ vào tiêu đề để sửa</span>
                  </span>
                )}
                <h1
                  contentEditable={isLiveEditMode}
                  suppressContentEditableWarning={true}
                  onInput={(e) => {
                    setEditableTitle(e.currentTarget.innerText);
                    setHasLiveChanges(true);
                  }}
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text-primary leading-[1.25] tracking-tight break-words w-full transition-all ${
                    isLiveEditMode
                      ? "p-3 rounded-2xl bg-amber-500/10 border-2 border-dashed border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-text"
                      : ""
                  }`}
                >
                  {editableTitle || currentPost.title}
                </h1>
              </div>

              {/* Summary Glassmorphism Callout - In-Place Editable */}
              {(editableSummary || currentPost.summary || isLiveEditMode) && (
                <div className="relative group">
                  {isLiveEditMode && (
                    <span className="absolute -top-3 left-2 z-10 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Pencil className="w-2.5 h-2.5" />
                      <span>Trỏ vào tóm tắt để sửa</span>
                    </span>
                  )}
                  <div
                    className={`p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-bg-elevated/90 to-bg-panel border-l-4 border-accent text-sm sm:text-base text-text-secondary leading-relaxed shadow-lg space-y-2 break-words transition-all ${
                      isLiveEditMode
                        ? "border-2 border-dashed border-amber-500/60 bg-amber-500/5 focus-within:ring-2 focus-within:ring-amber-500 cursor-text"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-accent text-xs sm:text-sm uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Tóm Tắt Cốt Lõi Bài Học:</span>
                    </div>
                    <p
                      contentEditable={isLiveEditMode}
                      suppressContentEditableWarning={true}
                      onInput={(e) => {
                        setEditableSummary(e.currentTarget.innerText);
                        setHasLiveChanges(true);
                      }}
                      className={`pt-1 ${isLiveEditMode ? "p-2 rounded-xl bg-bg-panel/70 focus:outline-none" : ""}`}
                    >
                      {editableSummary || currentPost.summary || (isLiveEditMode ? "Nhập tóm tắt cốt lõi bài học tại đây..." : "")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Code Snippet (Nếu có) */}
            {currentPost.codeSnippet && (
              <div className="space-y-3 w-full overflow-hidden">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-accent uppercase tracking-wider px-1">
                  <FileCode className="w-4.5 h-4.5" />
                  <span>Mã Nguồn Mẫu Chuẩn Lab (Source Code)</span>
                </div>
                <CodeSnippetView
                  code={currentPost.codeSnippet.code}
                  language={currentPost.codeSnippet.language}
                  filename={currentPost.codeSnippet.filename}
                />
              </div>
            )}

            {/* Rich HTML / Markdown Content with Table & Image Support - In-Place Editable */}
            {(editableContentHtml || currentPost.contentHtml) && (
              <article className="relative rounded-3xl bg-bg-panel border border-border/80 p-6 sm:p-10 lg:p-12 shadow-2xl space-y-8 overflow-hidden w-full !max-w-none">
                {isLiveEditMode && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold mb-4">
                    <span className="flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Chế độ sửa trực tiếp nội dung đang BẬT: Bạn có thể click chuột vào bất kỳ chữ nào bên dưới để gõ sửa.</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTopCVEditorOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-amber-500 text-black text-[11px] font-extrabold hover:bg-amber-400 transition-all cursor-pointer flex-shrink-0"
                    >
                      Mở trình soạn thảo trực quan
                    </button>
                  </div>
                )}

                <div
                  contentEditable={isLiveEditMode}
                  suppressContentEditableWarning={true}
                  onInput={(e) => {
                    setEditableContentHtml(e.currentTarget.innerHTML);
                    setHasLiveChanges(true);
                  }}
                  className={`prose prose-slate dark:prose-invert !max-w-none w-full text-base sm:text-lg lg:text-[18.5px] text-text-primary leading-[1.85] break-words overflow-hidden transition-all ${
                    isLiveEditMode
                      ? "p-4 rounded-2xl border-2 border-dashed border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-text"
                      : ""
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: renderedContentHtml,
                  }}
                />
              </article>
            )}

            {/* Navigation: Prev / Next Post */}
            <div className="pt-10 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-5 select-none">
              {prevPost ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-auto p-5 rounded-2xl border-border/80 hover:border-accent flex items-start gap-4 text-left transition-all group shadow-sm"
                >
                  <Link href={`/tutorials/${topic.slug}/${prevPost.slug}`}>
                    <ChevronLeft className="w-6 h-6 text-accent flex-shrink-0 mt-0.5 group-hover:-translate-x-1 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                        ← Bài trước đó
                      </span>
                      <span className="text-sm font-bold text-text-primary group-hover:text-accent line-clamp-2">
                        {prevPost.title}
                      </span>
                    </div>
                  </Link>
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}

              {nextPost && (
                <Button
                  asChild
                  variant="primary"
                  className="w-full h-auto p-5 rounded-2xl bg-accent hover:bg-accent-hover text-white flex items-start justify-between gap-4 text-right shadow-2xl group"
                >
                  <Link href={`/tutorials/${topic.slug}/${nextPost.slug}`}>
                    <div className="min-w-0 flex-1 text-left sm:text-right">
                      <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider block mb-1">
                        Bài tiếp theo →
                      </span>
                      <span className="text-sm font-bold text-white line-clamp-2">
                        {nextPost.title}
                      </span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
            </div>
          </main>

          {/* 3. RIGHT SIDEBAR: TABLE OF CONTENTS (ON THIS PAGE) */}
          {showRightSidebar && headings.length > 0 && (
            <TutorialTableOfContents
              headings={headings}
              onCollapse={toggleRightSidebar}
            />
          )}
        </div>
      </div>

      {/* --- ARTICLE EDIT HISTORY & RESTORE MODAL --- */}
      {isAuthorized && currentPost && (
        <ArticleHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          topicSlug={topic.slug}
          postSlug={currentPost.slug}
          onRestored={() => {
            // Tải lại chuyên đề để cập nhật bài viết vừa khôi phục
            fetch(`/api/tutorials/${resolvedParams.topicSlug}`)
              .then((r) => r.json())
              .then((res) => {
                if (res.success && res.data) {
                  setTopic(res.data);
                }
              })
              .catch(console.error);
          }}
        />
      )}

      {/* --- FLOATING LIVE IN-PLACE ACTION BAR --- */}
      {isAuthorized && isLiveEditMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-[92%] bg-bg-panel/95 border-2 border-amber-500/80 backdrop-blur-xl shadow-2xl rounded-3xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                <span>⚡ Đang Ở Chế Độ Sửa Trực Tiếp</span>
                {hasLiveChanges && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Có thay đổi chưa lưu
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-muted hidden sm:block">
                Trỏ chuột vào Tiêu đề, Tóm tắt hoặc Bài viết để gõ sửa trực tiếp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                if (hasLiveChanges && !window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy bỏ các thay đổi không?")) {
                  return;
                }
                if (currentPost) {
                  setEditableTitle(currentPost.title);
                  setEditableSummary(currentPost.summary || "");
                  setEditableContentHtml(currentPost.contentHtml || "");
                }
                setHasLiveChanges(false);
                setIsLiveEditMode(false);
              }}
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all cursor-pointer flex-shrink-0"
            >
              Hủy / Thoát
            </button>

            <button
              type="button"
              disabled={isSavingLive || !hasLiveChanges}
              onClick={handleSaveLiveChanges}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-accent to-amber-500 hover:from-accent-hover hover:to-amber-600 text-white text-xs font-black shadow-lg shadow-accent/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isSavingLive ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi Ngay</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {/* --- TOPCV STYLE VISUAL ARTICLE EDITOR --- */}
      {isAuthorized && currentPost && isTopCVEditorOpen && (
        <TopCVArticleEditor
          topicSlug={topic.slug}
          post={currentPost}
          onClose={() => setIsTopCVEditorOpen(false)}
          onSaved={(updatedPost) => {
            setTopic((prev) => {
              if (!prev) return prev;
              const nextPosts = prev.posts.map((p) =>
                p.slug === updatedPost.slug ? updatedPost : p
              );
              return {
                ...prev,
                posts: nextPosts,
              };
            });
            if (currentPost.slug === updatedPost.slug) {
              setEditableTitle(updatedPost.title);
              setEditableSummary(updatedPost.summary || "");
              setEditableContentHtml(updatedPost.contentHtml || "");
            }
          }}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
        />
      )}
    </div>
  );
}
