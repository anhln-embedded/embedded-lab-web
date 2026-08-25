"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createCourse, COURSE_CATEGORIES } from "@/lib/courses-store";
import { CourseModule, LessonData, CourseCategory } from "@/lib/content";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Plus,
  Trash2,
  GraduationCap,
  Layers,
  Clock,
  BookOpen,
  Code,
  Video,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NewCoursePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CourseCategory>("embedded-rtos");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [duration, setDuration] = useState("8 giờ học");
  const [tagsInput, setTagsInput] = useState("embedded-rtos, zephyr, arm");
  const [prereqInput, setPrereqInput] = useState("C/C++ căn bản, Đã từng lập trình vi điều khiển");
  const [price, setPrice] = useState<"free" | "paid">("free");
  const [thumbnail, setThumbnail] = useState("/images/logo.png");
  const [githubRepo, setGithubRepo] = useState("");
  const [instructor, setInstructor] = useState(user ? user.name : "Embedded-AIoT Lab PTIT");

  // Curriculum State
  const [modules, setModules] = useState<CourseModule[]>([
    {
      module: "Học phần 1: Nền tảng & Kiến trúc cốt lõi",
      lessons: [
        {
          title: "Bài 1: Giới thiệu mục tiêu & sơ đồ kiến trúc hệ thống",
          slug: "bai-1-gioi-thieu",
          duration: "15 phút",
          free: true,
          summary: "Tổng quan các khái niệm, yêu cầu phần cứng và tài liệu tham khảo.",
          videoUrl: "https://www.youtube.com/",
        },
      ],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setSlug(generatedSlug);
  };

  const handleCategoryChange = (newCat: CourseCategory) => {
    setCategory(newCat);
    if (newCat === "embedded-rtos") setTagsInput("embedded-rtos, zephyr, freertos, stm32");
    else if (newCat === "embedded-linux") setTagsInput("embedded-linux, yocto, kernel, device-driver");
    else if (newCat === "tinyml") setTagsInput("tinyml, edge-ai, esp32-s3, esp-dl");
    else if (newCat === "fpga") setTagsInput("fpga, verilog, risc-v, vivado");
    else if (newCat === "pcb-hardware") setTagsInput("pcb-hardware, altium, high-speed-pcb, emc");
  };

  const handleAddModule = () => {
    setModules([
      ...modules,
      {
        module: `Học phần ${modules.length + 1}: Chuyên đề mới`,
        lessons: [
          {
            title: `Bài 1: Khởi động học phần ${modules.length + 1}`,
            slug: `bai-hoc-phan-${modules.length + 1}-1`,
            duration: "20 phút",
            free: false,
            summary: "Nội dung tóm tắt của bài giảng.",
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
      slug: `bai-${modIdx + 1}-${lessonNum}`,
      duration: "20 phút",
      free: false,
      summary: "Tóm tắt nội dung bài học.",
    });
    setModules(updated);
  };

  const handleRemoveLesson = (modIdx: number, lessonIdx: number) => {
    const updated = [...modules];
    if (updated[modIdx].lessons.length <= 1) {
      alert("Học phần cần ít nhất 1 bài giảng.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Vui lòng điền đủ tiêu đề và mô tả khóa học.");
      return;
    }

    setIsSubmitting(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const prerequisites = prereqInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const totalLessons = modules.reduce((total, m) => total + m.lessons.length, 0);

    try {
      const generatedSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `course-${Date.now()}`;

      // 1. Lưu vào SQLite Database qua API
      try {
        await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            slug: generatedSlug,
            description: description.trim(),
            category,
            level,
            duration: duration.trim() || `${totalLessons * 20} phút`,
            price,
            thumbnail: thumbnail.trim() || "/images/logo.png",
            githubRepo: githubRepo.trim() || undefined,
            featured: true,
            modules,
          }),
        });
      } catch (apiErr) {
        console.warn("Could not save to SQLite API, fallback to LocalStorage:", apiErr);
      }

      // 2. Lưu vào LocalStorage
      const newCourse = createCourse({
        title: title.trim(),
        slug: generatedSlug,
        description: description.trim(),
        category,
        level,
        duration: duration.trim() || `${totalLessons * 20} phút`,
        lessons: totalLessons,
        tags: tags.length > 0 ? tags : [category],
        prerequisites: prerequisites.length > 0 ? prerequisites : ["Kiến thức kỹ thuật cơ bản"],
        price,
        thumbnail: thumbnail.trim() || "/images/logo.png",
        githubRepo: githubRepo.trim() || undefined,
        instructor: instructor.trim() || "Embedded AIoT Laboratory",
        curriculum: modules,
        body: { raw: "" },
      });

      window.dispatchEvent(new CustomEvent("embedded_courses_updated"));
      alert("🎉 Đã tạo và xuất bản khóa học thành công!");
      router.push(`/courses/${newCourse.slug}`);
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi lưu khóa học.");
      setIsSubmitting(false);
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
            Chỉ <strong>Quản Trị Viên & Giảng Viên Lab</strong> mới có quyền tạo mới và xuất bản khóa học.
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

  return (
    <div className="container py-10 max-w-5xl">
      {/* Top Action */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="text-text-muted hover:text-text-primary self-start">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại Bảng Quản Trị
          </Link>
        </Button>
      </div>

      <div className="bg-bg-panel border border-border rounded-2xl p-6 md:p-8 shadow-xl space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" />
            Trình Tạo Khóa Học & Chương Trình Đào Tạo
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Tạo Khóa Học Mới Cho Lab
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Tên khóa học *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="VD: Lập Trình Hệ Điều Hành Thời Gian Thực Zephyr RTOS"
                required
                className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Đường dẫn tĩnh (Slug) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="lap-trinh-zephyr-rtos-thuc-chien"
                required
                className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-sm font-mono text-text-primary focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Mô tả ngắn gọn về khóa học *
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu mục tiêu, kiến thức đạt được và kỹ năng thực hành sau khóa học..."
              required
              className="w-full px-3.5 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 5 Domains Category Selector & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Mảng Chuyên Môn (Category) *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as CourseCategory)}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm font-semibold text-cyan-400 focus:outline-none focus:border-cyan-500"
              >
                <option value="embedded-rtos">1. Embedded RTOS (Hệ thống nhúng & RTOS)</option>
                <option value="embedded-linux">2. Linux (Linux nhúng & Kernel / BSP)</option>
                <option value="tinyml">3. TinyML (Trí tuệ nhân tạo biên / Edge AI)</option>
                <option value="fpga">4. FPGA (Thiết kế vi mạch số & RISC-V)</option>
                <option value="pcb-hardware">5. PCB (Thiết kế mạch in & Phần cứng)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Cấp độ khóa học
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-cyan-500"
              >
                <option value="beginner">Beginner (Cơ bản / Nhập môn)</option>
                <option value="intermediate">Intermediate (Trung cấp)</option>
                <option value="advanced">Advanced (Nâng cao / Chuyên sâu)</option>
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
                placeholder="VD: 8 giờ học (24 bài giảng)"
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Thẻ / Tags (cách nhau bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="embedded-rtos, stm32, rtos"
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Yêu cầu tiên quyết (Prerequisites)
              </label>
              <input
                type="text"
                value={prereqInput}
                onChange={(e) => setPrereqInput(e.target.value)}
                placeholder="C/C++ căn bản, Đã học Vi xử lý"
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Curriculum Builder */}
          <div className="pt-4 border-t border-border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  Chương Trình Học & Danh Sách Bài Giảng
                </h3>
                <p className="text-xs text-text-muted">
                  Thêm các học phần (Modules) và bài giảng chi tiết (Lessons)
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddModule}
                className="text-xs border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Thêm Học Phần Mới
              </Button>
            </div>

            <div className="space-y-6">
              {modules.map((mod, modIdx) => (
                <div
                  key={modIdx}
                  className="p-5 rounded-2xl bg-bg-elevated/40 border border-border/80 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                        Tiêu đề Học phần #{modIdx + 1}
                      </label>
                      <input
                        type="text"
                        value={mod.module}
                        onChange={(e) => handleUpdateModuleName(modIdx, e.target.value)}
                        className="w-full px-3 py-1.5 bg-bg-panel border border-border rounded-lg text-sm font-semibold text-text-primary focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(modIdx)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 self-end"
                      title="Xóa học phần"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Lessons list inside module */}
                  <div className="pl-4 border-l-2 border-cyan-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-secondary">
                        Các bài giảng trong học phần ({mod.lessons.length} bài):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddLesson(modIdx)}
                        className="text-xs text-cyan-400 font-medium hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        + Thêm bài giảng
                      </button>
                    </div>

                    {mod.lessons.map((lesson, lessonIdx) => (
                      <div
                        key={lessonIdx}
                        className="p-3.5 rounded-xl bg-bg-panel border border-border/80 space-y-2 text-xs"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-6">
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) =>
                                handleUpdateLesson(modIdx, lessonIdx, "title", e.target.value)
                              }
                              placeholder="Tiêu đề bài giảng"
                              className="w-full px-2.5 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs font-medium text-text-primary focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <input
                              type="text"
                              value={lesson.duration}
                              onChange={(e) =>
                                handleUpdateLesson(modIdx, lessonIdx, "duration", e.target.value)
                              }
                              placeholder="Thời lượng (vd: 15 phút)"
                              className="w-full px-2.5 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs text-text-muted focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div className="sm:col-span-2 flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              id={`free-${modIdx}-${lessonIdx}`}
                              checked={lesson.free}
                              onChange={(e) =>
                                handleUpdateLesson(modIdx, lessonIdx, "free", e.target.checked)
                              }
                              className="rounded border-border"
                            />
                            <label
                              htmlFor={`free-${modIdx}-${lessonIdx}`}
                              className="text-[11px] text-text-muted cursor-pointer"
                            >
                              Học thử miễn phí
                            </label>
                          </div>

                          <div className="sm:col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveLesson(modIdx, lessonIdx)}
                              className="p-1 rounded text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={lesson.summary || ""}
                            onChange={(e) =>
                              handleUpdateLesson(modIdx, lessonIdx, "summary", e.target.value)
                            }
                            placeholder="Tóm tắt bài học ngắn gọn..."
                            className="w-full px-2.5 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs text-text-secondary focus:outline-none focus:border-cyan-500"
                          />

                          <input
                            type="text"
                            value={lesson.videoUrl || ""}
                            onChange={(e) =>
                              handleUpdateLesson(modIdx, lessonIdx, "videoUrl", e.target.value)
                            }
                            placeholder="Video URL (YouTube URL nếu có)..."
                            className="w-full px-2.5 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs text-text-secondary focus:outline-none focus:border-cyan-500 font-mono"
                          />
                        </div>

                        {/* Code Snippet & Content HTML */}
                        <div className="space-y-2 pt-1">
                          <textarea
                            rows={2}
                            value={lesson.codeSnippet || ""}
                            onChange={(e) =>
                              handleUpdateLesson(modIdx, lessonIdx, "codeSnippet", e.target.value)
                            }
                            placeholder="Mã nguồn mẫu C/C++ thực hành (Code Snippet nếu có)..."
                            className="w-full px-2.5 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500"
                          />

                          <textarea
                            rows={3}
                            value={lesson.contentHtml || ""}
                            onChange={(e) =>
                              handleUpdateLesson(modIdx, lessonIdx, "contentHtml", e.target.value)
                            }
                            placeholder="Nội dung giáo trình bài học chi tiết (Hỗ trợ HTML <h3>, <p>, <ul>, <code> hoặc văn bản)..."
                            className="w-full px-2.5 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-sans"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin">Hủy bỏ</Link>
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Đang tạo..." : "Xuất Bản Khóa Học"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
