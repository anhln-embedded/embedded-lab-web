"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BlogPostData } from "@/lib/content";
import {
  Heart,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
  Pin,
  Flame,
  Terminal,
  Cpu,
  Layers,
  Zap,
  Megaphone,
  FlaskConical,
  Trophy,
  Share2
} from "lucide-react";

interface BentoPostGridProps {
  posts: BlogPostData[];
  onPostUpdated?: () => void;
}

export function BentoPostGrid({ posts, onPostUpdated }: BentoPostGridProps) {
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const handleLike = async (e: React.MouseEvent, post: BlogPostData) => {
    e.preventDefault();
    e.stopPropagation();

    const isLiked = likedPosts[post._id];
    const currentLikes = likeCounts[post._id] ?? (post.likesCount || 0);
    const newLikes = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    setLikedPosts((prev) => ({ ...prev, [post._id]: !isLiked }));
    setLikeCounts((prev) => ({ ...prev, [post._id]: newLikes }));

    try {
      await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isLiked ? "unlike" : "like" }),
      });
      if (onPostUpdated) onPostUpdated();
    } catch {
      // Revert if failed
      setLikedPosts((prev) => ({ ...prev, [post._id]: isLiked }));
      setLikeCounts((prev) => ({ ...prev, [post._id]: currentLikes }));
    }
  };

  if (!posts || posts.length === 0) {
    return null;
  }

  // Identify featured hero post (first pinned or first item)
  const heroPost = posts.find((p) => p.pinned || p.featured) || posts[0];
  const regularPosts = posts.filter((p) => p._id !== heroPost._id);

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "recruitment":
        return <Megaphone className="w-3.5 h-3.5 text-rose-400" />;
      case "daily":
        return <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />;
      case "event":
        return <Trophy className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case "recruitment":
        return { label: "Tuyển Thành Viên", style: "border-rose-500/30 bg-rose-500/10 text-rose-400" };
      case "daily":
        return { label: "Nhật Ký Lab", style: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" };
      case "event":
        return { label: "Sự Kiện & NCKH", style: "border-purple-500/30 bg-purple-500/10 text-purple-400" };
      default:
        return { label: "Kỹ Thuật & Nghiên Cứu", style: "border-accent/30 bg-accent/10 text-accent" };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* 1. HERO BENTO CARD (Span 2 cols on Desktop) */}
      {heroPost && (
        <div className="md:col-span-2 group relative rounded-3xl linear-card-border linear-shine overflow-hidden transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 bg-bg-panel/90">
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 blur-3xl pointer-events-none -z-10 rounded-full" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

          {/* Top Bar: Badges & Pinned Status */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {heroPost.pinned && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-white shadow-md shadow-accent/25 animate-pulse">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                  Ghim Nổi Bật
                </span>
              )}
              {(() => {
                const badge = getTypeBadge(heroPost.postType);
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.style}`}>
                    {getTypeIcon(heroPost.postType)}
                    {badge.label}
                  </span>
                );
              })()}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
              <Calendar className="w-3.5 h-3.5" />
              <span>{heroPost.date}</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-4 my-auto">
            <Link href={heroPost.url || `/blog/${heroPost.slug}`} className="block group-hover:text-accent transition-colors">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text-primary leading-tight tracking-tight">
                {heroPost.title}
              </h3>
            </Link>

            <p className="text-sm sm:text-base text-text-secondary line-clamp-3 leading-relaxed">
              {heroPost.excerpt}
            </p>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {heroPost.tags?.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-bg-elevated border border-border/80 text-text-secondary flex items-center gap-1"
                >
                  <span className="text-accent">#</span>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Author & Interactive Actions */}
          <div className="mt-8 pt-5 border-t border-border/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-muted border border-accent/40 flex items-center justify-center font-bold text-accent text-sm">
                {heroPost.authorAvatar ? (
                  <img src={heroPost.authorAvatar} alt={heroPost.author} className="w-full h-full rounded-full object-cover" />
                ) : (
                  heroPost.author?.charAt(0) || "L"
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-text-primary">{heroPost.author}</div>
                <div className="text-[11px] text-text-muted">{heroPost.authorTitle || "Embedded R&D Lab"}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleLike(e, heroPost)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  likedPosts[heroPost._id]
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                    : "bg-bg-elevated border-border text-text-muted hover:text-rose-400 hover:border-rose-500/30"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${likedPosts[heroPost._id] ? "fill-rose-400" : ""}`} />
                <span>{likeCounts[heroPost._id] ?? heroPost.likesCount ?? 0}</span>
              </button>

              <Link
                href={heroPost.url || `/blog/${heroPost.slug}`}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-all"
              >
                <span>Đọc bài</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. REGULAR BENTO CARDS */}
      {regularPosts.map((post) => {
        const badge = getTypeBadge(post.postType);
        const isLiked = likedPosts[post._id];
        const likes = likeCounts[post._id] ?? post.likesCount ?? 0;

        return (
          <div
            key={post._id}
            className="group relative rounded-3xl linear-card-border linear-shine overflow-hidden transition-all duration-300 flex flex-col justify-between p-6 bg-bg-panel/90 hover:scale-[1.01]"
          >
            {/* Header Badge & Date */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.style}`}>
                  {getTypeIcon(post.postType)}
                  {badge.label}
                </span>

                <div className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                  <Clock className="w-3 h-3" />
                  <span>{post.readingTime || "5 phút"}</span>
                </div>
              </div>

              {/* Title & Excerpt */}
              <Link href={post.url || `/blog/${post.slug}`} className="block group-hover:text-accent transition-colors">
                <h4 className="text-base sm:text-lg font-bold text-text-primary leading-snug line-clamp-2 mb-2">
                  {post.title}
                </h4>
              </Link>

              <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed mb-4">
                {post.excerpt}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags?.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-bg-elevated border border-border text-text-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-muted border border-accent/30 flex items-center justify-center font-bold text-accent text-[10px]">
                  {post.author?.charAt(0) || "L"}
                </div>
                <span className="text-text-secondary font-medium truncate max-w-[100px]">{post.author}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleLike(e, post)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                    isLiked
                      ? "text-rose-400 bg-rose-500/10"
                      : "text-text-muted hover:text-rose-400 hover:bg-bg-elevated"
                  }`}
                >
                  <Heart className={`w-3 h-3 ${isLiked ? "fill-rose-400" : ""}`} />
                  <span className="text-[11px]">{likes}</span>
                </button>

                <Link
                  href={post.url || `/blog/${post.slug}`}
                  className="p-1.5 rounded-lg bg-bg-elevated text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
                  title="Xem chi tiết"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
