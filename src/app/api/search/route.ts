import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { allPosts, allCourses } from "@/lib/content";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase().trim() || "";
    const type = searchParams.get("type") || "all"; // all, blog, courses
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const results: Array<{
      type: "blog" | "course";
      title: string;
      description: string;
      url: string;
      tags: string[];
      date?: string;
    }> = [];

    // 1. Search blog posts from Prisma SQLite Database
    if (type === "all" || type === "blog") {
      try {
        const dbPosts = await prisma.post.findMany({
          where: {
            draft: false,
            OR: [
              { title: { contains: query } },
              { excerpt: { contains: query } },
              { tags: { contains: query } },
              { contentHtml: { contains: query } },
            ],
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        });

        dbPosts.forEach((post) => {
          const tagsArray = typeof post.tags === "string" ? post.tags.split(",").map((t: string) => t.trim()) : [];
          results.push({
            type: "blog",
            title: post.title,
            description: post.excerpt,
            url: `/blog/${post.slug}`,
            tags: tagsArray,
            date: post.createdAt ? new Date(post.createdAt).toISOString().split("T")[0] : undefined,
          });
        });
      } catch (dbErr) {
        console.warn("DB search fallback to static content:", dbErr);
      }

      // Fallback search in static content if no DB results
      if (results.length === 0) {
        allPosts.forEach((post) => {
          const searchText = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase();
          if (searchText.includes(query)) {
            results.push({
              type: "blog",
              title: post.title,
              description: post.excerpt,
              url: post.url,
              tags: post.tags,
              date: post.date,
            });
          }
        });
      }
    }

    // 2. Search courses from DB or static content
    if (type === "all" || type === "course") {
      try {
        const dbCourses = await prisma.course.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
              { category: { contains: query } },
            ],
          },
          take: limit,
        });

        dbCourses.forEach((course) => {
          results.push({
            type: "course",
            title: course.title,
            description: course.description,
            url: `/courses/${course.slug}`,
            tags: [course.category],
          });
        });
      } catch {
        // Fallback static courses
        allCourses.forEach((course) => {
          const searchText = `${course.title} ${course.description} ${course.tags.join(" ")}`.toLowerCase();
          if (searchText.includes(query)) {
            results.push({
              type: "course",
              title: course.title,
              description: course.description,
              url: course.url,
              tags: course.tags,
            });
          }
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(query);
      const bTitleMatch = b.title.toLowerCase().includes(query);
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      return 0;
    });

    return NextResponse.json({ results: results.slice(0, limit) });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}