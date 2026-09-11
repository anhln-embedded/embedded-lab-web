import React from "react";
import {
  Cpu,
  CircuitBoard,
  Terminal,
  Code2,
  Clock,
  Zap,
  Car,
  BrainCircuit,
  Radio,
  Wifi,
  ShieldCheck,
  Bot,
  Microscope,
  Layers,
  BookOpen,
  Binary,
  Plug,
  BatteryCharging,
  Settings,
  Flame,
  Sparkles,
} from "lucide-react";

export interface CategoryIconProps {
  icon?: string;
  slug?: string;
  name?: string;
  className?: string;
  size?: number;
}

/**
 * Danh sách gợi ý icon chuyên ngành Nhúng & IoT
 */
export const CATEGORY_ICON_PRESETS = [
  // 1. Vi Điều Khiển & SoC
  { key: "cpu", label: "Vi Điều Khiển / CPU / SoC", type: "lucide", value: "cpu", icon: "cpu" },
  { key: "circuit", label: "Vi Mạch / Bo Mạch PCB", type: "lucide", value: "circuit", icon: "circuit" },
  { key: "plug", label: "Linh Kiện / Ngoại Vi Cắm", type: "lucide", value: "plug", icon: "plug" },
  { key: "battery", label: "Nguồn / Pin / Power", type: "lucide", value: "battery", icon: "battery" },
  { key: "pager", label: "Thiết Bị Nhúng Mini", type: "emoji", value: "📟", icon: "📟" },
  { key: "gear", label: "Cơ Cấu / Phần Cứng", type: "emoji", value: "⚙️", icon: "⚙️" },

  // 2. Hệ Điều Hành & Nhân
  { key: "linux", label: "Linux Kernel / Tux", type: "emoji", value: "🐧", icon: "🐧" },
  { key: "clock", label: "Real-Time / Định Thời RTOS", type: "lucide", value: "clock", icon: "clock" },
  { key: "zap", label: "Xung Nhịp / Phản Hồi Nhanh", type: "lucide", value: "zap", icon: "zap" },
  { key: "stopwatch", label: "Đồng Hồ Bấm Giờ RTOS", type: "emoji", value: "⏱️", icon: "⏱️" },
  { key: "terminal", label: "Dòng Lệnh Terminal / U-Boot", type: "lucide", value: "terminal", icon: "terminal" },
  { key: "layers", label: "Kiến Trúc Tầng / Stack", type: "lucide", value: "layers", icon: "layers" },

  // 3. Lập Trình & Mã Nguồn
  { key: "code", label: "Mã Nguồn C/C++/Rust", type: "lucide", value: "code", icon: "code" },
  { key: "laptop", label: "Máy Trạm / Workstation", type: "emoji", value: "💻", icon: "💻" },
  { key: "keyboard", label: "Bàn Phím Lập Trình", type: "emoji", value: "⌨️", icon: "⌨️" },
  { key: "binary", label: "Nhị Phân / Assembly", type: "lucide", value: "binary", icon: "binary" },
  { key: "scroll", label: "Script / Makefile / Tài Liệu", type: "emoji", value: "📜", icon: "📜" },

  // 4. AIoT & Mạng Không Dây
  { key: "brain", label: "AIoT / Edge AI / TinyML", type: "lucide", value: "brain", icon: "brain" },
  { key: "brain_emoji", label: "Trí Tuệ Nhân Tạo (Emoji)", type: "emoji", value: "🧠", icon: "🧠" },
  { key: "radio", label: "Sóng RF / Vô Tuyến / LoRa", type: "lucide", value: "radio", icon: "radio" },
  { key: "wifi", label: "WiFi / Kết Nối Mạng", type: "lucide", value: "wifi", icon: "wifi" },
  { key: "satellite", label: "Anten Vệ Tinh / Viễn Thông", type: "emoji", value: "📡", icon: "📡" },
  { key: "globe", label: "Internet / MQTT / Cloud IoT", type: "emoji", value: "🌐", icon: "🌐" },

  // 5. Ô Tô & Robotics
  { key: "car", label: "Automotive / Xe Ô Tô / CAN", type: "lucide", value: "car", icon: "car" },
  { key: "car_emoji", label: "Xe Hơi Thông Minh (Emoji)", type: "emoji", value: "🚗", icon: "🚗" },
  { key: "bot", label: "Robotics / Tự Động Hóa", type: "lucide", value: "bot", icon: "bot" },
  { key: "robot_emoji", label: "Robot Cơ Điện Tử (Emoji)", type: "emoji", value: "🤖", icon: "🤖" },

  // 6. Đo Kiểm, Bảo Mật & Khác
  { key: "microscope", label: "Phòng Lab / Đo Sóng", type: "lucide", value: "microscope", icon: "microscope" },
  { key: "shield", label: "Bảo Mật Nhúng / Secure Boot", type: "lucide", value: "shield", icon: "shield" },
  { key: "shield_emoji", label: "Khiên Bảo Vệ (Emoji)", type: "emoji", value: "🛡️", icon: "🛡️" },
  { key: "book", label: "Giáo Trình / Sách", type: "lucide", value: "book", icon: "book" },
  { key: "books_emoji", label: "Tài Liệu Tổng Hợp (Emoji)", type: "emoji", value: "📚", icon: "📚" },
  { key: "lightbulb", label: "Sáng Tạo / Ý Tưởng", type: "emoji", value: "💡", icon: "💡" },
];

/**
 * Component hiển thị Icon đồng nhất, tự động nhận diện emoji hoặc Lucide icon
 */
export function CategoryIcon({
  icon = "",
  slug = "",
  name = "",
  className = "w-4 h-4",
  size = 18,
}: CategoryIconProps) {
  const normalized = (icon || "").trim().toLowerCase();
  const slugNorm = (slug || "").trim().toLowerCase();
  const nameNorm = (name || "").trim().toLowerCase();

  // 1. Kiểm tra nếu là icon vector Lucide được lưu bằng tên key
  switch (normalized) {
    case "cpu":
    case "mcu":
    case "chip":
    case "soc":
      return <Cpu className={className} size={size} />;

    case "circuit":
    case "circuitboard":
    case "circuit-board":
    case "pcb":
    case "hardware":
      return <CircuitBoard className={className} size={size} />;

    case "terminal":
      return <Terminal className={className} size={size} />;

    case "code":
    case "code2":
    case "programming":
      return <Code2 className={className} size={size} />;

    case "clock":
    case "timer":
      return <Clock className={className} size={size} />;

    case "zap":
    case "lightning":
      return <Zap className={className} size={size} />;

    case "car":
    case "automotive":
      return <Car className={className} size={size} />;

    case "brain":
    case "ai":
    case "aiot":
      return <BrainCircuit className={className} size={size} />;

    case "radio":
      return <Radio className={className} size={size} />;

    case "wifi":
      return <Wifi className={className} size={size} />;

    case "shield":
      return <ShieldCheck className={className} size={size} />;

    case "bot":
    case "robot":
      return <Bot className={className} size={size} />;

    case "microscope":
    case "lab":
      return <Microscope className={className} size={size} />;

    case "layers":
      return <Layers className={className} size={size} />;

    case "binary":
      return <Binary className={className} size={size} />;

    case "book":
      return <BookOpen className={className} size={size} />;

    case "plug":
      return <Plug className={className} size={size} />;

    case "battery":
      return <BatteryCharging className={className} size={size} />;
  }

  // 2. Xử lý sửa lỗi thừa kế nếu đang dùng emoji 🎛️ (Control Knobs / Mixer) không phù hợp:
  if (normalized === "🎛️" || normalized === "🎛") {
    // Nếu là Vi Điều Khiển & SoC
    if (slugNorm === "mcu" || nameNorm.includes("vi điều khiển") || nameNorm.includes("soc")) {
      return <Cpu className={className} size={size} />;
    }
    // Nếu là Vi Mạch / Phần cứng PCB
    if (slugNorm === "vi-mach" || slugNorm === "hardware" || nameNorm.includes("vi mạch") || nameNorm.includes("pcb")) {
      return <CircuitBoard className={className} size={size} />;
    }
  }

  // 3. Xử lý trường hợp icon là rỗng nhưng có slug nhận biết
  if (!icon || icon === "📚") {
    if (slugNorm === "mcu" || nameNorm.includes("vi điều khiển")) return <Cpu className={className} size={size} />;
    if (slugNorm === "vi-mach" || slugNorm === "hardware" || nameNorm.includes("vi mạch")) return <CircuitBoard className={className} size={size} />;
    if (slugNorm === "linux" || nameNorm.includes("linux")) return <span className="text-base leading-none">🐧</span>;
    if (slugNorm === "rtos" || nameNorm.includes("rtos") || nameNorm.includes("real-time")) return <Clock className={className} size={size} />;
    if (slugNorm === "programming" || nameNorm.includes("lập trình") || nameNorm.includes("ngôn ngữ")) return <Code2 className={className} size={size} />;
    if (slugNorm === "automotive" || nameNorm.includes("automotive") || nameNorm.includes("ô tô")) return <Car className={className} size={size} />;
  }

  // 4. Nếu là emoji tiêu chuẩn Unicode
  return (
    <span className="text-base leading-none select-none inline-flex items-center justify-center flex-shrink-0">
      {icon || "📚"}
    </span>
  );
}
