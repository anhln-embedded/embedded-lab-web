"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  DiscussionThread,
  getDiscussionThreads,
  incrementThreadViews,
  deleteDiscussionThread,
  resetDiscussionData,
} from "@/lib/discussion-store";
import { useAuth } from "@/context/AuthContext";
import { DiscussionThreadCard } from "@/components/discuss/DiscussionThreadCard";
import { DiscussionCreateModal } from "@/components/discuss/DiscussionCreateModal";
import { DiscussionDetailView } from "@/components/discuss/DiscussionDetailView";
import { Button } from "@/components/ui/Button";
import {
  MessageSquare,
  PlusCircle,
  Search,
  Flame,
  Clock,
  Trophy,
  Pin,
  Sparkles,
  Users,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SortTab = "hot" | "new" | "top" | "pinned";

function DiscussContent() {
  const searchParams = useSearchParams();
  const initialThreadId = searchParams?.get("t") || null;

  const { user, quickLogin } = useAuth();

  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [sortTab, setSortTab] = useState<SortTab>("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Tải danh sách threads từ storage
  useEffect(() => {
    const loaded = getDiscussionThreads();
    setThreads(loaded);

    // Nếu có query param ?t=id
    if (initialThreadId) {
      const found = loaded.find((t) => t.id === initialThreadId);
      if (found) {
        setSelectedThread(found);
        incrementThreadViews(found.id);
      }
    }
  }, [initialThreadId]);

  // Bộ lọc và sắp xếp threads
  const filteredThreads = useMemo(() => {
    let list = [...threads];

    // Lọc theo Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q) ||
          t.author.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sắp xếp theo Tab Reddit
    if (sortTab === "hot") {
      // Sôi nổi: nhiều replies + votes
      list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const scoreA = a.votes * 2 + a.repliesCount * 3;
        const scoreB = b.votes * 2 + b.repliesCount * 3;
        return scoreB - scoreA;
      });
    } else if (sortTab === "new") {
      // Mới nhất
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortTab === "top") {
      // Nhiều vote nhất
      list.sort((a, b) => b.votes - a.votes);
    } else if (sortTab === "pinned") {
      list = list.filter((t) => t.isPinned);
    }

    return list;
  }, [threads, sortTab, searchQuery]);

  const handleSelectThread = (thread: DiscussionThread) => {
    setSelectedThread(thread);
    incrementThreadViews(thread.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleThreadUpdated = (updated: DiscussionThread) => {
    setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (selectedThread && selectedThread.id === updated.id) {
      setSelectedThread(updated);
    }
  };

  const handleThreadCreated = (newThread: DiscussionThread) => {
    setThreads((prev) => [newThread, ...prev]);
    setSelectedThread(newThread);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteThread = (threadId: string) => {
    deleteDiscussionThread(threadId);
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (selectedThread && selectedThread.id === threadId) {
      setSelectedThread(null);
    }
  };

  const totalVotes = useMemo(() => {
    return threads.reduce((acc, t) => acc + t.votes, 0);
  }, [threads]);

  const totalReplies = useMemo(() => {
    return threads.reduce((acc, t) => acc + t.repliesCount, 0);
  }, [threads]);

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* 1. Header Banner Diễn Đàn Kỹ Thuật (VOZ + Reddit Style) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-bg-panel via-bg-panel to-accent/10 border border-border/80 p-6 md:p-10 shadow-lg">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diễn Đàn Công Nghệ Mở • Chuyện Nghề & Kỹ Thuật</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
              Thảo Luận Kỹ Thuật &{" "}
              <span className="bg-gradient-to-r from-accent to-amber-500 bg-clip-text text-transparent">
                Góc Khuất Nghề Nghiệp
              </span>
            </h1>


            {/* Quick Stats Counter */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-2 text-xs font-medium text-text-muted">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-accent" />
                <span>
                  <strong className="text-text-primary font-bold">{threads.length}</strong> Chủ đề
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>
                  <strong className="text-text-primary font-bold">{totalReplies}</strong> Bình luận
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>
                  <strong className="text-text-primary font-bold">{totalVotes}</strong> Điểm Upvote
                </span>
              </div>
            </div>
          </div>

          {/* Action: Create Thread Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (!user) {
                  setShowLoginPrompt(true);
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="shadow-xl shadow-accent/25"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Tạo Chủ Đề Mới
            </Button>

            {!user && (
              <span className="text-[11px] text-text-muted text-center">
                Cần đăng nhập để gửi bài
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Login Prompt Banner if triggered without user */}
      {showLoginPrompt && !user && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in text-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <strong className="text-text-primary block font-bold">
                Yêu cầu đăng nhập để tạo chủ đề và tương tác
              </strong>
              <span className="text-text-muted">
                Bạn có thể đăng nhập bằng tài khoản hoặc dùng nút Demo Đăng Nhập Nhanh.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="primary" size="sm">
              <Link href="/login?redirect=/discuss">Đăng Nhập</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                quickLogin("user");
                setShowLoginPrompt(false);
                setIsCreateModalOpen(true);
              }}
            >
              ⚡ Quick Login Demo
            </Button>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="p-1 text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE: Thread Detail OR Forum Thread List */}
      {selectedThread ? (
        <DiscussionDetailView
          thread={selectedThread}
          onBack={() => setSelectedThread(null)}
          onThreadUpdated={handleThreadUpdated}
          onRequestLogin={() => setShowLoginPrompt(true)}
          onDeleteThread={handleDeleteThread}
        />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar: Sort Tabs (Reddit) + Live Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-bg-panel border border-border/80 rounded-2xl p-3 shadow-sm">
            {/* Sort Tabs */}
            <div className="flex items-center gap-1.5 bg-bg-elevated/60 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => setSortTab("hot")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  sortTab === "hot"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Đang sốt (Hot)</span>
              </button>

              <button
                onClick={() => setSortTab("new")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  sortTab === "new"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mới nhất (New)</span>
              </button>

              <button
                onClick={() => setSortTab("top")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  sortTab === "top"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Nhiều Vote (Top)</span>
              </button>

              <button
                onClick={() => setSortTab("pinned")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  sortTab === "pinned"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <Pin className="w-3.5 h-3.5" />
                <span>Đã ghim</span>
              </button>
            </div>

            {/* Live Search Box */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm chủ đề, từ khóa, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Threads List Stream */}
          {filteredThreads.length === 0 ? (
            <div className="p-12 text-center bg-bg-panel border border-border/80 rounded-3xl space-y-4">
              <MessageSquare className="w-10 h-10 text-text-muted mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text-primary">Không tìm thấy chủ đề nào</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  {threads.length === 0
                    ? "Danh sách thảo luận hiện đang trống."
                    : "Chưa có bài viết nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSortTab("hot");
                  }}
                >
                  Đặt lại bộ lọc
                </Button>

                {threads.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const restored = resetDiscussionData();
                      setThreads(restored);
                      setSearchQuery("");
                      setSortTab("hot");
                    }}
                    className="border-accent/40 text-accent hover:bg-accent/10"
                  >
                    ⚡ Khôi phục bài viết mẫu
                  </Button>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!user) {
                      setShowLoginPrompt(true);
                    } else {
                      setIsCreateModalOpen(true);
                    }
                  }}
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Đăng Chủ Đề Đầu Tiên
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredThreads.map((thread) => (
                <DiscussionThreadCard
                  key={thread.id}
                  thread={thread}
                  onSelectThread={handleSelectThread}
                  onThreadUpdated={handleThreadUpdated}
                  onRequestLogin={() => setShowLoginPrompt(true)}
                  onDeleteThread={handleDeleteThread}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Tạo Chủ Đề Mới */}
      <DiscussionCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onThreadCreated={handleThreadCreated}
      />
    </div>
  );
}

export default function DiscussPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Đang tải diễn đàn thảo luận...</p>
        </div>
      }
    >
      <DiscussContent />
    </Suspense>
  );
}
