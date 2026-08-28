"use client";

import React, { useState, useEffect } from "react";
import { highlightCode, CodeTheme } from "@/lib/syntax-highlighter";
import {
  Copy,
  Check,
  Cpu,
  Hash,
  Sun,
  Moon,
  Maximize2
} from "lucide-react";

interface CodeSnippetViewProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  title?: string;
}

export function CodeSnippetView({
  code,
  language = "c",
  filename,
  showLineNumbers = true,
  maxHeight = "max-h-[520px]",
  title,
}: CodeSnippetViewProps) {
  const [copied, setCopied] = useState(false);
  const [withLineNumbers, setWithLineNumbers] = useState(showLineNumbers);
  const [codeTheme, setCodeTheme] = useState<CodeTheme>("dark");

  // Tự động phát hiện theme của trang web
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setCodeTheme(isDark ? "dark" : "light");

    // Lắng nghe thay đổi theme
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark");
      setCodeTheme(isDarkNow ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCodeTheme = () => {
    setCodeTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const highlightedHtml = React.useMemo(() => {
    return highlightCode(code, language, codeTheme);
  }, [code, language, codeTheme]);

  const lines = code.split("\n");

  const getLanguageLabel = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === "c") return "C (Embedded)";
    if (l === "cpp") return "C++ (OOP/ESP32)";
    if (l === "python" || l === "py") return "Python (TinyML)";
    if (l === "rust" || l === "rs") return "Rust (no_std)";
    if (l === "verilog" || l === "sv") return "Verilog (FPGA)";
    if (l === "bash" || l === "sh") return "Bash / Shell";
    return lang.toUpperCase();
  };

  const isLight = codeTheme === "light";

  return (
    <div
      className={`rounded-2xl overflow-hidden my-5 transition-all shadow-xl border ${
        isLight
          ? "bg-[#ffffff] border-slate-300/90 shadow-slate-200/60"
          : "bg-[#0d1117] border-[#30363d] shadow-2xl"
      }`}
    >
      {/* Code Header Bar */}
      <div
        className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 select-none transition-colors ${
          isLight
            ? "bg-[#f6f8fa] border-slate-200 text-slate-800"
            : "bg-[#161b22] border-[#30363d] text-[#e6edf3]"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`text-xs font-mono font-extrabold flex items-center gap-1.5 ${
              isLight ? "text-slate-800" : "text-accent"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-accent" />
            <span>{filename || title || `source.${language}`}</span>
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isLight
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-accent/15 text-accent border border-accent/30"
            }`}
          >
            {getLanguageLabel(language)}
          </span>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-1.5">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleCodeTheme}
            className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
              isLight
                ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm"
                : "bg-[#21262d] hover:bg-[#30363d] text-text-secondary hover:text-text-primary border-[#30363d]"
            }`}
            title={isLight ? "Chuyển sang giao diện Code Tối" : "Chuyển sang giao diện Code Sáng"}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px]">Tối</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Sáng</span>
              </>
            )}
          </button>

          {/* Line numbers toggle */}
          <button
            type="button"
            onClick={() => setWithLineNumbers(!withLineNumbers)}
            className={`p-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center border ${
              withLineNumbers
                ? isLight
                  ? "bg-accent/10 text-accent border-accent/40 shadow-sm"
                  : "bg-accent/15 text-accent border-accent/40"
                : isLight
                ? "bg-white hover:bg-slate-100 text-slate-600 border-slate-300 shadow-sm"
                : "bg-[#21262d] hover:bg-[#30363d] text-text-muted hover:text-text-primary border-[#30363d]"
            }`}
            title={withLineNumbers ? "Ẩn số dòng (Line Numbers)" : "Hiện số dòng (Line Numbers)"}
          >
            <Hash className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all border active:scale-95 ${
              isLight
                ? "bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm hover:border-accent hover:text-accent"
                : "bg-[#21262d] hover:bg-[#30363d] text-text-primary border-[#30363d]"
            }`}
            title="Sao chép toàn bộ mã nguồn"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-extrabold">Đã chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-accent" />
                <span className="hidden xs:inline">Sao chép Code</span>
                <span className="xs:hidden">Chép</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Container */}
      <div
        className={`overflow-x-auto overflow-y-auto ${maxHeight} p-4 text-xs sm:text-[13px] font-mono leading-relaxed transition-colors ${
          isLight ? "bg-[#ffffff] text-[#1f2328]" : "bg-[#0d1117] text-[#e6edf3]"
        }`}
      >
        {withLineNumbers ? (
          <div className="flex">
            {/* Line numbers column */}
            <div
              className={`select-none pr-4 text-right border-r mr-4 flex flex-col font-mono text-xs ${
                isLight ? "text-slate-400 border-slate-200" : "text-[#484f58] border-[#21262d]"
              }`}
            >
              {lines.map((_, i) => (
                <span key={i} className="leading-relaxed font-semibold">
                  {i + 1}
                </span>
              ))}
            </div>
            {/* Code column */}
            <pre className="flex-1 overflow-x-auto m-0 p-0 font-mono bg-transparent">
              <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
            </pre>
          </div>
        ) : (
          <pre className="m-0 p-0 font-mono bg-transparent">
            <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          </pre>
        )}
      </div>
    </div>
  );
}
