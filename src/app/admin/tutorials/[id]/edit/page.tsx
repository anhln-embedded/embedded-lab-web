"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { slugify } from "@/lib/utils";
import { TUTORIAL_TOPICS } from "@/lib/tutorials-data";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  CheckCircle2,
  FileCode,
  Edit3,
  Zap,
  Eye,
  Settings,
  ChevronUp,
  ChevronDown,
  Layers,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SmartMarkdownImporterModal } from "@/components/tutorials/SmartMarkdownImporterModal";
import { TechMarkdownEditor } from "@/components/editor/TechMarkdownEditor";
import { LabMDXEditor } from "@/components/editor/LabMDXEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTutorialTopicPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isTopicSettingsOpen, setIsTopicSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useState<Array<{ slug: string; name: string; icon: string }>>([
    { slug: "linux", name: "Embedded Linux", icon: "🐧" },
    { slug: "rtos", name: "Real-Time OS", icon: "⚡" },
    { slug: "automotive", name: "Automotive & EV", icon: "🚗" },
    { slug: "mcu", name: "Microcontrollers", icon: "🎛️" },
    { slug: "programming", name: "Lập Trình C & Kỹ Năng", icon: "💻" },
    { slug: "hardware", name: "Phần Cứng PCB & FPGA", icon: "📐" },
  ]);

  // Topic Metadata
  const [topicId, setTopicId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("linux");
  const [categoryName, setCategoryName] = useState("Embedded Linux");
  const [icon, setIcon] = useState("🐧");
  const [badge, setBadge] = useState("Hot Series");
  const [level, setLevel] = useState("Intermediate");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("Kỹ sư Lab PTIT");
  const [authorTitle, setAuthorTitle] = useState("Mentor Lab");
  const [coverImage, setCoverImage] = useState("/images/logo.png");

  // Articles List
  const [posts, setPosts] = useState<
    Array<{
      id?: string;
      title: string;
      slug: string;
      readTime: string;
      summary: string;
      contentHtml: string;
      codeSnippet: string;
      codeLang: string;
      codeFilename: string;
      draft: boolean;
    }>
  >([]);

  // Selected Article Index for editing
  const [selectedPostIdx, setSelectedPostIdx] = useState(0);
  const [editorMode, setEditorMode] = useState<"split" | "mdx">("split");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopic() {
      try {
        // Load categories
        try {
          const catRes = await fetch("/api/tutorials/categories");
          const catJson = await catRes.json();
          if (catJson.success && Array.isArray(catJson.data) && catJson.data.length > 0) {
            setCategories(catJson.data);
          }
        } catch (e) {
          console.error(e);
        }

        const res = await fetch(`/api/tutorials/${resolvedParams.id}`);
        const json = await res.json();
        if (json.success && json.data) {
          const t = json.data;
          setTopicId(t.id || t.slug);
          setTitle(t.title);
          setSlug(t.slug);
          setCategory(t.category);
          setCategoryName(t.categoryName);
          setIcon(t.icon);
          setBadge(t.badge || "Hot Series");
          setLevel(t.level);
          setDescription(t.description);
          setAuthor(t.author);
          setAuthorTitle(t.authorTitle || "Mentor Lab");
          setCoverImage(t.coverImage || "/images/logo.png");
          setPosts(
            t.posts.map((p: any) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              readTime: p.readTime || "10 phút",
              summary: p.summary || "",
              contentHtml: p.contentHtml || "",
              codeSnippet: p.codeSnippet?.code || p.codeSnippet || "",
              codeLang: p.codeSnippet?.language || "c",
              codeFilename: p.codeSnippet?.filename || "main.c",
              draft: Boolean(p.draft),
            }))
          );
        } else {
          // Không tìm thấy chuyên đề trên máy chủ
          setTopicId("");
          setPosts([]);
        }
      } catch {
        setTopicId("");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadTopic();
  }, [resolvedParams.id]);

  const handleAddPost = () => {
    const nextIdx = posts.length + 1;
    const newPost = {
      title: `Bài ${nextIdx}: Tiêu đề bài viết mới`,
      slug: `bai-${nextIdx}-tieu-de-bai-viet-moi`,
      readTime: "10 phút",
      summary: "Mô tả tóm tắt nội dung bài học...",
      contentHtml: `## 🎯 1. Mục tiêu bài học\nNêu rõ kiến thức và kỹ năng cần đạt được.\n\n## 2. Lý thuyết trọng tâm\nPhân tích nguyên lý và thanh ghi vi điều khiển...`,
      codeSnippet: `// Embedded-AIoT Lab - C Sample Code\n#include <stdio.h>\n\nvoid app_main(void) {\n    printf("Embedded System Ready!\\n");\n}`,
      codeLang: "c",
      codeFilename: "main.c",
      draft: false,
    };
    setPosts([...posts, newPost]);
    setSelectedPostIdx(posts.length);
  };

  const handleRemovePost = async (idx: number) => {
    if (posts.length <= 1) {
      alert("Chuyên đề cần có ít nhất 1 bài viết.");
      return;
    }
    const targetPost = posts[idx];
    if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn bài học "${targetPost.title}" khỏi cơ sở dữ liệu?`)) return;

    const updated = posts.filter((_, i) => i !== idx);
    setPosts(updated);
    if (selectedPostIdx >= updated.length) {
      setSelectedPostIdx(Math.max(0, updated.length - 1));
    }

    // Tự động lưu & đồng bộ xóa ngay lập tức lên cơ sở dữ liệu
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/tutorials/${topicId || slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          category,
          categoryName,
          icon,
          badge,
          level,
          description,
          author,
          authorTitle,
          coverImage,
          posts: updated,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setToastMessage(`🗑️ Đã xóa bài học "${targetPost.title}" thành công!`);
        setTimeout(() => setToastMessage(null), 3500);
        window.dispatchEvent(new CustomEvent("embedded_tutorials_updated"));
      } else {
        alert(json.error || "Lỗi khi cập nhật sau khi xóa bài học");
      }
    } catch (err: any) {
      alert(`Lỗi xóa bài học: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMovePost = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === posts.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...posts];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    setPosts(updated);
    setSelectedPostIdx(targetIdx);
  };

  const handleUpdateCurrentPost = (field: string, value: any) => {
    const updated = [...posts];
    (updated[selectedPostIdx] as any)[field] = value;
    if (field === "title") {
      updated[selectedPostIdx].slug = slugify(value);
    }
    setPosts(updated);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và slug chuyên đề.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/tutorials/${topicId || slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          category,
          categoryName,
          icon,
          badge,
          level,
          description,
          author,
          authorTitle,
          coverImage,
          posts,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi cập nhật chuyên đề");
      }

      window.dispatchEvent(new CustomEvent("embedded_tutorials_updated"));
      setToastMessage("🎉 Đã lưu thay đổi chuyên đề thành công (Lịch sử sửa đổi được bảo toàn)!");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chuyên đề "${title}"? Toàn bộ các bài học trong chuyên đề sẽ bị gỡ bỏ!`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tutorials/${topicId || slug}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi xóa chuyên đề");
      }
      window.dispatchEvent(new CustomEvent("embedded_tutorials_updated"));
      alert("🎉 Đã xóa chuyên đề thành công.");
      router.push("/admin");
    } catch (err: any) {
      alert(`Lỗi xóa: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-24 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted text-sm font-medium">Đang tải chuyên đề kỹ thuật từ Database...</p>
      </div>
    );
  }

  if (!isLoading && posts.length === 0 && !title) {
    return (
      <div className="container py-24 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20 text-2xl font-bold">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Chuyên Đề Không Tồn Tại</h2>
        <p className="text-xs text-text-secondary mb-6 leading-relaxed">
          Chuyên đề này không tồn tại trong hệ thống hoặc đã được xóa trước đó.
        </p>
        <Button variant="primary" asChild className="bg-accent hover:bg-accent-hover text-white">
          <Link href="/admin">Quay Về Quản Trị</Link>
        </Button>
      </div>
    );
  }

  const currentPost = posts[selectedPostIdx] || posts[0];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-bg-panel/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-text-muted hover:text-text-primary px-2">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-text-primary truncate max-w-[200px] sm:max-w-md">
                  {title || "Chỉnh Sửa Chuyên Đề"}
                </h1>
                <p className="text-[11px] text-text-muted hidden sm:block">
                  {categoryName} • {posts.length} bài học • Cấp độ {level}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTopicSettingsOpen(true)}
              className="text-xs text-text-secondary hover:text-accent flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cài Đặt Chuyên Đề</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="text-xs text-text-secondary hover:text-accent hidden md:flex items-center gap-1"
            >
              <Link href={`/tutorials/${slug}/${currentPost?.slug || ""}`} target="_blank">
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Trên Web</span>
              </Link>
            </Button>

            <Button
              type="button"
              variant="primary"
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang lưu..." : "Lưu Toàn Bộ"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 text-center text-xs text-emerald-400 font-bold animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Main Workspace: 2-Column Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Articles Navigation Tree (4 cols) */}
        <div className="lg:col-span-4 bg-bg-panel border border-border rounded-2xl p-4 shadow-xl space-y-4 lg:sticky lg:top-20">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              <h2 className="text-xs sm:text-sm font-bold text-text-primary">
                Danh Sách Bài Học ({posts.length})
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsImporterOpen(true)}
                className="text-[11px] h-7 px-2 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10 font-bold"
                title="Nhập nhanh từ Markdown / Notion"
              >
                <Zap className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddPost}
                className="bg-accent hover:bg-accent-hover text-white text-[11px] h-7 px-2.5 rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm Bài</span>
              </Button>
            </div>
          </div>

          {/* List of articles */}
          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin pr-1">
            {posts.map((post, idx) => {
              const isSelected = selectedPostIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPostIdx(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                    isSelected
                      ? "bg-accent/10 border-accent/60 shadow-md"
                      : "bg-bg-elevated/40 border-border hover:border-border/80 hover:bg-bg-elevated/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`text-[10px] font-mono font-extrabold w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-accent text-white"
                          : "bg-bg-panel text-text-muted border border-border"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${
                          isSelected ? "text-accent" : "text-text-primary"
                        }`}
                      >
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono mt-0.5">
                        <span>{post.readTime}</span>
                        {post.draft && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                            Bản nháp
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reorder and Delete Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePost(idx, "up");
                      }}
                      className="p-1 rounded text-text-muted hover:text-accent disabled:opacity-20"
                      title="Di chuyển lên"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === posts.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePost(idx, "down");
                      }}
                      className="p-1 rounded text-text-muted hover:text-accent disabled:opacity-20"
                      title="Di chuyển xuống"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {posts.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePost(idx);
                        }}
                        className="p-1 rounded text-rose-400 hover:text-rose-300"
                        title="Xóa bài học"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Article Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentPost && (
            <div className="space-y-5">
              {/* Post Metadata Card */}
              <div className="bg-bg-panel border border-border rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-accent/15 text-accent border border-accent/30">
                      Bài #{selectedPostIdx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-text-primary">
                      Chi Tiết Bài Giảng Kỹ Thuật
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {posts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePost(selectedPostIdx)}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Xóa bài học này khỏi chuyên đề"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bài này</span>
                      </button>
                    )}

                    {/* Draft Switcher */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={currentPost.draft}
                        onChange={(e) => handleUpdateCurrentPost("draft", e.target.checked)}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent accent-accent"
                      />
                      <span className="text-xs font-semibold text-text-secondary">
                        Lưu dạng bản nháp (Chưa công khai)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-text-secondary mb-1">
                      Tiêu đề bài viết *
                    </label>
                    <input
                      type="text"
                      value={currentPost.title}
                      onChange={(e) => handleUpdateCurrentPost("title", e.target.value)}
                      placeholder="VD: Bài 1: Khởi tạo Kernel Driver và GPIO Subsystem"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs sm:text-sm text-text-primary font-bold focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary mb-1">
                      Thời gian đọc
                    </label>
                    <input
                      type="text"
                      value={currentPost.readTime}
                      onChange={(e) => handleUpdateCurrentPost("readTime", e.target.value)}
                      placeholder="10 phút"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs sm:text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-text-secondary mb-1">
                      Tóm tắt ngắn (Summary)
                    </label>
                    <input
                      type="text"
                      value={currentPost.summary}
                      onChange={(e) => handleUpdateCurrentPost("summary", e.target.value)}
                      placeholder="Tóm tắt 1-2 câu nội dung cốt lõi của bài học..."
                      className="w-full px-3.5 py-2 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Dual Editor: Tech Markdown Pro Split-View vs MDXEditor WYSIWYG */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-accent" />
                    <span>Nội Dung Bài Học</span>
                  </label>

                  <div className="flex items-center bg-bg-panel p-1 rounded-xl border border-border gap-1">
                    <button
                      type="button"
                      onClick={() => setEditorMode("split")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        editorMode === "split"
                          ? "bg-accent text-white shadow-sm"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tech Markdown Pro (Split-View)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode("mdx")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        editorMode === "mdx"
                          ? "bg-accent text-white shadow-sm"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>MDXEditor (WYSIWYG Chuẩn Notion)</span>
                    </button>
                  </div>
                </div>

                {editorMode === "split" ? (
                  <TechMarkdownEditor
                    value={currentPost.contentHtml}
                    onChange={(val) => handleUpdateCurrentPost("contentHtml", val)}
                    draftKey={`${topicId}_${currentPost.slug || selectedPostIdx}`}
                    minHeight="520px"
                  />
                ) : (
                  <LabMDXEditor
                    markdown={currentPost.contentHtml}
                    onChange={(val) => handleUpdateCurrentPost("contentHtml", val)}
                    minHeight="520px"
                  />
                )}
              </div>

              {/* Code Snippet thực hành đính kèm */}
              <div className="bg-bg-panel border border-border rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-accent" />
                    <span>Mã Nguồn Mẫu Đính Kèm (Code Snippet Thực Hành - Tùy chọn)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentPost.codeFilename}
                      onChange={(e) => handleUpdateCurrentPost("codeFilename", e.target.value)}
                      placeholder="main.c"
                      className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-[11px] font-mono text-text-secondary w-28 text-center"
                      title="Tên tệp mã nguồn"
                    />
                    <select
                      value={currentPost.codeLang}
                      onChange={(e) => handleUpdateCurrentPost("codeLang", e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-[11px] font-mono text-text-secondary"
                      title="Ngôn ngữ lập trình"
                    >
                      <option value="c">C</option>
                      <option value="cpp">C++</option>
                      <option value="python">Python</option>
                      <option value="rust">Rust</option>
                      <option value="armasm">ARM Assembly</option>
                      <option value="bash">Bash / Shell</option>
                      <option value="makefile">Makefile</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={currentPost.codeSnippet}
                  onChange={(e) => handleUpdateCurrentPost("codeSnippet", e.target.value)}
                  placeholder="// Nhập mã nguồn thực hành C / C++ tại đây..."
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-border text-xs font-mono text-emerald-400 leading-relaxed outline-none focus:border-accent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Topic Metadata Settings Modal */}
      {isTopicSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-bg-panel border border-border rounded-3xl p-6 shadow-2xl max-w-xl w-full space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                <span>Cài Đặt Thông Tin Chuyên Đề</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsTopicSettingsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Tiêu đề chuyên đề *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!topicId) setSlug(slugify(e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-text-primary font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text-secondary mb-1">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text-secondary mb-1">
                    Lĩnh vực / Nhóm
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const selected = categories.find((c) => c.slug === e.target.value);
                      setCategory(e.target.value);
                      if (selected) {
                        setCategoryName(selected.name);
                        setIcon(selected.icon);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary"
                  >
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Mô tả tổng quan chuyên đề
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text-secondary mb-1">
                    Tác giả / Giảng viên
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text-secondary mb-1">
                    Cấp độ (Level)
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-primary"
                  >
                    <option value="Beginner">Beginner (Cơ bản)</option>
                    <option value="Intermediate">Intermediate (Trung cấp)</option>
                    <option value="Advanced">Advanced (Chuyên sâu)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Đang xóa..." : "Xóa chuyên đề này"}</span>
              </button>

              <Button
                type="button"
                variant="primary"
                onClick={() => setIsTopicSettingsOpen(false)}
                className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Hoàn Tất Cài Đặt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Markdown Importer Modal */}
      <SmartMarkdownImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImport={(importedPosts) => {
          const formatted = importedPosts.map((p) => ({
            title: p.title,
            slug: p.slug,
            readTime: p.readTime,
            summary: p.summary,
            contentHtml: p.contentHtml,
            codeSnippet: p.codeSnippet,
            codeLang: p.codeLang,
            codeFilename: p.codeFilename,
            draft: false,
          }));
          setPosts([...posts, ...formatted]);
          setSelectedPostIdx(posts.length);
        }}
      />
    </div>
  );
}
