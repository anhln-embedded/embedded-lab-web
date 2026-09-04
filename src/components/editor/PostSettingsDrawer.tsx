"use client";

import React, { useState } from "react";
import {
  X,
  Tag,
  Image as ImageIcon,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
  FileText,
  Bookmark,
  ExternalLink,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LAB_PRESET_IMAGES } from "@/components/editor/EditorModals";

export interface PostSettingsData {
  slug: string;
  excerpt: string;
  postType: string;
  tags: string[];
  coverImage: string;
  series: string;
  readingTime: number;
}

interface PostSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: PostSettingsData;
  onChange: (data: Partial<PostSettingsData>) => void;
  title: string;
}

const COMMON_TAGS = [
  "embedded",
  "aiot",
  "stm32",
  "esp32",
  "freertos",
  "linux",
  "tinyml",
  "fpga",
  "pcb",
  "hardware",
  "c-cpp",
  "firmware",
  "zephyr",
  "riscv",
];

const POST_TYPES = [
  { id: "technical", label: "⚡ Chia sẻ Kỹ thuật", desc: "Firmware, mạch điện, giải thuật nhúng" },
  { id: "daily", label: "🔬 Nhật ký Lab", desc: "Tiến độ thực nghiệm, kết quả đo bàn test" },
  { id: "recruitment", label: "📢 Tuyển thành viên", desc: "Chiêu mộ CTV, sinh viên NCKH mới" },
  { id: "event", label: "🏆 Sự kiện & Workshop", desc: "Hội thảo, giải thưởng, sinh hoạt chuyên đề" },
  { id: "general", label: "📌 Thông báo chung", desc: "Tin tức tổng hợp từ ban chủ nhiệm" },
];

export function PostSettingsDrawer({
  isOpen,
  onClose,
  data,
  onChange,
  title,
}: PostSettingsDrawerProps) {
  const [customTag, setCustomTag] = useState("");
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    if (data.tags.includes(tag)) {
      onChange({ tags: data.tags.filter((t) => t !== tag) });
    } else {
      onChange({ tags: [...data.tags, tag] });
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customTag.trim()) {
      e.preventDefault();
      const clean = customTag.trim().toLowerCase().replace(/\s+/g, "-");
      if (!data.tags.includes(clean)) {
        onChange({ tags: [...data.tags, clean] });
      }
      setCustomTag("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-bg-panel border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-bg-elevated/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Cài Đặt Bài Viết (Settings)</h3>
              <p className="text-[11px] text-text-muted">Thể loại, thẻ tag, ảnh bìa & SEO</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* 1. THỂ LOẠI BÀI VIẾT */}
          <div className="space-y-2">
            <label className="font-bold text-text-primary flex items-center gap-1.5">
              <span>Chuyên mục / Thể loại bài</span>
              <span className="text-accent">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {POST_TYPES.map((type) => {
                const isSelected = data.postType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => onChange({ postType: type.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? "border-accent bg-accent/15 text-text-primary shadow-xs ring-1 ring-accent/30"
                        : "border-border bg-bg-elevated/60 text-text-muted hover:border-border-strong hover:text-text-secondary"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-bold text-xs text-text-primary">{type.label}</div>
                      <div className="text-[10px] text-text-muted">{type.desc}</div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ẢNH BÌA (COVER IMAGE) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-text-primary flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-accent" />
                <span>Ảnh bìa (Cover Thumbnail)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPresetPicker(!showPresetPicker)}
                className="text-[11px] text-accent hover:underline font-semibold"
              >
                {showPresetPicker ? "Đóng kho ảnh" : "Chọn ảnh Lab có sẵn"}
              </button>
            </div>

            {/* Preview ảnh bìa hiện tại */}
            {data.coverImage && (
              <div className="relative rounded-xl overflow-hidden border border-border bg-black/20 aspect-video max-h-36">
                <img
                  src={data.coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onChange({ coverImage: "/images/logo.png" })}
                  className="absolute top-2 right-2 p-1 rounded-md bg-black/70 text-white text-[10px] hover:bg-red-500 transition-colors"
                >
                  Đặt lại mặc định
                </button>
              </div>
            )}

            <input
              type="text"
              value={data.coverImage}
              onChange={(e) => onChange({ coverImage: e.target.value })}
              placeholder="Nhập URL ảnh hoặc chọn từ kho..."
              className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />

            {/* Preset Images Grid */}
            {showPresetPicker && (
              <div className="p-3 rounded-xl bg-bg-elevated border border-border space-y-2">
                <span className="text-[10px] text-text-muted font-bold block">
                  Kho ảnh chuẩn Lab:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {LAB_PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange({ coverImage: img.url });
                        setShowPresetPicker(false);
                      }}
                      className="group relative rounded-lg overflow-hidden border border-border hover:border-accent aspect-video transition-all cursor-pointer"
                      title={img.label}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white font-bold text-center p-1 transition-opacity">
                        {img.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. THẺ TAGS KỸ THUẬT */}
          <div className="space-y-2">
            <label className="font-bold text-text-primary flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-accent" />
              <span>Thẻ Tags kỹ thuật ({data.tags.length})</span>
            </label>

            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const isSelected = data.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-accent text-white border-accent font-bold shadow-xs"
                        : "bg-bg-elevated text-text-muted border-border hover:border-border-strong hover:text-text-primary"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Nhập thêm tag khác rồi nhấn Enter..."
              className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent font-mono"
            />
          </div>

          {/* 4. ĐƯỜNG DẪN TĨNH (SLUG) */}
          <div className="space-y-1.5">
            <label className="font-bold text-text-primary flex items-center gap-1.5">
              <span>Đường dẫn bài viết (URL Slug)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-text-muted text-[11px] font-mono select-none">/blog/</span>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => onChange({ slug: e.target.value })}
                placeholder="kinh-nghiem-thiet-ke-mach"
                className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <p className="text-[10px] text-text-muted">
              Tự động sinh từ tiêu đề bài viết. Chỉ sửa nếu bạn muốn tùy biến SEO URL.
            </p>
          </div>

          {/* 5. SERIES & THỜI GIAN ĐỌC */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div className="space-y-1">
              <label className="font-bold text-text-primary flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-accent" />
                <span>Chuỗi (Series)</span>
              </label>
              <input
                type="text"
                value={data.series}
                onChange={(e) => onChange({ series: e.target.value })}
                placeholder="VD: STM32 Mastery"
                className="w-full px-2.5 py-1.5 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-primary flex items-center gap-1">
                <Clock className="w-3 h-3 text-accent" />
                <span>Thời gian đọc (phút)</span>
              </label>
              <input
                type="number"
                min={1}
                value={data.readingTime}
                onChange={(e) => onChange({ readingTime: Number(e.target.value) || 5 })}
                className="w-full px-2.5 py-1.5 bg-bg-elevated border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border bg-bg-elevated/40 flex items-center justify-end">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
            className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-5 py-2 rounded-xl"
          >
            Hoàn Tất Cài Đặt
          </Button>
        </div>
      </div>
    </div>
  );
}
