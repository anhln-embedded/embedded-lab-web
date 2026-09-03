import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string; slug: string }>;
}

// 1. GET: Lấy thông tin bài viết và toàn bộ lịch sử chỉnh sửa
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: topicIdOrSlug, slug: articleSlug } = await params;

    // Tìm chuyên đề trước
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

    // Tìm bài viết
    const article = await prisma.tutorialArticle.findFirst({
      where: {
        topicId: topic.id,
        slug: articleSlug,
      },
      include: {
        editHistories: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        readTime: article.readTime,
        summary: article.summary,
        contentHtml: article.contentHtml,
        codeSnippet: article.codeSnippet,
        codeLang: article.codeLang,
        codeFilename: article.codeFilename,
        order: article.order,
        draft: article.draft ?? false,
        updatedAt: article.updatedAt,
        histories: article.editHistories || [],
      },
    });
  } catch (error: any) {
    console.error("GET /api/tutorials/[id]/articles/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lấy dữ liệu bài viết" },
      { status: 500 }
    );
  }
}

// 2. PUT: Chỉnh sửa nhanh bài viết và ghi lịch sử chỉnh sửa của User
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id: topicIdOrSlug, slug: articleSlug } = await params;
    const body = await request.json();
    const {
      title,
      readTime,
      summary,
      contentHtml,
      codeSnippet,
      codeLang = "c",
      codeFilename = "main.c",
      draft,
      changeSummary = "Cập nhật nội dung bài viết",
      user, // Thông tin người dùng đang sửa
    } = body;

    // Tìm chuyên đề
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

    // Tìm bài viết hiện tại
    const currentArticle = await prisma.tutorialArticle.findFirst({
      where: {
        topicId: topic.id,
        slug: articleSlug,
      },
    });

    if (!currentArticle) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết để chỉnh sửa" },
        { status: 404 }
      );
    }

    // 1. Cập nhật bài viết
    const articleData = {
      title: title !== undefined ? title : currentArticle.title,
      readTime: readTime !== undefined ? readTime : currentArticle.readTime,
      summary: summary !== undefined ? summary : currentArticle.summary,
      contentHtml: contentHtml !== undefined ? contentHtml : currentArticle.contentHtml,
      codeSnippet: codeSnippet !== undefined ? codeSnippet : currentArticle.codeSnippet,
      codeLang: codeLang !== undefined ? codeLang : currentArticle.codeLang,
      codeFilename: codeFilename !== undefined ? codeFilename : currentArticle.codeFilename,
      draft: draft !== undefined ? Boolean(draft) : currentArticle.draft,
      updatedAt: new Date(),
    };

    let updatedArticle;
    try {
      updatedArticle = await prisma.tutorialArticle.update({
        where: { id: currentArticle.id },
        data: articleData,
      });
    } catch (artErr: any) {
      if (artErr?.message && artErr.message.includes("draft")) {
        const { draft: _, ...fallbackData } = articleData;
        updatedArticle = await prisma.tutorialArticle.update({
          where: { id: currentArticle.id },
          data: fallbackData,
        });
      } else {
        throw artErr;
      }
    }

    // 2. Ghi lịch sử chỉnh sửa vào bảng ArticleEditHistory
    const editHistory = await (prisma as any).articleEditHistory.create({
      data: {
        articleId: currentArticle.id,
        userId: user?.id || null,
        userName: user?.name || "Ban Quản Trị Lab",
        userEmail: user?.email || "anhln.embedded@gmail.com",
        userRole: user?.role || "admin",
        userAvatar: user?.avatar || "/images/logo.png",
        title: updatedArticle.title,
        readTime: updatedArticle.readTime,
        summary: updatedArticle.summary,
        contentHtml: updatedArticle.contentHtml,
        codeSnippet: updatedArticle.codeSnippet,
        codeLang: updatedArticle.codeLang,
        codeFilename: updatedArticle.codeFilename,
        changeSummary: changeSummary || "Cập nhật bài viết",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        article: updatedArticle,
        history: editHistory,
      },
      message: "Cập nhật bài viết và lưu lịch sử thành công!",
    });
  } catch (error: any) {
    console.error("PUT /api/tutorials/[id]/articles/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi cập nhật bài viết" },
      { status: 500 }
    );
  }
}
