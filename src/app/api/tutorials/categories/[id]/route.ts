import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, icon, order } = body;

    const existing = await prisma.tutorialCategory.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy danh mục để cập nhật" },
        { status: 404 }
      );
    }

    const updated = await prisma.tutorialCategory.update({
      where: { id: existing.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(icon && { icon }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/tutorials/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi cập nhật danh mục" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.tutorialCategory.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy danh mục để xóa" },
        { status: 404 }
      );
    }

    await prisma.tutorialCategory.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa danh mục thành công" });
  } catch (error: any) {
    console.error("DELETE /api/tutorials/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xóa danh mục" },
      { status: 500 }
    );
  }
}
