"use client";

import React, { useState } from "react";
import {
  X,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  Flame,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// Preset images from lab
export const LAB_PRESET_IMAGES = [
  { label: "Logo Lab PTIT", url: "/images/logo.png" },
  { label: "Bo Mạch STM32 & Đo Kiểm", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80" },
  { label: "Máy Hiện Sóng & Bàn Đo RF", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80" },
  { label: "Thiết Kế Mạch In PCB Cao Tốc", url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80" },
  { label: "Chip Vi Xử Lý & Edge AI", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80" },
  { label: "Hàn & Lắp Ráp Linh Kiện Lab", url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80" },
];

// --- 1. CODE BLOCK MODAL ---
interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (codeHtml: string) => void;
}

export function CodeBlockModal({ isOpen, onClose, onInsert }: CodeModalProps) {
  const [lang, setLang] = useState("c");
  const [filename, setFilename] = useState("main.c");
  const [code, setCode] = useState(`// Embedded-AIoT Lab - Source Code
#include <stdio.h>
#include <stdint.h>

void app_main(void) {
    printf("Embedded-AIoT Lab - Initialized Successfully!\\n");
}`);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (!code.trim()) return;
    const escapedCode = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const html = `
<div class="code-block-container" style="background: #0d0e10; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; margin: 20px 0; overflow: hidden; font-family: 'JetBrains Mono', monospace;">
  <div style="background: #15171a; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
    <span style="color: #5e6ad2; font-size: 12px; font-weight: 600; text-transform: uppercase;">${lang.toUpperCase()} • ${filename || "Code"}</span>
    <span style="color: #8a8f98; font-size: 11px;">Embedded Lab</span>
  </div>
  <pre style="margin: 0; padding: 16px; overflow-x: auto; font-size: 13.5px; line-height: 1.6; color: #e2e8f0;"><code>${escapedCode}</code></pre>
</div>
<p><br/></p>
`;
    onInsert(html);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-bg-panel border border-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-bold text-text-primary text-base">
            <Code className="w-5 h-5 text-accent" />
            Chèn Khối Code Kỹ Thuật (Code Block)
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Ngôn ngữ lập trình</label>
            <select
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                if (e.target.value === "c") setFilename("main.c");
                else if (e.target.value === "cpp") setFilename("main.cpp");
                else if (e.target.value === "python") setFilename("model_infer.py");
                else if (e.target.value === "verilog") setFilename("alu_core.v");
                else if (e.target.value === "rust") setFilename("main.rs");
                else if (e.target.value === "bash") setFilename("build.sh");
              }}
              className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="c">C (Firmware / RTOS / STM32)</option>
              <option value="cpp">C++ (Embedded OOP / ESP32)</option>
              <option value="python">Python (TinyML / AIoT / Data)</option>
              <option value="verilog">Verilog HDL (FPGA / RTL)</option>
              <option value="rust">Rust (Embedded Rust / no_std)</option>
              <option value="bash">Bash / Shell (Linux Command)</option>
              <option value="json">JSON / Cấu hình</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Tên file (Không bắt buộc)</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="VD: driver_uart.c"
              className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Mã nguồn (Code)</label>
          <textarea
            rows={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Nhập hoặc dán mã nguồn vào đây..."
            className="w-full px-3.5 py-2.5 bg-[#0d0e10] border border-border rounded-xl font-mono text-xs text-emerald-400 focus:outline-none focus:border-accent leading-relaxed"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
          <Button variant="primary" size="sm" onClick={handleInsert} className="bg-accent text-white">
            Chèn Khối Code
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- 2. IMAGE MODAL ---
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (imgHtml: string) => void;
}

export function ImageModal({ isOpen, onClose, onInsert }: ImageModalProps) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");

  if (!isOpen) return null;

  const handleInsert = (selectedUrl?: string) => {
    const finalUrl = selectedUrl || url;
    if (!finalUrl.trim()) return;

    const html = `
<figure style="text-align: center; margin: 24px 0;">
  <img src="${finalUrl.trim()}" alt="${caption || "Lab Image"}" style="max-width: 100%; height: auto; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); display: inline-block; box-shadow: 0 4px 20px rgba(0,0,0,0.4);" />
  ${caption.trim() ? `<figcaption style="font-size: 13px; color: #8a8f98; margin-top: 8px; font-style: italic;">📷 ${caption.trim()}</figcaption>` : ""}
</figure>
<p><br/></p>
`;
    onInsert(html);
    setUrl("");
    setCaption("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-bg-panel border border-border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-bold text-text-primary text-base">
            <ImageIcon className="w-5 h-5 text-accent" />
            Chèn Hình Ảnh Vào Bài Viết
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Đường dẫn URL ảnh (Hoặc link trực tiếp)</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://... hoặc /images/..."
            className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Chú thích ảnh (Caption)</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="VD: Sơ đồ đo kiểm công suất phát RF trên máy phân tích phổ..."
            className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2">Hoặc chọn nhanh ảnh mẫu có sẵn của Lab:</label>
          <div className="grid grid-cols-3 gap-2">
            {LAB_PRESET_IMAGES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(preset.url);
                  setCaption(preset.label);
                }}
                className={`p-1.5 rounded-xl border text-left transition-all ${
                  url === preset.url ? "border-accent bg-accent/15" : "border-border bg-bg-elevated hover:border-border-strong"
                }`}
              >
                <div className="h-16 w-full rounded-lg overflow-hidden bg-bg-primary mb-1 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-text-secondary truncate font-medium">{preset.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
          <Button variant="primary" size="sm" onClick={() => handleInsert()} disabled={!url.trim()} className="bg-accent text-white">
            Chèn Ảnh
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- 3. CALLOUT BOX MODAL ---
interface CalloutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (calloutHtml: string) => void;
}

export function CalloutModal({ isOpen, onClose, onInsert }: CalloutModalProps) {
  const [type, setType] = useState<"note" | "tip" | "warning" | "danger">("note");
  const [title, setTitle] = useState("Lưu ý Kỹ Thuật Quan Trọng");
  const [content, setContent] = useState("Hãy kiểm tra kỹ điện áp cấp và chiều gắn chân IC trước khi cấp nguồn cho mạch thử nghiệm.");

  if (!isOpen) return null;

  const handleInsert = () => {
    let borderColor = "#5e6ad2";
    let bg = "rgba(94, 106, 210, 0.1)";
    let icon = "📌";

    if (type === "tip") {
      borderColor = "#10b981";
      bg = "rgba(16, 185, 129, 0.1)";
      icon = "💡";
    } else if (type === "warning") {
      borderColor = "#f59e0b";
      bg = "rgba(245, 158, 11, 0.1)";
      icon = "⚠️";
    } else if (type === "danger") {
      borderColor = "#ef4444";
      bg = "rgba(239, 68, 68, 0.1)";
      icon = "🔥";
    }

    const html = `
<div class="callout callout-${type}" style="background: ${bg}; border-left: 4px solid ${borderColor}; padding: 16px 20px; border-radius: 10px; margin: 20px 0;">
  <div style="font-weight: 700; color: ${borderColor}; font-size: 14px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
    <span>${icon}</span> <span>${title.trim() || "Ghi chú"}</span>
  </div>
  <div style="font-size: 13.5px; color: #d0d6e0; line-height: 1.6;">
    ${content.trim()}
  </div>
</div>
<p><br/></p>
`;
    onInsert(html);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-bg-panel border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-bold text-text-primary text-base">
            <Sparkles className="w-5 h-5 text-accent" />
            Chèn Hộp Ghi Chú & Cảnh Báo (Callout)
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-2">Loại ghi chú</label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setType("note");
                setTitle("Lưu ý Kỹ Thuật");
              }}
              className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                type === "note" ? "border-accent bg-accent/20 text-accent font-bold" : "border-border bg-bg-elevated text-text-muted"
              }`}
            >
              <Info className="w-4 h-4 text-accent" />
              Note (Lam)
            </button>
            <button
              type="button"
              onClick={() => {
                setType("tip");
                setTitle("Mẹo Tối Ưu");
              }}
              className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                type === "tip" ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold" : "border-border bg-bg-elevated text-text-muted"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Tip (Xanh lá)
            </button>
            <button
              type="button"
              onClick={() => {
                setType("warning");
                setTitle("Cảnh Báo Quan Trọng");
              }}
              className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                type === "warning" ? "border-amber-500 bg-amber-500/20 text-amber-400 font-bold" : "border-border bg-bg-elevated text-text-muted"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Warning (Vàng)
            </button>
            <button
              type="button"
              onClick={() => {
                setType("danger");
                setTitle("Nguy Hiểm Phần Cứng");
              }}
              className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                type === "danger" ? "border-rose-500 bg-rose-500/20 text-rose-400 font-bold" : "border-border bg-bg-elevated text-text-muted"
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400" />
              Danger (Đỏ)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề hộp</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Nội dung ghi chú</label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
          <Button variant="primary" size="sm" onClick={handleInsert} className="bg-accent text-white">
            Chèn Callout
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- 4. TEMPLATE MODAL ---
interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateHtml: string, title?: string, excerpt?: string) => void;
}

export function TemplateModal({ isOpen, onClose, onSelect }: TemplateModalProps) {
  if (!isOpen) return null;

  const TEMPLATES = [
    {
      name: "⚡ Hướng Dẫn Firmware STM32 / ESP32",
      desc: "Cấu trúc bài viết chuẩn: Đặt vấn đề, Sơ đồ khối chân GPIO/SPI/I2C, Mã nguồn C/C++, Kết quả chạy thử.",
      title: "Hướng Dẫn Lập Trình Giao Tiếp STM32 với DMA & RingBuffer Tốc Độ Cao",
      excerpt: "Phân tích kiến trúc Direct Memory Access (DMA) kết hợp Idle Line Interrupt trên vi điều khiển STM32 giúp giảm tải CPU xuống dưới 5%.",
      html: `
<h2>1. Giới Thiệu & Đặt Vấn Đề</h2>
<p>Trong các ứng dụng nhúng công nghiệp và IoT, việc truyền nhận lượng lớn dữ liệu qua UART/SPI với tốc độ cao thường khiến CPU bị nghẽn ngắt (Interrupt Storm). Giải pháp tối ưu là sử dụng kiến trúc <strong>DMA Circular Buffer</strong>.</p>

<h2>2. Sơ Đồ Khối & Kết Nối Phần Cứng</h2>
<p>Hệ thống sử dụng vi điều khiển STM32 kết hợp bộ giải mã UART USB sang máy tính:</p>
<ul>
  <li><strong>MCU:</strong> STM32G474 / STM32H743</li>
  <li><strong>Baudrate:</strong> 921600 bps</li>
  <li><strong>Kênh DMA:</strong> DMA1 Channel 1 (Circular Mode)</li>
</ul>

<div class="callout callout-tip" style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0; font-weight: 700; color: #10b981;">💡 Mẹo Lập Trình An Toàn:</p>
  <p style="margin: 6px 0 0 0; font-size: 13.5px;">Luôn khai báo con trỏ bộ đệm là <code>volatile</code> và thực hiện dọn Cache (SCB_CleanDCache) khi làm việc với Cortex-M7.</p>
</div>

<h2>3. Mã Nguồn Firmware Mẫu</h2>
<div class="code-block-container" style="background: #0d0e10; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; margin: 20px 0; overflow: hidden; font-family: monospace;">
  <div style="background: #15171a; padding: 8px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); color: #5e6ad2; font-size: 12px; font-weight: bold;">C • main.c</div>
  <pre style="margin: 0; padding: 16px; color: #e2e8f0; font-size: 13px;"><code>#include "stm32g4xx_hal.h"

#define RX_BUFFER_SIZE 512
uint8_t rx_buffer[RX_BUFFER_SIZE];

void Start_UART_DMA(UART_HandleTypeDef *huart) {
    HAL_UARTEx_ReceiveToIdle_DMA(huart, rx_buffer, RX_BUFFER_SIZE);
    __HAL_DMA_DISABLE_IT(huart->hdmarx, DMA_IT_HT);
}</code></pre>
</div>

<h2>4. Đánh Giá Hiệu Năng & Kết Luận</h2>
<p>Qua đo kiểm thực tế trên máy hiện sóng và phân tích tải CPU, giải pháp DMA giúp hệ thống duy trì hoạt động ổn định 24/7 mà không bị rớt gói tin.</p>
`,
    },
    {
      name: "🔬 Báo Cáo Đo Kiểm RF / EMC & Thiết Kế Mạch In",
      desc: "Cấu trúc bài viết: Thông số kỹ thuật PCB, Sơ đồ VNA Smith Chart, Đo kiểm phát xạ EMC.",
      title: "Báo Cáo Đo Kiểm Trở Kháng 50Ω & Phát Xạ Điện Từ (EMC) Mạch Cao Tốc",
      excerpt: "Tổng hợp quy trình đo kiểm Pre-compliance EMC và phối hợp trở kháng anten 2.4GHz tại phòng lab Embedded-AIoT.",
      html: `
<h2>1. Mục Tiêu & Thiết Bị Đo Kiểm</h2>
<p>Báo cáo thực nghiệm kiểm tra độ suy hao phản xạ (Return Loss S11) và tương thích điện từ của bo mạch mẫu:</p>
<ul>
  <li><strong>Thiết bị:</strong> Máy phân tích mạng Vector VNA (100kHz - 6GHz), Máy phân tích phổ Rigol RSA5000.</li>
  <li><strong>Đối tượng:</strong> Mạch phát Wi-Fi/BLE 2.4GHz chuẩn RF 50Ω.</li>
</ul>

<h2>2. Bảng Thông Số Đo Kiểm Thực Tế</h2>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13.5px; border: 1px solid rgba(255,255,255,0.12);">
  <thead>
    <tr style="background: rgba(255,255,255,0.05); text-align: left;">
      <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Tần số (GHz)</th>
      <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Hệ số phản xạ S11 (dB)</th>
      <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">VSWR</th>
      <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Đánh giá</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">2.40 GHz</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1); color: #10b981;">-22.4 dB</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">1.16</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Đạt chuẩn</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">2.45 GHz</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1); color: #10b981;">-26.8 dB</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">1.09</td>
      <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Tối ưu</td>
    </tr>
  </tbody>
</table>

<h2>3. Kết Luận Bàn Đo</h2>
<p>Mạch in đạt yêu cầu phối hợp trở kháng và sẵn sàng chuyển giao sản xuất hàng loạt.</p>
`,
    },
    {
      name: "📢 Thông Báo Tuyển Thành Viên / Sự Kiện Lab",
      desc: "Mẫu thông báo tuyển thành viên, hội thảo NCKH sinh viên Khoa Điện Tử 1.",
      title: "Thông Báo Kế Hoạch Tổ Chức Workshop Kỹ Thuật & Tuyển Thành Viên Lab Mới",
      excerpt: "Phòng Lab tổ chức chuỗi seminar kỹ thuật chuyên sâu và mở đơn tiếp nhận thành viên tham gia các đề tài nghiên cứu.",
      html: `
<h2>📢 Thông Báo Chính Thức Từ Ban Chủ Nhiệm Lab</h2>
<p>Embedded-AIoT Lab - Khoa Điện Tử 1 trân trọng thông báo tới toàn thể sinh viên Học viện chương trình sinh hoạt và định hướng nghiên cứu mới.</p>

<div class="callout callout-note" style="background: rgba(94, 106, 210, 0.1); border-left: 4px solid #5e6ad2; padding: 16px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0; font-weight: 700; color: #5e6ad2;">📌 Lịch Trình Chi Tiết:</p>
  <ul style="margin: 8px 0 0 0; font-size: 13.5px;">
    <li><strong>Thời gian:</strong> 09h00 sáng Thứ Bảy hàng tuần.</li>
    <li><strong>Địa điểm:</strong> Sân B9 - Khoa Điện Tử 1 PTIT.</li>
    <li><strong>Chủ đề:</strong> Trao đổi tiến độ phần cứng & hướng dẫn thực hành vi điều khiển.</li>
  </ul>
</div>

<p>Thành viên quan tâm vui lòng liên hệ trực tiếp tại bàn thực nghiệm hoặc đăng ký qua Fanpage Lab.</p>
`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-bg-panel border border-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-bold text-text-primary text-base">
            <FileText className="w-5 h-5 text-accent" />
            Chọn Mẫu Bài Viết Kỹ Thuật (Templates)
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-text-muted">Chọn một bài viết mẫu để tự động điền sẵn dàn ý và các khối định dạng chuẩn:</p>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {TEMPLATES.map((tmpl, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-border bg-bg-elevated hover:border-accent transition-all group flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-text-primary group-hover:text-accent mb-1">{tmpl.name}</h4>
                <p className="text-xs text-text-muted mb-3">{tmpl.desc}</p>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    onSelect(tmpl.html, tmpl.title, tmpl.excerpt);
                    onClose();
                  }}
                  className="text-xs bg-accent text-white"
                >
                  Sử dụng mẫu này
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}
