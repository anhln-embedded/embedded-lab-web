"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { slugify } from "@/lib/utils";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  Code,
  CheckCircle2,
  FileCode,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NewTutorialTopicPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Array<{ slug: string; name: string; icon: string }>>([
    { slug: "linux", name: "Embedded Linux", icon: "🐧" },
    { slug: "rtos", name: "Real-Time OS", icon: "⚡" },
    { slug: "automotive", name: "Automotive & EV", icon: "🚗" },
    { slug: "mcu", name: "Microcontrollers", icon: "🎛️" },
    { slug: "programming", name: "Lập Trình C & Kỹ Năng", icon: "💻" },
    { slug: "hardware", name: "Phần Cứng PCB & FPGA", icon: "📐" },
  ]);

  React.useEffect(() => {
    async function fetchCats() {
      try {
        const res = await fetch("/api/tutorials/categories");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCats();
  }, []);

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

  const [posts, setPosts] = useState<
    Array<{
      title: string;
      slug: string;
      readTime: string;
      summary: string;
      contentHtml: string;
      codeSnippet: string;
      codeLang: string;
      codeFilename: string;
    }>
  >([
    {
      title: "Bài 1: Giới thiệu & Khởi tạo môi trường",
      slug: "bai-1-gioi-thieu-khoi-tao-moi-truong",
      readTime: "10 phút",
      summary: "Tổng quan kiến trúc và các bước thiết lập công cụ thực hành.",
      contentHtml: `<h3>🎯 Mục tiêu bài học</h3>\n<p>Nêu rõ kiến thức và kỹ năng sinh viên cần đạt được trong chuyên đề này.</p>\n\n<h3>1. Lý thuyết trọng tâm</h3>\n<p>Phân tích nguyên lý hoạt động và bản đồ thanh ghi / cấu trúc phần mềm.</p>`,
      codeSnippet: `// Embedded-AIoT Lab - Sample Code\n#include <stdio.h>\n\nvoid app_main(void) {\n    printf("Embedded-AIoT Lab Initialized!\\n");\n}`,
      codeLang: "c",
      codeFilename: "main.c",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleAddPost = () => {
    const nextIdx = posts.length + 1;
    setPosts([
      ...posts,
      {
        title: `Bài ${nextIdx}: Tiêu đề bài viết mới`,
        slug: `bai-${nextIdx}-tieu-de-bai-viet-moi`,
        readTime: "12 phút",
        summary: "Mô tả tóm tắt nội dung bài học...",
        contentHtml: `<h3>1. Nội dung trọng tâm</h3>\n<p>Chi tiết bài giảng kỹ thuật...</p>`,
        codeSnippet: "",
        codeLang: "c",
        codeFilename: "main.c",
      },
    ]);
  };

  const handleRemovePost = (idx: number) => {
    if (posts.length <= 1) return;
    setPosts(posts.filter((_, i) => i !== idx));
  };

  const handleUpdatePost = (idx: number, field: string, value: any) => {
    const updated = [...posts];
    (updated[idx] as any)[field] = value;
    if (field === "title") {
      updated[idx].slug = slugify(value);
    }
    setPosts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và slug chuyên đề.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tutorials", {
        method: "POST",
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
          posts,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi tạo chuyên đề");
      }

      window.dispatchEvent(new CustomEvent("embedded_tutorials_updated"));
      alert("🎉 Đã tạo chuyên đề kỹ thuật mới thành công!");
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 sm:py-12 max-w-4xl mx-auto px-4">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay về Dashboard Quản Trị</span>
      </Link>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-bg-panel border border-border/80 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                Tạo Chuyên Đề Kỹ Thuật Mới (New Tutorial Topic)
              </h1>
              <p className="text-xs text-text-muted">
                Tạo chuỗi bài giảng kiến trúc (như Linux Driver, FreeRTOS, Automotive UDS/CAN)
              </p>
            </div>
          </div>

          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Tiêu đề chuyên đề *
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="VD: Linux Device Driver & Kernel Programming"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/70 dark:bg-bg-elevated border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Slug (Đường dẫn URL) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="linux-device-driver-tutorials"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/70 dark:bg-bg-elevated border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Lĩnh vực / Nhóm *
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/70 dark:bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Mô tả chuyên đề *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả nội dung chuỗi bài viết, các kiến thức cốt lõi sẽ truyền tải..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/70 dark:bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent leading-relaxed"
              />
            </div>
          </div>

          {/* Danh Sách Bài Viết Trong Chuyên Đề */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                <span>Danh Sách Bài Viết Trong Chuyên Đề ({posts.length} bài)</span>
              </h2>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPost}
                className="text-xs text-accent border-accent/40 hover:bg-accent/10 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Bài Mới</span>
              </Button>
            </div>

            <div className="space-y-4">
              {posts.map((post, pIdx) => (
                <div
                  key={pIdx}
                  className="p-4 rounded-2xl bg-bg-elevated/40 border border-border/80 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-accent">
                      Bài #{pIdx + 1}
                    </span>
                    {posts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePost(pIdx)}
                        className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa bài này</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-text-muted mb-1">
                        Tiêu đề bài viết *
                      </label>
                      <input
                        type="text"
                        value={post.title}
                        onChange={(e) => handleUpdatePost(pIdx, "title", e.target.value)}
                        placeholder="VD: Bài 1: Khởi tạo Kernel Module..."
                        required
                        className="w-full px-3 py-2 rounded-lg bg-bg-panel border border-border text-xs text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-muted mb-1">
                        Thời gian đọc
                      </label>
                      <input
                        type="text"
                        value={post.readTime}
                        onChange={(e) => handleUpdatePost(pIdx, "readTime", e.target.value)}
                        placeholder="10 phút"
                        className="w-full px-3 py-2 rounded-lg bg-bg-panel border border-border text-xs text-text-primary"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-text-muted mb-1">
                        Tóm tắt bài học (Summary)
                      </label>
                      <input
                        type="text"
                        value={post.summary}
                        onChange={(e) => handleUpdatePost(pIdx, "summary", e.target.value)}
                        placeholder="Tóm tắt ngắn 1-2 câu..."
                        className="w-full px-3 py-2 rounded-lg bg-bg-panel border border-border text-xs text-text-primary"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-text-muted mb-1 flex items-center gap-1">
                        <FileCode className="w-3 h-3 text-accent" />
                        Mã nguồn mẫu thực hành (Code Snippet - Không bắt buộc)
                      </label>
                      <textarea
                        rows={3}
                        value={post.codeSnippet}
                        onChange={(e) => handleUpdatePost(pIdx, "codeSnippet", e.target.value)}
                        placeholder="#include <stdio.h> ..."
                        className="w-full px-3 py-2 rounded-lg bg-bg-panel border border-border text-xs font-mono text-emerald-400 leading-relaxed"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-text-muted mb-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-accent" />
                        Nội dung chi tiết & lý thuyết (HTML / Văn bản)
                      </label>
                      <textarea
                        rows={4}
                        value={post.contentHtml}
                        onChange={(e) => handleUpdatePost(pIdx, "contentHtml", e.target.value)}
                        placeholder="Nhập nội dung bài giảng chi tiết, các thẻ <h3>, <p>, <ul>..."
                        className="w-full px-3 py-2 rounded-lg bg-bg-panel border border-border text-xs text-text-primary leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-border flex items-center justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin">Hủy bỏ</Link>
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Đang tạo..." : "Tạo Chuyên Đề Mới"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
