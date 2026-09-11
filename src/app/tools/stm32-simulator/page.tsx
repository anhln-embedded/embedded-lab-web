"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  Upload,
  RefreshCw,
  FileCode2,
  Sparkles,
  Code2,
} from "lucide-react";
import { DiagramSchema, PRESET_DIAGRAMS } from "@/lib/emulator/diagram-parser";
import { SAMPLE_BLINK_HEX } from "@/components/simulator/FirmwareUploader";
import { DiagramEditor } from "@/components/simulator/DiagramEditor";
import { AiCircuitChat } from "@/components/simulator/AiCircuitChat";
import { WokwiEmbedCanvas } from "@/components/simulator/WokwiEmbedCanvas";
import { WokwiClient } from "@/lib/wokwi/wokwi-client";
import { useAuth } from "@/context/AuthContext";
import { PresetSelector, CircuitPresetData } from "@/components/simulator/PresetSelector";
import { AdminPresetModal } from "@/components/simulator/AdminPresetModal";

export default function Stm32SimulatorPage() {
  const { user } = useAuth();
  // Sơ đồ mạch mặc định: Chỉ có 1 vi điều khiển STM32 Blue Pill ở chính giữa màn hình (top: 0, left: 0)
  const [diagram, setDiagram] = useState<DiagramSchema>(PRESET_DIAGRAMS.default_stm32);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [presetReloadTrigger, setPresetReloadTrigger] = useState<number>(0);

  // Tab chuyển đổi ở cột trái: Trợ lý AI hoặc Code diagram.json
  const [leftTab, setLeftTab] = useState<"ai-chat" | "code">("ai-chat");

  // Quản lý Firmware mặc định (blink.hex Keil MDK STM32F1 PC13)
  const [filename, setFilename] = useState<string>("blink.hex");
  const [rawFirmware, setRawFirmware] = useState<{
    name: string;
    content: string | ArrayBuffer;
    isBinary: boolean;
  }>({
    name: "blink.hex",
    content: SAMPLE_BLINK_HEX,
    isBinary: false,
  });

  // Trạng thái thực thi mô phỏng
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Wokwi Live Engine Reference
  const wokwiClientRef = useRef<WokwiClient | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý sự kiện khi Wokwi Client sẵn sàng
  const handleWokwiReady = async (client: WokwiClient) => {
    wokwiClientRef.current = client;

    // Tự động upload firmware hiện tại nếu có
    if (rawFirmware) {
      try {
        await client.fileUpload(rawFirmware.name, rawFirmware.content);
      } catch (err) {
        console.warn("Lỗi nạp firmware tự động lên Wokwi:", err);
      }
    }
  };

  // Nạp file firmware người dùng chọn (hỗ trợ .hex, .bin, .elf, .uf2)
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isHex = lowerName.endsWith(".hex") || lowerName.endsWith(".ihx");
    const reader = new FileReader();

    if (isHex) {
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        setFilename(file.name);
        setRawFirmware({ name: file.name, content: text, isBinary: false });
        setIsRunning(false);

        if (wokwiClientRef.current) {
          try {
            await wokwiClientRef.current.fileUpload(file.name, text);
          } catch (err: any) {
            console.error("Lỗi upload firmware lên Wokwi:", err);
          }
        }
      };
      reader.readAsText(file);
    } else {
      // File nhị phân (.bin, .elf, .uf2)
      reader.onload = async (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        setFilename(file.name);
        setRawFirmware({ name: file.name, content: buffer, isBinary: true });
        setIsRunning(false);

        if (wokwiClientRef.current) {
          try {
            await wokwiClientRef.current.fileUpload(file.name, buffer);
          } catch (err: any) {
            console.error("Lỗi upload firmware nhị phân lên Wokwi:", err);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }

    e.target.value = "";
  };

  // Nạp lại firmware mặc định blink.hex PC13
  const loadSampleBlink = async () => {
    setFilename("blink.hex");
    setRawFirmware({
      name: "blink.hex",
      content: SAMPLE_BLINK_HEX,
      isBinary: false,
    });
    setIsRunning(false);

    if (wokwiClientRef.current) {
      await wokwiClientRef.current.fileUpload("blink.hex", SAMPLE_BLINK_HEX);
    }
  };

  // Điều khiển Chạy (Run) / Tạm dừng duy nhất 1 chỗ
  const handleToggleRun = async () => {
    if (!wokwiClientRef.current) return;
    if (isRunning) {
      await wokwiClientRef.current.simPause();
      setIsRunning(false);
    } else {
      await wokwiClientRef.current.fileUpload(rawFirmware.name, rawFirmware.content);
      await wokwiClientRef.current.simStart({
        firmware: rawFirmware.name,
        elf: rawFirmware.name,
      });
      setIsRunning(true);
    }
  };

  // Điều khiển Reset vi điều khiển duy nhất 1 chỗ
  const handleReset = async () => {
    setIsRunning(false);
    if (wokwiClientRef.current) {
      await wokwiClientRef.current.simRestart();
    }
  };

  // Xử lý khi người dùng chọn Mạch mẫu từ Dropdown Database
  const handleSelectPreset = async (preset: CircuitPresetData) => {
    try {
      setIsRunning(false);

      // 1. Cập nhật sơ đồ diagram.json
      if (preset.diagramJson) {
        try {
          const parsed = JSON.parse(preset.diagramJson);
          setDiagram(parsed);
        } catch (e) {
          console.error("Lỗi parse diagramJson của preset:", e);
        }
      }

      // 2. Cập nhật firmware hex
      if (preset.firmwareHex) {
        const fwName = preset.firmwareName || "firmware.hex";
        setFilename(fwName);
        setRawFirmware({
          name: fwName,
          content: preset.firmwareHex,
          isBinary: false,
        });

        if (wokwiClientRef.current) {
          await wokwiClientRef.current.fileUpload(fwName, preset.firmwareHex);
        }
      }
    } catch (err) {
      console.error("Lỗi áp dụng mạch mẫu:", err);
    }
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex flex-col min-h-[calc(100dvh-4.25rem)] lg:h-[calc(100vh-4.5rem)] gap-2 overflow-y-auto lg:overflow-hidden animate-fade-in">
      {/* Thanh công cụ mô phỏng chuẩn Studio chuyên nghiệp siêu gọn */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-bg-panel border border-border px-3 py-1.5 rounded-xl shadow-xs transition-colors duration-200 shrink-0">
        {/* Khối bên trái: Dropdown Mạch mẫu MCU, Nút Nạp Firmware & Hộp hiển thị file */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dropdown Mạch mẫu MCU từ Database */}
          <PresetSelector
            onSelectPreset={handleSelectPreset}
            isAdmin={user?.role === "admin" || user?.role === "superadmin"}
            onOpenAdminManager={() => setIsAdminModalOpen(true)}
            reloadTrigger={presetReloadTrigger}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".hex,.bin,.elf,.uf2,.ihx"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Nút nạp file chính */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Hỗ trợ file .HEX (Keil C / Arduino), .BIN / .ELF (ESP-IDF / STM32Cube), .UF2 (Pico)"
            className="px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-accent/25 active:scale-98"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nạp Firmware</span>
          </button>

          {/* Hộp hiển thị file đã nạp hiện tại */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-xs">
            <FileCode2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span
              className="font-mono text-[11px] font-medium text-text-primary max-w-[200px] truncate"
              title={filename}
            >
              {filename}
            </span>
            <button
              onClick={loadSampleBlink}
              title="Khôi phục firmware mặc định blink.hex (PC13)"
              className="p-0.5 rounded text-text-muted hover:text-accent hover:bg-bg-panel transition-colors cursor-pointer ml-0.5"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Khối bên phải: Cụm điều khiển Play/Pause (Emerald Run) & Reset */}
        <div className="flex items-center gap-1.5 justify-end">
          {/* Nút Chạy (Run) / Tạm dừng */}
          <button
            onClick={handleToggleRun}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-98 ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs shadow-amber-500/20"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs shadow-emerald-600/25"
            }`}
          >
            {isRunning ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <Pause className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Chạy (Run)</span>
              </>
            )}
          </button>

          {/* Nút Reset */}
          <button
            onClick={handleReset}
            title="Khởi động lại vi điều khiển"
            className="px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-border text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-border shadow-xs active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Bố cục 2 Cột chiếm trọn chiều cao còn lại của màn hình */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch h-full">
        {/* CỘT TRÁI (5 Cột): Bộ chuyển đổi Tab giữa Trợ lý AI và Code diagram.json */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-[480px] lg:min-h-0 gap-1.5">
          {/* Thanh chuyển đổi Tab trên đầu cột trái */}
          <div className="flex items-center p-0.5 bg-bg-panel border border-border rounded-xl shrink-0">
            <button
              onClick={() => setLeftTab("ai-chat")}
              className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                leftTab === "ai-chat"
                  ? "bg-accent text-white shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trợ Lý AI Tạo Mạch</span>
            </button>
            <button
              onClick={() => setLeftTab("code")}
              className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                leftTab === "code"
                  ? "bg-accent text-white shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code diagram.json</span>
            </button>
          </div>

          {/* Nội dung Tab: Giữ nguyên DOM (hidden) để không bao giờ bị unmount làm mất tin nhắn chat */}
          <div className="flex-1 min-h-0 h-full overflow-hidden flex flex-col">
            <div className={`h-full flex-1 min-h-0 ${leftTab === "ai-chat" ? "flex flex-col" : "hidden"}`}>
              <AiCircuitChat
                currentDiagram={diagram}
                onApplyDiagram={(newDiagram) => {
                  setDiagram(newDiagram);
                }}
                onSwitchToCodeTab={() => setLeftTab("code")}
              />
            </div>
            <div className={`h-full flex-1 min-h-0 ${leftTab === "code" ? "flex flex-col" : "hidden"}`}>
              <DiagramEditor
                initialDiagram={diagram}
                onDiagramChange={(newDiagram) => setDiagram(newDiagram)}
              />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (7 Cột): Canvas Mạch điện Wokwi Live Engine duy nhất chiếm trọn chiều cao */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[480px] lg:min-h-0 gap-1">
          <div className="flex items-center justify-between px-1 text-xs font-semibold text-text-secondary shrink-0">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-accent" />
              <span>Mạch mô phỏng trực tiếp</span>
            </div>
          </div>

          {/* Canvas tự động co giãn vừa vặn 100% không tràn trang */}
          <div className="flex-1 min-h-0 h-full w-full">
            <WokwiEmbedCanvas
              diagram={diagram}
              onClientReady={handleWokwiReady}
            />
          </div>
        </div>
      </div>

      {/* Modal Quản trị Mạch mẫu dành cho Admin */}
      <AdminPresetModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        user={user}
        currentDiagram={diagram}
        currentFirmware={rawFirmware}
        onPresetSaved={() => setPresetReloadTrigger((prev) => prev + 1)}
      />
    </div>
  );
}
