"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TUTORIAL_TOPICS, TUTORIAL_CATEGORIES } from "@/lib/tutorials-data";
import { TutorialTopicCard } from "@/components/tutorials/TutorialTopicCard";
import {
  BookOpen,
  Search,
  Sparkles,
  Layers,
  GraduationCap,
  ArrowRight,
  Compass,
  Cpu
} from "lucide-react";

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = useMemo(() => {
    return TUTORIAL_TOPICS.filter((topic) => {
      const matchCat =
        selectedCategory === "all" || topic.category === selectedCategory;
      const matchQuery =
        searchQuery === "" ||
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.posts.some((p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="container py-8 sm:py-12 space-y-10 max-w-7xl mx-auto px-4">
      {/* --- HERO SECTION --- */}
      <div className="relative rounded-3xl bg-gradient-to-br from-bg-panel via-bg-elevated to-bg-panel border border-border/80 p-8 sm:p-12 shadow-2xl overflow-hidden text-center sm:text-left">
        {/* Glow Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Thư Viện Chuyên Đề Kỹ Thuật (Knowledge Base Hub)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary leading-tight tracking-tight">
            Chuyên Đề <span className="text-accent">Hệ Thống Nhúng</span> & AIoT Chuyên Sâu
          </h1>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Học tập theo chuỗi bài viết kiến trúc chuyên sâu: Linux Device Driver, FreeRTOS, Automotive UDS/CAN Bus, Vi điều khiển STM32 Bare-Metal và Thiết kế Vi Mạch FPGA.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm chuyên đề, từ khóa (vd: Device Tree, Mutex, UDS, STM32)..."
                className="w-full pl-11 pr-4 py-3 bg-bg-panel border border-border rounded-2xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent shadow-inner transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- CATEGORY FILTER TABS --- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TUTORIAL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-accent text-white shadow-md shadow-accent/20 scale-102"
                : "bg-bg-panel border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* --- TOPICS GRID --- */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            <span>Danh Sách Chuyên Đề ({filteredTopics.length} chuyên đề)</span>
          </h2>
          <span className="text-xs text-text-muted font-medium">
            Được biên soạn bởi Đội ngũ Mentor Lab PTIT
          </span>
        </div>

        {filteredTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredTopics.map((topic) => (
              <TutorialTopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-bg-panel border border-dashed border-border space-y-3">
            <Compass className="w-10 h-10 text-text-muted mx-auto" />
            <p className="text-sm font-semibold text-text-secondary">
              Không tìm thấy chuyên đề phù hợp với từ khóa &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs text-accent font-bold hover:underline"
            >
              Xóa bộ lọc & xem tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
