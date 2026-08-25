"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { COURSE_CATEGORIES, updateCourse, deleteCourse as deleteLocalCourse } from "@/lib/courses-store";
import { CourseModule, LessonData, CourseCategory } from "@/lib/content";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Plus,
  Trash2,
  GraduationCap,
  Layers,
  Clock,
  BookOpen,
  Code,
  Video,
  CheckCircle2,
  Image as ImageIcon,
  GitBranch,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCoursePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CourseCategory>("embedded-rtos");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [duration, setDuration] = useState("35 giờ");
  const [price, setPrice] = useState<"free" | "paid">("free");
  const [thumbnail, setThumbnail] = useState("/images/logo.png");
  const [githubRepo, setGithubRepo] = useState("");
  const [featured, setFeatured] = useState(true);
  const [modules, setModules] = useState<CourseModule[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/courses/${resolvedParams.id}`);
        const json = await res.json();
        if (json.success && json.data) {
          const c = json.data;
          setCourseId(c.id);
          setTitle(c.title);
          setSlug(c.slug);
          setDescription(c.description || "");
          setCategory(c.category || "embedded-rtos");
          setLevel(c.level || "intermediate");
          setDuration(c.duration || "35 giờ");
          setPrice(c.price || "free");
          setThumbnail(c.thumbnail || "/images/logo.png");
          setGithubRepo(c.githubRepo || "");
          setFeatured(Boolean(c.featured));

          const formattedModules = (c.modules || []).map((m: any) => ({
            module: m.module,
            lessons: (m.lessons || []).map((l: any) => ({
              title: l.title,
              slug: l.slug,
              duration: l.duration || "20 phút",
              free: l.free !== undefined ? l.free : true,
              summary: l.summary || "",
              contentHtml: l.contentHtml || "",
              videoUrl: l.videoUrl || "",
              codeSnippet: l.codeSnippet || "",
            })),
          }));

          setModules(formattedModules.length > 0 ? formattedModules : [
            {
              module: "Học phần 1: Giới thiệu & Tổng quan",
              lessons: [
                {
                  title: "Bài 1: Khởi tạo môi trường & Mục tiêu",
                  slug: "bai-1-khoi-tao",
                  duration: "20 phút",
                  free: true,
                  summary: "Tổng quan kiến thức cần đạt trong học phần.",
                },
              ],
            },
          ]);
        } else {
          alert("Không tìm thấy khóa học để chỉnh sửa.");
          router.push("/admin");
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi khi tải dữ liệu khóa học.");
      } finally {
        setIsLoading(false);
      }
    }

    if (resolvedParams.id) {
      loadCourse();
    }
  }, [resolvedParams.id, router]);

  // Handle Modules & Lessons Modification
  const handleAddModule = () => {
    const nextIdx = modules.length + 1;
    setModules([
      ...modules,
      {
        module: `Học phần ${nextIdx}: Tiêu đề học phần mới`,
        lessons: [
          {
            title: `Bài 1: Nội dung thực hành học phần ${nextIdx}`,
            slug: `hoc-phan-${nextIdx}-bai-1`,
            duration: "20 phút",
            free: false,
            summary: "Tóm tắt bài giảng.",
          },
        ],
      },
    ]);
  };

  const handleRemoveModule = (modIdx: number) => {
    if (modules.length <= 1) {
      alert("Khóa học cần ít nhất 1 học phần.");
      return;
    }
    setModules(modules.filter((_, idx) => idx !== modIdx));
  };

  const handleUpdateModuleName = (modIdx: number, newName: string) => {
    const updated = [...modules];
    updated[modIdx].module = newName;
    setModules(updated);
  };

  const handleAddLesson = (modIdx: number) => {
    const updated = [...modules];
    const lessonNum = updated[modIdx].lessons.length + 1;
    updated[modIdx].lessons.push({
      title: `Bài ${lessonNum}: Bài giảng mới`,
      slug: `bai-${modIdx + 1}-${lessonNum}-${Date.now().toString().slice(-4)}`,
      duration: "20 phút",
      free: false,
      summary: "Tóm tắt nội dung bài học.",
    });
    setModules(updated);
  };

  const handleRemoveLesson = (modIdx: number, lessonIdx: number) => {
    const updated = [...modules];
    if (updated[modIdx].lessons.length <= 1) {
      alert("Mỗi học phần cần ít nhất 1 bài giảng.");
      return;
    }
    updated[modIdx].lessons = updated[modIdx].lessons.filter((_, idx) => idx !== lessonIdx);
    setModules(updated);
  };

  const handleUpdateLesson = (
    modIdx: number,
    lessonIdx: number,
    field: keyof LessonData,
    value: any
  ) => {
    const updated = [...modules];
    updated[modIdx].lessons[lessonIdx] = {
      ...updated[modIdx].lessons[lessonIdx],
      [field]: value,
    };
    setModules(updated);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Vui lòng điền đủ tiêu đề và mô tả khóa học.");
      return;
    }

    setIsSubmitting(true);
    const totalLessons = modules.reduce((total, m) => total + m.lessons.length, 0);

    try {
      const finalSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-");

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        description: description.trim(),
        category,
        level,
        duration: duration.trim() || `${totalLessons * 20} phút`,
        price,
        thumbnail: thumbnail.trim() || "/images/logo.png",
        githubRepo: githubRepo.trim() || undefined,
        featured,
        modules,
      };

      // 1. Update qua API SQLite
      const res = await fetch(`/api/courses/${courseId || resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi cập nhật khóa học");
      }

      // 2. Update local store
      updateCourse(courseId, {
        ...payload,
        lessons: totalLessons,
        tags: [category],
        instructor: "Embedded AIoT Laboratory",
        curriculum: modules,
      });

      window.dispatchEvent(new CustomEvent("embedded_courses_updated"));
      alert("🎉 Đã lưu thay đổi khóa học thành công!");
      router.push(`/courses/${json.data.slug}`);
    } catch (err: any) {
      console.error(err);
      alert(`Có lỗi xảy ra: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN khóa học "${title}" không? Hành động này không thể hoàn tác!`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId || resolvedParams.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        deleteLocalCourse(courseId);
        window.dispatchEvent(new CustomEvent("embedded_courses_updated"));
        alert("Đã xóa khóa học thành công!");
        router.push("/courses");
      } else {
        throw new Error(json.error || "Lỗi xóa khóa học");
      }
    } catch (err: any) {
      alert(`Có lỗi xảy ra khi xóa: ${err.message}`);
      setIsDeleting(false);
    }
  };

  const isAuthorized = user && (user.role === "superadmin" || user.role === "admin");

  if (!isAuthorized) {
    return (
      <div className="container py-16 max-w-xl text-center">
        <div className="p-8 rounded-3xl bg-bg-panel border border-border shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-3xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Truy Cập Bị Từ Chối (403 Forbidden)
          </h1>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Chỉ <strong>Quản Trị Viên & Giảng Viên Lab</strong> mới có quyền chỉnh sửa khóa học.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" asChild className="bg-accent hover:bg-accent-hover text-white">
              <Link href="/">Quay Về Trang Chủ</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Đăng Nhập Tài Khoản Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-24 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted text-sm">Đang tải thông tin khóa học để chỉnh sửa...</p>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl">
      {/* Top Navigation */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="text-text-muted hover:text-text-primary self-start">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại Bảng Quản Trị
          </Link>
        </Button>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href={`/courses/${slug}`} target="_blank">
              <Eye className="w-3.5 h-3.5 mr-1" />
              Xem Trang Khóa Học
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDeleteCourse}
            disabled={isDeleting}
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {isDeleting ? "Đang xóa..." : "Xóa Khóa Học"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSaveCourse} className="space-y-8">
        {/* Form Container */}
        <div className="bg-bg-panel border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl space-y-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-2">
              <GraduationCap className="w-4 h-4" />
              Chỉnh Sửa Khóa Học & Giáo Trình Bài Giảng
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              Cập Nhật Khóa Học: <span className="text-accent">{title}</span>
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Điều chỉnh thông tin chung, học phần, video bài giảng và mã nguồn thực hành.
            </p>
          </div>

          {/* 1. Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              1. Thông tin chung về khóa học
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tiêu đề Khóa học <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-code border border-border text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Đường dẫn tĩnh (Slug)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-bg-code border border-border text-xs text-text-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Chuyên Ngành (Danh mục)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CourseCategory)}
                  className="w-full px-4 py-2 rounded-xl bg-bg-code border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  {COURSE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.enName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Cấp độ kỹ năng
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-xl bg-bg-code border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="beginner">Căn bản (Beginner)</option>
                  <option value="intermediate">Trung cấp (Intermediate)</option>
                  <option value="advanced">Nâng cao (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Thời lượng ước tính
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="VD: 35 giờ"
                  className="w-full px-4 py-2 rounded-xl bg-bg-code border border-border text-xs text-text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Ảnh bìa Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-bg-code border border-border text-xs text-text-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Link GitHub Repository Mã Nguồn
                </label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="https://github.com/embedded-aiot-ptit/..."
                  className="w-full px-4 py-2 rounded-xl bg-bg-code border border-border text-xs text-text-primary font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Tóm tắt mô tả khóa học <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-code border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* 2. Modules & Lessons Curriculum Editor */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                2. Chương trình học phần & Bài giảng chi tiết
              </h3>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddModule}
                className="text-xs text-accent border-accent/40 hover:bg-accent/10"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Thêm Học Phần Mới
              </Button>
            </div>

            <div className="space-y-6">
              {modules.map((mod, modIdx) => (
                <div
                  key={modIdx}
                  className="p-5 rounded-2xl bg-bg-elevated border border-border/80 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-accent uppercase tracking-wider mb-1">
                        Học phần {modIdx + 1}:
                      </label>
                      <input
                        type="text"
                        value={mod.module}
                        onChange={(e) => handleUpdateModuleName(modIdx, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-bg-code border border-border text-xs font-bold text-text-primary focus:outline-none focus:border-accent"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveModule(modIdx)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 text-xs"
                      title="Xóa học phần này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Lessons List in Module */}
                  <div className="space-y-3 pl-3 border-l-2 border-accent/30">
                    {mod.lessons.map((lesson, lessonIdx) => (
                      <div
                        key={lessonIdx}
                        className="p-4 rounded-xl bg-bg-panel border border-border/70 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                              Bài giảng {lessonIdx + 1}:
                            </span>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) =>
                                handleUpdateLesson(modIdx, lessonIdx, "title", e.target.value)
                              }
                              className="w-full px-3 py-1.5 rounded-lg bg-bg-code border border-border text-xs font-bold text-text-primary"
                            />
                          </div>

                          <div className="w-28">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                              Thời lượng:
                            </span>
                            <input
                              type="text"
                              value={lesson.duration}
                              onChange={(e) =>
                                handleUpdateLesson(modIdx, lessonIdx, "duration", e.target.value)
                              }
                              className="w-full px-3 py-1.5 rounded-lg bg-bg-code border border-border text-xs"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLesson(modIdx, lessonIdx)}
                            className="text-text-muted hover:text-red-400 p-1.5 mt-4"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {/* Video URL & Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-text-muted mb-1 flex items-center gap-1">
                              <Video className="w-3 h-3 text-accent" />
                              Link Video Bài Giảng (YouTube URL hoặc File):
                            </label>
                            <input
                              type="text"
                              value={lesson.videoUrl || ""}
                              onChange={(e) =>
                                handleUpdateLesson(modIdx, lessonIdx, "videoUrl", e.target.value)
                              }
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full px-3 py-1.5 rounded-lg bg-bg-code border border-border text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-text-muted mb-1">
                              Tóm tắt bài học:
                            </label>
                            <input
                              type="text"
                              value={lesson.summary || ""}
                              onChange={(e) =>
                                handleUpdateLesson(modIdx, lessonIdx, "summary", e.target.value)
                              }
                              placeholder="Trọng tâm thực hành..."
                              className="w-full px-3 py-1.5 rounded-lg bg-bg-code border border-border text-xs"
                            />
                          </div>
                        </div>

                        {/* Code Snippet for Lesson */}
                        <div>
                          <label className="block text-[10px] font-bold text-text-muted mb-1 flex items-center gap-1 font-mono">
                            <Code className="w-3 h-3 text-emerald-400" />
                            Mã nguồn mẫu thực hành (C/C++ Code Snippet):
                          </label>
                          <textarea
                            rows={3}
                            value={lesson.codeSnippet || ""}
                            onChange={(e) =>
                              handleUpdateLesson(modIdx, lessonIdx, "codeSnippet", e.target.value)
                            }
                            placeholder="#include <stdint.h> ..."
                            className="w-full px-3 py-2 rounded-lg bg-bg-code border border-border text-xs font-mono text-emerald-400 leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddLesson(modIdx)}
                      className="text-xs text-accent hover:bg-accent/10 w-full justify-center border border-dashed border-accent/30 py-2 rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Thêm Bài Giảng Vào Học Phần {modIdx + 1}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin">Hủy bỏ</Link>
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg hover:scale-102 transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Đang lưu thay đổi..." : "Lưu Thay Đổi Khóa Học"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
