import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/courses - List all courses with modules and lessons
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");

    const where: any = {};
    if (category && category !== "all") where.category = category;
    if (level && level !== "all") where.level = level;

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      level = "intermediate",
      category = "embedded-rtos",
      duration = "6 hours",
      price = "free",
      thumbnail = "/images/logo.png",
      githubRepo,
      featured = false,
      modules = [],
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên và mô tả khóa học." },
        { status: 400 }
      );
    }

    const finalSlug =
      slug?.trim() ||
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-");

    const course = await prisma.course.create({
      data: {
        title,
        slug: finalSlug,
        description,
        level,
        category,
        duration,
        price,
        thumbnail,
        githubRepo: githubRepo || null,
        featured: Boolean(featured),
        modules: {
          create: modules.map((mod: any, index: number) => ({
            module: mod.module || `Chương ${index + 1}`,
            order: index + 1,
            lessons: {
              create: (mod.lessons || []).map((les: any, lesIdx: number) => ({
                title: les.title,
                slug: les.slug || `bai-${lesIdx + 1}`,
                duration: les.duration || "15 phút",
                free: les.free !== undefined ? les.free : true,
                summary: les.summary || null,
                contentHtml: les.contentHtml || null,
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

    return NextResponse.json({ success: true, data: course }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
