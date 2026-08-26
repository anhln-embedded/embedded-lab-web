"use client";

import React from "react";
import Link from "next/link";
import { TutorialTopic, TutorialPost } from "@/lib/tutorials-data";
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Search
} from "lucide-react";

interface TutorialSidebarProps {
  topic: TutorialTopic;
  currentPostSlug?: string;
}

export function TutorialSidebar({ topic, currentPostSlug }: TutorialSidebarProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredPosts = topic.posts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 bg-bg-panel border border-border/80 rounded-3xl p-5 shadow-xl space-y-5 h-fit sticky top-24">
      {/* Back to all tutorials link */}
      <div>
        <Link
          href="/tutorials"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Tất cả chuyên đề kỹ thuật</span>
        </Link>

        <div className="flex items-center gap-3 pb-3 border-b border-border/60">
          <span className="text-3xl p-2 rounded-2xl bg-bg-elevated border border-border shadow-inner">
            {topic.icon}
          </span>
          <div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
              {topic.categoryName}
            </span>
            <h2 className="text-sm font-bold text-text-primary line-clamp-2 leading-tight">
              {topic.title}
            </h2>
          </div>
        </div>
      </div>

      {/* Search Posts in Topic */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Lọc bài viết trong chuyên đề..."
          className="w-full pl-9 pr-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Posts List */}
      <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">
          Mục lục chuyên đề ({topic.posts.length} bài)
        </span>

        {filteredPosts.map((post) => {
          const isActive = post.slug === currentPostSlug;
          return (
            <Link
              key={post.slug}
              href={`/tutorials/${topic.slug}/${post.slug}`}
              className={`group flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition-all ${
                isActive
                  ? "bg-accent/15 text-accent font-bold border border-accent/30 shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-bg-elevated text-text-muted group-hover:bg-accent/20 group-hover:text-accent"
                }`}
              >
                {post.order}
              </span>

              <div className="flex-1 min-w-0">
                <span className="line-clamp-2 leading-snug">{post.title}</span>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-normal">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
