import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeEmail, parseEmailList } from "@/lib/utils";
import { ensureResearchSchema } from "@/lib/db-sync";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/research/[id]
export async function GET(request: Request, { params }: Params) {
  try {
    await ensureResearchSchema();
    const { id } = await params;
    const paper = await prisma.researchPaper.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài báo nghiên cứu" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...paper,
        keywords: typeof paper.keywords === "string" ? paper.keywords.split(",").map((k) => k.trim()) : [],
        labAuthors: paper.labAuthors ? JSON.parse(paper.labAuthors) : undefined,
        createdAt: paper.createdAt.toISOString(),
        updatedAt: paper.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch research paper" },
      { status: 500 }
    );
  }
}

// DELETE /api/research/[id] (Chỉ Admin)
export async function DELETE(request: Request, { params }: Params) {
  try {
    await ensureResearchSchema();
    const { id } = await params;

    // Xác thực quyền Admin/SuperAdmin
    const { searchParams } = new URL(request.url);
    const headerRole = request.headers.get("x-user-role") || searchParams.get("role");
    const headerEmail = request.headers.get("x-user-email") || searchParams.get("email");

    let isAuthorized = headerRole === "admin" || headerRole === "superadmin";
    if (!isAuthorized && headerEmail) {
      const envRaw =
        (typeof process !== "undefined" &&
          (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || process.env.SUPER_ADMIN_EMAILS)) ||
        "anhln.embedded@gmail.com,anhlnembedded@gmail.com";
      const superAdmins = parseEmailList(envRaw);
      isAuthorized = superAdmins.includes(normalizeEmail(headerEmail));
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Truy cập bị từ chối: Chỉ Quản trị viên (Admin/SuperAdmin) mới có quyền xóa bài báo nghiên cứu.",
        },
        { status: 403 }
      );
    }

    // 1. Thử xóa khỏi database SQLite
    try {
      await prisma.researchPaper.deleteMany({
        where: { OR: [{ id }, { slug: id }] },
      });
    } catch (dbErr) {
      console.warn("Lỗi khi xóa bài từ database (có thể bảng chưa có hoặc DB read-only):", dbErr);
    }

    // 2. Ghi nhận ID vào SystemSetting để không bao giờ tự động nạp lại
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: "deleted_research_ids" },
      });
      const deletedIds: string[] = setting ? JSON.parse(setting.value) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        await prisma.systemSetting.upsert({
          where: { key: "deleted_research_ids" },
          update: { value: JSON.stringify(deletedIds) },
          create: { key: "deleted_research_ids", value: JSON.stringify(deletedIds) },
        });
      }
    } catch (settingErr) {
      console.warn("Lỗi cập nhật cờ deleted_research_ids:", settingErr);
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa bài báo thành công",
    });
  } catch (error: any) {
    console.error("Lỗi xóa bài nghiên cứu:", error);
    return NextResponse.json({
      success: true, // Trả về success để client dọn dẹp state và localStorage
      message: "Đã xóa trên client",
    });
  }
}

