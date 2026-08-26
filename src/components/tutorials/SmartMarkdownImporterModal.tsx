"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Sparkles,
  CheckCircle2,
  Code,
  Eye,
  Copy,
  ArrowRight,
  Zap,
  BookOpen,
  FileCode
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { parseMultiMarkdownArticles, ParsedPost } from "@/lib/markdown-importer";
import { CodeSnippetView } from "@/components/ui/CodeSnippetView";

interface SmartMarkdownImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (posts: ParsedPost[]) => void;
}

const SAMPLE_EMBEDDED_C_MARKDOWN = `# Bài 1: Cấu Trúc Bộ Nhớ Trong C (Memory Layout of C Program)
> Tóm tắt: Phân tích 5 phân vùng bộ nhớ Text, Initialized Data, BSS, Heap và Stack trong vi điều khiển nhúng.

\`\`\`c filename="memory_map.c"
#include <stdio.h>
#include <stdlib.h>

// 1. Initialized Data Segment (Lưu trong Flash & RAM)
int global_initialized_var = 100;

// 2. Uninitialized Data Segment (BSS Segment - RAM)
int global_uninitialized_var;

void memory_demo(void) {
    // 3. Stack Segment (Lưu biến cục bộ)
    int stack_var = 42;

    // 4. Heap Segment (Cấp phát động)
    int *heap_ptr = (int *)malloc(sizeof(int) * 10);

    printf("Text Segment: %p\\n", (void *)memory_demo);
    printf("Data Segment: %p\\n", (void *)&global_initialized_var);
    printf("BSS Segment:  %p\\n", (void *)&global_uninitialized_var);
    printf("Stack Frame:  %p\\n", (void *)&stack_var);
    printf("Heap Memory:  %p\\n", (void *)heap_ptr);

    free(heap_ptr);
}
\`\`\`

## 1. Năm Phân Vùng Bộ Nhớ Cốt Lõi
Hệ thống nhúng vi điều khiển phân chia không gian RAM và Flash thành 5 phân vùng:
- **Text Segment (Code Segment):** Nơi chứa tập lệnh máy (Machine Code) đã biên dịch, nằm cố định trong bộ nhớ Flash ROM.
- **Initialized Data Segment (.data):** Chứa các biến toàn cục (global) và biến static đã được gán giá trị ban đầu khác 0.
- **Uninitialized Data Segment (.bss):** Chứa các biến toàn cục và static chưa khởi tạo (hoặc khởi tạo = 0), được Startup Code gán bằng 0 khi MCU khởi động.
- **Heap Segment:** Phân vùng cấp phát động bởi các hàm malloc/free, tăng dần từ địa chỉ thấp lên cao.
- **Stack Segment:** Phân vùng lưu trữ con trỏ SP, Return Address của hàm và các biến cục bộ (Local variables), giảm dần từ địa chỉ cao xuống thấp.

> [!IMPORTANT]
> Trong lập trình hệ thống nhúng quan trọng (Mission-Critical), hãy hạn chế dùng Heap (malloc) để tránh phân mảnh bộ nhớ (Memory Fragmentation) gây tràn RAM!

---

# Bài 2: Kỹ Thuật Bitmasking & Thao Tác Thanh Ghi Nhúng
> Tóm tắt: Hướng dẫn chi tiết kỹ thuật Set bit, Clear bit, Toggle bit và Read bit trên thanh ghi GPIO vi điều khiển.

\`\`\`c filename="bit_operations.h"
#ifndef BIT_OPERATIONS_H
#define BIT_OPERATIONS_H

#define SET_BIT(REG, BIT)     ((REG) |=  (1UL << (BIT)))
#define CLEAR_BIT(REG, BIT)   ((REG) &= ~(1UL << (BIT)))
#define TOGGLE_BIT(REG, BIT)  ((REG) ^=  (1UL << (BIT)))
#define READ_BIT(REG, BIT)    (((REG) >> (BIT)) & 1UL)

#endif
\`\`\`

## 1. Tại Sao Lập Trình Nhúng Cần Bitmasking?
Trong vi điều khiển (như STM32, ESP32, PIC, AVR), mọi chức năng phần cứng (bật xung nhịp, cấu hình chân GPIO, cài đặt Baudrate UART) đều được điều khiển thông qua các **Thanh Ghi 32-bit hoặc 8-bit**.

## 2. Các Phép Toán Bit Cơ Bản:
- **Set bit lên 1:** Dùng toán tử OR (\`|\`).
- **Xóa bit về 0:** Dùng toán tử AND với NOT (\`& ~\`).
- **Đảo trạng thái bit:** Dùng toán tử XOR (\`^\`).
- **Đọc giá trị bit:** Dùng toán tử dịch phải (\`>>\`) kết hợp AND (\`&\`).

> [!TIP]
> Luôn dùng hậu tố \`1UL\` (Unsigned Long) khi dịch bit trên kiến trúc vi điều khiển 32-bit ARM Cortex-M để tránh lỗi tràn số số học (Signed Overflow).
`;

export function SmartMarkdownImporterModal({
  isOpen,
  onClose,
  onImport,
}: SmartMarkdownImporterModalProps) {
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"input" | "preview">("input");
  const [parsedPosts, setParsedPosts] = useState<ParsedPost[]>([]);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!inputText.trim()) {
      alert("Vui lòng dán nội dung Markdown hoặc JSON trước.");
      return;
    }
    const results = parseMultiMarkdownArticles(inputText);
    setParsedPosts(results);
    setActiveTab("preview");
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_EMBEDDED_C_MARKDOWN);
    const results = parseMultiMarkdownArticles(SAMPLE_EMBEDDED_C_MARKDOWN);
    setParsedPosts(results);
  };

  const handleApply = () => {
    if (parsedPosts.length === 0) {
      const results = parseMultiMarkdownArticles(inputText);
      if (results.length === 0) {
        alert("Không thể phân tích nội dung. Vui lòng kiểm tra lại văn bản.");
        return;
      }
      onImport(results);
    } else {
      onImport(parsedPosts);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-bg-panel border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-bg-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
                <span>Smart Markdown & Text Importer</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Tự động định dạng
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                Dán giáo trình Markdown từ Notion, ChatGPT hoặc EmbeTronicX để tự động tạo toàn bộ bài học
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher & Actions */}
        <div className="px-5 py-2.5 border-b border-border/60 bg-bg-elevated/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-bg-panel p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("input")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "input"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              1. Dán Markdown / JSON
            </button>
            <button
              type="button"
              onClick={handleParse}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "preview"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              2. Xem Trước ({parsedPosts.length} bài đã tách)
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadSample}
            className="text-xs text-accent border-accent/30 hover:bg-accent/10 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nạp Mẫu Chuyên Đề C Nhúng</span>
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === "input" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Dán văn bản Markdown vào khung dưới đây:</span>
                <span className="font-mono text-[11px]">Hỗ trợ tách nhiều bài qua dấu <code>---</code></span>
              </div>
              <textarea
                rows={15}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (e.target.value) {
                    setParsedPosts(parseMultiMarkdownArticles(e.target.value));
                  }
                }}
                placeholder={`# Bài 1: Tiêu đề bài viết\n> Tóm tắt: Mô tả ngắn gọn...\n\n\`\`\`c filename="main.c"\n// Code C mẫu tại đây...\n\`\`\`\n\n## 1. Lý thuyết trọng tâm\nNội dung bài viết...\n\n---\n\n# Bài 2: Tiêu đề bài kế tiếp...`}
                className="w-full p-4 rounded-2xl bg-bg-elevated/70 dark:bg-bg-elevated border border-border text-xs sm:text-sm font-mono text-text-primary focus:border-accent outline-none leading-relaxed resize-none shadow-inner"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  Đã phân tích thành công <strong>{parsedPosts.length} bài học</strong>. Bạn có thể xem trước cách hiển thị dưới đây trước khi nạp vào Form:
                </span>
              </div>

              <div className="space-y-6">
                {parsedPosts.map((post, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-bg-elevated/40 border border-border/80 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-accent text-white font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-text-primary">
                          {post.title}
                        </h4>
                      </div>
                      <span className="text-xs text-text-muted font-mono">{post.readTime}</span>
                    </div>

                    {post.summary && (
                      <div className="p-3 rounded-xl bg-bg-panel text-xs text-text-secondary border-l-4 border-accent">
                        <strong>Tóm tắt:</strong> {post.summary}
                      </div>
                    )}

                    {post.codeSnippet && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                          Mã nguồn tách được:
                        </span>
                        <CodeSnippetView
                          code={post.codeSnippet}
                          language={post.codeLang}
                          filename={post.codeFilename}
                        />
                      </div>
                    )}

                    {post.contentHtml && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                          Nội dung lý thuyết hiển thị:
                        </span>
                        <div
                          className="p-4 rounded-2xl bg-bg-panel border border-border prose prose-slate dark:prose-invert max-w-none text-xs text-text-primary"
                          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-bg-elevated/40 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Hủy bỏ
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleApply}
            disabled={!inputText.trim()}
            className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-5 py-2 rounded-xl shadow-lg flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Nạp Vào Form ({parsedPosts.length || 1} bài)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
