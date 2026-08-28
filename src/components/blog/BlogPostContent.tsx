"use client";

import * as React from "react";
import Link from "next/link";
import { cn, siteConfig, formatDate, getTagColor } from "@/lib/utils";
import { BlogPostData, getRelatedPosts, getPostsBySeries } from "@/lib/content";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  ArrowRight,
  Share2,
  GitBranch,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  Layers,
  Sparkles,
  Heart,
  MessageSquare,
  Edit3
} from "lucide-react";

interface BlogPostContentProps {
  post: BlogPostData;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const relatedPosts = getRelatedPosts(post);
  const seriesPosts = post.series ? getPostsBySeries(post.series) : [];
  const currentSeriesIndex = seriesPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentSeriesIndex > 0 ? seriesPosts[currentSeriesIndex - 1] : null;
  const nextPost =
    currentSeriesIndex !== -1 && currentSeriesIndex < seriesPosts.length - 1
      ? seriesPosts[currentSeriesIndex + 1]
      : null;

  const [copied, setCopied] = React.useState(false);
  const [readingProgress, setReadingProgress] = React.useState(0);
  const [likes, setLikes] = React.useState(post.likesCount || 0);
  const [hasLiked, setHasLiked] = React.useState(false);

  // Comments state
  const [comments, setComments] = React.useState<any[]>([]);
  const [newCommentName, setNewCommentName] = React.useState("");
  const [newCommentContent, setNewCommentContent] = React.useState("");
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

  // Fetch live comments and likes from SQLite API
  React.useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch(`/api/posts/${post.slug}/comments`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setComments(json.data);
        }
      } catch (e) {
        // silent fallback
      }
    }
    loadComments();
  }, [post.slug]);

  // Scroll reading progress
  React.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikes((prev) => prev + 1);

    try {
      await fetch(`/api/posts/${post.slug}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "increment" }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentContent.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${post.slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: newCommentName.trim(),
          content: newCommentContent.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setComments([json.data, ...comments]);
        setNewCommentContent("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Check if content is HTML (from Google Docs Editor)
  const isHtml = post.contentHtml || (post.body?.raw && post.body.raw.includes("<"));
  const htmlContent = post.contentHtml || (post.body && post.body.raw) || "";

  return (
    <article className="min-h-screen pb-20">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-bg-panel/40">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header Banner */}
      <div className="border-b border-border/80 bg-gradient-to-b from-bg-panel to-bg-primary py-12 md:py-16">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại danh sách bài viết</span>
            </Link>

            <Link
              href={`/admin/posts/${post.slug}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-bg-elevated text-xs font-semibold text-text-secondary hover:text-accent hover:border-accent transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Chỉnh sửa bài này
            </Link>
          </div>

          {/* Series badge */}
          {post.series && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent-muted text-accent text-xs font-semibold border border-accent/20">
                <Layers className="h-3.5 w-3.5" />
                Series: {post.series} (Bài {post.seriesOrder || 1})
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <span>{post.readingTime} phút đọc</span>
              </div>
              <span>•</span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-bg-elevated text-text-secondary font-mono">
                {post.author}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLike}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all ${
                  hasLiked
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-400"
                    : "border-border bg-bg-elevated text-text-secondary hover:text-rose-400 hover:border-rose-500/40"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${hasLiked ? "fill-current text-rose-500" : ""}`} />
                <span>{likes} Thích</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-bg-elevated text-text-secondary hover:text-accent hover:border-accent/40 transition-all text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copied ? "Đã sao chép link" : "Chia sẻ"}</span>
              </button>

              {post.githubUrl && (
                <a
                  href={post.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-bg-elevated text-text-secondary hover:text-accent hover:border-accent/40 transition-all text-xs"
                >
                  <GitBranch className="h-3.5 w-3.5 text-accent" />
                  <span className="hidden sm:inline">Mã nguồn Lab</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container max-w-6xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Body */}
          <div className="lg:col-span-8 space-y-8">
            {/* Rich Document Content Container */}
            <div className="bg-bg-panel border border-border/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl">
              {isHtml ? (
                <div
                  className="prose prose-invert !max-w-none w-full text-text-primary leading-[1.85] text-base sm:text-lg space-y-6 article-rich-content"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : (
                <div className="text-text-primary leading-[1.85] whitespace-pre-wrap text-base sm:text-lg space-y-6 font-sans">
                  {htmlContent}
                </div>
              )}
            </div>

            {/* Tags footer */}
            <div className="pt-6 border-t border-border/80">
              <h4 className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-3 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-accent" />
                Chủ đề kỹ thuật
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog/tags/${tag}`}>
                    <Badge variant="default" size="sm" className="hover:border-accent transition-colors">
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="pt-8 border-t border-border/80 space-y-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                Thảo Luận & Bình Luận ({comments.length})
              </h3>

              {/* Comment Input Form */}
              <form onSubmit={handleCommentSubmit} className="bg-bg-panel border border-border rounded-2xl p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    placeholder="Tên của bạn / Khóa lớp (VD: Nguyễn Văn A - D22)..."
                    required
                    className="px-3.5 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <textarea
                  rows={3}
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder="Gửi câu hỏi hoặc ý kiến thảo luận về bài viết này..."
                  required
                  className="w-full px-3.5 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmittingComment}
                    className="bg-accent text-white font-semibold text-xs"
                  >
                    {isSubmittingComment ? "Đang gửi..." : "Gửi Bình Luận"}
                  </Button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-text-muted italic">Chưa có bình luận nào. Hãy là người đầu tiên trao đổi!</p>
                ) : (
                  comments.map((cmt) => (
                    <div key={cmt.id} className="p-4 rounded-xl bg-bg-elevated/60 border border-border space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-text-primary">{cmt.author}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-mono">
                            {cmt.authorRole || "Thành viên"}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-muted font-mono">
                          {cmt.createdAt ? new Date(cmt.createdAt).toLocaleDateString("vi-VN") : ""}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pt-1">{cmt.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Author Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-bg-panel to-bg-elevated border border-border/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-accent-muted border border-accent/30 flex items-center justify-center flex-shrink-0 text-accent font-bold text-lg">
                PTIT
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-text-primary text-sm">{post.author}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent/20 text-accent font-mono font-semibold">
                    Research Group
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  {post.authorTitle || "Khoa Điện Tử 1 - Học viện Công nghệ Bưu chính Viễn thông"}
                </p>
                <p className="text-[11px] text-text-muted">
                  Chia sẻ kiến thức thực nghiệm, tài liệu lab và các công trình nghiên cứu vi mạch nhúng & AIoT.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Quick Actions Card */}
              <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Tương tác bài viết
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleLike}
                    size="sm"
                    variant="outline"
                    className={`w-full text-xs font-bold ${hasLiked ? "text-rose-400 border-rose-500/40" : ""}`}
                  >
                    <Heart className={`w-3.5 h-3.5 mr-1.5 ${hasLiked ? "fill-current text-rose-500" : ""}`} />
                    {likes} Thích
                  </Button>
                  <Button onClick={handleShare} size="sm" variant="outline" className="w-full text-xs">
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Chia sẻ
                  </Button>
                </div>
              </div>

              {/* Related Posts Widget */}
              {relatedPosts.length > 0 && (
                <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3 flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                    Bài viết liên quan
                  </h3>
                  <div className="space-y-3">
                    {relatedPosts.map((rel) => (
                      <Link
                        key={rel.slug}
                        href={rel.url}
                        className="block p-2.5 rounded-xl border border-border/50 bg-bg-elevated/40 hover:border-accent/40 transition-all group"
                      >
                        <h4 className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                          {rel.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-text-muted font-mono">
                          <span>{rel.readingTime} min</span>
                          <span>•</span>
                          <span>{rel.tags[0]}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Roadmap CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-bg-panel to-accent-muted/20 border border-accent/30 text-center">
                <h4 className="text-xs font-bold text-text-primary mb-1">Lộ Trình Đào Tạo Lab</h4>
                <p className="text-[11px] text-text-muted mb-3">
                  Theo dõi tiến độ học tập và tích lũy kỹ năng theo chuẩn đào tạo kỹ sư nghiên cứu PTIT.
                </p>
                <Button variant="pill" size="sm" className="w-full text-xs bg-accent text-white" asChild>
                  <Link href="/roadmap">Khám phá Lộ trình học</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
