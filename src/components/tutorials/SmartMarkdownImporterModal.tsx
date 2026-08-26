"use client";

import React, { useState, useRef } from "react";
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
  FileCode,
  FolderOpen,
  Upload,
  Layers,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { parseMultiMarkdownArticles, parseSingleMarkdownArticle, ParsedPost } from "@/lib/markdown-importer";
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
`;

interface LoadedFileItem {
  filename: string;
  post: ParsedPost;
}

export function SmartMarkdownImporterModal({
  isOpen,
  onClose,
  onImport,
}: SmartMarkdownImporterModalProps) {
  const [importMode, setImportMode] = useState<"folder" | "text">("folder");
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"input" | "preview">("input");
  const [parsedPosts, setParsedPosts] = useState<ParsedPost[]>([]);
  const [loadedFiles, setLoadedFiles] = useState<LoadedFileItem[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const multipleFilesInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Xử lý nạp các file Markdown được chọn
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsProcessingFiles(true);
    const filesArray = Array.from(fileList);

    // Lọc chỉ nhận các file Markdown (.md, .markdown, .txt)
    const mdFiles = filesArray.filter((f) => {
      const name = f.name.toLowerCase();
      return name.endsWith(".md") || name.endsWith(".markdown") || name.endsWith(".txt");
    });

    if (mdFiles.length === 0) {
      alert("Không tìm thấy file .md nào trong thư mục được chọn.");
      setIsProcessingFiles(false);
      return;
    }

    // Sắp xếp các file theo tên (hỗ trợ số thứ tự 01-, 02-, bai-1, bai-2...)
    mdFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));

    const readPromises = mdFiles.map((file, idx) => {
      return new Promise<LoadedFileItem>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = (e.target?.result as string) || "";
          const post = parseSingleMarkdownArticle(content, idx + 1);
          // Nếu title lấy theo mặc định, dùng tên file làm title dự phòng
          if (post.title.startsWith("Bài ") && post.title.includes("Tiêu đề bài viết")) {
            const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            post.title = `Bài ${idx + 1}: ${cleanFileName}`;
          }
          resolve({
            filename: file.name,
            post,
          });
        };
        reader.readAsText(file, "UTF-8");
      });
    });

    try {
      const results = await Promise.all(readPromises);
      setLoadedFiles(results);
      const posts = results.map((r) => r.post);
      setParsedPosts(posts);
      setActiveTab("preview");
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi đọc các file Markdown.");
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleParseText = () => {
    if (!inputText.trim()) {
      alert("Vui lòng dán nội dung Markdown hoặc JSON trước.");
      return;
    }
    const results = parseMultiMarkdownArticles(inputText);
    setParsedPosts(results);
    setActiveTab("preview");
  };

  const handleLoadSample = () => {
    setImportMode("text");
    setInputText(SAMPLE_EMBEDDED_C_MARKDOWN);
    const results = parseMultiMarkdownArticles(SAMPLE_EMBEDDED_C_MARKDOWN);
    setParsedPosts(results);
    setActiveTab("preview");
  };

  const handleApply = () => {
    if (parsedPosts.length === 0) {
      if (importMode === "text" && inputText.trim()) {
        const results = parseMultiMarkdownArticles(inputText);
        if (results.length > 0) {
          onImport(results);
          onClose();
          return;
        }
      }
      alert("Chưa có bài học nào được nạp. Vui lòng chọn folder hoặc dán nội dung Markdown.");
      return;
    }
    onImport(parsedPosts);
    onClose();
  };

  const handleRemoveLoadedFile = (index: number) => {
    const nextLoaded = loadedFiles.filter((_, i) => i !== index);
    setLoadedFiles(nextLoaded);
    setParsedPosts(nextLoaded.map((item) => item.post));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-bg-panel border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={folderInputRef}
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <input
          type="file"
          ref={multipleFilesInputRef}
          accept=".md,.markdown,.txt"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-bg-elevated/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shadow-inner">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span>Smart Markdown & Folder Importer</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  1-Click Nạp Folder
                </span>
              </h3>
              <p className="text-xs text-text-muted">
                Chọn cả thư mục chứa các file .md (mỗi file là 1 bài) hoặc dán văn bản để tự động tạo chuyên đề
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

        {/* Mode Switcher */}
        <div className="px-5 py-3 border-b border-border/60 bg-bg-elevated/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-bg-panel p-1 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => {
                setImportMode("folder");
                if (loadedFiles.length > 0) setActiveTab("preview");
                else setActiveTab("input");
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                importMode === "folder"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>1. Chọn Folder / Nhiều File .md</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setImportMode("text");
                setActiveTab("input");
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                importMode === "text"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Dán Text Trực Tiếp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {parsedPosts.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "input" ? "preview" : "input")}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-bg-panel border border-border text-text-primary hover:text-accent flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-accent" />
                <span>
                  {activeTab === "preview" ? "Quay lại nhập liệu" : `Xem trước (${parsedPosts.length} bài)`}
                </span>
              </button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              className="text-xs text-accent border-accent/30 hover:bg-accent/10 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nạp Mẫu C Nhúng</span>
            </Button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === "input" && importMode === "folder" ? (
            /* --- FOLDER IMPORT VIEW --- */
            <div className="space-y-5">
              {/* Dropzone Container */}
              <div
                className="p-8 sm:p-12 text-center rounded-3xl bg-bg-elevated/40 border-2 border-dashed border-border hover:border-accent transition-all space-y-4 group cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilesSelected(e.dataTransfer.files);
                }}
              >
                <div className="w-16 h-16 rounded-3xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                  <FolderOpen className="w-8 h-8" />
                </div>

                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="text-sm sm:text-base font-bold text-text-primary">
                    Kéo thả Thư mục hoặc các file .md vào đây
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Hệ thống sẽ tự động quét toàn bộ các file Markdown trong thư mục, sắp xếp theo tên và chuyển đổi mỗi file thành 1 bài viết chuẩn phong cách Lab.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => folderInputRef.current?.click()}
                    disabled={isProcessingFiles}
                    className="bg-accent hover:bg-accent-hover text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>{isProcessingFiles ? "Đang đọc thư mục..." : "Chọn Thư Mục (Folder)"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => multipleFilesInputRef.current?.click()}
                    disabled={isProcessingFiles}
                    className="text-xs text-text-primary border-border hover:bg-bg-elevated font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5"
                  >
                    <FileCode className="w-4 h-4 text-accent" />
                    <span>Chọn Nhiều File .md</span>
                  </Button>
                </div>
              </div>

              {/* Hướng dẫn đặt tên file */}
              <div className="p-4 rounded-2xl bg-bg-panel border border-border/80 text-xs text-text-secondary space-y-2">
                <div className="font-bold text-text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Mẹo Đặt Tên File Để Sắp Xếp Tự Động:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-text-muted">
                  <div className="p-2 rounded-xl bg-bg-elevated/60 border border-border/60">
                    <span className="text-accent">01-memory-layout.md</span> $\rightarrow$ Bài 1
                  </div>
                  <div className="p-2 rounded-xl bg-bg-elevated/60 border border-border/60">
                    <span className="text-accent">02-bitwise-operations.md</span> $\rightarrow$ Bài 2
                  </div>
                  <div className="p-2 rounded-xl bg-bg-elevated/60 border border-border/60">
                    <span className="text-accent">03-volatile-qualifier.md</span> $\rightarrow$ Bài 3
                  </div>
                  <div className="p-2 rounded-xl bg-bg-elevated/60 border border-border/60">
                    <span className="text-accent">04-function-pointers.md</span> $\rightarrow$ Bài 4
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "input" && importMode === "text" ? (
            /* --- TEXT PASTE VIEW --- */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Dán văn bản Markdown vào khung dưới đây:</span>
                <span className="font-mono text-[11px]">Tách nhiều bài qua dấu <code>---</code></span>
              </div>
              <textarea
                rows={14}
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
            /* --- PREVIEW VIEW --- */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Đã chuyển đổi thành công <strong>{parsedPosts.length} bài học</strong> sẵn sàng nạp vào Form:
                  </span>
                </div>

                {importMode === "folder" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => folderInputRef.current?.click()}
                    className="text-[11px] h-7 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    Chọn lại Folder
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {parsedPosts.map((post, idx) => {
                  const sourceFileName = loadedFiles[idx]?.filename;

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-3xl bg-bg-elevated/40 border border-border/80 space-y-4 shadow-sm relative group"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-border">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-accent text-white font-mono font-bold text-xs flex items-center justify-center shadow-md">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-text-primary">
                              {post.title}
                            </h4>
                            {sourceFileName && (
                              <span className="text-[10px] text-text-muted font-mono block">
                                Nguồn file: {sourceFileName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted font-mono">{post.readTime}</span>
                          {loadedFiles.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLoadedFile(idx)}
                              className="p-1 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Bỏ bài này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {post.summary && (
                        <div className="p-3 rounded-xl bg-bg-panel text-xs text-text-secondary border-l-4 border-accent">
                          <strong>Tóm tắt:</strong> {post.summary}
                        </div>
                      )}

                      {post.codeSnippet && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                            Mã nguồn ({post.codeLang || "c"} - {post.codeFilename || "main.c"}):
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
                            Lý thuyết hiển thị:
                          </span>
                          <div
                            className="p-4 rounded-2xl bg-bg-panel border border-border prose prose-slate dark:prose-invert max-w-none text-xs text-text-primary max-h-60 overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-bg-elevated/40 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Hủy bỏ
          </Button>

          <div className="flex items-center gap-2">
            {activeTab === "input" && importMode === "text" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleParseText}
                disabled={!inputText.trim()}
                className="text-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1 text-accent" />
                <span>Xem Trước</span>
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApply}
              disabled={parsedPosts.length === 0}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Nạp Vào Form ({parsedPosts.length} bài)</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
