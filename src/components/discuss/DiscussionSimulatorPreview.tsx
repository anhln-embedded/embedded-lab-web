"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Cpu,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Code2,
  Terminal,
  Zap,
  Activity,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulatorPreset {
  id: string;
  name: string;
  desc: string;
  pin: string;
  code: string;
  consoleOutput: string[];
}

const PRESETS: SimulatorPreset[] = [
  {
    id: "blink",
    name: "Nhấp nháy LED PC13",
    desc: "Cấu hình GPIO Output và toggle LED chu kỳ 500ms",
    pin: "PC13 (Blue LED)",
    code: `// Chớp tắt LED PC13 trên STM32F401 BlackPill
#include "stm32f4xx_hal.h"

int main(void) {
  HAL_Init();
  __HAL_RCC_GPIOC_CLK_ENABLE();

  GPIO_InitTypeDef GPIO_InitStruct = {0};
  GPIO_InitStruct.Pin = GPIO_PIN_13;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(GPIOC, &GPIO_InitStruct);

  while (1) {
    HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
    HAL_Delay(500);
  }
}`,
    consoleOutput: [
      "[SYSTEM] System Clock configured to 84MHz (HSE 25MHz bypass)",
      "[GPIO] Port C Clock enabled. Pin PC13 configured as Push-Pull Output",
      "[LOOP] LED PC13 -> HIGH (LED ON)",
      "[LOOP] Delay 500ms...",
      "[LOOP] LED PC13 -> LOW (LED OFF)",
      "[LOOP] Delay 500ms...",
      "[LOOP] Running stably at 3.3V DC...",
    ],
  },
  {
    id: "uart",
    name: "UART1 Serial Print",
    desc: "Khởi tạo USART1 115200 baud và xuất log ra màn hình debug",
    pin: "PA9 (TX) / PA10 (RX)",
    code: `// Gửi log UART1 lên máy tính qua cổng ST-Link VCP
#include <string.h>
UART_HandleTypeDef huart1;

void send_log(char *msg) {
  HAL_UART_Transmit(&huart1, (uint8_t*)msg, strlen(msg), 100);
}

int main(void) {
  HAL_Init();
  MX_USART1_UART_Init();
  send_log("\\r\\n=== EMBEDDED-AIOT OPEN COMMUNITY ===\\r\\n");
  send_log("Online Simulator & Firmware Sandbox\\r\\n");

  uint32_t count = 0;
  while (1) {
    char buf[64];
    sprintf(buf, "[TELEMETRY] Sensor packet #%lu ready\\r\\n", count++);
    send_log(buf);
    HAL_Delay(1000);
  }
}`,
    consoleOutput: [
      "[USART1] Initialized: 115200 baud, 8-N-1, DMA TX Enabled",
      "=== EMBEDDED-AIOT OPEN COMMUNITY ===",
      "Online Simulator & Firmware Sandbox",
      "[TELEMETRY] Sensor packet #0 ready",
      "[TELEMETRY] Sensor packet #1 ready",
      "[TELEMETRY] Sensor packet #2 ready",
      "[USART1] Buffer flushed successfully.",
    ],
  },
  {
    id: "exti",
    name: "Ngắt Ngoài EXTI0",
    desc: "Bắt sự kiện xung rơi Falling Edge từ nút bấm chân PB0",
    pin: "PB0 (Push Button Interrupt)",
    code: `// Cấu hình ngắt sườn xuống EXTI Line 0
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
  if (GPIO_Pin == GPIO_PIN_0) {
    // Đảo trạng thái LED ngay lập tức
    HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
    printf("[EXTI] Falling edge detected on PB0!\\r\\n");
  }
}`,
    consoleOutput: [
      "[SYSCFG] SYSCFG Clock enabled.",
      "[EXTI] Line 0 mapped to GPIOB Pin 0.",
      "[NVIC] EXTI0_IRQn enabled with Priority 2.",
      "[INTERRUPT] Button pressed! Pin PB0 logic 0V -> Falling Edge!",
      "[EXTI] Falling edge detected on PB0!",
      "[GPIO] Toggled PC13 LED in response to IRQ event.",
    ],
  },
];

export function DiscussionSimulatorPreview() {
  const [selectedPreset, setSelectedPreset] = useState<SimulatorPreset>(PRESETS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  // Hiệu ứng chạy log và nhấp nháy LED mô phỏng
  useEffect(() => {
    let timer: any = null;
    if (isRunning) {
      timer = setInterval(() => {
        setLedState((prev) => !prev);
        setLogIndex((prev) => {
          const next = prev + 1;
          const currentLogs = selectedPreset.consoleOutput;
          if (next < currentLogs.length) {
            setLogs((l) => [...l, currentLogs[next]]);
            return next;
          } else {
            setLogs((l) => [
              ...l,
              `[TICK] Heartbeat active... ${(Date.now() / 1000).toFixed(1)}s`,
            ]);
            return next;
          }
        });
      }, 700);
    } else {
      setLedState(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, selectedPreset]);

  const handleStart = () => {
    setIsRunning(true);
    setLogs([
      `[SIMULATOR] Loading firmware image for ${selectedPreset.name}...`,
      ...selectedPreset.consoleOutput.slice(0, 2),
    ]);
    setLogIndex(1);
  };

  const handleStop = () => {
    setIsRunning(false);
    setLogs((l) => [...l, "[SIMULATOR] Execution halted by user."]);
  };

  const handleSelectPreset = (p: SimulatorPreset) => {
    setSelectedPreset(p);
    setIsRunning(false);
    setLogs([`[INFO] Đã nạp kịch bản mẫu: ${p.name}`]);
  };

  return (
    <section className="bg-gradient-to-br from-bg-panel via-bg-panel to-cyan-500/5 border border-cyan-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background glowing sphere */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-extrabold text-text-primary">
              Mô Phỏng Trực Tuyến & Thử Nghiệm Code Nhanh
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-bold border border-cyan-500/30 uppercase tracking-wider">
              Bên Dưới Thảo Luận
            </span>
          </div>
          <p className="text-xs text-text-muted max-w-2xl">
            Vừa thảo luận kỹ thuật, vừa có thể nạp chạy thử nghiệm ngay đoạn mã vi điều khiển STM32F4/Cortex-M
            để quan sát trạng thái logic và luồng log UART trực quan ngay trên trình duyệt.
          </p>
        </div>

        {/* Nút Mở Full Simulator */}
        <Button asChild variant="primary" className="flex-shrink-0 shadow-lg shadow-cyan-500/20">
          <Link href="/tools/stm32-simulator">
            <ExternalLink className="w-4 h-4 mr-2" />
            Mở Trình Mô Phỏng Toàn Phần
          </Link>
        </Button>
      </div>

      {/* Preset Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-text-secondary mr-2 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-accent" /> Kịch bản mẫu:
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPreset(p)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
              selectedPreset.id === p.id
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-sm"
                : "bg-bg-elevated/60 border-border/80 text-text-muted hover:text-text-primary hover:border-border"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Preview & Control (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-mono text-cyan-400 font-bold flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>firmware_main.c</span>
            </span>
            <span className="text-[11px] bg-bg-elevated px-2 py-0.5 rounded border border-border">
              Chân điều khiển: <strong>{selectedPreset.pin}</strong>
            </span>
          </div>

          <div className="rounded-2xl bg-black/80 border border-border/80 p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-64 leading-relaxed shadow-inner">
            <pre>
              <code>{selectedPreset.code}</code>
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            {!isRunning ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStart}
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white font-bold"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Chạy Thử Nghiệm Mô Phỏng
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleStop} className="text-rose-400 border-rose-500/40">
                <Square className="w-3.5 h-3.5 mr-1.5" />
                Dừng Mô Phỏng
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRunning(false);
                setLogs(["[SIMULATOR] Đã reset trạng thái mạch."]);
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset Vi Điều Khiển
            </Button>
          </div>
        </div>

        {/* Right Column: Hardware Visualizer & Serial Monitor (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Microcontroller Visualizer Card */}
          <div className="p-4 rounded-2xl bg-bg-elevated/70 border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Trạng Thái Bo Mạch STM32F4
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                  isRunning ? "bg-emerald-500/20 text-emerald-400" : "bg-text-muted/20 text-text-muted"
                )}
              >
                {isRunning ? "● ĐANG CHẠY" : "○ ĐANG DỪNG"}
              </span>
            </div>

            {/* Simulated BlackPill Board Graphic */}
            <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/20 flex items-center justify-around">
              {/* MCU Chip */}
              <div className="w-20 h-20 rounded-lg bg-zinc-900 border-2 border-zinc-700 flex flex-col items-center justify-center text-center p-1 shadow-md">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 self-start mb-1" />
                <span className="text-[9px] font-bold text-zinc-300 font-mono leading-none">ARM Cortex-M4</span>
                <span className="text-[8px] text-cyan-400 font-mono mt-1">STM32F401</span>
              </div>

              {/* Status LED PC13 */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-mono text-text-muted">LED PC13</span>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center shadow-lg",
                    ledState && isRunning
                      ? "bg-cyan-400 border-white shadow-cyan-400/80 scale-110"
                      : "bg-cyan-950/40 border-cyan-900"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      ledState && isRunning ? "bg-white animate-ping" : "bg-transparent"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold",
                    ledState && isRunning ? "text-cyan-400" : "text-text-muted"
                  )}
                >
                  {ledState && isRunning ? "LOGIC 1 (3.3V)" : "LOGIC 0 (0V)"}
                </span>
              </div>
            </div>
          </div>

          {/* Serial Monitor Console */}
          <div className="rounded-2xl bg-black/90 border border-border/80 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-text-muted">
              <span className="flex items-center gap-1 text-amber-400">
                <Terminal className="w-3.5 h-3.5" /> ST-Link VCP Virtual COM (115200)
              </span>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-text-muted hover:text-white"
              >
                Xóa màn hình
              </button>
            </div>
            <div className="p-3 text-[11px] font-mono text-zinc-300 space-y-1 h-32 overflow-y-auto leading-normal">
              {logs.length === 0 ? (
                <span className="text-zinc-600 italic">Bấm "Chạy Thử Nghiệm" để bắt đầu nhận luồng log...</span>
              ) : (
                logs.map((line, idx) => (
                  <div key={idx} className="text-emerald-400">
                    <span className="text-zinc-600 mr-1.5">&gt;</span>
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
