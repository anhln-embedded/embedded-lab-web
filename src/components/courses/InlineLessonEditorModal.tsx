"use client";

import React, { useState, useEffect } from "react";
import { CourseData, LessonData } from "@/lib/content";
import { TechMarkdownEditor } from "@/components/editor/TechMarkdownEditor";
import { markdownToLabHtml } from "@/lib/markdown-importer";
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
  const [titleEn, setTitleEn] = useState(currentLesson.titleEn || "");
  const [duration, setDuration] = useState(currentLesson.duration);
  
  // Tab chỉnh sửa ngôn ngữ
  const [editLang, setEditLang] = useState<"vi" | "en">("vi");

  // TÍCH CHỌN: Có kèm video hay không
  const [hasVideo, setHasVideo] = useState<boolean>(
    currentLesson.hasVideo !== undefined
      ? currentLesson.hasVideo
      : Boolean(currentLesson.videoUrl && currentLesson.videoUrl.trim().length > 0)
  );
  const [videoUrl, setVideoUrl] = useState(currentLesson.videoUrl || "");
  const [summary, setSummary] = useState(currentLesson.summary || "");
  const [summaryEn, setSummaryEn] = useState(currentLesson.summaryEn || "");
  const [codeSnippet, setCodeSnippet] = useState(currentLesson.codeSnippet || "");
  
  // Markdown content (Việt & Anh)
  const [markdownContent, setMarkdownContent] = useState(
    currentLesson.contentMarkdown || currentLesson.contentHtml || ""
  );
  const [markdownContentEn, setMarkdownContentEn] = useState(
    currentLesson.contentMarkdownEn || currentLesson.contentHtmlEn || ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync state when currentLesson changes
  useEffect(() => {
    setTitle(currentLesson.title);
    setTitleEn(currentLesson.titleEn || "");
    setDuration(currentLesson.duration);
    setHasVideo(
      currentLesson.hasVideo !== undefined
        ? currentLesson.hasVideo
        : Boolean(currentLesson.videoUrl && currentLesson.videoUrl.trim().length > 0)
    );
    setVideoUrl(currentLesson.videoUrl || "");
    setSummary(currentLesson.summary || "");
    setSummaryEn(currentLesson.summaryEn || "");
    setCodeSnippet(currentLesson.codeSnippet || "");
    setMarkdownContent(currentLesson.contentMarkdown || currentLesson.contentHtml || "");
    setMarkdownContentEn(currentLesson.contentMarkdownEn || currentLesson.contentHtmlEn || "");
    setStatusMsg(null);
  }, [currentLesson]);

  if (!isOpen) return null;

  // Chèn mẫu Markdown nhanh
  const handleInsertTemplate = (type: "stm32" | "rtos") => {
    let tpl = "";
    if (type === "stm32") {
      tpl = `## 🎯 1. Mục Tiêu Bài Học
- Hiểu rõ nguyên lý hoạt động khối ngoại vi.
- Cấu hình và lập trình theo thanh ghi / thư viện chuẩn.

---

## 💻 2. Mã Nguồn Mẫu
\`\`\`c
void Peripheral_Init(void) {
    // Khởi tạo ngoại vi
}
\`\`\`
`;
    } else {
      tpl = `## 🚀 1. Giới Thiệu Khái Niệm
- Tổng quan về cơ chế đồng bộ và quản lý Task.

---

## ⏱️ 2. Ví Dụ Cấu Trúc Task
\`\`\`c
void vSensorTask(void *pvParameters) {
    for (;;) {
        // Đọc dữ liệu
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}
\`\`\`
`;
    }
    if (editLang === "en") {
      setMarkdownContentEn((prev) => (prev.trim() ? prev + "\n\n" + tpl : tpl));
    } else {
      setMarkdownContent((prev) => (prev.trim() ? prev + "\n\n" + tpl : tpl));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMsg({ type: "error", text: "Vui lòng nhập tiêu đề bài học (Tiếng Việt)." });
      return;
    }

    if (hasVideo && !videoUrl.trim()) {
      setStatusMsg({
        type: "error",
        text: "Bạn đã tích chọn 'Kèm Video', vui lòng nhập Link YouTube hoặc bỏ tích nếu là bài đọc lý thuyết.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);

    try {
      // Biên dịch Markdown sang HTML chuẩn Lab cho cả 2 ngôn ngữ
      const compiledHtmlVi = markdownToLabHtml(markdownContent);
      const compiledHtmlEn = markdownContentEn.trim() ? markdownToLabHtml(markdownContentEn) : undefined;

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
                  titleEn: titleEn.trim() || undefined,
                  duration: duration.trim() || "20 phút",
                  hasVideo,
                  videoUrl: hasVideo && videoUrl.trim() ? videoUrl.trim() : undefined,
                  summary: summary.trim() || undefined,
                  summaryEn: summaryEn.trim() || undefined,
                  codeSnippet: codeSnippet.trim() || undefined,
                  contentHtml: compiledHtmlVi,
                  contentHtmlEn: compiledHtmlEn,
                  contentMarkdown: markdownContent,
                  contentMarkdownEn: markdownContentEn,
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
        titleEn: titleEn.trim() || undefined,
        duration: duration.trim() || "20 phút",
        hasVideo,
        videoUrl: hasVideo && videoUrl.trim() ? videoUrl.trim() : undefined,
        summary: summary.trim() || undefined,
        summaryEn: summaryEn.trim() || undefined,
        codeSnippet: codeSnippet.trim() || undefined,
        contentHtml: compiledHtmlVi,
        contentHtmlEn: compiledHtmlEn,
        contentMarkdown: markdownContent,
        contentMarkdownEn: markdownContentEn,
      };

      const updatedCourseObj: CourseData = {
        ...course,
        curriculum: updatedCurriculum,
      };

      onLessonUpdated(updatedLessonObj, updatedCourseObj);
      window.dispatchEvent(new CustomEvent("embedded_courses_updated"));
      setStatusMsg({ type: "success", text: "🎉 Đã lưu bài học thành công vào hệ thống!" });
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: "error", text: `Lỗi: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fadeIn">
      <div className="bg-bg-panel border border-border/90 rounded-3xl w-full max-w-5xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between bg-bg-elevated/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider block">
                  {currentLesson.moduleTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bg-elevated border border-border text-text-muted">
                  {hasVideo ? "🎬 Có Video" : "📄 Bài đọc"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary">
                Soạn Thảo Trực Tiếp Bài Học Bằng Markdown
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-bg-elevated hover:bg-bg-code text-text-muted hover:text-text-primary transition-colors border border-border cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
                statusMsg.type === "success"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/15 border-red-500/30 text-red-400"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* TAB CHỌN NGÔN NGỮ SOẠN THẢO */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-bg-elevated border border-border/80">
            <button
              type="button"
              onClick={() => setEditLang("vi")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                editLang === "vi"
                  ? "bg-accent text-white shadow-md"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-code"
              }`}
            >
              <span>🇻🇳 Soạn Thảo Tiếng Việt</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20">Mặc định</span>
            </button>
            <button
              type="button"
              onClick={() => setEditLang("en")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                editLang === "en"
                  ? "bg-accent text-white shadow-md"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-code"
              }`}
            >
              <span>🇬🇧 Edit English Content</span>
              {titleEn.trim() ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">✓ Đã có</span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Chưa có</span>
              )}
            </button>
          </div>

          {/* Thông tin cơ bản bài học theo ngôn ngữ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-bg-elevated/40 border border-border/80">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                {editLang === "vi" ? (
                  <>Tiêu đề bài học (Tiếng Việt) <span className="text-red-400">*</span></>
                ) : (
                  <>Lesson Title (English) <span className="text-text-muted font-normal text-[10px]">(Tùy chọn)</span></>
                )}
              </label>
              {editLang === "vi" ? (
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: BÀI 01: TỔNG QUAN VÀ BLINK LED"
                  className="w-full px-3 py-1.5 rounded-xl bg-bg-panel border border-border text-xs font-semibold text-text-primary focus:outline-none focus:border-accent"
                />
              ) : (
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. LESSON 01: STM32 OVERVIEW AND FIRST BLINK LED"
                  className="w-full px-3 py-1.5 rounded-xl bg-bg-panel border border-border text-xs font-semibold text-text-primary focus:outline-none focus:border-accent"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-accent" />
                Thời lượng:
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="VD: 45 phút"
                className="w-full px-3 py-1.5 rounded-xl bg-bg-panel border border-border text-xs font-medium text-text-primary"
              />
            </div>
          </div>

          {/* TÍCH CHỌN: CÓ KÈM THEO VIDEO HAY KHÔNG */}
          <div className="p-3.5 rounded-2xl bg-bg-elevated/50 border border-border/90 space-y-2.5">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasVideo}
                onChange={(e) => setHasVideo(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-accent focus:ring-accent border-border"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Video className={`w-3.5 h-3.5 ${hasVideo ? "text-accent" : "text-text-muted"}`} />
                  <span className="text-xs font-bold text-text-primary">
                    Bài học này có kèm theo Video bài giảng
                  </span>
                </div>
                <span className="text-[11px] text-text-muted block">
                  {hasVideo
                    ? "Hệ thống sẽ nhúng video bài giảng (hỗ trợ OneDrive, YouTube, Drive, file MP4...)."
                    : "Bài học dạng văn bản / tài liệu lý thuyết & thực hành mã nguồn (Không video)."}
                </span>
              </div>
            </label>

            {hasVideo && (
              <div className="pl-7 pt-1 border-t border-border/40 space-y-1.5 animate-fadeIn">
                <label className="block text-[11px] font-bold text-text-secondary flex items-center gap-1">
                  <Video className="w-3 h-3 text-accent" />
                  Link Video bài giảng (OneDrive, YouTube, Drive, MP4...):
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Dán link OneDrive, YouTube, Google Drive, Vimeo hoặc file MP4..."
                  className="w-full px-3 py-1.5 rounded-xl bg-bg-panel border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>

          {/* Tóm tắt bài học */}
          <div>
            <label className="block text-[11px] font-bold text-text-secondary mb-1">
              {editLang === "vi" ? "Tóm tắt trọng tâm bài học (Tiếng Việt):" : "Lesson Summary & Key Points (English):"}
            </label>
            {editLang === "vi" ? (
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Nêu ngắn gọn nội dung và mục tiêu cần đạt..."
                className="w-full px-3 py-1.5 rounded-xl bg-bg-elevated/70 border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            ) : (
              <input
                type="text"
                value={summaryEn}
                onChange={(e) => setSummaryEn(e.target.value)}
                placeholder="Brief summary of key objectives in English..."
                className="w-full px-3 py-1.5 rounded-xl bg-bg-elevated/70 border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            )}
          </div>

          {/* Trình soạn thảo Markdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold text-text-primary flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-accent" />
                <span>
                  {editLang === "vi"
                    ? "Nội Dung Giáo Trình Tiếng Việt (Markdown):"
                    : "English Syllabus Content (Markdown):"}
                </span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-text-muted">Chèn mẫu:</span>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate("stm32")}
                  className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-semibold hover:bg-cyan-500/20 cursor-pointer"
                >
                  + STM32
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate("rtos")}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-semibold hover:bg-amber-500/20 cursor-pointer"
                >
                  + FreeRTOS
                </button>
              </div>
            </div>

            <div className="border border-border/80 rounded-2xl overflow-hidden shadow-inner">
              {editLang === "vi" ? (
                <TechMarkdownEditor
                  key="editor-vi"
                  value={markdownContent}
                  onChange={setMarkdownContent}
                  placeholder="Viết giáo trình bài học bằng Markdown Tiếng Việt tại đây... Hỗ trợ ## Tiêu đề, ```c Code, | Bảng |, > [!NOTE] Ghi chú..."
                  minHeight="320px"
                />
              ) : (
                <TechMarkdownEditor
                  key="editor-en"
                  value={markdownContentEn}
                  onChange={setMarkdownContentEn}
                  placeholder="Write lesson syllabus in English Markdown here... Support ## Headings, ```c Code, | Tables |, > [!NOTE] Alerts..."
                  minHeight="320px"
                />
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-bg-panel py-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-2 rounded-xl shadow-lg hover:scale-102 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Đang lưu..." : "Lưu Bài Học Ngay"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
