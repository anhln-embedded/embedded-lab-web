import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateLevel, getEffectiveStreak, getVietnamDateString } from "@/lib/gamification";
import { normalizeEmail, parseEmailList } from "@/lib/utils";
import { ensureGamificationSchema } from "@/lib/db-sync";

export const dynamic = "force-dynamic";

function getSuperAdminEmailsFromEnv(): string[] {
  const envAdmins =
    process.env.SUPER_ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS ||
    "anhln.embedded@gmail.com,anhlnembedded@gmail.com";
  return parseEmailList(envAdmins);
}

// Kiểm tra quyền Super Admin từ request
async function verifySuperAdmin(request: Request, bodyEmail?: string): Promise<boolean> {
  const superAdminEmails = getSuperAdminEmailsFromEnv();
  const cleanAdminEmail = bodyEmail ? normalizeEmail(bodyEmail) : "";
  const headerEmail = request.headers.get("x-user-email");
  const headerRole = request.headers.get("x-user-role");

  if (headerRole === "superadmin") return true;
  if (cleanAdminEmail && superAdminEmails.includes(cleanAdminEmail)) return true;
  if (headerEmail && superAdminEmails.includes(normalizeEmail(headerEmail))) return true;

  if (cleanAdminEmail) {
    const adminUser = await prisma.user.findUnique({ where: { email: cleanAdminEmail } });
    if (adminUser?.role === "superadmin") return true;
  }
  return false;
}

// GET /api/admin/points?userId=... - Thẩm định & truy xuất lịch sử đọc bài, audit log điểm số
export async function GET(request: Request) {
  try {
    await ensureGamificationSchema();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const adminEmail = searchParams.get("adminEmail") || undefined;

    const isAuthorized = await verifySuperAdmin(request, adminEmail);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Truy cập bị từ chối: Yêu cầu quyền Super Admin." },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const targetUser: any = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    // 1. Tính toán chuỗi ngày thực tế còn hiệu lực (chống chuỗi ma)
    const effectiveStreakInfo = getEffectiveStreak(
      Number(targetUser.streakDays || 0),
      targetUser.lastActiveDate
    );

    // 2. Lấy toàn bộ nhật ký đọc bài thực tế
    const readingLogs: any[] = await prisma.$queryRawUnsafe(
      `SELECT "id", "articleId", "articleType", "title", "earnedExp", "createdAt" 
       FROM "UserReadingLog" 
       WHERE "userId" = ? 
       ORDER BY "createdAt" DESC 
       LIMIT 100`,
      targetUser.id
    );

    // 3. Tính tổng EXP thực tế tích lũy từ các bài đọc
    const readStats: any[] = await prisma.$queryRawUnsafe(
      `SELECT COALESCE(SUM("earnedExp"), 0) as totalExp, COUNT(*) as readCount 
       FROM "UserReadingLog" 
       WHERE "userId" = ?`,
      targetUser.id
    );

    const totalExpFromReading = Number(readStats[0]?.totalExp || 0);
    const totalArticlesReadInLog = Number(readStats[0]?.readCount || 0);

    // 4. Lấy nhật ký can thiệp điểm số (PointAuditLog)
    let auditLogs: any[] = [];
    try {
      auditLogs = await prisma.$queryRawUnsafe(
        `SELECT * FROM "PointAuditLog" WHERE "userId" = ? ORDER BY "createdAt" DESC LIMIT 50`,
        targetUser.id
      );
    } catch {}

    const currentExp = Number(targetUser.exp || 0);
    const currentCP = Number(targetUser.contributionPoints || 0);
    const expDifference = currentExp - totalExpFromReading;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          avatar: targetUser.avatar,
          exp: currentExp,
          level: Number(targetUser.level || 1),
          contributionPoints: currentCP,
          storedStreakDays: Number(targetUser.streakDays || 0),
          lastActiveDate: targetUser.lastActiveDate || null,
        },
        streakAudit: {
          effectiveStreak: effectiveStreakInfo.effectiveStreak,
          isStreakActive: effectiveStreakInfo.isStreakActive,
          isReadToday: effectiveStreakInfo.isReadToday,
          lastActiveDate: targetUser.lastActiveDate || null,
          todayDateVN: getVietnamDateString(),
          streakStatus: effectiveStreakInfo.isStreakActive
            ? `Đang duy trì (${effectiveStreakInfo.effectiveStreak} ngày)`
            : targetUser.lastActiveDate
            ? "Đã đứt chuỗi (ngừng đọc quá 1 ngày)"
            : "Chưa từng đọc bài",
        },
        pointAudit: {
          currentExp,
          totalExpFromReading,
          totalArticlesReadInLog,
          expDifference,
          integrityStatus:
            expDifference === 0
              ? "KHỚP_100_PHẦN_TRĂM"
              : expDifference > 0
              ? "CÓ_ĐIỂM_THƯỞNG_HOẶC_ADMIN_CỘNG"
              : "THẤP_HƠN_LỊCH_SỬ_ĐỌC",
          integrityNote:
            expDifference === 0
              ? "Điểm EXP hiện tại hoàn toàn trùng khớp với lịch sử các bài đã đọc thực tế."
              : expDifference > 0
              ? `Có +${expDifference} EXP chênh lệch so với lịch sử đọc bài (từ thưởng sự kiện hoặc Super Admin can thiệp thủ công).`
              : `Điểm EXP hiện tại đang thấp hơn ${Math.abs(expDifference)} EXP so với các bài đã đọc.`,
        },
        readingLogs,
        auditLogs,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi thẩm định điểm người dùng:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi máy chủ khi thẩm định điểm" },
      { status: 500 }
    );
  }
}

// POST /api/admin/points - Điều chỉnh điểm hoặc đồng bộ chuẩn hóa từ lịch sử đọc
export async function POST(request: Request) {
  try {
    await ensureGamificationSchema();

    const body = await request.json();
    const {
      adminEmail,
      userId,
      type = "exp", // "exp" | "cp" | "both"
      mode = "delta", // "delta" (+/-) | "set" (gán trực tiếp) | "sync_reading_history" (đồng bộ chuẩn từ log đọc)
      amount = 0,
      expAmount,
      cpAmount,
      reason,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID người dùng (userId)." },
        { status: 400 }
      );
    }

    // 1. Kiểm tra xác thực quyền Super Admin
    const isAuthorized = await verifySuperAdmin(request, adminEmail);
    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Truy cập bị từ chối: Tính năng chỉ dành riêng cho Super Admin tối cao.",
        },
        { status: 403 }
      );
    }

    // 2. Lấy thông tin user mục tiêu
    const targetUser: any = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy người dùng cần điều chỉnh điểm." },
        { status: 404 }
      );
    }

    const currentExp = Number(targetUser.exp ?? 0);
    const currentCP = Number(targetUser.contributionPoints ?? 0);
    const oldLevel = Number(targetUser.level ?? 1);

    let newExp = currentExp;
    let newCP = currentCP;
    let actionType = "admin_adjust";
    let finalReason = reason || "";

    if (mode === "sync_reading_history") {
      // ĐỒNG BỘ CHUẨN TỪ LỊCH SỬ ĐỌC THỰC TẾ
      const logSummary: any[] = await prisma.$queryRawUnsafe(
        `SELECT COALESCE(SUM("earnedExp"), 0) as totalExp, COUNT(*) as readCount 
         FROM "UserReadingLog" 
         WHERE "userId" = ?`,
        targetUser.id
      );

      newExp = Number(logSummary[0]?.totalExp || 0);
      const readCount = Number(logSummary[0]?.readCount || 0);
      const newLevel = calculateLevel(newExp);
      actionType = "sync_recalculated";
      finalReason = `Đồng bộ chuẩn hóa theo ${readCount} bài đọc thực tế`;

      // Cập nhật Database
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "exp" = ?, "level" = ?, "readArticlesCount" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
        newExp,
        newLevel,
        readCount,
        targetUser.id
      );

      // Ghi nhật ký Audit Log
      try {
        const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await prisma.$executeRawUnsafe(
          `INSERT INTO "PointAuditLog" ("id", "userId", "adminEmail", "actionType", "pointType", "amount", "oldExp", "newExp", "oldCP", "newCP", "reason") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          auditId,
          targetUser.id,
          adminEmail || "superadmin",
          actionType,
          "exp",
          newExp - currentExp,
          currentExp,
          newExp,
          currentCP,
          currentCP,
          finalReason
        );
      } catch {}

      return NextResponse.json({
        success: true,
        message: `Đã đồng bộ chuẩn hóa điểm cho ${targetUser.name} về đúng ${newExp} EXP (${readCount} bài đọc)!`,
        data: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          exp: newExp,
          level: newLevel,
          contributionPoints: currentCP,
          oldExp: currentExp,
          oldLevel: oldLevel,
          oldCP: currentCP,
          diffExp: newExp - currentExp,
          diffCP: 0,
          reason: finalReason,
        },
      });
    }

    if (mode === "set") {
      // Đặt giá trị tuyệt đối
      if (type === "exp" || type === "both") {
        newExp = Math.max(0, Number(expAmount !== undefined ? expAmount : amount));
      }
      if (type === "cp" || type === "both") {
        newCP = Math.max(0, Number(cpAmount !== undefined ? cpAmount : amount));
      }
    } else {
      // Cộng hoặc trừ delta
      if (type === "exp" || type === "both") {
        const deltaExp = Number(expAmount !== undefined ? expAmount : amount);
        newExp = Math.max(0, currentExp + deltaExp);
      }
      if (type === "cp" || type === "both") {
        const deltaCP = Number(cpAmount !== undefined ? cpAmount : amount);
        newCP = Math.max(0, currentCP + deltaCP);
      }
    }

    const newLevel = calculateLevel(newExp);

    // 3. Cập nhật SQLite Database
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "exp" = ?, "level" = ?, "contributionPoints" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
      newExp,
      newLevel,
      newCP,
      targetUser.id
    );

    // 4. Ghi nhật ký vào PointAuditLog
    try {
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "PointAuditLog" ("id", "userId", "adminEmail", "actionType", "pointType", "amount", "oldExp", "newExp", "oldCP", "newCP", "reason") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        auditId,
        targetUser.id,
        adminEmail || "superadmin",
        actionType,
        type,
        amount,
        currentExp,
        newExp,
        currentCP,
        newCP,
        finalReason || "Super Admin điều chỉnh điểm"
      );
    } catch (e) {
      console.warn("Không thể ghi PointAuditLog:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật điểm thành công cho ${targetUser.name}!`,
      data: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        exp: newExp,
        level: newLevel,
        contributionPoints: newCP,
        oldExp: currentExp,
        oldLevel: oldLevel,
        oldCP: currentCP,
        diffExp: newExp - currentExp,
        diffCP: newCP - currentCP,
        reason: finalReason,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi điều chỉnh điểm người dùng:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi máy chủ khi điều chỉnh điểm" },
      { status: 500 }
    );
  }
}
