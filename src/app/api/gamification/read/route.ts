import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureGamificationSchema } from "@/lib/db-sync";
import { calculateLevel, LAB_BADGES } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await ensureGamificationSchema();

    const body = await request.json();
    const { userId, userEmail, articleId, articleType = "post" } = body;

    if (!articleId) {
      return NextResponse.json({ success: false, error: "articleId is required" }, { status: 400 });
    }

    // Identify user by id or email
    let user: any = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user && userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    // Guest reader (not logged in): return gentle notice
    if (!user) {
      return NextResponse.json({
        success: false,
        isGuest: true,
        message: "Đăng nhập để nhận điểm kinh nghiệm đọc và vinh danh trên Bảng Xếp Hạng!",
      });
    }

    // Anti-spam: check if already claimed for this article using raw SQLite query
    const existingLogs: any[] = await prisma.$queryRawUnsafe(
      `SELECT "id" FROM "UserReadingLog" WHERE "userId" = ? AND "articleId" = ? LIMIT 1`,
      user.id,
      String(articleId)
    );

    if (existingLogs && existingLogs.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyClaimed: true,
        earnedExp: 0,
        currentExp: (user as any).exp || 0,
        level: (user as any).level || 1,
        message: "Bạn đã nhận điểm thưởng cho bài viết này trước đó.",
      });
    }

    // Calculate Streak
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let currentStreak = Number((user as any).streakDays || 1);
    const lastActive = (user as any).lastActiveDate;

    if (lastActive === todayStr) {
      // Already read something today, keep streak
    } else if (lastActive === yesterdayStr) {
      // Read yesterday, increment streak!
      currentStreak += 1;
    } else {
      // Missed at least one day, reset to 1
      currentStreak = 1;
    }

    // Base EXP
    const baseExp = articleType === "lesson" ? 25 : 15;
    const streakBonus = currentStreak >= 3 ? 5 : 0;
    const totalEarnedExp = baseExp + streakBonus;

    const newExp = Number((user as any).exp || 0) + totalEarnedExp;
    const oldLevel = Number((user as any).level || 1);
    const newLevel = calculateLevel(newExp);
    const leveledUp = newLevel > oldLevel;
    const newReadCount = Number((user as any).readArticlesCount || 0) + 1;

    // Badges calculation
    let currentBadges: string[] = [];
    try {
      const rawBadges = (user as any).badges;
      currentBadges = rawBadges ? JSON.parse(rawBadges) : [];
    } catch {
      currentBadges = [];
    }

    const newlyUnlockedBadges: string[] = [];

    // Check badge unlock conditions
    if (newReadCount >= 1 && !currentBadges.includes("first_step")) {
      newlyUnlockedBadges.push("first_step");
    }
    if (newReadCount >= 10 && !currentBadges.includes("bookworm")) {
      newlyUnlockedBadges.push("bookworm");
    }
    if (newReadCount >= 25 && !currentBadges.includes("embedded_scholar")) {
      newlyUnlockedBadges.push("embedded_scholar");
    }
    if (currentStreak >= 3 && !currentBadges.includes("streak_3")) {
      newlyUnlockedBadges.push("streak_3");
    }
    if (currentStreak >= 7 && !currentBadges.includes("streak_7")) {
      newlyUnlockedBadges.push("streak_7");
    }
    if (newLevel >= 4 && !currentBadges.includes("master_aiot")) {
      newlyUnlockedBadges.push("master_aiot");
    }

    const updatedBadges = Array.from(new Set([...currentBadges, ...newlyUnlockedBadges]));

    // Record log in SQLite via raw query
    const logId = `read_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "UserReadingLog" ("id", "userId", "articleId", "articleType", "earnedExp") VALUES (?, ?, ?, ?, ?)`,
      logId,
      user.id,
      String(articleId),
      articleType,
      totalEarnedExp
    );

    // Update user in SQLite via raw query
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "exp" = ?, "level" = ?, "readArticlesCount" = ?, "streakDays" = ?, "lastActiveDate" = ?, "badges" = ? WHERE "id" = ?`,
      newExp,
      newLevel,
      newReadCount,
      currentStreak,
      todayStr,
      JSON.stringify(updatedBadges),
      user.id
    );

    const firstNewBadge = newlyUnlockedBadges[0]
      ? LAB_BADGES.find((b) => b.id === newlyUnlockedBadges[0])
      : null;

    return NextResponse.json({
      success: true,
      alreadyClaimed: false,
      earnedExp: totalEarnedExp,
      currentExp: newExp,
      level: newLevel,
      leveledUp,
      streakDays: currentStreak,
      readArticlesCount: newReadCount,
      newBadge: firstNewBadge,
      badges: updatedBadges,
      message: `🎉 +${totalEarnedExp} EXP! Bạn vừa hoàn thành bài viết!`,
    });
  } catch (error: any) {
    console.error("Gamification read error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
