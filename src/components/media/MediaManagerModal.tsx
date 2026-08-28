"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  Search,
  ExternalLink,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface MediaItem {
  name: string;
  url: string;
  size: number;
  createdAt: string;
  source: "disk" | "db";
}

interface MediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (url: string, alt?: string, caption?: string) => void;
}

export function MediaManagerModal({
  isOpen,
  onClose,
  onSelectImage,
}: MediaManagerModalProps) {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImg, setSelectedImg] = useState<MediaItem | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/images");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setImages(json.data);
      }
    } catch (e) {
      console.error("Failed to load images:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadImages();
      setSelectedImg(null);
      setAltText("");
      setCaption("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chỉ chọn file hình ảnh (PNG, JPG, WebP, SVG, GIF)");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        await loadImages();
        const newImg: MediaItem = {
          name: json.fileName || file.name,
          url: json.url,
          size: file.size,
          createdAt: new Date().toISOString(),
          source: "disk",
        };
        setSelectedImg(newImg);
        setAltText(file.name.replace(/\.[^/.]+$/, ""));
      } else {
        alert(json.error || "Lỗi tải ảnh lên server");
      }
    } catch (err: any) {
      alert(`Lỗi upload: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (img: MediaItem) => {
    if (!confirm(`Bạn có chắc muốn xóa ảnh "${img.name}" khỏi hệ thống?`)) return;

    try {
      const res = await fetch(`/api/images?filename=${encodeURIComponent(img.name)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setImages((prev) => prev.filter((i) => i.name !== img.name));
        if (selectedImg?.name === img.name) {
          setSelectedImg(null);
        }
      } else {
        alert(json.error || "Không thể xóa ảnh");
      }
    } catch (e) {
      alert("Lỗi khi kết nối máy chủ xóa ảnh");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleInsert = () => {
    if (!selectedImg || !onSelectImage) return;
    onSelectImage(selectedImg.url, altText.trim() || selectedImg.name, caption.trim());
    onClose();
  };

  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-bg-panel border border-border/90 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-elevated/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
                <span>Thư Viện Hình Ảnh & Sơ Đồ Mạch</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-mono">
                  {images.length} tệp
                </span>
              </h2>
              <p className="text-xs text-text-muted">
                Quản lý và tái sử dụng hình ảnh kit vi điều khiển, sơ đồ chân STM32, ESP32, FPGA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadImages}
              disabled={isLoading}
              className="text-xs text-text-secondary hover:text-accent"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar (Search & Upload) */}
        <div className="p-4 border-b border-border bg-bg-panel/60 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm hình ảnh theo tên file..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadFile(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {isUploading ? "Đang tải ảnh..." : "Tải Ảnh Mới Lên"}
            </Button>
          </div>
        </div>

        {/* Content Body: Grid & Details Sidebar */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Left Grid: Images List */}
          <div className="md:col-span-2 overflow-y-auto p-4 max-h-[55vh] md:max-h-full scrollbar-thin">
            {isLoading ? (
              <div className="py-20 text-center text-text-muted text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-accent" />
                Đang tải danh sách ảnh...
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="py-20 text-center text-text-muted text-xs border border-dashed border-border rounded-2xl p-6">
                <ImageIcon className="w-10 h-10 mx-auto mb-3 text-text-muted/40" />
                <p className="font-semibold text-text-secondary mb-1">Chưa có hình ảnh nào</p>
                <p className="text-[11px] mb-4">Hãy bấm nút &quot;Tải Ảnh Mới Lên&quot; để thêm sơ đồ mạch hoặc ảnh minh họa.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  <Upload className="w-3 h-3 mr-1.5" />
                  Chọn tệp từ máy tính
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                {filteredImages.map((img) => {
                  const isSelected = selectedImg?.name === img.name;
                  return (
                    <div
                      key={img.name}
                      onClick={() => {
                        setSelectedImg(img);
                        setAltText(img.name.replace(/\.[^/.]+$/, ""));
                      }}
                      className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? "border-accent ring-2 ring-accent/30 bg-accent/5 shadow-lg"
                          : "border-border bg-bg-elevated/40 hover:border-border/80 hover:shadow-md"
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="aspect-[4/3] bg-black/40 relative overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Zoom button on hover */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewZoom(img.url);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/80 hover:text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xem kích thước lớn"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Info */}
                      <div className="p-2.5">
                        <p className="text-[11px] font-semibold text-text-primary truncate" title={img.name}>
                          {img.name}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-text-muted mt-1 font-mono">
                          <span>{formatSize(img.size)}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-bg-panel border border-border">
                            {img.name.split(".").pop()?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Selected Image Details & Insertion Options */}
          <div className="p-5 flex flex-col justify-between overflow-y-auto bg-bg-elevated/20">
            {selectedImg ? (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/50 border border-border relative flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImg.url}
                    alt={selectedImg.name}
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setPreviewZoom(selectedImg.url)}
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text-primary truncate" title={selectedImg.name}>
                    {selectedImg.name}
                  </h4>
                  <p className="text-[10px] font-mono text-text-muted mt-0.5">
                    Kích thước: {formatSize(selectedImg.size)} • {new Date(selectedImg.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                {/* Copy URL */}
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1">
                    Đường dẫn hình ảnh
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={selectedImg.url}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-bg-panel border border-border text-[11px] font-mono text-text-secondary select-all"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(selectedImg.url)}
                      className="px-2.5 py-1.5 text-xs text-text-secondary hover:text-accent"
                      title="Copy URL"
                    >
                      {copiedUrl === selectedImg.url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1">
                    Văn bản thay thế (Alt text chuẩn SEO)
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="VD: Sơ đồ khối kiến trúc vi điều khiển STM32"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-bg-panel border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1">
                    Chú thích hình ảnh (Caption dưới ảnh - Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="VD: Hình 1.1: Sơ đồ kết nối Bus CAN và Transceiver"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-bg-panel border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(selectedImg)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa ảnh</span>
                  </button>

                  {onSelectImage && (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleInsert}
                      className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Chèn Vào Bài Viết
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-muted text-xs p-4">
                <ImageIcon className="w-8 h-8 mb-2 opacity-30 text-accent" />
                <p className="font-semibold text-text-secondary">Chưa chọn hình ảnh</p>
                <p className="text-[11px] mt-1 text-text-muted">
                  Bấm chọn một ảnh ở khung bên trái để xem chi tiết, sao chép URL hoặc chèn vào bài viết.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {previewZoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
          onClick={() => setPreviewZoom(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewZoom}
            alt="Preview Zoom"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
