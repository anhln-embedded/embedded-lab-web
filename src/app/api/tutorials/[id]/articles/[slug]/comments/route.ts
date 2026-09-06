import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string; slug: string }>;
}

// 1. GET: Lấy danh sách bình luận của bài viết
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: topicIdOrSlug, slug: articleSlug } = await params;

    const topic = await prisma.tutorialTopic.findFirst({
      where: {
        OR: [{ id: topicIdOrSlug }, { slug: topicIdOrSlug }],
      },
    });

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chuyên đề" },
        { status: 404 }
      );
    }

    const article = await prisma.tutorialArticle.findFirst({
      where: {
        topicId: topic.id,
        slug: articleSlug,
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    const comments = await prisma.tutorialComment.findMany({
      where: { articleId: article.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    console.error("GET comments error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi lấy bình luận" },
      { status: 500 }
    );
  }
}

// 2. POST: Thêm bình luận mới (yêu cầu đăng nhập)
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: topicIdOrSlug, slug: articleSlug } = await params;
    const body = await request.json();
    const { content, user } = body;

    // Kiểm tra đăng nhập
    if (!user || (!user.id && !user.email && !user.name)) {
      return NextResponse.json(
        {
          success: false,
          error: "Vui lòng đăng nhập để tham gia bình luận dưới bài viết.",
        },
        { status: 401 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Nội dung bình luận không được để trống." },
        { status: 400 }
      );
    }

    if (content.trim().length > 3000) {
      return NextResponse.json(
        { success: false, error: "Bình luận quá dài (tối đa 3000 ký tự)." },
        { status: 400 }
      );
    }

    const topic = await prisma.tutorialTopic.findFirst({
      where: {
        OR: [{ id: topicIdOrSlug }, { slug: topicIdOrSlug }],
      },
    });

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chuyên đề" },
        { status: 404 }
      );
    }

    const article = await prisma.tutorialArticle.findFirst({
      where: {
        topicId: topic.id,
        slug: articleSlug,
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    const newComment = await prisma.tutorialComment.create({
      data: {
        articleId: article.id,
        userId: user.id ? String(user.id) : null,
        userName: user.name || "Thành viên Lab",
        userEmail: user.email || null,
        userRole: user.role || "user",
        userAvatar: user.avatar || "/images/logo.png",
        content: content.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      data: newComment,
      message: "Đăng bình luận thành công!",
    });
  } catch (error: any) {
    console.error("POST comment error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi gửi bình luận" },
      { status: 500 }
    );
  }
}

// 3. DELETE: Xóa bình luận (chỉ chủ bình luận hoặc admin)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: topicIdOrSlug, slug: articleSlug } = await params;
    const body = await request.json();
    const { commentId, user } = body;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Bạn chưa đăng nhập." },
        { status: 401 }
      );
    }

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID bình luận cần xóa." },
        { status: 400 }
      );
    }

    const comment = await prisma.tutorialComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bình luận." },
        { status: 404 }
      );
    }

    // Kiểm tra quyền xóa: admin hoặc người tạo comment
    const isAdmin = user.role === "admin";
    const isOwner =
      (user.id && comment.userId === String(user.id)) ||
      (user.email && comment.userEmail === user.email);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền xóa bình luận này." },
        { status: 403 }
      );
    }

    await prisma.tutorialComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa bình luận thành công!",
    });
  } catch (error: any) {
    console.error("DELETE comment error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi xóa bình luận" },
      { status: 500 }
    );
  }
}
