import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/discussions - Lấy danh sách bài viết từ database SQLite
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const flair = searchParams.get("flair");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "hot";

    const where: any = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (flair && flair !== "all") {
      where.flair = flair;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
        { author: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    // Sắp xếp
    let orderBy: any[] = [{ isPinned: "desc" }];
    if (sort === "new") {
      orderBy.push({ createdAt: "desc" });
    } else if (sort === "top") {
      orderBy.push({ votes: "desc" });
    } else {
      // Default: lastActivity hoặc createdAt
      orderBy.push({ lastActivity: "desc" });
    }

    const threads = await prisma.discussionThread.findMany({
      where,
      orderBy,
    });

    // Format kết quả trả về cho client
    const formatted = threads.map((t) => {
      let reactions = { ung: 0, gach: 0, ung_bung: 0, haha: 0, nguong_mo: 0 };
      try {
        if (t.reactions) reactions = JSON.parse(t.reactions);
      } catch {}

      let attachedFiles = [];
      try {
        if (t.attachedFiles) attachedFiles = JSON.parse(t.attachedFiles);
      } catch {}

      let tags = [];
      try {
        if (t.tags) tags = JSON.parse(t.tags);
      } catch {}

      return {
        id: t.id,
        title: t.title,
        category: t.category,
        flair: t.flair,
        author: t.author,
        authorId: t.authorId,
        authorRole: t.authorRole,
        authorAvatar: t.authorAvatar,
        authorTitle: t.authorTitle,
        content: t.content,
        codeSnippet: t.codeSnippet || undefined,
        attachedFiles,
        hasSimulatorPreview: t.hasSimulatorPreview,
        simulatorCode: t.simulatorCode || undefined,
        votes: t.votes,
        viewsCount: t.viewsCount,
        repliesCount: t.repliesCount,
        reactions,
        isPinned: t.isPinned,
        createdAt: t.createdAt.toISOString(),
        lastActivity: t.lastActivity.toISOString(),
        tags,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách thảo luận:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch discussions" },
      { status: 500 }
    );
  }
}

// POST /api/discussions - Tạo mới chủ đề thảo luận trong database SQLite
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category = "embedded-mcu",
      flair = "thao-luan",
      content,
      codeSnippet,
      attachedFiles = [],
      hasSimulatorPreview = false,
      simulatorCode,
      tags = [],
      author,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề không được để trống" },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Nội dung không được để trống" },
        { status: 400 }
      );
    }

    if (!author || !author.name) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin tác giả" },
        { status: 400 }
      );
    }

    let authorTitle = "Thành viên";
    if (author.role === "superadmin") authorTitle = "Quản trị viên";
    else if (author.role === "admin") authorTitle = "Điều hành viên";
    else if (author.role === "lab_member") authorTitle = "Thành viên tích cực";

    const defaultReactions = { ung: 1, gach: 0, ung_bung: 0, haha: 0, nguong_mo: 0 };

    const newThread = await prisma.discussionThread.create({
      data: {
        title: title.trim(),
        category,
        flair,
        author: author.name,
        authorId: author.id || "guest",
        authorRole: author.role || "user",
        authorAvatar: author.avatar || "👤",
        authorTitle,
        content: content.trim(),
        codeSnippet: codeSnippet ? codeSnippet.trim() : null,
        attachedFiles: JSON.stringify(attachedFiles),
        hasSimulatorPreview: Boolean(hasSimulatorPreview),
        simulatorCode: simulatorCode || null,
        votes: 1,
        viewsCount: 1,
        repliesCount: 0,
        reactions: JSON.stringify(defaultReactions),
        isPinned: false,
        tags: JSON.stringify(tags && tags.length > 0 ? tags : ["thao-luan"]),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newThread.id,
        title: newThread.title,
        category: newThread.category,
        flair: newThread.flair,
        author: newThread.author,
        authorId: newThread.authorId,
        authorRole: newThread.authorRole,
        authorAvatar: newThread.authorAvatar,
        authorTitle: newThread.authorTitle,
        content: newThread.content,
        codeSnippet: newThread.codeSnippet || undefined,
        attachedFiles,
        hasSimulatorPreview: newThread.hasSimulatorPreview,
        simulatorCode: newThread.simulatorCode || undefined,
        votes: newThread.votes,
        userVote: 1,
        viewsCount: newThread.viewsCount,
        repliesCount: newThread.repliesCount,
        reactions: defaultReactions,
        userReactions: ["ung"],
        isPinned: newThread.isPinned,
        createdAt: newThread.createdAt.toISOString(),
        lastActivity: newThread.lastActivity.toISOString(),
        tags: tags && tags.length > 0 ? tags : ["thao-luan"],
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo chủ đề thảo luận:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create discussion" },
      { status: 500 }
    );
  }
}
