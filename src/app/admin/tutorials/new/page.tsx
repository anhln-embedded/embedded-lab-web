"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { slugify } from "@/lib/utils";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Plus,
  BookOpen,
  Zap,
  Layers,
  FileText,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SmartMarkdownImporterModal } from "@/components/tutorials/SmartMarkdownImporterModal";
import { TechMarkdownEditor } from "@/components/editor/TechMarkdownEditor";
import { LabMDXEditor } from "@/components/editor/LabMDXEditor";

export default function NewTutorialTopicPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [editorMode, setEditorMode] = useState<"split" | "mdx">("split");
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string; icon: string }>>([
    { slug: "linux", name: "Embedded Linux", icon: "🐧" },
    { slug: "rtos", name: "Real-Time OS", icon: "⚡" },
    { slug: "automotive", name: "Automotive & EV", icon: "🚗" },
    { slug: "mcu", name: "Microcontrollers", icon: "🎛️" },
    { slug: "programming", name: "Lập Trình C & Kỹ Năng", icon: "💻" },
    { slug: "hardware", name: "Phần Cứng PCB & FPGA", icon: "📐" },
  ]);

  useEffect(() => {
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

  const [firstPostTitle, setFirstPostTitle] = useState("Bài 1: Giới thiệu & Khởi tạo môi trường");
  const [firstPostReadTime, setFirstPostReadTime] = useState("10 phút");
  const [firstPostSummary, setFirstPostSummary] = useState("Tổng quan kiến trúc và các bước thiết lập công cụ thực hành.");
  const [firstPostContent, setFirstPostContent] = useState(`## 🎯 1. Mục tiêu bài học
Nêu rõ kiến thức và kỹ năng sinh viên cần đạt được trong chuyên đề này.

## 📚 2. Lý thuyết trọng tâm
Phân tích nguyên lý hoạt động và bản đồ thanh ghi / cấu trúc phần mềm.

> [!TIP]
> Hãy luôn kiểm tra cấu hình Clock và cấp nguồn trước khi nạp firmware thực tế.

\`\`\`c filename="main.c"
// Embedded-AIoT Lab - C Sample Code
#include <stdio.h>

void app_main(void) {
    printf("Embedded-AIoT Lab Initialized!\\n");
}
\`\`\`
`);

  const [importedPosts, setImportedPosts] = useState<any[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và slug chuyên đề.");
      return;
    }

    setIsSubmitting(true);

    try {
      const postsPayload = importedPosts && importedPosts.length > 0
        ? importedPosts
        : [
            {
              title: firstPostTitle,
              slug: slugify(firstPostTitle) || "bai-1-gioi-thieu",
              readTime: firstPostReadTime,
              summary: firstPostSummary,
              contentHtml: firstPostContent,
              codeSnippet: `// Embedded-AIoT Lab - C Sample Code\n#include <stdio.h>\n\nvoid app_main(void) {\n    printf("Embedded System Ready!\\n");\n}`,
              codeLang: "c",
              codeFilename: "main.c",
              draft: false,
            },
          ];

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
          posts: postsPayload,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi tạo chuyên đề");
      }

      window.dispatchEvent(new CustomEvent("embedded_tutorials_updated"));
      alert("🎉 Đã tạo chuyên đề kỹ thuật mới thành công! Chuyển tới Workspace để tiếp tục thêm các bài học...");
      router.push(`/admin/tutorials/${json.data.slug || json.data.id}/edit`);
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 sm:py-12 max-w-5xl mx-auto px-4">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay về Dashboard Quản Trị</span>
      </Link>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Topic Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bg-panel border border-border/80 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Tạo Chuyên Đề Kỹ Thuật Mới
                </h1>
                <p className="text-xs text-text-muted">
                  Khởi tạo chuỗi bài giảng kiến trúc (Linux Driver, FreeRTOS, STM32, CAN Bus)
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImporterOpen(true)}
              className="text-xs text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10 flex items-center gap-1 font-bold shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Nhập Toàn Bộ Từ Markdown / Notion</span>
            </Button>
          </div>

          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Tiêu đề chuyên đề *
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="VD: Lập Trình Linux Device Driver & Kernel Module"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs sm:text-sm text-text-primary font-bold focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Lĩnh vực / Nhóm chuyên đề *
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
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
                Slug (Đường dẫn URL) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="lap-trinh-linux-device-driver"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Cấp độ (Level)
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="Beginner">Beginner (Cơ bản)</option>
                <option value="Intermediate">Intermediate (Trung cấp)</option>
                <option value="Advanced">Advanced (Chuyên sâu)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Mô tả chuyên đề *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả nội dung chuỗi bài viết, các kiến thức cốt lõi sẽ truyền tải..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent leading-relaxed"
              />
            </div>
          </div>

          {/* First Lesson Section */}
          <div className="pt-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                <span>
                  {importedPosts
                    ? `Đã nạp ${importedPosts.length} bài học từ file Import`
                    : "Khởi Tạo Bài Học Đầu Tiên (Bài #1)"}
                </span>
              </h2>
              {importedPosts && (
                <button
                  type="button"
                  onClick={() => setImportedPosts(null)}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Hủy nhập hàng loạt & tự soạn thủ công
                </button>
              )}
            </div>

            {!importedPosts && (
              <div className="space-y-4 p-5 rounded-2xl bg-bg-elevated/40 border border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-text-muted mb-1">
                      Tiêu đề bài viết đầu tiên *
                    </label>
                    <input
                      type="text"
                      value={firstPostTitle}
                      onChange={(e) => setFirstPostTitle(e.target.value)}
                      placeholder="Bài 1: Giới thiệu & Khởi tạo môi trường"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-bg-panel border border-border text-xs font-bold text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-muted mb-1">
                      Thời gian đọc
                    </label>
                    <input
                      type="text"
                      value={firstPostReadTime}
                      onChange={(e) => setFirstPostReadTime(e.target.value)}
                      placeholder="10 phút"
                      className="w-full px-3 py-2 rounded-xl bg-bg-panel border border-border text-xs text-text-primary font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-text-muted mb-1">
                      Tóm tắt ngắn (Summary)
                    </label>
                    <input
                      type="text"
                      value={firstPostSummary}
                      onChange={(e) => setFirstPostSummary(e.target.value)}
                      placeholder="Mô tả tóm tắt ngắn..."
                      className="w-full px-3 py-2 rounded-xl bg-bg-panel border border-border text-xs text-text-primary"
                    />
                  </div>
                </div>

                {/* Dual Editor: Tech Markdown Pro vs MDXEditor */}
                <div className="space-y-2 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-[11px] font-bold text-text-muted">
                      Nội dung bài viết
                    </label>

                    <div className="flex items-center bg-bg-panel p-1 rounded-xl border border-border gap-1">
                      <button
                        type="button"
                        onClick={() => setEditorMode("split")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          editorMode === "split"
                            ? "bg-accent text-white shadow-sm"
                            : "text-text-muted hover:text-text-primary"
                        }`}
                      >
                        Tech Markdown Pro
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode("mdx")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          editorMode === "mdx"
                            ? "bg-accent text-white shadow-sm"
                            : "text-text-muted hover:text-text-primary"
                        }`}
                      >
                        MDXEditor (WYSIWYG)
                      </button>
                    </div>
                  </div>

                  {editorMode === "split" ? (
                    <TechMarkdownEditor
                      value={firstPostContent}
                      onChange={(val) => setFirstPostContent(val)}
                      draftKey="new_topic_first_post"
                      minHeight="380px"
                    />
                  ) : (
                    <LabMDXEditor
                      markdown={firstPostContent}
                      onChange={(val) => setFirstPostContent(val)}
                      minHeight="380px"
                    />
                  )}
                </div>
              </div>
            )}
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

      {/* Smart Markdown Importer Modal */}
      <SmartMarkdownImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImport={(posts) => {
          setImportedPosts(
            posts.map((p) => ({
              title: p.title,
              slug: p.slug,
              readTime: p.readTime,
              summary: p.summary,
              contentHtml: p.contentHtml,
              codeSnippet: p.codeSnippet,
              codeLang: p.codeLang,
              codeFilename: p.codeFilename,
              draft: false,
            }))
          );
          if (!title.trim()) {
            setTitle("Lập Trình C & Embedded C Chuyên Sâu");
            setSlug("lap-trinh-c-embedded-c-chuyen-sau");
            setCategory("programming");
            setCategoryName("Lập Trình C & Kỹ Năng");
            setIcon("💻");
            setDescription(
              "Giáo trình lập trình C nhúng chuyên sâu: Memory Layout, Bitmasking, Volatile/Static, Function Pointer Callback, Structure Packing và Ring Buffer."
            );
          }
        }}
      />
    </div>
  );
}
