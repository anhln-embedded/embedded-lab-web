"use client";

import React, { useState, useEffect } from "react";
import { User, useAuth } from "@/context/AuthContext";
import { X, User as UserIcon, Briefcase, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updatedUser: User) => void;
}

export function EditProfileModal({ isOpen, onClose, onUpdated }: EditProfileModalProps) {
  const { user, loginWithOAuth } = useAuth();

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setTitle(user.bio || "");
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên hiển thị.");
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
          title: title.trim(),
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
        bio: title.trim() || user.bio,
      };

      loginWithOAuth(updatedUser);
      if (onUpdated) onUpdated(updatedUser);

      setSuccessMsg("🎉 Cập nhật tên hiển thị và thông tin tác giả thành công!");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Đã xảy ra lỗi khi lưu thông tin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-bg-panel border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Hồ Sơ Tác Giả & Tài Khoản
              </h3>
              <p className="text-[11px] text-text-muted">
                Tên này sẽ hiển thị trên bài viết, chuyên đề và khóa học của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email & Role Badge */}
        <div className="p-3 rounded-2xl bg-bg-elevated/60 border border-border flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-text-muted block">Tài khoản đăng nhập:</span>
            <span className="font-bold text-text-primary truncate block font-mono text-[11px]">
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
            {user.role === "superadmin" ? "Super Admin" : "Admin"}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-text-secondary mb-1.5 flex items-center gap-1">
              <span>Họ và Tên hiển thị (Tác giả đăng bài) *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Lưu Ngọc Anh / Lê Ngọc Anh..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-text-primary font-bold text-xs focus:outline-none focus:border-accent"
            />
            <span className="text-[10px] text-text-muted mt-1 block">
              💡 Đây là tên sẽ được tự động điền làm tác giả khi bạn đăng bài viết, chuyên đề hay khóa học mới.
            </span>
          </div>

          <div>
            <label className="block font-bold text-text-secondary mb-1.5 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-accent" />
              <span>Chức danh / Vai trò hiển thị</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Mentor Embedded-AIoT Lab PTIT / Quản trị viên..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-text-primary text-xs focus:outline-none focus:border-accent"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
