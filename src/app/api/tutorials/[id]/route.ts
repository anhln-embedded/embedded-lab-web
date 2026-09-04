import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    const topic = await prisma.tutorialTopic.findFirst({
      where: {
        OR: [{ id: rawId }, { id }, { slug: rawId }, { slug: id }],
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
        id: a.id,
        slug: a.slug,
        title: a.title,
        order: a.order,
        readTime: a.readTime,
        draft: a.draft ?? false,
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
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
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
        OR: [{ id: rawId }, { id }, { slug: rawId }, { slug: id }],
      },
      include: {
        articles: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chuyên đề để cập nhật" },
        { status: 404 }
      );
    }

    // Thuật toán Upsert / Diff-Sync: Giữ nguyên ID của các bài viết cũ để BẢO TOÀN LỊCH SỬ CHỈNH SỬA (ArticleEditHistory)
    const existingArticles = existing.articles;
    const retainedArticleIds: string[] = [];
    const usedSlugs = new Set<string>();

    for (let idx = 0; idx < posts.length; idx++) {
      const p = posts[idx];
      let articleSlug = (p.slug || "").trim().toLowerCase();
      if (!articleSlug) {
        articleSlug = `bai-${idx + 1}`;
      }
      if (usedSlugs.has(articleSlug)) {
        articleSlug = `${articleSlug}-${idx + 1}`;
      }
      usedSlugs.add(articleSlug);

      // Tìm bài viết cũ khớp theo ID hoặc Slug
      const match = existingArticles.find(
        (ea) => (p.id && ea.id === p.id) || ea.slug === articleSlug || ea.slug === p.slug
      );

      const articleData = {
        title: p.title || `Bài ${idx + 1}`,
        slug: articleSlug,
        readTime: p.readTime || "10 phút",
        summary: p.summary || "",
        contentHtml: p.contentHtml || "",
        codeSnippet: p.codeSnippet?.code || p.codeSnippet || null,
        codeLang: p.codeSnippet?.language || p.codeLang || "c",
        codeFilename: p.codeSnippet?.filename || p.codeFilename || "main.c",
        order: idx + 1,
        draft: Boolean(p.draft),
      };

      let processedArt;
      try {
        if (match) {
          // CẬP NHẬT bài viết hiện có -> Giữ nguyên ID và bảo toàn ArticleEditHistory
          processedArt = await prisma.tutorialArticle.update({
            where: { id: match.id },
            data: articleData,
          });
        } else {
          // TẠO MỚI bài viết
          processedArt = await prisma.tutorialArticle.create({
            data: {
              ...articleData,
              topicId: existing.id,
            },
          });
        }
      } catch (artErr: any) {
        if (artErr?.message && artErr.message.includes("draft")) {
          const { draft, ...fallbackData } = articleData;
          if (match) {
            processedArt = await prisma.tutorialArticle.update({
              where: { id: match.id },
              data: fallbackData,
            });
          } else {
            processedArt = await prisma.tutorialArticle.create({
              data: {
                ...fallbackData,
                topicId: existing.id,
              },
            });
          }
        } else {
          throw artErr;
        }
      }
      retainedArticleIds.push(processedArt.id);
    }

    // Xóa những bài viết cũ mà người dùng đã chủ động bỏ khỏi chuyên đề
    const articlesToDelete = existingArticles.filter((ea) => !retainedArticleIds.includes(ea.id));
    if (articlesToDelete.length > 0) {
      const deleteIds = articlesToDelete.map((a) => a.id);
      await prisma.articleEditHistory.deleteMany({
        where: { articleId: { in: deleteIds } },
      });
      await prisma.tutorialArticle.deleteMany({
        where: { id: { in: deleteIds } },
      });
    }

    // Cập nhật thông tin chuyên đề
    const updated = await prisma.tutorialTopic.update({
      where: { id: existing.id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(category !== undefined && { category }),
        ...(categoryName !== undefined && { categoryName }),
        ...(icon !== undefined && { icon }),
        ...(badge !== undefined && { badge }),
        ...(level !== undefined && { level }),
        ...(description !== undefined && { description }),
        ...(author !== undefined && { author }),
        ...(authorTitle !== undefined && { authorTitle }),
        ...(coverImage !== undefined && { coverImage }),
      },
      include: {
        articles: {
          orderBy: { order: "asc" },
        },
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
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    const existing = await prisma.tutorialTopic.findFirst({
      where: {
        OR: [{ id: rawId }, { id }, { slug: rawId }, { slug: id }],
      },
      include: {
        articles: {
          select: { id: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: true, message: "Chuyên đề đã được dọn sạch" });
    }

    const articleIds = existing.articles.map((a) => a.id);

    // 1. Xóa toàn bộ lịch sử sửa bài của các bài viết trong chuyên đề
    if (articleIds.length > 0) {
      await prisma.articleEditHistory.deleteMany({
        where: {
          articleId: { in: articleIds },
        },
      });
    }

    // 2. Xóa toàn bộ bài viết trong chuyên đề
    await prisma.tutorialArticle.deleteMany({
      where: {
        topicId: existing.id,
      },
    });

    // 3. Xóa chuyên đề chính
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
