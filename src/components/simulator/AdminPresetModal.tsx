"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Cpu,
  Save,
  Layers,
  FileCode2,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { CircuitPresetData } from "./PresetSelector";

interface AdminPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  currentDiagram: any;
  currentFirmware: { name: string; content: string | ArrayBuffer };
  onPresetSaved: () => void;
}

export const AdminPresetModal: React.FC<AdminPresetModalProps> = ({
  isOpen,
  onClose,
  user,
  currentDiagram,
  currentFirmware,
  onPresetSaved,
}) => {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [presets, setPresets] = useState<CircuitPresetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mcuType, setMcuType] = useState("stm32");
  const [diagramJson, setDiagramJson] = useState("");
  const [firmwareName, setFirmwareName] = useState("blink.hex");
  const [firmwareHex, setFirmwareHex] = useState("");

  const loadPresets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/simulator/presets");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPresets(data.data);
      }
    } catch (err) {
      console.warn("Lỗi tải presets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPresets();
      setMessage(null);
    }
  }, [isOpen]);

  // Hành động điền tự động dữ liệu đang có trên simulator vào form
  const handleCopyCurrentSimulatorData = () => {
    try {
      setDiagramJson(JSON.stringify(currentDiagram, null, 2));
      setFirmwareName(currentFirmware?.name || "blink.hex");
      if (typeof currentFirmware?.content === "string") {
        setFirmwareHex(currentFirmware.content);
      }
      if (!title) {
        setTitle("STM32 Mạch mẫu mới - " + new Date().toLocaleDateString("vi-VN"));
      }
      setMessage({
        type: "success",
        text: "Đã trích xuất sơ đồ mạch và firmware hiện tại vào biểu mẫu!",
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Đọc file HEX tải lên từ máy
  const handleHexFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFirmwareName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFirmwareHex(text);
    };
    reader.readAsText(file);
  };

  // Đọc file diagram.json tải lên từ máy
  const handleDiagramFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDiagramJson(text);
    };
    reader.readAsText(file);
  };

  // Submit tạo preset
  const handleCreatePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !diagramJson.trim()) {
      setMessage({ type: "error", text: "Vui lòng điền tiêu đề và nội dung diagram.json!" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/simulator/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          mcuType,
          diagramJson,
          firmwareName,
          firmwareHex,
          user: { id: user?.id, name: user?.name, email: user?.email, role: user?.role },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Đã thêm mạch mẫu thành công vào Database!" });
        setTitle("");
        setDescription("");
        setDiagramJson("");
        setFirmwareHex("");
        loadPresets();
        onPresetSaved();
        setTimeout(() => setActiveTab("list"), 1200);
      } else {
        setMessage({ type: "error", text: data.error || "Lỗi lưu mạch mẫu" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi kết nối máy chủ" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa preset
  const handleDeletePreset = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mạch mẫu này khỏi cơ sở dữ liệu?")) return;

    try {
      const res = await fetch(`/api/simulator/presets?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPresets((prev) => prev.filter((p) => p.id !== id));
        onPresetSaved();
      } else {
        alert(data.error || "Không thể xóa");
      }
    } catch (err) {
      alert("Lỗi xóa mạch mẫu");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-bg-panel border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/80 shrink-0 bg-bg-elevated">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
                <span>Quản Lý Mạch Mẫu & Firmware</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 font-bold border border-orange-500/20">
                  Admin Database
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                Đẩy mạch mẫu và mã HEX vào cơ sở dữ liệu để hiển thị trên Dropdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-panel transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-5 pt-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab("list");
              setMessage(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-bg-elevated hover:bg-border text-text-secondary"
            }`}
          >
            Danh sách mạch mẫu ({presets.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("create");
              setMessage(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "create"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-bg-elevated hover:bg-border text-text-secondary"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm mạch mẫu mới</span>
          </button>
        </div>

        {/* Thông báo Message */}
        {message && (
          <div
            className={`mx-5 mt-3 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Nội dung Form / List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3">
          {activeTab === "list" ? (
            /* Danh sách Presets */
            <div className="space-y-2.5">
              {isLoading ? (
                <div className="py-12 text-center text-xs text-text-muted">
                  Đang tải danh sách mạch mẫu từ Database...
                </div>
              ) : presets.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted">
                  Chưa có mạch mẫu nào trong cơ sở dữ liệu.
                </div>
              ) : (
                presets.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-bg-elevated border border-border/80 flex items-start justify-between gap-3 hover:border-orange-500/40 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-orange-500">
                          #{idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-text-primary">{item.title}</h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-accent/10 text-accent font-semibold uppercase">
                          {item.mcuType}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-text-muted pt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <FileCode2 className="w-3 h-3 text-accent" />
                          {item.firmwareName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-orange-500" />
                          {item.diagramJson?.length > 0 ? "Có diagram.json" : "Không có sơ đồ"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePreset(item.id)}
                      title="Xóa mạch mẫu khỏi Database"
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Form Thêm Mới */
            <form onSubmit={handleCreatePreset} className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <span className="text-xs font-bold text-text-secondary">Điền thông tin mạch</span>
                <button
                  type="button"
                  onClick={handleCopyCurrentSimulatorData}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-accent/15 text-accent hover:bg-accent/25 border border-accent/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Lấy sơ đồ & firmware hiện tại trên màn hình</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-text-secondary">Tên mạch mẫu *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: STM32F103 - Đèn giao thông 3 màu..."
                    className="w-full px-3 py-1.5 rounded-xl bg-bg-code border border-border text-xs text-text-primary focus:outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-secondary">Dòng MCU</label>
                  <select
                    value={mcuType}
                    onChange={(e) => setMcuType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-bg-code border border-border text-xs text-text-primary focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="stm32">STM32 Blue Pill</option>
                    <option value="esp32">ESP32 DevKit</option>
                    <option value="arduino">Arduino Uno</option>
                    <option value="rp2040">Raspberry Pi Pico</option>
                  </select>
                </div>
              </div>

              {/* Sơ đồ Wokwi diagram.json */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-text-secondary">
                    Sơ đồ Wokwi (diagram.json) *
                  </label>
                  <label className="text-[10px] text-accent hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-2.5 h-2.5" />
                    <span>Tải file .json</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleDiagramFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={5}
                  value={diagramJson}
                  onChange={(e) => setDiagramJson(e.target.value)}
                  placeholder='{"version": 1, "parts": [...], "connections": [...]}'
                  className="w-full p-2.5 rounded-xl bg-bg-code border border-border font-mono text-[11px] text-text-primary focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              {/* Nút Tải Lên File .hex Mẫu Từ Máy Tính */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-text-secondary flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-orange-500" />
                  <span>File Firmware Mẫu (.hex)</span>
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-bg-elevated hover:bg-border border border-orange-500/40 hover:border-orange-500 text-text-primary text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 shadow-xs group">
                    <Upload className="w-4 h-4 text-orange-500 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Tải lên file .hex mẫu từ máy tính</span>
                    <input
                      type="file"
                      accept=".hex"
                      onChange={handleHexFileUpload}
                      className="hidden"
                    />
                  </label>

                  {firmwareHex ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono font-bold">{firmwareName || "firmware.hex"}</span>
                      <span className="text-[10px] text-text-muted">
                        ({firmwareHex.split("\n").filter((l) => l.trim()).length} dòng HEX)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFirmwareHex("");
                          setFirmwareName("");
                        }}
                        className="p-0.5 hover:text-rose-500 transition-colors ml-1 cursor-pointer"
                        title="Hủy file hex này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-text-muted italic">
                      (Chưa chọn file hex, hoặc bấm nút &quot;Lấy sơ đồ &amp; firmware hiện tại&quot;)
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-4 py-1.5 rounded-xl bg-bg-elevated hover:bg-border text-text-secondary text-xs font-semibold border border-border transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Đang lưu..." : "Lưu Mạch Mẫu vào Database"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
