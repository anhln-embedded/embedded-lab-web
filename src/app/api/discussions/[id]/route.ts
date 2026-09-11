import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDiscussionSchema } from "@/lib/db-sync";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/discussions/[id] - Lấy chi tiết chủ đề thảo luận kèm các bình luận
export async function GET(request: Request, { params }: Params) {
  try {
    await ensureDiscussionSchema();
    const { id } = await params;

    const thread = await prisma.discussionThread.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chủ đề thảo luận" },
        { status: 404 }
      );
    }

    let reactions = { ung: 0, gach: 0, ung_bung: 0, haha: 0, nguong_mo: 0 };
    try {
      if (thread.reactions) reactions = JSON.parse(thread.reactions);
    } catch {}

    let attachedFiles = [];
    try {
      if (thread.attachedFiles) attachedFiles = JSON.parse(thread.attachedFiles);
    } catch {}

    let tags = [];
    try {
      if (thread.tags) tags = JSON.parse(thread.tags);
    } catch {}

    const comments = thread.comments.map((c) => {
      let cReactions = { ung: 0, gach: 0, ung_bung: 0 };
      try {
        if (c.reactions) cReactions = JSON.parse(c.reactions);
      } catch {}

      let cAttached = [];
      try {
        if (c.attachedFiles) cAttached = JSON.parse(c.attachedFiles);
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
        attachedFiles: cAttached,
        votes: c.votes,
        reactions: cReactions,
        createdAt: c.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: thread.id,
        title: thread.title,
        category: thread.category,
        flair: thread.flair,
        author: thread.author,
        authorId: thread.authorId,
        authorRole: thread.authorRole,
        authorAvatar: thread.authorAvatar,
        authorTitle: thread.authorTitle,
        content: thread.content,
        codeSnippet: thread.codeSnippet || undefined,
        attachedFiles,
        hasSimulatorPreview: thread.hasSimulatorPreview,
        simulatorCode: thread.simulatorCode || undefined,
        votes: thread.votes,
        viewsCount: thread.viewsCount,
        repliesCount: thread.repliesCount,
        reactions,
        isPinned: thread.isPinned,
        createdAt: thread.createdAt.toISOString(),
        lastActivity: thread.lastActivity.toISOString(),
        tags,
        comments,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi tải chi tiết thảo luận:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch thread detail" },
      { status: 500 }
    );
  }
}

// DELETE /api/discussions/[id] - Xóa bài viết (Người đăng hoặc Admin/SuperAdmin)
export async function DELETE(request: Request, { params }: Params) {
  try {
    await ensureDiscussionSchema();
    const { id } = await params;

    const thread = await prisma.discussionThread.findUnique({
      where: { id },
    });

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Chủ đề không tồn tại" },
        { status: 404 }
      );
    }

    // Xóa trong database (cascade sẽ xóa cả comments)
    await prisma.discussionThread.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa chủ đề thành công",
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa chủ đề thảo luận:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete discussion" },
      { status: 500 }
    );
  }
}
