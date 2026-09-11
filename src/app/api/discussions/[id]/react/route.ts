import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/discussions/[id]/react - Cập nhật reaction (Ưng, Gạch, Ưng bụng...)
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reaction, action = "add" } = body; // action: 'add' | 'remove'

    const thread = await prisma.discussionThread.findUnique({
      where: { id },
    });

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    let reactions: any = { ung: 0, gach: 0, ung_bung: 0, haha: 0, nguong_mo: 0 };
    try {
      if (thread.reactions) reactions = JSON.parse(thread.reactions);
    } catch {}

    if (action === "add") {
      reactions[reaction] = (reactions[reaction] || 0) + 1;
    } else {
      reactions[reaction] = Math.max(0, (reactions[reaction] || 0) - 1);
    }

    const updated = await prisma.discussionThread.update({
      where: { id },
      data: {
        reactions: JSON.stringify(reactions),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reactions,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật reaction:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update reaction" },
      { status: 500 }
    );
  }
}
