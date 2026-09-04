"use client";

import React, { useState } from "react";
import {
  X,
  Code,
  FileCode,
  Check,
  Eye,
  Sparkles,
  Terminal,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeSnippetView } from "@/components/ui/CodeSnippetView";

interface InsertCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdownSnippet: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { id: "c", label: "C (Embedded)", ext: "main.c", icon: "⚡" },
  { id: "cpp", label: "C++ (OOP/ESP32)", ext: "main.cpp", icon: "🚀" },
  { id: "python", label: "Python (AIoT/TinyML)", ext: "app.py", icon: "🐍" },
  { id: "bash", label: "Bash / Shell", ext: "build.sh", icon: "💻" },
  { id: "rust", label: "Rust (no_std)", ext: "main.rs", icon: "🦀" },
  { id: "verilog", label: "Verilog (FPGA)", ext: "top.v", icon: "📐" },
];

export function InsertCodeModal({ isOpen, onClose, onInsert }: InsertCodeModalProps) {
  const [language, setLanguage] = useState("c");
  const [filename, setFilename] = useState("main.c");
  const [code, setCode] = useState(`// Embedded-AIoT Lab - C Code Sample
#include <stdio.h>
#include <stdint.h>

void app_main(void) {
    uint32_t counter = 0;
    printf("Embedded System Initialized! Counter = %u\\n", counter);
}
`);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const handleLanguageChange = (langId: string) => {
    setLanguage(langId);
    const found = SUPPORTED_LANGUAGES.find((l) => l.id === langId);
    if (found) {
      setFilename(found.ext);
    }
  };

  const handleApply = () => {
    if (!code.trim()) {
      alert("Vui lòng nhập đoạn mã nguồn.");
      return;
    }

    const cleanFilename = filename.trim();
    const snippet = `\`\`\`${language}${cleanFilename ? ` filename="${cleanFilename}"` : ""}\n${code.trim()}\n\`\`\`\n\n`;
    onInsert(snippet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-bg-panel border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-bg-elevated/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shadow-inner">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
                <span>Chèn Đoạn Mã Kỹ Thuật (Insert Code Card)</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/30 font-mono">
                  Dual-Theme
                </span>
              </h3>
              <p className="text-xs text-text-muted">
                Đoạn mã sẽ tự động có tô màu cú pháp, số dòng và nút sao chép chuẩn Lab
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Chọn ngôn ngữ */}
          <div className="space-y-1.5">
            <label className="font-bold text-text-primary block">
              Ngôn ngữ lập trình:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = language === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLanguageChange(item.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "border-accent bg-accent/15 text-text-primary font-bold shadow-xs ring-1 ring-accent/30"
                        : "border-border bg-bg-elevated/60 text-text-muted hover:border-border-strong hover:text-text-secondary"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tên file */}
          <div className="space-y-1.5">
            <label className="font-bold text-text-primary flex items-center gap-1.5">
              <span>Tên tệp (Filename hiển thị trên thanh Header):</span>
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="VD: system_clock.c, FreeRTOSConfig.h..."
              className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Editor Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-text-primary">
                Mã nguồn (Source Code):
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-accent hover:underline flex items-center gap-1 font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showPreview ? "Quay lại soạn code" : "Xem trước khối code"}</span>
              </button>
            </div>

            {showPreview ? (
              <div className="rounded-xl overflow-hidden border border-border">
                <CodeSnippetView
                  code={code}
                  language={language}
                  filename={filename}
                  maxHeight="max-h-72"
                />
              </div>
            ) : (
              <textarea
                rows={10}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Dán hoặc gõ mã nguồn tại đây..."
                className="w-full p-3.5 rounded-2xl bg-[#0d1117] text-[#e6edf3] border border-border font-mono text-xs focus:outline-none focus:border-accent leading-relaxed resize-none shadow-inner"
              />
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-bg-elevated/40 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Chèn Đoạn Mã Vào Bài Viết</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
