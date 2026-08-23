"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  MapPin,
  Users,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Check,
  X,
  ShieldCheck,
  Edit3
} from "lucide-react";
import { FacebookIcon } from "@/components/ui/FacebookIcon";

const COVER_PRESETS = [
  {
    name: "Mặc định (Hi-Tech Mesh)",
    url: "",
    preview: "linear-gradient(135deg, #07080a 0%, #161920 100%)",
  },
  {
    name: "Mạch In Xanh Neon (Cyan PCB)",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    preview: "linear-gradient(135deg, #022c22 0%, #064e3b 100%)",
  },
  {
    name: "Phòng Thí Nghiệm & Bàn Đo (Hardware Lab)",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    preview: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
  },
  {
    name: "Chip Vi Xử Lý & Bán Dẫn (Silicon Die)",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    preview: "linear-gradient(135deg, #451a03 0%, #78350f 100%)",
  },
];

const AVATAR_PRESETS = [
  {
    name: "Logo Embedded-AIoT Lab (Mặc định)",
    url: "/images/logo.png",
  },
  {
    name: "Biểu Tượng Chip Vi Xử Lý ARM",
    url: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Bo Mạch IoT & AI Camera",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80",
  },
];

const COVER_KEY = "embedded_lab_fanpage_cover";
const AVATAR_KEY = "embedded_lab_fanpage_avatar";

export function FanpageHeader() {
  const { user } = useAuth();

  const [coverUrl, setCoverUrl] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/logo.png");
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [customCoverInput, setCustomCoverInput] = useState("");
  const [customAvatarInput, setCustomAvatarInput] = useState("");

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCover = localStorage.getItem(COVER_KEY);
      const savedAvatar = localStorage.getItem(AVATAR_KEY);
      if (savedCover) setCoverUrl(savedCover);
      if (savedAvatar) setAvatarUrl(savedAvatar);
    }
  }, []);

  const handleSaveCover = (url: string) => {
    setCoverUrl(url);
    if (typeof window !== "undefined") {
      if (url) {
        localStorage.setItem(COVER_KEY, url);
      } else {
        localStorage.removeItem(COVER_KEY);
      }
      window.dispatchEvent(new Event("embedded_fanpage_branding_updated"));
    }
    setShowCoverModal(false);
  };

  const handleSaveAvatar = (url: string) => {
    const finalUrl = url || "/images/logo.png";
    setAvatarUrl(finalUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem(AVATAR_KEY, finalUrl);
      window.dispatchEvent(new Event("embedded_fanpage_branding_updated"));
    }
    setShowAvatarModal(false);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | "avatar"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (type === "cover") {
        handleSaveCover(result);
      } else {
        handleSaveAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={coverFileInputRef}
        onChange={(e) => handleFileUpload(e, "cover")}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={avatarFileInputRef}
        onChange={(e) => handleFileUpload(e, "avatar")}
        accept="image/*"
        className="hidden"
      />

      {/* Main Fanpage Header Card */}
      <div className="rounded-3xl bg-bg-panel border border-border overflow-hidden shadow-xl">
        {/* 1. Cover Photo Area */}
        <div className="relative h-48 sm:h-60 md:h-72 bg-gradient-to-r from-bg-code via-accent-muted/40 to-bg-panel border-b border-border/80 overflow-hidden group">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Embedded-AIoT Lab Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f05a28_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-panel/90 via-transparent to-black/30" />
            </>
          )}

          {/* Top Right Live Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Đang hoạt động tại Sân B9
            </span>
          </div>

          {/* Edit Cover Button (Chỉ hiển thị cho Admin / Super Admin) */}
          {user && (user.role === "superadmin" || user.role === "admin") && (
            <button
              onClick={() => setShowCoverModal(true)}
              className="absolute bottom-4 right-4 z-20 px-3 py-2 rounded-xl bg-black/75 hover:bg-black text-white text-xs font-semibold border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-xl hover:scale-105"
              title="Đổi ảnh bìa Fanpage"
            >
              <Camera className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline">Chỉnh sửa ảnh bìa</span>
              <span className="sm:hidden">Đổi ảnh bìa</span>
            </button>
          )}
        </div>

        {/* 2. Profile Info Bar */}
        <div className="p-6 md:p-8 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-14 md:-mt-20 mb-6">
            {/* Avatar & Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {/* Avatar Container with Edit Overlay */}
              <div className="relative group/avatar">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-white dark:bg-bg-panel p-1 border-4 border-white dark:border-bg-panel shadow-2xl relative flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-accent to-amber-500 p-0.5 overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt="Embedded-AIoT Lab Logo"
                      className="w-full h-full object-contain p-2 rounded-full bg-white dark:bg-bg-panel"
                    />
                  </div>

                  {/* Avatar Hover Overlay to Edit (Chỉ hiển thị cho Admin) */}
                  {user && (user.role === "superadmin" || user.role === "admin") && (
                    <button
                      onClick={() => setShowAvatarModal(true)}
                      className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-[11px] font-semibold opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
                      title="Đổi ảnh đại diện"
                    >
                      <Camera className="w-6 h-6 text-accent mb-1" />
                      <span>Đổi ảnh</span>
                    </button>
                  )}
                </div>

                {/* Verified Check Badge */}
                <div
                  className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-bg-panel"
                  title="Trang Fanpage Chính Thức"
                >
                  ✓
                </div>

                {/* Camera icon button next to avatar on mobile (Chỉ hiển thị cho Admin) */}
                {user && (user.role === "superadmin" || user.role === "admin") && (
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute bottom-0 right-7 sm:hidden p-1.5 rounded-full bg-bg-elevated border border-border text-accent shadow"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                    Embedded AIoT Laboratory
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    Fanpage Học Thuật
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary">
                  @EmbeddedAIoTLAB · Khoa Điện Tử 1 - Học viện Công nghệ Bưu chính Viễn thông
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    Sân B9 - Cơ sở Hà Đông
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    1.2k Sinh viên & Kỹ sư theo dõi
                  </span>
                </div>
              </div>
            </div>

            {/* Top Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-end">
              <Button
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
                asChild
              >
                <a
                  href="https://www.facebook.com/EmbeddedAIoTLAB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                  <span>Ghé Fanpage Facebook</span>
                </a>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs border-accent/40 text-accent hover:bg-accent/10"
                asChild
              >
                <Link href="/roadmap">
                  <GraduationCap className="w-3.5 h-3.5 mr-1" />
                  <span>Lộ trình đào tạo</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Slogan description */}
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/60 pt-4">
            🔬 <strong>Bảng Tin Hoạt Động Chính Thức:</strong> Nơi cập nhật các thông báo tuyển thành viên, nhật ký nghiên cứu bàn đo, đề tài NCKH sinh viên và hướng dẫn kỹ thuật chuyên sâu về Hệ thống nhúng (Embedded RTOS, Linux), Trí tuệ nhân tạo biên (TinyML), Thiết kế vi mạch (FPGA RISC-V) và Mạch in cao tốc (PCB).
          </p>
        </div>
      </div>

      {/* Modal 1: Change Cover Photo */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-panel border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                  🖼️
                </div>
                <h3 className="font-bold text-base text-text-primary">
                  Cập Nhật Ảnh Bìa Fanpage
                </h3>
              </div>
              <button
                onClick={() => setShowCoverModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Option A: Upload from computer */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary">
                1. Tải ảnh lên từ máy tính của bạn:
              </label>
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-accent/40 rounded-2xl bg-accent-muted/10 hover:bg-accent-muted/20 text-accent transition-all flex flex-col items-center justify-center gap-1.5 font-semibold text-xs"
              >
                <Upload className="w-6 h-6" />
                <span>Bấm vào đây để chọn tệp ảnh từ máy (PNG, JPG, WebP)</span>
                <span className="text-[10px] text-text-muted font-normal">Hỗ trợ ảnh chất lượng cao lên đến 5MB</span>
              </button>
            </div>

            {/* Option B: Enter image URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                2. Hoặc nhập đường dẫn ảnh (URL):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCoverInput}
                  onChange={(e) => setCustomCoverInput(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (customCoverInput.trim()) {
                      handleSaveCover(customCoverInput.trim());
                    }
                  }}
                  className="bg-accent text-white text-xs px-4"
                >
                  Áp dụng
                </Button>
              </div>
            </div>

            {/* Option C: Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary">
                3. Hoặc chọn mẫu có sẵn của Lab:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COVER_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSaveCover(p.url)}
                    className="p-2.5 rounded-xl bg-bg-elevated border border-border hover:border-accent text-left text-xs font-medium text-text-secondary hover:text-text-primary transition-all flex items-center gap-2"
                  >
                    <div
                      className="w-6 h-6 rounded-md border border-border flex-shrink-0"
                      style={{ background: p.preview }}
                    />
                    <span className="line-clamp-1">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/80">
              <button
                type="button"
                onClick={() => handleSaveCover("")}
                className="text-xs text-text-muted hover:text-red-400 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục mặc định</span>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCoverModal(false)}
                className="text-xs"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Change Avatar / Logo */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-panel border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                  👤
                </div>
                <h3 className="font-bold text-base text-text-primary">
                  Cập Nhật Ảnh Đại Diện (Logo Fanpage)
                </h3>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current preview */}
            <div className="flex items-center justify-center py-2">
              <div className="w-24 h-24 rounded-full bg-bg-code p-1 border-4 border-accent shadow-lg">
                <img
                  src={avatarUrl}
                  alt="Preview Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {/* Option A: Upload from computer */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary">
                1. Tải ảnh đại diện từ máy tính:
              </label>
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                className="w-full py-3.5 border-2 border-dashed border-accent/40 rounded-2xl bg-accent-muted/10 hover:bg-accent-muted/20 text-accent transition-all flex flex-col items-center justify-center gap-1 font-semibold text-xs"
              >
                <Upload className="w-5 h-5" />
                <span>Bấm vào đây để tải logo / ảnh đại diện từ máy</span>
              </button>
            </div>

            {/* Option B: Enter image URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                2. Hoặc nhập link ảnh URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  placeholder="/images/logo.png hoặc URL ảnh..."
                  className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (customAvatarInput.trim()) {
                      handleSaveAvatar(customAvatarInput.trim());
                    }
                  }}
                  className="bg-accent text-white text-xs px-4"
                >
                  Lưu
                </Button>
              </div>
            </div>

            {/* Option C: Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary">
                3. Hoặc chọn mẫu logo chuẩn:
              </label>
              <div className="space-y-2">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSaveAvatar(p.url)}
                    className="w-full p-2 rounded-xl bg-bg-elevated border border-border hover:border-accent text-left text-xs font-medium text-text-secondary hover:text-text-primary transition-all flex items-center gap-3"
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover bg-bg-code border border-border"
                    />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/80">
              <button
                type="button"
                onClick={() => handleSaveAvatar("/images/logo.png")}
                className="text-xs text-text-muted hover:text-red-400 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục Logo Lab gốc</span>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAvatarModal(false)}
                className="text-xs"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
