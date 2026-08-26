"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Edit3,
  Trash2,
  Save,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";

export interface TutorialCategoryItem {
  id?: string;
  slug: string;
  name: string;
  icon: string;
  order?: number;
}

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: TutorialCategoryItem[];
  onUpdated: () => void;
}

const PRESET_ICONS = ["🐧", "⚡", "🚗", "🎛️", "💻", "📐", "🔬", "🤖", "📡", "🌐", "🛡️", "⚙️", "📚", "🧠", "💡"];

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onUpdated,
}: CategoryManagerModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editIcon, setEditIcon] = useState("📚");

  // Form Thêm mới
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newIcon, setNewIcon] = useState("🐧");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (cat: TutorialCategoryItem) => {
    setEditingId(cat.id || cat.slug);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditIcon(cat.icon);
    setIsAddingNew(false);
  };

  const handleSaveEdit = async (cat: TutorialCategoryItem) => {
    if (!editName.trim() || !editSlug.trim()) {
      alert("Vui lòng điền đầy đủ tên và slug danh mục.");
      return;
    }

    setIsSubmitting(true);
    try {
      const targetId = cat.id || cat.slug;
      const res = await fetch(`/api/tutorials/categories/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          icon: editIcon,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi lưu danh mục");
      }

      setEditingId(null);
      onUpdated();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: TutorialCategoryItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhóm danh mục "${cat.name}"?`)) return;

    setIsSubmitting(true);
    try {
      const targetId = cat.id || cat.slug;
      const res = await fetch(`/api/tutorials/categories/${targetId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi xóa danh mục");
      }

      onUpdated();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) {
      alert("Vui lòng nhập tên và slug nhóm danh mục.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tutorials/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          slug: newSlug,
          icon: newIcon,
          order: categories.length + 1,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lỗi tạo danh mục");
      }

      setNewName("");
      setNewSlug("");
      setNewIcon("🐧");
      setIsAddingNew(false);
      onUpdated();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-bg-panel border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-bg-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text-primary">
                Quản Lý Nhóm Chuyên Đề (Categories Manager)
              </h3>
              <p className="text-[11px] text-text-muted">
                Tạo mới, chỉnh sửa icon/tên hoặc xóa nhóm chuyên đề kỹ thuật
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Action Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">
              Danh sách nhóm hiện tại ({categories.length} nhóm):
            </span>

            {!isAddingNew && (
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => setIsAddingNew(true)}
                className="bg-accent hover:bg-accent-hover text-white text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Nhóm Mới</span>
              </Button>
            )}
          </div>

          {/* Form Thêm Nhóm Mới */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateNew}
              className="p-4 rounded-2xl bg-accent/5 border border-accent/30 space-y-3 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Thêm nhóm chuyên mục mới:
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-[11px] text-text-muted hover:text-text-primary"
                >
                  Hủy
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1">
                    Icon Emoji
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      className="w-12 px-2 py-1.5 rounded-lg bg-bg-panel border border-border text-center text-sm font-bold"
                    />
                    <select
                      onChange={(e) => setNewIcon(e.target.value)}
                      className="px-2 py-1.5 rounded-lg bg-bg-panel border border-border text-xs"
                    >
                      {PRESET_ICONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-text-muted mb-1">
                    Tên nhóm danh mục *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setNewSlug(slugify(e.target.value));
                    }}
                    placeholder="VD: Edge AI & TinyML"
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-bg-panel border border-border text-xs text-text-primary focus:border-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-1">
                    Slug ID *
                  </label>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="edge-ai"
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-bg-panel border border-border text-xs font-mono text-text-primary focus:border-accent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {isSubmitting ? "Đang lưu..." : "Xác Nhận Tạo"}
                </Button>
              </div>
            </form>
          )}

          {/* Danh Sách Các Nhóm Hiện Tại */}
          <div className="space-y-2">
            {categories.map((cat) => {
              const isEditing = editingId === (cat.id || cat.slug);

              if (isEditing) {
                return (
                  <div
                    key={cat.id || cat.slug}
                    className="p-3.5 rounded-2xl bg-bg-elevated border border-accent/40 space-y-2.5 shadow-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted mb-0.5">Icon</label>
                        <input
                          type="text"
                          value={editIcon}
                          onChange={(e) => setEditIcon(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-bg-panel border border-border text-center text-sm font-bold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-text-muted mb-0.5">Tên nhóm</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-bg-panel border border-border text-xs font-bold text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted mb-0.5">Slug ID</label>
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-bg-panel border border-border text-xs font-mono text-text-primary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-text-muted hover:text-text-primary px-2 py-1"
                      >
                        Hủy
                      </button>
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={() => handleSaveEdit(cat)}
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-xl"
                      >
                        <Save className="w-3.5 h-3.5 mr-1" />
                        Lưu
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cat.id || cat.slug}
                  className="flex items-center justify-between p-3 rounded-2xl bg-bg-elevated/40 hover:bg-bg-elevated border border-border/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-1.5 rounded-xl bg-bg-panel border border-border">
                      {cat.icon}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">{cat.name}</h4>
                      <span className="text-[10px] font-mono text-text-muted">slug: {cat.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-lg bg-bg-panel border border-border text-text-muted hover:text-accent hover:border-accent transition-colors"
                      title="Chỉnh sửa nhóm này"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Xóa nhóm này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-bg-elevated/40 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
