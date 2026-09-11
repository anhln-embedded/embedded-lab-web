/**
 * Hệ thống Gamification, Danh Hiệu & Điểm Thưởng Ảo Lab Embedded-AIoT PTIT
 */

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "reader" | "creator" | "streak" | "special";
  tier: "bronze" | "silver" | "gold" | "diamond";
  rewardExp?: number;
  rewardCp?: number;
  conditionText: string;
}

export const LAB_BADGES: Badge[] = [
  {
    id: "first_step",
    title: "Khởi Đầu Đam Mê",
    description: "Hoàn thành đọc bài viết đầu tiên trên cổng thông tin Lab.",
    icon: "📖",
    category: "reader",
    tier: "bronze",
    rewardExp: 20,
    conditionText: "Đọc 1 bài viết bất kỳ",
  },
  {
    id: "bookworm",
    title: "Mọt Sách PTIT",
    description: "Chăm chỉ nghiên cứu hơn 10 bài viết chuyên đề và bản tin.",
    icon: "📚",
    category: "reader",
    tier: "silver",
    rewardExp: 50,
    conditionText: "Đọc xong 10 bài viết",
  },
  {
    id: "embedded_scholar",
    title: "Học Giả AIoT",
    description: "Tích lũy kiến thức sâu rộng với trên 25 bài viết hoàn thành.",
    icon: "🎓",
    category: "reader",
    tier: "gold",
    rewardExp: 100,
    conditionText: "Đọc xong 25 bài viết",
  },
  {
    id: "streak_3",
    title: "Tập Trung Cao Độ",
    description: "Duy trì thói quen đọc bài 3 ngày liên tiếp.",
    icon: "⚡",
    category: "streak",
    tier: "bronze",
    rewardExp: 30,
    conditionText: "Chuỗi chuyên cần 3 ngày",
  },
  {
    id: "streak_7",
    title: "Ngọn Lửa Chuyên Cần",
    description: "Duy trì chuỗi học tập và đọc bài liên tục trong 7 ngày.",
    icon: "🔥",
    category: "streak",
    tier: "silver",
    rewardExp: 80,
    conditionText: "Chuỗi chuyên cần 7 ngày",
  },
  {
    id: "pioneer_author",
    title: "Ngòi Bút Tiên Phong",
    description: "Đóng góp và xuất bản bài viết kỹ thuật hoặc bản tin đầu tiên.",
    icon: "✍️",
    category: "creator",
    tier: "bronze",
    rewardCp: 50,
    conditionText: "Xuất bản 1 bài viết",
  },
  {
    id: "golden_quill",
    title: "Cây Bút Vàng Lab",
    description: "Tác giả xuất sắc đã đóng góp từ 5 bài viết hoặc chuyên đề cho Lab.",
    icon: "✒️",
    category: "creator",
    tier: "gold",
    rewardCp: 150,
    conditionText: "Xuất bản từ 5 bài viết",
  },
  {
    id: "top_contributor",
    title: "Bậc Thầy Cống Hiến",
    description: "Đóng góp vượt bậc với trên 300 điểm cống hiến tri thức.",
    icon: "👑",
    category: "creator",
    tier: "diamond",
    rewardCp: 200,
    conditionText: "Đạt từ 300 điểm cống hiến",
  },
  {
    id: "master_aiot",
    title: "Kỹ Sư Nghiên Cứu",
    description: "Thăng tiến vượt bậc và đạt Cấp độ 4 trong phòng Lab.",
    icon: "🔬",
    category: "special",
    tier: "silver",
    rewardExp: 100,
    conditionText: "Đạt Cấp độ (Level) 4",
  },
];

export interface LevelInfo {
  level: number;
  title: string;
  minExp: number;
  maxExp: number;
  badge: string;
  color: string;
}

const LEVEL_THRESHOLDS: { level: number; title: string; minExp: number; maxExp: number; badge: string; color: string }[] = [
  { level: 1, title: "Tập Sự", minExp: 0, maxExp: 49, badge: "🌱", color: "#10b981" },
  { level: 2, title: "Kỹ Thuật Viên", minExp: 50, maxExp: 119, badge: "⚡", color: "#06b6d4" },
  { level: 3, title: "Kỹ Sư Nhúng", minExp: 120, maxExp: 219, badge: "💻", color: "#3b82f6" },
  { level: 4, title: "Kỹ Sư AIoT", minExp: 220, maxExp: 349, badge: "🔬", color: "#8b5cf6" },
  { level: 5, title: "Chuyên Gia Lab", minExp: 350, maxExp: 499, badge: "🚀", color: "#f59e0b" },
  { level: 6, title: "Nghiên Cứu Viên", minExp: 500, maxExp: 699, badge: "⭐", color: "#ec4899" },
  { level: 7, title: "Kiến Trúc Sư Hệ Thống", minExp: 700, maxExp: 999, badge: "💎", color: "#f43f5e" },
  { level: 8, title: "Bậc Thầy AIoT", minExp: 1000, maxExp: 99999, badge: "👑", color: "#f05a28" },
];

export function calculateLevel(exp: number): number {
  if (!exp || exp < 50) return 1;
  const match = LEVEL_THRESHOLDS.find((t) => exp >= t.minExp && exp <= t.maxExp);
  return match ? match.level : 8;
}

export function getLevelInfo(level: number): LevelInfo {
  const safeLevel = Math.max(1, Math.min(8, level));
  return LEVEL_THRESHOLDS.find((t) => t.level === safeLevel) || LEVEL_THRESHOLDS[0];
}

export function getExpProgress(exp: number) {
  const currentLevel = calculateLevel(exp);
  const info = getLevelInfo(currentLevel);
  const nextInfo = getLevelInfo(currentLevel + 1);

  const range = (nextInfo.minExp - info.minExp) || 100;
  const currentProgress = exp - info.minExp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
  const expToNext = Math.max(0, nextInfo.minExp - exp);

  return {
    currentLevel,
    title: info.title,
    badge: info.badge,
    color: info.color,
    currentExp: exp,
    minExp: info.minExp,
    nextLevelMinExp: nextInfo.minExp,
    progressPercent,
    expToNext,
  };
}

export function getCreatorRankInfo(cp: number): { title: string; badge: string; color: string } {
  if (cp >= 400) return { title: "Cây Bút Vàng Lab", badge: "👑", color: "#f59e0b" };
  if (cp >= 200) return { title: "Tác Giả Tiên Phong", badge: "⭐", color: "#a855f7" };
  if (cp >= 80) return { title: "Ngòi Bút Tích Cực", badge: "✍️", color: "#3b82f6" };
  if (cp > 0) return { title: "Thành Viên Đóng Góp", badge: "🌱", color: "#10b981" };
  return { title: "Độc Giả Thân Thiết", badge: "📖", color: "#64748b" };
}

/**
 * Lấy chuỗi ngày YYYY-MM-DD theo giờ chuẩn Việt Nam (UTC+7)
 */
export function getVietnamDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Lấy chuỗi ngày hôm qua YYYY-MM-DD theo giờ chuẩn Việt Nam (UTC+7)
 */
export function getVietnamYesterdayString(date: Date = new Date()): string {
  // Lấy thời điểm hiện tại tại VN rồi trừ 24h
  const vnTimeStr = date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
  const vnDate = new Date(vnTimeStr);
  vnDate.setDate(vnDate.getDate() - 1);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(vnDate);
}

/**
 * Tính toán chuỗi ngày đọc bài thực tế còn hiệu lực (chống "Chuỗi ma" - Ghost Streak)
 * - Nếu người dùng đọc hôm nay: Chuỗi còn nguyên vẹn, đã ghi nhận hôm nay.
 * - Nếu người dùng đọc hôm qua: Chuỗi còn nguyên vẹn, chưa đọc hôm nay.
 * - Nếu người dùng bỏ lỡ quá 1 ngày (trước hôm qua) hoặc chưa từng đọc: Chuỗi đã đứt (về 0).
 */
export function getEffectiveStreak(streakDays: number, lastActiveDate?: string | null): {
  effectiveStreak: number;
  isStreakActive: boolean;
  isReadToday: boolean;
} {
  const s = Math.max(0, Number(streakDays) || 0);
  if (s <= 0 || !lastActiveDate) {
    return { effectiveStreak: 0, isStreakActive: false, isReadToday: false };
  }

  const today = getVietnamDateString();
  const yesterday = getVietnamYesterdayString();

  if (lastActiveDate === today) {
    return { effectiveStreak: s, isStreakActive: true, isReadToday: true };
  }

  if (lastActiveDate === yesterday) {
    return { effectiveStreak: s, isStreakActive: true, isReadToday: false };
  }

  // Đã bỏ lỡ từ 2 ngày trở lên -> Chuỗi thực tế đã đứt!
  return { effectiveStreak: 0, isStreakActive: false, isReadToday: false };
}

