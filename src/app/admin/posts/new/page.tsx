"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { safeStorage, slugify } from "@/lib/utils";
import { GoogleDocsEditor } from "@/components/editor/GoogleDocsEditor";
import { TechMarkdownEditor } from "@/components/editor/TechMarkdownEditor";
import { PostSettingsDrawer, PostSettingsData } from "@/components/editor/PostSettingsDrawer";
import { PostLivePreviewModal } from "@/components/editor/PostLivePreviewModal";
import { SmartMarkdownImporterModal } from "@/components/tutorials/SmartMarkdownImporterModal";
import { ParsedPost } from "@/lib/markdown-importer";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Sliders,
  Eye,
  FileCode,
  CheckCircle2,
  Code,
  Edit3,
  Clock,
  BookOpen,
  FolderOpen,
  Zap,
  Save,
  Check,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const DEFAULT_MARKDOWN_SAMPLE = `## 1. Giới thiệu & Động lực nghiên cứu
Trình bày bối cảnh, lý do thực hiện nghiên cứu và mục tiêu giải quyết bài toán kỹ thuật tại **Embedded-AIoT Lab**.

## 2. Kiến trúc Hệ thống & Phần Cứng
Mô tả sơ đồ khối, các linh kiện vi điều khiển / IC được sử dụng:
- **Vi điều khiển chính:** STM32H7 / ESP32-S3 / Xilinx FPGA
- **Cảm biến & Ngoại vi giao tiếp:** SPI / I2C / DMA High-Speed
- **Nguồn cấp:** Thiết kế nguồn xung BUCK kép 3.3V và 1.8V cho Core

> [!TIP]
> Luôn thiết kế đường mạch nguồn riêng cho khối Analog và Digital để tránh nhiễu chéo trên bàn đo thực tế.

\`\`\`c filename="hardware_init.c"
// Embedded-AIoT Lab - Hardware Initialization Sample
#include <stdio.h>
#include <stdint.h>

void sys_init(void) {
    printf("Hardware System Initialized!\\n");
}
\`\`\`

## 3. Kết Quả Thực Nghiệm & Đo Đạc
Ghi lại biểu đồ đo đạc xung nhịp, mức độ tiêu thụ điện năng và kết luận nghiên cứu.
`;

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Core Content State (Content-First)
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState(DEFAULT_MARKDOWN_SAMPLE);
  const [editorType, setEditorType] = useState<"markdown" | "wysiwyg">("markdown");

  // Metadata Settings State (Managed in Drawer)
  const [settings, setSettings] = useState<PostSettingsData>({
    slug: "",
    excerpt: "",
    postType: "technical",
    tags: ["embedded", "aiot"],
    coverImage: "/images/logo.png",
    series: "",
    readingTime: 5,
  });

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  // Status & Auto-Save
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động tính số từ và thời lượng đọc
  const wordsCount = (title + " " + content).trim().split(/\s+/).length;
  const calculatedReadingTime = Math.max(1, Math.ceil(wordsCount / 180));

  // Auto-resize tiêu đề
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = "auto";
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
    }
  }, [title]);

  // Tự động cập nhật slug khi đổi tiêu đề nếu người dùng chưa sửa slug thủ công
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = slugify(val);
    setSettings((prev) => ({
      ...prev,
      slug: autoSlug,
    }));
  };

  // Tự động lưu bản nháp vào LocalStorage
  useEffect(() => {
    if (!title && content === DEFAULT_MARKDOWN_SAMPLE) return;

    setAutoSaveStatus("saving");
    const timer = setTimeout(() => {
      try {
        const draftData = {
          title,
          excerpt,
          content,
          settings,
          savedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };
        safeStorage.setItem("lab_post_new_draft", JSON.stringify(draftData));
        setAutoSaveStatus("saved");
        setLastSavedTime(draftData.savedAt);
      } catch (e) {
        console.error("Auto-save draft error:", e);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [title, excerpt, content, settings]);

  // Khôi phục bản nháp khi tải trang
  useEffect(() => {
    try {
      const saved = safeStorage.getItem("lab_post_new_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title || (parsed.content && parsed.content !== DEFAULT_MARKDOWN_SAMPLE)) {
          setTitle(parsed.title || "");
          setExcerpt(parsed.excerpt || "");
          if (parsed.content) setContent(parsed.content);
          if (parsed.settings) setSettings(parsed.settings);
          if (parsed.savedAt) setLastSavedTime(parsed.savedAt);
          setAutoSaveStatus("saved");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Xử lý nạp dữ liệu từ file Markdown
  const handleImportMarkdown = (posts: ParsedPost[]) => {
    if (!posts || posts.length === 0) return;
    const firstPost = posts[0];

    setTitle(firstPost.title);
    if (firstPost.summary) {
      setExcerpt(firstPost.summary);
    }
    setContent(firstPost.contentHtml || "");
    setSettings((prev) => ({
      ...prev,
      slug: firstPost.slug || slugify(firstPost.title),
      excerpt: firstPost.summary || prev.excerpt,
    }));
  };

  // Tự động trích xuất tóm tắt từ nội dung nếu để trống
  const getFinalExcerpt = () => {
    if (excerpt.trim()) return excerpt.trim();
    if (settings.excerpt.trim()) return settings.excerpt.trim();

    // Bóc tách 1-2 câu đầu từ bài viết
    const cleanText = content
      .replace(/<[^>]+>/g, " ")
      .replace(/!\[.*?\]\(.*?\)/g, " ")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/^#+\s+.*$/gm, " ")
      .trim();

    const firstSentence = cleanText.split(/\.\s+/)[0];
    if (firstSentence && firstSentence.length > 20) {
      return firstSentence.length > 220 ? firstSentence.slice(0, 217) + "..." : firstSentence + ".";
    }
    return "Bài viết chia sẻ kỹ thuật và kết quả nghiên cứu tại Embedded-AIoT Lab.";
  };

  // Xử lý Xuất bản bài viết
  const handlePublish = async () => {
    if (!title.trim()) {
      alert("Vui lòng nhập Tiêu đề bài viết trước khi xuất bản.");
      titleTextareaRef.current?.focus();
      return;
    }

    if (!content.trim() || content === "<p><br></p>") {
      alert("Vui lòng nhập Nội dung bài viết.");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalSlug = settings.slug.trim() || slugify(title);
      const finalExcerpt = getFinalExcerpt();

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: finalExcerpt,
        contentHtml: content,
        coverImage: settings.coverImage.trim() || "/images/logo.png",
        postType: settings.postType || "technical",
        tags: settings.tags.length > 0 ? settings.tags.join(",") : "embedded,aiot",
        readingTime: calculatedReadingTime,
        series: settings.series.trim() || undefined,
        featured: true,
        draft: false,
        authorName: user ? user.name : "Embedded-AIoT Lab PTIT",
        authorTitle: user?.role === "superadmin" ? "Super Admin Lab" : "Kỹ sư Lab PTIT",
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi lưu bài viết vào database");
      }

      // Xóa bản nháp sau khi xuất bản thành công
      safeStorage.removeItem("lab_post_new_draft");

      alert("🎉 Đã xuất bản bài viết thành công!");
      router.push(`/blog/${json.data?.slug || finalSlug}`);
    } catch (err: any) {
      console.error(err);
      alert(`Có lỗi xảy ra: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAuthorized = user && (user.role === "superadmin" || user.role === "admin");

  return (
    <div className="min-h-screen bg-bg-canvas text-text-primary flex flex-col pb-20">
      {/* ========================================================================= */}
      {/* 1. STICKY TOP ACTION BAR (Notion / Medium Style)                         */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-bg-panel/95 backdrop-blur-md border-b border-border/80 shadow-xs">
        <div className="container max-w-5xl h-16 flex items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Back Link & Breadcrumb & Auto-save Status */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/posts"
              className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-bg-elevated"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Bài viết</span>
            </Link>

            <span className="text-border hidden sm:inline">/</span>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-text-primary truncate hidden md:inline max-w-[200px]">
                {title.trim() || "Bài viết chưa đặt tên"}
              </span>

              {/* Auto-Save Indicator */}
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono bg-bg-elevated/60 px-2 py-0.5 rounded-full border border-border/60">
                {autoSaveStatus === "saving" ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Đang lưu nháp...</span>
                  </>
                ) : lastSavedTime ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Đã lưu {lastSavedTime}</span>
                  </>
                ) : (
                  <span>Bản nháp mới</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions (Smart Importer, Settings Drawer, Live Preview, Publish Button) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Nút Nạp Nhanh Markdown */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImporterOpen(true)}
              className="text-xs font-bold border-accent/40 text-accent hover:bg-accent/10 flex items-center gap-1.5 rounded-xl h-9"
              title="Nhập nhanh từ File Markdown hoặc Thư mục máy tính"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Nạp Markdown</span>
            </Button>

            {/* Nút Cài Đặt Bài Viết (Settings Drawer) */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs font-semibold text-text-secondary hover:text-text-primary border-border hover:bg-bg-elevated flex items-center gap-1.5 rounded-xl h-9 relative"
            >
              <Sliders className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Cài đặt</span>
              {settings.tags.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-accent absolute -top-0.5 -right-0.5" />
              )}
            </Button>

            {/* Nút Xem Trước Live Preview */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs font-semibold text-text-secondary hover:text-text-primary border-border hover:bg-bg-elevated flex items-center gap-1.5 rounded-xl h-9"
              title="Xem trước bài viết theo góc nhìn người đọc"
            >
              <Eye className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Xem trước</span>
            </Button>

            {/* Nút Xuất Bản Bài Viết (Hero CTA) */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 sm:px-5 h-9 rounded-xl shadow-lg shadow-accent/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang đăng..." : "Xuất Bản"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. ZEN WRITING CANVAS (Clean, Minimalist, Distraction-Free)                */}
      {/* ========================================================================= */}
      <main className="container max-w-4xl px-4 sm:px-8 pt-8 sm:pt-12 flex-1 space-y-8">
        {/* Banner Nhập Nhanh Gợi Ý */}
        {!title && content === DEFAULT_MARKDOWN_SAMPLE && (
          <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0 font-bold">
                ⚡
              </div>
              <div>
                <strong className="text-text-primary block font-bold">
                  Bạn đã có sẵn tài liệu Markdown hoặc Notion?
                </strong>
                <span className="text-text-muted">
                  Bấm Nạp Markdown để hệ thống tự động điền Tiêu đề, Tóm tắt và Code chuẩn Lab trong 1 giây.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsImporterOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent-hover transition-colors flex-shrink-0 cursor-pointer shadow-xs"
            >
              Chọn File .md
            </button>
          </div>
        )}

        {/* Tiêu Đề Bài Viết Lớn (Canvas Title) */}
        <div className="space-y-3">
          <textarea
            ref={titleTextareaRef}
            rows={1}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Tiêu đề bài viết..."
            className="w-full text-2xl sm:text-4xl md:text-5xl font-black text-text-primary bg-transparent border-none outline-none resize-none placeholder:text-text-muted/40 tracking-tight leading-[1.2] p-0"
          />

          {/* Tóm Tắt Ngắn (Excerpt) Tinh Tế */}
          <div className="relative group">
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Thêm tóm tắt ngắn (hoặc hệ thống sẽ tự trích xuất từ 2 câu đầu)..."
              className="w-full text-xs sm:text-sm text-text-secondary bg-transparent border-b border-border/40 focus:border-accent outline-none pb-2 placeholder:text-text-muted/50 placeholder:italic transition-colors"
            />
          </div>

          {/* Quick Info Badges (Type & Tags) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-text-secondary hover:text-text-primary hover:border-accent text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Thể loại:</span>
              <strong className="text-accent">
                {settings.postType === "technical"
                  ? "⚡ Kỹ Thuật"
                  : settings.postType === "daily"
                  ? "🔬 Nhật Ký"
                  : settings.postType === "recruitment"
                  ? "📢 Tuyển Dụng"
                  : settings.postType === "event"
                  ? "🏆 Sự Kiện"
                  : "📌 Thông Báo"}
              </strong>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-text-primary text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Tags ({settings.tags.length}):</span>
              <span className="text-text-primary">{settings.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}</span>
            </button>

            <span className="text-[11px] text-text-muted font-mono ml-auto">
              {wordsCount} từ · ~{calculatedReadingTime} phút đọc
            </span>
          </div>
        </div>

        {/* Trình Soạn Thảo Chuyên Sâu */}
        <div className="space-y-4 pt-2">
          {/* Switcher Mode (Markdown vs WYSIWYG) */}
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Nội Dung Bài Viết</span>
              </span>
            </div>

            <div className="flex items-center bg-bg-panel p-1 rounded-xl border border-border gap-1">
              <button
                type="button"
                onClick={() => setEditorType("markdown")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  editorType === "markdown"
                    ? "bg-accent text-white shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Tech Markdown Pro</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorType("wysiwyg")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  editorType === "wysiwyg"
                    ? "bg-accent text-white shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Google Docs WYSIWYG</span>
              </button>
            </div>
          </div>

          {/* Editor Canvas */}
          {editorType === "markdown" ? (
            <TechMarkdownEditor
              value={content}
              onChange={(val) => setContent(val)}
              draftKey="new_blog_post"
              minHeight="580px"
            />
          ) : (
            <GoogleDocsEditor
              value={content}
              onChange={(html) => setContent(html)}
              onTemplateSelect={(newT, newE) => {
                if (newT && !title) setTitle(newT);
                if (newE && !excerpt) setExcerpt(newE);
              }}
            />
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. MODALS & DRAWERS                                                       */}
      {/* ========================================================================= */}
      {/* Settings Drawer */}
      <PostSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        data={settings}
        onChange={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
        title={title}
      />

      {/* Live Preview Modal */}
      <PostLivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title || "Tiêu đề bài viết"}
        excerpt={getFinalExcerpt()}
        content={content}
        coverImage={settings.coverImage}
        postType={settings.postType}
        tags={settings.tags}
        readingTime={calculatedReadingTime}
        authorName={user?.name || "Admin Lab"}
        authorTitle={user?.role === "superadmin" ? "Super Admin Lab" : "Kỹ sư Lab PTIT"}
        onPublish={handlePublish}
        isSubmitting={isSubmitting}
      />

      {/* Smart Markdown Importer Modal */}
      <SmartMarkdownImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImport={handleImportMarkdown}
      />
    </div>
  );
}
