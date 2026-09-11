"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Zap,
  X,
  Plus,
  Minus,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  SearchCheck,
  History,
  RotateCcw,
  FileText,
  Flame,
  Users,
  UserCheck,
} from "lucide-react";
import { useAuth, User } from "@/context/AuthContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/Button";
import { calculateLevel, getLevelInfo, getCreatorRankInfo, getEffectiveStreak } from "@/lib/gamification";

interface SuperAdminPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
}

export function SuperAdminPointModal({
  isOpen,
  onClose,
  targetUser: initialTargetUser,
}: SuperAdminPointModalProps) {
  const { user: currentSuperAdmin, allUsers, adjustUserPoints } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"adjust" | "audit">("adjust");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [actionType, setActionType] = useState<"add" | "subtract" | "set">("add");
  const [pointCategory, setPointCategory] = useState<"exp" | "cp" | "both">("both");
  const [amount, setAmount] = useState<number>(100);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Audit State
  const [auditData, setAuditData] = useState<any | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Danh sách các user khác (không phải chính tài khoản Super Admin đang đăng nhập)
  const otherUsers = useMemo(() => {
    if (!currentSuperAdmin) return allUsers;
    return allUsers.filter(
      (u) => u.id !== currentSuperAdmin.id && u.email !== currentSuperAdmin.email
    );
  }, [allUsers, currentSuperAdmin]);

  // Khởi tạo user được chọn: Ưu tiên chọn user khác (thành viên/sinh viên), không tự chọn chính mình
  useEffect(() => {
    if (isOpen) {
      if (initialTargetUser) {
        setSelectedUserId(initialTargetUser.id);
      } else {
        if (otherUsers.length > 0) {
          setSelectedUserId(otherUsers[0].id);
        } else if (allUsers.length > 0) {
          setSelectedUserId(allUsers[0].id);
        }
      }
      setFeedback(null);
    }
  }, [isOpen, initialTargetUser, otherUsers, allUsers]);

  // Đối tượng user mục tiêu đang được chọn
  const activeTargetUser = useMemo(() => {
    return allUsers.find((u) => u.id === selectedUserId) || initialTargetUser || null;
  }, [allUsers, selectedUserId, initialTargetUser]);

  // Bộ lọc tìm kiếm user
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers;
    const q = userSearch.toLowerCase();
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);

  // Thông số hiện tại của user đang chọn
  const currentExp = Number(activeTargetUser?.exp ?? 0);
  const currentCP = Number(activeTargetUser?.contributionPoints ?? 0);
  const currentLevel = calculateLevel(currentExp);
  const currentLevelInfo = getLevelInfo(currentLevel);
  const currentRankInfo = getCreatorRankInfo(currentCP);

  // Tính toán chuỗi thực tế
  const streakInfo = useMemo(() => {
    return getEffectiveStreak(
      Number(activeTargetUser?.streakDays ?? 0),
      activeTargetUser?.lastActiveDate
    );
  }, [activeTargetUser]);

  // Fetch dữ liệu thẩm định
  const fetchAuditData = useCallback(
    async (userId: string) => {
      if (!userId || !currentSuperAdmin) return;
      setIsLoadingAudit(true);
      try {
        const res = await fetch(
          `/api/admin/points?userId=${encodeURIComponent(userId)}&adminEmail=${encodeURIComponent(
            currentSuperAdmin.email
          )}`,
          {
            headers: {
              "x-user-email": currentSuperAdmin.email,
              "x-user-role": currentSuperAdmin.role,
            },
          }
        );
        const json = await res.json();
        if (json.success) {
          setAuditData(json.data);
        }
      } catch (e) {
        console.warn("Could not load audit data:", e);
      } finally {
        setIsLoadingAudit(false);
      }
    },
    [currentSuperAdmin]
  );

  useEffect(() => {
    if (isOpen && activeTab === "audit" && selectedUserId) {
      fetchAuditData(selectedUserId);
    }
  }, [isOpen, activeTab, selectedUserId, fetchAuditData]);

  // Live preview
  const { previewExp, previewCP, previewLevel, previewLevelInfo, previewRankInfo } = useMemo(() => {
    let pExp = currentExp;
    let pCP = currentCP;
    const val = Math.max(0, Number(amount) || 0);

    if (actionType === "set") {
      if (pointCategory === "exp" || pointCategory === "both") pExp = val;
      if (pointCategory === "cp" || pointCategory === "both") pCP = val;
    } else if (actionType === "add") {
      if (pointCategory === "exp" || pointCategory === "both") pExp = currentExp + val;
      if (pointCategory === "cp" || pointCategory === "both") pCP = currentCP + val;
    } else {
      if (pointCategory === "exp" || pointCategory === "both") pExp = Math.max(0, currentExp - val);
      if (pointCategory === "cp" || pointCategory === "both") pCP = Math.max(0, currentCP - val);
    }

    const pLevel = calculateLevel(pExp);
    return {
      previewExp: pExp,
      previewCP: pCP,
      previewLevel: pLevel,
      previewLevelInfo: getLevelInfo(pLevel),
      previewRankInfo: getCreatorRankInfo(pCP),
    };
  }, [currentExp, currentCP, actionType, pointCategory, amount]);

  if (!isOpen || !mounted) return null;
  if (!currentSuperAdmin || currentSuperAdmin.role !== "superadmin") return null;

  const handleQuickPreset = (val: number) => {
    setAmount(Math.abs(val));
    if (val < 0) {
      setActionType("subtract");
    } else if (actionType === "set") {
      // Keep as set
    } else {
      setActionType("add");
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetUser) {
      setFeedback({ type: "error", message: "Vui lòng chọn một người dùng." });
      return;
    }

    const parsedAmount = Math.max(0, Number(amount) || 0);
    let delta = 0;
    if (actionType === "add") delta = parsedAmount;
    if (actionType === "subtract") delta = -parsedAmount;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await adjustUserPoints({
      userId: activeTargetUser.id,
      type: pointCategory,
      mode: actionType === "set" ? "set" : "delta",
      amount: actionType === "set" ? parsedAmount : delta,
      reason: reason.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setFeedback({
        type: "success",
        message: `⚡ Đã cập nhật thành công điểm cho ${activeTargetUser.name}!`,
      });
      if (activeTab === "audit") {
        fetchAuditData(activeTargetUser.id);
      }
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({
        type: "error",
        message: res.message || "Không thể cập nhật điểm. Vui lòng thử lại.",
      });
    }
  };

  const handleSyncReadingHistory = async () => {
    if (!activeTargetUser || !currentSuperAdmin) return;
    if (
      !confirm(
        `Bạn có chắc chắn muốn khôi phục điểm của "${activeTargetUser.name}" về đúng tổng EXP các bài viết đã đọc thực tế trong hệ thống?`
      )
    ) {
      return;
    }

    setIsSyncing(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": currentSuperAdmin.email,
          "x-user-role": currentSuperAdmin.role,
        },
        body: JSON.stringify({
          adminEmail: currentSuperAdmin.email,
          userId: activeTargetUser.id,
          mode: "sync_reading_history",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: "success",
          message: `🔄 ${json.message}`,
        });
        fetchAuditData(activeTargetUser.id);
      } else {
        setFeedback({
          type: "error",
          message: json.error || "Không thể đồng bộ.",
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Lỗi kết nối máy chủ." });
    } finally {
      setIsSyncing(false);
    }
  };

  const isSelfSelected = activeTargetUser && currentSuperAdmin && activeTargetUser.id === currentSuperAdmin.id;

  // Sử dụng createPortal gắn thẳng vào document.body để thoát hoàn toàn khỏi <header> và các thẻ cha có backdrop-filter/sticky
  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-bg-panel border border-purple-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        style={{
          boxShadow: "0 0 50px -10px rgba(168, 85, 247, 0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Neon Super Admin Theme */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-purple-950/90 via-bg-elevated to-bg-elevated border-b border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
              <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Quyền Năng Super Admin
                </h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 tracking-wider">
                  God Mode
                </span>
              </div>
              <p className="text-xs text-purple-300/70 font-mono">
                Cộng / trừ điểm cho thành viên khác & Thẩm định tính chính xác của chuỗi đọc
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-border/80 flex items-center gap-2 bg-bg-elevated/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("adjust")}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "adjust"
                ? "border-purple-500 text-purple-300"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Phù Phép & Điều Chỉnh Điểm</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "audit"
                ? "border-purple-500 text-purple-300"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <SearchCheck className="w-4 h-4 text-purple-400" />
            <span>Thẩm Định Chuỗi & Lịch Sử Đọc</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Status Feedback Toast */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-semibold animate-fade-in ${
                feedback.type === "success"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/15 border-red-500/30 text-red-300"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* 1. Target User Selector (Người Dùng Mục Tiêu Cần Tác Động) */}
          <div className="p-4 rounded-2xl bg-bg-elevated/70 border border-purple-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>1. Chọn Thành Viên Cần Thao Tác</span>
                <span className="text-purple-300 font-bold">({otherUsers.length} thành viên khác)</span>
              </label>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc email..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl bg-bg-panel border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Quick Click User Chips for Other Members */}
            {otherUsers.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] text-text-muted font-semibold flex items-center gap-1">
                  <span>Chọn nhanh người khác:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {otherUsers.slice(0, 6).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUserId(u.id)}
                      className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer text-[11px] ${
                        selectedUserId === u.id
                          ? "bg-purple-600 text-white font-bold border-purple-500 shadow-sm"
                          : "bg-bg-panel border-border text-text-secondary hover:text-text-primary hover:border-purple-500/40"
                      }`}
                    >
                      <UserAvatar avatar={u.avatar} name={u.name} role={u.role} className="w-4 h-4 rounded-full" size={16} />
                      <span className="truncate max-w-[110px]">{u.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dropdown Select (Tách riêng Thành viên khác và Tài khoản của bạn) */}
            <div>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-panel border border-border text-xs text-text-primary focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
              >
                <optgroup label="--- Danh sách thành viên / Sinh viên / Admin khác ---">
                  {filteredUsers
                    .filter((u) => u.id !== currentSuperAdmin?.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        👤 {u.name} ({u.email}) — [{u.role.toUpperCase()}] · Lv.{u.level || 1} · {u.exp || 0} EXP · {u.contributionPoints || 0} CP
                      </option>
                    ))}
                </optgroup>
                {currentSuperAdmin && (
                  <optgroup label="--- Tài khoản Super Admin của bạn ---">
                    <option value={currentSuperAdmin.id}>
                      🛡️ {currentSuperAdmin.name} (Chính bạn) — {currentSuperAdmin.email}
                    </option>
                  </optgroup>
                )}
              </select>
            </div>

            {/* Active User Summary Card */}
            {activeTargetUser && (
              <div className="p-3 rounded-xl bg-bg-panel border border-border/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    avatar={activeTargetUser.avatar}
                    name={activeTargetUser.name}
                    role={activeTargetUser.role}
                    className="w-10 h-10 rounded-xl border border-purple-500/30 shrink-0"
                    size={40}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text-primary">
                        {activeTargetUser.name}
                      </span>
                      {isSelfSelected ? (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Chính bạn
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {activeTargetUser.role}
                        </span>
                      )}
                    </div>
                    <span className="text-text-muted font-mono text-[11px]">
                      {activeTargetUser.email}
                    </span>
                  </div>
                </div>

                {/* Current Stats Mini Pills */}
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <div className="text-[10px] text-text-muted font-semibold">⚡ EXP</div>
                    <div className="font-bold text-blue-400 font-mono">{currentExp}</div>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <div className="text-[10px] text-text-muted font-semibold">🏆 Cấp Độ</div>
                    <div className="font-bold text-purple-300 font-mono">
                      {currentLevelInfo.badge} Lv.{currentLevel}
                    </div>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="text-[10px] text-text-muted font-semibold">⭐ CP</div>
                    <div className="font-bold text-amber-400 font-mono">{currentCP}</div>
                  </div>
                  <div
                    className={`px-2.5 py-1.5 rounded-xl border text-center ${
                      streakInfo.isStreakActive
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                        : "bg-bg-panel border-border text-text-muted"
                    }`}
                  >
                    <div className="text-[10px] font-semibold flex items-center justify-center gap-0.5">
                      <Flame className="w-3 h-3" />
                      <span>Streak</span>
                    </div>
                    <div className="font-bold font-mono">
                      {streakInfo.effectiveStreak} ngày
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              TAB 1: PHÙ PHÉP & ĐIỀU CHỈNH ĐIỂM
          ========================================================================= */}
          {activeTab === "adjust" && (
            <form onSubmit={handleApply} className="space-y-4">
              {/* 2. Loại Thao Tác */}
              <div className="space-y-1.5">
                <label className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                  2. Loại Thao Tác
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType("add")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      actionType === "add"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                        : "bg-bg-elevated border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cộng Điểm (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType("subtract")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      actionType === "subtract"
                        ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm"
                        : "bg-bg-elevated border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Trừ Điểm (-)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType("set")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      actionType === "set"
                        ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm"
                        : "bg-bg-elevated border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Gán Trực Tiếp (=)</span>
                  </button>
                </div>
              </div>

              {/* 3. Điểm Số Cần Thay Đổi */}
              <div className="space-y-1.5">
                <label className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                  3. Điểm Số Cần Thay Đổi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPointCategory("both")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      pointCategory === "both"
                        ? "bg-purple-500/20 border-purple-500/70 text-purple-200"
                        : "bg-bg-elevated border-border text-text-secondary hover:border-purple-500/40"
                    }`}
                  >
                    <div className="font-bold">🔥 Cả Hai</div>
                    <div className="text-[10px] text-text-muted mt-0.5">EXP & Điểm cống hiến</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPointCategory("exp")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      pointCategory === "exp"
                        ? "bg-blue-500/20 border-blue-500/70 text-blue-200"
                        : "bg-bg-elevated border-border text-text-secondary hover:border-blue-500/40"
                    }`}
                  >
                    <div className="font-bold">⚡ Điểm EXP</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Kinh nghiệm & Cấp độ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPointCategory("cp")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      pointCategory === "cp"
                        ? "bg-amber-500/20 border-amber-500/70 text-amber-200"
                        : "bg-bg-elevated border-border text-text-secondary hover:border-amber-500/40"
                    }`}
                  >
                    <div className="font-bold">⭐ Điểm CP</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Cống hiến & Xếp hạng</div>
                  </button>
                </div>
              </div>

              {/* 4. Số Điểm & Quick Presets */}
              <div className="space-y-1.5">
                <label className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                  4. Nhập Số Điểm
                </label>

                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border text-base font-mono font-bold text-text-primary focus:outline-none focus:border-purple-500"
                  placeholder="Nhập số điểm..."
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-text-muted font-medium mr-1">Phím nhanh:</span>
                  {[50, 100, 200, 500, 1000, 2000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickPreset(preset)}
                      className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-text-secondary hover:text-purple-300 hover:border-purple-500/40 transition-colors font-mono font-bold cursor-pointer"
                    >
                      {actionType === "subtract" ? `-${preset}` : `+${preset}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Ghi Chú / Lý Do */}
              <div className="space-y-1.5">
                <label className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                  5. Lý Do / Ghi Chú (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ví dụ: Thưởng hoàn thành xuất sắc đồ án, giải thưởng nghiên cứu..."
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* 6. Dự Báo Trước Kết Quả */}
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Dự Báo Kết Quả Sau Khi Áp Dụng Cho {activeTargetUser?.name}
                  </span>
                  {previewLevel !== currentLevel && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] animate-pulse">
                      {previewLevel > currentLevel ? "🎉 THĂNG CẤP!" : "⚠️ HẠ CẤP"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-bg-panel/80 border border-border flex items-center justify-between">
                    <div>
                      <div className="text-text-muted text-[10px] uppercase font-bold">Điểm EXP & Level</div>
                      <div className="font-mono font-bold text-text-primary flex items-center gap-1.5 mt-0.5">
                        <span>{currentExp}</span>
                        <ArrowRight className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-300 font-black">{previewExp} EXP</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-text-muted">Cấp độ</div>
                      <div className="font-bold text-purple-300 font-mono">
                        Lv.{currentLevel} ➔ <span className="underline">{previewLevelInfo.badge} Lv.{previewLevel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-bg-panel/80 border border-border flex items-center justify-between">
                    <div>
                      <div className="text-text-muted text-[10px] uppercase font-bold">Điểm Cống Hiến (CP)</div>
                      <div className="font-mono font-bold text-text-primary flex items-center gap-1.5 mt-0.5">
                        <span>{currentCP}</span>
                        <ArrowRight className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400 font-black">{previewCP} CP</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-text-muted">Danh hiệu</div>
                      <div className="font-bold text-amber-400">
                        {previewRankInfo.badge} {previewRankInfo.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-text-muted hover:text-text-primary"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !activeTargetUser}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang thực thi...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Thực Thi Phù Phép Điểm Số
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* =========================================================================
              TAB 2: THẨM ĐỊNH CHUỖI & LỊCH SỬ ĐỌC (AUDIT & RECONCILIATION)
          ========================================================================= */}
          {activeTab === "audit" && (
            <div className="space-y-5">
              {isLoadingAudit ? (
                <div className="py-12 text-center text-text-muted space-y-2">
                  <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-medium">Đang thẩm định dữ liệu đọc bài & chuỗi ngày...</p>
                </div>
              ) : auditData ? (
                <>
                  {/* Streak Integrity Banner */}
                  <div className="p-4 rounded-2xl bg-bg-elevated/80 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-text-primary flex items-center gap-2 text-xs">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span>Thẩm Định Chuỗi Ngày Đọc Bài (Streak Audit)</span>
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                          auditData.streakAudit.isStreakActive
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {auditData.streakAudit.streakStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-bg-panel border border-border/60">
                        <div className="text-text-muted text-[10px]">Chuỗi thực tế</div>
                        <div className="font-bold font-mono text-text-primary text-sm mt-0.5">
                          {auditData.streakAudit.effectiveStreak} ngày
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-bg-panel border border-border/60">
                        <div className="text-text-muted text-[10px]">Số trong Database</div>
                        <div className="font-bold font-mono text-text-secondary text-sm mt-0.5">
                          {auditData.user.storedStreakDays} ngày
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-bg-panel border border-border/60">
                        <div className="text-text-muted text-[10px]">Đọc gần nhất (VN)</div>
                        <div className="font-bold font-mono text-purple-300 text-xs mt-1">
                          {auditData.streakAudit.lastActiveDate || "Chưa có"}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-bg-panel border border-border/60">
                        <div className="text-text-muted text-[10px]">Hôm nay đã đọc?</div>
                        <div className="font-bold text-xs mt-1">
                          {auditData.streakAudit.isReadToday ? (
                            <span className="text-emerald-400 font-bold">✅ Đã đọc</span>
                          ) : (
                            <span className="text-amber-400">⏳ Chưa đọc</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Point Integrity & Reconciliation */}
                  <div className="p-4 rounded-2xl bg-bg-elevated/80 border border-border space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-text-primary flex items-center gap-2 text-xs">
                          <SearchCheck className="w-4 h-4 text-purple-400" />
                          <span>Đối Soát Điểm EXP (Point Integrity)</span>
                        </h3>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {auditData.pointAudit.integrityNote}
                        </p>
                      </div>

                      {auditData.pointAudit.expDifference !== 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSyncing}
                          onClick={handleSyncReadingHistory}
                          className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 text-xs font-bold cursor-pointer shrink-0"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />
                          Khôi Phục Theo Bài Đọc
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-bg-panel border border-border/60">
                        <div className="text-text-muted text-[10px]">EXP Hiện Tại</div>
                        <div className="font-bold font-mono text-blue-400 text-sm mt-0.5">
                          {auditData.pointAudit.currentExp} EXP
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-bg-panel border border-border/60">
                        <div className="text-text-muted text-[10px]">
                          EXP Đọc Bài ({auditData.pointAudit.totalArticlesReadInLog} bài)
                        </div>
                        <div className="font-bold font-mono text-emerald-400 text-sm mt-0.5">
                          {auditData.pointAudit.totalExpFromReading} EXP
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-bg-panel border border-border/60">
                        <div className="text-text-muted text-[10px]">Chênh lệch (Admin / Thưởng)</div>
                        <div
                          className={`font-bold font-mono text-sm mt-0.5 ${
                            auditData.pointAudit.expDifference === 0
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {auditData.pointAudit.expDifference > 0 ? "+" : ""}
                          {auditData.pointAudit.expDifference} EXP
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reading Logs Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-text-primary">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider">
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        Nhật Ký Các Bài Viết Đã Đọc ({auditData.readingLogs.length})
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-bg-elevated/40 divide-y divide-border/60">
                      {auditData.readingLogs.length === 0 ? (
                        <div className="p-4 text-center text-text-muted text-xs">
                          Người dùng này chưa đọc bài viết nào.
                        </div>
                      ) : (
                        auditData.readingLogs.map((log: any) => (
                          <div
                            key={log.id}
                            className="p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-bg-elevated/80 transition-colors"
                          >
                            <div className="truncate flex-1">
                              <div className="font-semibold text-text-primary truncate">
                                {log.title || `Bài viết #${log.articleId}`}
                              </div>
                              <div className="text-[10px] text-text-muted font-mono flex items-center gap-2 mt-0.5">
                                <span className="uppercase text-[9px] px-1 rounded bg-bg-panel border border-border font-bold">
                                  {log.articleType}
                                </span>
                                <span>{new Date(log.createdAt).toLocaleString("vi-VN")}</span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-emerald-400 shrink-0 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              +{log.earnedExp} EXP
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Admin Point Adjustments Audit Log */}
                  {auditData.auditLogs && auditData.auditLogs.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-text-primary">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider">
                          <History className="w-3.5 h-3.5 text-amber-400" />
                          Lịch Sử Can Thiệp Của Super Admin ({auditData.auditLogs.length})
                        </span>
                      </div>

                      <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-bg-elevated/40 divide-y divide-border/60">
                        {auditData.auditLogs.map((audit: any) => (
                          <div
                            key={audit.id}
                            className="p-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="truncate flex-1">
                              <div className="font-medium text-text-primary truncate">
                                {audit.reason || "Can thiệp điểm Super Admin"}
                              </div>
                              <div className="text-[10px] text-text-muted font-mono flex items-center gap-2 mt-0.5">
                                <span>Bởi: {audit.adminEmail}</span>
                                <span>·</span>
                                <span>{new Date(audit.createdAt).toLocaleString("vi-VN")}</span>
                              </div>
                            </div>
                            <div className="text-right font-mono text-xs">
                              <span
                                className={`font-bold ${
                                  audit.amount >= 0 ? "text-purple-300" : "text-rose-400"
                                }`}
                              >
                                {audit.amount >= 0 ? "+" : ""}
                                {audit.amount} {audit.pointType.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-text-muted">
                  Không thể tải thông tin thẩm định của người dùng này.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-2.5 bg-bg-elevated/50 border-t border-border flex items-center justify-between text-[11px] text-text-muted shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Múi giờ: GMT+7 · Chống chuỗi ma · Tự động ưu tiên chọn thành viên khác</span>
          </div>
          <span className="font-mono text-[10px]">SuperAdmin Auditor</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
