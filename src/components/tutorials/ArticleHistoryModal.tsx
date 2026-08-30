"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { markdownToLabHtml } from "@/lib/markdown-importer";
import {
  X,
  History,
  RotateCcw,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileText,
  ChevronRight,
  Eye,
  Calendar,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface HistoryItem {
  id: string;
  articleId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userRole: string;
  userAvatar?: string;
  title: string;
  readTime?: string;
  summary?: string;
  contentHtml?: string;
  codeSnippet?: string;
  codeLang?: string;
  codeFilename?: string;
  changeSummary?: string;
  createdAt: string;
}

interface ArticleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicSlug: string;
  postSlug: string;
  onRestored: () => void;
}

export function ArticleHistoryModal({
  isOpen,
  onClose,
  topicSlug,
  postSlug,
  onRestored,
}: ArticleHistoryModalProps) {
  const { user } = useAuth();

  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchHistories = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/tutorials/${topicSlug}/articles/${postSlug}`);
      const json = await res.json();
      if (json.success && json.data?.histories) {
        setHistories(json.data.histories);
        if (json.data.histories.length > 0) {
          setSelectedHistory(json.data.histories[0]);
        } else {
          setSelectedHistory(null);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi tải lịch sử");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistories();
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, topicSlug, postSlug]);

  if (!isOpen) return null;

  const handleRestore = async (historyId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn khôi phục bài viết về phiên bản này không?")) {
      return;
    }

    setIsRestoring(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/tutorials/${topicSlug}/articles/${postSlug}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historyId,
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
              }
            : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg("Đã khôi phục bài viết thành công!");
        onRestored();
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setErrorMsg(json.error || "Không thể khôi phục phiên bản này");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi kết nối máy chủ");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-bg-panel border border-border/80 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-bg-elevated/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-text-primary flex items-center gap-2">
                <span>Lịch Sử Chỉnh Sửa Bài Viết</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-mono">
                  {histories.length} phiên bản
                </span>
              </h2>
              <p className="text-xs text-text-muted">
                Theo dõi chi tiết từng User đã sửa đổi, thời gian và khôi phục phiên bản cũ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body: 2 Columns (Timeline List & Version Preview) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Column 1: History Timeline List (5 cols) */}
          <div className="lg:col-span-5 p-4 overflow-y-auto space-y-3 max-h-[40vh] lg:max-h-[75vh] scrollbar-thin">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Dòng thời gian chỉnh sửa</span>
            </h3>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-text-muted">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Đang tải lịch sử chỉnh sửa...
              </div>
            ) : histories.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-bg-elevated/40 border border-dashed border-border text-xs text-text-muted space-y-2">
                <div className="w-10 h-10 rounded-full bg-bg-panel flex items-center justify-center mx-auto text-xl">
                  📝
                </div>
                <p>Chưa có lịch sử chỉnh sửa nào được lưu.</p>
                <p className="text-[11px] text-text-muted/70">
                  Lịch sử sẽ tự động được ghi lại khi bạn bấm &ldquo;Lưu bài viết&rdquo;.
                </p>
              </div>
            ) : (
              histories.map((h, idx) => {
                const isSelected = selectedHistory?.id === h.id;
                const dateObj = new Date(h.createdAt);
                const formattedDate = dateObj.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHistory(h)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-accent/15 border-accent shadow-md"
                        : "bg-bg-elevated/60 border-border/80 hover:bg-bg-elevated hover:border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          avatar={h.userAvatar}
                          name={h.userName}
                          role={h.userRole}
                          className="w-7 h-7 rounded-full border border-border"
                          textClassName="text-xs"
                          size={28}
                        />
                        <div>
                          <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                            <span>{h.userName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-accent/20 text-accent uppercase font-mono font-bold">
                              {h.userRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-muted block">{h.userEmail}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold text-accent block">
                          {formattedTime}
                        </span>
                        <span className="text-[10px] text-text-muted block">{formattedDate}</span>
                      </div>
                    </div>

                    {/* Change note */}
                    <p className="text-xs text-text-secondary line-clamp-2 bg-bg-panel/60 p-2 rounded-xl border border-border/60">
                      💬 &ldquo;{h.changeSummary || "Cập nhật nội dung"}&rdquo;
                    </p>

                    {idx === 0 && (
                      <span className="inline-block mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        ★ Phiên bản mới nhất
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Column 2: Version Content Preview (7 cols) */}
          <div className="lg:col-span-7 p-6 overflow-y-auto max-h-[50vh] lg:max-h-[75vh] space-y-5 scrollbar-thin bg-bg-panel">
            {selectedHistory ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-accent tracking-wider block mb-1">
                      Xem Trước Phiên Bản
                    </span>
                    <h3 className="text-base font-extrabold text-text-primary">
                      {selectedHistory.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Sửa bởi <strong>{selectedHistory.userName}</strong> vào lúc{" "}
                      {new Date(selectedHistory.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    disabled={isRestoring}
                    onClick={() => handleRestore(selectedHistory.id)}
                    className="bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 flex items-center gap-1.5 text-xs py-2 px-3.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục bản này</span>
                  </Button>
                </div>

                {/* Summary */}
                {selectedHistory.summary && (
                  <div className="p-4 rounded-2xl bg-bg-elevated border-l-4 border-accent text-xs text-text-secondary leading-relaxed">
                    <strong className="text-accent block mb-1">Tóm tắt lúc sửa:</strong>
                    {selectedHistory.summary}
                  </div>
                )}

                {/* Code Snippet */}
                {selectedHistory.codeSnippet && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-text-muted flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-accent" />
                      <span>
                        Mã nguồn mẫu ({selectedHistory.codeFilename || "main.c"} -{" "}
                        {selectedHistory.codeLang || "c"}):
                      </span>
                    </span>
                    <pre className="p-4 rounded-2xl bg-bg-elevated border border-border text-xs font-mono text-text-primary overflow-x-auto">
                      <code>{selectedHistory.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Article Content Rendered */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text-muted flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    <span>Nội dung bài viết phiên bản này:</span>
                  </span>
                  <div
                    className="p-6 rounded-2xl bg-bg-elevated border border-border prose prose-slate dark:prose-invert !max-w-none text-xs sm:text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: markdownToLabHtml(selectedHistory.contentHtml || ""),
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-xs text-text-muted">
                Chọn một phiên bản bên trái để xem nội dung chi tiết.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-bg-elevated/40">
          <span className="text-xs text-text-muted">
            Tất cả thao tác chỉnh sửa đều được lưu vết minh bạch trong SQLite Database
          </span>
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
