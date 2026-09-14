import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureSqliteSchema } from "@/lib/db-auto-migrate";
import { DEFAULT_LAB_COURSES } from "@/lib/courses-store";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/courses/[id] - Get course detail by ID or Slug
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    await ensureSqliteSchema();

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!course) {
      // Tìm trong static default courses
      const staticCourse = DEFAULT_LAB_COURSES.find((c) => c._id === id || c.slug === id);
      if (staticCourse) {
        return NextResponse.json({ success: true, data: staticCourse });
      }
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khóa học" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: course });
  } catch (error: any) {
    console.error("Error fetching course detail from database, trying fallback:", error);
    const staticCourse = DEFAULT_LAB_COURSES.find((c) => c._id === id || c.slug === id);
    if (staticCourse) {
      return NextResponse.json({ success: true, data: staticCourse });
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course details, modules and lessons
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      titleEn,
      slug,
      description,
      descriptionEn,
      level,
      category,
      duration,
      price,
      thumbnail,
      githubRepo,
      featured,
      modules = [],
    } = body;

    const existing = await prisma.course.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { modules: { include: { lessons: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khóa học để cập nhật" },
        { status: 404 }
      );
    }

    // Xóa modules & lessons cũ để tái cấu trúc
    await prisma.courseModule.deleteMany({
      where: { courseId: existing.id },
    });

    const updated = await prisma.course.update({
      where: { id: existing.id },
      data: {
        title: title !== undefined ? title : existing.title,
        titleEn: titleEn !== undefined ? titleEn : (existing as any).titleEn,
        slug: slug !== undefined ? slug : existing.slug,
        description: description !== undefined ? description : existing.description,
        descriptionEn: descriptionEn !== undefined ? descriptionEn : (existing as any).descriptionEn,
        level: level !== undefined ? level : existing.level,
        category: category !== undefined ? category : existing.category,
        duration: duration !== undefined ? duration : existing.duration,
        price: price !== undefined ? price : existing.price,
        thumbnail: thumbnail !== undefined ? thumbnail : existing.thumbnail,
        githubRepo: githubRepo !== undefined ? githubRepo : existing.githubRepo,
        featured: featured !== undefined ? Boolean(featured) : existing.featured,
        modules: {
          create: modules.map((mod: any, index: number) => ({
            module: mod.module || `Chương ${index + 1}`,
            moduleEn: mod.moduleEn || null,
            order: index + 1,
            lessons: {
              create: (mod.lessons || []).map((les: any, lesIdx: number) => ({
                title: les.title,
                titleEn: les.titleEn || null,
                slug: les.slug || `bai-${lesIdx + 1}`,
                duration: les.duration || "20 phút",
                free: les.free !== undefined ? les.free : true,
                summary: les.summary || null,
                summaryEn: les.summaryEn || null,
                contentHtml: les.contentHtml || null,
                contentHtmlEn: les.contentHtmlEn || null,
                contentMarkdown: les.contentMarkdown || null,
                contentMarkdownEn: les.contentMarkdownEn || null,
                videoUrl: les.videoUrl || null,
                codeSnippet: les.codeSnippet || null,
                order: lesIdx + 1,
              })),
            },
          })),
        },
      },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete course
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await prisma.course.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khóa học để xóa" },
        { status: 404 }
      );
    }

    await prisma.course.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, message: "Đã xóa khóa học thành công" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
