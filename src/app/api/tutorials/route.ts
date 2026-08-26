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

    if (topics && topics.length > 0) {
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
      }));
      return NextResponse.json({ success: true, data: formatted });
    }

    return NextResponse.json({ success: true, data: TUTORIAL_TOPICS });
  } catch (error: any) {
    console.error("GET /api/tutorials error:", error);
    return NextResponse.json({ success: true, data: TUTORIAL_TOPICS });
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

    const created = await prisma.tutorialTopic.create({
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

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("POST /api/tutorials error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi tạo chuyên đề mới" },
      { status: 500 }
    );
  }
}
