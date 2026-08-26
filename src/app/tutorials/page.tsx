"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { TUTORIAL_TOPICS, TutorialTopic, TutorialPost } from "@/lib/tutorials-data";
import { TutorialTopicCard } from "@/components/tutorials/TutorialTopicCard";
import { CategoryManagerModal, TutorialCategoryItem } from "@/components/tutorials/CategoryManagerModal";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Search,
  Sparkles,
  Layers,
  GraduationCap,
  ArrowRight,
  Compass,
  Cpu,
  Clock,
  ChevronRight,
  Filter,
  CheckCircle2,
  FileCode,
  Tag,
  LayoutGrid,
  List,
  X,
  Flame,
  ArrowUpRight,
  Settings,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const INITIAL_CATEGORIES = [
  { slug: "linux", name: "Embedded Linux & Kernel", icon: "🐧", order: 1 },
  { slug: "rtos", name: "Real-Time OS (RTOS)", icon: "⚡", order: 2 },
  { slug: "automotive", name: "Automotive & CAN/UDS", icon: "🚗", order: 3 },
  { slug: "mcu", name: "Vi Điều Khiển & SoC", icon: "🎛️", order: 4 },
  { slug: "programming", name: "Lập Trình C & Kỹ Năng", icon: "💻", order: 5 },
  { slug: "hardware", name: "Phần Cứng PCB & FPGA", icon: "📐", order: 6 },
];

export default function TutorialsPage() {
  const { user } = useAuth();
  const isAuthorized = user && (user.role === "superadmin" || user.role === "admin");

  const [categories, setCategories] = useState<TutorialCategoryItem[]>(INITIAL_CATEGORIES);
  const [topics, setTopics] = useState<TutorialTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadData = async () => {
    try {
      // 1. Fetch categories
      const catRes = await fetch("/api/tutorials/categories");
      const catJson = await catRes.json();
      if (catJson.success && Array.isArray(catJson.data) && catJson.data.length > 0) {
        setCategories(catJson.data);
      }

      // 2. Fetch topics from database
      const topicRes = await fetch("/api/tutorials");
      const topicJson = await topicRes.json();
      if (topicJson.success && Array.isArray(topicJson.data)) {
        setTopics(topicJson.data);
      }
    } catch (e) {
      console.error("Failed to load tutorials data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("embedded_tutorials_updated", handleUpdate);
    return () => window.removeEventListener("embedded_tutorials_updated", handleUpdate);
  }, []);

  // Lọc chuyên đề
  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchCat =
        selectedCategory === "all" || topic.category === selectedCategory;
      const matchLevel =
        selectedLevel === "all" || topic.level.toLowerCase() === selectedLevel.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        q === "" ||
        topic.title.toLowerCase().includes(q) ||
        topic.description.toLowerCase().includes(q) ||
        topic.categoryName.toLowerCase().includes(q) ||
        topic.posts.some(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q)
        );

      return matchCat && matchLevel && matchQuery;
    });
  }, [topics, selectedCategory, selectedLevel, searchQuery]);

  // Thu thập tất cả các bài viết con khớp với từ khóa tìm kiếm (Deep Search)
  const matchedArticles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: Array<{
      topic: TutorialTopic;
      post: TutorialPost;
    }> = [];

    topics.forEach((topic) => {
      topic.posts?.forEach((post) => {
        if (
          post.title.toLowerCase().includes(q) ||
          post.summary.toLowerCase().includes(q) ||
          post.contentHtml.toLowerCase().includes(q)
        ) {
          results.push({ topic, post });
        }
      });
    });

    return results;
  }, [topics, searchQuery]);

  // Từ khóa phổ biến gợi ý
  const POPULAR_KEYWORDS = [
    { label: "Linux Driver", query: "linux" },
    { label: "FreeRTOS", query: "freertos" },
    { label: "UDS ISO 14229", query: "uds" },
    { label: "STM32 Register", query: "stm32" },
    { label: "Queue IPC", query: "queue" },
  ];

  // Tính tổng số bài viết trong toàn bộ hệ thống
  const totalSystemArticles = useMemo(() => {
    return topics.reduce((acc, t) => acc + (t.posts?.length || 0), 0);
  }, [topics]);

  return (
    <div className="container py-8 sm:py-12 max-w-7xl mx-auto px-4 space-y-8">
      {/* --- HEADER BANNER GỌN GÀNG & HIỆN ĐẠI --- */}
      <div className="relative rounded-3xl bg-gradient-to-br from-bg-panel via-bg-elevated to-bg-panel border border-border/80 p-6 sm:p-10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Thư Viện Chuyên Đề Kỹ Thuật (Knowledge Base Hub)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
              Chuyên Đề <span className="text-accent">Hệ Thống Nhúng</span> & AIoT
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Tổng hợp {topics.length} chuyên đề lớn và {totalSystemArticles} bài giảng kỹ thuật chi tiết: Linux Device Driver, FreeRTOS, Automotive UDS/CAN Bus và Vi điều khiển Bare-Metal.
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-bg-panel/80 border border-border p-3.5 rounded-2xl shadow-sm">
            <div className="text-center px-3 border-r border-border">
              <div className="text-xl font-extrabold text-accent font-mono">
                {topics.length}
              </div>
              <div className="text-[10px] font-bold text-text-muted uppercase">Chủ đề</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                {totalSystemArticles}
              </div>
              <div className="text-[10px] font-bold text-text-muted uppercase">Bài viết</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- THANH TÌM KIẾM TO RÕ & TỪ KHÓA HOT --- */}
      <div className="p-5 rounded-3xl bg-bg-panel border border-border/80 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm chuyên đề, bài viết, thanh ghi, driver, RTOS (vd: Device Tree, Mutex, UDS, STM32)..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-bg-elevated/70 dark:bg-bg-elevated border border-border text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent shadow-inner transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-panel transition-colors"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-bg-elevated/70 border border-border text-xs text-text-secondary">
              <Filter className="w-3.5 h-3.5 text-text-muted" />
              <span className="font-semibold text-text-muted">Cấp độ:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-transparent text-text-primary font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="beginner">Beginner (Cơ bản)</option>
                <option value="intermediate">Intermediate (Trung cấp)</option>
                <option value="advanced">Advanced (Nâng cao)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-bg-elevated/70 border border-border">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl text-xs transition-all ${
                  viewMode === "grid"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
                title="Xem dạng Lưới Card"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-xl text-xs transition-all ${
                  viewMode === "list"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
                title="Xem dạng Danh sách / Bảng mục lục"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Keyword Tags */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-border/50">
          <span className="text-text-muted font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Tìm kiếm phổ biến:</span>
          </span>
          {POPULAR_KEYWORDS.map((kw) => (
            <button
              key={kw.query}
              type="button"
              onClick={() => setSearchQuery(kw.query)}
              className="px-2.5 py-1 rounded-xl bg-bg-elevated hover:bg-accent/15 hover:text-accent border border-border/80 text-[11px] font-medium text-text-secondary transition-all cursor-pointer"
            >
              #{kw.label}
            </button>
          ))}
          {(searchQuery || selectedCategory !== "all" || selectedLevel !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedLevel("all");
              }}
              className="text-[11px] font-bold text-red-400 hover:underline ml-auto flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* --- BỐ CỤC 2 CỘT KHOA HỌC: SIDEBAR DANH MỤC + VÙNG NỘI DUNG --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* --- CỘT TRÁI: SIDEBAR CÂY DANH MỤC LĨNH VỰC --- */}
        <div className="lg:col-span-1 bg-bg-panel border border-border/80 rounded-3xl p-5 shadow-lg space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-accent" />
              <span>Danh Mục Chuyên Sâu</span>
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-full">
                {categories.length} nhóm
              </span>
              {isAuthorized && (
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="p-1 rounded-lg text-text-muted hover:text-accent hover:bg-bg-elevated transition-colors"
                  title="Quản lý danh mục nhóm (Admin)"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            {/* Mục Tất cả */}
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-base flex-shrink-0">📚</span>
                <span className="truncate">Tất cả chuyên đề</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-white/20 text-white"
                    : "bg-bg-elevated text-text-muted"
                }`}
              >
                {topics.length}
              </span>
            </button>

            {/* Các nhóm chuyên đề động */}
            {categories.map((cat) => {
              const count = topics.filter((t) => t.category === cat.slug).length;
              const isActive = selectedCategory === cat.slug;

              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-accent text-white shadow-md shadow-accent/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base flex-shrink-0">{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-bg-elevated text-text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Admin Fast Category Management Button */}
          {isAuthorized && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryModalOpen(true)}
              className="w-full text-xs text-accent border-accent/40 hover:bg-accent/10 flex items-center justify-center gap-1.5 py-2 rounded-2xl font-bold"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Chỉnh Sửa Nhóm Danh Mục</span>
            </Button>
          )}

          {/* Quick Help Callout */}
          <div className="p-3.5 rounded-2xl bg-bg-elevated/50 border border-border/80 text-[11px] text-text-muted space-y-1.5 pt-3">
            <div className="font-bold text-text-primary flex items-center gap-1 text-xs">
              <GraduationCap className="w-3.5 h-3.5 text-accent" />
              <span>Lab Learning Path</span>
            </div>
            <p className="leading-relaxed">
              Bạn có thể học theo từng chuyên đề hoặc xem toàn bộ lộ trình kỹ sư tại trang{" "}
              <Link href="/roadmap" className="text-accent font-bold hover:underline">
                Lộ trình học
              </Link>
              .
            </p>
          </div>
        </div>

        {/* --- CỘT PHẢI: KẾT QUẢ TÌM KIẾM & DANH SÁCH CHUYÊN ĐỀ --- */}
        <div className="lg:col-span-3 space-y-6">
          {/* 1. Nếu có từ khóa tìm kiếm -> Hiển thị Deep Articles Search Results */}
          {searchQuery.trim() && matchedArticles.length > 0 && (
            <div className="p-5 rounded-3xl bg-accent/5 border border-accent/30 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-accent" />
                  <span>
                    Tìm thấy <strong className="text-accent">{matchedArticles.length}</strong> bài viết khớp với &quot;{searchQuery}&quot;:
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {matchedArticles.slice(0, 6).map(({ topic, post }) => (
                  <Link
                    key={`${topic.slug}-${post.slug}`}
                    href={`/tutorials/${topic.slug}/${post.slug}`}
                    className="p-3.5 rounded-2xl bg-bg-panel hover:bg-bg-elevated border border-border hover:border-accent/40 transition-all group shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs p-1 rounded-lg bg-bg-elevated border border-border">
                          {topic.icon}
                        </span>
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider truncate">
                          {topic.title}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-text-muted mt-2 pt-2 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      <span className="font-bold text-accent group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        <span>Đọc bài</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 2. Danh Sách Chủ Đề Lớn */}
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              <span>
                {selectedCategory === "all"
                  ? "Tất Cả Chuyên Đề"
                  : categories.find((c) => c.slug === selectedCategory)?.name || "Chuyên Đề"}{" "}
                ({filteredTopics.length} chuyên đề)
              </span>
            </h2>

            <span className="text-xs text-text-muted font-medium">
              Hiển thị {filteredTopics.length} / {topics.length} chuyên đề
            </span>
          </div>

          {filteredTopics.length > 0 ? (
            viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTopics.map((topic) => (
                  <TutorialTopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            ) : (
              /* LIST VIEW / TABLE OF CONTENTS */
              <div className="space-y-4">
                {filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-5 rounded-3xl bg-bg-panel border border-border/80 shadow-md space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-2xl bg-bg-elevated border border-border">
                          {topic.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                              {topic.categoryName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                              {topic.level}
                            </span>
                          </div>
                          <Link
                            href={`/tutorials/${topic.slug}`}
                            className="text-sm sm:text-base font-bold text-text-primary hover:text-accent transition-colors"
                          >
                            {topic.title}
                          </Link>
                        </div>
                      </div>

                      <Link
                        href={`/tutorials/${topic.slug}`}
                        className="text-xs font-bold text-accent hover:underline flex items-center gap-1 self-end sm:self-center"
                      >
                        <span>Xem toàn bộ chuỗi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Posts inside topic */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {topic.posts?.map((post) => (
                        <Link
                          key={post.slug}
                          href={`/tutorials/${topic.slug}/${post.slug}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-bg-elevated/40 hover:bg-bg-elevated border border-border/60 hover:border-accent/40 text-xs transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="w-5 h-5 rounded-lg bg-bg-elevated text-accent font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                              {post.order}
                            </span>
                            <span className="text-text-secondary group-hover:text-text-primary font-medium truncate">
                              {post.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-muted flex-shrink-0 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="p-12 text-center rounded-3xl bg-bg-panel border border-dashed border-border space-y-3">
              <Compass className="w-10 h-10 text-text-muted mx-auto" />
              <p className="text-sm font-semibold text-text-secondary">
                Không tìm thấy chuyên đề nào phù hợp với bộ lọc hiện tại.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                }}
                className="text-xs text-accent font-bold hover:underline cursor-pointer"
              >
                Xóa bộ lọc & xem tất cả ({topics.length} chuyên đề)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Quản lý danh mục nhóm (Admin) */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onUpdated={() => {
          loadData();
        }}
      />
    </div>
  );
}
