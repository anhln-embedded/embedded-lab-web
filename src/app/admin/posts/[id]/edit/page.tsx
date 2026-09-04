"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { slugify } from "@/lib/utils";
import { GoogleDocsEditor } from "@/components/editor/GoogleDocsEditor";
import { TechMarkdownEditor } from "@/components/editor/TechMarkdownEditor";
import { PostSettingsDrawer, PostSettingsData } from "@/components/editor/PostSettingsDrawer";
import { PostLivePreviewModal } from "@/components/editor/PostLivePreviewModal";
import { SmartMarkdownImporterModal } from "@/components/tutorials/SmartMarkdownImporterModal";
import { ParsedPost } from "@/lib/markdown-importer";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Trash2,
  Eye,
  Sliders,
  Code,
  Edit3,
  Clock,
  Zap,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [editorType, setEditorType] = useState<"markdown" | "wysiwyg">("markdown");

  // Core Content State
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  // Metadata Settings State
  const [settings, setSettings] = useState<PostSettingsData>({
    slug: "",
    excerpt: "",
    postType: "technical",
    tags: ["embedded"],
    coverImage: "/images/logo.png",
    series: "",
    readingTime: 5,
  });

  // Drawers & Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = "auto";
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
    }
  }, [title]);

  // Load post details
  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setTitle(p.title || "");
          setExcerpt(p.excerpt || "");
          setContent(p.contentHtml || "");
          setSettings({
            slug: p.slug || "",
            excerpt: p.excerpt || "",
            postType: p.postType || "technical",
            tags: Array.isArray(p.tags)
              ? p.tags
              : typeof p.tags === "string"
              ? p.tags.split(",").map((t: string) => t.trim())
              : ["embedded"],
            coverImage: p.coverImage || "/images/logo.png",
            series: p.series || "",
            readingTime: p.readingTime || 5,
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải bài viết:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (postId) loadPost();
  }, [postId]);

  const wordsCount = (title + " " + content).trim().split(/\s+/).length;
  const calculatedReadingTime = Math.max(1, Math.ceil(wordsCount / 180));

  const handleImportMarkdown = (posts: ParsedPost[]) => {
    if (!posts || posts.length === 0) return;
    const firstPost = posts[0];
    setTitle(firstPost.title);
    if (firstPost.summary) setExcerpt(firstPost.summary);
    setContent(firstPost.contentHtml || "");
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết.");
      titleTextareaRef.current?.focus();
      return;
    }

    if (!content.trim()) {
      alert("Vui lòng nhập nội dung bài viết.");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalSlug = settings.slug.trim() || slugify(title);
      const finalExcerpt = excerpt.trim() || settings.excerpt.trim() || "Bài viết kỹ thuật từ Lab PTIT.";

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: finalExcerpt,
        contentHtml: content,
        coverImage: settings.coverImage.trim() || "/images/logo.png",
        postType: settings.postType || "technical",
        tags: settings.tags.length > 0 ? settings.tags.join(",") : "embedded",
        readingTime: calculatedReadingTime,
        series: settings.series.trim() || undefined,
      };

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi cập nhật bài viết");
      }

      alert("🎉 Cập nhật bài viết thành công!");
      router.push(`/blog/${finalSlug}`);
    } catch (err: any) {
      console.error(err);
      alert(`Có lỗi xảy ra: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi xóa bài viết");
      }
      alert("Đã xóa bài viết thành công!");
      router.push("/admin/posts");
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi khi xóa bài viết: ${err.message}`);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-canvas">
        <div className="flex items-center gap-3 text-text-muted text-sm font-semibold">
          <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Đang tải bài viết...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-canvas text-text-primary flex flex-col pb-20">
      {/* 1. STICKY TOP ACTION BAR */}
      <header className="sticky top-0 z-40 bg-bg-panel/95 backdrop-blur-md border-b border-border/80 shadow-xs">
        <div className="container max-w-5xl h-16 flex items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/posts"
              className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-bg-elevated"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Bài viết</span>
            </Link>

            <span className="text-border hidden sm:inline">/</span>

            <span className="text-xs font-bold text-text-primary truncate hidden md:inline max-w-[200px]">
              Chỉnh sửa: {title.trim() || "Bài viết"}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Xem bài viết hiện tại */}
            {settings.slug && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                asChild
                className="text-xs text-text-muted hover:text-text-primary h-9"
              >
                <Link href={`/blog/${settings.slug}`} target="_blank">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Xem live</span>
                </Link>
              </Button>
            )}

            {/* Nạp Markdown */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImporterOpen(true)}
              className="text-xs font-bold border-accent/40 text-accent hover:bg-accent/10 flex items-center gap-1.5 rounded-xl h-9"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Nạp Markdown</span>
            </Button>

            {/* Cài đặt bài viết */}
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

            {/* Xem trước */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs font-semibold text-text-secondary hover:text-text-primary border-border hover:bg-bg-elevated flex items-center gap-1.5 rounded-xl h-9"
            >
              <Eye className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Xem trước</span>
            </Button>

            {/* Nút Xóa */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
              title="Xóa bài viết"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Lưu Thay Đổi */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 sm:px-5 h-9 rounded-xl shadow-lg shadow-accent/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. ZEN WRITING CANVAS */}
      <main className="container max-w-4xl px-4 sm:px-8 pt-8 sm:pt-12 flex-1 space-y-8">
        <div className="space-y-3">
          <textarea
            ref={titleTextareaRef}
            rows={1}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết..."
            className="w-full text-2xl sm:text-4xl md:text-5xl font-black text-text-primary bg-transparent border-none outline-none resize-none placeholder:text-text-muted/40 tracking-tight leading-[1.2] p-0"
          />

          <div className="relative group">
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Thêm tóm tắt ngắn..."
              className="w-full text-xs sm:text-sm text-text-secondary bg-transparent border-b border-border/40 focus:border-accent outline-none pb-2 placeholder:text-text-muted/50 placeholder:italic transition-colors"
            />
          </div>

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

        {/* Trình Soạn Thảo */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Nội Dung Bài Viết</span>
            </span>

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

          {editorType === "markdown" ? (
            <TechMarkdownEditor
              value={content}
              onChange={(val) => setContent(val)}
              draftKey={`edit_post_${postId}`}
              minHeight="580px"
            />
          ) : (
            <GoogleDocsEditor
              value={content}
              onChange={(html) => setContent(html)}
            />
          )}
        </div>
      </main>

      {/* 3. MODALS */}
      <PostSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        data={settings}
        onChange={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
        title={title}
      />

      <PostLivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title || "Tiêu đề bài viết"}
        excerpt={excerpt || settings.excerpt || "Bài viết kỹ thuật từ Lab PTIT."}
        content={content}
        coverImage={settings.coverImage}
        postType={settings.postType}
        tags={settings.tags}
        readingTime={calculatedReadingTime}
        authorName={user?.name || "Admin Lab"}
        authorTitle={user?.role === "superadmin" ? "Super Admin Lab" : "Kỹ sư Lab PTIT"}
        onPublish={handleUpdate}
        isSubmitting={isSubmitting}
      />

      <SmartMarkdownImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImport={handleImportMarkdown}
      />
    </div>
  );
}
