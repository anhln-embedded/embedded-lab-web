"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { getCourseBySlug as getStaticCourseBySlug, CourseData } from "@/lib/content";
import { getCourseBySlug as getDynamicCourseBySlug } from "@/lib/courses-store";
import { CourseDetail } from "@/components/courses/CourseDetail";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CoursePage({ params }: PageProps) {
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
            curriculum: c.modules || [],
            body: { raw: "" },
          };
          setCourse(formatted);
          return;
        }
      } catch (e) {
        console.warn("Could not fetch course from SQLite API:", e);
      }

      const dynamicCourse = getDynamicCourseBySlug(slug);
      if (dynamicCourse) {
        setCourse(dynamicCourse);
        return;
      }

      setCourse(null);
    }

    if (resolvedParams.slug) {
      loadCourse();
    }
  }, [resolvedParams.slug]);

  if (course === undefined) {
    return (
      <div className="container py-24 text-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted text-sm">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-20 max-w-xl text-center">
        <div className="p-8 rounded-2xl bg-bg-panel border border-border">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mx-auto mb-4 text-3xl">
            🎓
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Không tìm thấy khóa học
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            Khóa học với đường dẫn <code className="text-accent font-mono">/{resolvedParams.slug}</code> không tồn tại hoặc đã được làm sạch.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" asChild className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Link href="/courses">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Về danh mục khóa học
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/roadmap">Xem Lộ trình học</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <CourseDetail course={course} />;
}