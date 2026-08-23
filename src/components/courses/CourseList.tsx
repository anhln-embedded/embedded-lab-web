"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CourseData, CourseCategory } from "@/lib/content";
import { getAllCourses, COURSE_CATEGORIES, CourseCategoryMeta } from "@/lib/courses-store";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Clock,
  GitBranch,
  Play,
  Lock,
  PlusCircle,
  GraduationCap,
  Sparkles,
  Cpu,
  Terminal,
  Zap,
  Binary,
  Layers,
  ArrowRight
} from "lucide-react";
import { getLevelColor, getLevelLabel } from "@/lib/utils";

const ICON_MAP: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-4 h-4" />,
  Terminal: <Terminal className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Binary: <Binary className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
};

interface CourseCardProps {
  course: CourseData;
}

export function CourseCard({ course }: CourseCardProps) {
  const categoryMeta = COURSE_CATEGORIES.find((c) => c.id === course.category);

  return (
    <Card variant="default" hover className="flex flex-col h-full bg-bg-panel border border-border/80 rounded-2xl overflow-hidden group">
      <div className="relative aspect-video mb-4 rounded-xl overflow-hidden bg-bg-code border border-border">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GraduationCap className="h-12 w-12 text-text-muted" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {categoryMeta && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${categoryMeta.badgeColor}`}>
              {ICON_MAP[categoryMeta.icon]}
              {categoryMeta.name}
            </span>
          )}
          <Badge variant={course.price === "free" ? "success" : "warning"} size="sm">
            {course.price === "free" ? "Miễn phí" : "Chuyên sâu"}
          </Badge>
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant="default" size="sm" className={getLevelColor(course.level)}>
            {getLevelLabel(course.level)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-1">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {course.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="default" size="sm" className="font-mono text-[10px]">
              #{tag}
            </Badge>
          ))}
          {course.tags.length > 3 && (
            <Badge variant="default" size="sm" className="text-[10px]">
              +{course.tags.length - 3}
            </Badge>
          )}
        </div>

        <h3 className="text-base font-bold text-text-primary mb-2 line-clamp-2 leading-snug group-hover:text-accent transition-colors">
          <Link href={course.url}>
            {course.title}
          </Link>
        </h3>

        <p className="text-xs text-text-secondary mb-4 flex-1 line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mb-4 pt-3 border-t border-border/60">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="h-3.5 w-3.5 text-accent" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-accent" />
            {course.lessons} bài giảng
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <Button variant={course.price === "free" ? "pill" : "primary"} size="sm" asChild className="text-xs">
            <Link href={course.url}>
              {course.price === "free" ? "Vào Học Miễn Phí" : "Đăng Ký Khóa Học"}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
          {course.githubRepo && (
            <a
              href={course.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-accent transition-colors p-1"
              aria-label="GitHub Repository"
            >
              <GitBranch className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

interface CourseListProps {
  courses?: CourseData[];
}

export function CourseList({ courses: initialCourses }: CourseListProps) {
  const { user } = useAuth();
  const [displayCourses, setDisplayCourses] = React.useState<CourseData[]>(initialCourses || []);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const loadFromApi = React.useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const apiCourses: CourseData[] = json.data.map((c: any) => ({
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
        }));
        setDisplayCourses(apiCourses);
        return;
      }
    } catch (err) {
      console.warn("Could not fetch from SQLite API:", err);
    }
    setDisplayCourses([]);
  }, []);

  React.useEffect(() => {
    loadFromApi();

    const handleUpdate = () => {
      loadFromApi();
    };

    window.addEventListener("embedded_courses_updated", handleUpdate);
    return () => window.removeEventListener("embedded_courses_updated", handleUpdate);
  }, [loadFromApi]);

  const availableCategories = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; icon: string; count: number; badgeColor: string }>();
    displayCourses.forEach((course) => {
      const catId = course.category || "embedded-rtos";
      const meta = COURSE_CATEGORIES.find((c) => c.id === catId) || {
        id: catId,
        name: catId.toUpperCase(),
        icon: "Cpu",
        badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      };
      const existing = map.get(catId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(catId, {
          id: catId,
          name: meta.name,
          icon: meta.icon,
          badgeColor: meta.badgeColor,
          count: 1,
        });
      }
    });
    return Array.from(map.values());
  }, [displayCourses]);

  const filteredCourses = selectedCategory === "all"
    ? displayCourses
    : displayCourses.filter((c) => c.category === selectedCategory || c.tags.includes(selectedCategory));

  return (
    <div className="space-y-8">
      {/* Dynamic Category Filter Tabs (Only shown when there are courses with multiple categories) */}
      {displayCourses.length > 0 && availableCategories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-bg-panel border border-border rounded-2xl max-w-4xl mx-auto shadow-sm">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === "all"
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tất cả ({displayCourses.length})
          </button>

          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-accent text-white shadow-md shadow-accent/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                {ICON_MAP[cat.icon] || <Cpu className="w-4 h-4" />}
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-bg-elevated text-text-muted"}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Course Grid or Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 px-6 border border-border/80 rounded-3xl bg-bg-panel/70 backdrop-blur-xl shadow-xl max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-accent-muted border border-accent/20 flex items-center justify-center mx-auto text-3xl shadow-inner">
            🎓
          </div>
          <h3 className="text-xl font-bold text-text-primary">
            {selectedCategory === "all"
              ? "Khóa học thực hành đang được cập nhật"
              : `Chưa có khóa học cho mảng ${COURSE_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory}`}
          </h3>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">
            Nội dung bài giảng và tài liệu thực nghiệm đang được chuẩn bị. Bạn có thể theo dõi Lộ trình học tập hoặc đọc các bài viết chia sẻ kỹ thuật mới nhất từ phòng Lab.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Button variant="primary" asChild className="bg-gradient-to-r from-accent to-accent-amber hover:brightness-110 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md">
              <Link href="/roadmap">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Xem Lộ Trình Học Tập
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>

            <Button variant="outline" asChild className="text-xs sm:text-sm font-semibold rounded-xl">
              <Link href="/blog">
                <BookOpen className="w-4 h-4 mr-1.5 text-accent" />
                Đọc Bảng Tin Kỹ Thuật
              </Link>
            </Button>

            {user && (user.role === "admin" || user.role === "superadmin") && (
              <Button variant="ghost" asChild className="text-xs text-text-muted hover:text-accent">
                <Link href="/admin/courses/new">
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Tạo khóa học mới (Admin)
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id || course.url} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}