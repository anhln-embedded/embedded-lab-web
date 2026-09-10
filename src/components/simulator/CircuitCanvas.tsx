"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DiagramSchema } from "@/lib/emulator/diagram-parser";
import { Stm32BluePill, BLUEPILL_PIN_MAP } from "./Stm32BluePill";

let elementsLoaded = false;

interface CircuitCanvasProps {
  diagram: DiagramSchema;
  pinStates: Record<string, boolean>;
  onButtonPress?: (pin: number, pressed: boolean) => void;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  diagram,
  pinStates,
  onButtonPress,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!elementsLoaded && typeof window !== "undefined") {
      import("@wokwi/elements")
        .then(() => {
          elementsLoaded = true;
        })
        .catch((err) => console.warn("Lỗi tải @wokwi/elements:", err));
    }
  }, []);

  // Trạng thái chân PC13 (Active-Low trên Bluepill: mức 0 là LED SÁNG)
  const isPc13Low = pinStates["C:13"] === false;

  // Căn giữa sơ đồ mạch trong Canvas thông minh theo Bounding Box
  const { offsetX, offsetY } = useMemo(() => {
    if (!diagram.parts || diagram.parts.length === 0) {
      return { offsetX: 200, offsetY: 80 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const part of diagram.parts) {
      const pWidth =
        part.type === "board-ssd1306" || part.type === "wokwi-ssd1306"
          ? 150
          : part.type.includes("bluepill")
          ? 100
          : 40;
      const pHeight =
        part.type === "board-ssd1306" || part.type === "wokwi-ssd1306"
          ? 116
          : part.type.includes("bluepill")
          ? 245
          : 40;

      if (part.left < minX) minX = part.left;
      if (part.left + pWidth > maxX) maxX = part.left + pWidth;
      if (part.top < minY) minY = part.top;
      if (part.top + pHeight > maxY) maxY = part.top + pHeight;
    }

    const totalW = maxX - minX;
    const totalH = maxY - minY;
    // Tự động căn giữa với không gian canvas ~680px rộng, 500px cao
    const startX = Math.max(30, (680 - totalW) / 2);
    const startY = Math.max(25, (480 - totalH) / 2);

    return {
      offsetX: startX - minX,
      offsetY: startY - minY,
    };
  }, [diagram]);

  // Lấy tọa độ chân Pin tuyệt đối trên Canvas (khớp chính xác 100% Wokwi specs)
  const getPinPos = (pinRef: string): { x: number; y: number } | null => {
    if (!pinRef || pinRef.startsWith("$")) return null; // Bỏ qua chân ảo như $serialMonitor

    const parts = pinRef.split(":");
    const partId = parts[0];
    const pinName = parts[1] || "";

    const part = diagram.parts.find((p) => p.id === partId);
    if (!part) return null;

    const baseLeft = part.left + offsetX;
    const baseTop = part.top + offsetY;

    // 1. Bo mạch STM32 Blue Pill (Width: 100px, Height: 245px)
    if (part.type === "board-stm32-bluepill" || part.type === "board-stm32-f103c8") {
      const pinOffset = BLUEPILL_PIN_MAP[pinName] || { x: 50, y: 120 };
      return {
        x: baseLeft + pinOffset.x,
        y: baseTop + pinOffset.y,
      };
    }

    // 2. LED (wokwi-led) theo chuẩn mã nguồn Wokwi: y = 42; flip ? A:15, C:25 : A:25, C:15
    if (part.type === "wokwi-led") {
      const isFlipped = part.attrs?.flip === "1" || part.attrs?.flip === true;
      if (pinName === "A") {
        return {
          x: baseLeft + (isFlipped ? 15 : 25),
          y: baseTop + 42,
        };
      }
      if (pinName === "C") {
        return {
          x: baseLeft + (isFlipped ? 25 : 15),
          y: baseTop + 42,
        };
      }
      return { x: baseLeft + 20, y: baseTop + 42 };
    }

    // 3. Nút nhấn (wokwi-pushbutton)
    if (part.type === "wokwi-pushbutton") {
      if (pinName?.startsWith("1")) return { x: baseLeft + 8, y: baseTop + 24 };
      if (pinName?.startsWith("2")) return { x: baseLeft + 32, y: baseTop + 24 };
      return { x: baseLeft + 20, y: baseTop + 20 };
    }

    // 4. Điện trở (wokwi-resistor)
    if (part.type === "wokwi-resistor") {
      if (pinName === "1") return { x: baseLeft + 6, y: baseTop + 14 };
      if (pinName === "2") return { x: baseLeft + 54, y: baseTop + 14 };
      return { x: baseLeft + 30, y: baseTop + 14 };
    }

    // 5. Màn hình OLED SSD1306 (board-ssd1306, wokwi-ssd1306)
    if (part.type === "board-ssd1306" || part.type === "wokwi-ssd1306") {
      const p = pinName.toUpperCase();
      if (p === "SDA" || p === "DATA") return { x: baseLeft + 36.5, y: baseTop + 12.5 };
      if (p === "SCL" || p === "CLK") return { x: baseLeft + 45.5, y: baseTop + 12.5 };
      if (p === "DC") return { x: baseLeft + 54.5, y: baseTop + 12.5 };
      if (p === "RST") return { x: baseLeft + 64.5, y: baseTop + 12.5 };
      if (p === "CS") return { x: baseLeft + 74.5, y: baseTop + 12.5 };
      if (p === "3V3" || p === "3.3V") return { x: baseLeft + 83.5, y: baseTop + 12.5 };
      if (p === "VCC" || p === "VIN") return { x: baseLeft + 93.5, y: baseTop + 12.5 };
      if (p.startsWith("GND")) return { x: baseLeft + 103.5, y: baseTop + 12 };
      return { x: baseLeft + 75, y: baseTop + 12.5 };
    }

    return { x: baseLeft + 20, y: baseTop + 20 };
  };

  // Thuật toán dựng đường dây nối góc vuông chuẩn xác của Wokwi (Orthogonal Manhattan Wire Routing)
  const renderedWires = useMemo(() => {
    if (!diagram.connections) return [];

    return diagram.connections.map((conn, idx) => {
      const fromPos = getPinPos(conn[0]);
      const toPos = getPinPos(conn[1]);
      if (!fromPos || !toPos) return null;

      const instructions = conn[3] || [];
      let curX = fromPos.x;
      let curY = fromPos.y;

      let d = `M ${curX} ${curY}`;

      // Xử lý lần lượt từng chỉ dẫn định tuyến (ví dụ: "v37.5", "h-139.07", "v-38.4")
      for (const inst of instructions) {
        if (typeof inst !== "string") continue;
        const type = inst[0];
        const val = parseFloat(inst.slice(1));
        if (isNaN(val)) continue;

        if (type === "v") {
          curY += val;
          d += ` L ${curX} ${curY}`;
        } else if (type === "h") {
          curX += val;
          d += ` L ${curX} ${curY}`;
        }
      }

      // Đoạn cuối cùng nối vào toPos
      if (Math.abs(curX - toPos.x) > 0.5 || Math.abs(curY - toPos.y) > 0.5) {
        if (Math.abs(curX - toPos.x) > 0.5 && Math.abs(curY - toPos.y) > 0.5) {
          d += ` L ${toPos.x} ${curY} L ${toPos.x} ${toPos.y}`;
        } else {
          d += ` L ${toPos.x} ${toPos.y}`;
        }
      }

      const colorMap: Record<string, { light: string; dark: string }> = {
        green: { light: "#15803d", dark: "#22c55e" },
        limegreen: { light: "#16a34a", dark: "#4ade80" },
        black: { light: "#09090b", dark: "#475569" },
        red: { light: "#dc2626", dark: "#ef4444" },
        blue: { light: "#2563eb", dark: "#38bdf8" },
        yellow: { light: "#ca8a04", dark: "#facc15" },
        gold: { light: "#d97706", dark: "#fbbf24" },
        orange: { light: "#ea580c", dark: "#fb923c" },
        purple: { light: "#9333ea", dark: "#c084fc" },
        white: { light: "#71717a", dark: "#f4f4f5" },
        cyan: { light: "#0891b2", dark: "#22d3ee" },
      };
      const colors = colorMap[conn[2]] || { light: conn[2] || "#09090b", dark: conn[2] || "#94a3b8" };

      return {
        key: `wire-${idx}`,
        d,
        lightColor: colors.light,
        darkColor: colors.dark,
      };
    });
  }, [diagram, offsetX, offsetY]);

  return (
    <div className="relative w-full h-[700px] bg-white dark:bg-[#0b1324] rounded-2xl border border-border overflow-hidden select-none shadow-sm transition-colors duration-200">
      {/* Lưới chấm Wokwi chuẩn (Tự động đổi màu theo Light/Dark) */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.2px, transparent 1.2px)",
          backgroundSize: "20px 20px",
          color: "var(--color-text-muted)",
        }}
      />

      {/* SVG Layer vẽ toàn bộ dây nối */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {renderedWires.map(
          (w) =>
            w && (
              <g key={w.key}>
                {/* Viền bóng mờ dây */}
                <path
                  d={w.d}
                  fill="none"
                  stroke="currentColor"
                  className="text-black/10 dark:text-black/40"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Đường dây chính (thích ứng theme) */}
                <path
                  d={w.d}
                  fill="none"
                  stroke={w.lightColor}
                  className="dark:hidden"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={w.d}
                  fill="none"
                  stroke={w.darkColor}
                  className="hidden dark:inline"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )
        )}
      </svg>

      {/* Render các linh kiện phần cứng từ diagram.parts */}
      {diagram.parts.map((part) => {
        const posX = part.left + offsetX;
        const posY = part.top + offsetY;

        // 1. Board STM32 Blue Pill
        if (part.type === "board-stm32-bluepill" || part.type === "board-stm32-f103c8") {
          return (
            <div
              key={part.id}
              style={{ position: "absolute", left: `${posX}px`, top: `${posY}px` }}
              className="z-20 cursor-move"
            >
              <Stm32BluePill id={part.id} isPc13Low={isPc13Low} />
            </div>
          );
        }

        // 2. Đèn LED chính thức (@wokwi/elements)
        if (part.type === "wokwi-led") {
          const color = part.attrs?.color || "limegreen";
          const flip = part.attrs?.flip === "1" || part.attrs?.flip === true;

          return (
            <div
              key={part.id}
              style={{ position: "absolute", left: `${posX}px`, top: `${posY}px` }}
              className="z-20 flex flex-col items-center"
            >
              {mounted ? (
                // @ts-ignore - Web Component từ @wokwi/elements
                <wokwi-led
                  color={color}
                  flip={flip ? "" : undefined}
                  value={isPc13Low ? "1" : ""}
                />
              ) : (
                <div className="w-6 h-8 bg-emerald-500/50 rounded-full" />
              )}
            </div>
          );
        }

        // 3. Nút nhấn (@wokwi/elements)
        if (part.type === "wokwi-pushbutton") {
          const color = part.attrs?.color || "blue";
          return (
            <div
              key={part.id}
              style={{ position: "absolute", left: `${posX}px`, top: `${posY}px` }}
              className="z-20"
            >
              {mounted ? (
                // @ts-ignore
                <wokwi-pushbutton
                  color={color}
                  onMouseDown={() => onButtonPress?.(0, true)}
                  onMouseUp={() => onButtonPress?.(0, false)}
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded" />
              )}
            </div>
          );
        }

        // 4. Điện trở (@wokwi/elements)
        if (part.type === "wokwi-resistor") {
          const val = part.attrs?.value || "220";
          return (
            <div
              key={part.id}
              style={{ position: "absolute", left: `${posX}px`, top: `${posY}px` }}
              className="z-20"
            >
              {mounted ? (
                // @ts-ignore
                <wokwi-resistor value={val} />
              ) : (
                <div className="w-12 h-4 bg-amber-200 rounded" />
              )}
            </div>
          );
        }

        // 5. Màn hình OLED SSD1306 I2C (@wokwi/elements)
        if (part.type === "board-ssd1306" || part.type === "wokwi-ssd1306") {
          return (
            <div
              key={part.id}
              style={{ position: "absolute", left: `${posX}px`, top: `${posY}px` }}
              className="z-20"
            >
              {mounted ? (
                // @ts-ignore
                <wokwi-ssd1306 />
              ) : (
                <div className="w-[150px] h-[116px] bg-[#025CAF] rounded-xl border border-sky-400/30 flex items-center justify-center text-xs text-white">
                  SSD1306 OLED (128x64)
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
