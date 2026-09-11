import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/research/[id]
export async function GET(request: Request, { params }: Params) {
  try {
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

// DELETE /api/research/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const paper = await prisma.researchPaper.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài báo để xóa" },
        { status: 404 }
      );
    }

    await prisma.researchPaper.delete({
      where: { id: paper.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa bài báo thành công" });
  } catch (error: any) {
    console.error("Lỗi xóa bài nghiên cứu:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete research paper" },
      { status: 500 }
    );
  }
}
