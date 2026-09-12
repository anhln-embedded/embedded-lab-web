"use client";

import React, { useState } from "react";
import {
  DiscussionThread,
  DiscussionComment,
  DISCUSSION_CATEGORIES,
  DISCUSSION_FLAIRS,
  getDiscussionComments,
  createDiscussionComment,
  createDiscussionCommentApi,
  deleteDiscussionComment,
  voteDiscussionThread,
  reactDiscussionThread,
  voteDiscussionThreadApi,
  reactDiscussionThreadApi,
  VozReactionType,
} from "@/lib/discussion-store";
import { useAuth } from "@/context/AuthContext";
import { canUserDeleteContent } from "@/lib/permissions";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Eye,
  Share2,
  Quote,
  Send,
  Code2,
  Cpu,
  Clock,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Lock,
  CornerDownRight,
  Paperclip,
  Download,
  FileText,
  FileCode,
  Archive,
  File,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DiscussionDetailViewProps {
  thread: DiscussionThread;
  onBack: () => void;
  onThreadUpdated: (updated: DiscussionThread) => void;
  onRequestLogin: () => void;
  onDeleteThread?: (threadId: string) => void;
}

export function DiscussionDetailView({
  thread,
  onBack,
  onThreadUpdated,
  onRequestLogin,
  onDeleteThread,
}: DiscussionDetailViewProps) {
  const { user, quickLogin } = useAuth();

  const [comments, setComments] = useState<DiscussionComment[]>(() =>
    getDiscussionComments(thread.id)
  );
  const [commentText, setCommentText] = useState("");
  const [quoteTarget, setQuoteTarget] = useState<{ author: string; content: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tải bình luận mới nhất từ SQLite
  React.useEffect(() => {
    let isMounted = true;
    fetch(`/api/discussions/${thread.id}/comments`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data)) {
          setComments(json.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [thread.id]);

  const category = DISCUSSION_CATEGORIES.find((c) => c.id === thread.category);
  const flair = DISCUSSION_FLAIRS[thread.flair] || DISCUSSION_FLAIRS["thao-luan"];

  const handleVote = (direction: 1 | -1) => {
    if (!user) {
      onRequestLogin();
      return;
    }
    const currentVote = thread.userVote || 0;
    let diff = 0;
    if (currentVote === direction) diff = -direction;
    else if (currentVote === 0) diff = direction;
    else diff = direction * 2;

    const updated = voteDiscussionThread(thread.id, direction);
    if (updated) {
      onThreadUpdated(updated);
    }
    voteDiscussionThreadApi(thread.id, diff);
  };

  const handleReact = (reaction: VozReactionType) => {
    if (!user) {
      onRequestLogin();
      return;
    }
    const userReactions = [...(thread.userReactions || [])];
    const hasReacted = userReactions.includes(reaction);

    const updated = reactDiscussionThread(thread.id, reaction);
    if (updated) {
      onThreadUpdated(updated);
    }
    reactDiscussionThreadApi(thread.id, reaction, hasReacted ? "remove" : "add");
  };

  const handleCopyCode = () => {
    if (thread.codeSnippet && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(thread.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleQuote = (author: string, content: string) => {
    const trimmed = content.length > 180 ? content.slice(0, 180) + "..." : content;
    setQuoteTarget({ author, content: trimmed });
    // Scroll to reply input
    const el = document.getElementById("reply-input-box");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelQuote = () => {
    setQuoteTarget(null);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequestLogin();
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const newCmt = await createDiscussionCommentApi({
        threadId: thread.id,
        content: commentText,
        quoteAuthor: quoteTarget?.author,
        quoteContent: quoteTarget?.content,
        author: {
          id: user.id,
          name: user.name,
          role: user.role,
          avatar: user.avatar || user.googleAvatar || "👨‍💻",
        },
      });

      setComments((prev) => [...prev, newCmt]);
      setCommentText("");
      setQuoteTarget(null);
      setIsSubmitting(false);

      // Cập nhật số replies của thread
      onThreadUpdated({
        ...thread,
        repliesCount: thread.repliesCount + 1,
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-bg-panel border border-border text-xs font-semibold text-text-secondary hover:text-accent hover:border-accent/40 transition-all shadow-sm flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại<span className="hidden sm:inline"> danh sách diễn đàn</span></span>
        </button>

        {/* Nút Xóa bài: Superadmin, Tác giả, hoặc Admin kiểm duyệt bài user thường (Admin k xóa được bài admin khác) */}
        {user &&
          canUserDeleteContent({
            currentUser: user,
            author: {
              id: thread.authorId,
              name: thread.author,
              role: thread.authorRole || "user",
            },
            isDiscussionOrComment: true,
          }).allowed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (
                  window.confirm(
                    `Bạn có chắc chắn muốn xóa chủ đề "${thread.title}" không? Toàn bộ các bình luận sẽ bị xóa vĩnh viễn.`
                  )
                ) {
                  onDeleteThread?.(thread.id);
                }
              }}
              className="text-rose-500 border-rose-500/40 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold shadow-sm flex-shrink-0"
              title={user.role === "superadmin" ? "Xóa chủ đề (Superadmin)" : user.id === thread.authorId ? "Xóa chủ đề của bạn" : "Xóa chủ đề (Kiểm duyệt viên)"}
            >
              <Trash2 className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Xóa Chủ Đề Này</span>
              <span className="sm:hidden">Xóa Bài</span>
            </Button>
          )}
      </div>

      {/* Main Original Post (OP Card) */}
      <div className="bg-bg-panel border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 shadow-sm">
        {/* OP Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-md font-bold text-xs border uppercase tracking-wider",
                flair.badgeClass
              )}
            >
              {flair.prefix}
            </span>

            <div className="text-xs text-text-muted ml-auto flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(thread.createdAt)}</span>
            </div>
          </div>

          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-text-primary leading-tight">
            {thread.title}
          </h1>

          {/* Author Badge & Member Rank (VOZ Style) */}
          <div className="flex items-center gap-3 pt-2 pb-4 border-b border-border/60">
            <UserAvatar
              avatar={thread.authorAvatar}
              name={thread.author}
              role={thread.authorRole}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 border-accent/40 shadow-sm flex-shrink-0"
              textClassName="text-xl sm:text-2xl"
              size={48}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-text-primary">{thread.author}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                  {thread.authorTitle || "Thành viên"}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-text-muted block truncate mt-0.5">
                Tác giả bài viết • {thread.viewsCount} xem • {thread.repliesCount} phản hồi
              </span>
            </div>
          </div>
        </div>

        {/* OP Body Content */}
        <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-text-primary whitespace-pre-line">
          {thread.content}
        </div>

        {/* Attached Files Section (Tài Liệu & Hình Ảnh Đính Kèm) */}
        {thread.attachedFiles && thread.attachedFiles.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-accent" />
              <span>Tài Liệu & File Đính Kèm ({thread.attachedFiles.length})</span>
            </h4>

            {/* Images Grid if any */}
            {thread.attachedFiles.some((f) => f.type === "image") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {thread.attachedFiles
                  .filter((f) => f.type === "image")
                  .map((img) => (
                    <div
                      key={img.id}
                      className="group/img relative rounded-2xl overflow-hidden border border-border/80 bg-black/40 shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="w-full h-48 object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex items-center justify-between text-xs text-white">
                        <span className="truncate text-[11px] font-medium" title={img.name}>
                          {img.name}
                        </span>
                        <a
                          href={img.dataUrl}
                          download={img.name}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors flex-shrink-0 ml-1"
                          title="Tải ảnh về máy"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Document / Code / Archive Files List */}
            {thread.attachedFiles.some((f) => f.type !== "image") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {thread.attachedFiles
                  .filter((f) => f.type !== "image")
                  .map((file) => {
                    const formatSize = (bytes: number) => {
                      if (bytes < 1024) return bytes + " B";
                      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
                      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
                    };

                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-bg-elevated border border-border/80 hover:border-accent/40 transition-all text-xs shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="p-2.5 rounded-xl bg-accent/10 text-accent flex-shrink-0">
                            {file.type === "code" ? (
                              <FileCode className="w-5 h-5" />
                            ) : file.type === "document" ? (
                              <FileText className="w-5 h-5" />
                            ) : file.type === "archive" ? (
                              <Archive className="w-5 h-5" />
                            ) : (
                              <File className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span
                              className="font-bold text-text-primary block truncate text-xs"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {formatSize(file.size)}
                            </span>
                          </div>
                        </div>

                        <a
                          href={file.dataUrl}
                          download={file.name}
                          className="px-3 py-1.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors flex items-center gap-1.5 font-semibold text-xs flex-shrink-0 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Tải về</span>
                        </a>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Code Snippet Box with Syntax Copy if provided */}
        {thread.codeSnippet && (
          <div className="rounded-2xl bg-black/70 border border-border/80 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-mono text-text-muted">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <FileCode className="w-4 h-4" />
                Mã Nguồn C/C++ Mẫu
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{thread.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* OP Bottom Bar: Upvote Reddit + VOZ Reaction Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
          {/* Reddit Upvote pill */}
          <div className="flex items-center gap-1 bg-bg-elevated border border-border/80 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => handleVote(1)}
              className={cn(
                "p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold",
                thread.userVote === 1
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-accent hover:bg-accent/10"
              )}
            >
              <ChevronUp className="w-4 h-4" />
              <span>Upvote</span>
            </button>
            <span className="font-extrabold text-sm px-2 text-text-primary">{thread.votes}</span>
            <button
              onClick={() => handleVote(-1)}
              className={cn(
                "p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold",
                thread.userVote === -1
                  ? "bg-rose-500 text-white"
                  : "text-text-muted hover:text-rose-500 hover:bg-rose-500/10"
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* VOZ Reactions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted font-medium mr-1">Thả cảm xúc (VOZ):</span>
            <button
              onClick={() => handleReact("ung")}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                thread.userReactions?.includes("ung")
                  ? "bg-accent/20 border-accent text-accent"
                  : "bg-bg-elevated border-border hover:border-accent/40 text-text-secondary"
              )}
            >
              <span>👍 Ưng</span>
              <span className="font-bold">{thread.reactions.ung}</span>
            </button>

            <button
              onClick={() => handleReact("gach")}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                thread.userReactions?.includes("gach")
                  ? "bg-rose-500/20 border-rose-500 text-rose-400"
                  : "bg-bg-elevated border-border hover:border-rose-500/40 text-text-secondary"
              )}
            >
              <span>🧱 Gạch</span>
              <span className="font-bold">{thread.reactions.gach}</span>
            </button>

            <button
              onClick={() => handleReact("ung_bung")}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                thread.userReactions?.includes("ung_bung")
                  ? "bg-pink-500/20 border-pink-500 text-pink-400"
                  : "bg-bg-elevated border-border hover:border-pink-500/40 text-text-secondary"
              )}
            >
              <span>❤️ Ưng bụng</span>
              <span className="font-bold">{thread.reactions.ung_bung}</span>
            </button>

            <button
              onClick={() => handleReact("nguong_mo")}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                thread.userReactions?.includes("nguong_mo")
                  ? "bg-amber-500/20 border-amber-500 text-amber-400"
                  : "bg-bg-elevated border-border hover:border-amber-500/40 text-text-secondary"
              )}
            >
              <span>👏 Ngưỡng mộ</span>
              <span className="font-bold">{thread.reactions.nguong_mo}</span>
            </button>

            <button
              onClick={() => handleQuote(thread.author, thread.content)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-bg-elevated border border-border text-xs font-semibold text-text-secondary hover:text-accent hover:border-accent transition-colors ml-auto"
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Trích dẫn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          <span>Thảo Luận & Phản Hồi ({comments.length})</span>
        </h2>
        <span className="text-xs text-text-muted">Cộng đồng công nghệ mở</span>
      </div>

      {/* Comments Stream (VOZ & Reddit Threaded List) */}
      <div className="space-y-4">
        {comments.map((cmt, idx) => (
          <div
            key={cmt.id}
            className="bg-bg-panel border border-border/80 rounded-2xl p-5 space-y-3 shadow-sm hover:border-border transition-colors"
          >
            {/* Comment Author Header */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <UserAvatar
                  avatar={cmt.authorAvatar}
                  name={cmt.author}
                  role={cmt.authorRole}
                  className="w-8 h-8 rounded-full border border-border flex-shrink-0"
                  size={32}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">{cmt.author}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-bg-elevated text-text-muted font-medium border border-border/60">
                      {cmt.authorTitle || "Thành viên"}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted">{formatDate(cmt.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-text-muted">#{idx + 1}</span>
                <button
                  onClick={() => handleQuote(cmt.author, cmt.content)}
                  className="text-xs text-text-muted hover:text-accent p-1 rounded hover:bg-bg-elevated flex items-center gap-1"
                  title="Trích dẫn bình luận này"
                >
                  <Quote className="w-3 h-3" />
                  <span className="hidden sm:inline">Trích dẫn</span>
                </button>

                {/* Nút Xóa bình luận dành cho Admin / Tác giả */}
                {user && (user.role === "admin" || user.role === "superadmin" || user.id === cmt.authorId) && (
                  <button
                    onClick={() => {
                      if (window.confirm("Bạn có chắc chắn muốn xóa phản hồi này không?")) {
                        deleteDiscussionComment(cmt.id);
                        setComments((prev) => prev.filter((c) => c.id !== cmt.id));
                        onThreadUpdated({
                          ...thread,
                          repliesCount: Math.max(0, thread.repliesCount - 1),
                        });
                      }
                    }}
                    className="text-xs text-text-muted hover:text-rose-500 p-1 rounded hover:bg-rose-500/10 flex items-center gap-1 transition-colors"
                    title={
                      user.role === "admin" || user.role === "superadmin"
                        ? "Xóa phản hồi (Quyền Quản trị viên)"
                        : "Xóa phản hồi của bạn"
                    }
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    <span className="hidden sm:inline text-rose-500 font-medium">Xóa</span>
                  </button>
                )}
              </div>
            </div>

            {/* VOZ Quote Box if replying to another quote */}
            {cmt.quoteContent && (
              <div className="p-3 rounded-xl bg-bg-elevated/60 border-l-4 border-accent text-xs space-y-1 my-1">
                <div className="font-bold text-accent flex items-center gap-1">
                  <Quote className="w-3 h-3" />
                  <span>Trích dẫn từ @{cmt.quoteAuthor || "Thành viên"}:</span>
                </div>
                <p className="text-text-muted italic line-clamp-2 leading-normal">
                  "{cmt.quoteContent}"
                </p>
              </div>
            )}

            {/* Comment Body */}
            <div className="text-xs md:text-sm leading-relaxed text-text-primary whitespace-pre-line pl-1">
              {cmt.content}
            </div>

            {/* Comment Footer: Reactions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!user) {
                      onRequestLogin();
                      return;
                    }
                    cmt.reactions.ung += 1;
                    setComments([...comments]);
                  }}
                  className="flex items-center gap-1 text-[11px] hover:text-accent p-1 rounded"
                >
                  <span>👍 Ưng</span>
                  <span>{cmt.reactions.ung}</span>
                </button>
              </div>

              <button
                onClick={() => handleQuote(cmt.author, cmt.content)}
                className="text-[11px] text-accent hover:underline flex items-center gap-1"
              >
                <CornerDownRight className="w-3 h-3" />
                <span>Trả lời @{cmt.author}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Input Box (Yêu cầu Đăng Nhập) */}
      <div
        id="reply-input-box"
        className="bg-bg-panel border border-border/90 rounded-3xl p-6 space-y-4 shadow-md"
      >
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Send className="w-4 h-4 text-accent" />
          <span>Gửi Phản Hồi / Bình Luận</span>
        </h3>

        {!user ? (
          <div className="p-6 rounded-2xl bg-bg-elevated/50 border border-border/80 text-center space-y-3">
            <Lock className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-text-primary">Đăng nhập để tham gia thảo luận</h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Chỉ thành viên đã đăng nhập mới có thể gửi phản hồi và trao đổi kỹ thuật cùng mọi người.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button asChild variant="primary" size="sm">
                <Link href={`/login?redirect=/discuss?t=${thread.id}`}>Đăng Nhập Ngay</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickLogin("user")}>
                ⚡ Đăng nhập Nhanh
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendComment} className="space-y-3">
            {/* Quote indicator */}
            {quoteTarget && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Quote className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="truncate">
                    Đang trích dẫn <strong>@{quoteTarget.author}</strong>: "{quoteTarget.content}"
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelQuote}
                  className="text-xs text-rose-500 hover:underline flex-shrink-0 ml-2 font-semibold"
                >
                  Hủy trích dẫn
                </button>
              </div>
            )}

            <div className="flex items-start gap-3">
              <UserAvatar
                avatar={user.avatar || user.googleAvatar}
                name={user.name}
                role={user.role}
                className="w-8 h-8 rounded-full border border-accent/40 flex-shrink-0 mt-1"
                size={32}
              />
              <div className="flex-1 min-w-0 space-y-2">
                <textarea
                  rows={4}
                  placeholder={`Viết câu trả lời của bạn với tư cách là ${user.name}... (Hỗ trợ code block và văn bản kỹ thuật)`}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-bg-elevated border border-border text-xs leading-relaxed text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted resize-y"
                  required
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <span className="text-[10px] sm:text-[11px] text-text-muted leading-relaxed">
                    Vui lòng thảo luận văn minh, tôn trọng người khác và cùng nhau chia sẻ kiến thức.
                  </span>
                  <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="self-end sm:self-auto flex-shrink-0">
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Gửi Phản Hồi
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
