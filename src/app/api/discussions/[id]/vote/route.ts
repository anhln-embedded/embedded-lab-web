import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDiscussionSchema } from "@/lib/db-sync";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/discussions/[id]/vote - Cập nhật điểm vote
export async function POST(request: Request, { params }: Params) {
  try {
    await ensureDiscussionSchema();
    const { id } = await params;
    const body = await request.json();
    const { diff = 1 } = body; // diff có thể là 1, -1, 2, -2

    const thread = await prisma.discussionThread.update({
      where: { id },
      data: {
        votes: {
          increment: diff,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        votes: thread.votes,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi vote bài viết:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to vote" },
      { status: 500 }
    );
  }
}
