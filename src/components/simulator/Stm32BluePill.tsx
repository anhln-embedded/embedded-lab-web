"use client";

import React from "react";

interface Stm32BluePillProps {
  id: string;
  isPc13Low?: boolean;
}

// Bảng tọa độ chính xác tuyệt đối từng pixel của các chân pin trên bo mạch STM32 Blue Pill theo Wokwi
// Kích thước chuẩn: Rộng 100px, Cao 245px
// Hàng chân bên trái: x = 9px
// Hàng chân bên phải: x = 91px
// y bắt đầu từ y = 6px, bước nhảy giữa 2 chân là 12px (chuẩn Wokwi grid)
export const BLUEPILL_PIN_MAP: Record<string, { x: number; y: number }> = {
  // Hàng chân bên trái (20 chân, từ trên xuống)
  B12: { x: 9, y: 6 },
  B13: { x: 9, y: 18 },
  B14: { x: 9, y: 30 },
  B15: { x: 9, y: 42 },
  A8: { x: 9, y: 54 },
  A9: { x: 9, y: 66 },
  A10: { x: 9, y: 78 },
  A11: { x: 9, y: 90 },
  A12: { x: 9, y: 102 },
  A15: { x: 9, y: 114 },
  B3: { x: 9, y: 126 },
  B4: { x: 9, y: 138 },
  B5: { x: 9, y: 150 },
  B6: { x: 9, y: 162 },
  B7: { x: 9, y: 174 },
  B8: { x: 9, y: 186 },
  B9: { x: 9, y: 198 },
  "5V": { x: 9, y: 210 },
  "GND.1": { x: 9, y: 222 }, // Chân 19 hàng trái (GND.1)
  "3.3V.1": { x: 9, y: 234 },

  // Hàng chân bên phải (20 chân, từ trên xuống)
  "GND.2": { x: 91, y: 6 },
  "GND.3": { x: 91, y: 18 },
  "3.3V.2": { x: 91, y: 30 },
  RESET: { x: 91, y: 42 },
  B11: { x: 91, y: 54 },
  B10: { x: 91, y: 66 },
  B1: { x: 91, y: 78 },
  B0: { x: 91, y: 90 },
  A7: { x: 91, y: 102 },
  A6: { x: 91, y: 114 },
  A5: { x: 91, y: 126 },
  A4: { x: 91, y: 138 },
  A3: { x: 91, y: 150 },
  A2: { x: 91, y: 162 },
  A1: { x: 91, y: 174 },
  A0: { x: 91, y: 186 },
  C15: { x: 91, y: 198 },
  C14: { x: 91, y: 210 },
  C13: { x: 91, y: 222 }, // Chân 19 hàng phải (C13)
  VBAT: { x: 91, y: 234 },
};

// Aliases tương thích các cách viết trong diagram.json
BLUEPILL_PIN_MAP["GND"] = BLUEPILL_PIN_MAP["GND.1"];
BLUEPILL_PIN_MAP["G"] = BLUEPILL_PIN_MAP["GND.1"];
BLUEPILL_PIN_MAP["3.3V"] = BLUEPILL_PIN_MAP["3.3V.2"];
BLUEPILL_PIN_MAP["3.3"] = BLUEPILL_PIN_MAP["3.3V.2"];
BLUEPILL_PIN_MAP["3V3"] = BLUEPILL_PIN_MAP["3.3V.2"];
BLUEPILL_PIN_MAP["3V3.1"] = BLUEPILL_PIN_MAP["3.3V.1"];
BLUEPILL_PIN_MAP["3V3.2"] = BLUEPILL_PIN_MAP["3.3V.2"];
BLUEPILL_PIN_MAP["5V.1"] = BLUEPILL_PIN_MAP["5V"];
BLUEPILL_PIN_MAP["RST"] = BLUEPILL_PIN_MAP["RESET"];
BLUEPILL_PIN_MAP["R"] = BLUEPILL_PIN_MAP["RESET"];
BLUEPILL_PIN_MAP["VB"] = BLUEPILL_PIN_MAP["VBAT"];

export const Stm32BluePill: React.FC<Stm32BluePillProps> = ({ isPc13Low = false }) => {
  return (
    <div className="relative w-[100px] h-[245px] select-none filter drop-shadow-md">
      <svg
        viewBox="0 0 100 245"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* PCB Bo mạch màu xanh dương chuẩn Wokwi Blue Pill */}
        <rect
          x="1"
          y="1"
          width="98"
          height="243"
          rx="4"
          fill="#005288"
          stroke="#00355a"
          strokeWidth="1.2"
        />

        {/* Cổng Micro USB màu xám kim loại ở trên cùng */}
        <rect x="36" y="0" width="28" height="12" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.8" />
        <rect x="42" y="1" width="16" height="4" rx="1" fill="#4b5563" />

        {/* Dòng chữ in lụa BLUE PILL */}
        <text
          x="50"
          y="35"
          fill="#ffffff"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          textAnchor="middle"
          letterSpacing="1"
        >
          BLUE
        </text>
        <text
          x="50"
          y="47"
          fill="#ffffff"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          textAnchor="middle"
          letterSpacing="1"
        >
          PILL
        </text>

        {/* Chip STM32F103 xoay 45 độ hình quả trám (Diamond) */}
        <g transform="translate(50, 85) rotate(45)">
          <rect
            x="-16"
            y="-16"
            width="32"
            height="32"
            rx="1.5"
            fill="#18181b"
            stroke="#27272a"
            strokeWidth="0.8"
          />
          <circle cx="-11" cy="-11" r="1.5" fill="#52525b" />
        </g>

        {/* Thạch anh kim loại hình bầu dục (Oval Crystal 8MHz) */}
        <rect
          x="35"
          y="120"
          width="30"
          height="11"
          rx="5.5"
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth="0.8"
        />
        <circle cx="40" cy="125.5" r="1.5" fill="#6b7280" />
        <circle cx="60" cy="125.5" r="1.5" fill="#6b7280" />

        {/* Đèn LED PWR (đỏ) & LED PC13 (xanh) trên bo mạch */}
        <g transform="translate(38, 145)">
          <rect x="0" y="0" width="8" height="5" rx="0.8" fill="#ef4444" opacity="0.9" />
          <text x="4" y="-2" fill="#93c5fd" fontSize="4" textAnchor="middle">PWR</text>
        </g>
        <g transform="translate(54, 145)">
          <rect
            x="0"
            y="0"
            width="8"
            height="5"
            rx="0.8"
            fill={isPc13Low ? "#22c55e" : "#14532d"}
            filter={isPc13Low ? "drop-shadow(0 0 3px #22c55e)" : "none"}
          />
          <text x="4" y="-2" fill="#93c5fd" fontSize="4" textAnchor="middle">PC13</text>
        </g>

        {/* 20 chân bên trái */}
        {[
          "D12", "D13", "D14", "D15", "5V", "3.3", "A0", "A1", "A2", "A3",
          "A4", "A5", "A6", "A7", "B0", "B1", "B10", "B11", "RST", "3.3"
        ].map((label, idx) => {
          const cy = 6 + idx * 12;
          return (
            <g key={`left-pin-${idx}`}>
              <circle cx="9" cy={cy} r="2.5" fill="#ffffff" stroke="#ca8a04" strokeWidth="0.8" />
              <text
                x="15"
                y={cy + 2}
                fill="#ffffff"
                fontSize="4.5"
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* 20 chân bên phải */}
        {[
          "G", "G", "3.3", "R", "B11", "B10", "B1", "B0", "A7", "A6",
          "A5", "A4", "A3", "A2", "A1", "A0", "C15", "C14", "C13", "VB"
        ].map((label, idx) => {
          const cy = 6 + idx * 12;
          return (
            <g key={`right-pin-${idx}`}>
              <circle cx="91" cy={cy} r="2.5" fill="#ffffff" stroke="#ca8a04" strokeWidth="0.8" />
              <text
                x="85"
                y={cy + 2}
                fill="#ffffff"
                fontSize="4.5"
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
                textAnchor="end"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
