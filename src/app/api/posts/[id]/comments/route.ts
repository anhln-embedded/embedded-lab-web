import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id]/comments - Get all comments for a post
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const post = await prisma.post.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments - Add comment to post
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { author, authorRole, content } = body;

    if (!author || !content) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên và nội dung bình luận" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const newComment = await prisma.comment.create({
      data: {
        postId: post.id,
        author: author.trim(),
        authorRole: authorRole?.trim() || "Thành viên Lab",
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, data: newComment }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ success: false, error: "Failed to add comment" }, { status: 500 });
  }
}
