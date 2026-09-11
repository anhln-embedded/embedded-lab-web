"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, useAuth } from "@/context/AuthContext";
import {
  X,
  User as UserIcon,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Camera,
  Upload,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updatedUser: User) => void;
}

// Google "G" Icon component
function GoogleGIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function EditProfileModal({ isOpen, onClose, onUpdated }: EditProfileModalProps) {
  const { user, loginWithOAuth } = useAuth();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and detect Google Avatar
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
      setSuccessMsg(null);
      setErrorMsg(null);

      // Detect & Cache Google avatar
      const cachedGoogle =
        typeof window !== "undefined"
          ? localStorage.getItem(`google_avatar_${user.email}`)
          : null;

      const detected =
        user.googleAvatar ||
        cachedGoogle ||
        (user.avatar && user.avatar.includes("googleusercontent.com") ? user.avatar : null);

      if (detected) {
        setGoogleAvatarUrl(detected);
        if (typeof window !== "undefined") {
          localStorage.setItem(`google_avatar_${user.email}`, detected);
        }
      }
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Smart suggestion: strip student code like "B20DCDT011-" to get pure full name
  const studentCodeMatch = name.match(/^[A-Z0-9]+[-_](.+)$/i);
  const suggestedCleanName = studentCodeMatch ? studentCodeMatch[1].trim() : null;

  // Handle uploading avatar from local device
  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type & size (max 8MB)
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, WebP, GIF).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("Kích thước ảnh tối đa cho phép là 8MB.");
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.url) {
        throw new Error(json.error || "Tải ảnh lên máy chủ thất bại.");
      }

      setAvatar(json.url);
      setSuccessMsg("📸 Đã tải ảnh từ thiết bị lên thành công!");
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      console.error("Upload avatar error:", err);
      setErrorMsg(err.message || "Không thể tải ảnh từ thiết bị.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle restoring Google Avatar
  const handleUseGoogleAvatar = () => {
    if (googleAvatarUrl) {
      setAvatar(googleAvatarUrl);
      setSuccessMsg("🌐 Đã chuyển sang ảnh đại diện Google!");
      setTimeout(() => setSuccessMsg(null), 2000);
    } else {
      setErrorMsg("Không tìm thấy ảnh đại diện Google gốc cho tài khoản này.");
    }
  };

  // Handle Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên hiển thị.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Update on SQLite Server API
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: name.trim(),
          title: "",
          avatar: avatar.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Không thể cập nhật hồ sơ trên máy chủ.");
      }

      // 2. Update local state & storage via AuthContext
      const updatedUser: User = {
        ...user,
        name: name.trim(),
        avatar: avatar.trim() || user.avatar,
        googleAvatar: googleAvatarUrl || user.googleAvatar,
        bio: "",
      };

      loginWithOAuth(updatedUser);
      if (onUpdated) onUpdated(updatedUser);

      // Trigger custom event for other open components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("embedded_user_updated", { detail: updatedUser }));
      }

      setSuccessMsg("🎉 Đã lưu tên hiển thị và avatar thành công!");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 900);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Đã xảy ra lỗi khi lưu thông tin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentGoogle = Boolean(
    googleAvatarUrl && avatar && (avatar === googleAvatarUrl || avatar.includes("googleusercontent.com"))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-bg-panel border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleDeviceUpload}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shadow-xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Cài Đặt Tài Khoản & Tác Giả
              </h3>
              <p className="text-xs text-text-muted">
                Đổi tên hiển thị trên web và ảnh đại diện bài viết
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account ID Strip */}
        <div className="px-4 py-2.5 rounded-2xl bg-bg-elevated/60 border border-border/60 flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
              Tài khoản Google:
            </span>
            <span className="font-bold text-text-primary truncate block font-mono text-xs">
              {user.email}
            </span>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
            style={{
              backgroundColor: user.role === "superadmin" ? "rgba(168, 85, 247, 0.15)" : "rgba(240, 90, 40, 0.15)",
              color: user.role === "superadmin" ? "#a855f7" : "#f05a28",
              border: `1px solid ${user.role === "superadmin" ? "rgba(168, 85, 247, 0.3)" : "rgba(240, 90, 40, 0.3)"}`,
            }}
          >
            {user.role === "superadmin" && <ShieldCheck className="w-3 h-3" />}
            {user.role === "superadmin" ? "Super Admin" : "Quản Trị Viên"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. AVATAR SECTION */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Ảnh đại diện (Avatar)</span>
            </label>

            <div className="p-4 rounded-2xl bg-gradient-to-b from-bg-elevated/50 to-bg-panel border border-border/80 flex flex-col sm:flex-row items-center gap-4">
              {/* Big Avatar with upload hover ring */}
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <UserAvatar
                  avatar={avatar}
                  name={name || user.name}
                  role={user.role}
                  className="w-20 h-20 rounded-full border-2 border-accent/40 shadow-lg group-hover:border-accent transition-all object-cover"
                  size={80}
                  textClassName="text-3xl"
                />
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity backdrop-blur-2xs">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">Đổi ảnh</span>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {/* Button 1: Upload from device */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="border-accent/40 text-accent hover:bg-accent hover:text-white text-xs font-bold gap-1.5 rounded-xl transition-all"
                  >
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? "Đang tải lên..." : "Tải ảnh từ thiết bị"}</span>
                  </Button>

                  {/* Button 2: Use Google Default */}
                  {googleAvatarUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseGoogleAvatar}
                      disabled={isUploading}
                      className={`text-xs font-semibold gap-1.5 rounded-xl transition-all ${
                        isCurrentGoogle
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                          : "border-border hover:border-text-primary text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <GoogleGIcon className="w-3.5 h-3.5" />
                      <span>{isCurrentGoogle ? "Đang dùng ảnh Google" : "Dùng ảnh từ Google"}</span>
                      {isCurrentGoogle && <Check className="w-3 h-3 text-emerald-400" />}
                    </Button>
                  )}
                </div>

                <p className="text-[11px] text-text-muted leading-relaxed">
                  Hỗ trợ định dạng JPG, PNG, WebP hoặc GIF. Ảnh tải lên sẽ được lưu trữ an toàn trên máy chủ.
                </p>

                {/* Quick Emoji Badges */}
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-1 flex-wrap">
                  <span className="text-[10px] text-text-muted mr-1">Hoặc biểu tượng:</span>
                  {["🛡️", "🔬", "💻", "🚀", "⚡", "🤖", "🎓"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm transition-all hover:scale-110 cursor-pointer ${
                        avatar === emoji
                          ? "border-accent bg-accent/20 scale-105"
                          : "border-border/60 bg-bg-elevated hover:border-accent/40"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. DISPLAY NAME SECTION */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-text-secondary">
                Tên hiển thị trên web (Họ và Tên) *
              </label>
              {suggestedCleanName && name !== suggestedCleanName && (
                <button
                  type="button"
                  onClick={() => setName(suggestedCleanName)}
                  className="text-[11px] text-accent hover:underline font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Rút gọn thành: &quot;{suggestedCleanName}&quot;</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên hiển thị..."
                required
                className="w-full px-4 py-3 rounded-2xl bg-bg-elevated border border-border text-text-primary font-bold text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner"
              />
            </div>

            <p className="text-[11px] text-text-muted leading-relaxed">
              💡 Tên này sẽ xuất hiện làm <strong>Tác giả</strong> trên tất cả bài viết, chuyên đề, tin tức và bình luận của bạn trên hệ thống.
            </p>
          </div>

          {/* 3. LIVE AUTHOR PREVIEW CARD */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
              Xem trước hiển thị tác giả:
            </span>
            <div className="p-3.5 rounded-2xl bg-bg-elevated/40 border border-border/60 flex items-center gap-3">
              <UserAvatar
                avatar={avatar}
                name={name || "Tác giả"}
                className="w-8 h-8 rounded-full border border-accent/40 shadow-xs"
                size={32}
                textClassName="text-xs"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-text-primary truncate">
                  {name.trim() || "Chưa nhập họ tên"}
                </div>
                <div className="text-[10px] text-accent font-medium flex items-center gap-1">
                  <span>Tác giả bài viết</span>
                  <span>·</span>
                  <span className="text-text-muted">Vừa xong</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-xl px-4 py-2"
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || isUploading}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu Thay Đổi</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
