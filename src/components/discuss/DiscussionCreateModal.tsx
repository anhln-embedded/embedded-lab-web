"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FlairType,
  DISCUSSION_FLAIRS,
  createDiscussionThread,
  DiscussionThread,
  AttachedFile,
} from "@/lib/discussion-store";
import { Button } from "@/components/ui/Button";
import {
  X,
  PlusCircle,
  Paperclip,
  Image as ImageIcon,
  FileText,
  FileCode,
  Archive,
  File,
  Trash2,
  Lock,
  LogIn,
  AlertCircle,
  Hash,
  Send,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DiscussionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThreadCreated: (thread: DiscussionThread) => void;
}

export function DiscussionCreateModal({
  isOpen,
  onClose,
  onThreadCreated,
}: DiscussionCreateModalProps) {
  const { user, quickLogin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [flair, setFlair] = useState<FlairType>("hoi-dap");
  const [content, setContent] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [tagsInput, setTagsInput] = useState("stm32, firmware, iot");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // Xử lý upload file của người dùng
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Giới hạn dung lượng client-side 15MB để tránh lag bộ nhớ browser
      if (file.size > 15 * 1024 * 1024) {
        alert(`File "${file.name}" vượt quá kích thước cho phép (tối đa 15MB).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        let fileType: AttachedFile["type"] = "other";

        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
          fileType = "image";
        } else if (["c", "cpp", "h", "hpp", "ino", "py", "js", "ts", "asm"].includes(ext)) {
          fileType = "code";
        } else if (["pdf", "txt", "md", "docx", "doc", "rtf"].includes(ext)) {
          fileType = "document";
        } else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
          fileType = "archive";
        }

        const newFile: AttachedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          size: file.size,
          type: fileType,
          dataUrl,
        };

        setAttachedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      setErrorMsg("Bạn cần đăng nhập để có thể tạo chủ đề thảo luận.");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề chủ đề thảo luận.");
      return;
    }

    if (!content.trim()) {
      setErrorMsg("Vui lòng nhập nội dung chi tiết bài viết.");
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const newThread = createDiscussionThread({
        title,
        flair,
        content,
        attachedFiles,
        tags,
        author: {
          id: user.id,
          name: user.name,
          role: user.role,
          avatar: user.avatar || user.googleAvatar || "👨‍💻",
          bio: user.bio,
        },
      });

      setIsSubmitting(false);
      // Reset form
      setTitle("");
      setContent("");
      setAttachedFiles([]);
      onThreadCreated(newThread);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || "Đã xảy ra lỗi khi tạo chủ đề.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-bg-panel border border-border/90 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-bg-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Tạo Chủ Đề Thảo Luận Mới
              </h2>
              <p className="text-xs text-text-muted">
                Chia sẻ thắc mắc kỹ thuật, đính kèm file/ảnh hoặc trao đổi kinh nghiệm cùng cộng đồng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        {!user ? (
          /* Chưa đăng nhập */
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">
                Yêu Cầu Đăng Nhập Diễn Đàn
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
                Để bảo đảm tính văn minh và phòng chống spam, bạn cần đăng nhập tài khoản để tạo
                chủ đề và đính kèm tài liệu.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild variant="primary">
                <Link href="/login?redirect=/discuss">
                  <LogIn className="w-4 h-4 mr-2" />
                  Đăng Nhập Ngay
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  quickLogin("user");
                }}
              >
                ⚡ Đăng nhập Nhanh (Guest Demo)
              </Button>
            </div>
          </div>
        ) : (
          /* Form tạo chủ đề tinh gọn */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-8rem)] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Author bar & Phân loại Thẻ Tiền Tố */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-bg-elevated/40 border border-border/60">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-sm">
                  {user.avatar || user.googleAvatar || "👨‍💻"}
                </span>
                <div>
                  <span className="font-bold text-text-primary text-xs block">{user.name}</span>
                  <span className="text-[10px] text-accent font-medium">
                    {user.role === "superadmin"
                      ? "Quản trị viên"
                      : user.role === "admin"
                      ? "Điều hành viên"
                      : user.role === "lab_member"
                      ? "Thành viên tích cực"
                      : "Thành viên"}
                  </span>
                </div>
              </div>

              {/* Thẻ tiền tố / Flair */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-text-muted whitespace-nowrap">Thẻ phân loại:</span>
                <select
                  value={flair}
                  onChange={(e) => setFlair(e.target.value as FlairType)}
                  className="px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent font-medium"
                >
                  {Object.values(DISCUSSION_FLAIRS).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.prefix} - {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tiêu đề */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                Tiêu Đề Chủ Đề <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Làm thế nào để cấu hình DMA ADC đa kênh trên STM32F401?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary focus:outline-none focus:border-accent font-medium placeholder:text-text-muted"
                required
              />
            </div>

            {/* Nội dung */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                Nội Dung Thảo Luận <span className="text-rose-500">*</span>:
              </label>
              <textarea
                rows={5}
                placeholder="Mô tả chi tiết câu hỏi, hiện tượng mạch đo, đoạn mã cần hỗ trợ gỡ lỗi hoặc ý tưởng đồ án của bạn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs leading-relaxed text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted resize-y"
                required
              />
            </div>

            {/* KHU VỰC TẢI FILE LÊN (File Uploader) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-accent" />
                  <span>File & Hình Ảnh Đính Kèm ({attachedFiles.length}):</span>
                </label>
                <span className="text-[11px] text-text-muted">
                  Hỗ trợ: Ảnh (.png, .jpg), Code (.c, .h, .py), PDF, ZIP (Tối đa 15MB/file)
                </span>
              </div>

              {/* Input file ẩn */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFilesChange}
                multiple
                accept="image/*,.pdf,.zip,.rar,.7z,.c,.cpp,.h,.hpp,.ino,.py,.txt"
                className="hidden"
              />

              {/* Dropzone / Upload Trigger Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-accent/60 bg-bg-elevated/30 hover:bg-bg-elevated/70 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 group"
              >
                <div className="p-2.5 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                  Nhấp để tải file lên từ máy tính
                </span>
                <span className="text-[11px] text-text-muted">
                  Đính kèm sơ đồ nguyên lý mạch, ảnh dạng sóng đo kiểm hoặc file mã nguồn nén
                </span>
              </div>

              {/* Danh sách file đã đính kèm */}
              {attachedFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {attachedFiles.map((file) => {
                    const isImg = file.type === "image";
                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-bg-elevated border border-border/80 text-xs shadow-sm relative group"
                      >
                        {isImg ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-border/60 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={file.dataUrl}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                            {file.type === "code" ? (
                              <FileCode className="w-5 h-5" />
                            ) : file.type === "document" ? (
                              <FileText className="w-5 h-5" />
                            ) : file.type === "archive" ? (
                              <Archive className="w-5 h-5" />
                            ) : (
                              <File className="w-5 h-5" />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0 pr-6">
                          <span className="font-semibold text-text-primary block truncate text-[11px]" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {formatFileSize(file.size)}
                          </span>
                        </div>

                        {/* Nút Xóa File */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="absolute right-2 top-2 p-1 rounded-md text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Xóa file này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                Thẻ Tag (phân cách bằng dấu phẩy):
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 absolute left-3 top-3 text-text-muted" />
                <input
                  type="text"
                  placeholder="stm32, freertos, altium, tinyml"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span>Đang tải lên và đăng bài...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    Đăng Chủ Đề Ngay
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
