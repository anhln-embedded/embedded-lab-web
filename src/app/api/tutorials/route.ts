import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TUTORIAL_TOPICS } from "@/lib/tutorials-data";
import { ensureTutorialSchema } from "@/lib/db-sync";

export async function GET() {
  try {
    await ensureTutorialSchema();
    const topics = await prisma.tutorialTopic.findMany({
      include: {
        articles: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    const formatted = topics.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      category: t.category as any,
      categoryName: t.categoryName,
      icon: t.icon,
      badge: t.badge || "Hot Series",
      level: t.level as any,
      description: t.description,
      totalArticles: t.articles.length,
      author: t.author,
      authorTitle: t.authorTitle || "",
      authorAvatar: (t as any).authorAvatar || (t.articles[0] as any)?.authorAvatar || "/images/logo.png",
      coverImage: t.coverImage || "/images/logo.png",
      posts: t.articles.map((a) => ({
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
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("GET /api/tutorials error:", error);
    try {
      const basicTopics = await prisma.tutorialTopic.findMany({
        orderBy: { order: "asc" },
      });
      const fallbackData = basicTopics.map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        category: t.category as any,
        categoryName: t.categoryName,
        icon: t.icon,
        badge: t.badge || "Hot Series",
        level: t.level as any,
        description: t.description,
        totalArticles: 0,
        author: t.author,
        authorTitle: t.authorTitle || "",
        authorAvatar: (t as any).authorAvatar || "/images/logo.png",
        coverImage: t.coverImage || "/images/logo.png",
        posts: [],
      }));
      return NextResponse.json({ success: true, data: fallbackData });
    } catch {
      return NextResponse.json({ success: false, data: [], error: error?.message || "Failed to fetch tutorials" });
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      category = "linux",
      categoryName = "Embedded Linux",
      icon = "🐧",
      badge = "Hot Series",
      level = "Intermediate",
      description,
      author = "Lưu Ngọc Anh",
      authorTitle = "",
      authorAvatar = "/images/logo.png",
      authorEmail,
      authorId,
      authorRole,
      coverImage = "/images/logo.png",
      posts = [],
    } = body;

    const headerEmail = request.headers.get("x-user-email");
    const headerId = request.headers.get("x-user-id");
    const headerRole = request.headers.get("x-user-role");

    const finalAuthorEmail = authorEmail || headerEmail || null;
    const finalAuthorId = authorId || headerId || null;
    const finalAuthorRole = authorRole || headerRole || "admin";

    if (!title || !slug || !description) {
      return NextResponse.json(
        { success: false, error: "Vui lòng điền đủ Tiêu đề, Slug và Mô tả chuyên đề." },
        { status: 400 }
      );
    }

    // Kiểm tra trùng lặp topic slug
    const existingTopic = await prisma.tutorialTopic.findUnique({
      where: { slug },
    });

    const finalTopicSlug = existingTopic ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    // Đảm bảo slug của từng bài viết trong topic là DUY NHẤT (tránh lỗi @@unique([topicId, slug]))
    const usedSlugs = new Set<string>();
    const sanitizedArticles = posts.map((p: any, idx: number) => {
      let articleSlug = (p.slug || "").trim().toLowerCase();
      if (!articleSlug) {
        articleSlug = `bai-${idx + 1}`;
      }

      // Nếu đã có slug này trong danh sách bài viết cùng topic, thêm hậu tố số thứ tự
      if (usedSlugs.has(articleSlug)) {
        articleSlug = `${articleSlug}-${idx + 1}`;
      }
      usedSlugs.add(articleSlug);

      return {
        title: p.title || `Bài ${idx + 1}`,
        slug: articleSlug,
        readTime: p.readTime || "10 phút",
        summary: p.summary || "",
        contentHtml: p.contentHtml || "",
        codeSnippet: p.codeSnippet?.code || p.codeSnippet || null,
        codeLang: p.codeSnippet?.language || p.codeLang || "c",
        codeFilename: p.codeSnippet?.filename || p.codeFilename || "main.c",
        order: idx + 1,
      };
    });

    const maxOrderTopic = await prisma.tutorialTopic.aggregate({ _max: { order: true } }).catch(() => ({ _max: { order: 0 } }));

    let created;
    try {
      created = await prisma.tutorialTopic.create({
        data: {
          title,
          slug: finalTopicSlug,
          category,
          categoryName,
          icon,
          badge,
          level,
          description,
          author,
          authorTitle,
          authorAvatar,
          authorEmail: finalAuthorEmail,
          authorId: finalAuthorId,
          authorRole: finalAuthorRole,
          coverImage,
          order: (maxOrderTopic?._max?.order ?? 0) + 1,
          articles: {
            create: sanitizedArticles,
          },
        } as any,
        include: {
          articles: true,
        },
      });
    } catch (createErr: any) {
      console.warn("Lần tạo đầu tiên gặp lỗi, đang thử tự động đồng bộ schema và retry:", createErr?.message);
      // Buộc đồng bộ lại schema lần nữa nếu server vừa khởi tạo
      await ensureTutorialSchema();

      try {
        created = await prisma.tutorialTopic.create({
          data: {
            title,
            slug: finalTopicSlug,
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
              create: sanitizedArticles,
            },
          },
          include: {
            articles: true,
          },
        });
      } catch (retryErr: any) {
        // Nếu vẫn lỗi do runtime Prisma client cũ hoặc SQLite column
        if (
          retryErr?.message &&
          (retryErr.message.includes("authorName") ||
            retryErr.message.includes("draft") ||
            retryErr.message.includes("does not exist"))
        ) {
          const fallbackArticles = sanitizedArticles.map(
            ({ draft, authorName, authorTitle, authorAvatar, ...rest }: any) => rest
          );
          created = await prisma.tutorialTopic.create({
            data: {
              title,
              slug: finalTopicSlug,
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
                create: fallbackArticles,
              },
            },
            include: {
              articles: true,
            },
          });
        } else {
          throw retryErr;
        }
      }
    }

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("POST /api/tutorials error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi tạo chuyên đề mới" },
      { status: 500 }
    );
  }
}
