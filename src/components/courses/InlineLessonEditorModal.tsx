"use client";

import React, { useState } from "react";
import { CourseData, LessonData } from "@/lib/content";
import { GoogleDocsEditor } from "@/components/editor/GoogleDocsEditor";
import { Button } from "@/components/ui/Button";
import {
  X,
  Save,
  Video,
  Code,
  FileText,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface InlineLessonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseData;
  currentLesson: LessonData & { moduleTitle: string };
  onLessonUpdated: (updatedLesson: LessonData & { moduleTitle: string }, updatedCourse: CourseData) => void;
}

export function InlineLessonEditorModal({
  isOpen,
  onClose,
  course,
  currentLesson,
  onLessonUpdated,
}: InlineLessonEditorModalProps) {
  const [title, setTitle] = useState(currentLesson.title);
  const [duration, setDuration] = useState(currentLesson.duration);
  const [videoUrl, setVideoUrl] = useState(currentLesson.videoUrl || "");
  const [summary, setSummary] = useState(currentLesson.summary || "");
  const [codeSnippet, setCodeSnippet] = useState(currentLesson.codeSnippet || "");
  const [contentHtml, setContentHtml] = useState(currentLesson.contentHtml || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when currentLesson changes
  React.useEffect(() => {
    setTitle(currentLesson.title);
    setDuration(currentLesson.duration);
    setVideoUrl(currentLesson.videoUrl || "");
    setSummary(currentLesson.summary || "");
    setCodeSnippet(currentLesson.codeSnippet || "");
    setContentHtml(currentLesson.contentHtml || "");
  }, [currentLesson]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài học.");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Tạo bản sao curriculum mới với bài giảng được cập nhật
      const updatedCurriculum = course.curriculum.map((mod) => {
        if (mod.module === currentLesson.moduleTitle) {
          return {
            ...mod,
            lessons: mod.lessons.map((les) => {
              if (les.slug === currentLesson.slug) {
                return {
                  ...les,
                  title: title.trim(),
                  duration: duration.trim() || "20 phút",
                  videoUrl: videoUrl.trim() || undefined,
                  summary: summary.trim() || undefined,
                  codeSnippet: codeSnippet.trim() || undefined,
                  contentHtml: contentHtml.trim() || undefined,
                };
              }
              return les;
            }),
          };
        }
        return mod;
      });

      // 2. Gửi PUT request cập nhật SQLite Database
      const res = await fetch(`/api/courses/${course._id || course.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: course.title,
          slug: course.slug,
          description: course.description,
          category: course.category,
          level: course.level,
          duration: course.duration,
          price: course.price,
          thumbnail: course.thumbnail,
          githubRepo: course.githubRepo,
          featured: course.featured,
          modules: updatedCurriculum,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi lưu bài học");
      }

      // 3. Cập nhật state trang hiện tại
      const updatedLessonObj: LessonData & { moduleTitle: string } = {
        ...currentLesson,
        title: title.trim(),
        duration: duration.trim() || "20 phút",
        videoUrl: videoUrl.trim() || undefined,
        summary: summary.trim() || undefined,
        codeSnippet: codeSnippet.trim() || undefined,
        contentHtml: contentHtml.trim() || undefined,
      };

      const updatedCourseObj: CourseData = {
        ...course,
        curriculum: updatedCurriculum,
      };

      onLessonUpdated(updatedLessonObj, updatedCourseObj);
      window.dispatchEvent(new CustomEvent("embedded_courses_updated"));
      alert("🎉 Đã lưu thay đổi bài học thành công!");
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`Có lỗi xảy ra khi lưu bài học: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-bg-panel border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-border/80 flex items-center justify-between bg-bg-elevated/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider block">
                {currentLesson.moduleTitle}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                Chỉnh Sửa Trực Tiếp Bài Học (Admin Live Editor)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-bg-elevated hover:bg-bg-code text-text-muted hover:text-text-primary transition-colors border border-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Thông tin cơ bản bài học */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Tiêu đề bài học <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/70 dark:bg-bg-elevated border border-border text-sm font-semibold text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-accent" />
                Thời lượng bài:
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="VD: 45 phút"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/70 dark:bg-bg-elevated border border-border text-xs font-medium text-text-primary"
              />
            </div>
          </div>

          {/* Link Video YouTube */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-accent" />
              Link Video Bài Giảng (YouTube URL hoặc Link trực tiếp):
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="VD: https://www.youtube.com/watch?v=3V9eqskKs00"
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/70 dark:bg-bg-elevated border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
            />
            <span className="text-[11px] text-text-muted mt-1 block">
              💡 Dán link YouTube vào đây, hệ thống sẽ tự động nhúng và phát video ngay lập tức.
            </span>
          </div>

          {/* Tóm tắt bài học */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">
              Tóm tắt trọng tâm bài học (Hiển thị đầu bài):
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Nêu ngắn gọn nội dung và mục tiêu cần đạt..."
              className="w-full px-3.5 py-2 rounded-xl bg-bg-elevated/70 dark:bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Code mẫu thực hành */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1.5 font-mono">
              <Code className="w-4 h-4 text-emerald-400" />
              Mã Nguồn Mẫu C/C++ Thực Hành (Code Snippet):
            </label>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="#include <stdint.h>&#10;&#10;void main(void) { ... }"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 dark:bg-black border border-slate-800 text-xs font-mono text-emerald-400 leading-relaxed focus:outline-none focus:border-accent"
            />
          </div>

          {/* Trình soạn thảo văn bản trực quan Google Docs Editor cho Nội dung chi tiết */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-text-primary flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-accent" />
                Nội Dung Giáo Trình Bài Học Chi Tiết (Soạn Thảo Trực Quan - Không Cần Code Thẻ):
              </label>
            </div>

            <p className="text-[11px] text-text-muted">
              ✍️ Bạn có thể gõ văn bản như Word/Google Docs, chọn in đậm, tạo danh sách, chèn bảng hoặc định dạng trực quan bằng thanh công cụ bên dưới.
            </p>

            <div className="border border-border/80 rounded-2xl overflow-hidden shadow-inner">
              <GoogleDocsEditor
                value={contentHtml}
                onChange={(html) => setContentHtml(html)}
                placeholder="Nhập nội dung bài học, hướng dẫn các bước thực hành và lý thuyết chuyên sâu tại đây..."
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-bg-panel py-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg hover:scale-102 transition-all"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Đang lưu bài học..." : "Lưu Bài Học Ngay"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
