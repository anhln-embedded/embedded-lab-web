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
  X,
  Trophy,
  Flame,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LAB_BADGES, getExpProgress, getCreatorRankInfo } from "@/lib/gamification";

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

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || "");
    }
  }, [user]);

  // Click outside to close avatar menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarContainerRef.current &&
        !avatarContainerRef.current.contains(event.target as Node)
      ) {
        setShowAvatarMenu(false);
      }
    };
    if (showAvatarMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAvatarMenu]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => {
      setToastMsg((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

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

  // Detect Google Avatar
  const cachedGoogle =
    typeof window !== "undefined" ? localStorage.getItem(`google_avatar_${user.email}`) : null;
  const detectedGoogleAvatar =
    user.googleAvatar ||
    cachedGoogle ||
    (user.avatar && user.avatar.includes("googleusercontent.com") ? user.avatar : null);

  // Smart suggestion: strip student code like "B20DCDT011-" to get pure full name
  const studentCodeMatch = nameInput.match(/^[A-Z0-9]+[-_](.+)$/i);
  const suggestedCleanName = studentCodeMatch ? studentCodeMatch[1].trim() : null;

  // 1. SAVE EDITED NAME
  const handleSaveName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = nameInput.trim();
    if (!clean) {
      showToast("Vui lòng nhập họ và tên hợp lệ.", "error");
      return;
    }

    setIsSavingName(true);
    try {
      // Update SQLite API
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: clean,
          title: "",
          avatar: user.avatar,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Không thể lưu tên lên máy chủ.");
      }

      // Update AuthContext & localStorage
      const updatedUser: User = {
        ...user,
        name: clean,
      };
      loginWithOAuth(updatedUser);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("embedded_user_updated", { detail: updatedUser }));
      }

      setIsEditingName(false);
      showToast("🎉 Đã cập nhật tên tác giả thành công!");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Lỗi khi cập nhật tên.", "error");
    } finally {
      setIsSavingName(false);
    }
  };

  // 2. AVATAR OPTION A: CHỌN TỪ THIẾT BỊ
  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, WebP, GIF).", "error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("Kích thước ảnh tối đa cho phép là 8MB.", "error");
      return;
    }

    setIsUploadingAvatar(true);
    setShowAvatarMenu(false);

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

      const newAvatarUrl = json.url;

      // Update SQLite user
      const userRes = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          title: "",
          avatar: newAvatarUrl,
        }),
      });
      const userJson = await userRes.json();
      if (!userRes.ok || !userJson.success) {
        throw new Error(userJson.error || "Lỗi khi lưu ảnh đại diện.");
      }

      const updatedUser: User = {
        ...user,
        avatar: newAvatarUrl,
      };
      loginWithOAuth(updatedUser);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("embedded_user_updated", { detail: updatedUser }));
      }

      showToast("📸 Đã cập nhật ảnh đại diện từ thiết bị!");
    } catch (err: any) {
      console.error("Upload avatar error:", err);
      showToast(err.message || "Không thể tải ảnh từ thiết bị.", "error");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 3. AVATAR OPTION B: DÙNG MẶC ĐỊNH (TỪ GOOGLE HOẶC BIỂU TƯỢNG)
  const handleUseDefaultAvatar = async () => {
    setShowAvatarMenu(false);
    const targetAvatar = detectedGoogleAvatar || (user.email.includes("anhln") ? "🛡️" : "");

    try {
      // Update SQLite user
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          title: "",
          avatar: targetAvatar,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Không thể đổi về ảnh mặc định.");
      }

      const updatedUser: User = {
        ...user,
        avatar: targetAvatar,
        googleAvatar: detectedGoogleAvatar || undefined,
      };
      loginWithOAuth(updatedUser);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("embedded_user_updated", { detail: updatedUser }));
      }

      showToast("🌐 Đã chuyển về ảnh đại diện mặc định!");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Lỗi khi đổi ảnh đại diện.", "error");
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-6 sm:py-10 px-4">
      {/* Hidden file input for uploading from device */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleDeviceUpload}
      />

      {/* SINGLE UNIFIED CARD */}
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-bg-panel p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
        
        {/* TOP SECTION: AVATAR & NAME EDITING */}
        <div className="text-center space-y-3">
          
          {/* Avatar with Click to Choose Option */}
          <div className="relative inline-block" ref={avatarContainerRef}>
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowAvatarMenu((prev) => !prev)}
              title="Nhấn để đổi ảnh đại diện (mặc định hoặc từ thiết bị)"
            >
              <UserAvatar
                avatar={user.avatar}
                name={user.name}
                role={user.role}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-bg-elevated border-2 border-accent/40 shadow-xl group-hover:border-accent transition-all object-cover mx-auto"
                size={96}
                textClassName="text-3xl sm:text-4xl"
              />
              {/* Camera Hover Overlay */}
              <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity backdrop-blur-2xs">
                <Camera className="w-5 h-5 mb-0.5 text-white" />
                <span className="text-[10px] font-bold">Đổi ảnh</span>
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 rounded-3xl bg-black/70 flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              )}
            </div>

            {/* POPUP 2 LỰA CHỌN: MẶC ĐỊNH VÀ CHỌN TỪ THIẾT BỊ */}
            {showAvatarMenu && (
              <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 w-64 p-2 rounded-2xl bg-bg-elevated border border-border shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-1 text-left">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border/60">
                  Tùy chọn ảnh đại diện
                </div>

                {/* Lựa chọn 1: Mặc định */}
                <button
                  type="button"
                  onClick={handleUseDefaultAvatar}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-panel transition-all text-left cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-bg-panel flex items-center justify-center shrink-0 border border-border/60 group-hover:border-accent/40">
                    <GoogleGIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-text-primary text-xs flex items-center gap-1">
                      <span>Mặc định</span>
                      {detectedGoogleAvatar && (
                        <span className="text-[10px] text-emerald-400 font-normal">(Google)</span>
                      )}
                    </div>
                    <div className="text-[10px] text-text-muted truncate">
                      Dùng ảnh từ tài khoản Google
                    </div>
                  </div>
                </button>

                {/* Lựa chọn 2: Chọn từ thiết bị */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAvatarMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-accent hover:bg-bg-panel transition-all text-left cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 group-hover:bg-accent group-hover:text-white transition-all">
                    <Upload className="w-3.5 h-3.5 text-accent group-hover:text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-accent text-xs">
                      Chọn từ thiết bị
                    </div>
                    <div className="text-[10px] text-text-muted truncate">
                      Tải ảnh PNG, JPG từ máy tính
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Role Badge */}
          <div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs"
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
              {user.role === "superadmin" && <ShieldCheck className="w-3 h-3" />}
              {user.role === "admin" && <Edit3 className="w-3 h-3" />}
              {user.role === "user" && <GraduationCap className="w-3 h-3" />}
              {user.role === "superadmin"
                ? "Super Admin"
                : user.role === "admin"
                ? "Admin"
                : "Sinh viên"}
            </span>
          </div>

          {/* SỬA TÊN NGAY BÊN TRÊN */}
          <div>
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 max-w-xs mx-auto">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-center font-bold text-base rounded-xl bg-bg-elevated border-2 border-accent text-text-primary focus:outline-none shadow-inner"
                    placeholder="Nhập họ và tên..."
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSavingName}
                    className="bg-accent hover:bg-accent-hover text-white text-xs px-3 py-1.5 rounded-xl font-bold h-9"
                  >
                    {isSavingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Lưu"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameInput(user.name);
                    }}
                    className="p-1.5 text-text-muted hover:text-text-primary rounded-xl hover:bg-bg-elevated transition-colors"
                    title="Hủy"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {suggestedCleanName && nameInput !== suggestedCleanName && (
                  <button
                    type="button"
                    onClick={() => setNameInput(suggestedCleanName)}
                    className="text-[11px] text-accent hover:underline font-bold flex items-center justify-center gap-1 mx-auto"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Rút gọn thành: &quot;{suggestedCleanName}&quot;</span>
                  </button>
                )}
              </form>
            ) : (
              <div className="flex items-center justify-center gap-1.5 group">
                <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                  {user.name}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-bg-elevated transition-all cursor-pointer"
                  title="Nhấn để sửa họ và tên tác giả"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-text-muted mt-1">
              <span>{user.email}</span>
              {user.email.includes("@gmail.com") && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-bg-elevated px-2 py-0.5 rounded-full border border-border">
                  <GoogleGIcon className="w-2.5 h-2.5" />
                  Google
                </span>
              )}
            </div>
          </div>

          {/* Toast Message inside card */}
          {toastMsg && (
            <div
              className={`p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in duration-200 ${
                toastMsg.type === "success"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/15 border border-red-500/30 text-red-400"
              }`}
            >
              {toastMsg.type === "success" ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{toastMsg.text}</span>
            </div>
          )}
        </div>

        {/* GAMIFICATION STATS WIDGET */}
        <div className="p-4 rounded-2xl bg-bg-elevated/60 border border-border/80 space-y-3">
          {/* Level & EXP Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <span>{getExpProgress(user.exp || 0).badge}</span>
                <span>Cấp {getExpProgress(user.exp || 0).currentLevel} · {getExpProgress(user.exp || 0).title}</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {user.exp || 0} / {getExpProgress(user.exp || 0).nextLevelMinExp} EXP
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-bg-panel overflow-hidden border border-border/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400 transition-all duration-500"
                style={{ width: `${getExpProgress(user.exp || 0).progressPercent}%` }}
              />
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-bg-panel border border-border/60">
              <div className="text-xs font-black text-accent font-mono">
                {user.contributionPoints || 0}
              </div>
              <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                Điểm CP
              </div>
            </div>

            <div className="p-2 rounded-xl bg-bg-panel border border-border/60">
              <div className="text-xs font-black text-text-primary font-mono">
                {user.readArticlesCount || 0}
              </div>
              <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                Bài đã đọc
              </div>
            </div>

            <div className="p-2 rounded-xl bg-bg-panel border border-border/60">
              <div className="text-xs font-black text-orange-400 font-mono flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3 text-orange-400" />
                <span>{user.streakDays ?? 0}</span>
              </div>
              <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                Ngày streak
              </div>
            </div>
          </div>

          {/* Badges Shelf & Ranking Link */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-text-muted font-bold mr-1">Huy hiệu:</span>
              {(user.badges || []).length > 0 ? (
                (user.badges || []).slice(0, 5).map((id) => {
                  const b = LAB_BADGES.find((item) => item.id === id);
                  if (!b) return null;
                  return (
                    <span
                      key={b.id}
                      className="w-6 h-6 rounded-lg bg-bg-panel border border-border flex items-center justify-center text-xs shadow-xs"
                      title={`${b.title}: ${b.description}`}
                    >
                      {b.icon}
                    </span>
                  );
                })
              ) : (
                <span className="text-[10px] text-text-muted italic">Chưa mở khóa</span>
              )}
            </div>

            <Link
              href="/ranking"
              className="text-[11px] text-accent hover:underline font-bold flex items-center gap-1"
            >
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Bảng Xếp Hạng</span>
            </Link>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-2.5 pt-2">
          {(user.role === "superadmin" || user.role === "admin") && (
            <Button
              variant="primary"
              asChild
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-2xl shadow-md"
            >
              <Link href="/admin">
                <span>Vào Bảng Quản Trị Admin</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            asChild
            className="w-full py-3 rounded-2xl text-xs font-bold border-border hover:border-accent hover:text-accent bg-bg-elevated/40"
          >
            <Link href="/roadmap">
              <span>Xem Lộ Trình Học Tập (Roadmap)</span>
            </Link>
          </Button>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2 text-xs font-semibold text-rose-400 hover:text-rose-500 hover:underline cursor-pointer transition-colors block text-center"
          >
            Đăng xuất khỏi thiết bị
          </button>
        </div>

        {/* DEV MODE QUICK ROLE SWITCHER */}
        {!isProduction && (
          <div className="pt-4 border-t border-border/60 text-left space-y-2">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" /> [DEV MODE] Chuyển đổi quyền nhanh:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => quickLogin("superadmin")}
                className="p-2 rounded-xl text-[11px] font-bold border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all text-center cursor-pointer"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin("admin")}
                className="p-2 rounded-xl text-[11px] font-bold border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-all text-center cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin("user")}
                className="p-2 rounded-xl text-[11px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all text-center cursor-pointer"
              >
                Sinh viên
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
