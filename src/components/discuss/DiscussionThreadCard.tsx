"use client";

import React from "react";
import {
  DiscussionThread,
  DISCUSSION_CATEGORIES,
  DISCUSSION_FLAIRS,
  voteDiscussionThread,
  reactDiscussionThread,
  VozReactionType,
} from "@/lib/discussion-store";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Eye,
  ChevronUp,
  ChevronDown,
  Pin,
  Share2,
  Code2,
  Cpu,
  Clock,
  ExternalLink,
  Sparkles,
  Paperclip,
  Trash2,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface DiscussionThreadCardProps {
  thread: DiscussionThread;
  onSelectThread: (thread: DiscussionThread) => void;
  onThreadUpdated: (updated: DiscussionThread) => void;
  onRequestLogin: () => void;
  onDeleteThread?: (threadId: string) => void;
}

export function DiscussionThreadCard({
  thread,
  onSelectThread,
  onThreadUpdated,
  onRequestLogin,
  onDeleteThread,
}: DiscussionThreadCardProps) {
  const { user } = useAuth();

  const category = DISCUSSION_CATEGORIES.find((c) => c.id === thread.category);
  const flair = DISCUSSION_FLAIRS[thread.flair] || DISCUSSION_FLAIRS["thao-luan"];

  const handleVote = (e: React.MouseEvent, direction: 1 | -1) => {
    e.stopPropagation();
    if (!user) {
      onRequestLogin();
      return;
    }
    const updated = voteDiscussionThread(thread.id, direction);
    if (updated) {
      onThreadUpdated(updated);
    }
  };

  const handleReact = (e: React.MouseEvent, reaction: VozReactionType) => {
    e.stopPropagation();
    if (!user) {
      onRequestLogin();
      return;
    }
    const updated = reactDiscussionThread(thread.id, reaction);
    if (updated) {
      onThreadUpdated(updated);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `/discuss?t=${thread.id}`);
      alert("Đã sao chép liên kết chủ đề thảo luận vào clipboard!");
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div
      onClick={() => onSelectThread(thread)}
      className={cn(
        "group relative flex flex-col md:flex-row items-stretch bg-bg-panel border rounded-2xl p-4 md:p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
        thread.isPinned
          ? "border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10 hover:border-amber-500/60"
          : "border-border/80 hover:border-accent/40 hover:bg-bg-elevated/40"
      )}
    >
      {/* 1. Left Upvote Bar (Reddit Style) */}
      <div
        className="flex md:flex-col items-center justify-between md:justify-center gap-1.5 md:mr-4 md:pr-4 md:border-r border-border/60 pb-3 md:pb-0 mb-3 md:mb-0 border-b md:border-b-0 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => handleVote(e, 1)}
          className={cn(
            "p-1.5 rounded-lg transition-all flex items-center gap-1 md:flex-col",
            thread.userVote === 1
              ? "bg-accent text-white font-bold shadow-sm shadow-accent/40"
              : "text-text-muted hover:text-accent hover:bg-accent/10"
          )}
          title="Ưng / Upvote chủ đề này (+1 Karma)"
        >
          <ChevronUp className="w-5 h-5" />
          <span className="md:hidden text-xs font-bold">Ủng hộ</span>
        </button>

        <span
          className={cn(
            "text-sm font-extrabold px-1 tracking-tight min-w-[2.2rem] text-center",
            thread.votes > 50
              ? "text-rose-500"
              : thread.votes > 20
              ? "text-amber-500"
              : thread.votes > 0
              ? "text-accent"
              : "text-text-muted"
          )}
        >
          {thread.votes}
        </span>

        <button
          onClick={(e) => handleVote(e, -1)}
          className={cn(
            "p-1.5 rounded-lg transition-all flex items-center gap-1 md:flex-col",
            thread.userVote === -1
              ? "bg-rose-500 text-white font-bold shadow-sm shadow-rose-500/40"
              : "text-text-muted hover:text-rose-500 hover:bg-rose-500/10"
          )}
          title="Không ưng / Downvote"
        >
          <ChevronDown className="w-5 h-5" />
          <span className="md:hidden text-xs font-bold">Gạch</span>
        </button>
      </div>

      {/* 2. Main Content Center */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Meta Bar: Prefix, Category & Author */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {thread.isPinned && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30 text-[11px]">
              <Pin className="w-3 h-3 rotate-45" />
              Ghim
            </span>
          )}

          {/* VOZ Prefix Badge */}
          <span
            className={cn(
              "px-2 py-0.5 rounded-md font-bold text-[11px] border uppercase tracking-wider",
              flair.badgeClass
            )}
          >
            {flair.prefix}
          </span>

          {/* Author Info */}
          <div className="flex items-center gap-1.5 text-text-muted w-full sm:w-auto sm:ml-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5">
              <UserAvatar
                avatar={thread.authorAvatar}
                name={thread.author}
                role={thread.authorRole}
                className="w-5 h-5 rounded-full border border-border/60 flex-shrink-0"
                textClassName="text-[10px]"
                size={20}
              />
              <span className="font-semibold text-text-primary text-[11px] hover:underline truncate max-w-[120px] sm:max-w-none">
                {thread.author}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline text-text-muted/60">•</span>
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(thread.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Thread Title */}
        <h3 className="text-base md:text-lg font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
          {thread.title}
        </h3>

        {/* Thread Excerpt */}
        <p className="text-xs md:text-sm text-text-secondary line-clamp-2 leading-relaxed">
          {thread.content}
        </p>

        {/* Attached Files Badge & Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {thread.attachedFiles && thread.attachedFiles.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-bold border border-accent/30 shadow-xs">
              <Paperclip className="w-3 h-3" />
              {thread.attachedFiles.length} file đính kèm
            </span>
          )}

          {thread.codeSnippet && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[11px] font-mono border border-blue-500/20">
              <Code2 className="w-3 h-3" />
              Có mã C/C++
            </span>
          )}

          {thread.tags?.map((t) => (
            <span
              key={t}
              className="text-[10px] text-text-muted bg-bg-elevated/60 px-1.5 py-0.5 rounded font-mono"
            >
              #{t}
            </span>
          ))}
        </div>

        {/* 3. Bottom Stats & Reactions Bar (VOZ Style) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/50 text-xs text-text-muted">
          {/* Reaction Icons VOZ */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => handleReact(e, "ung")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg border transition-all text-xs",
                thread.userReactions?.includes("ung")
                  ? "bg-accent/20 border-accent text-accent font-bold"
                  : "bg-bg-elevated/50 border-border/60 hover:border-accent/40 text-text-secondary"
              )}
              title="Ưng bụng 👍"
            >
              <span>👍</span>
              <span>{thread.reactions.ung}</span>
            </button>

            <button
              onClick={(e) => handleReact(e, "gach")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg border transition-all text-xs",
                thread.userReactions?.includes("gach")
                  ? "bg-rose-500/20 border-rose-500 text-rose-400 font-bold"
                  : "bg-bg-elevated/50 border-border/60 hover:border-rose-500/40 text-text-secondary"
              )}
              title="Gạch 🧱"
            >
              <span>🧱</span>
              <span>{thread.reactions.gach}</span>
            </button>

            {thread.reactions.ung_bung > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[11px]">
                ❤️ {thread.reactions.ung_bung}
              </span>
            )}
            {thread.reactions.nguong_mo > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[11px]">
                👏 {thread.reactions.nguong_mo}
              </span>
            )}
          </div>

          {/* Comment & View Counts */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1 text-text-secondary hover:text-accent font-medium text-[11px] sm:text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{thread.repliesCount}<span className="hidden sm:inline"> trả lời</span></span>
            </span>

            <span className="flex items-center gap-1 text-text-muted text-[11px] sm:text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>{thread.viewsCount}<span className="hidden sm:inline"> xem</span></span>
            </span>

            <button
              onClick={handleShare}
              className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-accent transition-colors"
              title="Chia sẻ chủ đề"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Nút Xóa bài dành cho Admin / Tác giả */}
            {user && (user.role === "admin" || user.role === "superadmin" || user.id === thread.authorId) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Bạn có chắc chắn muốn xóa chủ đề "${thread.title}" không? Hành động này sẽ xóa vĩnh viễn cả các phản hồi liên quan.`)) {
                    onDeleteThread?.(thread.id);
                  }
                }}
                className="p-1 px-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1 text-[11px] font-semibold"
                title={user.role === "admin" || user.role === "superadmin" ? "Xóa bài (Quyền Quản trị viên)" : "Xóa bài của bạn"}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
