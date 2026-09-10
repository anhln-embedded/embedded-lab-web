"use client";

import React, { useEffect, useState } from "react";
import { Cpu, PlusCircle, RefreshCw, Settings, Sparkles } from "lucide-react";

export interface CircuitPresetData {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  mcuType: string;
  diagramJson: string;
  firmwareHex: string;
  firmwareName: string;
  order?: number;
}

interface PresetSelectorProps {
  onSelectPreset: (preset: CircuitPresetData) => void;
  isAdmin?: boolean;
  onOpenAdminManager?: () => void;
  reloadTrigger?: number;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelectPreset,
  isAdmin = false,
  onOpenAdminManager,
  reloadTrigger = 0,
}) => {
  const [presets, setPresets] = useState<CircuitPresetData[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tải danh sách mạch mẫu từ Database
  const fetchPresets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/simulator/presets");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPresets(data.data);
      }
    } catch (err) {
      console.warn("Không thể tải danh sách mạch mẫu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, [reloadTrigger]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) return;

    const found = presets.find((p) => p.id === id);
    if (found) {
      onSelectPreset(found);
    }
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Khung Dropdown -- Mạch mẫu MCU -- (Đúng chuẩn style bo tròn viền cam như thiết kế) */}
      <div className="relative inline-flex items-center">
        <select
          value={selectedId}
          onChange={handleChange}
          disabled={isLoading && presets.length === 0}
          title="Chọn mạch mẫu có sẵn và firmware tương ứng"
          className="appearance-none pl-4 pr-7 py-1 rounded-full text-xs font-bold text-text-primary bg-bg-elevated border-2 border-orange-500/80 hover:border-orange-500 hover:bg-orange-500/5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all cursor-pointer shadow-xs max-w-[190px] sm:max-w-[220px] truncate"
        >
          <option value="" className="bg-bg-panel text-text-muted font-normal">
            -- Mạch mẫu MCU --
          </option>
          {presets.map((p) => (
            <option
              key={p.id}
              value={p.id}
              className="bg-bg-panel text-text-primary font-medium py-1"
            >
              {p.title}
            </option>
          ))}
        </select>

        {/* Icon mũi tên xổ xuống nhỏ gọn */}
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-500">
          <svg
            className="w-3 h-3 fill-current"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Nút Quản trị dành riêng cho Admin để thêm/sửa/xóa mạch mẫu */}
      {isAdmin && onOpenAdminManager && (
        <button
          onClick={onOpenAdminManager}
          title="Admin: Quản lý và tải lên mạch mẫu mới vào Database"
          className="px-2 py-1 rounded-full text-[11px] font-bold bg-orange-500 text-white hover:bg-orange-600 transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <PlusCircle className="w-3 h-3" />
          <span className="hidden sm:inline">Thêm mẫu</span>
        </button>
      )}
    </div>
  );
};
