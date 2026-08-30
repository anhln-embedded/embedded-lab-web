"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BlogPostList } from "@/components/blog/BlogPostList";

const CyberSnakeCanvas = dynamic(() => import("@/components/3d/CyberSnakeCanvas"), {
  ssr: false,
});
import {
  Search,
  GraduationCap,
  ArrowRight,
  BookOpen,
  PlusCircle,
  ChevronDown,
  Sparkles,
  X,
  Loader2,
  FileText,
  Send
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

const SLIDES = [
  { id: "hero", label: "Giới thiệu" },
  { id: "posts", label: "Bài viết mới" },
];

interface SearchResult {
  type: "blog" | "course";
  title: string;
  description: string;
  url: string;
  tags: string[];
  date?: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const [activeSlide, setActiveSlide] = useState("hero");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollPos = containerRef.current.scrollTop;
      const windowHeight = containerRef.current.clientHeight;

      const slideIndex = Math.round(scrollPos / windowHeight);
      if (SLIDES[slideIndex]) {
        setActiveSlide(SLIDES[slideIndex].id);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Shortcut Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        scrollToSlide("hero");
      }
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Live search query fetching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=6`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data.results || []);
          setIsSearching(false);
          setShowDropdown(true);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Search error:", err);
            setIsSearching(false);
          }
        });
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const scrollToSlide = (slideId: string) => {
    const el = document.getElementById(slideId);
    if (el && containerRef.current) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    scrollToSlide("posts");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className="relative bg-bg-primary text-text-primary selection:bg-accent/30 selection:text-white">
      {/* Floating Slide Navigation Indicator (Right side) */}
      <div className="fixed right-5 sm:right-7 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-3.5 pointer-events-auto">
        {SLIDES.map((slide) => {
          const isActive = activeSlide === slide.id;
          return (
            <button
              key={slide.id}
              onClick={() => scrollToSlide(slide.id)}
              className="group flex items-center gap-2.5 cursor-pointer py-1"
              title={slide.label}
            >
              <span
                className={`text-[11px] font-mono transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                  isActive ? "text-accent font-semibold opacity-100" : "text-text-muted"
                }`}
              >
                {slide.label}
              </span>
              <div
                className={`w-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "h-8 bg-accent shadow-[0_0_15px_rgba(240,90,40,0.8)]"
                    : "h-2.5 bg-border hover:bg-text-secondary"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Snap Scroll Fullscreen Container */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-4rem)] overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {/* =========================================================================
            SLIDE 1: HERO & ADAPTIVE SEARCH BAR (FULLSCREEN SNAP)
        ========================================================================= */}
        <section
          id="hero"
          className="min-h-[calc(100vh-4rem)] w-full snap-start snap-always flex flex-col justify-center items-center relative overflow-hidden px-4 py-8 border-b border-border/80 bg-grid-pattern"
        >
          {/* 3D Cyber Snake Background (Zero-Load Impact & Auto GPU-Pause) */}
          <CyberSnakeCanvas />

          {/* Ambient Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-accent/15 blur-[150px] pointer-events-none -z-10 rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-[380px] h-[240px] bg-cyan-500/10 blur-[130px] pointer-events-none -z-10 rounded-full" />

          <div className="max-w-4xl mx-auto text-center space-y-6 my-auto">
            {/* Headline - Pure High Contrast White on Dark, Dark on Light */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-text-primary">
              <span className="inline-block">Lộ Trình Đào Tạo & Nghiên Cứu</span> <br />
              <span className="gradient-text-brand inline-block mt-1">
                Hệ Thống Nhúng & AIoT
              </span>
            </h1>

            {/* Subtitle - Crisp Slate Silver on Dark, Slate on Light */}
            <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed font-normal">
              Nền tảng học chuyên sâu từ vi điều khiển Bare-metal, RTOS, Linux Kernel đến FPGA và TinyML
            </p>

            {/* Adaptive High-End Search Bar */}
            <div className="w-full max-w-xl mx-auto pt-2 relative" ref={searchBoxRef}>
              <form onSubmit={handleSearchSubmit} className="relative z-30">
                <div className="w-full h-12 sm:h-14 rounded-full bg-bg-panel border border-border hover:border-accent/60 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20 shadow-2xl transition-all duration-300 flex items-center pl-5 sm:pl-6 pr-1.5 sm:pr-2 backdrop-blur-xl group">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim()) setShowDropdown(true);
                    }}
                    placeholder="Nhập từ khóa tìm kiếm bài viết, STM32, RTOS..."
                    className="flex-1 h-full bg-transparent text-text-primary placeholder:text-text-muted text-xs sm:text-sm font-medium focus:outline-none"
                    aria-label="Tìm kiếm bài viết"
                  />

                  {/* Clear button when text exists */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="p-1.5 sm:p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors mr-1"
                      title="Xóa từ khóa"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Right Action: Clean Magnifier -> Circular Paper Airplane */}
                  {searchQuery.trim() ? (
                    <button
                      type="submit"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-accent to-accent-amber hover:brightness-110 text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all cursor-pointer hover:scale-105 active:scale-95 flex-shrink-0 animate-fade-in"
                      title="Tìm kiếm (Enter)"
                    >
                      {isSearching ? (
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

              {/* Live Search Suggestions Dropdown */}
              {showDropdown && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-bg-panel border border-border shadow-2xl p-3 z-40 backdrop-blur-2xl animate-fade-in text-left max-h-[340px] overflow-y-auto">
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-border mb-2 text-[11px] font-mono text-text-muted">
                    <span>Kết quả tìm kiếm cho: &quot;{searchQuery}&quot;</span>
                    {searchResults.length > 0 && (
                      <span className="text-accent font-semibold">{searchResults.length} kết quả</span>
                    )}
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="py-6 text-center text-xs text-text-muted space-y-1">
                      {isSearching ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-accent" />
                          <span>Đang tìm kiếm...</span>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-text-primary">Không tìm thấy bài viết phù hợp</p>
                          <p className="text-[11px] text-text-muted">Thử tìm với từ khóa khác như STM32, RTOS, FPGA, AIoT...</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {searchResults.map((item, idx) => (
                        <Link
                          key={`${item.url}-${idx}`}
                          href={item.url}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-bg-elevated transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent group-hover:text-white transition-colors">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 mt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        scrollToSlide("posts");
                      }}
                      className="text-accent hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Xem toàn bộ kết quả bên dưới</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-[10px]">Nhấn ESC để đóng</span>
                  </div>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button
                variant="pill"
                className="h-11 px-7 text-xs sm:text-sm font-semibold bg-gradient-to-r from-accent to-accent-amber text-white shadow-lg hover:shadow-accent/25 hover:scale-[1.02] transition-all inline-flex items-center justify-center"
                asChild
              >
                <Link href="/roadmap">
                  <GraduationCap className="w-4 h-4 mr-1.5" />
                  Khám Phá Lộ Trình
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>

              <Button
                variant="pill"
                onClick={() => scrollToSlide("posts")}
                className="h-11 px-6 text-xs sm:text-sm font-medium border border-border bg-bg-elevated text-text-primary hover:border-accent/60 hover:text-accent transition-all inline-flex items-center justify-center backdrop-blur-sm cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent" />
                Đọc Bài Viết
              </Button>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <button
            onClick={() => scrollToSlide("posts")}
            className="mt-auto pt-4 flex flex-col items-center gap-1.5 text-text-muted hover:text-accent transition-colors cursor-pointer text-xs font-mono font-medium"
          >
            <span>Cuộn để xem bài viết</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-accent" />
          </button>
        </section>

        {/* =========================================================================
            SLIDE 2: BÀI VIẾT MỚI NHẤT (FULLSCREEN SNAP & SEMANTIC THEME)
        ========================================================================= */}
        <section
          id="posts"
          className="min-h-[calc(100vh-4rem)] w-full snap-start snap-always flex flex-col justify-center relative overflow-hidden px-4 py-8 bg-bg-panel/30"
        >
          <div className="container max-w-6xl mx-auto space-y-6 my-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-mono text-cyan-400 font-semibold block mb-1">
                  Ghi Chép & Nghiên Cứu
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                  {searchQuery.trim() ? (
                    <span>Kết quả tìm kiếm: &quot;{searchQuery}&quot;</span>
                  ) : (
                    <span>Bài Viết Kỹ Thuật Mới Nhất</span>
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSearch}
                    className="text-xs border-accent/40 text-accent hover:bg-accent/10"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Bỏ tìm kiếm
                  </Button>
                )}

                {user && (user.role === "admin" || user.role === "superadmin") && (
                  <Button variant="primary" size="sm" asChild className="bg-accent text-white text-xs">
                    <Link href="/admin/posts/new">
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                      Đăng bài mới
                    </Link>
                  </Button>
                )}

                <Button variant="outline" size="sm" asChild className="text-xs border-border hover:border-accent/40 text-text-secondary">
                  <Link href="/blog">Xem tất cả bài viết &rarr;</Link>
                </Button>
              </div>
            </div>

            {/* Posts Grid Container with real-time searchQuery sync */}
            <div className="max-h-[68vh] overflow-y-auto pr-1">
              <BlogPostList searchQuery={searchQuery} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}