import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string; commentId: string }>;
}

// DELETE /api/discussions/[id]/comments/[commentId] - Xóa bình luận
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id, commentId } = await params;

    await prisma.$transaction([
      prisma.discussionComment.delete({
        where: { id: commentId },
      }),
      prisma.discussionThread.update({
        where: { id },
        data: {
          repliesCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Đã xóa bình luận thành công",
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa bình luận:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete comment" },
      { status: 500 }
    );
  }
}
