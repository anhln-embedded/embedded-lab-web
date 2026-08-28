"use client";

import React, { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Link as LinkIcon, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ImageUploaderButtonProps {
  onInsertImage: (markdownOrHtml: string) => void;
  className?: string;
}

export function ImageUploaderButton({ onInsertImage, className = "" }: ImageUploaderButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const altText = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    try {
      // 1. Gửi lên API Upload của server
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        const imgMarkdown = `\n\n![${altText}](${json.url})\n\n`;
        onInsertImage(imgMarkdown);
        return;
      }

      // 2. Fallback sang Base64 nếu API server có lỗi
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        if (base64Data) {
          const imgMarkdown = `\n\n![${altText}](${base64Data})\n\n`;
          onInsertImage(imgMarkdown);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn("Upload fallback to Base64:", err);
      // Fallback sang Base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        if (base64Data) {
          const imgMarkdown = `\n\n![${altText}](${base64Data})\n\n`;
          onInsertImage(imgMarkdown);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInsertByUrl = () => {
    if (!imageUrl.trim()) return;
    const altText = caption.trim() || "Hình ảnh minh họa";
    const imgMarkdown = `\n\n![${altText}](${imageUrl.trim()})\n\n`;
    onInsertImage(imgMarkdown);
    setImageUrl("");
    setCaption("");
    setShowUrlDialog(false);
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="text-[11px] h-7 px-2.5 rounded-lg border-border hover:border-accent text-text-secondary hover:text-accent font-semibold flex items-center gap-1.5 bg-bg-panel shadow-sm transition-all"
        title="Tải ảnh từ máy tính lên (Hỗ trợ PNG, JPG, WebP, SVG)"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin text-accent" />
            <span>Đang tải...</span>
          </>
        ) : (
          <>
            <ImageIcon className="w-3.5 h-3.5 text-accent" />
            <span>Tải Ảnh Từ Máy</span>
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowUrlDialog(!showUrlDialog)}
        className="text-[11px] h-7 px-2 rounded-lg border-border hover:border-accent text-text-muted hover:text-text-primary bg-bg-panel shadow-sm"
        title="Chèn ảnh từ đường dẫn URL ngoài"
      >
        <LinkIcon className="w-3 h-3" />
      </Button>

      {/* Popover Dán Link Ảnh Ngoài */}
      {showUrlDialog && (
        <div className="absolute right-0 top-9 z-30 p-3.5 rounded-2xl bg-bg-panel border border-border shadow-2xl space-y-2.5 w-80 text-xs">
          <div className="font-extrabold text-text-primary text-[11px] flex items-center justify-between border-b border-border/60 pb-2">
            <span className="flex items-center gap-1 text-accent">
              <Sparkles className="w-3 h-3" />
              <span>Chèn ảnh từ URL Internet:</span>
            </span>
            <button
              type="button"
              onClick={() => setShowUrlDialog(false)}
              className="text-text-muted hover:text-text-primary p-0.5"
            >
              ✕
            </button>
          </div>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            className="w-full px-2.5 py-1.5 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary outline-none focus:border-accent"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Chú thích ảnh (Caption)..."
            className="w-full px-2.5 py-1.5 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary outline-none focus:border-accent"
          />
          <div className="flex justify-end gap-1.5 pt-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleInsertByUrl}
              disabled={!imageUrl.trim()}
              className="text-[11px] h-7 px-3 bg-accent text-white font-bold rounded-xl"
            >
              <Check className="w-3 h-3 mr-1" />
              Chèn Ảnh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
