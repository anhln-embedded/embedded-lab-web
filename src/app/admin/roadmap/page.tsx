"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getAllRoadmapTracks,
  createRoadmapTrack,
  updateRoadmapTrack,
  deleteRoadmapTrack,
  addStepToTrack,
  deleteStepFromTrack,
  RoadmapTrack,
  RoadmapStep
} from "@/lib/roadmap-store";
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Cpu,
  Terminal,
  Zap,
  Binary,
  Layers,
  Clock,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const ICON_MAP: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-5 h-5 text-cyan-400" />,
  Terminal: <Terminal className="w-5 h-5 text-amber-400" />,
  Zap: <Zap className="w-5 h-5 text-emerald-400" />,
  Binary: <Binary className="w-5 h-5 text-purple-400" />,
  Layers: <Layers className="w-5 h-5 text-rose-400" />,
};

export default function AdminRoadmapPage() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<RoadmapTrack[]>([]);
  const [mounted, setMounted] = useState(false);

  // Modal / Form states for new track
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackCategory, setTrackCategory] = useState<RoadmapTrack["category"]>("embedded-rtos");
  const [trackRole, setTrackRole] = useState("");
  const [trackDesc, setTrackDesc] = useState("");
  const [trackIcon, setTrackIcon] = useState("Cpu");

  // Step modal state
  const [activeTrackForStep, setActiveTrackForStep] = useState<string | null>(null);
  const [stepTitle, setStepTitle] = useState("");
  const [stepLevel, setStepLevel] = useState<RoadmapStep["level"]>("Cơ bản");
  const [stepDesc, setStepDesc] = useState("");
  const [stepSkills, setStepSkills] = useState("");
  const [stepTime, setStepTime] = useState("4 - 6 tuần");

  useEffect(() => {
    setMounted(true);
    setTracks(getAllRoadmapTracks());

    const handleUpdate = () => {
      setTracks(getAllRoadmapTracks());
    };

    window.addEventListener("embedded_roadmap_updated", handleUpdate);
    return () => window.removeEventListener("embedded_roadmap_updated", handleUpdate);
  }, []);

  if (!mounted) return null;

  const isAuthorized = user && (user.role === "superadmin" || user.role === "admin");

  if (!isAuthorized) {
    return (
      <div className="container py-16 max-w-xl text-center">
        <div className="p-8 rounded-3xl bg-bg-panel border border-border shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-3xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Truy Cập Bị Từ Chối (403 Forbidden)
          </h1>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Chỉ <strong>Quản Trị Viên & Hội Đồng Chuyên Môn Lab</strong> mới có quyền tạo và điều chỉnh các mốc lộ trình đào tạo.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" asChild className="bg-accent hover:bg-accent-hover text-white">
              <Link href="/">Quay Về Trang Chủ</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Đăng Nhập Tài Khoản Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCategoryChange = (cat: RoadmapTrack["category"]) => {
    setTrackCategory(cat);
    if (cat === "embedded-rtos") {
      setTrackIcon("Cpu");
      setTrackRole("Kỹ sư Firmware, Kỹ sư Hệ thống Nhúng (STM32 / Zephyr / FreeRTOS)");
    } else if (cat === "embedded-linux") {
      setTrackIcon("Terminal");
      setTrackRole("Kỹ sư Linux Nhúng, BSP Engineer, Kernel Developer");
    } else if (cat === "tinyml") {
      setTrackIcon("Zap");
      setTrackRole("Kỹ sư AIoT, Edge AI Engineer, TinyML Researcher");
    } else if (cat === "fpga") {
      setTrackIcon("Binary");
      setTrackRole("Kỹ sư Thiết kế Vi mạch, FPGA Engineer, RTL Designer");
    } else if (cat === "pcb-hardware") {
      setTrackIcon("Layers");
      setTrackRole("Kỹ sư Phần cứng (Hardware Engineer), Kỹ sư Thiết kế PCB");
    }
  };

  const handleCreateTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim()) return;

    createRoadmapTrack({
      title: trackTitle.trim(),
      category: trackCategory,
      targetRole: trackRole.trim() || "Kỹ sư chuyên ngành",
      description: trackDesc.trim() || "Mô tả lộ trình học tập.",
      icon: trackIcon,
      steps: [],
    });

    setTrackTitle("");
    setTrackRole("");
    setTrackDesc("");
    setShowAddTrackModal(false);
    setTracks(getAllRoadmapTracks());
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrackForStep || !stepTitle.trim()) return;

    const skills = stepSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    addStepToTrack(activeTrackForStep, {
      title: stepTitle.trim(),
      level: stepLevel,
      description: stepDesc.trim(),
      skills: skills.length > 0 ? skills : ["Kỹ năng chuyên môn"],
      recommendedTime: stepTime.trim() || "4 tuần",
    });

    setStepTitle("");
    setStepDesc("");
    setStepSkills("");
    setActiveTrackForStep(null);
    setTracks(getAllRoadmapTracks());
  };

  const handleDeleteStep = (trackId: string, stepId: string) => {
    if (confirm("Bạn có chắc muốn xóa mốc kỹ năng này?")) {
      deleteStepFromTrack(trackId, stepId);
      setTracks(getAllRoadmapTracks());
    }
  };

  const handleDeleteTrack = (trackId: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa toàn bộ lộ trình "${title}"?`)) {
      deleteRoadmapTrack(trackId);
      setTracks(getAllRoadmapTracks());
    }
  };

  return (
    <div className="container py-10 max-w-5xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="text-text-muted hover:text-text-primary mb-2">
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Quay lại Bảng Quản Trị
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            Trình Quản Lý Lộ Trình Học Tập (Roadmap)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Quản lý các chuyên ngành và các mốc kỹ năng học tập tương tác.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href="/roadmap" target="_blank">
              <Eye className="w-3.5 h-3.5 mr-1" />
              Xem Trang /roadmap
            </Link>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddTrackModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tạo Lộ Trình Mới
          </Button>
        </div>
      </div>

      {/* Tracks Container */}
      {tracks.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-border rounded-2xl bg-bg-panel/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mx-auto text-3xl shadow-inner">
            🗺️
          </div>
          <h3 className="text-lg font-bold text-text-primary">
            Hiện chưa có Lộ trình học nào
          </h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            Bạn có thể bấm nút <strong>Tạo Lộ Trình Mới</strong> bên dưới để bắt đầu thiết lập mốc kỹ năng cho sinh viên.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => setShowAddTrackModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tạo Lộ Trình Đầu Tiên
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="p-6 rounded-2xl bg-bg-panel border border-border shadow-md space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    {ICON_MAP[track.icon] || <Cpu className="w-5 h-5 text-accent" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-text-primary">{track.title}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-bg-elevated border border-border text-accent font-bold">
                        {track.category}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      🎯 <strong>Mục tiêu:</strong> {track.targetRole}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">{track.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTrackForStep(track.id)}
                    className="text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    + Thêm mốc kỹ năng
                  </Button>
                  <button
                    onClick={() => handleDeleteTrack(track.id, track.title)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    title="Xóa toàn bộ lộ trình"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3 pl-2 sm:pl-4">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  Các mốc bài học & kỹ năng ({track.steps.length} mốc):
                </span>

                {track.steps.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-2">
                    Chưa có mốc nào. Bấm nút "+ Thêm mốc kỹ năng" để thêm bài học.
                  </p>
                ) : (
                  track.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-4 rounded-xl bg-bg-elevated/50 border border-border/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">#{idx + 1}</span>
                          <span className="font-bold text-text-primary text-sm">{step.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-bg-panel border border-border text-text-muted">
                            {step.level}
                          </span>
                          <span className="text-text-muted text-[11px]">⏱️ {step.recommendedTime}</span>
                        </div>
                        <p className="text-text-secondary leading-relaxed">{step.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {step.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-bg-panel border border-border/80 text-[10px] font-mono text-text-secondary"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteStep(track.id, step.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 self-end sm:self-center"
                        title="Xóa mốc này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Track */}
      {showAddTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-panel border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Tạo Lộ Trình Chuyên Ngành Mới
            </h3>

            <form onSubmit={handleCreateTrack} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Tên Lộ Trình *
                </label>
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="VD: 1. Embedded RTOS Chuyên Sâu"
                  required
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Chuyên mục (5 Mảng)
                  </label>
                  <select
                    value={trackCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as any)}
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="embedded-rtos">1. Embedded RTOS</option>
                    <option value="embedded-linux">2. Linux</option>
                    <option value="tinyml">3. TinyML</option>
                    <option value="fpga">4. FPGA</option>
                    <option value="pcb-hardware">5. PCB</option>
                    <option value="general">Khác / Tổng quát</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Biểu tượng Icon
                  </label>
                  <select
                    value={trackIcon}
                    onChange={(e) => setTrackIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Cpu">Cpu (Embedded RTOS)</option>
                    <option value="Terminal">Terminal (Linux)</option>
                    <option value="Zap">Zap (TinyML / Edge AI)</option>
                    <option value="Binary">Binary (FPGA / ASIC)</option>
                    <option value="Layers">Layers (PCB / Hardware)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Vị trí việc làm mục tiêu
                </label>
                <input
                  type="text"
                  value={trackRole}
                  onChange={(e) => setTrackRole(e.target.value)}
                  placeholder="VD: Kỹ sư Firmware STM32, Kỹ sư Linux Device Driver"
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Mô tả lộ trình
                </label>
                <textarea
                  rows={2}
                  value={trackDesc}
                  onChange={(e) => setTrackDesc(e.target.value)}
                  placeholder="Mô tả lộ trình học tập, các kiến thức cốt lõi..."
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={() => setShowAddTrackModal(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Tạo Lộ Trình
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Step */}
      {activeTrackForStep && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-panel border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Thêm Mốc Kỹ Năng (Step / Milestone)
            </h3>

            <form onSubmit={handleAddStep} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Tên Mốc Bài Học *
                </label>
                <input
                  type="text"
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  placeholder="VD: Mốc 1: C/C++ Chuyên Sâu & ARM Cortex-M"
                  required
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Cấp độ
                  </label>
                  <select
                    value={stepLevel}
                    onChange={(e) => setStepLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                    <option value="Thực chiến">Thực chiến</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Thời lượng khuyến nghị
                  </label>
                  <input
                    type="text"
                    value={stepTime}
                    onChange={(e) => setStepTime(e.target.value)}
                    placeholder="VD: 4 - 6 tuần"
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Mô tả chi tiết kiến thức mốc này
                </label>
                <textarea
                  rows={2}
                  value={stepDesc}
                  onChange={(e) => setStepDesc(e.target.value)}
                  placeholder="Nắm vững con trỏ hàm, memory layout, ngắt ngoại vi NVIC..."
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Kỹ năng đạt được (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={stepSkills}
                  onChange={(e) => setStepSkills(e.target.value)}
                  placeholder="C/C++, Pointers, Memory Map, Bitwise"
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={() => setActiveTrackForStep(null)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Thêm Mốc
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
