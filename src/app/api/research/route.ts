import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEFAULT_RESEARCH_PAPERS } from "@/lib/research-store";

// GET /api/research - Lấy danh sách bài báo nghiên cứu khoa học
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const year = searchParams.get("year");
    const field = searchParams.get("field");
    const search = searchParams.get("search");

    const where: any = {};

    if (type && type !== "all") {
      where.publicationType = type;
    }

    if (year && year !== "all") {
      const yearNum = parseInt(year, 10);
      if (!isNaN(yearNum)) {
        where.year = yearNum;
      }
    }

    if (field && field !== "all" && field !== "Tất cả lĩnh vực") {
      where.field = field;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { authors: { contains: search } },
        { venue: { contains: search } },
        { abstract: { contains: search } },
        { keywords: { contains: search } },
      ];
    }

    let papers = await prisma.researchPaper.findMany({
      where,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    });

    // 1. Kiểm tra danh sách các ID đã bị xóa
    let deletedIds: string[] = [];
    try {
      const deletedSetting = await prisma.systemSetting.findUnique({
        where: { key: "deleted_research_ids" },
      });
      if (deletedSetting) {
        deletedIds = JSON.parse(deletedSetting.value);
      }
    } catch (e) {
      // Bỏ qua nếu bảng chưa sẵn sàng
    }

    // 2. Chỉ seed một lần duy nhất khi hệ thống mới tinh (chưa từng seed)
    try {
      const isSeeded = await prisma.systemSetting.findUnique({
        where: { key: "research_papers_seeded" },
      });

      if (!isSeeded && papers.length === 0 && !type && !year && !field && !search) {
        for (const item of DEFAULT_RESEARCH_PAPERS) {
          if (deletedIds.includes(item.id)) continue;
          await prisma.researchPaper.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              title: item.title,
              slug: item.slug || item.id,
              authors: item.authors,
              labAuthors: item.labAuthors ? JSON.stringify(item.labAuthors) : null,
              publicationType: item.publicationType,
              venue: item.venue,
              year: item.year,
              month: item.month,
              volume: item.volume,
              doi: item.doi,
              doiUrl: item.doiUrl,
              pdfUrl: item.pdfUrl,
              codeUrl: item.codeUrl,
              demoUrl: item.demoUrl,
              abstract: item.abstract,
              keywords: item.keywords.join(", "),
              field: item.field,
              badge: item.badge,
              citationCount: item.citationCount || 0,
              bibtex: item.bibtex,
              status: item.status,
              featured: item.featured || false,
              createdAt: new Date(item.createdAt),
            },
          });
        }
        await prisma.systemSetting.upsert({
          where: { key: "research_papers_seeded" },
          update: { value: "true" },
          create: { key: "research_papers_seeded", value: "true" },
        });
        papers = await prisma.researchPaper.findMany({
          where,
          orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        });
      }
    } catch (seedErr) {
      console.warn("Lỗi khi auto-seed research papers:", seedErr);
    }

    // 3. Loại bỏ triệt để các bài báo đã bị xóa
    if (deletedIds.length > 0) {
      papers = papers.filter(
        (p) => !deletedIds.includes(p.id) && !deletedIds.includes(p.slug || "")
      );
    }

    // Format output
    const formatted = papers.map((p) => ({
      ...p,
      keywords: typeof p.keywords === "string" ? p.keywords.split(",").map((k) => k.trim()) : [],
      labAuthors: p.labAuthors ? JSON.parse(p.labAuthors) : undefined,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách bài báo nghiên cứu:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch research papers" },
      { status: 500 }
    );
  }
}

// POST /api/research - Thêm mới hoặc cập nhật bài báo nghiên cứu khoa học
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      slug,
      authors,
      labAuthors,
      publicationType,
      venue,
      year,
      month,
      volume,
      doi,
      doiUrl,
      pdfUrl,
      codeUrl,
      demoUrl,
      abstract,
      keywords,
      field,
      badge,
      citationCount,
      bibtex,
      status,
      featured,
    } = body;

    if (!title || !authors || !venue) {
      return NextResponse.json(
        { success: false, error: "Vui lòng điền đầy đủ Tiêu đề, Tác giả và Tên tạp chí/hội nghị." },
        { status: 400 }
      );
    }

    const paperId = id || `paper-${Date.now()}`;
    const keywordsStr = Array.isArray(keywords) ? keywords.join(", ") : keywords || "";
    const labAuthorsStr = Array.isArray(labAuthors) ? JSON.stringify(labAuthors) : labAuthors || null;

    const saved = await prisma.researchPaper.upsert({
      where: { id: paperId },
      update: {
        title,
        slug: slug || paperId,
        authors,
        labAuthors: labAuthorsStr,
        publicationType: publicationType || "journal",
        venue,
        year: typeof year === "number" ? year : parseInt(year, 10) || new Date().getFullYear(),
        month: month || null,
        volume: volume || null,
        doi: doi || null,
        doiUrl: doiUrl || null,
        pdfUrl: pdfUrl || null,
        codeUrl: codeUrl || null,
        demoUrl: demoUrl || null,
        abstract: abstract || "",
        keywords: keywordsStr,
        field: field || "Edge AI & TinyML",
        badge: badge || null,
        citationCount: typeof citationCount === "number" ? citationCount : 0,
        bibtex: bibtex || null,
        status: status || "published",
        featured: Boolean(featured),
      },
      create: {
        id: paperId,
        title,
        slug: slug || paperId,
        authors,
        labAuthors: labAuthorsStr,
        publicationType: publicationType || "journal",
        venue,
        year: typeof year === "number" ? year : parseInt(year, 10) || new Date().getFullYear(),
        month: month || null,
        volume: volume || null,
        doi: doi || null,
        doiUrl: doiUrl || null,
        pdfUrl: pdfUrl || null,
        codeUrl: codeUrl || null,
        demoUrl: demoUrl || null,
        abstract: abstract || "",
        keywords: keywordsStr,
        field: field || "Edge AI & TinyML",
        badge: badge || null,
        citationCount: typeof citationCount === "number" ? citationCount : 0,
        bibtex: bibtex || null,
        status: status || "published",
        featured: Boolean(featured),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...saved,
        keywords: saved.keywords.split(",").map((k) => k.trim()),
        labAuthors: saved.labAuthors ? JSON.parse(saved.labAuthors) : undefined,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Lỗi lưu bài báo nghiên cứu:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save research paper" },
      { status: 500 }
    );
  }
}
