"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { getCourseBySlug as getStaticCourseBySlug, CourseData } from "@/lib/content";
import { getCourseBySlug as getDynamicCourseBySlug } from "@/lib/courses-store";
import { LessonPlayer } from "@/components/courses/LessonPlayer";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export default function CourseLessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const [course, setCourse] = useState<CourseData | null | undefined>(undefined);

  useEffect(() => {
    async function loadCourse() {
      const slug = resolvedParams.slug;
      try {
        const res = await fetch(`/api/courses/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          const c = json.data;
          const formatted: CourseData = {
            _id: c.id,
            title: c.title,
            slug: c.slug,
            description: c.description,
            level: c.level || "intermediate",
            category: c.category || "embedded-rtos",
            duration: c.duration || "6 hours",
            lessons: c.modules ? c.modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) : 0,
            prerequisites: [],
            tags: [c.category || "embedded"],
            price: c.price || "free",
            thumbnail: c.thumbnail || "/images/logo.png",
            githubRepo: c.githubRepo,
            featured: c.featured,
            url: `/courses/${c.slug}`,
            curriculum: (c.modules || []).map((m: any) => ({
              module: m.module,
              lessons: (m.lessons || []).map((l: any) => ({
                title: l.title,
                slug: l.slug,
                duration: l.duration || "20 phút",
                free: l.free !== undefined ? l.free : true,
                summary: l.summary || "",
                contentHtml: l.contentHtml || "",
                videoUrl: l.videoUrl || undefined,
                codeSnippet: l.codeSnippet || undefined,
              })),
            })),
            body: { raw: "" },
          };
          setCourse(formatted);
          return;
        }
      } catch (e) {
        console.warn("Could not fetch course from SQLite API:", e);
      }

      const staticCourse = getStaticCourseBySlug(slug);
      if (staticCourse) {
        setCourse(staticCourse);
        return;
      }

      const dynamicCourse = getDynamicCourseBySlug(slug);
      if (dynamicCourse) {
        setCourse(dynamicCourse);
      } else {
        setCourse(null);
      }
    }

    if (resolvedParams.slug) {
      loadCourse();
    }
  }, [resolvedParams.slug]);

  if (course === undefined) {
    return (
      <div className="container py-24 text-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted text-sm">Đang tải bài giảng...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-20 max-w-xl text-center">
        <div className="p-8 rounded-2xl bg-bg-panel border border-border">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Không tìm thấy bài giảng
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            Khóa học hoặc bài giảng không tồn tại.
          </p>
          <Button variant="primary" asChild className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Link href="/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về danh mục khóa học
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Flatten all lessons
  const allLessons: Array<{
    title: string;
    slug: string;
    duration: string;
    free: boolean;
    summary?: string;
    moduleTitle: string;
    codeSnippet?: string;
    videoUrl?: string;
  }> = [];

  for (const mod of course.curriculum) {
    for (const lesson of mod.lessons) {
      allLessons.push({
        ...lesson,
        moduleTitle: mod.module,
      });
    }
  }

  const currentIndex = allLessons.findIndex((l) => l.slug === resolvedParams.lessonSlug);
  const currentLesson = currentIndex !== -1 ? allLessons[currentIndex] : allLessons[0];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (!currentLesson) {
    return (
      <div className="container py-20 max-w-xl text-center">
        <div className="p-8 rounded-2xl bg-bg-panel border border-border">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Chưa có bài giảng trong khóa học
          </h1>
          <Button variant="primary" asChild className="bg-cyan-600 text-white">
            <Link href={`/courses/${course.slug}`}>
              Quay lại khóa học
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LessonPlayer
      course={course}
      currentLesson={currentLesson}
      allLessons={allLessons}
      currentIndex={Math.max(0, currentIndex)}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}
