"use client";

import React from "react";
import Link from "next/link";
import { TutorialTopic } from "@/lib/tutorials-data";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  User,
  GraduationCap
} from "lucide-react";

interface TutorialTopicCardProps {
  topic: TutorialTopic;
}

export function TutorialTopicCard({ topic }: TutorialTopicCardProps) {
  return (
    <div className="group relative rounded-3xl bg-bg-panel border border-border/80 hover:border-accent/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/15 transition-all pointer-events-none" />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl p-2.5 rounded-2xl bg-bg-elevated border border-border shadow-inner flex items-center justify-center">
              {topic.icon}
            </span>
            <div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
                {topic.categoryName}
              </span>
              <span className="text-xs font-semibold text-text-muted">
                {topic.posts.length} bài viết chi tiết
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
            {topic.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 mb-2.5">
          <Link href={`/tutorials/${topic.slug}`}>
            {topic.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed mb-4">
          {topic.description}
        </p>

        {/* Featured Posts Preview List */}
        <div className="space-y-1.5 pt-3 border-t border-border/60 mb-4">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
            Bài viết nổi bật trong chuỗi:
          </span>
          {topic.posts.slice(0, 2).map((post) => (
            <Link
              key={post.slug}
              href={`/tutorials/${topic.slug}/${post.slug}`}
              className="flex items-center gap-2 text-xs text-text-secondary hover:text-accent transition-colors py-1 group/post"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent/50 group-hover/post:bg-accent flex-shrink-0" />
              <span className="truncate">{post.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          <User className="w-3.5 h-3.5 text-text-muted" />
          <span>{topic.author}</span>
        </div>

        <Link
          href={`/tutorials/${topic.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-accent group-hover:translate-x-1 transition-transform"
        >
          <span>Khám phá chuỗi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
