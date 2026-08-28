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

interface TutorialSidebarProps {
  topic: TutorialTopic;
  currentPostSlug?: string;
  onCollapse?: () => void;
}

export function TutorialSidebar({ topic, currentPostSlug, onCollapse }: TutorialSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const currentIndex = topic.posts.findIndex((p) => p.slug === currentPostSlug);
  const currentPostOrder = currentIndex !== -1 ? currentIndex + 1 : 1;
  const progressPercent = Math.round((currentPostOrder / Math.max(1, topic.posts.length)) * 100);

  const filteredPosts = topic.posts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="hidden lg:block w-80 flex-shrink-0 bg-bg-panel border border-border/80 rounded-3xl p-5 shadow-xl space-y-5 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none">
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
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border transition-all cursor-pointer"
            title="Thu gọn danh mục bài học"
          >
            <PanelLeftClose className="w-4 h-4 text-text-muted hover:text-accent" />
          </button>
        )}
      </div>

      <div>
        {/* Topic Header Card */}
        <div className="p-3.5 rounded-2xl bg-bg-elevated/70 border border-border/70 flex items-start gap-3">
          <span className="text-3xl p-2 rounded-xl bg-bg-panel border border-border shadow-inner flex-shrink-0">
            {topic.icon}
          </span>
          <div className="min-w-0 flex-1">
            <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 text-[10px] font-mono font-bold uppercase tracking-wider inline-block mb-1">
              {topic.categoryName}
            </span>
            <h2 className="text-xs sm:text-sm font-extrabold text-text-primary line-clamp-2 leading-tight">
              {topic.title}
            </h2>
          </div>
        </div>
      </div>

      {/* Curriculum Progress Bar */}
      <div className="p-3.5 rounded-2xl bg-bg-panel border border-border/60 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text-secondary flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-accent" />
            <span>Tiến độ chuyên đề</span>
          </span>
          <span className="font-mono font-bold text-accent text-xs">
            Bài {currentPostOrder} / {topic.posts.length} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden border border-border/50">
          <div
            className="h-full bg-gradient-to-r from-accent to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Search in topic */}
      <div className="relative">
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
      <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-2 px-1">
          Giáo trình ({topic.posts.length} bài học)
        </span>

        {filteredPosts.map((post, idx) => {
          const isActive = post.slug === currentPostSlug;
          const isPassed = post.order < currentPostOrder;

          return (
            <Link
              key={post.slug}
              href={`/tutorials/${topic.slug}/${post.slug}`}
              className={`group flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition-all ${
                isActive
                  ? "bg-accent/15 text-accent font-bold border border-accent/40 shadow-md ring-1 ring-accent/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              {/* Order / Status icon */}
              <span
                className={`w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${
                  isActive
                    ? "bg-accent text-white shadow-sm"
                    : isPassed
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-bg-elevated text-text-muted group-hover:bg-accent/20 group-hover:text-accent"
                }`}
              >
                {isPassed ? "✓" : post.order}
              </span>

              <div className="flex-1 min-w-0">
                <span className={`line-clamp-2 leading-snug ${isActive ? "text-accent font-bold" : ""}`}>
                  {post.title}
                </span>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-normal">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
              </div>

              {isActive && <ChevronRight className="w-3.5 h-3.5 text-accent flex-shrink-0 self-center" />}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
