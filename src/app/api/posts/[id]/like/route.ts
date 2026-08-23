import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/posts/[id]/like - Toggle or increment like
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action || "increment"; // 'increment' or 'decrement'

    const post = await prisma.post.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: {
        likesCount: {
          increment: action === "decrement" ? -1 : 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      likesCount: Math.max(0, updated.likesCount),
    });
  } catch (error: any) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update like" },
      { status: 500 }
    );
  }
}
