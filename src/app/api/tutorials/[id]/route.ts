import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const topic = await prisma.tutorialTopic.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        articles: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chuyên đề" },
        { status: 404 }
      );
    }

    const formatted = {
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      category: topic.category,
      categoryName: topic.categoryName,
      icon: topic.icon,
      badge: topic.badge || "Hot Series",
      level: topic.level,
      description: topic.description,
      totalArticles: topic.articles.length,
      author: topic.author,
      authorTitle: topic.authorTitle || "Mentor Lab",
      coverImage: topic.coverImage || "/images/logo.png",
      posts: topic.articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        order: a.order,
        readTime: a.readTime,
        updatedAt: a.updatedAt.toISOString().split("T")[0],
        summary: a.summary || "",
        contentHtml: a.contentHtml || "",
        codeSnippet: a.codeSnippet
          ? {
              code: a.codeSnippet,
              language: a.codeLang || "c",
              filename: a.codeFilename || "main.c",
            }
          : undefined,
      })),
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("GET /api/tutorials/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lấy thông tin chuyên đề" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      category,
      categoryName,
      icon,
      badge,
      level,
      description,
      author,
      authorTitle,
      coverImage,
      posts = [],
    } = body;

    const existing = await prisma.tutorialTopic.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chuyên đề để cập nhật" },
        { status: 404 }
      );
    }

    // Xóa các article cũ và tạo lại danh sách mới
    await prisma.tutorialArticle.deleteMany({
      where: { topicId: existing.id },
    });

    const updated = await prisma.tutorialTopic.update({
      where: { id: existing.id },
      data: {
        title,
        slug,
        category,
        categoryName,
        icon,
        badge,
        level,
        description,
        author,
        authorTitle,
        coverImage,
        articles: {
          create: posts.map((p: any, idx: number) => ({
            title: p.title,
            slug: p.slug || `bai-${idx + 1}`,
            readTime: p.readTime || "10 phút",
            summary: p.summary || "",
            contentHtml: p.contentHtml || "",
            codeSnippet: p.codeSnippet?.code || p.codeSnippet || null,
            codeLang: p.codeSnippet?.language || "c",
            codeFilename: p.codeSnippet?.filename || "main.c",
            order: idx + 1,
          })),
        },
      },
      include: {
        articles: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/tutorials/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi cập nhật chuyên đề" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await prisma.tutorialTopic.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chuyên đề để xóa" },
        { status: 404 }
      );
    }

    await prisma.tutorialTopic.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa chuyên đề thành công" });
  } catch (error: any) {
    console.error("DELETE /api/tutorials/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xóa chuyên đề" },
      { status: 500 }
    );
  }
}
