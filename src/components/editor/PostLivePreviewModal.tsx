"use client";

import React, { useState } from "react";
import {
  X,
  Eye,
  Smartphone,
  Monitor,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  Share2,
  Send,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { markdownToLabHtml } from "@/lib/markdown-importer";

interface PostLivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  postType: string;
  tags: string[];
  readingTime: number;
  authorName?: string;
  authorTitle?: string;
  onPublish?: () => void;
  isSubmitting?: boolean;
}

export function PostLivePreviewModal({
  isOpen,
  onClose,
  title,
  excerpt,
  content,
  coverImage,
  postType,
  tags,
  readingTime,
  authorName = "Admin Lab",
  authorTitle = "Mentor Lab",
  onPublish,
  isSubmitting = false,
}: PostLivePreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

  if (!isOpen) return null;

  // Render HTML nếu nội dung là Markdown
  const isHtml = content.trim().startsWith("<") && content.includes("</");
  const renderedContent = isHtml ? content : markdownToLabHtml(content);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-bg-panel border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-bg-elevated/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <span>Xem Trước Trực Quan Bài Viết (Live Reader View)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold">
                  Mô phỏng 100% người đọc
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Switcher */}
            <div className="hidden sm:flex items-center bg-bg-panel p-1 rounded-xl border border-border gap-1">
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                className={`p-1.5 rounded-lg transition-all ${
                  deviceMode === "desktop"
                    ? "bg-accent text-white shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
                title="Giao diện Máy tính (Desktop)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                className={`p-1.5 rounded-lg transition-all ${
                  deviceMode === "mobile"
                    ? "bg-accent text-white shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
                title="Giao diện Điện thoại (Mobile)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {onPublish && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onPublish}
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Đang xuất bản..." : "Xuất Bản Ngay"}</span>
              </Button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - Canvas mô phỏng */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-[#0d121f]/60 dark:bg-bg-canvas flex justify-center">
          <div
            className={`w-full transition-all bg-bg-panel rounded-3xl border border-border p-6 sm:p-10 shadow-xl space-y-8 ${
              deviceMode === "mobile" ? "max-w-[420px] my-2" : "max-w-3xl"
            }`}
          >
            {/* Header Metadata */}
            <div className="space-y-4">
              {/* Type Badge & Reading Time */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold uppercase tracking-wider text-[10px]">
                  {postType === "technical"
                    ? "⚡ Kỹ Thuật Chuyên Sâu"
                    : postType === "daily"
                    ? "🔬 Nhật Ký Thực Nghiệm"
                    : postType === "recruitment"
                    ? "📢 Tuyển Thành Viên"
                    : postType === "event"
                    ? "🏆 Sự Kiện Lab"
                    : "📌 Tin Tức Lab"}
                </span>

                <span className="text-text-muted flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{readingTime} phút đọc</span>
                </span>
                <span className="text-text-muted flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hôm nay</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary leading-tight tracking-tight">
                {title || "Tiêu đề bài viết mẫu"}
              </h1>

              {/* Author info */}
              <div className="flex items-center gap-3 pt-2 pb-4 border-b border-border/70">
                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold flex items-center justify-center text-sm shadow-inner">
                  {authorName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-text-primary">{authorName}</div>
                  <div className="text-[11px] text-accent font-medium">{authorTitle}</div>
                </div>
              </div>

              {/* Excerpt Callout */}
              {excerpt && (
                <div className="p-4 sm:p-5 rounded-2xl bg-bg-elevated/70 border-l-4 border-accent text-xs sm:text-sm text-text-secondary leading-relaxed italic shadow-xs">
                  {excerpt}
                </div>
              )}

              {/* Cover Image */}
              {coverImage && coverImage !== "/images/logo.png" && (
                <div className="rounded-2xl overflow-hidden border border-border shadow-lg my-4 max-h-[420px]">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Article Content Rendered */}
            <article
              className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-text-secondary leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {/* Tags Footer */}
            {tags && tags.length > 0 && (
              <div className="pt-6 border-t border-border flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-text-muted flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Tags:</span>
                </span>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-bg-elevated text-text-secondary border border-border text-[11px] font-mono font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
