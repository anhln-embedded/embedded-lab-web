import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { allPosts, allCourses } from "@/lib/content";

export type SearchResultType = "tutorial" | "lesson" | "course" | "blog" | "research";

export interface SearchResultItem {
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  tags: string[];
  date?: string;
  breadcrumb?: string;
  matchField?: "title" | "summary" | "content" | "code" | "tags";
  matchSnippet?: string;
  score: number;
}

/**
 * Trích xuất đoạn trích dẫn (snippet) chứa từ khóa từ văn bản thuần hoặc HTML / Markdown
 */
function extractContextSnippet(
  rawContent: string | null | undefined,
  query: string,
  maxLength: number = 150
): string | null {
  if (!rawContent || !query) return null;

  // Lược bỏ HTML tags & Markdown formatting
  const cleanText = rawContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```[a-z]*\n?/gi, "").replace(/```/g, ""))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_\-~>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const lowerText = cleanText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) return null;

  const half = Math.floor(maxLength / 2);
  let start = Math.max(0, matchIndex - half);
  let end = Math.min(cleanText.length, matchIndex + query.length + half);

  // Điều chỉnh start đến ranh giới từ gần nhất
  if (start > 0) {
    const spaceIndex = cleanText.indexOf(" ", start);
    if (spaceIndex !== -1 && spaceIndex < matchIndex) {
      start = spaceIndex + 1;
    }
  }

  // Điều chỉnh end đến ranh giới từ gần nhất
  if (end < cleanText.length) {
    const spaceIndex = cleanText.lastIndexOf(" ", end);
    if (spaceIndex > matchIndex + query.length) {
      end = spaceIndex;
    }
  }

  let snippet = cleanText.substring(start, end).trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < cleanText.length) snippet = snippet + "...";

  return snippet;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";
    const query = rawQuery.trim();
    const type = (searchParams.get("type") || "all").toLowerCase();
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);

    if (!query) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const lowerQuery = query.toLowerCase();
    const results: SearchResultItem[] = [];

    // Helper tính điểm liên quan
    const calcScore = (
      title: string,
      summary: string | null | undefined,
      contentMatch: boolean,
      codeMatch: boolean
    ) => {
      const lowerTitle = title.toLowerCase();
      let score = 0;

      if (lowerTitle === lowerQuery) {
        score += 200; // Khớp chính xác hoàn toàn tiêu đề
      } else if (lowerTitle.startsWith(lowerQuery)) {
        score += 150;
      } else if (lowerTitle.includes(lowerQuery)) {
        score += 100; // Khớp trong tiêu đề
      }

      if (summary && summary.toLowerCase().includes(lowerQuery)) {
        score += 50; // Khớp trong tóm tắt
      }

      if (codeMatch) {
        score += 35; // Khớp trong khối mã nguồn code snippet
      }

      if (contentMatch) {
        score += 25; // Khớp sâu trong phần thân nội dung bài viết
      }

      return score;
    };

    // 1. TÌM KIẾM BÀI VIẾT CHUYÊN ĐỀ (TutorialArticle & TutorialTopic)
    if (type === "all" || type === "tutorial" || type === "tutorials") {
      try {
        const articles = await prisma.tutorialArticle.findMany({
          where: {
            draft: false,
            OR: [
              { title: { contains: query } },
              { titleEn: { contains: query } },
              { summary: { contains: query } },
              { summaryEn: { contains: query } },
              { codeSnippet: { contains: query } },
              { contentHtml: { contains: query } },
              { contentHtmlEn: { contains: query } },
            ],
          },
          include: {
            topic: {
              select: {
                title: true,
                slug: true,
                categoryName: true,
              },
            },
          },
          take: limit * 2,
        });

        articles.forEach((art) => {
          const title = art.title;
          const summary = art.summary || art.summaryEn || "";
          const content = art.contentHtml || art.contentHtmlEn || "";
          const code = art.codeSnippet || "";

          const inTitle = title.toLowerCase().includes(lowerQuery) || (art.titleEn?.toLowerCase().includes(lowerQuery) ?? false);
          const inSummary = summary.toLowerCase().includes(lowerQuery);
          const inCode = code.toLowerCase().includes(lowerQuery);
          const inContent = content.toLowerCase().includes(lowerQuery);

          // Trích xuất snippet ngữ cảnh nếu khớp trong content hoặc code
          let matchSnippet: string | null = null;
          let matchField: SearchResultItem["matchField"] = "title";

          if (inTitle) {
            matchField = "title";
            matchSnippet = summary ? (summary.length > 150 ? summary.slice(0, 150) + "..." : summary) : null;
          } else if (inSummary) {
            matchField = "summary";
            matchSnippet = extractContextSnippet(summary, query);
          } else if (inCode) {
            matchField = "code";
            matchSnippet = extractContextSnippet(code, query);
          } else if (inContent) {
            matchField = "content";
            matchSnippet = extractContextSnippet(content, query);
          }

          const score = calcScore(title, summary, inContent, inCode);

          results.push({
            type: "tutorial",
            title: art.title,
            description: matchSnippet || summary || `Chuyên đề chuyên sâu trong ${art.topic?.title || "Embedded"}`,
            url: `/tutorials/${art.topic?.slug || "general"}/${art.slug}`,
            tags: [art.topic?.categoryName || "Chuyên đề", art.topic?.title || ""].filter(Boolean),
            breadcrumb: art.topic ? `${art.topic.title} › ${art.title}` : art.title,
            matchField,
            matchSnippet: matchSnippet || undefined,
            score,
            date: art.updatedAt ? new Date(art.updatedAt).toISOString().split("T")[0] : undefined,
          });
        });
      } catch (err) {
        console.warn("DB TutorialArticle search error:", err);
      }
    }

    // 2. TÌM KIẾM BÀI GIẢNG KHÓA HỌC (Lesson & CourseModule & Course)
    if (type === "all" || type === "lesson" || type === "course" || type === "courses") {
      try {
        const lessons = await prisma.lesson.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { titleEn: { contains: query } },
              { summary: { contains: query } },
              { summaryEn: { contains: query } },
              { codeSnippet: { contains: query } },
              { contentHtml: { contains: query } },
              { contentHtmlEn: { contains: query } },
              { contentMarkdown: { contains: query } },
              { contentMarkdownEn: { contains: query } },
            ],
          },
          include: {
            module: {
              include: {
                course: {
                  select: {
                    title: true,
                    slug: true,
                    category: true,
                  },
                },
              },
            },
          },
          take: limit * 2,
        });

        lessons.forEach((les) => {
          const title = les.title;
          const summary = les.summary || les.summaryEn || "";
          const content = les.contentHtml || les.contentMarkdown || les.contentHtmlEn || les.contentMarkdownEn || "";
          const code = les.codeSnippet || "";

          const inTitle = title.toLowerCase().includes(lowerQuery) || (les.titleEn?.toLowerCase().includes(lowerQuery) ?? false);
          const inSummary = summary.toLowerCase().includes(lowerQuery);
          const inCode = code.toLowerCase().includes(lowerQuery);
          const inContent = content.toLowerCase().includes(lowerQuery);

          let matchSnippet: string | null = null;
          let matchField: SearchResultItem["matchField"] = "title";

          if (inTitle) {
            matchField = "title";
            matchSnippet = summary ? (summary.length > 150 ? summary.slice(0, 150) + "..." : summary) : null;
          } else if (inSummary) {
            matchField = "summary";
            matchSnippet = extractContextSnippet(summary, query);
          } else if (inCode) {
            matchField = "code";
            matchSnippet = extractContextSnippet(code, query);
          } else if (inContent) {
            matchField = "content";
            matchSnippet = extractContextSnippet(content, query);
          }

          const score = calcScore(title, summary, inContent, inCode) + 5; // Ưu tiên nhẹ bài giảng
          const course = les.module?.course;

          results.push({
            type: "lesson",
            title: les.title,
            description: matchSnippet || summary || `Bài giảng thời lượng ${les.duration}`,
            url: course ? `/courses/${course.slug}/lesson/${les.slug}` : `/courses`,
            tags: [course?.category || "Khóa học", les.duration].filter(Boolean),
            breadcrumb: course ? `${course.title} › ${les.module.module} › ${les.title}` : les.title,
            matchField,
            matchSnippet: matchSnippet || undefined,
            score,
          });
        });
      } catch (err) {
        console.warn("DB Lesson search error:", err);
      }
    }

    // 3. TÌM KIẾM KHÓA HỌC TỔNG THỂ (Course Overview)
    if (type === "all" || type === "course" || type === "courses") {
      try {
        const courses = await prisma.course.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { titleEn: { contains: query } },
              { description: { contains: query } },
              { descriptionEn: { contains: query } },
              { category: { contains: query } },
            ],
          },
          take: limit,
        });

        courses.forEach((c) => {
          const score = calcScore(c.title, c.description, false, false) + 20;
          results.push({
            type: "course",
            title: c.title,
            description: c.description,
            url: `/courses/${c.slug}`,
            tags: [c.category, c.duration, c.price].filter(Boolean),
            breadcrumb: `Khóa học › ${c.title}`,
            matchField: "title",
            score,
          });
        });
      } catch (err) {
        console.warn("DB Course search error:", err);
      }
    }

    // 4. TÌM KIẾM BẢN TIN / TIN TỨC LAB (Post)
    if (type === "all" || type === "blog" || type === "post" || type === "posts") {
      try {
        const posts = await prisma.post.findMany({
          where: {
            draft: false,
            OR: [
              { title: { contains: query } },
              { excerpt: { contains: query } },
              { tags: { contains: query } },
              { contentHtml: { contains: query } },
            ],
          },
          take: limit * 2,
          orderBy: { createdAt: "desc" },
        });

        posts.forEach((p) => {
          const inTitle = p.title.toLowerCase().includes(lowerQuery);
          const inExcerpt = p.excerpt.toLowerCase().includes(lowerQuery);
          const inContent = p.contentHtml.toLowerCase().includes(lowerQuery);

          let matchSnippet: string | null = null;
          let matchField: SearchResultItem["matchField"] = "title";

          if (inTitle) {
            matchField = "title";
            matchSnippet = p.excerpt;
          } else if (inExcerpt) {
            matchField = "summary";
            matchSnippet = extractContextSnippet(p.excerpt, query);
          } else if (inContent) {
            matchField = "content";
            matchSnippet = extractContextSnippet(p.contentHtml, query);
          }

          const tagsArray = typeof p.tags === "string" ? p.tags.split(",").map((t: string) => t.trim()) : [];
          const score = calcScore(p.title, p.excerpt, inContent, false);

          results.push({
            type: "blog",
            title: p.title,
            description: matchSnippet || p.excerpt,
            url: `/blog/${p.slug}`,
            tags: tagsArray,
            breadcrumb: `Bản tin › ${p.title}`,
            matchField,
            matchSnippet: matchSnippet || undefined,
            score,
            date: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : undefined,
          });
        });
      } catch (err) {
        console.warn("DB Post search error:", err);
      }
    }

    // 5. TÌM KIẾM ĐỀ TÀI & CÔNG BỐ KHOA HỌC (ResearchPaper)
    if (type === "all" || type === "research") {
      try {
        const papers = await prisma.researchPaper.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { authors: { contains: query } },
              { venue: { contains: query } },
              { abstract: { contains: query } },
              { keywords: { contains: query } },
            ],
          },
          take: limit,
          orderBy: { year: "desc" },
        });

        papers.forEach((paper) => {
          const inTitle = paper.title.toLowerCase().includes(lowerQuery);
          const inAbstract = paper.abstract ? paper.abstract.toLowerCase().includes(lowerQuery) : false;

          let matchSnippet: string | null = null;
          let matchField: SearchResultItem["matchField"] = "title";

          if (inTitle) {
            matchField = "title";
            matchSnippet = paper.abstract ? paper.abstract.slice(0, 150) + "..." : paper.venue;
          } else if (inAbstract && paper.abstract) {
            matchField = "content";
            matchSnippet = extractContextSnippet(paper.abstract, query);
          }

          const tagsArray = typeof paper.keywords === "string" ? paper.keywords.split(",").map((t: string) => t.trim()) : [];
          const score = calcScore(paper.title, paper.abstract, inAbstract, false);

          results.push({
            type: "research",
            title: paper.title,
            description: matchSnippet || paper.venue || paper.abstract?.slice(0, 150) || "",
            url: `/research`,
            tags: tagsArray,
            breadcrumb: `Nghiên cứu › ${paper.year} › ${paper.venue}`,
            matchField,
            matchSnippet: matchSnippet || undefined,
            score,
            date: paper.year.toString(),
          });
        });
      } catch (err) {
        console.warn("DB ResearchPaper search error:", err);
      }
    }

    // 6. DỰ PHÒNG TĨNH (Static Content Fallback nếu DB không có dữ liệu)
    if (results.length === 0) {
      allPosts.forEach((post) => {
        const inTitle = post.title.toLowerCase().includes(lowerQuery);
        const inExcerpt = post.excerpt.toLowerCase().includes(lowerQuery);
        const inContent = post.body?.raw ? post.body.raw.toLowerCase().includes(lowerQuery) : false;

        if (inTitle || inExcerpt || inContent) {
          const matchSnippet = inContent && post.body?.raw ? extractContextSnippet(post.body.raw, query) : post.excerpt;
          results.push({
            type: "blog",
            title: post.title,
            description: matchSnippet || post.excerpt,
            url: post.url,
            tags: post.tags,
            breadcrumb: `Bản tin › ${post.title}`,
            score: calcScore(post.title, post.excerpt, inContent, false),
            date: post.date,
          });
        }
      });

      allCourses.forEach((course) => {
        const inTitle = course.title.toLowerCase().includes(lowerQuery);
        const inDesc = course.description.toLowerCase().includes(lowerQuery);

        if (inTitle || inDesc) {
          results.push({
            type: "course",
            title: course.title,
            description: course.description,
            url: course.url,
            tags: course.tags,
            breadcrumb: `Khóa học › ${course.title}`,
            score: calcScore(course.title, course.description, false, false),
          });
        }

        // Tìm sâu trong từng bài học của khóa học tĩnh
        if (Array.isArray(course.curriculum)) {
          course.curriculum.forEach((mod) => {
            if (Array.isArray(mod.lessons)) {
              mod.lessons.forEach((les) => {
                const inLesTitle = les.title.toLowerCase().includes(lowerQuery);
                const inLesSum = les.summary?.toLowerCase().includes(lowerQuery);
                const inLesCont = les.contentHtml?.toLowerCase().includes(lowerQuery) || les.contentMarkdown?.toLowerCase().includes(lowerQuery);

                if (inLesTitle || inLesSum || inLesCont) {
                  const content = les.contentMarkdown || les.contentHtml || "";
                  const matchSnippet = inLesCont ? extractContextSnippet(content, query) : les.summary;
                  results.push({
                    type: "lesson",
                    title: les.title,
                    description: matchSnippet || les.summary || `Bài học thời lượng ${les.duration}`,
                    url: `/courses/${course.slug}/lesson/${les.slug}`,
                    tags: [course.category || "Khóa học", les.duration],
                    breadcrumb: `${course.title} › ${mod.module} › ${les.title}`,
                    score: calcScore(les.title, les.summary, Boolean(inLesCont), false),
                  });
                }
              });
            }
          });
        }
      });
    }

    // 7. SẮP XẾP KẾT QUẢ THEO ĐIỂM SỐ LIÊN QUAN (Highest Score First)
    results.sort((a, b) => b.score - a.score);

    // Trả về danh sách kết quả đã được phân loại & giới hạn
    return NextResponse.json({
      query,
      total: results.length,
      results: results.slice(0, limit),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}