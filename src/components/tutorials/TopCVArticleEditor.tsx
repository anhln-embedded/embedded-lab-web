"use client";

import React, { useState, useEffect, useRef } from "react";
import { TutorialPost } from "@/lib/tutorials-data";
import { useAuth } from "@/context/AuthContext";
import { markdownToLabHtml } from "@/lib/markdown-importer";
import { CodeSnippetView } from "@/components/ui/CodeSnippetView";
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  Check,
  Save,
  X,
  History,
  Eye,
  FileCode,
  AlertTriangle,
  Lightbulb,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Table,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sliders,
  Layers,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ContentBlock {
  id: string;
  type: "h2" | "h3" | "paragraph" | "code" | "tip" | "warning" | "table";
  title?: string;
  content: string;
  codeLang?: string;
  codeFilename?: string;
}

interface TopCVArticleEditorProps {
  topicSlug: string;
  post: TutorialPost;
  onClose: () => void;
  onSaved: (updatedPost: TutorialPost) => void;
  onOpenHistory?: () => void;
}

// Chuyển đổi Markdown thô / HTML sang danh sách ContentBlock
export function parseContentToBlocks(rawContent: string): ContentBlock[] {
  if (!rawContent || !rawContent.trim()) {
    return [
      {
        id: "b_1",
        type: "paragraph",
        content: "Bấm vào đây để bắt đầu nhập nội dung bài viết...",
      },
    ];
  }

  const lines = rawContent.split(/\r?\n/);
  const blocks: ContentBlock[] = [];
  let currentParagraphLines: string[] = [];
  let currentCodeLines: string[] = [];
  let inCodeBlock = false;
  let codeLang = "c";
  let codeFilename = "main.c";

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join("\n").trim();
      if (text) {
        blocks.push({
          id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: "paragraph",
          content: text,
        });
      }
      currentParagraphLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bắt đầu hoặc kết thúc khối code
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        flushParagraph();
        inCodeBlock = true;
        currentCodeLines = [];
        const match = line.trim().match(/^```([a-zA-Z0-9_-]+)?(?:\s+filename="([^"]+)")?/);
        codeLang = match?.[1] || "c";
        codeFilename = match?.[2] || "main.c";
      } else {
        inCodeBlock = false;
        blocks.push({
          id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: "code",
          content: currentCodeLines.join("\n"),
          codeLang,
          codeFilename,
        });
        currentCodeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      currentCodeLines.push(line);
      continue;
    }

    // Tiêu đề H2 (## ...)
    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({
        id: `h2_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: "h2",
        title: line.replace(/^##\s+/, "").trim(),
        content: "",
      });
      continue;
    }

    // Tiêu đề H3 (### ...)
    if (line.startsWith("### ")) {
      flushParagraph();
      blocks.push({
        id: `h3_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: "h3",
        title: line.replace(/^###\s+/, "").trim(),
        content: "",
      });
      continue;
    }

    // Tip Callout (> [!TIP] ...)
    if (line.trim().startsWith("> [!TIP]") || line.trim().startsWith("> [!NOTE]")) {
      flushParagraph();
      const tipText = line.replace(/^>\s*\[!(TIP|NOTE)\]\s*/, "").trim();
      blocks.push({
        id: `tip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: "tip",
        content: tipText,
      });
      continue;
    }

    // Warning Callout (> [!WARNING] ...)
    if (line.trim().startsWith("> [!WARNING]") || line.trim().startsWith("> [!IMPORTANT]")) {
      flushParagraph();
      const warnText = line.replace(/^>\s*\[!(WARNING|IMPORTANT)\]\s*/, "").trim();
      blocks.push({
        id: `warn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: "warning",
        content: warnText,
      });
      continue;
    }

    // Đoạn văn thông thường
    currentParagraphLines.push(line);
  }

  flushParagraph();

  if (blocks.length === 0) {
    blocks.push({
      id: "b_init",
      type: "paragraph",
      content: rawContent,
    });
  }

  return blocks;
}

// Chuyển đổi danh sách ContentBlock về lại Markdown hoàn chỉnh để lưu
export function serializeBlocksToMarkdown(blocks: ContentBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "h2":
          return `\n## ${b.title || "Tiêu đề mục"}\n`;
        case "h3":
          return `\n### ${b.title || "Tiêu đề mục con"}\n`;
        case "tip":
          return `\n> [!TIP] ${b.content}\n`;
        case "warning":
          return `\n> [!WARNING] ${b.content}\n`;
        case "code":
          return `\n\`\`\`${b.codeLang || "c"} filename="${b.codeFilename || "main.c"}"\n${b.content}\n\`\`\`\n`;
        case "table":
        case "paragraph":
        default:
          return `${b.content}\n`;
      }
    })
    .join("\n")
    .trim();
}

export function TopCVArticleEditor({
  topicSlug,
  post,
  onClose,
  onSaved,
  onOpenHistory,
}: TopCVArticleEditorProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState(post.title || "");
  const [readTime, setReadTime] = useState(post.readTime || "10 phút");
  const [summary, setSummary] = useState(post.summary || "");
  const [hasCodeSnippet, setHasCodeSnippet] = useState(!!post.codeSnippet);
  const [heroCode, setHeroCode] = useState(post.codeSnippet?.code || "");
  const [heroCodeLang, setHeroCodeLang] = useState(post.codeSnippet?.language || "c");
  const [heroCodeFilename, setHeroCodeFilename] = useState(post.codeSnippet?.filename || "main.c");

  const [blocks, setBlocks] = useState<ContentBlock[]>(() =>
    parseContentToBlocks(post.contentHtml || "")
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [changeSummaryNote, setChangeSummaryNote] = useState("");
  const [activeAddMenuBlockId, setActiveAddMenuBlockId] = useState<string | null>(null);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  // Xử lý khi người dùng muốn thoát
  const handleAttemptClose = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirmModal(true);
    } else {
      onClose();
    }
  };

  // Phím tắt ESC để thoát editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showExitConfirmModal) {
          setShowExitConfirmModal(false);
        } else if (hasUnsavedChanges) {
          setShowExitConfirmModal(true);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasUnsavedChanges, showExitConfirmModal, onClose]);

  // Thêm block mới
  const addBlock = (
    type: ContentBlock["type"],
    afterBlockId?: string
  ) => {
    const newBlock: ContentBlock = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: type === "h2" ? "Tiêu đề phân mục mới" : type === "h3" ? "Tiêu đề mục nhỏ" : undefined,
      content:
        type === "tip"
          ? "Mẹo tối ưu kỹ thuật: Hãy sử dụng cờ tối ưu -O2 và ép kiểu dữ liệu rõ ràng..."
          : type === "warning"
          ? "Cảnh báo phần cứng: Tránh ghi đè lên vùng nhớ thanh ghi khi chưa bật xung nhịp ngoại vi!"
          : type === "code"
          ? `// Mã nguồn minh họa\nvoid init_hardware(void) {\n    // Cấu hình thanh ghi\n}`
          : "Nhập nội dung đoạn văn phân tích kỹ thuật tại đây...",
      codeLang: type === "code" ? "c" : undefined,
      codeFilename: type === "code" ? "demo.c" : undefined,
    };

    setBlocks((prev) => {
      if (!afterBlockId) {
        return [...prev, newBlock];
      }
      const index = prev.findIndex((b) => b.id === afterBlockId);
      if (index === -1) return [...prev, newBlock];
      const next = [...prev];
      next.splice(index + 1, 0, newBlock);
      return next;
    });

    setHasUnsavedChanges(true);
    setActiveAddMenuBlockId(null);
  };

  // Xóa block
  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setHasUnsavedChanges(true);
  };

  // Di chuyển block lên/xuống
  const moveBlock = (id: string, direction: "up" | "down") => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      if (index === -1) return prev;
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Cập nhật nội dung của 1 block
  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    setHasUnsavedChanges(true);
  };

  // Lưu toàn bộ bài viết về Database
  const handleSave = async () => {
    setIsSaving(true);
    const serializedMarkdown = serializeBlocksToMarkdown(blocks);

    try {
      const res = await fetch(`/api/tutorials/${topicSlug}/articles/${post.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          readTime: readTime.trim(),
          summary: summary.trim(),
          contentHtml: serializedMarkdown,
          codeSnippet: hasCodeSnippet && heroCode.trim() ? heroCode : null,
          codeLang: hasCodeSnippet ? heroCodeLang : "c",
          codeFilename: hasCodeSnippet ? heroCodeFilename : "main.c",
          changeSummary: changeSummaryNote.trim() || `Chỉnh sửa TopCV bởi ${user?.name || "Admin"}`,
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
        const updatedPost: TutorialPost = {
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

        setHasUnsavedChanges(false);
        setSaveSuccess(true);
        onSaved(updatedPost);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2500);
      } else {
        alert(json.error || "Không thể lưu bài viết");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi lưu dữ liệu");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg-primary/98 backdrop-blur-2xl flex flex-col select-text animate-in fade-in duration-200">
      {/* 1. TOPCV STICKY CONTROL HEADER */}
      <header className="sticky top-0 z-50 bg-bg-panel/90 border-b border-border/80 backdrop-blur-xl px-4 sm:px-8 py-3 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Left: Editor Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent via-amber-500 to-accent text-white flex items-center justify-center shadow-lg shadow-accent/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-accent">
                Trình Chỉnh Sửa Trực Quan TopCV
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold">
                Bài {post.order}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-text-primary line-clamp-1 max-w-[320px] sm:max-w-md">
              {title || post.title}
            </h2>
          </div>
        </div>

        {/* Center: Save State Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          {hasUnsavedChanges ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Có thay đổi chưa lưu
            </span>
          ) : saveSuccess ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã lưu tất cả thay đổi
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-elevated text-text-muted border border-border">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Đã đồng bộ với SQLite
            </span>
          )}
        </div>

        {/* Right: Actions (Add Block, History, Save, Close) */}
        <div className="flex items-center gap-2.5">
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-elevated hover:bg-bg-panel border border-border text-xs font-semibold text-text-secondary hover:text-accent transition-all cursor-pointer shadow-xs"
              title="Xem lịch sử các phiên bản sửa đổi"
            >
              <History className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline">Lịch sử</span>
            </button>
          )}

          {/* Quick Add Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveAddMenuBlockId(activeAddMenuBlockId === "top" ? null : "top")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-elevated hover:bg-bg-panel border border-border text-xs font-bold text-text-primary hover:text-accent transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-accent" />
              <span>Thêm khối</span>
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </button>

            {activeAddMenuBlockId === "top" && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-bg-panel border border-border/90 shadow-2xl p-2 z-50 space-y-1 animate-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => addBlock("h2")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left cursor-pointer"
                >
                  <Heading2 className="w-4 h-4 text-accent" />
                  <span>Tiêu đề phân mục lớn (H2)</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("h3")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left cursor-pointer"
                >
                  <Heading3 className="w-4 h-4 text-accent" />
                  <span>Tiêu đề mục con (H3)</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("paragraph")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left cursor-pointer"
                >
                  <Type className="w-4 h-4 text-accent" />
                  <span>Đoạn văn bản kỹ thuật</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("code")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-accent" />
                  <span>Khối mã nguồn mẫu (C/C++)</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("tip")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  <span>Mẹo tối ưu kỹ thuật (Tip)</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("warning")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Cảnh báo phần cứng (Warning)</span>
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button
            type="button"
            variant="primary"
            disabled={isSaving}
            onClick={handleSave}
            className="bg-gradient-to-r from-accent to-amber-500 hover:from-accent-hover hover:to-amber-600 text-white font-extrabold text-xs shadow-xl shadow-accent/25 px-4 py-2 flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu bài viết</span>
              </>
            )}
          </Button>

          {/* Close / Cancel Button */}
          <button
            type="button"
            onClick={handleAttemptClose}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-elevated hover:bg-rose-500/15 border border-border hover:border-rose-500/30 text-xs font-semibold text-text-secondary hover:text-rose-400 transition-all cursor-pointer shadow-xs"
            title="Thoát trình chỉnh sửa (Phím tắt: ESC)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Thoát</span>
          </button>
        </div>
      </header>

      {/* 2. TOPCV MAIN VISUAL CANVAS (GIAO DIỆN BÀI VIẾT TRỰC QUAN NHƯ NGƯỜI DÙNG THẤY) */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Banner hướng dẫn phong cách TopCV */}
        <div className="p-4 rounded-3xl bg-accent/10 border border-accent/30 text-accent text-xs font-bold flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>
              💡 <strong>Chế độ TopCV:</strong> Trỏ chuột vào bất kỳ khối nào để sửa chữ trực tiếp, dùng các nút ➕ ⬆️ ⬇️ 🗑️ ở góc khối để sắp xếp hoặc thêm nội dung mới.
            </span>
          </div>
          <span className="text-[11px] text-text-muted font-normal">
            Người sửa: <strong className="text-accent">{user?.name || "Admin"}</strong>
          </span>
        </div>

        {/* --- BLOCK 1: HERO HEADER & METADATA --- */}
        <section className="relative rounded-3xl bg-bg-panel border-2 border-dashed border-border/80 hover:border-accent/80 p-6 sm:p-10 shadow-2xl space-y-6 transition-all group">
          {/* TopCV Hover Floating Badge */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-bg-elevated/95 backdrop-blur-md px-3 py-1 rounded-xl border border-border text-[11px] font-extrabold text-accent shadow-md">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Khối Tiêu Đề & Thông Tin</span>
          </div>

          {/* Meta Inputs (Read Time & Order) */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-accent/15 text-accent border border-accent/30">
                Bài {post.order} / Chuyên đề
              </span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent" />
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => {
                    setReadTime(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Thời gian đọc (VD: 5 phút)"
                  className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border focus:border-accent text-xs font-mono text-text-primary outline-none w-28"
                />
              </div>
            </div>

            <span className="text-[11px] text-text-muted">
              Cập nhật: {new Date().toLocaleDateString("vi-VN")}
            </span>
          </div>

          {/* Big Title (H1 Editable) */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
              Tiêu đề bài viết:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="Nhập tiêu đề bài học..."
              className="w-full text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary bg-bg-elevated/50 hover:bg-bg-elevated focus:bg-bg-elevated border border-transparent focus:border-accent p-3 rounded-2xl outline-none transition-all"
            />
          </div>

          {/* Summary Callout Editable */}
          <div className="space-y-1 pt-2">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>Tóm tắt cốt lõi bài học (Callout đầu bài):</span>
            </label>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-bg-elevated/90 to-bg-panel border-l-4 border-accent shadow-md">
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Tóm tắt ngắn gọn 1-2 câu cốt lõi của bài viết..."
                className="w-full bg-transparent text-sm sm:text-base text-text-secondary leading-relaxed outline-none resize-none"
              />
            </div>
          </div>
        </section>

        {/* --- BLOCK 2: HERO CODE SNIPPET (NẾU CÓ) --- */}
        <section className="relative rounded-3xl bg-bg-panel border-2 border-dashed border-border/80 hover:border-accent/80 p-6 shadow-xl space-y-4 transition-all group">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-primary flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasCodeSnippet}
                onChange={(e) => {
                  setHasCodeSnippet(e.target.checked);
                  setHasUnsavedChanges(true);
                }}
                className="rounded border-border text-accent focus:ring-accent w-4 h-4 cursor-pointer"
              />
              <FileCode className="w-4 h-4 text-accent" />
              <span>Khối Mã Nguồn Mẫu Chuẩn Lab (Đầu bài viết)</span>
            </label>

            {hasCodeSnippet && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={heroCodeFilename}
                  onChange={(e) => {
                    setHeroCodeFilename(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="filename"
                  className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-xs font-mono text-text-primary outline-none w-32"
                />
                <select
                  value={heroCodeLang}
                  onChange={(e) => {
                    setHeroCodeLang(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-xs font-mono text-text-primary outline-none cursor-pointer"
                >
                  <option value="c">C / C++</option>
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                  <option value="bash">Bash / Shell</option>
                </select>
              </div>
            )}
          </div>

          {hasCodeSnippet && (
            <textarea
              rows={6}
              value={heroCode}
              onChange={(e) => {
                setHeroCode(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="// Nhập mã nguồn mẫu C tại đây..."
              className="w-full p-4 rounded-2xl bg-bg-elevated border border-border focus:border-accent text-xs font-mono text-text-primary outline-none leading-relaxed"
            />
          )}
        </section>

        {/* --- BLOCK 3: DANH SÁCH CÁC PHÂN MỤC NỘI DUNG (TOPCV SECTIONS) --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              <span>Các Phân Mục Nội Dung Bài Viết ({blocks.length} khối)</span>
            </h3>
          </div>

          {blocks.map((block, index) => {
            return (
              <div
                key={block.id}
                className="relative group rounded-3xl bg-bg-panel border-2 border-dashed border-border/80 hover:border-accent p-6 shadow-xl transition-all space-y-3"
              >
                {/* TopCV Block Actions Bar (Góc trên bên phải mỗi khối) */}
                <div className="absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-bg-elevated/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-border shadow-lg z-20">
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, "up")}
                    disabled={index === 0}
                    className="p-1 rounded-lg hover:bg-bg-panel text-text-muted hover:text-accent disabled:opacity-30 cursor-pointer"
                    title="Di chuyển lên trên"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, "down")}
                    disabled={index === blocks.length - 1}
                    className="p-1 rounded-lg hover:bg-bg-panel text-text-muted hover:text-accent disabled:opacity-30 cursor-pointer"
                    title="Di chuyển xuống dưới"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-px h-3 bg-border mx-0.5" />

                  <button
                    type="button"
                    onClick={() =>
                      setActiveAddMenuBlockId(
                        activeAddMenuBlockId === block.id ? null : block.id
                      )
                    }
                    className="p-1 rounded-lg hover:bg-bg-panel text-text-muted hover:text-accent cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    title="Chèn khối mới ngay dưới mục này"
                  >
                    <Plus className="w-3.5 h-3.5 text-accent" />
                    <span>Chèn thêm</span>
                  </button>

                  <span className="w-px h-3 bg-border mx-0.5" />

                  <button
                    type="button"
                    onClick={() => deleteBlock(block.id)}
                    className="p-1 rounded-lg hover:bg-rose-500/20 text-text-muted hover:text-rose-400 cursor-pointer"
                    title="Xóa khối này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Dropdown Menu Chèn Khối Ngay Dưới */}
                {activeAddMenuBlockId === block.id && (
                  <div className="absolute right-4 top-6 w-64 rounded-2xl bg-bg-panel border border-border shadow-2xl p-2 z-30 space-y-1 animate-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => addBlock("h2", block.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left"
                    >
                      <Heading2 className="w-3.5 h-3.5 text-accent" />
                      <span>Thêm Tiêu đề H2</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock("h3", block.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left"
                    >
                      <Heading3 className="w-3.5 h-3.5 text-accent" />
                      <span>Thêm Tiêu đề H3</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock("paragraph", block.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left"
                    >
                      <Type className="w-3.5 h-3.5 text-accent" />
                      <span>Thêm Đoạn văn</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock("code", block.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left"
                    >
                      <FileCode className="w-3.5 h-3.5 text-accent" />
                      <span>Thêm Khối Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock("tip", block.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Thêm Mẹo tối ưu (Tip)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock("warning", block.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-text-primary hover:bg-accent/15 hover:text-accent transition-colors text-left"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Thêm Cảnh báo (Warning)</span>
                    </button>
                  </div>
                )}

                {/* Render theo từng loại Block */}
                {block.type === "h2" && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-7 bg-accent rounded-full flex-shrink-0" />
                    <input
                      type="text"
                      value={block.title || ""}
                      onChange={(e) =>
                        updateBlock(block.id, { title: e.target.value })
                      }
                      placeholder="Tiêu đề phân mục H2..."
                      className="w-full text-xl sm:text-2xl font-extrabold text-text-primary bg-transparent focus:bg-bg-elevated border-b border-transparent focus:border-accent px-2 py-1 outline-none transition-all"
                    />
                  </div>
                )}

                {block.type === "h3" && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    <input
                      type="text"
                      value={block.title || ""}
                      onChange={(e) =>
                        updateBlock(block.id, { title: e.target.value })
                      }
                      placeholder="Tiêu đề mục con H3..."
                      className="w-full text-lg sm:text-xl font-bold text-accent bg-transparent focus:bg-bg-elevated border-b border-transparent focus:border-accent px-2 py-1 outline-none transition-all"
                    />
                  </div>
                )}

                {block.type === "paragraph" && (
                  <textarea
                    rows={3}
                    value={block.content}
                    onChange={(e) =>
                      updateBlock(block.id, { content: e.target.value })
                    }
                    placeholder="Nhập nội dung đoạn văn..."
                    className="w-full text-base sm:text-lg text-text-primary leading-[1.85] bg-transparent focus:bg-bg-elevated p-2 rounded-xl outline-none transition-all resize-y"
                  />
                )}

                {block.type === "tip" && (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border-l-4 border-emerald-500 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Lightbulb className="w-4 h-4" />
                      <span>Mẹo Tối Ưu Kỹ Thuật (Tip)</span>
                    </div>
                    <textarea
                      rows={2}
                      value={block.content}
                      onChange={(e) =>
                        updateBlock(block.id, { content: e.target.value })
                      }
                      placeholder="Nội dung mẹo kỹ thuật..."
                      className="w-full bg-transparent text-sm sm:text-base text-text-secondary leading-relaxed outline-none resize-none"
                    />
                  </div>
                )}

                {block.type === "warning" && (
                  <div className="p-5 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Lưu Ý & Cảnh Báo Phần Cứng (Warning)</span>
                    </div>
                    <textarea
                      rows={2}
                      value={block.content}
                      onChange={(e) =>
                        updateBlock(block.id, { content: e.target.value })
                      }
                      placeholder="Nội dung cảnh báo..."
                      className="w-full bg-transparent text-sm sm:text-base text-text-secondary leading-relaxed outline-none resize-none"
                    />
                  </div>
                )}

                {block.type === "code" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                        <FileCode className="w-4 h-4" />
                        <span>Mã nguồn nhúng</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={block.codeFilename || "code.c"}
                          onChange={(e) =>
                            updateBlock(block.id, { codeFilename: e.target.value })
                          }
                          placeholder="filename"
                          className="px-2 py-0.5 rounded-lg bg-bg-elevated border border-border text-xs font-mono text-text-primary outline-none w-28"
                        />
                        <select
                          value={block.codeLang || "c"}
                          onChange={(e) =>
                            updateBlock(block.id, { codeLang: e.target.value })
                          }
                          className="px-2 py-0.5 rounded-lg bg-bg-elevated border border-border text-xs font-mono text-text-primary outline-none"
                        >
                          <option value="c">C / C++</option>
                          <option value="cpp">C++</option>
                          <option value="python">Python</option>
                          <option value="bash">Bash</option>
                        </select>
                      </div>
                    </div>
                    <textarea
                      rows={5}
                      value={block.content}
                      onChange={(e) =>
                        updateBlock(block.id, { content: e.target.value })
                      }
                      placeholder="// Viết code tại đây..."
                      className="w-full p-4 rounded-2xl bg-bg-elevated border border-border focus:border-accent text-xs font-mono text-text-primary outline-none leading-relaxed"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Add Section Button */}
          <div className="p-8 text-center rounded-3xl border-2 border-dashed border-border/80 hover:border-accent/80 transition-all bg-bg-panel/40 space-y-3">
            <p className="text-xs text-text-muted font-medium">
              Bạn muốn thêm nội dung mới vào cuối bài học?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => addBlock("h2")}
                className="text-xs font-bold gap-1.5"
              >
                <Heading2 className="w-3.5 h-3.5 text-accent" />
                <span>+ Phân mục H2</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => addBlock("paragraph")}
                className="text-xs font-bold gap-1.5"
              >
                <Type className="w-3.5 h-3.5 text-accent" />
                <span>+ Đoạn văn</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => addBlock("code")}
                className="text-xs font-bold gap-1.5"
              >
                <FileCode className="w-3.5 h-3.5 text-accent" />
                <span>+ Khối Code</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => addBlock("tip")}
                className="text-xs font-bold gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Mẹo hay</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* --- CONFIRM EXIT MODAL (KHI PHÁT HIỆN THAY ĐỔI CHƯA LƯU) --- */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-bg-panel border-2 border-amber-500/50 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-text-primary">
                  Lưu thay đổi bài viết?
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Bạn có các thay đổi chưa được lưu. Nếu thoát ngay bây giờ, các chỉnh sửa vừa rồi sẽ bị mất.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-border/80">
              <button
                type="button"
                onClick={() => setShowExitConfirmModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all cursor-pointer"
              >
                Tiếp tục chỉnh sửa
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExitConfirmModal(false);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Không lưu & Thoát</span>
              </button>

              <Button
                type="button"
                variant="primary"
                disabled={isSaving}
                onClick={async () => {
                  await handleSave();
                  setShowExitConfirmModal(false);
                  onClose();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-accent to-amber-500 hover:from-accent-hover hover:to-amber-600 text-white text-xs font-extrabold px-4 py-2 flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu & Thoát</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
