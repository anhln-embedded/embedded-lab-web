"use client";

import * as React from "react";
import Link from "next/link";
import { BlogPostData } from "@/lib/content";
import {
  getAllPosts,
  saveStoredPosts,
  DEFAULT_LAB_FANPAGE_POSTS
} from "@/lib/posts-store";
import { useAuth } from "@/context/AuthContext";
import { FanpagePostCard } from "./FanpagePostCard";
import { BentoPostGrid } from "./BentoPostGrid";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  PlusCircle,
  Megaphone,
  FlaskConical,
  Zap,
  Trophy,
  RotateCcw,
  LayoutGrid,
  ListFilter,
  Columns2,
  Calendar,
  Eye,
  Heart,
  MessageSquare
} from "lucide-react";
import { FacebookIcon } from "@/components/ui/FacebookIcon";

interface BlogPostListProps {
  posts?: BlogPostData[];
  variant?: "default" | "featured" | "compact" | "bento";
  searchQuery?: string;
}

export function BlogPostList({ posts: initialPosts, variant = "default", searchQuery = "" }: BlogPostListProps) {
  const { user } = useAuth();
  const [displayPosts, setDisplayPosts] = React.useState<BlogPostData[]>(initialPosts || []);
  const [selectedFilter, setSelectedFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"bento" | "feed">("bento");

  const loadFromApi = React.useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const apiPosts: BlogPostData[] = json.data.map((p: any) => ({
          _id: p.id,
          title: p.title,
          slug: p.slug,
          date: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "2026-08-25",
          tags: typeof p.tags === "string" ? p.tags.split(",").map((t: string) => t.trim()) : p.tags,
          postType: p.postType,
          pinned: p.pinned,
          likesCount: p.likesCount,
          featured: p.featured,
          draft: p.draft,
          readingTime: p.readingTime,
          author: p.authorName,
          authorTitle: p.authorTitle,
          authorAvatar: p.authorAvatar,
          coverImage: p.coverImage,
          excerpt: p.excerpt,
          facebookPostUrl: p.facebookPostUrl,
          githubUrl: p.githubUrl,
          series: p.series,
          seriesOrder: p.seriesOrder,
          url: `/blog/${p.slug}`,
          contentHtml: p.contentHtml,
          body: {
            raw: p.contentHtml || "",
          },
        }));
        setDisplayPosts(apiPosts);
        return;
      }
    } catch (err) {
      console.warn("Could not fetch from SQLite API:", err);
    }
    setDisplayPosts([]);
  }, []);

  React.useEffect(() => {
    loadFromApi();

    const handleUpdate = () => {
      loadFromApi();
    };

    window.addEventListener("embedded_posts_updated", handleUpdate);
    return () => window.removeEventListener("embedded_posts_updated", handleUpdate);
  }, [loadFromApi]);

  const handleSeedFanpagePosts = async () => {
    if (confirm("Nạp nhanh 4 bài viết mẫu chuẩn Fanpage vào Database SQLite?")) {
      try {
        for (const p of DEFAULT_LAB_FANPAGE_POSTS) {
          await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt,
              contentHtml: p.body.raw,
              postType: p.postType,
              tags: p.tags.join(","),
              authorName: p.author,
              authorTitle: p.authorTitle,
              featured: p.featured,
              pinned: p.pinned,
              coverImage: p.coverImage,
            }),
          });
        }
        await loadFromApi();
        alert("🎉 Đã nạp thành công các bài viết vào Database SQLite!");
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Sort: Pinned posts first, then by date descending
  const sortedPosts = React.useMemo(() => {
    return [...displayPosts].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [displayPosts]);

  // Filter by search query if provided
  const searchedPosts = React.useMemo(() => {
    if (!searchQuery?.trim()) return sortedPosts;
    const q = searchQuery.toLowerCase().trim();
    return sortedPosts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [sortedPosts, searchQuery]);

  const filteredPosts = selectedFilter === "all"
    ? searchedPosts
    : searchedPosts.filter((p) => p.postType === selectedFilter || p.tags?.includes(selectedFilter));

  const availableFilters = React.useMemo(() => {
    const filters = [
      {
        id: "recruitment",
        label: "Tuyển thành viên",
        icon: Megaphone,
        color: "bg-rose-500 text-white shadow-md shadow-rose-500/20",
        iconColor: "text-rose-400",
        count: displayPosts.filter((p) => p.postType === "recruitment" || p.tags?.includes("tuyen-thanh-vien")).length,
      },
      {
        id: "daily",
        label: "Nhật ký Lab",
        icon: FlaskConical,
        color: "bg-cyan-600 text-white shadow-md shadow-cyan-600/20",
        iconColor: "text-cyan-400",
        count: displayPosts.filter((p) => p.postType === "daily" || p.tags?.includes("nhat-ky-lab")).length,
      },
      {
        id: "technical",
        label: "Chia sẻ Kỹ thuật",
        icon: Zap,
        color: "bg-amber-600 text-white shadow-md shadow-amber-600/20",
        iconColor: "text-amber-400",
        count: displayPosts.filter((p) => p.postType === "technical" || p.tags?.includes("chia-se-ky-thuat")).length,
      },
      {
        id: "event",
        label: "Sự kiện & NCKH",
        icon: Trophy,
        color: "bg-purple-600 text-white shadow-md shadow-purple-600/20",
        iconColor: "text-purple-400",
        count: displayPosts.filter((p) => p.postType === "event" || p.tags?.includes("su-kien")).length,
      },
    ];
    return filters.filter((f) => f.count > 0);
  }, [displayPosts]);

  return (
    <div className="space-y-7">
      {/* Top Filter & View Mode Bar */}
      {displayPosts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-bg-panel/80 border border-border/80 rounded-2xl backdrop-blur-md overflow-x-auto">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedFilter === "all"
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tất cả ({displayPosts.length})</span>
            </button>

            {availableFilters.map((f) => {
              const isSelected = selectedFilter === f.id;
              const Icon = f.icon;

              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? f.color
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${f.iconColor}`} />
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-bg-elevated text-text-muted"}`}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Toggle (Bento Grid vs Feed) */}
          <div className="flex items-center self-end sm:self-auto p-1 bg-bg-panel/80 border border-border/80 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setViewMode("bento")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "bento"
                  ? "bg-accent/20 text-accent border border-accent/30 shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
              }`}
              title="Giao diện Bento Grid (Linear Tech)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bento Grid</span>
            </button>

            <button
              onClick={() => setViewMode("feed")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "feed"
                  ? "bg-accent/20 text-accent border border-accent/30 shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
              }`}
              title="Giao diện Fanpage Feed"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Fanpage Feed</span>
            </button>
          </div>
        </div>
      )}

      {/* Feed Stream, Bento Grid or Empty State */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 px-6 border border-dashed border-border/80 rounded-3xl bg-bg-panel/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mx-auto text-3xl shadow-inner">
            📢
          </div>
          <h3 className="text-lg font-bold text-text-primary">
            {selectedFilter === "all"
              ? "Bảng tin đang được cập nhật"
              : `Chưa có bài đăng nào trong mục này`}
          </h3>
          <p className="text-xs md:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Các thông báo và ghi chép thực nghiệm mới nhất từ phòng Lab sẽ được đăng tải tại đây. Bạn cũng có thể theo dõi Fanpage Facebook của Lab.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a
              href="https://www.facebook.com/EmbeddedAIoTLAB"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-all shadow-sm"
            >
              <FacebookIcon className="w-4 h-4" />
              <span>Xem Fanpage Facebook Lab</span>
            </a>

            {user && (user.role === "admin" || user.role === "superadmin") && (
              <Button variant="primary" size="sm" asChild className="bg-accent text-white text-xs">
                <Link href="/admin/posts/new">
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  Đăng bài viết mới
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "bento" ? (
        <BentoPostGrid posts={filteredPosts} onPostUpdated={loadFromApi} />
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <FanpagePostCard
              key={post._id}
              post={post}
              onPostUpdated={loadFromApi}
            />
          ))}
        </div>
      )}
    </div>
  );
}