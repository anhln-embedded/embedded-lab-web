"use client";

import React, { useState, useEffect } from "react";
import { LessonData } from "@/lib/content";
import { TechMarkdownEditor } from "@/components/editor/TechMarkdownEditor";
import { markdownToLabHtml } from "@/lib/markdown-importer";
import { Button } from "@/components/ui/Button";
import {
  X,
  Save,
  Video,
  FileText,
  Clock,
  Sparkles,
  BookOpen,
  Code,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Lightbulb,
  Cpu,
  Layers,
  HelpCircle
} from "lucide-react";

interface LessonMarkdownEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle?: string;
  lesson: LessonData;
  onSave: (updatedLesson: LessonData) => void;
}

export function LessonMarkdownEditorModal({
  isOpen,
  onClose,
  moduleTitle = "Học phần khóa học",
  lesson,
  onSave,
}: LessonMarkdownEditorModalProps) {
  const [title, setTitle] = useState(lesson.title || "");
  const [duration, setDuration] = useState(lesson.duration || "20 phút");
  const [free, setFree] = useState(lesson.free !== undefined ? lesson.free : true);
  
  // TÍCH CHỌN: Có kèm video hay không
  const [hasVideo, setHasVideo] = useState<boolean>(
    lesson.hasVideo !== undefined
      ? lesson.hasVideo
      : Boolean(lesson.videoUrl && lesson.videoUrl.trim().length > 0)
  );
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [summary, setSummary] = useState(lesson.summary || "");
  const [codeSnippet, setCodeSnippet] = useState(lesson.codeSnippet || "");

  // Markdown content (nếu có contentMarkdown thì dùng, nếu không thì dùng contentHtml làm khởi đầu)
  const [markdownContent, setMarkdownContent] = useState(
    lesson.contentMarkdown || lesson.contentHtml || ""
  );

  const [activeSubTab, setActiveSubTab] = useState<"markdown" | "details">("markdown");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when lesson prop changes
  useEffect(() => {
    setTitle(lesson.title || "");
    setDuration(lesson.duration || "20 phút");
    setFree(lesson.free !== undefined ? lesson.free : true);
    setHasVideo(
      lesson.hasVideo !== undefined
        ? lesson.hasVideo
        : Boolean(lesson.videoUrl && lesson.videoUrl.trim().length > 0)
    );
    setVideoUrl(lesson.videoUrl || "");
    setSummary(lesson.summary || "");
    setCodeSnippet(lesson.codeSnippet || "");
    setMarkdownContent(lesson.contentMarkdown || lesson.contentHtml || "");
    setErrorMsg(null);
  }, [lesson, isOpen]);

  if (!isOpen) return null;

  // Chèn mẫu giáo trình Markdown nhanh
  const handleInsertTemplate = (type: "stm32" | "rtos" | "tinyml") => {
    let template = "";
    if (type === "stm32") {
      template = `## 🎯 1. Mục Tiêu Bài Học
- Hiểu rõ kiến trúc phần cứng và nguyên lý hoạt động của khối ngoại vi.
- Nắm vững cấu trúc các thanh ghi cấu hình (Control & Status Registers).
- Tự tay lập trình cấu hình thanh ghi trên vi điều khiển và đo kiểm tín hiệu thực tế.

---

## ⚡ 2. Kiến Trúc Cốt Lõi & Bảng Thanh Ghi
Khối ngoại vi được kết nối vào bus APB/AHB với các thanh ghi điều khiển chính:

| Thanh Ghi | Địa Chỉ Offset | Chức Năng Cốt Lõi | Giá Trị Reset |
| :--- | :--- | :--- | :--- |
| **CR1** | \`0x00\` | Bật/tắt ngoại vi và thiết lập chế độ hoạt động | \`0x00000000\` |
| **CR2** | \`0x04\` | Cấu hình ngắt (Interrupt) & DMA Transfer | \`0x00000000\` |
| **SR**  | \`0x08\` | Cờ trạng thái phần cứng (TXE, RXNE, TC) | \`0x000000C0\` |
| **DR**  | \`0x0C\` | Bộ đệm dữ liệu truyền/nhận (Data Register) | \`0x00000000\` |

> [!NOTE]
> **Lưu ý quan trọng**: Trước khi ghi dữ liệu vào các thanh ghi ngoại vi, bắt buộc phải cấp xung clock tương ứng tại khối **RCC (Reset and Clock Control)**.

---

## 💻 3. Hướng Dẫn Thực Hành & Triển Khai Mã Nguồn
Các bước thực hiện trên bo mạch phát triển:
1. Cấp clock ngoại vi thông qua \`RCC->AHB1ENR\` hoặc \`RCC->APB1ENR\`.
2. Cấu hình chân GPIO sang chế độ Alternate Function (\`AF\`).
3. Cài đặt tốc độ Baudrate / Tần số hoạt động.
4. Kích hoạt ngoại vi và kiểm tra trạng thái truyền nhận.
`;
    } else if (type === "rtos") {
      template = `## 🎯 1. Mục Tiêu Học Phần FreeRTOS
- Phân tích cơ chế chuyển ngữ cảnh (Context Switching) trong hệ điều hành thời gian thực.
- Ứng dụng Task, Queue, Binary/Counting Semaphore trong bài toán điều khiển đa luồng.
- Tránh các lỗi kinh điển: Deadlock, Priority Inversion và Starvation.

---

## ⏱️ 2. Mô Hình Đa Nhiệm & Quản Lý Task
Trong FreeRTOS, mỗi Task hoạt động độc lập như một luồng xử lý riêng biệt:

\`\`\`c
// Khởi tạo Task điều khiển cảm biến
void vSensorTask(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xFrequency = pdMS_TO_TICKS(100); // Chu kỳ 100ms

    for (;;) {
        // Đọc dữ liệu từ cảm biến I2C/SPI
        read_sensor_data();
        
        // Trì hoãn chính xác chu kỳ thời gian thực
        vTaskDelayUntil(&xLastWakeTime, xFrequency);
    }
}
\`\`\`

> [!TIP]
> Ưu tiên sử dụng \`vTaskDelayUntil()\` thay vì \`vTaskDelay()\` khi thiết kế các tác vụ yêu cầu chu kỳ lấy mẫu thời gian thực nghiêm ngặt.
`;
    } else if (type === "tinyml") {
      template = `## 🎯 1. Tổng Quan Kiến Trúc Mô Hình Edge AI
Triển khai mô hình học sâu rút gọn trực tiếp trên vi điều khiển ARM Cortex-M (TinyML) nhằm phát hiện sớm các bất thường cơ khí với độ trễ thấp và tiết kiệm năng lượng.

---

## 🧠 2. Quy Trình Thu Thập & Xử Lý Tín Hiệu
1. Thu thập dữ liệu rung động từ cảm biến gia tốc với tần số lấy mẫu 1.6kHz.
2. Tiền xử lý trích xuất đặc trưng qua thuật toán FFT và chuẩn hóa tín hiệu.
3. Suy luận mô hình INT8 Quantized qua TensorFlow Lite for Microcontrollers (TFLM).
`;
    }

    if (markdownContent.trim()) {
      if (window.confirm("Bạn có muốn chèn thêm khung mẫu này vào nội dung hiện tại không?")) {
        setMarkdownContent((prev) => prev + "\n\n" + template);
      }
    } else {
      setMarkdownContent(template);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề bài học.");
      return;
    }

    // Nếu người dùng chọn có video nhưng link video trống
    if (hasVideo && !videoUrl.trim()) {
      setErrorMsg("Bạn đã tích chọn 'Kèm Video bài giảng', vui lòng nhập Link Video YouTube hoặc bỏ tích nếu chỉ là bài đọc lý thuyết.");
      return;
    }

    // Tự động chuyển đổi Markdown sang HTML chuẩn của Lab
    const compiledHtml = markdownToLabHtml(markdownContent);

    const updated: LessonData = {
      ...lesson,
      title: title.trim(),
      duration: duration.trim() || "20 phút",
      free,
      hasVideo,
      videoUrl: hasVideo && videoUrl.trim() ? videoUrl.trim() : undefined,
      summary: summary.trim() || undefined,
      codeSnippet: codeSnippet.trim() || undefined,
      contentHtml: compiledHtml,
      contentMarkdown: markdownContent,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fadeIn">
      <div className="bg-bg-panel border border-border/90 rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between bg-bg-elevated/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">
                  {moduleTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bg-elevated border border-border text-text-muted">
                  {hasVideo ? "🎬 Video + Lý thuyết" : "📄 Bài đọc / Tài liệu"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-text-primary">
                Soạn Thảo Bài Học Bằng Markdown & Video
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-bg-elevated hover:bg-bg-code text-text-muted hover:text-text-primary transition-colors border border-border cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-500/15 border-b border-rose-500/30 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-rose-400 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation Tabs between Markdown Content and Lesson Settings */}
        <div className="px-5 pt-3 pb-2 border-b border-border/60 bg-bg-elevated/20 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab("markdown")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === "markdown"
                  ? "bg-accent text-white shadow-sm"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Soạn Thảo Nội Dung (Markdown)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("details")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === "details"
                  ? "bg-accent text-white shadow-sm"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>2. Cài Đặt Video & Tóm Tắt Bài</span>
            </button>
          </div>

          {/* Quick Template Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-muted hidden md:inline">
              Chèn khung mẫu:
            </span>
            <button
              type="button"
              onClick={() => handleInsertTemplate("stm32")}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold transition-all cursor-pointer"
              title="Chèn khung bài giảng STM32 & Thanh ghi"
            >
              + STM32/MCU
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate("rtos")}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold transition-all cursor-pointer"
              title="Chèn khung bài giảng FreeRTOS"
            >
              + FreeRTOS
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate("tinyml")}
              className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-semibold transition-all cursor-pointer"
              title="Chèn khung bài giảng TinyML & Edge AI"
            >
              + TinyML
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col space-y-4">
          {/* Quick Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-2xl bg-bg-elevated/40 border border-border/80">
            {/* Title */}
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Tiêu đề bài học <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Bài 1: Cấu hình thanh ghi GPIO và đo xung nhịp"
                className="w-full px-3 py-1.5 rounded-xl bg-bg-panel border border-border text-xs font-semibold text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            {/* Duration */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-accent" />
                Thời lượng:
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="VD: 25 phút"
                className="w-full px-3 py-1.5 rounded-xl bg-bg-panel border border-border text-xs font-medium text-text-primary"
              />
            </div>

            {/* Free checkbox */}
            <div className="sm:col-span-3 flex items-center gap-2 pt-4 sm:pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={free}
                  onChange={(e) => setFree(e.target.checked)}
                  className="w-4 h-4 rounded text-accent focus:ring-accent border-border"
                />
                <span className="text-xs font-bold text-text-primary">
                  Học thử miễn phí (Free)
                </span>
              </label>
            </div>
          </div>

          {/* TAB 1: Markdown Content Editor */}
          {activeSubTab === "markdown" && (
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <span>Nội Dung Giáo Trình Bài Học (Hỗ Trợ Markdown & C Code & Bảng Thanh Ghi):</span>
                </label>
                <span className="text-[11px] text-text-muted">
                  💡 Hỗ trợ: Tiêu đề ##, bảng | Cột |, code \`\`\`c, callout &gt; [!NOTE]
                </span>
              </div>

              <div className="flex-1 min-h-[380px] rounded-2xl overflow-hidden border border-border/80 shadow-inner">
                <TechMarkdownEditor
                  value={markdownContent}
                  onChange={setMarkdownContent}
                  placeholder="Bắt đầu soạn thảo giáo trình bài học bằng Markdown tại đây... Bạn có thể chia đôi màn hình (Split View) để vừa viết vừa xem Live Preview!"
                  minHeight="380px"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Video & Additional Details */}
          {activeSubTab === "details" && (
            <div className="space-y-4">
              {/* VIDEO CHECKBOX TOGGLE - YÊU CẦU NGƯỜI DÙNG */}
              <div className="p-4 rounded-2xl bg-bg-elevated/60 border border-border/90 space-y-3">
                <label className="flex items-start gap-3.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasVideo}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasVideo(checked);
                      if (!checked) {
                        // Tắt video
                        setErrorMsg(null);
                      }
                    }}
                    className="w-5 h-5 mt-0.5 rounded-lg text-accent focus:ring-accent border-border"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Video className={`w-4 h-4 ${hasVideo ? "text-accent" : "text-text-muted"}`} />
                      <span className="text-xs sm:text-sm font-extrabold text-text-primary">
                        Bài học này có kèm Video bài giảng (Video Lecture)
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {hasVideo
                        ? "✅ Trình phát video YouTube sẽ được nhúng trên trang bài học. Người học có thể vừa xem video vừa thực hành."
                        : "❌ Bài học này chỉ là bài đọc lý thuyết, tài liệu hướng dẫn kỹ thuật hoặc mã nguồn thực hành (Không nhúng video)."}
                    </p>
                  </div>
                </label>

                {/* Video URL Input - Only shown if hasVideo is checked */}
                {hasVideo && (
                  <div className="pl-8 pt-2 border-t border-border/50 space-y-2 animate-fadeIn">
                    <label className="block text-xs font-bold text-text-secondary flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-accent" />
                      <span>Đường dẫn Video YouTube (YouTube Video URL):</span>
                    </label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="VD: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      className="w-full px-3.5 py-2 rounded-xl bg-bg-panel border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                    <span className="text-[11px] text-text-muted block">
                      💡 Hỗ trợ mọi link YouTube chuẩn (dạng: https://www.youtube.com/watch?v=... hoặc https://youtu.be/...)
                    </span>
                  </div>
                )}
              </div>

              {/* Lesson Summary */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">
                  Tóm tắt trọng tâm bài học (Hiển thị đầu bài):
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Nêu ngắn gọn nội dung và mục tiêu cần đạt trong bài học..."
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-elevated/70 border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              {/* Code Snippet for Lab Practice */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary flex items-center gap-1.5 font-mono">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  Mã nguồn mẫu thực hành độc lập (C/C++ Code Snippet):
                </label>
                <textarea
                  rows={5}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="#include <stdint.h>&#10;&#10;void main(void) {&#10;    // Mã nguồn thực hành Lab...&#10;}"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 dark:bg-black border border-slate-800 text-xs font-mono text-emerald-400 leading-relaxed focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          {/* Footer Submit Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-3 mt-auto">
            <div className="text-[11px] text-text-muted hidden sm:flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nội dung Markdown sẽ tự động được biên dịch sang định dạng chuẩn Lab khi lưu.</span>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg hover:scale-102 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 mr-1.5" />
                Lưu Bài Học Ngay
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
