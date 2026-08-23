"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GoogleDocsEditor } from "@/components/editor/GoogleDocsEditor";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Trash2,
  Image as ImageIcon,
  Tag,
  Clock,
  Layers,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const COMMON_TAGS = [
  "embedded",
  "aiot",
  "fpga",
  "rf",
  "stm32",
  "esp32",
  "zephyr",
  "freertos",
  "arm",
  "emc",
  "tinyml",
  "verilog",
  "pcb",
  "hardware",
  "riscv",
];

const POST_TYPES = [
  { id: "technical", label: "⚡ Chia sẻ Kỹ thuật" },
  { id: "daily", label: "🔬 Nhật ký Lab" },
  { id: "recruitment", label: "📢 Tuyển thành viên" },
  { id: "event", label: "🏆 Sự kiện & Workshop" },
  { id: "general", label: "📌 Thông báo chung" },
];

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [postType, setPostType] = useState("technical");
  const [tags, setTags] = useState<string[]>(["embedded"]);
  const [customTag, setCustomTag] = useState("");
  const [coverImage, setCoverImage] = useState("/images/logo.png");
  const [readingTime, setReadingTime] = useState(5);
  const [series, setSeries] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load existing post from SQLite API
  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setTitle(p.title);
          setSlug(p.slug);
          setExcerpt(p.excerpt);
          setPostType(p.postType || "technical");
          setTags(typeof p.tags === "string" ? p.tags.split(",") : p.tags || ["embedded"]);
          setCoverImage(p.coverImage || "/images/logo.png");
          setReadingTime(p.readingTime || 5);
          setSeries(p.series || "");
          setContentHtml(p.contentHtml || (p.body && p.body.raw) || "");
        }
      } catch (err) {
        console.error("Error loading post:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (postId) loadPost();
  }, [postId]);

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customTag.trim()) {
      e.preventDefault();
      const clean = customTag.trim().toLowerCase();
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setCustomTag("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) {
      alert("Vui lòng điền tiêu đề và tóm tắt bài viết.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Đang lưu thay đổi vào Database SQLite...");

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        contentHtml,
        coverImage: coverImage.trim() || "/images/logo.png",
        postType,
        tags: tags.length > 0 ? tags.join(",") : "embedded",
        readingTime: Number(readingTime) || 5,
        series: series.trim() || undefined,
      };

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi cập nhật");
      }

      setStatusMessage("🎉 Đã lưu thay đổi thành công!");
      setTimeout(() => {
        router.push(`/blog/${json.data.slug}`);
      }, 800);
    } catch (err: any) {
      alert(`Có lỗi xảy ra: ${err.message}`);
      setIsSubmitting(false);
      setStatusMessage(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác!")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        alert("Đã xóa bài viết thành công!");
        router.push("/admin/posts");
      }
    } catch (err) {
      alert("Lỗi khi xóa bài viết.");
    }
  };

  if (isLoading) {
    return (
      <div className="container py-20 text-center text-text-muted">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
        Đang tải dữ liệu bài viết từ SQLite Database...
      </div>
    );
  }

  const isAuthorized = user && (user.role === "superadmin" || user.role === "admin");

  if (!isAuthorized) {
    return (
      <div className="container py-16 max-w-xl text-center">
        <div className="p-8 rounded-3xl bg-bg-panel border border-border shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-3xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Truy Cập Bị Từ Chối (403 Forbidden)
          </h1>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Chỉ <strong>Quản Trị Viên & Mentor Lab</strong> mới có quyền chỉnh sửa nội dung bài viết.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" asChild className="bg-accent hover:bg-accent-hover text-white">
              <Link href="/">Quay Về Trang Chủ</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Đăng Nhập Tài Khoản Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      {/* Top Header Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="text-text-muted hover:text-text-primary">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại Bảng Quản Trị
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
            <Trash2 className="w-4 h-4 mr-1.5" />
            Xóa Bài Viết
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-bg-panel border border-border rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Chỉnh Sửa Bài Viết (Google Docs WYSIWYG Editor)
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">
              Tiêu đề bài viết *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-base font-bold text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2">
              Thể loại bài viết
            </label>
            <div className="flex flex-wrap gap-2">
              {POST_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPostType(type.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    postType === type.id
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-border bg-bg-elevated text-text-muted hover:text-text-primary"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">
              Tóm tắt ngắn (Excerpt) *
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Series
              </label>
              <input
                type="text"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Ảnh bìa
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Tags:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? "bg-accent text-white border-accent font-bold"
                        : "bg-bg-elevated text-text-muted border-border hover:border-border-strong hover:text-text-primary"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* GOOGLE DOCS WYSIWYG EDITOR */}
        <div className="space-y-2">
          <GoogleDocsEditor
            value={contentHtml}
            onChange={(html) => setContentHtml(html)}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between p-4 bg-bg-panel border border-border rounded-2xl shadow-lg">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin">Hủy bỏ</Link>
          </Button>

          <div className="flex items-center gap-3">
            {statusMessage && (
              <span className="text-xs text-emerald-400 font-semibold animate-pulse">
                {statusMessage}
              </span>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent-hover text-white px-8 py-2.5 font-bold shadow-lg shadow-accent/20 text-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Đang lưu..." : "Cập Nhật Bài Viết"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
