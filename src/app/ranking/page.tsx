"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  BookOpen,
  Users,
  ShieldCheck,
  Edit3,
  GraduationCap,
  ChevronRight,
  Zap,
  CheckCircle2,
  Lock,
  Star,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LAB_BADGES, Badge, getLevelInfo, getExpProgress, getCreatorRankInfo } from "@/lib/gamification";

interface ContributorItem {
  rank: number;
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  contributionPoints: number;
  publishedPosts: number;
  publishedTutorials: number;
  totalArticles: number;
  rankTitle: string;
  rankBadge: string;
  badges: string[];
}

interface ReaderItem {
  rank: number;
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  exp: number;
  level: number;
  levelTitle: string;
  levelBadge: string;
  levelColor: string;
  readArticlesCount: number;
  streakDays: number;
  badges: string[];
}

interface RankingData {
  topContributors: ContributorItem[];
  topReaders: ReaderItem[];
  badgesCatalog: Badge[];
  stats: {
    totalUsers: number;
    totalArticles: number;
    totalReadsLogged: number;
  };
}

export default function RankingPage() {
  const { user } = useAuth();
  // Cao Thủ Học Tập is default tab
  const [activeTab, setActiveTab] = useState<"readers" | "contributors" | "badges">("readers");
  const [badgeCategory, setBadgeCategory] = useState<"all" | "reader" | "creator" | "streak">("all");
  const [data, setData] = useState<RankingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRanking() {
      try {
        const res = await fetch("/api/ranking");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (e) {
        console.error("Failed to load ranking:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadRanking();
  }, []);

  const contributors = data?.topContributors || [];
  const readers = data?.topReaders || [];
  const badges = data?.badgesCatalog || LAB_BADGES;

  // Filtered Badges
  const filteredBadges = badges.filter(
    (b) => badgeCategory === "all" || b.category === badgeCategory
  );

  const currentUserBadges: string[] = user?.badges || [];

  // Top 3 Readers
  const topReader1 = readers[0];
  const topReader2 = readers[1];
  const topReader3 = readers[2];

  // Top 3 Contributors
  const topContributor1 = contributors[0];
  const topContributor2 = contributors[1];
  const topContributor3 = contributors[2];

  return (
    <div className="min-h-screen bg-bg-base py-8 sm:py-12">
      <div className="container max-w-6xl space-y-8">
        
        {/* =========================================================================
            1. HERO BANNER & STATS
        ========================================================================= */}
        <div className="relative rounded-3xl border border-border/80 bg-gradient-to-b from-bg-panel via-bg-elevated/80 to-bg-panel p-6 sm:p-10 shadow-2xl overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 border border-accent/30 text-accent">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Hệ Thống Phần Thưởng & Bảng Xếp Hạng Lab</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-text-primary tracking-tight leading-tight">
                Vinh Danh Học Giả & Cống Hiến AIoT
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Tôn vinh tinh thần học tập chuyên cần của thành viên phòng Lab và ghi nhận xứng đáng những đóng góp tri thức của các tác giả Embedded-AIoT PTIT.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full md:w-auto">
              <div className="p-3 sm:p-4 rounded-2xl bg-bg-elevated/60 border border-border/80 text-center space-y-1 shadow-sm">
                <div className="text-xl sm:text-2xl font-black text-accent font-mono">
                  {data?.stats.totalUsers || 0}+
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-text-muted">
                  Thành viên
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-bg-elevated/60 border border-border/80 text-center space-y-1 shadow-sm">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {data?.stats.totalReadsLogged || 0}+
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-text-muted">
                  Lượt đọc xong
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-bg-elevated/60 border border-border/80 text-center space-y-1 shadow-sm">
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {data?.stats.totalArticles || 0}
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-text-muted">
                  Bài chuyên đề
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. USER GAMIFICATION STATUS CARD (IF LOGGED IN)
        ========================================================================= */}
        {user && (
          <div className="rounded-3xl border border-accent/30 bg-gradient-to-r from-accent/10 via-bg-panel to-bg-panel p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <UserAvatar
                avatar={user.avatar}
                name={user.name}
                role={user.role}
                className="w-14 h-14 rounded-2xl border-2 border-accent shadow-md shrink-0"
                size={56}
              />
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-base font-black text-text-primary">{user.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white shadow-xs">
                    Lv. {user.level || 1}
                  </span>
                </div>
                <div className="text-xs text-text-muted flex flex-wrap items-center gap-3 mt-0.5 justify-center sm:justify-start">
                  <span className="text-emerald-400 font-bold font-mono">
                    ⚡ {user.exp || 0} EXP
                  </span>
                  <span>·</span>
                  <span className="text-orange-400 font-semibold flex items-center gap-0.5">
                    <Flame className="w-3.5 h-3.5" />
                    Chuỗi {user.streakDays ?? 0} ngày
                  </span>
                  <span>·</span>
                  <span className="text-accent font-bold">
                    ⭐ {user.contributionPoints || 0} CP
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shrink-0"
            >
              <span>Xem Hồ Sơ & Huy Hiệu</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* =========================================================================
            3. TAB NAVIGATION (CAO THỦ HỌC TẬP LÊN ĐẦU TIÊN)
        ========================================================================= */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-bg-panel border border-border shadow-md gap-1.5">
            {/* 1. CAO THỦ HỌC TẬP */}
            <button
              type="button"
              onClick={() => setActiveTab("readers")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "readers"
                  ? "bg-accent text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Cao Thủ Học Tập</span>
            </button>

            {/* 2. BẢNG VÀNG ĐÓNG GÓP */}
            <button
              type="button"
              onClick={() => setActiveTab("contributors")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "contributors"
                  ? "bg-accent text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Bảng Vàng Đóng Góp</span>
            </button>

            {/* 3. BẢO TÀNG HUY HIỆU */}
            <button
              type="button"
              onClick={() => setActiveTab("badges")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "badges"
                  ? "bg-accent text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Bảo Tàng Huy Hiệu</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: CAO THỦ HỌC TẬP (TOP READERS & LEARNERS)
        ========================================================================= */}
        {activeTab === "readers" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* TOP 3 PODIUM FOR READERS */}
            {topReader1 && (
              <div className="pt-8 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
                  
                  {/* TOP 2 (SILVER - LEFT) */}
                  {topReader2 && (
                    <div className="order-2 md:order-1 rounded-3xl border border-slate-400/40 bg-gradient-to-b from-slate-500/10 via-bg-panel to-bg-panel p-6 text-center space-y-3 shadow-xl relative md:h-[300px] flex flex-col justify-center items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black text-sm flex items-center justify-center shadow-md absolute -top-4 left-1/2 -translate-x-1/2">
                        2
                      </div>
                      <UserAvatar
                        avatar={topReader2.avatar}
                        name={topReader2.name}
                        role={topReader2.role as any}
                        className="w-16 h-16 rounded-2xl border-2 border-slate-300 shadow-md mx-auto"
                        size={64}
                      />
                      <div>
                        <div className="text-base font-black text-text-primary truncate max-w-[200px] mx-auto">
                          {topReader2.name}
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1">
                          <span>🥈</span>
                          <span>Lv. {topReader2.level} · {topReader2.levelTitle}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border/60 w-full flex items-center justify-around text-xs">
                        <div>
                          <div className="font-bold text-emerald-400 font-mono">{topReader2.exp}</div>
                          <div className="text-[10px] text-text-muted">EXP</div>
                        </div>
                        <div>
                          <div className="font-bold text-orange-400 font-mono flex items-center justify-center gap-0.5">
                            <Flame className="w-3 h-3" />
                            {topReader2.streakDays}
                          </div>
                          <div className="text-[10px] text-text-muted">Ngày streak</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOP 1 (GOLD - CENTER - TALLEST) */}
                  <div className="order-1 md:order-2 rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/15 via-bg-panel to-bg-panel p-7 text-center space-y-3.5 shadow-2xl relative md:h-[340px] flex flex-col justify-center items-center scale-105 z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-900 font-black text-base flex items-center justify-center shadow-lg absolute -top-5 left-1/2 -translate-x-1/2">
                      👑
                    </div>
                    <div className="relative">
                      <UserAvatar
                        avatar={topReader1.avatar}
                        name={topReader1.name}
                        role={topReader1.role as any}
                        className="w-20 h-20 rounded-3xl border-2 border-amber-400 shadow-xl mx-auto ring-4 ring-amber-500/20"
                        size={80}
                      />
                      <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow">
                        TOP 1
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-black text-text-primary truncate max-w-[220px] mx-auto">
                        {topReader1.name}
                      </div>
                      <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                        <span>⭐</span>
                        <span>Lv. {topReader1.level} · {topReader1.levelTitle}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/60 w-full flex items-center justify-around text-xs">
                      <div>
                        <div className="text-base font-black text-emerald-400 font-mono">{topReader1.exp}</div>
                        <div className="text-[10px] text-text-muted font-bold">Điểm Kinh Nghiệm</div>
                      </div>
                      <div>
                        <div className="text-base font-black text-orange-400 font-mono flex items-center justify-center gap-0.5">
                          <Flame className="w-4 h-4 text-orange-400" />
                          {topReader1.streakDays}
                        </div>
                        <div className="text-[10px] text-text-muted font-bold">Ngày Streak</div>
                      </div>
                    </div>
                  </div>

                  {/* TOP 3 (BRONZE - RIGHT) */}
                  {topReader3 && (
                    <div className="order-3 md:order-3 rounded-3xl border border-amber-700/40 bg-gradient-to-b from-amber-700/10 via-bg-panel to-bg-panel p-6 text-center space-y-3 shadow-xl relative md:h-[280px] flex flex-col justify-center items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-md absolute -top-4 left-1/2 -translate-x-1/2">
                        3
                      </div>
                      <UserAvatar
                        avatar={topReader3.avatar}
                        name={topReader3.name}
                        role={topReader3.role as any}
                        className="w-16 h-16 rounded-2xl border-2 border-amber-700 shadow-md mx-auto"
                        size={64}
                      />
                      <div>
                        <div className="text-base font-black text-text-primary truncate max-w-[200px] mx-auto">
                          {topReader3.name}
                        </div>
                        <div className="text-[11px] font-bold text-amber-600 flex items-center justify-center gap-1">
                          <span>🥉</span>
                          <span>Lv. {topReader3.level} · {topReader3.levelTitle}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border/60 w-full flex items-center justify-around text-xs">
                        <div>
                          <div className="font-bold text-emerald-400 font-mono">{topReader3.exp}</div>
                          <div className="text-[10px] text-text-muted">EXP</div>
                        </div>
                        <div>
                          <div className="font-bold text-orange-400 font-mono flex items-center justify-center gap-0.5">
                            <Flame className="w-3 h-3" />
                            {topReader3.streakDays}
                          </div>
                          <div className="text-[10px] text-text-muted">Ngày streak</div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* FULL READERS LIST */}
            <div className="rounded-3xl border border-border/80 bg-bg-panel shadow-xl overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Xếp Hạng Độc Giả & Thành Viên Chăm Chỉ Nhất</span>
                </h3>
                <span className="text-xs text-text-muted">
                  {readers.length} người học
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {readers.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-bg-elevated/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-7 text-center font-mono font-black text-sm text-text-muted">
                        #{r.rank}
                      </span>
                      <UserAvatar
                        avatar={r.avatar}
                        name={r.name}
                        role={r.role as any}
                        className="w-11 h-11 rounded-xl shrink-0"
                        size={44}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text-primary truncate">
                            {r.name}
                          </span>
                          <span
                            className="px-2 py-0.2 rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: `${r.levelColor}20`,
                              color: r.levelColor,
                              border: `1px solid ${r.levelColor}40`,
                            }}
                          >
                            Lv. {r.level} · {r.levelTitle}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                          <span>{r.readArticlesCount} bài đã đọc</span>
                          <span>·</span>
                          <span className="text-orange-400 font-semibold flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-orange-400" />
                            Chuỗi {r.streakDays} ngày
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-emerald-400 font-mono">
                        {r.exp} EXP
                      </div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                        Kinh Nghiệm
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: BẢNG VÀNG ĐÓNG GÓP (TOP CONTRIBUTORS)
        ========================================================================= */}
        {activeTab === "contributors" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* TOP 3 PODIUM */}
            {topContributor1 && (
              <div className="pt-8 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
                  
                  {/* TOP 2 (SILVER - LEFT) */}
                  {topContributor2 && (
                    <div className="order-2 md:order-1 rounded-3xl border border-slate-400/40 bg-gradient-to-b from-slate-500/10 via-bg-panel to-bg-panel p-6 text-center space-y-3 shadow-xl relative md:h-[300px] flex flex-col justify-center items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black text-sm flex items-center justify-center shadow-md absolute -top-4 left-1/2 -translate-x-1/2">
                        2
                      </div>
                      <UserAvatar
                        avatar={topContributor2.avatar}
                        name={topContributor2.name}
                        role={topContributor2.role as any}
                        className="w-16 h-16 rounded-2xl border-2 border-slate-300 shadow-md mx-auto"
                        size={64}
                      />
                      <div>
                        <div className="text-base font-black text-text-primary truncate max-w-[200px] mx-auto">
                          {topContributor2.name}
                        </div>
                        <div className="text-[11px] font-bold text-slate-400">
                          🥈 {topContributor2.rankTitle}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border/60 w-full flex items-center justify-around text-xs">
                        <div>
                          <div className="font-bold text-accent font-mono">{topContributor2.contributionPoints}</div>
                          <div className="text-[10px] text-text-muted">Điểm CP</div>
                        </div>
                        <div>
                          <div className="font-bold text-text-primary font-mono">{topContributor2.totalArticles}</div>
                          <div className="text-[10px] text-text-muted">Bài đăng</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOP 1 (GOLD - CENTER - TALLEST) */}
                  <div className="order-1 md:order-2 rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/15 via-bg-panel to-bg-panel p-7 text-center space-y-3.5 shadow-2xl relative md:h-[340px] flex flex-col justify-center items-center scale-105 z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-900 font-black text-base flex items-center justify-center shadow-lg absolute -top-5 left-1/2 -translate-x-1/2">
                      👑
                    </div>
                    <div className="relative">
                      <UserAvatar
                        avatar={topContributor1.avatar}
                        name={topContributor1.name}
                        role={topContributor1.role as any}
                        className="w-20 h-20 rounded-3xl border-2 border-amber-400 shadow-xl mx-auto ring-4 ring-amber-500/20"
                        size={80}
                      />
                      <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow">
                        TOP 1
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-black text-text-primary truncate max-w-[220px] mx-auto">
                        {topContributor1.name}
                      </div>
                      <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                        <span>⭐</span>
                        <span>{topContributor1.rankTitle}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/60 w-full flex items-center justify-around text-xs">
                      <div>
                        <div className="text-base font-black text-amber-400 font-mono">{topContributor1.contributionPoints}</div>
                        <div className="text-[10px] text-text-muted font-bold">Điểm Cống Hiến</div>
                      </div>
                      <div>
                        <div className="text-base font-black text-text-primary font-mono">{topContributor1.totalArticles}</div>
                        <div className="text-[10px] text-text-muted font-bold">Bài Xuất Bản</div>
                      </div>
                    </div>
                  </div>

                  {/* TOP 3 (BRONZE - RIGHT) */}
                  {topContributor3 && (
                    <div className="order-3 md:order-3 rounded-3xl border border-amber-700/40 bg-gradient-to-b from-amber-700/10 via-bg-panel to-bg-panel p-6 text-center space-y-3 shadow-xl relative md:h-[280px] flex flex-col justify-center items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-md absolute -top-4 left-1/2 -translate-x-1/2">
                        3
                      </div>
                      <UserAvatar
                        avatar={topContributor3.avatar}
                        name={topContributor3.name}
                        role={topContributor3.role as any}
                        className="w-16 h-16 rounded-2xl border-2 border-amber-700 shadow-md mx-auto"
                        size={64}
                      />
                      <div>
                        <div className="text-base font-black text-text-primary truncate max-w-[200px] mx-auto">
                          {topContributor3.name}
                        </div>
                        <div className="text-[11px] font-bold text-amber-600">
                          🥉 {topContributor3.rankTitle}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border/60 w-full flex items-center justify-around text-xs">
                        <div>
                          <div className="font-bold text-accent font-mono">{topContributor3.contributionPoints}</div>
                          <div className="text-[10px] text-text-muted">Điểm CP</div>
                        </div>
                        <div>
                          <div className="font-bold text-text-primary font-mono">{topContributor3.totalArticles}</div>
                          <div className="text-[10px] text-text-muted">Bài đăng</div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* FULL CONTRIBUTORS LIST */}
            <div className="rounded-3xl border border-border/80 bg-bg-panel shadow-xl overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  <span>Danh Sách Tác Giả & Cống Hiến Tri Thức</span>
                </h3>
                <span className="text-xs text-text-muted">
                  {contributors.length} tác giả
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {contributors.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-bg-elevated/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-7 text-center font-mono font-black text-sm text-text-muted">
                        #{c.rank}
                      </span>
                      <UserAvatar
                        avatar={c.avatar}
                        name={c.name}
                        role={c.role as any}
                        className="w-11 h-11 rounded-xl shrink-0"
                        size={44}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text-primary truncate">
                            {c.name}
                          </span>
                          {c.rank === 1 && <span title="Top 1 Cống Hiến">👑</span>}
                        </div>
                        <div className="text-xs text-text-muted flex items-center gap-2">
                          <span className="text-accent font-semibold">{c.rankTitle}</span>
                          <span>·</span>
                          <span>{c.totalArticles} bài viết</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-accent font-mono">
                        {c.contributionPoints} CP
                      </div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                        Điểm Cống Hiến
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: BẢO TÀNG HUY HIỆU (BADGES SHOWCASE)
        ========================================================================= */}
        {activeTab === "badges" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Category Filter Buttons */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { id: "all", label: "Tất cả huy hiệu" },
                { id: "reader", label: "📖 Người đọc bài" },
                { id: "creator", label: "✍️ Tác giả đóng góp" },
                { id: "streak", label: "🔥 Chuỗi chuyên cần" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setBadgeCategory(c.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    badgeCategory === c.id
                      ? "bg-accent text-white shadow-sm"
                      : "bg-bg-panel border border-border/70 text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBadges.map((badge) => {
                const isUnlocked = currentUserBadges.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-5 rounded-3xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                      isUnlocked
                        ? "bg-gradient-to-b from-accent/10 via-bg-panel to-bg-panel border-accent/40 shadow-lg"
                        : "bg-bg-panel/70 border-border/80 opacity-85 hover:opacity-100"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center text-3xl shadow-sm">
                          {badge.icon}
                        </div>

                        {isUnlocked ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã Đạt Được
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bg-elevated text-text-muted border border-border flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Chưa Mở Khóa
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-base font-black text-text-primary">
                          {badge.title}
                        </h4>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-4 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-accent">
                        🎯 {badge.conditionText}
                      </span>
                      {badge.rewardExp && (
                        <span className="font-mono text-emerald-400 font-bold">
                          +{badge.rewardExp} EXP
                        </span>
                      )}
                      {badge.rewardCp && (
                        <span className="font-mono text-amber-400 font-bold">
                          +{badge.rewardCp} CP
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
