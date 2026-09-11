"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, useAuth, UserRole, getSuperAdminEmails } from "@/context/AuthContext";
import {
  ShieldCheck,
  Edit3,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  Loader2,
  Check,
  Sparkles,
  Zap,
  LogOut,
  Route,
  User as UserIcon,
  Mail,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";

const isProduction =
  process.env.NEXT_PUBLIC_APP_ENV === "production" ||
  process.env.NODE_ENV === "production";

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

export function UserProfileView() {
  const { user, loginWithOAuth, quickLogin, logout } = useAuth();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");

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
  }, [user]);

  if (!user) {
    return (
      <div className="w-full max-w-md mx-auto my-12 p-8 rounded-3xl border border-border bg-bg-panel text-center shadow-xl space-y-4">
        <UserIcon className="w-12 h-12 mx-auto text-text-muted" />
        <h2 className="text-lg font-bold text-text-primary">Bạn chưa đăng nhập</h2>
        <p className="text-xs text-text-muted">
          Vui lòng đăng nhập để xem thông tin hồ sơ cá nhân và quản lý tài khoản của bạn.
        </p>
        <Button variant="primary" asChild className="w-full bg-accent text-white font-bold">
          <Link href="/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    );
  }

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
      setSuccessMsg("📸 Đã tải ảnh đại diện từ thiết bị lên thành công! Hãy bấm 'Lưu Thay Đổi' bên dưới.");
      setTimeout(() => setSuccessMsg(null), 4000);
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
      setSuccessMsg("🌐 Đã chọn ảnh đại diện từ Google! Hãy bấm 'Lưu Thay Đổi' bên dưới.");
      setTimeout(() => setSuccessMsg(null), 3500);
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

      // Trigger custom event for other open components (Header, etc.)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("embedded_user_updated", { detail: updatedUser }));
      }

      setSuccessMsg("🎉 Đã lưu họ tên và ảnh đại diện thành công!");
      setTimeout(() => setSuccessMsg(null), 3500);
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
    <div className="w-full max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-6 animate-in fade-in duration-300">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleDeviceUpload}
      />

      {/* Hero Header Card */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-b from-bg-panel to-bg-elevated p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with click to upload */}
          <div
            className="relative group cursor-pointer flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            title="Nhấn để tải ảnh đại diện từ thiết bị"
          >
            <UserAvatar
              avatar={avatar}
              name={name || user.name}
              role={user.role}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-bg-elevated border-2 border-accent/40 shadow-xl group-hover:border-accent transition-all object-cover"
              size={112}
              textClassName="text-4xl sm:text-5xl"
            />
            <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity backdrop-blur-2xs">
              <Camera className="w-6 h-6 mb-1 text-white" />
              <span className="text-[10px] font-bold">Đổi ảnh</span>
            </div>
            {isUploading && (
              <div className="absolute inset-0 rounded-3xl bg-black/70 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-7 h-7 animate-spin text-accent" />
              </div>
            )}
          </div>

          {/* User Meta Info */}
          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                style={{
                  backgroundColor:
                    user.role === "superadmin"
                      ? "rgba(168, 85, 247, 0.15)"
                      : user.role === "admin"
                      ? "rgba(240, 90, 40, 0.15)"
                      : "rgba(16, 185, 129, 0.15)",
                  color:
                    user.role === "superadmin"
                      ? "#a855f7"
                      : user.role === "admin"
                      ? "#f05a28"
                      : "#10b981",
                  border: `1px solid ${
                    user.role === "superadmin"
                      ? "rgba(168, 85, 247, 0.3)"
                      : user.role === "admin"
                      ? "rgba(240, 90, 40, 0.3)"
                      : "rgba(16, 185, 129, 0.3)"
                  }`,
                }}
              >
                {user.role === "superadmin" && <ShieldCheck className="w-3.5 h-3.5" />}
                {user.role === "admin" && <Edit3 className="w-3.5 h-3.5" />}
                {user.role === "user" && <GraduationCap className="w-3.5 h-3.5" />}
                {user.role === "superadmin"
                  ? "Super Admin Lab"
                  : user.role === "admin"
                  ? "Quản Trị Viên / Tác Giả"
                  : "Thành Viên Nghiên Cứu"}
              </span>

              {user.email.includes("@gmail.com") && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-bg-elevated border border-border/80 text-text-secondary flex items-center gap-1">
                  <GoogleGIcon className="w-3 h-3" />
                  <span>Google Account</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              {name || user.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-accent" />
                {user.email}
              </span>
              {user.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  Tham gia: {user.createdAt}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-border/80 bg-bg-panel p-6 sm:p-8 shadow-xl space-y-6"
      >
        <div className="border-b border-border/70 pb-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Cài Đặt Thông Tin & Tác Giả</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Quản lý tên hiển thị và ảnh đại diện sẽ xuất hiện trên toàn bộ hệ thống
          </p>
        </div>

        {/* 1. AVATAR ACTIONS */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-text-secondary">
            Tùy Chọn Ảnh Đại Diện (Avatar)
          </label>

          <div className="p-4 rounded-2xl bg-bg-elevated/50 border border-border/70 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
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
                  {isCurrentGoogle && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </Button>
              )}
            </div>

            <p className="text-[11px] text-text-muted leading-relaxed">
              Hỗ trợ tệp ảnh PNG, JPG, WebP, GIF (tối đa 8MB). Ảnh tải lên được lưu trữ trên server tốc độ cao.
            </p>

            {/* Quick Emoji Badges */}
            <div className="pt-2 border-t border-border/50 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-text-muted">Hoặc dùng biểu tượng:</span>
              {["🛡️", "🔬", "💻", "🚀", "⚡", "🤖", "🎓"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm transition-all hover:scale-110 cursor-pointer ${
                    avatar === emoji
                      ? "border-accent bg-accent/20 scale-105 shadow-xs"
                      : "border-border/60 bg-bg-panel hover:border-accent/40"
                  }`}
                  title={`Dùng biểu tượng ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. DISPLAY NAME */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-text-secondary">
              Tên hiển thị trên website (Họ và Tên) *
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

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập họ và tên hiển thị..."
            required
            className="w-full px-4 py-3 rounded-2xl bg-bg-elevated border border-border text-text-primary font-bold text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner"
          />

          <p className="text-[11px] text-text-muted leading-relaxed">
            💡 Tên này sẽ xuất hiện làm <strong>Tác giả</strong> trên tất cả bài viết, chuyên đề, tin tức và bình luận của bạn trên hệ thống.
          </p>
        </div>

        {/* 3. LIVE AUTHOR PREVIEW */}
        <div className="space-y-2 pt-2 border-t border-border/70">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
            Xem trước hiển thị tác giả trên bài viết:
          </span>
          <div className="p-4 rounded-2xl bg-bg-elevated/40 border border-border/60 flex items-center gap-3.5">
            <UserAvatar
              avatar={avatar}
              name={name || "Tác giả"}
              className="w-9 h-9 rounded-full border border-accent/40 shadow-xs"
              size={36}
              textClassName="text-xs"
            />
            <div className="min-w-0">
              <div className="text-sm font-bold text-text-primary truncate">
                {name.trim() || "Chưa nhập họ tên"}
              </div>
              <div className="text-[11px] text-accent font-medium flex items-center gap-1.5">
                <span>Tác giả bài viết</span>
                <span>·</span>
                <span className="text-text-muted">Vừa xong</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isUploading}
            className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu thay đổi...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu Thay Đổi Hồ Sơ</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Quick Navigation Cards */}
      <div className="rounded-3xl border border-border/80 bg-bg-panel p-6 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          Phím Tắt & Điều Hướng
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(user.role === "superadmin" || user.role === "admin") && (
            <Button
              variant="primary"
              asChild
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-2xl shadow"
            >
              <Link href="/admin">
                <ShieldCheck className="w-4 h-4 mr-2" />
                <span>Bảng Quản Trị Admin</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            asChild
            className="w-full py-3 rounded-2xl text-xs font-bold border-border hover:border-accent hover:text-accent"
          >
            <Link href="/roadmap">
              <Route className="w-4 h-4 mr-2 text-emerald-400" />
              <span>Lộ Trình Học Tập</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
          </Button>
        </div>

        <div className="pt-2">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full py-2.5 text-xs text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl cursor-pointer gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất khỏi thiết bị này</span>
          </Button>
        </div>
      </div>

      {/* Quick role switcher (DEV ONLY) */}
      {!isProduction && (
        <div className="p-4 rounded-2xl border border-border/70 bg-bg-panel/60 text-left space-y-2">
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> [DEV MODE] Chuyển đổi quyền nhanh:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLogin("superadmin")}
              className="p-2.5 rounded-xl text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all text-center cursor-pointer"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => quickLogin("admin")}
              className="p-2.5 rounded-xl text-xs font-bold border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-all text-center cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => quickLogin("user")}
              className="p-2.5 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all text-center cursor-pointer"
            >
              Sinh viên
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
