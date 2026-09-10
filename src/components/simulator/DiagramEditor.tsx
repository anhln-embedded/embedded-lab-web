"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  Code2,
  Check,
  AlertTriangle,
  Sparkles,
  Copy,
} from "lucide-react";
import { DiagramSchema, parseDiagram } from "@/lib/emulator/diagram-parser";

interface DiagramEditorProps {
  initialDiagram: DiagramSchema;
  onDiagramChange: (diagram: DiagramSchema) => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Tô màu cú pháp JSON tương thích Dark/Light Mode với hiệu năng 0ms latency
 */
function highlightJson(json: string): string {
  if (!json) return "";
  const regex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],:])/g;

  return json.replace(regex, (match) => {
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        // Thuộc tính Key
        const key = match.slice(0, -1);
        return `<span class="text-sky-600 dark:text-sky-400 font-semibold">${escapeHtml(
          key
        )}</span><span class="text-text-muted">:</span>`;
      } else {
        // Giá trị String
        return `<span class="text-emerald-600 dark:text-emerald-400">${escapeHtml(
          match
        )}</span>`;
      }
    } else if (/true|false/.test(match)) {
      // Giá trị Boolean
      return `<span class="text-purple-600 dark:text-purple-400 font-bold">${match}</span>`;
    } else if (/null/.test(match)) {
      // Giá trị Null
      return `<span class="text-rose-500 dark:text-rose-400 font-bold">${match}</span>`;
    } else if (/[0-9]/.test(match)) {
      // Giá trị Number
      return `<span class="text-amber-600 dark:text-amber-400 font-medium">${match}</span>`;
    } else if (/[{}[\],]/.test(match)) {
      // Dấu ngoặc và dấu phẩy
      return `<span class="text-slate-600 dark:text-slate-400 font-bold">${match}</span>`;
    }
    return escapeHtml(match);
  });
}

export const DiagramEditor: React.FC<DiagramEditorProps> = ({
  initialDiagram,
  onDiagramChange,
}) => {
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(initialDiagram, null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Danh sách dòng để render số thứ tự dòng ở lề
  const linesCount = useMemo(() => {
    return jsonText.split("\n").length || 1;
  }, [jsonText]);

  // HTML tô màu cú pháp được memoized
  const highlightedHtml = useMemo(() => {
    return highlightJson(jsonText);
  }, [jsonText]);

  // Đồng bộ cuộn giữa Textarea, Lớp Highlight Pre và Cột Số dòng
  const handleScroll = useCallback(() => {
    if (!textareaRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      const parsed = parseDiagram(val);
      setError(null);
      onDiagramChange(parsed);
    } catch (err: any) {
      setError(err.message);
    }
  };


  // Tự động định dạng JSON (Prettify / Format)
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError(null);
      onDiagramChange(parsed);
    } catch (err: any) {
      setError("Không thể format do cú pháp JSON chưa đúng: " + err.message);
    }
  };

  // Sao chép JSON vào clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-bg-panel border border-border rounded-2xl p-3 shadow-sm transition-colors duration-200 flex flex-col h-full min-h-0">
      {/* Header: Tiêu đề + Các nút công cụ thao tác nhanh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold text-text-primary tracking-tight">
            Sơ đồ mạch (diagram.json)
          </h3>
        </div>

        {/* Cụm công cụ: Format JSON, Copy */}
        <div className="flex items-center gap-1.5">
          {/* Nút Format JSON */}
          <button
            onClick={handleFormatJson}
            title="Tự động căn chỉnh format JSON chuẩn đẹp"
            className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-elevated hover:bg-border text-text-secondary hover:text-accent transition-colors font-medium border border-border flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Format</span>
          </button>

          {/* Nút Copy */}
          <button
            onClick={handleCopy}
            title="Sao chép toàn bộ JSON"
            className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-elevated hover:bg-border text-text-secondary hover:text-accent transition-colors font-medium border border-border flex items-center gap-1 cursor-pointer"
          >
            {isCopied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            <span>{isCopied ? "Đã chép" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Vùng Editor Code IDE với Line Numbers và Syntax Highlighting */}
      <div className="relative flex-1 min-h-0 rounded-xl border border-border bg-white dark:bg-[#070d18] overflow-hidden flex transition-colors duration-200">
        {/* Cột số dòng (Line Numbers) */}
        <div
          ref={lineNumbersRef}
          className="w-10 py-3.5 pr-2.5 text-right font-mono text-[11px] leading-relaxed text-text-muted/40 select-none bg-bg-panel/40 border-r border-border/40 overflow-hidden shrink-0"
        >
          {Array.from({ length: linesCount }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        {/* Khung Editor chính: Pre (Syntax highlight) + Textarea (Tương tác nhập liệu) */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Lớp hiển thị cú pháp màu sắc (Bên dưới) */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full p-3.5 m-0 font-mono text-xs leading-relaxed overflow-hidden pointer-events-none select-none whitespace-pre tab-[2]"
            dangerouslySetInnerHTML={{ __html: highlightedHtml + "\n" }}
          />

          {/* Lớp nhận gõ văn bản trong suốt (Bên trên) */}
          <textarea
            ref={textareaRef}
            value={jsonText}
            onChange={handleTextChange}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="absolute inset-0 w-full h-full p-3.5 m-0 font-mono text-xs leading-relaxed bg-transparent text-transparent caret-accent dark:caret-accent-cyan resize-none outline-none overflow-auto whitespace-pre selection:bg-accent/25 selection:text-transparent tab-[2]"
            placeholder="Dán hoặc chỉnh sửa diagram.json tại đây..."
          />
        </div>
      </div>

      {/* Thanh báo trạng thái cú pháp thời gian thực */}
      {error ? (
        <div className="mt-1.5 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5 animate-fade-in shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      ) : (
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-text-muted px-0.5 shrink-0">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Check className="w-3 h-3" /> Cú pháp JSON chuẩn xác
          </span>
          <span>{linesCount} dòng • Chuẩn Wokwi Schema</span>
        </div>
      )}
    </div>
  );
};
