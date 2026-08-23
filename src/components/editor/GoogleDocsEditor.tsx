"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Sparkles,
  RotateCcw,
  RotateCw,
  FileCode,
  CheckCircle2,
  FileText,
  Minus,
  Quote,
  Palette,
  Highlighter,
  Trash2,
  Maximize2,
  Minimize2
} from "lucide-react";
import {
  CodeBlockModal,
  ImageModal,
  CalloutModal,
  TemplateModal,
} from "./EditorModals";

interface GoogleDocsEditorProps {
  value: string;
  onChange: (html: string) => void;
  onTemplateSelect?: (title?: string, excerpt?: string) => void;
  placeholder?: string;
}

export function GoogleDocsEditor({
  value,
  onChange,
  onTemplateSelect,
  placeholder = "Bắt đầu gõ nội dung bài viết kỹ thuật tại đây...",
}: GoogleDocsEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Modals state
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCalloutModalOpen, setIsCalloutModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Sync initial content once
  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      if (editorRef.current.innerHTML.trim() === "" || editorRef.current.innerHTML === "<p><br></p>") {
        editorRef.current.innerHTML = value;
        updateCounts(editorRef.current.innerText || "");
      }
    }
  }, [value]);

  const updateCounts = (text: string) => {
    const cleanText = text.trim();
    const chars = cleanText.length;
    const words = cleanText ? cleanText.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 180));
    setWordCount(words);
    setCharCount(chars);
    setReadingTime(minutes);
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateCounts(editorRef.current.innerText || "");

      // Auto-save timestamp
      const now = new Date();
      setLastSaved(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
      );
    }
  }, [onChange]);

  // Execute standard formatting commands
  const execCmd = (cmd: string, val: string = "") => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  // Insert arbitrary HTML fragment at current cursor position
  const insertHtmlAtCursor = (html: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement("div");
        el.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node: ChildNode | null;
        let lastNode: ChildNode | null = null;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        editorRef.current.innerHTML += html;
      }
      handleInput();
    }
  };

  // Insert Table
  const insertTable = () => {
    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13.5px; border: 1px solid rgba(255,255,255,0.12);">
  <thead>
    <tr style="background: rgba(255,255,255,0.06); text-align: left;">
      <th style="padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1); color: #5e6ad2; font-weight: 700;">Chân Pin / Tín hiệu</th>
      <th style="padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1); color: #5e6ad2; font-weight: 700;">Chức năng (Function)</th>
      <th style="padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1); color: #5e6ad2; font-weight: 700;">Ghi chú / Mức điện áp</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1); font-family: monospace;">PA9 (USART1_TX)</td>
      <td style="padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1);">Truyền dữ liệu Serial</td>
      <td style="padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1);">3.3V LVTTL, Kéo lên</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1); font-family: monospace;">PA10 (USART1_RX)</td>
      <td style="padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1);">Nhận dữ liệu Serial</td>
      <td style="padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1);">Kết nối DMA1 Ch1</td>
    </tr>
  </tbody>
</table>
<p><br/></p>
`;
    insertHtmlAtCursor(tableHtml);
  };

  // Insert Link
  const insertLink = () => {
    const url = prompt("Nhập đường dẫn URL website hoặc tài liệu:", "https://");
    if (url && url !== "https://") {
      execCmd("createLink", url);
    }
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        execCmd("bold");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        execCmd("italic");
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        execCmd("underline");
      } else if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        if (e.shiftKey) execCmd("redo");
        else execCmd("undo");
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        execCmd("redo");
      }
    }
  };

  return (
    <div
      className={`flex flex-col bg-bg-panel border border-border rounded-2xl shadow-xl transition-all ${
        isFullScreen ? "fixed inset-4 z-50 rounded-2xl overflow-hidden" : "w-full"
      }`}
    >
      {/* --- GOOGLE DOCS TOP TOOLBAR --- */}
      <div className="sticky top-0 z-30 bg-bg-elevated/95 backdrop-blur border-b border-border p-2 md:p-3 rounded-t-2xl flex flex-wrap items-center gap-1 text-text-secondary text-xs">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r border-border/80 pr-1.5 mr-1">
          <button
            type="button"
            title="Hoàn tác (Ctrl+Z)"
            onClick={() => execCmd("undo")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Làm lại (Ctrl+Y)"
            onClick={() => execCmd("redo")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings / Block Format */}
        <div className="border-r border-border/80 pr-1.5 mr-1">
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val === "p") execCmd("formatBlock", "<p>");
              else if (val === "h1") execCmd("formatBlock", "<h1>");
              else if (val === "h2") execCmd("formatBlock", "<h2>");
              else if (val === "h3") execCmd("formatBlock", "<h3>");
            }}
            defaultValue="p"
            className="px-2.5 py-1 bg-bg-panel border border-border rounded-lg text-xs font-medium text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="p">Văn bản thường (Normal)</option>
            <option value="h1">Tiêu đề lớn (Heading 1)</option>
            <option value="h2">Tiêu đề vừa (Heading 2)</option>
            <option value="h3">Tiêu đề nhỏ (Heading 3)</option>
          </select>
        </div>

        {/* Text Styles (Bold, Italic, Underline, Strikethrough, Code) */}
        <div className="flex items-center gap-0.5 border-r border-border/80 pr-1.5 mr-1">
          <button
            type="button"
            title="In đậm (Ctrl+B)"
            onClick={() => execCmd("bold")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted font-bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="In nghiêng (Ctrl+I)"
            onClick={() => execCmd("italic")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Gạch chân (Ctrl+U)"
            onClick={() => execCmd("underline")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Gạch ngang chữ"
            onClick={() => execCmd("strikeThrough")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Colors (Text Color & Highlighter) */}
        <div className="flex items-center gap-1 border-r border-border/80 pr-1.5 mr-1">
          <div className="flex items-center gap-0.5" title="Màu chữ">
            <Palette className="w-3.5 h-3.5 text-text-muted mr-0.5" />
            {["#ffffff", "#5e6ad2", "#10b981", "#fbbf24", "#ef4444", "#a855f7"].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => execCmd("foreColor", color)}
                className="w-3.5 h-3.5 rounded-full border border-border/60 hover:scale-125 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex items-center gap-0.5 ml-1.5" title="Tô màu nền (Highlight)">
            <Highlighter className="w-3.5 h-3.5 text-text-muted mr-0.5" />
            {[
              { label: "Vàng", color: "rgba(251, 191, 36, 0.25)" },
              { label: "Xanh lá", color: "rgba(16, 185, 129, 0.25)" },
              { label: "Lam", color: "rgba(94, 106, 210, 0.3)" },
              { label: "Đỏ", color: "rgba(239, 68, 68, 0.25)" },
            ].map((hl, idx) => (
              <button
                key={idx}
                type="button"
                title={`Highlight ${hl.label}`}
                onClick={() => execCmd("hiliteColor", hl.color)}
                className="w-3.5 h-3.5 rounded border border-border/60 hover:scale-125 transition-transform"
                style={{ backgroundColor: hl.color }}
              />
            ))}
          </div>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r border-border/80 pr-1.5 mr-1">
          <button
            type="button"
            title="Căn trái"
            onClick={() => execCmd("justifyLeft")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Căn giữa"
            onClick={() => execCmd("justifyCenter")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Căn phải"
            onClick={() => execCmd("justifyRight")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Căn đều 2 bên"
            onClick={() => execCmd("justifyFull")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r border-border/80 pr-1.5 mr-1">
          <button
            type="button"
            title="Danh sách chấm (Bullet List)"
            onClick={() => execCmd("insertUnorderedList")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Danh sách số (Numbered List)"
            onClick={() => execCmd("insertOrderedList")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lab Special Elements (Code, Callout, Table, Image, Link, Templates) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsCodeModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-panel hover:bg-accent/15 hover:text-accent border border-border text-xs font-semibold text-text-primary transition-all"
          >
            <Code className="w-3.5 h-3.5 text-accent" />
            + Code Khối
          </button>

          <button
            type="button"
            onClick={() => setIsCalloutModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-panel hover:bg-emerald-500/15 hover:text-emerald-400 border border-border text-xs font-semibold text-text-primary transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            + Ghi Chú Callout
          </button>

          <button
            type="button"
            onClick={insertTable}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-panel hover:bg-amber-500/15 hover:text-amber-400 border border-border text-xs font-semibold text-text-primary transition-all"
          >
            <TableIcon className="w-3.5 h-3.5 text-amber-400" />
            + Bảng Pinout
          </button>

          <button
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-panel hover:bg-purple-500/15 hover:text-purple-400 border border-border text-xs font-semibold text-text-primary transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            + Ảnh
          </button>

          <button
            type="button"
            onClick={insertLink}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted"
            title="Chèn liên kết"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => execCmd("insertHorizontalRule")}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted"
            title="Kẻ đường phân cách"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/15 text-accent border border-accent/30 text-xs font-bold hover:bg-accent hover:text-white transition-all ml-auto"
          >
            <FileText className="w-3.5 h-3.5" />
            Mẫu Lab Có Sẵn
          </button>

          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg hover:bg-bg-panel hover:text-text-primary text-text-muted ml-1"
            title={isFullScreen ? "Thu nhỏ" : "Toàn màn hình"}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* --- GOOGLE DOCS DOCUMENT CANVAS ("TRANG GIẤY A4") --- */}
      <div className="flex-1 bg-[#090a0c] p-4 md:p-8 overflow-y-auto min-h-[520px] flex justify-center">
        <div className="w-full max-w-4xl bg-bg-panel border border-border/80 rounded-2xl p-6 md:p-12 shadow-2xl min-h-[600px] text-text-primary focus-within:border-accent/50 transition-colors">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className="outline-none min-h-[480px] prose prose-invert max-w-none text-base leading-relaxed text-text-secondary focus:text-text-primary"
            style={{
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            }}
            data-placeholder={placeholder}
          />
        </div>
      </div>

      {/* --- BOTTOM STATUS BAR --- */}
      <div className="bg-bg-elevated border-t border-border px-4 py-2.5 rounded-b-2xl flex flex-wrap items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <span>
            Số từ: <strong className="text-text-primary">{wordCount}</strong>
          </span>
          <span>
            Ký tự: <strong className="text-text-primary">{charCount}</strong>
          </span>
          <span>
            Thời gian đọc: <strong className="text-accent">{readingTime} phút</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã lưu nháp lúc {lastSaved}
            </span>
          )}
          <span className="text-[11px] text-text-muted border-l border-border pl-2">
            Phím tắt: <strong>Ctrl+B</strong> (Đậm), <strong>Ctrl+I</strong> (Nghiêng), <strong>Ctrl+U</strong> (Gạch chân)
          </span>
        </div>
      </div>

      {/* --- MODALS --- */}
      <CodeBlockModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onInsert={insertHtmlAtCursor}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={insertHtmlAtCursor}
      />

      <CalloutModal
        isOpen={isCalloutModalOpen}
        onClose={() => setIsCalloutModalOpen(false)}
        onInsert={insertHtmlAtCursor}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={(html, title, excerpt) => {
          if (editorRef.current) {
            editorRef.current.innerHTML = html;
            handleInput();
          }
          if (onTemplateSelect) {
            onTemplateSelect(title, excerpt);
          }
        }}
      />
    </div>
  );
}
