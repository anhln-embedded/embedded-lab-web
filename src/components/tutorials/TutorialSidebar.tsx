"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TutorialTopic } from "@/lib/tutorials-data";
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  CheckCircle,
  GraduationCap,
  PanelLeftClose
} from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";

interface TutorialSidebarProps {
  topic: TutorialTopic;
  currentPostSlug?: string;
  completedPosts?: Set<string>;
  onCollapse?: () => void;
}

export function TutorialSidebar({
  topic,
  currentPostSlug,
  completedPosts = new Set(),
  onCollapse,
}: TutorialSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const currentIndex = topic.posts.findIndex((p) => p.slug === currentPostSlug);
  const currentPostOrder = currentIndex !== -1 ? currentIndex + 1 : 1;

  const completedCount = completedPosts.size;
  const progressPercent = Math.round(
    ((completedCount > 0 ? completedCount : currentPostOrder) / Math.max(1, topic.posts.length)) * 100
  );

  const filteredPosts = topic.posts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="hidden lg:flex flex-col w-80 flex-shrink-0 bg-bg-panel border border-border/80 rounded-3xl p-5 shadow-2xl sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-hidden">
      {/* Top action bar: Back to all & Collapse button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <Link
          href="/tutorials"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-accent transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Tất cả chuyên đề Lab</span>
        </Link>

        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border transition-all cursor-pointer"
            title="Thu gọn danh mục bài học"
          >
            <PanelLeftClose className="w-4 h-4 text-text-muted hover:text-accent" />
          </button>
        )}
      </div>

      {/* Topic Header Card */}
      <div className="p-3.5 rounded-2xl bg-bg-elevated/70 border border-border/70 flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-bg-panel border border-border shadow-inner flex items-center justify-center text-accent flex-shrink-0">
          <CategoryIcon icon={topic.icon} slug={topic.category} name={topic.categoryName} className="w-6 h-6 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 text-[10px] font-mono font-bold uppercase tracking-wider inline-block mb-1">
            {topic.categoryName}
          </span>
          <h2 className="text-xs sm:text-sm font-extrabold text-text-primary line-clamp-2 leading-tight">
            {topic.title}
          </h2>
        </div>
      </div>

      {/* Curriculum Progress Bar (LearningVN Style) */}
      <div className="p-3.5 rounded-2xl bg-bg-elevated/40 border border-border/60 space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text-secondary flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-accent" />
            <span>Tiến độ học tập</span>
          </span>
          <span className="font-mono font-bold text-accent text-xs">
            {completedCount > 0 ? `${completedCount}/${topic.posts.length} bài` : `Bài ${currentPostOrder}/${topic.posts.length}`}{" "}
            ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden border border-border/50">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Search in topic */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm bài học trong chuyên đề..."
          className="w-full pl-9 pr-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Posts List */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-2 px-1">
          Giáo trình ({topic.posts.length} bài học)
        </span>

        {filteredPosts.map((post) => {
          const isActive = post.slug === currentPostSlug;
          const isCompleted = completedPosts.has(post.slug);

          return (
            <Link
              key={post.slug}
              href={`/tutorials/${topic.slug}/${post.slug}`}
              className={`group relative flex items-start gap-2.5 p-2.5 rounded-2xl text-xs transition-all ${
                isActive
                  ? "bg-accent/15 text-accent font-bold border border-accent/40 shadow-md ring-1 ring-accent/30"
                  : isCompleted
                  ? "bg-accent/5 hover:bg-accent/10 border border-accent/20 text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent"
              }`}
            >
              {/* Order / Status icon (LearningVN style status badge) */}
              <span
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${
                  isCompleted
                    ? "bg-accent text-white shadow-xs"
                    : isActive
                    ? "bg-accent text-white shadow-md shadow-accent/30 ring-2 ring-accent/20"
                    : "bg-bg-elevated text-text-muted group-hover:bg-accent/20 group-hover:text-accent border border-border/80"
                }`}
              >
                {isCompleted ? "✓" : post.order}
              </span>

              <div className="flex-1 min-w-0 pr-1">
                <span
                  className={`line-clamp-2 leading-snug ${
                    isActive ? "text-accent font-bold" : isCompleted ? "font-semibold" : ""
                  }`}
                >
                  {post.title}
                </span>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-normal">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-accent/80" />
                    {post.readTime}
                  </span>
                  {isCompleted && (
                    <span className="text-accent font-semibold text-[10px]">
                      • Đã học
                    </span>
                  )}
                </div>
              </div>

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-accent flex-shrink-0 self-center" />
              )}
            </Link>
          );
        })}
      </div>

      {/* LearningVN Style Bottom "Ẩn menu" collapse button */}
      {onCollapse && (
        <div className="pt-3 mt-2 border-t border-border/60">
          <button
            type="button"
            onClick={onCollapse}
            className="w-full py-2 px-3 rounded-xl bg-bg-elevated/70 hover:bg-bg-elevated border border-border text-text-muted hover:text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <PanelLeftClose className="w-3.5 h-3.5 text-text-muted" />
            <span>Ẩn menu giáo trình</span>
          </button>
        </div>
      )}
    </aside>
  );
}
