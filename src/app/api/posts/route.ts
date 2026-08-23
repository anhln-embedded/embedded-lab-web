import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/posts - Fetch all posts (support filtering by tag, postType, search)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const postType = searchParams.get("postType");
    const search = searchParams.get("search");
    const draft = searchParams.get("draft");

    const where: any = {};

    if (draft === "true") {
      where.draft = true;
    } else if (draft === "false") {
      where.draft = false;
    }

    if (postType && postType !== "all") {
      where.postType = postType;
    }

    if (tag) {
      where.tags = {
        contains: tag,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: [
        { pinned: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      contentHtml,
      coverImage,
      coverAlt,
      postType = "technical",
      tags = "embedded",
      series,
      seriesOrder,
      readingTime = 5,
      featured = false,
      pinned = false,
      draft = false,
      authorName = "Embedded-AIoT Lab PTIT",
      authorTitle = "Kỹ sư Lab PTIT",
      authorAvatar = "/images/logo.png",
      facebookPostUrl,
      githubUrl,
      demoUrl,
    } = body;

    if (!title || !excerpt || !contentHtml) {
      return NextResponse.json(
        { success: false, error: "Vui lòng điền đầy đủ Tiêu đề, Tóm tắt và Nội dung bài viết." },
        { status: 400 }
      );
    }

    const finalSlug =
      slug?.trim() ||
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`;

    // Ensure slug uniqueness
    const existing = await prisma.post.findUnique({ where: { slug: finalSlug } });
    const uniqueSlug = existing ? `${finalSlug}-${Date.now().toString().slice(-4)}` : finalSlug;

    const post = await prisma.post.create({
      data: {
        title,
        slug: uniqueSlug,
        excerpt,
        contentHtml,
        coverImage: coverImage || "/images/logo.png",
        coverAlt: coverAlt || title,
        postType,
        tags: Array.isArray(tags) ? tags.join(",") : tags,
        series: series || null,
        seriesOrder: seriesOrder ? Number(seriesOrder) : null,
        readingTime: Number(readingTime) || 5,
        featured: Boolean(featured),
        pinned: Boolean(pinned),
        draft: Boolean(draft),
        authorName,
        authorTitle,
        authorAvatar,
        facebookPostUrl: facebookPostUrl || null,
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
