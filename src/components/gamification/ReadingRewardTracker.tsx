"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Trophy, Award, CheckCircle2, Flame, ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface ReadingRewardTrackerProps {
  articleId: string;
  articleType: "post" | "tutorial" | "lesson";
  title?: string;
}

interface RewardToast {
  earnedExp: number;
  newLevel?: number;
  leveledUp?: boolean;
  streakDays?: number;
  newBadge?: {
    id: string;
    title: string;
    icon: string;
    description: string;
  } | null;
}

export function ReadingRewardTracker({
  articleId,
  articleType,
  title,
}: ReadingRewardTrackerProps) {
  const { user } = useAuth();
  const [hasTriggered, setHasTriggered] = useState(false);
  const [toast, setToast] = useState<RewardToast | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setHasTriggered(false);
    setToast(null);
  }, [articleId]);

  // Track scroll progress and reading time
  useEffect(() => {
    if (hasTriggered || !user) return;

    const checkAndClaim = async () => {
      if (hasTriggered) return;

      const timeSpentSeconds = (Date.now() - startTimeRef.current) / 1000;
      // Require at least 8 seconds reading
      if (timeSpentSeconds < 8) return;

      setHasTriggered(true);

      try {
        const res = await fetch("/api/gamification/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
            articleId,
            articleType,
            title,
          }),
        });

        const json = await res.json();
        if (json.success && !json.alreadyClaimed && json.earnedExp > 0) {
          setToast({
            earnedExp: json.earnedExp,
            newLevel: json.level,
            leveledUp: json.leveledUp,
            streakDays: json.streakDays,
            newBadge: json.newBadge,
          });
          setIsVisible(true);

          // Trigger local event so header & profile can re-fetch or update
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("embedded_gamification_updated", { detail: json })
            );
          }
        }
      } catch (err) {
        console.warn("Could not claim reading reward:", err);
      }
    };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const progress = (window.scrollY / scrollHeight) * 100;
      // When scrolled >= 65%, trigger reward check
      if (progress >= 65 && !hasTriggered) {
        checkAndClaim();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Fallback: If article is short or reader stays for 45 seconds, claim automatically
    timerRef.current = setTimeout(() => {
      if (!hasTriggered) {
        checkAndClaim();
      }
    }, 45000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [articleId, articleType, title, user, hasTriggered]);

  if (!toast || !isVisible) return null;

  return (
    <aside
      aria-label="Thông báo thưởng kinh nghiệm đọc bài"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-3xl bg-bg-panel/95 backdrop-blur-xl border border-accent/40 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 space-y-2.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center text-white shadow-md text-lg shrink-0">
            {toast.leveledUp ? "⭐" : toast.newBadge ? toast.newBadge.icon : "🎉"}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-accent flex items-center gap-1.5">
              <span>Hoàn thành bài đọc</span>
              {toast.streakDays && toast.streakDays > 1 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-bold border border-orange-500/30 flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-orange-400" />
                  {toast.streakDays} ngày
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-text-primary">
              +{toast.earnedExp} Điểm Kinh Nghiệm (EXP)!
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-elevated transition-colors"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Level Up Banner */}
      {toast.leveledUp && (
        <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
          <span>Thăng cấp! Bạn đã đạt Cấp Độ (Level) {toast.newLevel}!</span>
        </div>
      )}

      {/* New Badge Banner */}
      {toast.newBadge && (
        <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-400 flex items-center gap-2">
          <span className="text-base">{toast.newBadge.icon}</span>
          <div className="min-w-0">
            <div>Mở khóa huy hiệu: {toast.newBadge.title}</div>
            <div className="text-[10px] font-normal text-text-muted truncate">
              {toast.newBadge.description}
            </div>
          </div>
        </div>
      )}

      {/* Quick link to Ranking */}
      <div className="pt-1 border-t border-border/60 flex items-center justify-between text-[11px]">
        <span className="text-text-muted">Tích lũy để thăng hạng Lab</span>
        <Link
          href="/ranking"
          onClick={() => setIsVisible(false)}
          className="text-accent hover:underline font-bold flex items-center gap-1"
        >
          <span>Xem Bảng Xếp Hạng</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
}
