import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureCircuitPresetSchema } from "@/lib/db-sync";

// GET /api/simulator/presets - Lấy danh sách mạch mẫu
export async function GET(req: NextRequest) {
  try {
    await ensureCircuitPresetSchema();

    const presets: any = await prisma.$queryRawUnsafe(`
      SELECT "id", "title", "slug", "description", "mcuType", "diagramJson", "firmwareHex", "firmwareName", "order", "isPublished", "createdAt"
      FROM "CircuitPreset"
      WHERE "isPublished" = 1
      ORDER BY "order" ASC, "createdAt" DESC
    `);

    return NextResponse.json({
      success: true,
      data: presets || [],
    });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách CircuitPreset:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}

// POST /api/simulator/presets - Admin tạo mạch mẫu mới
export async function POST(req: NextRequest) {
  try {
    await ensureCircuitPresetSchema();

    const body = await req.json();
    const { title, description, mcuType, diagramJson, firmwareHex, firmwareName, user } = body;

    // Kiểm tra quyền admin
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return NextResponse.json(
        { success: false, error: "Chỉ Admin/SuperAdmin mới có quyền quản lý mạch mẫu" },
        { status: 403 }
      );
    }

    if (!title || !diagramJson) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ tiêu đề và sơ đồ mạch diagram.json" },
        { status: 400 }
      );
    }

    // Tạo slug từ title
    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const id = `preset_${Date.now()}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "CircuitPreset" ("id", "title", "slug", "description", "mcuType", "diagramJson", "firmwareHex", "firmwareName", "author", "order", "isPublished", "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      id,
      title.trim(),
      slug,
      description?.trim() || null,
      mcuType || "stm32",
      typeof diagramJson === "string" ? diagramJson : JSON.stringify(diagramJson),
      firmwareHex || "",
      firmwareName || "firmware.hex",
      user.name || "Admin PTIT"
    );

    return NextResponse.json({
      success: true,
      data: { id, title, slug },
      message: "Đã thêm mạch mẫu thành công vào cơ sở dữ liệu",
    });
  } catch (error: any) {
    console.error("Lỗi tạo CircuitPreset:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}

// DELETE /api/simulator/presets?id=... - Admin xóa mạch mẫu
export async function DELETE(req: NextRequest) {
  try {
    await ensureCircuitPresetSchema();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userRole = req.headers.get("x-user-role");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID mạch mẫu" }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(`DELETE FROM "CircuitPreset" WHERE "id" = ?`, id);

    return NextResponse.json({
      success: true,
      message: "Đã xóa mạch mẫu thành công",
    });
  } catch (error: any) {
    console.error("Lỗi xóa CircuitPreset:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}
