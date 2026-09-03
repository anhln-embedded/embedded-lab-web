import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string; slug: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: topicIdOrSlug, slug: articleSlug } = await params;
    const body = await request.json();
    const { historyId, user } = body;

    if (!historyId) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID bản ghi lịch sử" },
        { status: 400 }
      );
    }

    // Tìm lịch sử cần khôi phục
    const history = await (prisma as any).articleEditHistory.findUnique({
      where: { id: historyId },
    });

    if (!history) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy phiên bản lịch sử này" },
        { status: 404 }
      );
    }

    // Cập nhật lại bài viết với dữ liệu snapshot của bản lịch sử
    const updatedArticle = await prisma.tutorialArticle.update({
      where: { id: history.articleId },
      data: {
        title: history.title,
        readTime: history.readTime || "10 phút",
        summary: history.summary,
        contentHtml: history.contentHtml,
        codeSnippet: history.codeSnippet,
        codeLang: history.codeLang || "c",
        codeFilename: history.codeFilename || "main.c",
        updatedAt: new Date(),
      },
    });

    // Ghi nhận một bản ghi lịch sử mới: "Khôi phục về phiên bản ngày ..."
    await (prisma as any).articleEditHistory.create({
      data: {
        articleId: history.articleId,
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
        changeSummary: `Khôi phục về phiên bản ngày ${new Date(history.createdAt).toLocaleString("vi-VN")}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedArticle,
      message: "Khôi phục phiên bản bài viết thành công!",
    });
  } catch (error: any) {
    console.error("POST /api/tutorials/[id]/articles/[slug]/restore error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khôi phục phiên bản" },
      { status: 500 }
    );
  }
}
