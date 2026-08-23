"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BlogPostData } from "@/lib/content";
import {
  POST_TYPE_META,
  toggleLikePost,
  isPostLikedByUser,
  getPostComments,
  addPostComment,
  PostComment
} from "@/lib/posts-store";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Pin,
  CheckCircle2,
  Clock,
  Calendar,
  Send,
  MoreHorizontal,
  Bookmark,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { FacebookIcon } from "@/components/ui/FacebookIcon";

interface FanpagePostCardProps {
  post: BlogPostData;
  onPostUpdated?: () => void;
}

export function FanpagePostCard({ post, onPostUpdated }: FanpagePostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(() => isPostLikedByUser(post._id));
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>(() => getPostComments(post._id));
  const [commentInput, setCommentInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const postTypeMeta = post.postType ? POST_TYPE_META[post.postType] : POST_TYPE_META.general;

  const handleLike = () => {
    const res = toggleLikePost(post._id);
    setIsLiked(res.isLiked);
    setLikesCount(res.count);
    if (onPostUpdated) onPostUpdated();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const authorName = user ? user.name : "Sinh viên PTIT";
    const authorRole = user ? (user.role === "superadmin" ? "Super Admin" : user.role === "admin" ? "Giảng viên / Admin" : "Sinh viên") : "Khách";

    const newCmt = addPostComment(post._id, authorName, commentInput.trim(), authorRole);
    setComments([...comments, newCmt]);
    setCommentInput("");
    if (onPostUpdated) onPostUpdated();
  };

  const handleShare = () => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${post.url}` : post.url;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLongContent = post.excerpt && post.excerpt.length > 250;

  return (
    <div className="bg-bg-panel border border-border/80 rounded-2xl md:rounded-3xl shadow-lg hover:border-border transition-all overflow-hidden">
      {/* 1. Card Header */}
      <div className="p-5 md:p-6 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          {/* Lab Avatar with Verified Ring */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-accent to-amber-500 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-white dark:bg-bg-panel flex items-center justify-center overflow-hidden border border-border">
                <img
                  src="/images/logo.png"
                  alt="Embedded-AIoT Lab Logo"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] shadow" title="Trang Fanpage Chính Thức PTIT">
              ✓
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-bold text-sm md:text-base text-text-primary hover:text-accent transition-colors flex items-center gap-1">
                Embedded AIoT Laboratory
              </h3>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs text-text-muted font-medium">{post.authorTitle || post.author}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-accent" />
                {post.date}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-text-muted" />
                {post.readingTime} phút đọc
              </span>
              <span>·</span>
              <span className="text-text-muted">🌐 Công khai</span>
            </div>
          </div>
        </div>

        {/* Post Type Badge & Pinned Tag */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {post.pinned && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-sm">
              <Pin className="w-3 h-3 fill-current" />
              Đã ghim
            </span>
          )}

          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${postTypeMeta.badgeColor}`}>
            <span>{postTypeMeta.icon}</span>
            <span>{postTypeMeta.label}</span>
          </span>
        </div>
      </div>

      {/* 2. Post Title & Body Content */}
      <div className="px-5 md:px-6 py-2 space-y-3">
        <h2 className="text-base md:text-lg font-bold text-text-primary leading-snug hover:text-accent transition-colors">
          <Link href={post.url}>
            {post.title}
          </Link>
        </h2>

        <div className="text-xs md:text-sm text-text-secondary leading-relaxed space-y-2">
          <p className={isExpanded ? "" : "line-clamp-4"}>
            {post.excerpt}
          </p>
          {isLongContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-accent text-xs font-semibold hover:underline inline-block pt-1"
            >
              {isExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
            </button>
          )}
        </div>

        {/* Tags / Hashtags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tags/${tag}`}
              className="text-accent hover:text-accent-hover text-xs font-mono font-medium hover:underline"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Media Preview (Single or Gallery) */}
      {post.coverImage && (
        <div className="mt-3 border-y border-border/60 bg-bg-code overflow-hidden relative group">
          <Link href={post.url}>
            <div className="relative aspect-video max-h-[360px] w-full overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </Link>
        </div>
      )}

      {/* 4. Post Engagement Metrics Bar */}
      <div className="px-5 md:px-6 py-2.5 flex items-center justify-between text-xs text-text-muted border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
            ❤️
          </span>
          <span className="font-semibold text-text-primary">{likesCount}</span>
          <span>lượt thích</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline text-text-secondary"
          >
            {comments.length} bình luận
          </button>
          <span>·</span>
          <span>PTIT Fanpage</span>
        </div>
      </div>

      {/* 5. Interaction Buttons Action Bar */}
      <div className="px-3 py-1.5 grid grid-cols-4 gap-1 border-b border-border/50 bg-bg-elevated/20">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            isLiked
              ? "text-rose-400 bg-rose-500/10 font-bold"
              : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          <span>Thích</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Bình luận</span>
        </button>

        {/* Share Link */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-all"
          title="Sao chép liên kết bài viết"
        >
          <Share2 className="w-4 h-4" />
          <span>{copied ? "Đã sao chép!" : "Chia sẻ"}</span>
        </button>

        {/* Facebook Link or Read Full */}
        <a
          href={post.facebookPostUrl || "https://www.facebook.com/EmbeddedAIoTLAB"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          <FacebookIcon className="w-4 h-4" />
          <span>Facebook</span>
        </a>
      </div>

      {/* 6. Expandable Comment Section */}
      {showComments && (
        <div className="p-5 md:p-6 bg-bg-elevated/40 space-y-4 border-t border-border/50">
          {/* Write comment input */}
          <form onSubmit={handleAddComment} className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Viết bình luận / đặt câu hỏi cho phòng Lab..."
              className="flex-1 px-3.5 py-2 bg-bg-panel border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <Button type="submit" variant="primary" size="sm" className="bg-accent hover:bg-accent-hover text-white px-3 py-2 text-xs">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-xs text-text-muted italic py-1">
              Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
            </p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {comments.map((cmt) => (
                <div key={cmt.id} className="p-3 rounded-xl bg-bg-panel border border-border/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-text-primary">{cmt.author}</span>
                      {cmt.authorRole && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-bg-elevated text-accent font-semibold border border-border">
                          {cmt.authorRole}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-text-muted">{cmt.createdAt}</span>
                  </div>
                  <p className="text-text-secondary leading-relaxed">{cmt.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. Bottom Quick Read Article Link */}
      <div className="px-5 py-2.5 bg-bg-elevated/20 border-t border-border/40 flex items-center justify-between text-xs">
        <Link href={post.url} className="text-accent font-semibold hover:underline flex items-center gap-1">
          <span>Xem chi tiết nội dung nghiên cứu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <span className="text-[11px] text-text-muted">Embedded-AIoT Lab · PTIT</span>
      </div>
    </div>
  );
}
