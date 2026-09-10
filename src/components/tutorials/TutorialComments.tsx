"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  MessageSquare,
  Send,
  Trash2,
  LogIn,
  Shield,
  FlaskConical,
  Clock,
  Sparkles,
  AlertCircle,
  Reply,
  CheckCircle2,
} from "lucide-react";

interface CommentItem {
  id: string;
  articleId: string;
  userId: string | null;
  userName: string;
  userAvatar: string | null;
  userRole: string | null;
  userEmail: string | null;
  content: string;
  createdAt: string;
}

interface TutorialCommentsProps {
  topicSlug: string;
  postSlug: string;
}

export function TutorialComments({ topicSlug, postSlug }: TutorialCommentsProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Lấy danh sách bình luận
  const loadComments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/tutorials/${topicSlug}/articles/${postSlug}/comments`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setComments(data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải bình luận:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [topicSlug, postSlug]);

  // Gửi bình luận
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/tutorials/${topicSlug}/articles/${postSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gửi bình luận thất bại.");
      }

      setContent("");
      setSuccessMsg("Bình luận của bạn đã được đăng thành công!");
      setTimeout(() => setSuccessMsg(null), 3500);

      // Thêm ngay comment mới vào đầu danh sách
      if (json.data) {
        setComments((prev) => [json.data, ...prev]);
      } else {
        loadComments();
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi đăng bình luận.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa bình luận
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/tutorials/${topicSlug}/articles/${postSlug}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Xóa bình luận thất bại.");
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      alert(err.message || "Không thể xóa bình luận.");
    } finally {
      setDeletingId(null);
    }
  };

  // Format thời gian hiển thị thân thiện
  const formatCommentTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return "Vừa xong";
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-border/80 space-y-6">
      {/* Header khu vực bình luận */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-text-primary flex items-center gap-2">
              <span>Hỏi đáp & Thảo luận</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold font-mono">
                {comments.length}
              </span>
            </h3>
            <p className="text-xs text-text-muted">
              Trao đổi kiến thức kỹ thuật, thắc mắc và đóng góp ý kiến về bài học này
            </p>
          </div>
        </div>
      </div>

      {/* Thông báo Thành công / Thất bại */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-accent/15 border border-accent/40 text-accent text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. KHU VỰC NHẬP BÌNH LUẬN: ĐÒI HỎI ĐĂNG NHẬP */}
      {user ? (
        // ĐÃ ĐĂNG NHẬP: Hiển thị form comment
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 rounded-3xl bg-bg-panel border border-border/90 shadow-lg space-y-3.5"
        >
          {/* Thông tin user đang đăng nhập */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-bold text-accent">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.name || "U").charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-text-primary">
                  {user.name || user.email}
                </span>
                {user.role === "admin" ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20">
                    Học viên
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ô nhập nội dung */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn có câu hỏi, đóng góp hay thắc mắc nào về bài này? Hãy chia sẻ cùng Lab..."
              rows={3}
              maxLength={3000}
              className="w-full px-4 py-3 rounded-2xl bg-bg-elevated border border-border/80 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-y min-h-[90px]"
            />
          </div>

          {/* Hàng nút gửi và số ký tự */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-text-muted">
              {content.length} / 3000 ký tự
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-accent hover:bg-accent-hover text-white transition-all shadow-md shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-102"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi bình luận</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        // CHƯA ĐĂNG NHẬP: Card thông báo yêu cầu đăng nhập
        <div className="p-6 sm:p-8 rounded-3xl bg-bg-panel border border-dashed border-accent/40 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent border border-accent/30 mx-auto flex items-center justify-center shadow-inner">
            <LogIn className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-base sm:text-lg font-black text-text-primary">
              Đăng nhập để tham gia thảo luận
            </h4>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Hãy đăng nhập tài khoản để đặt câu hỏi, thảo luận mã nguồn và nhận giải đáp từ các Kỹ sư và Mentor của Lab.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-black shadow-lg shadow-accent/25 transition-all hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập ngay</span>
            </Link>
          </div>
        </div>
      )}

      {/* 2. DANH SÁCH CÁC BÌNH LUẬN ĐÃ CÓ */}
      <div className="space-y-4 pt-2">
        {isLoading ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-text-muted">Đang tải bình luận...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-bg-panel/50 border border-border/60">
            <MessageSquare className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-xs sm:text-sm text-text-muted font-medium">
              Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ về bài viết này!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner =
              user &&
              ((user.id && comment.userId === String(user.id)) ||
                (user.email && comment.userEmail === user.email));
            const canDelete = user && (user.role === "admin" || isOwner);

            return (
              <div
                key={comment.id}
                className="p-4 sm:p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm space-y-2.5 hover:border-accent/40 transition-colors group"
              >
                {/* Header bình luận: Avatar, Tên, Role, Thời gian, Nút xóa */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-black text-accent flex-shrink-0">
                      {comment.userAvatar ? (
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        comment.userName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-text-primary">
                        {comment.userName}
                      </span>

                      {comment.userRole === "superadmin" ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" />
                          Super Admin
                        </span>
                      ) : comment.userRole === "admin" ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      ) : comment.userRole === "lab_member" ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                          <FlaskConical className="w-2.5 h-2.5" />
                          Lab Member
                        </span>
                      ) : comment.userRole === "mentor" ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30">
                          Mentor
                        </span>
                      ) : null}

                      <span className="text-[11px] text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-muted/70" />
                        {formatCommentTime(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex items-center gap-1">
                    {user && (
                      <button
                        type="button"
                        onClick={() => {
                          setContent((prev) => `@${comment.userName} ` + prev);
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-bg-elevated transition-colors text-xs font-semibold cursor-pointer"
                        title="Trả lời người này"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        disabled={deletingId === comment.id}
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Xóa bình luận này"
                      >
                        {deletingId === comment.id ? (
                          <div className="w-3.5 h-3.5 border border-rose-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Nội dung bình luận */}
                <div className="text-xs sm:text-sm text-text-secondary whitespace-pre-wrap leading-relaxed pl-11">
                  {comment.content}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
