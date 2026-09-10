"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  BrainCircuit,
  Cpu,
  Layers,
  ArrowRight,
  Check,
  RotateCcw,
  Zap,
  Code2,
  Trash2,
  Lock,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { DiagramSchema, parseDiagram } from "@/lib/emulator/diagram-parser";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  diagram?: DiagramSchema;
  timestamp: string;
}

const DEFAULT_WELCOME_MSG: Message = {
  id: "welcome",
  sender: "ai",
  text: "Xin chào! Tôi là Trợ lý AI Thiết kế Mạch của Lab. Hãy mô tả mạch bạn muốn tạo (ví dụ: *Tạo mạch STM32 đọc nút PB0 điều khiển LED PC13*, hoặc *ESP32 với OLED I2C*), tôi sẽ tự động phân tích và sinh sơ đồ diagram.json cho bạn!",
  timestamp: "Vừa xong",
};

interface AiCircuitChatProps {
  currentDiagram?: DiagramSchema;
  onApplyDiagram: (diagram: DiagramSchema) => void;
  onSwitchToCodeTab?: () => void;
}

// Bảng tri thức phần cứng Wokwi chuyên sâu để AI phân tích ngôn ngữ tự nhiên
function generateCircuitFromPrompt(prompt: string): {
  explanation: string;
  diagram: DiagramSchema;
} {
  const p = prompt.toLowerCase();

  // 1. STM32 + OLED SSD1306
  if (p.includes("oled") || p.includes("ssd1306") || p.includes("màn hình oled")) {
    const isEsp = p.includes("esp32");
    if (isEsp) {
      return {
        explanation:
          "Tôi đã thiết kế mạch ESP32 kết nối với màn hình OLED SSD1306 (128x64) qua giao thức I2C:\n• SDA → Chân GPIO 21\n• SCL → Chân GPIO 22\n• VCC → Nguồn 3V3, GND → GND",
        diagram: {
          version: 1,
          author: "AI Assistant",
          parts: [
            {
              type: "board-esp32-devkit-c-v4",
              id: "esp",
              top: 0,
              left: 0,
              attrs: { env: "arduino" },
            },
            {
              type: "board-ssd1306",
              id: "oled1",
              top: -120,
              left: 140,
              attrs: {},
            },
          ],
          connections: [
            ["esp:21", "oled1:SDA", "gold", ["v-20", "h50"]],
            ["esp:22", "oled1:SCL", "blue", ["v-30", "h40"]],
            ["esp:3V3", "oled1:VCC", "red", ["v-40"]],
            ["esp:GND.1", "oled1:GND", "black", ["v-50"]],
          ],
        },
      };
    }

    return {
      explanation:
        "Tôi đã thiết kế mạch STM32 Blue Pill kết nối màn hình OLED SSD1306 (128x64) I2C1 kèm nút nhấn và LED PC13:\n• I2C SCL → Chân B6\n• I2C SDA → Chân B7\n• VCC → 3V3, GND → GND\n• Nút bấm → Chân A0\n• Đèn LED → Chân C13",
      diagram: {
        version: 1,
        author: "AI Assistant",
        parts: [
          {
            type: "board-stm32-bluepill",
            id: "stm32",
            top: -39.76,
            left: -22.83,
            attrs: { builder: "platformio-stm32" },
          },
          {
            type: "board-ssd1306",
            id: "oled1",
            top: 140,
            left: -280,
            attrs: {},
          },
          {
            type: "wokwi-led",
            id: "led1",
            top: 140.4,
            left: 81,
            attrs: { color: "limegreen", flip: "1" },
          },
          {
            type: "wokwi-pushbutton",
            id: "btn1",
            top: 60,
            left: -120,
            attrs: { color: "green" },
          },
        ],
        connections: [
          ["stm32:A3", "$serialMonitor:TX", "green", []],
          ["stm32:A2", "$serialMonitor:RX", "green", []],
          ["led1:A", "stm32:C13", "green", ["v0"]],
          ["led1:C", "stm32:GND.1", "black", ["v37.5", "h-139.07", "v-38.4"]],
          ["btn1:1.l", "stm32:A0", "green", ["v0"]],
          ["btn1:2.l", "stm32:GND.2", "black", ["v0"]],
          ["oled1:VCC", "stm32:3V3", "red", ["v-20"]],
          ["oled1:GND", "stm32:GND.3", "black", ["v-10"]],
          ["oled1:SCL", "stm32:B6", "blue", ["v-30", "h40"]],
          ["oled1:SDA", "stm32:B7", "gold", ["v-40", "h50"]],
        ],
      },
    };
  }

  // 2. Arduino + LCD 1602 I2C
  if (p.includes("lcd") || p.includes("lcd1602") || p.includes("arduino")) {
    return {
      explanation:
        "Tôi đã tạo mạch Arduino Uno R3 kết nối màn hình LCD1602 qua module I2C:\n• Chân SDA → Chân Analog A4\n• Chân SCL → Chân Analog A5\n• Nguồn VCC → 5V, GND → GND",
      diagram: {
        version: 1,
        author: "AI Assistant",
        parts: [
          {
            type: "wokwi-arduino-uno",
            id: "uno",
            top: 0,
            left: 0,
            attrs: {},
          },
          {
            type: "wokwi-lcd1602",
            id: "lcd1",
            top: -160,
            left: 0,
            attrs: { pins: "i2c" },
          },
        ],
        connections: [
          ["uno:A4", "lcd1:SDA", "gold", ["v-30"]],
          ["uno:A5", "lcd1:SCL", "blue", ["v-40"]],
          ["uno:5V", "lcd1:VCC", "red", ["v-50"]],
          ["uno:GND.1", "lcd1:GND", "black", ["v-60"]],
        ],
      },
    };
  }

  // 3. Còi Buzzer + Nút nhấn
  if (p.includes("buzzer") || p.includes("còi") || p.includes("loa")) {
    return {
      explanation:
        "Tôi đã tạo mạch STM32 kết nối còi Buzzer phát âm thanh và nút nhấn:\n• Chân dương Buzzer → Chân PB1\n• Chân âm Buzzer → GND\n• Nút bấm → Chân PB0",
      diagram: {
        version: 1,
        author: "AI Assistant",
        parts: [
          {
            type: "board-stm32-bluepill",
            id: "stm32",
            top: -39.76,
            left: -22.83,
            attrs: { builder: "platformio-stm32" },
          },
          {
            type: "wokwi-buzzer",
            id: "bz1",
            top: 140,
            left: 80,
            attrs: { hasVolume: "1" },
          },
          {
            type: "wokwi-pushbutton",
            id: "btn1",
            top: 20,
            left: 80,
            attrs: { color: "red", label: "Button" },
          },
        ],
        connections: [
          ["bz1:1", "stm32:B1", "red", ["v0"]],
          ["bz1:2", "stm32:GND.1", "black", ["v20", "h-120"]],
          ["btn1:1.l", "stm32:B0", "orange", ["v0"]],
          ["btn1:2.l", "stm32:GND.2", "black", ["v-20"]],
        ],
      },
    };
  }

  // 4. Mạch Raspberry Pi Pico RP2040
  if (p.includes("pico") || p.includes("rp2040") || p.includes("raspberry")) {
    return {
      explanation:
        "Tôi đã tạo mạch Raspberry Pi Pico (RP2040) kết nối đèn LED Cyan:\n• Anode LED → Chân GP25\n• Cathode LED → Chân GND",
      diagram: {
        version: 1,
        author: "AI Assistant",
        parts: [
          {
            type: "board-pi-pico",
            id: "pico",
            top: 0,
            left: 0,
            attrs: {},
          },
          {
            type: "wokwi-led",
            id: "led1",
            top: 30,
            left: 90,
            attrs: { color: "cyan" },
          },
        ],
        connections: [
          ["pico:GP25", "led1:A", "cyan", ["v0"]],
          ["pico:GND.1", "led1:C", "black", ["v20", "h-20"]],
        ],
      },
    };
  }

  // 5. ESP32 DevKit
  if (p.includes("esp") || p.includes("esp32")) {
    return {
      explanation:
        "Tôi đã tạo mạch ESP32 DevKit kết nối đèn LED đỏ và nút bấm:\n• LED đỏ → Chân GPIO 2 (kéo xuống GND)\n• Nút bấm xanh → Chân GPIO 4 (nối xuống GND)",
      diagram: {
        version: 1,
        author: "AI Assistant",
        parts: [
          {
            type: "board-esp32-devkit-c-v4",
            id: "esp",
            top: 0,
            left: 0,
            attrs: { env: "arduino" },
          },
          {
            type: "wokwi-led",
            id: "led1",
            top: -60,
            left: 120,
            attrs: { color: "red" },
          },
          {
            type: "wokwi-pushbutton",
            id: "btn1",
            top: 80,
            left: 120,
            attrs: { color: "blue", label: "Button IO4" },
          },
        ],
        connections: [
          ["esp:TX", "$serialMonitor:RX", "", []],
          ["esp:RX", "$serialMonitor:TX", "", []],
          ["led1:A", "esp:2", "red", ["v0"]],
          ["led1:C", "esp:GND.1", "black", ["v20", "h-40"]],
          ["btn1:1.l", "esp:4", "orange", ["v0"]],
          ["btn1:2.l", "esp:GND.1", "black", ["v20", "h-40"]],
        ],
      },
    };
  }

  // 6. Mặc định: STM32 Nút bấm PB0 + LED PC13
  return {
    explanation:
      "Tôi đã tạo mạch STM32 Blue Pill đọc nút nhấn PB0 (Input Pull-up) điều khiển đèn LED PC13:\n• Nút nhấn → Chân PB0 và GND\n• Đèn LED xanh → Chân PC13 và GND",
    diagram: {
      version: 1,
      author: "AI Assistant",
      parts: [
        {
          type: "board-stm32-bluepill",
          id: "stm32",
          top: -39.76,
          left: -22.83,
          attrs: { builder: "platformio-stm32" },
        },
        {
          type: "wokwi-led",
          id: "led1",
          top: 140.4,
          left: 81,
          attrs: { color: "limegreen", flip: "1" },
        },
        {
          type: "wokwi-pushbutton",
          id: "btn1",
          top: 10,
          left: 100,
          attrs: { color: "red", label: "Button PB0" },
        },
      ],
      connections: [
        ["led1:A", "stm32:C13", "green", ["v0"]],
        ["led1:C", "stm32:GND.1", "black", ["v37.5", "h-139.07", "v-38.4"]],
        ["btn1:1.l", "stm32:B0", "orange", ["h-20", "v40"]],
        ["btn1:2.l", "stm32:GND.2", "black", ["h-20", "v-40"]],
      ],
    },
  };
}

export const AiCircuitChat: React.FC<AiCircuitChatProps> = ({
  currentDiagram,
  onApplyDiagram,
  onSwitchToCodeTab,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MSG]);
  const [inputVal, setInputVal] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khôi phục lịch sử chat từ sessionStorage khi component mount trên browser
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("wokwi_ai_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Bỏ qua nếu lỗi
    }
  }, []);

  // Lưu lịch sử chat vào sessionStorage mỗi khi messages thay đổi
  useEffect(() => {
    try {
      sessionStorage.setItem("wokwi_ai_chat_history", JSON.stringify(messages));
    } catch {
      // Bỏ qua nếu lỗi
    }
  }, [messages]);

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME_MSG]);
    try {
      sessionStorage.removeItem("wokwi_ai_chat_history");
    } catch {
      // Bỏ qua nếu lỗi
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal.trim();
    if (!text) return;

    const userMsg: Message = {
      id: "user_" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");
    setIsThinking(true);

    try {
      // Gọi qua API Route AI trên Server kèm định danh user
      const res = await fetch("/api/simulator/ai-circuit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          currentDiagram,
          user: user ? { id: user.id, name: user.name, email: user.email } : null,
          history: messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!res.ok) {
        throw new Error(`AI API HTTP ${res.status}`);
      }

      const data = await res.json();
      let explanation = data.explanation;
      let diagram = data.diagram;

      // Nếu AI không trả về diagram hoặc bị parse lỗi, fallback sang local engine
      if (!diagram) {
        const fallback = generateCircuitFromPrompt(text);
        explanation = (data.explanation ? data.explanation + "\n\n" : "") + fallback.explanation;
        diagram = fallback.diagram;
      }

      const aiMsg: Message = {
        id: "ai_" + Date.now(),
        sender: "ai",
        text: explanation,
        diagram,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn("AI API lỗi, tự động fallback về engine cục bộ:", err);
      const { explanation, diagram } = generateCircuitFromPrompt(text);
      const aiMsg: Message = {
        id: "ai_" + Date.now(),
        sender: "ai",
        text: explanation,
        diagram,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleApply = (msgId: string, diagram: DiagramSchema) => {
    onApplyDiagram(diagram);
    setAppliedId(msgId);
    setTimeout(() => setAppliedId(null), 2500);
  };

  // NẾU CHƯA ĐĂNG NHẬP: Hiển thị Auth Gate yêu cầu đăng nhập, cho phép chuyển sang Code diagram.json
  if (!user) {
    return (
      <div className="bg-bg-panel border border-border rounded-2xl p-4 shadow-sm transition-colors duration-200 flex flex-col h-full min-h-0 justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <Sparkles className="w-3 h-3" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-text-primary tracking-tight">
                  Trợ Lý AI Thiết Kế Mạch
                </h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                  Cần đăng nhập
                </span>
              </div>
              <p className="text-[10px] text-text-muted">Tính năng AI tự động sinh sơ đồ Wokwi</p>
            </div>
          </div>
        </div>

        {/* Khối Auth Gate trung tâm */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4 px-2 text-center space-y-3.5 my-auto">
          <div className="relative">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-accent/20 to-amber-500/15 border border-accent/30 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
              <Lock className="w-6 h-6 text-accent" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-sm">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-[280px]">
            <h4 className="text-sm font-black text-text-primary tracking-tight">
              Đăng nhập để sử dụng Trợ lý AI
            </h4>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Trợ lý AI thiết kế mạch sử dụng tài nguyên máy chủ của Lab. Vui lòng đăng nhập tài khoản PTIT để tiếp tục trò chuyện và tạo mạch.
            </p>
          </div>

          <div className="pt-1 flex flex-col gap-2 w-full max-w-[240px]">
            <Link
              href="/login?redirect=/tools/stm32-simulator"
              className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-accent/25 transition-all hover:scale-102 active:scale-98"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập ngay</span>
            </Link>

            {onSwitchToCodeTab && (
              <button
                onClick={onSwitchToCodeTab}
                className="px-4 py-2 rounded-xl bg-bg-elevated hover:bg-border text-text-secondary hover:text-text-primary text-xs font-semibold border border-border transition-all cursor-pointer"
              >
                Chuyển sang Code diagram.json
              </button>
            )}
          </div>
        </div>

        {/* Chú thích: Vẫn dùng được diagram */}
        <div className="pt-2 border-t border-border/60 text-center">
          <p className="text-[10px] text-text-muted leading-tight">
            💡 Bạn vẫn có toàn quyền xem, mô phỏng và chỉnh sửa mã JSON tại tab{" "}
            <span className="font-semibold text-accent">Code diagram.json</span> mà không cần đăng nhập.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-panel border border-border rounded-2xl p-3 shadow-sm transition-colors duration-200 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-text-primary tracking-tight">
              Trợ Lý AI Thiết Kế Mạch
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-semibold border border-orange-500/20">
              AI Lab
            </span>
          </div>
        </div>

        {/* Nút Xóa lịch sử trò chuyện */}
        <button
          onClick={handleClearChat}
          title="Xóa lịch sử trò chuyện để làm mới"
          className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Danh sách tin nhắn */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-accent text-white rounded-br-xs font-medium"
                  : "bg-bg-elevated border border-border text-text-primary rounded-bl-xs"
              }`}
            >
              {/* Nội dung lời nhắn */}
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Nếu AI tạo ra sơ đồ mạch */}
              {msg.diagram && (
                <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span className="font-mono text-[10px] flex items-center gap-1">
                      <Layers className="w-3 h-3 text-accent" />
                      {msg.diagram.parts?.length} linh kiện • {msg.diagram.connections?.length} dây nối
                    </span>
                  </div>

                  {/* Nút bấm Áp dụng vào mạch ngay */}
                  <button
                    onClick={() => handleApply(msg.id, msg.diagram!)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98 ${
                      appliedId === msg.id
                        ? "bg-emerald-600 text-white"
                        : "bg-gradient-to-r from-accent to-accent-amber hover:opacity-95 text-white"
                    }`}
                  >
                    {appliedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã nạp vào mạch mô phỏng!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Áp dụng vào mạch ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-text-muted mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-text-muted text-xs p-2 bg-bg-elevated rounded-xl border border-border w-fit animate-pulse">
            <BrainCircuit className="w-3.5 h-3.5 text-orange-500 animate-spin" />
            <span>Trợ lý AI đang thiết kế sơ đồ mạch...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input gửi yêu cầu */}
      <div className="pt-2 border-t border-border/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Mô tả mạch muốn tạo (vd: STM32 + OLED I2C)..."
            className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-bg-code border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isThinking}
            className="absolute right-1.5 p-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
