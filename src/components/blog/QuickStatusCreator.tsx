"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/lib/posts-store";
import { BlogPostType } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Send,
  PlusCircle,
  Pin,
  Image as ImageIcon,
  FileText,
  X,
  Megaphone,
  FlaskConical,
  Zap,
  Trophy,
  Edit3
} from "lucide-react";

interface QuickStatusCreatorProps {
  onPostCreated?: () => void;
}

export function QuickStatusCreator({ onPostCreated }: QuickStatusCreatorProps) {
  const { user, quickLogin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<BlogPostType>("daily");
  const [pinned, setPinned] = useState(false);
  const [tagsInput, setTagsInput] = useState("nhat-ky-lab, ptit");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthorized = user && (user.role === "superadmin" || user.role === "admin");

  const openWithTemplate = (type: BlogPostType) => {
    setPostType(type);
    if (type === "recruitment") {
      setTitle("📢 [TUYỂN THÀNH VIÊN] Mở Đơn Tuyển Kỹ Sư Nghiên Cứu & CTV Thế Hệ Mới - Embedded-AIoT Lab");
      setTagsInput("tuyen-thanh-vien, ptit, embedded, aiot");
      setPinned(true);
    } else if (type === "daily") {
      setTitle("🔬 [NHẬT KÝ LAB] Thực Nghiệm Bàn Đo & Sinh Hoạt Chuyên Môn Tại Sân B9");
      setTagsInput("nhat-ky-lab, stm32, zephyr, bando");
      setPinned(false);
    } else if (type === "technical") {
      setTitle("⚡ [CHIA SẺ KỸ THUẬT] Hướng Dẫn & Ghi Chép Kỹ Thuật Từ Bàn Thực Nghiệm");
      setTagsInput("chia-se-ky-thuat, firmware, tinyml, fpga");
      setPinned(false);
    } else if (type === "event") {
      setTitle("🏆 [SỰ KIỆN & WORKSHOP] Hoạt Động Chuyên Môn & Thành Tích Mới Của Lab");
      setTagsInput("su-kien, workshop, thanh-tich, nckh");
      setPinned(false);
    }
    setIsOpen(true);
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Vui lòng điền tiêu đề và nội dung bài đăng.");
      return;
    }

    setIsSubmitting(true);
    const tags = tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);

    try {
      const generatedSlug =
        title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `post-${Date.now()}`;

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: generatedSlug,
          excerpt: content.trim().substring(0, 260) + (content.length > 260 ? "..." : ""),
          contentHtml: `<p>${content.trim().replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`,
          postType,
          pinned,
          tags: tags.length > 0 ? tags.join(",") : "ptit-lab",
          authorName: user ? user.name : "Embedded-AIoT Lab PTIT",
          authorTitle: user?.role === "superadmin" ? "Super Admin" : "Ban Quản Trị Lab",
          featured: pinned,
          draft: false,
          readingTime: Math.max(1, Math.ceil(content.split(" ").length / 150)),
          coverImage: imageUrl.trim() || undefined,
          facebookPostUrl: "https://www.facebook.com/EmbeddedAIoTLAB",
        }),
      });

      if (!res.ok) {
        throw new Error("Lỗi khi lưu bài viết vào database");
      }

      window.dispatchEvent(new CustomEvent("embedded_posts_updated"));

      setTitle("");
      setContent("");
      setImageUrl("");
      setIsOpen(false);
      setIsSubmitting(false);
      alert("🎉 Đã đăng bài viết lên Fanpage Lab thành công!");
      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      console.error(err);
      alert(`Có lỗi khi đăng bài: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-4 md:p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center text-lg flex-shrink-0">
            📢
          </div>
          <div>
            <h4 className="font-bold text-sm text-text-primary">Bảng Tin Hoạt Động & Tuyển Dụng Lab</h4>
            <p className="text-xs text-text-secondary">Cập nhật tin tức thường ngày, tuyển thành viên và chia sẻ nghiên cứu chuyên sâu.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!user ? (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Đăng nhập thành viên</span>
            </Link>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-bg-elevated border border-border text-text-muted text-xs font-medium">
              🎓 Thành viên: {user.name}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Facebook Style Status Box */}
      <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-bg-panel border border-border shadow-lg space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-bold text-sm flex-shrink-0">
            {user ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <button
            onClick={() => openWithTemplate("daily")}
            className="flex-1 px-4 py-2.5 rounded-full bg-bg-elevated border border-border/80 text-left text-xs md:text-sm text-text-muted hover:border-accent hover:text-text-secondary transition-all shadow-inner"
          >
            {user ? `${user.name} ơi, hôm nay Lab có hoạt động hay tin tức gì mới?` : "Đăng thông báo, hoạt động mới lên Fanpage..."}
          </button>
        </div>

        {/* Quick Action Category Shortcuts */}
        <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-1 text-xs">
          <button
            onClick={() => openWithTemplate("recruitment")}
            className="px-3 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-400 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            <span>Tuyển thành viên</span>
          </button>

          <button
            onClick={() => openWithTemplate("daily")}
            className="px-3 py-1.5 rounded-xl hover:bg-cyan-500/10 text-cyan-400 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Nhật ký Bàn đo</span>
          </button>

          <button
            onClick={() => openWithTemplate("technical")}
            className="px-3 py-1.5 rounded-xl hover:bg-amber-500/10 text-amber-400 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Chia sẻ Kỹ thuật</span>
          </button>

          <button
            onClick={() => openWithTemplate("event")}
            className="px-3 py-1.5 rounded-xl hover:bg-purple-500/10 text-purple-400 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            <span>Sự kiện & NCKH</span>
          </button>

          <Button variant="ghost" size="sm" asChild className="text-xs text-text-muted hover:text-accent">
            <Link href="/admin/posts/new">
              <FileText className="w-3.5 h-3.5 mr-1" />
              Soạn thảo Markdown
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Publishing Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-panel border border-border rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
                  ✍️
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-primary">Tạo Bài Đăng Fanpage Lab</h3>
                  <span className="text-[11px] text-text-muted">Đăng bởi: {user?.name}</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Chủ đề bài đăng *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPostType("recruitment")}
                    className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 ${
                      postType === "recruitment"
                        ? "bg-rose-500/20 text-rose-400 border-rose-500"
                        : "bg-bg-elevated border-border text-text-muted"
                    }`}
                  >
                    📢 Tuyển TV
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType("daily")}
                    className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 ${
                      postType === "daily"
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500"
                        : "bg-bg-elevated border-border text-text-muted"
                    }`}
                  >
                    🔬 Nhật ký
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType("technical")}
                    className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 ${
                      postType === "technical"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500"
                        : "bg-bg-elevated border-border text-text-muted"
                    }`}
                  >
                    ⚡ Kỹ thuật
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType("event")}
                    className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 ${
                      postType === "event"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500"
                        : "bg-bg-elevated border-border text-text-muted"
                    }`}
                  >
                    🏆 Sự kiện
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Tiêu đề bài viết *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: [THÔNG BÁO] Tuyển cộng tác viên nghiên cứu Lab đợt mới..."
                  required
                  className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-sm font-semibold text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Nội dung chi tiết (Status / Bài viết) *
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Viết nội dung thông báo, thời gian, địa điểm, link đăng ký, kết quả thí nghiệm..."
                  required
                  className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-xs md:text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Thẻ hashtags (cách nhau bởi dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="tuyen-thanh-vien, ptit, embedded"
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Ảnh đính kèm (URL nếu có)
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/images/logo.png hoặc URL ảnh..."
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinned-post"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <label htmlFor="pinned-post" className="text-xs text-text-secondary cursor-pointer flex items-center gap-1 font-medium">
                  <Pin className="w-3.5 h-3.5 text-amber-400" />
                  Ghim bài viết này lên đầu trang Fanpage
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/80">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsOpen(false)} className="text-xs">
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {isSubmitting ? "Đang đăng..." : "Đăng Lên Fanpage"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
