import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/courses/[id] - Get course detail by ID or Slug
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khóa học" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: course });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete course
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await prisma.course.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khóa học để xóa" },
        { status: 404 }
      );
    }

    await prisma.course.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, message: "Đã xóa khóa học thành công" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
