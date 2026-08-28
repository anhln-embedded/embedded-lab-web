import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TUTORIAL_TOPICS } from "@/lib/tutorials-data";

export async function GET() {
  try {
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
      authorTitle: t.authorTitle || "Mentor Lab",
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
    return NextResponse.json({ success: true, data: [] });
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
      author = "Kỹ sư Lab PTIT",
      authorTitle = "Mentor Lab",
      coverImage = "/images/logo.png",
      posts = [],
    } = body;

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
          coverImage,
          articles: {
            create: sanitizedArticles,
          },
        },
        include: {
          articles: true,
        },
      });
    } catch (createErr: any) {
      if (createErr?.message && createErr.message.includes("draft")) {
        // Fallback: Nếu runtime in-memory của Prisma chưa load kịp schema mới
        const fallbackArticles = sanitizedArticles.map(({ draft, ...rest }: any) => rest);
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
        throw createErr;
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
