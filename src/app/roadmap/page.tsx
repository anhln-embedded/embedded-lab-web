"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAllRoadmapTracks, RoadmapTrack } from "@/lib/roadmap-store";
import {
  Cpu,
  BrainCircuit,
  Binary,
  Radio,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Award,
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const ICON_MAP: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-6 h-6 text-cyan-400" />,
  BrainCircuit: <BrainCircuit className="w-6 h-6 text-amber-400" />,
  Binary: <Binary className="w-6 h-6 text-purple-400" />,
  Radio: <Radio className="w-6 h-6 text-rose-400" />,
  Layers: <Layers className="w-6 h-6 text-accent" />,
};

export default function RoadmapPage() {
  const { user, completedSteps, toggleRoadmapStep, isStepCompleted } = useAuth();
  const [tracks, setTracks] = useState<RoadmapTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<string>("all");
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadedTracks = getAllRoadmapTracks();
    setTracks(loadedTracks);
    if (loadedTracks.length > 0) {
      setExpandedTrack(loadedTracks[0].id);
    }

    const handleUpdate = () => {
      const updated = getAllRoadmapTracks();
      setTracks(updated);
    };

    window.addEventListener("embedded_roadmap_updated", handleUpdate);
    return () => window.removeEventListener("embedded_roadmap_updated", handleUpdate);
  }, []);

  if (!mounted) return null;

  // Calculate total completed steps across all tracks
  const allStepsCount = tracks.reduce((acc, t) => acc + t.steps.length, 0);
  const totalCompleted = Object.values(completedSteps).reduce((acc, list) => acc + list.length, 0);
  const overallPercentage = allStepsCount > 0 ? Math.round((totalCompleted / allStepsCount) * 100) : 0;

  return (
    <div className="container py-12 md:py-16">
      {/* Hero Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-accent-muted text-accent text-xs font-semibold border border-accent/20 mb-4 shadow-sm">
          <GraduationCap className="w-4 h-4" />
          Lộ trình Đào tạo & Nghiên cứu Kỹ sư Nhúng
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">
          Lộ Trình Học Tập <span className="text-accent">Embedded-AIoT</span>
        </h1>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed">
          Được thiết kế bài bản theo từng cấp độ, giúp sinh viên và người học định hướng lộ trình rõ ràng từ nền tảng căn bản đến mức độ chuyên gia thực chiến.
        </p>

        {/* Progress Tracker Overview */}
        {tracks.length > 0 && (
          <div className="mt-8 p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-md text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Tiến độ của bạn ({user ? user.name : "Khách vãng lai"}):
                </span>
                <div className="text-lg font-bold text-text-primary flex items-center gap-2 mt-0.5">
                  <Award className="w-5 h-5 text-accent" />
                  <span>{totalCompleted} / {allStepsCount} mốc kỹ năng đã hoàn thành</span>
                  <span className="text-accent text-base">({overallPercentage}%)</span>
                </div>
              </div>
              {!user && (
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href="/login?redirect=/roadmap">
                    Đăng nhập để lưu tiến độ
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-bg-elevated overflow-hidden border border-border/60">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-accent to-purple-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(4, overallPercentage)}%` }}
              />
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              💡 <em>Mẹo:</em> Bấm vào ô tròn trước mỗi mốc bài học bên dưới để đánh dấu hoàn thành kỹ năng.
            </p>
          </div>
        )}
      </div>

      {/* Empty State when no tracks */}
      {tracks.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-16 px-6 border border-border/80 rounded-3xl bg-bg-panel/70 backdrop-blur-xl shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-accent-muted border border-accent/20 flex items-center justify-center mx-auto text-3xl shadow-inner">
            🗺️
          </div>
          <h3 className="text-xl font-bold text-text-primary">
            Lộ trình học tập đang được cập nhật
          </h3>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">
            Nội dung các mốc kỹ năng và bài tập thực hành đang được chuẩn hóa chi tiết. Trong thời gian này, bạn có thể tham gia các khóa học thực nghiệm hoặc đọc bài viết chia sẻ kỹ thuật của Lab.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Button variant="primary" asChild className="bg-gradient-to-r from-accent to-accent-amber hover:brightness-110 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md">
              <Link href="/courses">
                <BookOpen className="w-4 h-4 mr-1.5" />
                Khám Phá Khóa Học Lab
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>

            <Button variant="outline" asChild className="text-xs sm:text-sm font-semibold rounded-xl">
              <Link href="/blog">
                <Sparkles className="w-4 h-4 mr-1.5 text-accent" />
                Đọc Bảng Tin Kỹ Thuật
              </Link>
            </Button>

            {user && (user.role === "admin" || user.role === "superadmin") && (
              <Button variant="ghost" asChild className="text-xs text-text-muted hover:text-accent">
                <Link href="/admin/roadmap">
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Quản trị Lộ trình (Admin)
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Track Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveTrack("all")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
                activeTrack === "all"
                  ? "bg-accent text-white border-accent shadow-sm"
                  : "bg-bg-panel border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Tất cả ({tracks.length})
            </button>
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTrack(t.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border flex items-center gap-2 ${
                  activeTrack === t.id
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-bg-panel border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <span>{t.title.split("(")[0].trim()}</span>
              </button>
            ))}
          </div>

          {/* Tracks List */}
          <div className="space-y-8 max-w-4xl mx-auto">
            {tracks
              .filter((t) => activeTrack === "all" || activeTrack === t.id)
              .map((track) => {
                const trackCompleted = track.steps.filter((s) =>
                  isStepCompleted(track.id, s.id)
                ).length;
                const trackPercent =
                  track.steps.length > 0
                    ? Math.round((trackCompleted / track.steps.length) * 100)
                    : 0;
                const isExpanded = expandedTrack === track.id || activeTrack !== "all";

                return (
                  <div
                    key={track.id}
                    className="bg-bg-panel border border-border/80 rounded-2xl overflow-hidden shadow-lg transition-all"
                  >
                    {/* Track Header Card */}
                    <div
                      onClick={() =>
                        setExpandedTrack(isExpanded && activeTrack === "all" ? null : track.id)
                      }
                      className="p-6 cursor-pointer hover:bg-bg-elevated/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0 shadow-inner">
                          {ICON_MAP[track.icon] || <Cpu className="w-6 h-6 text-accent" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h2 className="text-lg md:text-xl font-bold text-text-primary">
                              {track.title}
                            </h2>
                          </div>
                          <p className="text-xs text-text-muted mb-1.5">
                            🎯 <strong>Mục tiêu:</strong> {track.targetRole}
                          </p>
                          <p className="text-xs text-text-secondary line-clamp-2 max-w-2xl">
                            {track.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-center">
                        <div className="text-right">
                          <span className="text-xs font-bold text-text-primary block">
                            {trackCompleted}/{track.steps.length} Hoàn thành
                          </span>
                          <span className="text-[11px] text-accent font-semibold">
                            {trackPercent}%
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-bg-elevated border border-border text-text-muted">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Track Steps (Milestones) */}
                    {isExpanded && (
                      <div className="p-6 md:p-8 space-y-6 bg-bg-panel/40">
                        {track.steps.length === 0 ? (
                          <p className="text-xs text-text-muted italic text-center py-4">
                            Lộ trình này chưa có mốc kỹ năng nào.
                          </p>
                        ) : (
                          <div className="relative pl-6 md:pl-8 border-l-2 border-border/80 space-y-8">
                            {track.steps.map((step, idx) => {
                              const completed = isStepCompleted(track.id, step.id);

                              return (
                                <div key={step.id} className="relative group">
                                  {/* Checkbox Button */}
                                  <button
                                    type="button"
                                    onClick={() => toggleRoadmapStep(track.id, step.id)}
                                    className={`absolute -left-[31px] md:-left-[39px] top-1 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all ${
                                      completed
                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-110"
                                        : "bg-bg-elevated border border-border text-text-muted hover:border-accent hover:text-accent"
                                    }`}
                                    title={
                                      completed
                                        ? "Bấm để bỏ đánh dấu"
                                        : "Bấm để đánh dấu đã hoàn thành"
                                    }
                                  >
                                    {completed ? (
                                      <CheckCircle2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  {/* Step Card Content */}
                                  <div
                                    className={`p-5 rounded-xl border transition-all ${
                                      completed
                                        ? "bg-emerald-500/5 border-emerald-500/30 shadow-sm"
                                        : "bg-bg-elevated/60 border-border/80 hover:border-border"
                                    }`}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2.5">
                                        <span className="text-xs font-mono font-bold text-accent">
                                          #{idx + 1}
                                        </span>
                                        <h3
                                          className={`text-base font-bold ${
                                            completed
                                              ? "text-emerald-400 line-through"
                                              : "text-text-primary"
                                          }`}
                                        >
                                          {step.title}
                                        </h3>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-bg-panel border border-border text-text-muted">
                                          ⏱️ {step.recommendedTime}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            step.level === "Cơ bản"
                                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                              : step.level === "Trung cấp"
                                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                              : step.level === "Nâng cao"
                                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                          }`}
                                        >
                                          {step.level}
                                        </span>
                                      </div>
                                    </div>

                                    <p className="text-xs md:text-sm text-text-secondary mb-3 leading-relaxed">
                                      {step.description}
                                    </p>

                                    {/* Skills tags */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
                                      <span className="text-[11px] font-semibold text-text-muted mr-1">
                                        Kỹ năng:
                                      </span>
                                      {step.skills.map((skill) => (
                                        <span
                                          key={skill}
                                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-bg-panel border border-border/80 text-text-secondary"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
