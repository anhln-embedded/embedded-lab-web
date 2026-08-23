"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search, X, Command, ArrowUp, ArrowDown, ArrowRight, FileText, GraduationCap, Loader2, Send } from "lucide-react";

interface SearchResult {
  type: "blog" | "course";
  title: string;
  description: string;
  url: string;
  tags: string[];
  date?: string;
}

export function SearchModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Open with Cmd/Ctrl + K or custom event
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        setResults([]);
        setSelectedIndex(0);
      }
    };

    const handleOpenSearch = () => {
      setIsOpen(true);
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-search-modal", handleOpenSearch);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-search-modal", handleOpenSearch);
    };
  }, []);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search API call
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=8`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
          setSelectedIndex(0);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Search error:", err);
            setLoading(false);
          }
        });
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            window.location.href = results[selectedIndex].url;
            setIsOpen(false);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-modal-container")) {
        setIsOpen(false);
        setQuery("");
        setResults([]);
        setSelectedIndex(0);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0 && results[selectedIndex]) {
      window.location.href = results[selectedIndex].url;
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal Container */}
      <div className="relative w-full max-w-xl animate-slide-up search-modal-container z-10 space-y-2">
        {/* 1. Pill Shape Search Bar (y hệt Trang chủ) */}
        <form onSubmit={handleSubmit} className="relative z-30">
          <div className="w-full h-12 sm:h-14 rounded-full bg-white dark:bg-bg-panel border border-border hover:border-accent/60 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20 shadow-2xl transition-all duration-300 flex items-center pl-5 sm:pl-6 pr-1.5 sm:pr-2 backdrop-blur-xl group">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm bài viết, STM32, RTOS..."
              className="flex-1 h-full bg-transparent text-text-primary placeholder:text-text-muted text-xs sm:text-sm font-medium focus:outline-none"
              aria-label="Tìm kiếm bài viết"
              autoComplete="off"
              spellCheck={false}
            />

            {/* Clear button when text exists */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  inputRef.current?.focus();
                }}
                className="p-1.5 sm:p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors mr-1"
                title="Xóa từ khóa"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Right Action: Clean Magnifier -> Circular Paper Airplane */}
            {query.trim() ? (
              <button
                type="submit"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-accent to-accent-amber hover:brightness-110 text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all cursor-pointer hover:scale-105 active:scale-95 flex-shrink-0 animate-fade-in"
                title="Tìm kiếm (Enter)"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" />
                )}
              </button>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent-muted border border-accent/30 text-accent flex items-center justify-center shadow-sm group-hover:bg-accent group-hover:text-white transition-all flex-shrink-0">
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
            )}
          </div>
        </form>

        {/* 2. Results Dropdown Container (đồng bộ với Trang chủ) */}
        <div className="rounded-3xl bg-white dark:bg-bg-panel border border-border shadow-2xl p-3 backdrop-blur-2xl animate-fade-in text-left overflow-hidden">
          {/* Header Info */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/80 mb-2 text-[11px] font-mono text-text-muted">
            <span>
              {query.trim() ? `Kết quả cho: "${query}"` : "Tìm kiếm nhanh trong hệ thống"}
            </span>
            {results.length > 0 && (
              <span className="text-accent font-semibold">{results.length} kết quả</span>
            )}
          </div>

          {/* Results list / Empty State */}
          <div className="max-h-[340px] overflow-y-auto pr-1">
            {loading && (
              <div className="py-10 text-center text-text-muted space-y-2">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-accent" />
                <p className="text-xs">Đang tìm kiếm trong hệ thống...</p>
              </div>
            )}

            {!loading && results.length === 0 && query.trim() && (
              <div className="py-10 text-center text-text-muted space-y-1">
                <Search className="h-10 w-10 mx-auto opacity-20 text-accent" />
                <p className="text-sm font-semibold text-text-primary">Không tìm thấy kết quả phù hợp</p>
                <p className="text-xs">Hãy thử từ khóa khác như STM32, RTOS, FPGA, AIoT...</p>
              </div>
            )}

            {!loading && results.length === 0 && !query.trim() && (
              <div className="py-8 text-center text-text-muted space-y-1">
                <Search className="h-9 w-9 mx-auto opacity-20 text-accent" />
                <p className="text-sm font-medium text-text-primary">Gõ từ khóa để tìm kiếm</p>
                <p className="text-xs">Tìm kiếm nhanh bài viết kỹ thuật, đề tài NCKH và khóa học</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-1.5" role="listbox">
                {results.map((result, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <Link
                      key={`${result.url}-${index}`}
                      href={result.url}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery("");
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "flex items-start gap-3 p-2.5 rounded-2xl transition-all",
                        isSelected
                          ? "bg-accent/10 border border-accent/30 shadow-sm"
                          : "hover:bg-bg-elevated"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors mt-0.5",
                        isSelected
                          ? "bg-accent text-white"
                          : "bg-accent/10 text-accent border border-accent/20"
                      )}>
                        {result.type === "course" ? (
                          <GraduationCap className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-xs sm:text-sm font-semibold text-text-primary hover:text-accent transition-colors truncate">
                            {result.title}
                          </h4>
                          <span className="px-2 py-0.2 text-[10px] font-semibold bg-accent/15 text-accent rounded-full flex-shrink-0">
                            {result.type === "course" ? "Khóa học" : "Bài viết"}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted line-clamp-1">
                          {result.description}
                        </p>
                      </div>

                      <ArrowRight className={cn(
                        "w-3.5 h-3.5 mt-1.5 flex-shrink-0 transition-transform",
                        isSelected ? "text-accent translate-x-0.5" : "text-text-muted opacity-40"
                      )} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="pt-2.5 mt-2 border-t border-border/80 flex items-center justify-between text-[11px] font-mono text-text-muted px-1">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-bg-elevated border border-border rounded text-text-primary">
                <ArrowUp className="h-2.5 w-2.5 inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-bg-elevated border border-border rounded text-text-primary">
                <ArrowDown className="h-2.5 w-2.5 inline" />
              </kbd>
              <span>chọn</span>
              <span className="mx-1">·</span>
              <kbd className="px-1.5 py-0.5 bg-bg-elevated border border-border rounded text-text-primary">
                Enter
              </kbd>
              <span>mở</span>
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-bg-elevated border border-border rounded text-text-primary">
                ESC
              </kbd>
              <span> đóng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}