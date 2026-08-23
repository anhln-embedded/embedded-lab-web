import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id] - Get post by ID or Slug
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    // Increment view count asynchronously
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error("Error fetching post detail:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.post.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết để cập nhật" },
        { status: 404 }
      );
    }

    const {
      title,
      slug,
      excerpt,
      contentHtml,
      coverImage,
      coverAlt,
      postType,
      tags,
      series,
      seriesOrder,
      readingTime,
      featured,
      pinned,
      draft,
      authorName,
      authorTitle,
      authorAvatar,
      facebookPostUrl,
      githubUrl,
      demoUrl,
    } = body;

    const updated = await prisma.post.update({
      where: { id: existing.id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(contentHtml !== undefined && { contentHtml }),
        ...(coverImage !== undefined && { coverImage }),
        ...(coverAlt !== undefined && { coverAlt }),
        ...(postType !== undefined && { postType }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags.join(",") : tags }),
        ...(series !== undefined && { series }),
        ...(seriesOrder !== undefined && { seriesOrder: seriesOrder ? Number(seriesOrder) : null }),
        ...(readingTime !== undefined && { readingTime: Number(readingTime) }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(pinned !== undefined && { pinned: Boolean(pinned) }),
        ...(draft !== undefined && { draft: Boolean(draft) }),
        ...(authorName !== undefined && { authorName }),
        ...(authorTitle !== undefined && { authorTitle }),
        ...(authorAvatar !== undefined && { authorAvatar }),
        ...(facebookPostUrl !== undefined && { facebookPostUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(demoUrl !== undefined && { demoUrl }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.post.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết để xóa" },
        { status: 404 }
      );
    }

    await prisma.post.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa bài viết thành công",
    });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}
