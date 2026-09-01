"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { safeStorage } from "@/lib/utils";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  FileCode,
  Table,
  Image as ImageIcon,
  Sparkles,
  Columns,
  Eye,
  Edit3,
  RotateCcw,
  Check,
  AlertTriangle,
  Lightbulb,
  Info,
  ShieldAlert,
  GitBranch,
  Copy,
  Upload,
  Clock,
  Cpu,
  Layers,
  Sliders,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { markdownToLabHtml } from "@/lib/markdown-importer";
import { MediaManagerModal } from "@/components/media/MediaManagerModal";

interface TechMarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  draftKey?: string;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function TechMarkdownEditor({
  value,
  onChange,
  draftKey,
  placeholder = "Bắt đầu soạn thảo nội dung kỹ thuật với Markdown, C Code, Bảng thanh ghi...",
  className = "",
  minHeight = "480px",
}: TechMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<"split" | "write" | "preview">("split");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Auto-save & LocalStorage Draft
  const [draftDetected, setDraftDetected] = useState<{ text: string; time: string } | null>(null);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);

  // Stats
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 180));

  // 1. Kiểm tra bản nháp LocalStorage khi khởi tạo
  useEffect(() => {
    if (!draftKey || typeof window === "undefined") return;
    try {
      const saved = safeStorage.getItem(`draft_${draftKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.text && parsed.text !== value && parsed.text.length > 20) {
          setDraftDetected({
            text: parsed.text,
            time: parsed.time || "Gần đây",
          });
        }
      }
    } catch {
      // ignore
    }
  }, [draftKey]);

  // 2. Tự động lưu vào LocalStorage mỗi khi nội dung thay đổi
  useEffect(() => {
    if (!draftKey || typeof window === "undefined" || !value) return;
    const timer = setTimeout(() => {
      try {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        safeStorage.setItem(
          `draft_${draftKey}`,
          JSON.stringify({
            text: value,
            time: timeStr,
            updatedAt: Date.now(),
          })
        );
        setLastAutoSavedTime(timeStr);
      } catch (e) {
        console.warn("Auto-save failed:", e);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [value, draftKey]);

  // Khôi phục bản nháp
  const handleRestoreDraft = () => {
    if (draftDetected) {
      onChange(draftDetected.text);
      setDraftDetected(null);
    }
  };

  // Hủy bản nháp đã lưu
  const handleDiscardDraft = () => {
    if (draftKey && typeof window !== "undefined") {
      try {
        safeStorage.removeItem(`draft_${draftKey}`);
      } catch (e) {}
    }
    setDraftDetected(null);
  };

  // Hàm chèn ký tự / template vào đúng vị trí con trỏ
  const insertTextAtCursor = useCallback(
    (prefix: string, suffix: string = "", defaultText: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end) || defaultText;

      const replacement = `${prefix}${selectedText}${suffix}`;
      const newValue = value.substring(0, start) + replacement + value.substring(end);

      onChange(newValue);

      // Đặt lại vị trí con trỏ sau khi chèn
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selectedText.length
        );
      }, 0);
    },
    [value, onChange]
  );

  // Xử lý upload ảnh
  const uploadImageFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        return json.url;
      }
      alert(json.error || "Lỗi tải ảnh");
      return null;
    } catch (e: any) {
      alert(`Lỗi upload ảnh: ${e.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Paste ảnh trực tiếp từ Clipboard
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const url = await uploadImageFile(file);
          if (url) {
            const imgMarkdown = `\n\n![${file.name.replace(/\.[^/.]+$/, "")}](${url})\n\n`;
            insertTextAtCursor(imgMarkdown);
          }
        }
        break;
      }
    }
  };

  // 4. Kéo thả file ảnh vào Textarea
  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        e.preventDefault();
        const url = await uploadImageFile(file);
        if (url) {
          const imgMarkdown = `\n\n![${file.name.replace(/\.[^/.]+$/, "")}](${url})\n\n`;
          insertTextAtCursor(imgMarkdown);
        }
      }
    }
  };

  // Hỗ trợ phím Tab thụt đầu dòng 2 khoảng trắng
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      insertTextAtCursor("  ", "");
    }
  };

  // Render HTML preview
  const renderedHtml = markdownToLabHtml(value);

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-bg-panel shadow-xl flex flex-col overflow-hidden transition-all ${
        isFullScreen ? "fixed inset-4 z-50 shadow-2xl bg-bg-panel border-accent/40" : ""
      } ${className}`}
    >
      {/* Alert Thông Báo Bản Nháp Chưa Lưu */}
      {draftDetected && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Phát hiện bản nháp chưa lưu tự động lúc <strong>{draftDetected.time}</strong>. Bạn có muốn khôi phục không?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handleRestoreDraft}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-[11px] h-7 px-2.5 rounded-lg"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Khôi phục
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDiscardDraft}
              className="text-amber-300 border-amber-500/40 hover:bg-amber-500/10 text-[11px] h-7 px-2.5 rounded-lg"
            >
              Bỏ qua
            </Button>
          </div>
        </div>
      )}

      {/* Main Tech Toolbar */}
      <div className="p-2.5 border-b border-border/80 bg-bg-elevated/70 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Styles */}
          <div className="flex items-center bg-bg-panel/80 rounded-xl p-0.5 border border-border/60">
            <button
              type="button"
              onClick={() => insertTextAtCursor("**", "**", "Chữ in đậm")}
              className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent transition-colors"
              title="In đậm (Bold - Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("*", "*", "Chữ in nghiêng")}
              className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent transition-colors"
              title="In nghiêng (Italic)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("~~", "~~", "Gạch ngang")}
              className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent transition-colors"
              title="Gạch ngang (Strikethrough)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("`", "`", "variable_or_code")}
              className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent font-mono text-xs"
              title="Mã nội dòng (Inline Code)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center bg-bg-panel/80 rounded-xl p-0.5 border border-border/60">
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n\n## ", "\n", "Tiêu đề mục H2")}
              className="px-2 py-1 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent font-bold text-xs"
              title="Tiêu đề H2 (Mục lớn)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n\n### ", "\n", "Tiêu đề mục con H3")}
              className="px-2 py-1 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent font-bold text-xs"
              title="Tiêu đề H3 (Mục con)"
            >
              H3
            </button>
          </div>

          {/* Lists & Quote */}
          <div className="flex items-center bg-bg-panel/80 rounded-xl p-0.5 border border-border/60">
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n- ", "\n", "Ý gạch đầu dòng")}
              className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent transition-colors"
              title="Danh sách gạch đầu dòng"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n1. ", "\n", "Bước 1...")}
              className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent transition-colors"
              title="Danh sách số thứ tự"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n> ", "\n", "Đoạn trích dẫn hoặc nguyên lý...")}
              className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent transition-colors"
              title="Khối trích dẫn (Quote)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Callout Blocks (Tip / Note / Warning / Important) */}
          <div className="flex items-center bg-bg-panel/80 rounded-xl p-0.5 border border-border/60 gap-0.5">
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n> [!TIP] ", "\n", "Mẹo tối ưu thanh ghi & ngắt vi điều khiển...")}
              className="px-2 py-1 rounded-lg hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] flex items-center gap-1"
              title="Chèn Khối Mẹo Kỹ Thuật (Tip)"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Tip</span>
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n> [!NOTE] ", "\n", "Lưu ý cấu hình phần cứng...")}
              className="px-2 py-1 rounded-lg hover:bg-cyan-500/20 text-cyan-400 font-semibold text-[11px] flex items-center gap-1"
              title="Chèn Khối Ghi Chú (Note)"
            >
              <Info className="w-3 h-3" />
              <span>Note</span>
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n> [!WARNING] ", "\n", "Cảnh báo quá áp / xung đột DMA...")}
              className="px-2 py-1 rounded-lg hover:bg-amber-500/20 text-amber-400 font-semibold text-[11px] flex items-center gap-1"
              title="Chèn Khối Cảnh Báo (Warning)"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Warn</span>
            </button>
          </div>

          {/* Code Blocks */}
          <div className="flex items-center bg-bg-panel/80 rounded-xl p-0.5 border border-border/60 gap-0.5">
            <button
              type="button"
              onClick={() =>
                insertTextAtCursor(
                  '\n```c filename="main.c"\n// Embedded-AIoT Lab - C Code\n#include <stdio.h>\n\nvoid app_main(void) {\n    printf("Embedded System Ready!\\n");\n}\n',
                  "```\n"
                )
              }
              className="px-2 py-1 rounded-lg hover:bg-bg-elevated text-accent font-mono text-[11px] font-bold flex items-center gap-1"
              title="Chèn Mã Nguồn C/C++"
            >
              <FileCode className="w-3 h-3" />
              <span>C Code</span>
            </button>

            <button
              type="button"
              onClick={() =>
                insertTextAtCursor(
                  '\n```python filename="tinyml_infer.py"\nimport numpy as np\n# AIoT Edge Inference\n',
                  "```\n"
                )
              }
              className="px-2 py-1 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent font-mono text-[11px] font-semibold"
              title="Chèn Mã Python TinyML"
            >
              Python
            </button>
          </div>

          {/* Register Bit Table & Pinout Table & Generic Table */}
          <div className="flex items-center bg-bg-panel/80 rounded-xl p-0.5 border border-border/60 gap-0.5">
            <button
              type="button"
              onClick={() =>
                insertTextAtCursor(`\n
| Tiêu đề 1 | Tiêu đề 2 | Tiêu đề 3 |
| :--- | :--- | :--- |
| Dữ liệu 1 | Dữ liệu 2 | Dữ liệu 3 |
| Dữ liệu 4 | Dữ liệu 5 | Dữ liệu 6 |
\n`)
              }
              className="px-2 py-1 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent font-semibold text-[11px] flex items-center gap-1"
              title="Chèn Bảng Dữ Liệu Tiêu Chuẩn"
            >
              <Table className="w-3 h-3 text-cyan-400" />
              <span>Bảng Thường</span>
            </button>

            <button
              type="button"
              onClick={() =>
                insertTextAtCursor(`\n
| Bit | Tên Trường (Field) | Quyền | Reset | Mô tả Chức năng |
| :--- | :--- | :---: | :---: | :--- |
| **31:16** | RESERVED | R | 0x0000 | Giữ nguyên cho tương lai |
| **15:8** | PRESCALER[7:0] | R/W | 0x00 | Hệ số chia tần số xung Clock |
| **7:1** | RESERVED | R | 0x0 | Không sử dụng |
| **0** | ENABLE | R/W | 0 | Bật module (1: Active, 0: Disable) |
\n`)
              }
              className="px-2 py-1 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent font-semibold text-[11px] flex items-center gap-1"
              title="Chèn Bảng Thanh Ghi Vi Điều Khiển (Register Table)"
            >
              <Cpu className="w-3 h-3 text-accent" />
              <span>Bảng Thanh Ghi</span>
            </button>

            <button
              type="button"
              onClick={() =>
                insertTextAtCursor(`\n
\`\`\`mermaid
graph TD
    A[Khởi tạo GPIO & Clock] --> B[Cấu hình Ngắt Ngoại Vi]
    B --> C{Nhận Tín Hiệu CAN?}
    C -->|Có| D[Xử lý Gói Tin & Phản Hồi]
    C -->|Không| E[Chế Độ Low Power Sleep]
    D --> E
    E --> C
\`\`\`
\n`)
              }
              className="px-2 py-1 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-accent font-semibold text-[11px] flex items-center gap-1"
              title="Chèn Lưu đồ Sơ đồ Thuật toán Mermaid"
            >
              <GitBranch className="w-3 h-3 text-purple-400" />
              <span>Mermaid</span>
            </button>
          </div>

          {/* Media Gallery Picker */}
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="Mở Thư Viện Ảnh & Tải Ảnh Mới"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Thư Viện Ảnh</span>
          </button>
        </div>

        {/* Right View Mode Switcher & Stats */}
        <div className="flex items-center gap-2">
          {/* Last auto-save indicator */}
          {lastAutoSavedTime && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <Check className="w-3 h-3" />
              Đã lưu nháp {lastAutoSavedTime}
            </span>
          )}

          {/* Word Count */}
          <span className="hidden md:inline text-[10px] text-text-muted font-mono bg-bg-panel px-2 py-1 rounded-lg border border-border">
            {wordCount} từ (~{readTime} phút đọc)
          </span>

          {/* Split / Write / Preview Tabs */}
          <div className="flex items-center bg-bg-panel rounded-xl p-0.5 border border-border">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "split"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="Chia đôi màn hình (Soạn & Xem Trước)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Chia đôi</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("write")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "write"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="Chỉ soạn thảo Markdown"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Soạn</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "preview"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="Xem kết quả render bài viết"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Xem trước</span>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-xl bg-bg-panel hover:bg-bg-elevated border border-border text-text-secondary hover:text-accent transition-colors"
            title={isFullScreen ? "Thu nhỏ cửa sổ" : "Mở toàn màn hình"}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div
        className="flex-1 grid overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border"
        style={{
          minHeight,
          gridTemplateColumns:
            viewMode === "split" ? "1fr 1fr" : viewMode === "write" ? "1fr" : "1fr",
        }}
      >
        {/* Left Pane: Markdown Raw Textarea */}
        {(viewMode === "split" || viewMode === "write") && (
          <div className="relative flex flex-col h-full bg-bg-panel/50">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full flex-1 p-4 bg-transparent text-xs sm:text-sm font-mono text-text-primary placeholder:text-text-muted/60 leading-relaxed outline-none resize-none scrollbar-thin"
              style={{ minHeight }}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-xs text-accent font-bold gap-2">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span>Đang tải hình ảnh lên server...</span>
              </div>
            )}
          </div>
        )}

        {/* Right Pane: Live HTML Preview */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-bg-panel scrollbar-thin">
            <div className="max-w-none text-text-primary text-xs sm:text-sm leading-relaxed">
              {value.trim() ? (
                <div
                  className="space-y-4"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              ) : (
                <div className="py-20 text-center text-text-muted text-xs">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-30 text-accent" />
                  <p className="font-semibold text-text-secondary">Khung Xem Trước Trực Tiếp</p>
                  <p className="text-[11px] mt-1 text-text-muted">
                    Bắt đầu gõ nội dung bên trái để xem kết quả hiển thị chuẩn phong cách Lab.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Media Manager Modal */}
      <MediaManagerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={(url, alt, caption) => {
          let imgMd = `\n\n![${alt || "Sơ đồ mạch kỹ thuật"}](${url})\n`;
          if (caption) {
            imgMd += `<p align="center"><em>${caption}</em></p>\n\n`;
          }
          insertTextAtCursor(imgMd);
        }}
      />
    </div>
  );
}
