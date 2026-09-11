import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDiscussionSchema } from "@/lib/db-sync";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/discussions/[id]/comments
export async function GET(request: Request, { params }: Params) {
  try {
    await ensureDiscussionSchema();
    const { id } = await params;

    const comments = await prisma.discussionComment.findMany({
      where: { threadId: id },
      orderBy: { createdAt: "asc" },
    });

    const formatted = comments.map((c) => {
      let reactions = { ung: 0, gach: 0, ung_bung: 0 };
      try {
        if (c.reactions) reactions = JSON.parse(c.reactions);
      } catch {}

      let attachedFiles = [];
      try {
        if (c.attachedFiles) attachedFiles = JSON.parse(c.attachedFiles);
      } catch {}

      return {
        id: c.id,
        threadId: c.threadId,
        parentId: c.parentId || undefined,
        author: c.author,
        authorId: c.authorId,
        authorRole: c.authorRole || "user",
        authorAvatar: c.authorAvatar || "👤",
        authorTitle: c.authorTitle || "Thành viên",
        content: c.content,
        quoteContent: c.quoteContent || undefined,
        quoteAuthor: c.quoteAuthor || undefined,
        attachedFiles,
        votes: c.votes,
        reactions,
        createdAt: c.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/discussions/[id]/comments - Tạo bình luận mới
export async function POST(request: Request, { params }: Params) {
  try {
    await ensureDiscussionSchema();
    const { id } = await params;
    const body = await request.json();
    const {
      content,
      quoteContent,
      quoteAuthor,
      attachedFiles = [],
      author,
      parentId,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Nội dung bình luận không được để trống" },
        { status: 400 }
      );
    }

    if (!author || !author.name) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin người bình luận" },
        { status: 400 }
      );
    }

    let authorTitle = "Thành viên";
    if (author.role === "superadmin") authorTitle = "Quản trị viên";
    else if (author.role === "admin") authorTitle = "Điều hành viên";
    else if (author.role === "lab_member") authorTitle = "Thành viên tích cực";

    const defaultReactions = { ung: 0, gach: 0, ung_bung: 0 };

    // Tạo comment và cập nhật thread (repliesCount và lastActivity)
    const [comment] = await prisma.$transaction([
      prisma.discussionComment.create({
        data: {
          threadId: id,
          parentId: parentId || null,
          author: author.name,
          authorId: author.id || "guest",
          authorRole: author.role || "user",
          authorAvatar: author.avatar || "👤",
          authorTitle,
          content: content.trim(),
          quoteContent: quoteContent || null,
          quoteAuthor: quoteAuthor || null,
          attachedFiles: JSON.stringify(attachedFiles),
          votes: 0,
          reactions: JSON.stringify(defaultReactions),
        },
      }),
      prisma.discussionThread.update({
        where: { id },
        data: {
          repliesCount: { increment: 1 },
          lastActivity: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        id: comment.id,
        threadId: comment.threadId,
        parentId: comment.parentId || undefined,
        author: comment.author,
        authorId: comment.authorId,
        authorRole: comment.authorRole,
        authorAvatar: comment.authorAvatar,
        authorTitle: comment.authorTitle,
        content: comment.content,
        quoteContent: comment.quoteContent || undefined,
        quoteAuthor: comment.quoteAuthor || undefined,
        attachedFiles,
        votes: comment.votes,
        reactions: defaultReactions,
        createdAt: comment.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi thêm bình luận:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create comment" },
      { status: 500 }
    );
  }
}
