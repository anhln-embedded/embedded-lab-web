"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth, UserRole } from "@/context/AuthContext";
import {
  ShieldCheck,
  Edit3,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User as UserIcon,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const isProduction =
  process.env.NEXT_PUBLIC_APP_ENV === "production" ||
  process.env.NODE_ENV === "production";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || searchParams.get("returnTo") || "/";

  const { user, login, quickLogin, register, loginWithOAuth, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Xử lý callback OAuth trả về từ Google
  useEffect(() => {
    const oauthSuccess = searchParams.get("oauth_success");
    const errorParam = searchParams.get("error");

    if (oauthSuccess) {
      try {
        const decoded = JSON.parse(
          Buffer.from(oauthSuccess, "base64url").toString("utf-8")
        );
        loginWithOAuth(decoded);
        setSuccessMsg(`Đăng nhập thành công với tài khoản Google (${decoded.email})!`);
        setTimeout(() => {
          router.push(redirectUrl);
        }, 800);
      } catch (e) {
        console.error("Failed to parse OAuth success data:", e);
      }
    } else if (errorParam) {
      if (errorParam === "GoogleConfigMissing") {
        setErrorMsg("Chưa cấu hình GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET trong file .env để kết nối Google OAuth.");
      } else if (errorParam === "GoogleAuthFailed" || errorParam === "GoogleTokenExchangeFailed") {
        setErrorMsg("Xác thực Google không thành công hoặc người dùng đã hủy.");
      } else {
        setErrorMsg(`Đăng nhập Google thất bại (${errorParam}).`);
      }
    }
  }, [searchParams, loginWithOAuth, router, redirectUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (isRegister) {
      if (!name.trim()) {
        setErrorMsg("Vui lòng nhập họ và tên.");
        setLoading(false);
        return;
      }
      if (!email.trim()) {
        setErrorMsg("Vui lòng nhập địa chỉ email.");
        setLoading(false);
        return;
      }
      const roleToAssign = isProduction ? "user" : selectedRole;
      const res = register(name, email, password, roleToAssign);
      if (!res.success) {
        setErrorMsg(res.message || "Đăng ký không thành công.");
        setLoading(false);
      } else {
        setSuccessMsg("Tạo tài khoản thành công! Đang chuyển hướng...");
        setTimeout(() => {
          if (roleToAssign === "superadmin" || roleToAssign === "admin") {
            router.push("/admin");
          } else {
            router.push(redirectUrl);
          }
        }, 800);
      }
    } else {
      if (!email.trim()) {
        setErrorMsg("Vui lòng nhập địa chỉ email.");
        setLoading(false);
        return;
      }
      const res = login(email, password);
      if (!res.success) {
        setErrorMsg(res.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại email & mật khẩu.");
        setLoading(false);
      } else {
        setSuccessMsg("Đăng nhập thành công!");
        setTimeout(() => {
          router.push(redirectUrl);
        }, 600);
      }
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setErrorMsg("");
    // Chuyển hướng tới API Google OAuth Route
    window.location.href = `/api/auth/google?returnUrl=${encodeURIComponent(redirectUrl)}`;
  };

  const quickDevLogin = (role: UserRole, defaultEmail: string) => {
    if (isProduction) return;
    setEmail(defaultEmail);
    setPassword("••••••••");
    quickLogin(role);
    setSuccessMsg(`Đã đăng nhập nhanh với vai trò: ${role.toUpperCase()}`);
    setTimeout(() => {
      if (role === "superadmin" || role === "admin") {
        router.push("/admin");
      } else {
        router.push("/roadmap");
      }
    }, 600);
  };

  return (
    <div className="w-full flex items-center justify-center py-6 sm:py-12 px-4">
      {/* If already logged in */}
      {user ? (
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-bg-panel p-6 sm:p-8 shadow-2xl text-center backdrop-blur-xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-bg-elevated border border-border flex items-center justify-center text-4xl mb-2 shadow-inner">
            {user.avatar || "👤"}
          </div>

          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
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
                borderColor:
                  user.role === "superadmin"
                    ? "rgba(168, 85, 247, 0.3)"
                    : user.role === "admin"
                    ? "rgba(240, 90, 40, 0.3)"
                    : "rgba(16, 185, 129, 0.3)",
                borderWidth: 1,
              }}
            >
              {user.role === "superadmin" && <ShieldCheck className="w-3.5 h-3.5" />}
              {user.role === "admin" && <Edit3 className="w-3.5 h-3.5" />}
              {user.role === "user" && <GraduationCap className="w-3.5 h-3.5" />}
              {user.role === "superadmin"
                ? "Super Admin"
                : user.role === "admin"
                ? "Admin (Tác giả)"
                : "Sinh viên / User"}
            </div>

            <h2 className="text-xl font-bold text-text-primary">{user.name}</h2>
            <p className="text-text-muted text-xs mt-0.5">{user.email}</p>
          </div>

          <p className="text-text-secondary text-xs bg-bg-elevated/70 p-3 rounded-2xl border border-border/60 leading-relaxed text-left">
            {user.bio}
          </p>

          <div className="space-y-2.5 pt-2">
            {(user.role === "superadmin" || user.role === "admin") && (
              <Button variant="primary" asChild className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2.5 rounded-xl shadow">
                <Link href="/admin">
                  <span>Vào Bảng Quản Trị Admin</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild className="w-full py-2.5 rounded-xl text-xs font-semibold">
              <Link href="/roadmap">Xem Lộ Trình Học Tập (Roadmap)</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full py-2.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl"
            >
              Đăng xuất khỏi thiết bị
            </Button>
          </div>

          {/* Quick role switcher (DEV ONLY) */}
          {!isProduction && (
            <div className="pt-4 border-t border-border/80 text-left space-y-2">
              <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" /> [DEV MODE] Chuyển đổi quyền nhanh:
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => quickDevLogin("superadmin", "superadmin@ptit.edu.vn")}
                  className="p-2 rounded-lg text-[11px] font-bold border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-center"
                >
                  Super Admin
                </button>
                <button
                  onClick={() => quickDevLogin("admin", "mentor.lab@ptit.edu.vn")}
                  className="p-2 rounded-lg text-[11px] font-bold border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-center"
                >
                  Admin
                </button>
                <button
                  onClick={() => quickDevLogin("user", "sinhvien@ptit.edu.vn")}
                  className="p-2 rounded-lg text-[11px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-center"
                >
                  Sinh viên
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
           CARD ĐĂNG NHẬP / ĐĂNG KÝ VỚI GOOGLE & EMAIL
        ========================================================================= */
        <div className="w-full max-w-md space-y-5 sm:space-y-6 rounded-3xl border border-border bg-bg-panel p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header Card với Logo & Tiêu đề */}
          <div className="text-center space-y-2.5">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-bg-elevated p-2 shadow-md border border-border flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Embedded AIoT Lab Logo"
                  width={52}
                  height={52}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
                {isRegister ? "Đăng Ký Thành Viên Lab" : "Đăng Nhập Embedded-AIoT"}
              </h1>
              <p className="text-xs text-text-muted mt-1">
                {isRegister
                  ? "Tạo tài khoản để theo dõi lộ trình và nhật ký thực nghiệm"
                  : "Cổng thông tin & nghiên cứu Khoa Điện Tử 1 - PTIT"}
              </p>
            </div>
          </div>

          {/* Dev Mode 1-Click Quick Login (CHỈ HIỂN THỊ KHI Ở MÔI TRƯỜNG DEV) */}
          {!isProduction && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Đăng Nhập Nhanh (Môi trường Dev)
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                  DEV MODE
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-tight">
                Bấm 1-click bên dưới để tự động đăng nhập tài khoản mẫu:
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => quickDevLogin("superadmin", "superadmin@ptit.edu.vn")}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-purple-500/30 bg-bg-elevated p-2 text-purple-400 font-bold hover:bg-purple-500/20 transition-all active:scale-95 shadow-sm"
                >
                  <span>🛡️ Super</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickDevLogin("admin", "mentor.lab@ptit.edu.vn")}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-accent/30 bg-bg-elevated p-2 text-accent font-bold hover:bg-accent/20 transition-all active:scale-95 shadow-sm"
                >
                  <span>✍️ Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickDevLogin("user", "sinhvien@ptit.edu.vn")}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-emerald-500/30 bg-bg-elevated p-2 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all active:scale-95 shadow-sm"
                >
                  <span>🎓 Sinh viên</span>
                </button>
              </div>
            </div>
          )}

          {/* Thông báo Lỗi / Thành công */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* GOOGLE SIGN IN BUTTON */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white dark:bg-bg-elevated hover:bg-slate-50 dark:hover:bg-bg-elevated/80 py-3 px-4 text-xs sm:text-sm font-bold text-slate-800 dark:text-text-primary shadow-sm hover:border-border/80 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {/* Google Multi-color SVG Emblem */}
              <svg width="18" height="18" className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
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
              <span>{googleLoading ? "Đang kết nối Google..." : "Tiếp tục với Google"}</span>
            </button>
          </div>

          {/* DIVIDER: Hoặc đăng nhập bằng email */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-border/80" />
            <span className="absolute bg-bg-panel px-3 text-[11px] font-medium text-text-muted">
              hoặc đăng nhập bằng email
            </span>
          </div>

          {/* Tab Switcher: Đăng nhập / Đăng ký */}
          <div className="flex rounded-2xl bg-bg-elevated p-1 border border-border">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isRegister
                  ? "bg-bg-panel text-text-primary shadow-sm border border-border/80"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Đăng nhập Email
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isRegister
                  ? "bg-bg-panel text-text-primary shadow-sm border border-border/80"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Tạo tài khoản mới
            </button>
          </div>

          {/* Form Nhập Liệu */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Họ và tên *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required={isRegister}
                    className="w-full pl-10 pr-3 py-2.5 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:bg-bg-panel transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Địa chỉ Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten.sinhvien@ptit.edu.vn"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:bg-bg-panel transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text-secondary">
                  Mật khẩu *
                </label>
                {!isRegister && (
                  <span className="text-[11px] text-text-muted hover:text-accent cursor-pointer transition-colors">
                    Quên mật khẩu?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:bg-bg-panel transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-3 mt-2 bg-gradient-to-r from-accent to-accent-amber hover:brightness-110 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? "Đang xử lý..." : isRegister ? "Đăng Ký Tài Khoản" : "Đăng Nhập Hệ Thống"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Chuyển đổi Đăng nhập / Đăng ký ở dưới cùng */}
          <div className="text-center text-xs text-text-muted pt-2 border-t border-border/60">
            {isRegister ? (
              <span>
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-accent hover:underline cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </span>
            ) : (
              <span>
                Chưa có tài khoản thành viên?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-accent hover:underline cursor-pointer"
                >
                  Đăng ký miễn phí
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Đang tải trang đăng nhập...</p>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
