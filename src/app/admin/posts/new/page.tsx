"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GoogleDocsEditor } from "@/components/editor/GoogleDocsEditor";
import { LAB_PRESET_IMAGES } from "@/components/editor/EditorModals";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Image as ImageIcon,
  Tag,
  Clock,
  Layers,
  FileText,
  CheckCircle2
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
  { id: "technical", label: "⚡ Chia sẻ Kỹ thuật", desc: "Bài viết chuyên sâu về firmware, mạch, thuật toán" },
  { id: "daily", label: "🔬 Nhật ký Lab", desc: "Tiến độ thực nghiệm, kết quả đo đạc bàn thử nghiệm" },
  { id: "recruitment", label: "📢 Tuyển thành viên", desc: "Thông báo chiêu mộ CTV, sinh viên NCKH" },
  { id: "event", label: "🏆 Sự kiện & Workshop", desc: "Hội thảo, giải thưởng, sinh hoạt chuyên đề" },
  { id: "general", label: "📌 Thông báo chung", desc: "Tin tức tổng hợp từ ban chủ nhiệm" },
];

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [postType, setPostType] = useState("technical");
  const [tags, setTags] = useState<string[]>(["embedded"]);
  const [customTag, setCustomTag] = useState("");
  const [coverImage, setCoverImage] = useState("/images/logo.png");
  const [readingTime, setReadingTime] = useState(5);
  const [series, setSeries] = useState("");
  const [contentHtml, setContentHtml] = useState(`
<h2>1. Giới thiệu & Động lực nghiên cứu</h2>
<p>Trình bày bối cảnh, lý do thực hiện nghiên cứu và mục tiêu giải quyết bài toán kỹ thuật tại <strong>Embedded-AIoT Lab</strong>.</p>

<h2>2. Kiến trúc Hệ thống & Phần Cứng</h2>
<p>Mô tả sơ đồ khối, các linh kiện vi điều khiển / IC được sử dụng:</p>
<ul>
  <li>Vi điều khiển chính: STM32H7 / ESP32-S3 / Xilinx FPGA</li>
  <li>Cảm biến & Ngoại vi giao tiếp: SPI / I2C / DMA</li>
</ul>
`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setSlug(generatedSlug);
  };

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

  const handleTemplateSelected = (newTitle?: string, newExcerpt?: string) => {
    if (newTitle && !title) setTitle(newTitle);
    if (newExcerpt && !excerpt) setExcerpt(newExcerpt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (!excerpt.trim()) {
      alert("Vui lòng nhập tóm tắt bài viết.");
      return;
    }
    if (!contentHtml.trim() || contentHtml === "<p><br></p>") {
      alert("Vui lòng nhập nội dung bài viết.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Đang lưu bài viết vào Database SQLite...");

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim(),
        contentHtml,
        coverImage: coverImage.trim() || "/images/logo.png",
        postType,
        tags: tags.length > 0 ? tags.join(",") : "embedded",
        readingTime: Number(readingTime) || 5,
        series: series.trim() || undefined,
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
        throw new Error(json.error || "Lỗi lưu bài viết");
      }

      setStatusMessage("🎉 Đã xuất bản bài viết thành công!");
      setTimeout(() => {
        router.push(`/blog/${json.data.slug}`);
      }, 800);
    } catch (err: any) {
      console.error(err);
      alert(`Có lỗi xảy ra: ${err.message}`);
      setIsSubmitting(false);
      setStatusMessage(null);
    }
  };

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
            Chỉ <strong>Quản Trị Viên & Mentor Lab</strong> mới có quyền soạn thảo và xuất bản bài viết mới.
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
          <span className="text-xs text-text-muted">
            Tác giả: <strong className="text-text-primary">{user?.name || "Admin Lab"}</strong>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
            SQLite Database Ready
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Category Box */}
        <div className="bg-bg-panel border border-border rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Trình Soạn Thảo Bài Viết Lab (WYSIWYG Chuẩn Google Docs)
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">
              Tiêu đề bài viết *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="VD: Kinh nghiệm Thiết kế Mạch Nguồn Xung BUCK & Đo Kiểm Phát Xạ EMC"
              required
              className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-base font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Post Type Selector */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2">
              Chuyên mục / Thể loại bài viết *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              {POST_TYPES.map((type) => {
                const isSelected = postType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPostType(type.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-accent bg-accent/15 text-text-primary shadow-sm"
                        : "border-border bg-bg-elevated text-text-muted hover:border-border-strong hover:text-text-secondary"
                    }`}
                  >
                    <div className="font-bold text-xs mb-0.5">{type.label}</div>
                    <div className="text-[10px] text-text-muted line-clamp-2">{type.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">
              Tóm tắt ngắn (Excerpt - Hiển thị ngoài trang chủ & danh sách) *
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Tóm tắt 1-2 câu ngắn gọn về giá trị và mục tiêu kỹ thuật của bài viết..."
              required
              className="w-full px-3.5 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Metadata Collapsible / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Đường dẫn tĩnh (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="kinh-nghiem-thiet-ke-mach-nguon"
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Chuỗi bài viết (Series - Tùy chọn)
              </label>
              <input
                type="text"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                placeholder="VD: STM32 Mastery Series"
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Ảnh bìa (Cover Image URL)
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/images/logo.png"
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Gắn thẻ Tags kỹ thuật:
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
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Nhập thêm tag khác rồi nhấn Enter..."
              className="w-full max-w-xs px-3 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent font-mono"
            />
          </div>
        </div>

        {/* --- GOOGLE DOCS WYSIWYG EDITOR COMPONENT --- */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Nội dung bài viết (Chỉnh sửa trực quan như Google Docs)
            </span>
            <span className="text-[11px] text-text-muted">
              💡 Bôi đen văn bản để đổi kiểu hoặc sử dụng các nút chèn phía trên
            </span>
          </div>

          <GoogleDocsEditor
            value={contentHtml}
            onChange={(html) => setContentHtml(html)}
            onTemplateSelect={handleTemplateSelected}
          />
        </div>

        {/* Action Buttons */}
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
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Đang xuất bản..." : "Xuất Bản Bài Viết Lên SQLite DB"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
