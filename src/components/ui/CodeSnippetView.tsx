"use client";

import React, { useState } from "react";
import { highlightCode } from "@/lib/syntax-highlighter";
import {
  Copy,
  Check,
  Terminal,
  FileCode,
  Layers,
  Cpu,
  Hash
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
  maxHeight = "max-h-[500px]",
  title,
}: CodeSnippetViewProps) {
  const [copied, setCopied] = useState(false);
  const [withLineNumbers, setWithLineNumbers] = useState(showLineNumbers);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedHtml = React.useMemo(() => {
    return highlightCode(code, language);
  }, [code, language]);

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

  return (
    <div className="rounded-2xl bg-[#0e1117] border border-border/80 shadow-2xl overflow-hidden my-4 group">
      {/* Code Header Bar */}
      <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2.5">
          {/* Window dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block" />
          </div>

          <span className="text-xs font-mono font-bold text-accent flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-accent" />
            <span>{filename || title || `source.${language}`}</span>
          </span>

          <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 text-[10px] font-mono font-bold uppercase tracking-wider">
            {getLanguageLabel(language)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWithLineNumbers(!withLineNumbers)}
            className={`p-1.5 rounded-lg text-[11px] font-mono transition-colors flex items-center gap-1 ${
              withLineNumbers
                ? "bg-[#21262d] text-accent border border-accent/30"
                : "text-text-muted hover:text-text-primary hover:bg-[#21262d]"
            }`}
            title={withLineNumbers ? "Ẩn số dòng" : "Hiện số dòng"}
          >
            <Hash className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Số dòng</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-text-secondary hover:text-text-primary border border-[#30363d] transition-all shadow-sm active:scale-95"
            title="Sao chép toàn bộ mã nguồn"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Container */}
      <div className={`overflow-x-auto overflow-y-auto ${maxHeight} p-4 text-xs sm:text-[13px] font-mono leading-relaxed bg-[#0d1117] text-[#e6edf3]`}>
        {withLineNumbers ? (
          <div className="flex">
            {/* Line numbers column */}
            <div className="select-none pr-4 text-right text-[#484f58] border-r border-[#21262d] mr-4 flex flex-col font-mono text-xs">
              {lines.map((_, i) => (
                <span key={i} className="leading-relaxed">
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
