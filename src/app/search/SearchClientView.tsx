"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  BookOpen,
  GraduationCap,
  Layers,
  FileText,
  Microscope,
  ArrowRight,
  Sparkles,
  X,
  Loader2,
  Filter,
  CheckCircle2,
  ExternalLink,
  Code2,
  Compass,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SearchResultItem, SearchResultType } from "@/app/api/search/route";

const POPULAR_SEARCHES = [
  "static",
  "volatile",
  "bit-banding",
  "FreeRTOS",
  "GPIO",
  "DMA",
  "STM32",
  "Memory layout",
  "Interrupt",
  "I2C SPI",
];

export function SearchClientView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, dict } = useLanguage();
  const isEn = locale === "en";

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<string>("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state if URL query changes
  useEffect(() => {
    const urlQ = searchParams.get("q") || "";
    if (urlQ !== query) {
      setQuery(urlQ);
    }
  }, [searchParams]);

  // Fetch search results
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}&type=${activeType}&limit=40`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
          setTotalCount(data.total || (data.results ? data.results.length : 0));
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Search fetch error:", err);
            setLoading(false);
          }
        });
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, activeType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleQuickChipClick = (keyword: string) => {
    setQuery(keyword);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
    inputRef.current?.focus();
  };

  // Group counts by type
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      all: totalCount,
      tutorial: 0,
      lesson: 0,
      course: 0,
      blog: 0,
      research: 0,
    };
    results.forEach((item) => {
      if (map[item.type] !== undefined) {
        map[item.type]++;
      }
    });
    return map;
  }, [results, totalCount]);

  // Helper render highlight
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-accent/25 text-accent font-semibold px-0.5 rounded-sm not-italic">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getTypeBadge = (type: SearchResultType) => {
    switch (type) {
      case "tutorial":
        return {
          label: isEn ? "Tutorial" : "Chuyên đề",
          icon: BookOpen,
          badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
          iconClass: "text-cyan-400 bg-cyan-500/10",
        };
      case "lesson":
        return {
          label: isEn ? "Lesson" : "Bài giảng",
          icon: GraduationCap,
          badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          iconClass: "text-emerald-400 bg-emerald-500/10",
        };
      case "course":
        return {
          label: isEn ? "Course" : "Khóa học",
          icon: Layers,
          badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
          iconClass: "text-purple-400 bg-purple-500/10",
        };
      case "research":
        return {
          label: isEn ? "Research" : "Nghiên cứu",
          icon: Microscope,
          badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
          iconClass: "text-blue-400 bg-blue-500/10",
        };
      case "blog":
      default:
        return {
          label: isEn ? "Bulletin" : "Bản tin",
          icon: FileText,
          badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          iconClass: "text-amber-400 bg-amber-500/10",
        };
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg-primary text-text-primary py-8 px-4 sm:px-6 lg:px-8 selection:bg-accent/30 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Search Header Banner */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? "Deep Technical Search Engine" : "Công cụ tìm kiếm sâu toàn diện"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
            {isEn ? "Search across Tutorials, Lessons & Research" : "Tìm kiếm Chuyên đề, Bài giảng & Nghiên cứu"}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
            {isEn
              ? "Instantly search keywords within titles, source code snippets, and in-depth article body."
              : "Tìm kiếm từ khóa trong tiêu đề, mã nguồn mẫu và sâu trong phần thân nội dung bài viết."}
          </p>

          {/* Search Input Bar */}
          <div className="w-full max-w-2xl mx-auto pt-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="w-full h-14 sm:h-16 rounded-full bg-bg-panel border border-border hover:border-accent/60 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20 shadow-2xl transition-all flex items-center pl-6 pr-2 backdrop-blur-xl">
                <Search className="w-5 h-5 text-accent flex-shrink-0 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    isEn
                      ? "Search keywords (e.g., static, volatile, FreeRTOS, bit-banding, GPIO)..."
                      : "Nhập từ khóa kỹ thuật (vd: static, volatile, FreeRTOS, bit-banding, GPIO)..."
                  }
                  className="flex-1 h-full bg-transparent text-text-primary placeholder:text-text-muted text-sm sm:text-base font-medium focus:outline-none"
                  autoFocus
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors mr-1 cursor-pointer"
                    title="Xóa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="h-10 sm:h-11 px-5 rounded-full bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-semibold flex items-center justify-center shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all cursor-pointer flex-shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{isEn ? "Search" : "Tìm kiếm"}</span>
                  )}
                </button>
              </div>
            </form>

            {/* Popular Searches Quick Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-text-muted">
              <span className="font-mono text-[11px] mr-1">{isEn ? "Popular:" : "Từ khóa gợi ý:"}</span>
              {POPULAR_SEARCHES.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickChipClick(chip)}
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-mono transition-all cursor-pointer ${
                    query.toLowerCase() === chip.toLowerCase()
                      ? "bg-accent text-white border-accent font-semibold shadow-xs"
                      : "bg-bg-elevated/70 hover:bg-accent/10 hover:text-accent border-border text-text-secondary"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Tabs & Counter */}
        {query.trim() && (
          <div className="border-b border-border/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              {[
                { id: "all", label: isEn ? "All" : "Tất cả", icon: Compass },
                { id: "tutorial", label: isEn ? "Tutorials" : "Chuyên đề", icon: BookOpen },
                { id: "lesson", label: isEn ? "Lessons" : "Bài giảng", icon: GraduationCap },
                { id: "course", label: isEn ? "Courses" : "Khóa học", icon: Layers },
                { id: "blog", label: isEn ? "Bulletins" : "Bản tin", icon: FileText },
                { id: "research", label: isEn ? "Research" : "Nghiên cứu", icon: Microscope },
              ].map((tab) => {
                const Icon = tab.icon;
                const count = counts[tab.id] || 0;
                const isActive = activeType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveType(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-accent text-white shadow-sm shadow-accent/20"
                        : "bg-bg-elevated/60 text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {activeType === "all" && tab.id !== "all" && count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-bg-primary text-text-muted"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Total Results Found Indicator */}
            <div className="text-xs font-mono text-text-muted flex items-center gap-2">
              {loading ? (
                <div className="flex items-center gap-1.5 text-accent">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? "Searching deeply..." : "Đang tìm kiếm sâu..."}</span>
                </div>
              ) : (
                <span>
                  {isEn ? "Found" : "Tìm thấy"}{" "}
                  <strong className="text-accent font-bold">{results.length}</strong>{" "}
                  {isEn ? "results for" : "kết quả cho"}{" "}
                  <strong className="text-text-primary">&quot;{query}&quot;</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results List or Empty State */}
        <div className="space-y-4">
          {loading && results.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
              <p className="text-sm font-medium text-text-secondary">
                {isEn ? "Scanning database and source files..." : "Đang rà soát cơ sở dữ liệu và mã nguồn..."}
              </p>
            </div>
          ) : !loading && query.trim() && results.length === 0 ? (
            <div className="py-16 text-center space-y-3 rounded-3xl bg-bg-panel border border-border/80 p-8 shadow-sm">
              <Search className="w-12 h-12 mx-auto text-text-muted opacity-30" />
              <h3 className="text-base font-bold text-text-primary">
                {isEn ? "No matching results found" : "Không tìm thấy nội dung phù hợp"}
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                {isEn
                  ? `We could not find any articles, lessons, or code matching "${query}". Try searching with another technical term or check your spelling.`
                  : `Không tìm thấy bài viết, bài giảng hoặc đoạn mã nào chứa từ khóa "${query}". Bạn hãy thử tìm với các từ khóa kỹ thuật phổ biến.`}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {POPULAR_SEARCHES.slice(0, 6).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleQuickChipClick(chip)}
                    className="px-3 py-1 rounded-xl bg-bg-elevated hover:bg-accent/15 hover:text-accent border border-border text-xs font-mono text-text-secondary transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : !query.trim() ? (
            <div className="py-16 text-center space-y-3 rounded-3xl bg-bg-panel/40 border border-dashed border-border/80 p-8">
              <Search className="w-10 h-10 mx-auto text-accent opacity-40" />
              <h3 className="text-base font-bold text-text-primary">
                {isEn ? "Type keywords to start deep searching" : "Nhập từ khóa để bắt đầu tìm kiếm sâu"}
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                {isEn
                  ? "Search across 40+ STM32 and Embedded C tutorials, bare-metal lessons, RTOS modules, and scientific papers."
                  : "Tìm kiếm xuyên suốt hơn 40 bài viết chuyên sâu STM32, C nâng cao, bài giảng Bare-metal, RTOS và đề tài NCKH."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((item, idx) => {
                const badge = getTypeBadge(item.type);
                const Icon = badge.icon;

                return (
                  <Link
                    key={`${item.url}-${idx}`}
                    href={item.url}
                    className="group block p-4 sm:p-5 rounded-2xl bg-bg-panel hover:bg-bg-elevated border border-border/80 hover:border-accent/40 shadow-xs hover:shadow-md transition-all space-y-2.5"
                  >
                    {/* Top Row: Type Badge, Breadcrumb, Date */}
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.badgeClass}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>

                        {item.breadcrumb && (
                          <span className="text-[11px] text-text-muted truncate font-mono">
                            {item.breadcrumb}
                          </span>
                        )}
                      </div>

                      {item.date && (
                        <span className="text-[10px] font-mono text-text-muted flex-shrink-0">
                          {item.date}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-accent transition-colors flex items-center justify-between gap-2">
                      <span>{renderHighlighted(item.title, query)}</span>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </h2>

                    {/* Matched Content Snippet or Description */}
                    {item.matchSnippet ? (
                      <div className="p-2.5 rounded-xl bg-bg-elevated/70 border border-border/60 text-xs text-text-secondary font-mono leading-relaxed space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-accent font-semibold uppercase tracking-wider">
                          <Code2 className="w-3 h-3" />
                          <span>
                            {item.matchField === "code"
                              ? (isEn ? "Found in code snippet:" : "Khớp trong khối mã nguồn:")
                              : item.matchField === "content"
                              ? (isEn ? "Found deep inside article content:" : "Khớp sâu trong nội dung bài viết:")
                              : (isEn ? "Found in summary:" : "Khớp trong tóm tắt:")}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-text-primary">
                          {renderHighlighted(item.matchSnippet, query)}
                        </p>
                      </div>
                    ) : item.description ? (
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {renderHighlighted(item.description, query)}
                      </p>
                    ) : null}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.tags.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-lg bg-bg-elevated text-[10px] font-mono text-text-muted border border-border/50"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
