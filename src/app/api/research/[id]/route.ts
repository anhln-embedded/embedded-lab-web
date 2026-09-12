import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeEmail, parseEmailList } from "@/lib/utils";
import { ensureResearchSchema } from "@/lib/db-sync";
import { canUserDeleteContent } from "@/lib/permissions";

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

    // Tìm bài báo nghiên cứu trước
    const existing = await prisma.researchPaper.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài báo để xóa" },
        { status: 404 }
      );
    }

    // Xác thực quyền Admin/SuperAdmin
    const { searchParams } = new URL(request.url);
    const headerRole = request.headers.get("x-user-role") || searchParams.get("role");
    const headerEmail = request.headers.get("x-user-email") || searchParams.get("email");
    const headerId = request.headers.get("x-user-id") || searchParams.get("userId");
    const rawHeaderName = request.headers.get("x-user-name") || searchParams.get("userName");
    let headerName: string | null = null;
    try {
      if (rawHeaderName) headerName = decodeURIComponent(rawHeaderName);
    } catch {
      headerName = rawHeaderName;
    }

    const permCheck = canUserDeleteContent({
      currentUser: {
        id: headerId,
        email: headerEmail,
        name: headerName,
        role: headerRole,
      },
      author: {
        id: (existing as any)?.createdById,
        email: (existing as any)?.createdByEmail,
        name: (existing as any)?.creatorName || existing?.authors,
        role: (existing as any)?.creatorRole || "admin",
      },
      isDiscussionOrComment: false,
    });

    if (!permCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            permCheck.reason ||
            "Truy cập bị từ chối: Quản trị viên không thể xóa bài báo do Quản trị viên khác tạo. Chỉ Superadmin mới có quyền này.",
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

