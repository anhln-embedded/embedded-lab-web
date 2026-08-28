"use client";

import React, { useState, useEffect } from "react";
import { TutorialPost } from "@/lib/tutorials-data";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Save,
  Edit3,
  FileCode,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  History,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TechMarkdownEditor } from "@/components/editor/TechMarkdownEditor";

interface QuickArticleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicSlug: string;
  post: TutorialPost;
  onSaved: (updatedPost: TutorialPost) => void;
  onOpenHistory?: () => void;
}

export function QuickArticleEditModal({
  isOpen,
  onClose,
  topicSlug,
  post,
  onSaved,
  onOpenHistory,
}: QuickArticleEditModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState(post.title || "");
  const [readTime, setReadTime] = useState(post.readTime || "10 phút");
  const [summary, setSummary] = useState(post.summary || "");
  const [contentHtml, setContentHtml] = useState(post.contentHtml || "");
  const [hasCodeSnippet, setHasCodeSnippet] = useState(!!post.codeSnippet);
  const [code, setCode] = useState(post.codeSnippet?.code || "");
  const [codeLang, setCodeLang] = useState(post.codeSnippet?.language || "c");
  const [codeFilename, setCodeFilename] = useState(post.codeSnippet?.filename || "main.c");
  const [changeSummary, setChangeSummary] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(post.title || "");
      setReadTime(post.readTime || "10 phút");
      setSummary(post.summary || "");
      setContentHtml(post.contentHtml || "");
      setHasCodeSnippet(!!post.codeSnippet);
      setCode(post.codeSnippet?.code || "");
      setCodeLang(post.codeSnippet?.language || "c");
      setCodeFilename(post.codeSnippet?.filename || "main.c");
      setChangeSummary("");
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, post]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Tiêu đề bài viết không được để trống");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/tutorials/${topicSlug}/articles/${post.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          readTime: readTime.trim() || "10 phút",
          summary: summary.trim(),
          contentHtml,
          codeSnippet: hasCodeSnippet && code.trim() ? code : null,
          codeLang: hasCodeSnippet ? codeLang : "c",
          codeFilename: hasCodeSnippet ? codeFilename : "main.c",
          changeSummary: changeSummary.trim() || `Chỉnh sửa bởi ${user?.name || "Admin"}`,
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
        const formatted: TutorialPost = {
          ...post,
          title: updatedArticle.title,
          readTime: updatedArticle.readTime,
          summary: updatedArticle.summary || "",
          contentHtml: updatedArticle.contentHtml || "",
          updatedAt: new Date().toISOString().split("T")[0],
          codeSnippet: updatedArticle.codeSnippet
            ? {
                code: updatedArticle.codeSnippet,
                language: updatedArticle.codeLang || "c",
                filename: updatedArticle.codeFilename || "main.c",
              }
            : undefined,
        };

        setSuccessMsg("Đã lưu bài viết và ghi nhận lịch sử chỉnh sửa thành công!");
        onSaved(formatted);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(json.error || "Không thể lưu bài viết");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi kết nối máy chủ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-bg-panel border border-border/80 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-bg-elevated/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-text-primary flex items-center gap-2">
                <span>Chỉnh Sửa Nhanh Bài Học</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-mono">
                  Bài {post.order}
                </span>
              </h2>
              <p className="text-xs text-text-muted">
                Tự động lưu vết chỉnh sửa của <strong className="text-accent">{user?.name || "Admin"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenHistory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistory();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-bg-panel border border-border text-xs font-semibold text-text-secondary hover:text-accent transition-all cursor-pointer"
                title="Xem lịch sử các lần sửa bài này"
              >
                <History className="w-4 h-4 text-accent" />
                <span className="hidden sm:inline">Lịch sử sửa</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Row 1: Title & Read Time */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-text-secondary">
                Tiêu đề bài học <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Bài 1: Cấu Trúc Bộ Nhớ C..."
                className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border focus:border-accent text-sm text-text-primary outline-none font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>Thời gian đọc</span>
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="VD: 5 phút"
                className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border focus:border-accent text-sm text-text-primary outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 2: Summary */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Tóm tắt cốt lõi bài học</span>
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Tóm tắt ngắn gọn 1-2 câu về kiến thức cốt lõi..."
              className="w-full px-4 py-2 rounded-xl bg-bg-elevated border border-border focus:border-accent text-xs text-text-primary outline-none"
            />
          </div>

          {/* Row 3: Rich Markdown Pro Editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-accent" />
              <span>Nội dung bài học (Tech Markdown Pro Editor)</span>
            </label>
            <TechMarkdownEditor
              value={contentHtml}
              onChange={(val) => setContentHtml(val)}
              draftKey={`quick_edit_${topicSlug}_${post.slug}`}
              minHeight="380px"
            />
          </div>

          {/* Row 4: Code Snippet (Optional) */}
          <div className="p-4 rounded-2xl bg-bg-elevated/40 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-primary flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasCodeSnippet}
                  onChange={(e) => setHasCodeSnippet(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent w-4 h-4 cursor-pointer accent-accent"
                />
                <FileCode className="w-4 h-4 text-accent" />
                <span>Đính kèm khối mã nguồn mẫu (Source Code)</span>
              </label>

              {hasCodeSnippet && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={codeFilename}
                    onChange={(e) => setCodeFilename(e.target.value)}
                    placeholder="filename (main.c)"
                    className="px-2.5 py-1 rounded-lg bg-bg-panel border border-border text-xs font-mono text-text-primary outline-none w-32 text-center"
                  />
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-bg-panel border border-border text-xs font-mono text-text-primary outline-none cursor-pointer"
                  >
                    <option value="c">C / C++</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="bash">Bash / Shell</option>
                    <option value="makefile">Makefile</option>
                  </select>
                </div>
              )}
            </div>

            {hasCodeSnippet && (
              <textarea
                rows={5}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Viết mã nguồn mẫu C tại đây..."
                className="w-full p-3.5 rounded-xl bg-black/50 border border-border focus:border-accent text-xs font-mono text-emerald-400 outline-none leading-relaxed"
              />
            )}
          </div>

          {/* Row 5: Change Summary (Ghi chú cập nhật) */}
          <div className="space-y-1.5 pt-2 border-t border-border/80">
            <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-accent" />
              <span>Ghi chú thay đổi (Lý do cập nhật cho phiên bản này)</span>
            </label>
            <input
              type="text"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="VD: Bổ sung sơ đồ bộ nhớ ARM Cortex-M và sửa lỗi cú pháp bitmasking..."
              className="w-full px-4 py-2 rounded-xl bg-bg-elevated border border-border focus:border-accent text-xs text-text-primary outline-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="bg-accent hover:bg-accent-hover text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-accent/20 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Bài Viết & Ghi Lịch Sử</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
