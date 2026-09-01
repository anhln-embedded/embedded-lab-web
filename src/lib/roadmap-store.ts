"use client";

export interface RoadmapStep {
  id: string;
  title: string;
  level: "Cơ bản" | "Trung cấp" | "Nâng cao" | "Thực chiến";
  description: string;
  skills: string[];
  recommendedTime: string;
  relatedDocUrl?: string;
}

export interface RoadmapTrack {
  id: string;
  title: string;
  icon: string; // "Cpu" | "Terminal" | "Zap" | "Binary" | "Layers" | "BrainCircuit" | "Radio"
  category: "embedded-rtos" | "embedded-linux" | "tinyml" | "fpga" | "pcb-hardware" | "general";
  targetRole: string;
  description: string;
  steps: RoadmapStep[];
}

export const DEFAULT_5_ROADMAP_TRACKS: RoadmapTrack[] = [
  {
    id: "track-embedded-rtos",
    title: "1. Embedded RTOS (Hệ Thống Nhúng & Real-Time OS)",
    icon: "Cpu",
    category: "embedded-rtos",
    targetRole: "Kỹ sư Firmware, Kỹ sư Hệ thống Nhúng (STM32 / Zephyr / FreeRTOS)",
    description: "Lộ trình từ lập trình C/C++ thanh ghi trần đến kiến trúc RTOS đa tác vụ, thiết kế Driver module hóa và kỹ thuật gỡ lỗi hệ thống.",
    steps: [
      {
        id: "rtos-1",
        title: "Mốc 1: C/C++ Chuyên Sâu & Kiến Trúc ARM Cortex-M",
        level: "Cơ bản",
        description: "Nắm vững Con trỏ hàm, Cấu trúc bộ nhớ Flash/SRAM, Stack, Heap, Thao tác Bitwise và thanh ghi phần cứng.",
        skills: ["C/C++", "Pointers", "Memory Map", "Bitwise", "ARM Cortex-M"],
        recommendedTime: "4 - 6 tuần",
      },
      {
        id: "rtos-2",
        title: "Mốc 2: Ngoại Vi Vi Điều Khiển & Giao Tiếp DMA / NVIC",
        level: "Trung cấp",
        description: "Lập trình GPIO, Hardware Timers, PWM, USART, I2C, SPI, ADC/DAC và tối ưu truyền nhận DMA.",
        skills: ["STM32 HAL", "DMA", "Interrupts / NVIC", "I2C / SPI / UART", "Sensors"],
        recommendedTime: "6 - 8 tuần",
      },
      {
        id: "rtos-3",
        title: "Mốc 3: Hệ Điều Hành Thời Gian Thực (FreeRTOS & Zephyr RTOS)",
        level: "Nâng cao",
        description: "Quản lý Tasks, Semaphore, Mutex, Message Queue, Event Groups và Device Tree (.dts).",
        skills: ["FreeRTOS", "Zephyr RTOS", "Task Scheduling", "Mutex", "DeviceTree"],
        recommendedTime: "8 - 10 tuần",
      },
      {
        id: "rtos-4",
        title: "Mốc 4: Tối Ưu, Gỡ Lỗi HardFault & CI/CD Nhúng",
        level: "Thực chiến",
        description: "Bắt lỗi HardFault, Trace SWD/JTAG, Unit Test Unity/CMock và dựng GitHub Actions build firmware tự động.",
        skills: ["HardFault Debug", "GDB", "Unity/CMock", "CI/CD", "Low-Power"],
        recommendedTime: "4 - 6 tuần",
      },
    ],
  },
  {
    id: "track-embedded-linux",
    title: "2. Linux (Linux Nhúng & Kernel / BSP)",
    icon: "Terminal",
    category: "embedded-linux",
    targetRole: "Kỹ sư Linux Nhúng, BSP Engineer, Kernel Module Developer",
    description: "Lộ trình làm chủ toàn diện hệ điều hành Linux trên phần cứng nhúng: U-Boot, Kernel, Yocto Project, Buildroot và viết Linux Device Drivers.",
    steps: [
      {
        id: "linux-1",
        title: "Mốc 1: Linux Command Line, Shell Script & Lập Trình POSIX C",
        level: "Cơ bản",
        description: "Làm chủ môi trường Linux, File System, Process & Thread (pthread), IPC (Pipes, Sockets), Make/CMake.",
        skills: ["Linux Shell", "POSIX C", "Pthreads", "Sockets", "Makefile"],
        recommendedTime: "4 - 6 tuần",
      },
      {
        id: "linux-2",
        title: "Mốc 2: 4 Thành Phần Linux Nhúng (Toolchain, Bootloader, Kernel, RootFS)",
        level: "Trung cấp",
        description: "Biên dịch Cross-Compiler Toolchain, cấu hình U-Boot Bootloader, nạp Kernel qua TFTP và tạo RootFS với BusyBox.",
        skills: ["Cross-Toolchain", "U-Boot", "Linux Kernel", "BusyBox", "TFTP/NFS"],
        recommendedTime: "6 - 8 tuần",
      },
      {
        id: "linux-3",
        title: "Mốc 3: Xây Dựng Bản Phân Phối Tùy Biến Với Yocto & Buildroot",
        level: "Nâng cao",
        description: "Lập trình Recipes BitBake, Layer tùy biến, quản lý Package và tối ưu hóa thời gian khởi động (Fast Boot).",
        skills: ["Yocto Project", "BitBake", "Buildroot", "Custom Layers", "Fast Boot"],
        recommendedTime: "8 - 10 tuần",
      },
      {
        id: "linux-4",
        title: "Mốc 4: Phát Triển Linux Device Drivers (Char, I2C, SPI, GPIO)",
        level: "Thực chiến",
        description: "Viết Kernel Module, xử lý ngắt trong Kernel (Top/Bottom Half), Device Tree Bindings và DMA Memory Allocation.",
        skills: ["Character Driver", "I2C/SPI Subsystem", "Device Tree", "Interrupt Handling"],
        recommendedTime: "8 - 12 tuần",
      },
    ],
  },
  {
    id: "track-tinyml",
    title: "3. TinyML (Trí Tuệ Nhân Tạo Biên & Edge AI)",
    icon: "Zap",
    category: "tinyml",
    targetRole: "Kỹ sư AIoT, Edge AI Engineer, TinyML Researcher",
    description: "Lộ trình đưa các mô hình Deep Learning chạy trực tiếp trên vi điều khiển ESP32-S3, STM32 và bộ tăng tốc NPU/DPU.",
    steps: [
      {
        id: "tinyml-1",
        title: "Mốc 1: Nền Tảng Machine Learning & Lượng Tử Hóa INT8",
        level: "Cơ bản",
        description: "Tiền xử lý dữ liệu cảm biến, huấn luyện mô hình phân loại với PyTorch, lượng tử hóa Post-Training INT8.",
        skills: ["Python", "PyTorch", "Preprocessing", "INT8 Quantization"],
        recommendedTime: "4 - 6 tuần",
      },
      {
        id: "tinyml-2",
        title: "Mốc 2: TinyML Trên Vi Điều Khiển Với ESP-DL & TFLite Micro",
        level: "Trung cấp",
        description: "Khai thác tập lệnh Vector SIMD trên ESP32-S3 với thư viện ESP-DL và TensorFlow Lite Micro.",
        skills: ["ESP-DL", "TFLite Micro", "ESP32-S3 Vector", "Camera OV2640"],
        recommendedTime: "6 - 8 tuần",
      },
      {
        id: "tinyml-3",
        title: "Mốc 3: Xử Lý Giọng Nói KWS & Nhận Diện Hình Ảnh Real-Time",
        level: "Nâng cao",
        description: "Triển khai nhận diện từ khóa thoại (Keyword Spotting) và Object Detection YOLOv8 Tiny trên bo mạch nhúng.",
        skills: ["KWS Audio", "YOLOv8 Edge", "PSRAM Optimization", "MQTT TLS"],
        recommendedTime: "6 - 8 tuần",
      },
      {
        id: "tinyml-4",
        title: "Mốc 4: Tăng Tốc AI Phần Cứng Trên FPGA Zynq Với Vitis AI",
        level: "Thực chiến",
        description: "Biên dịch và chạy mô hình trên bộ xử lý DPU chuyên dụng của AMD Xilinx Zynq MPSoC.",
        skills: ["Vitis AI", "DPU Acceleration", "Xilinx Zynq", "Real-Time Inference"],
        recommendedTime: "8 - 10 tuần",
      },
    ],
  },
  {
    id: "track-fpga",
    title: "4. FPGA (Thiết Kế Vi Mạch Số & RISC-V SoC)",
    icon: "Binary",
    category: "fpga",
    targetRole: "Kỹ sư Thiết kế Vi mạch, FPGA Engineer, RTL Design Engineer",
    description: "Lộ trình thiết kế phần cứng số với Verilog HDL, tổng hợp Vivado, tự xây dựng CPU RISC-V 32-bit và tích hợp SoC bus AXI.",
    steps: [
      {
        id: "fpga-1",
        title: "Mốc 1: Ngôn Ngữ Mô Tả Phần Cứng Verilog HDL & FSM",
        level: "Cơ bản",
        description: "Tư duy mạch số song song, mạch tổ hợp và mạch tuần tự, máy trạng thái hữu hạn Mealy/Moore FSM.",
        skills: ["Digital Logic", "Verilog HDL", "FSM State Machine", "Testbench"],
        recommendedTime: "6 - 8 tuần",
      },
      {
        id: "fpga-2",
        title: "Mốc 2: Quy Trình Tổng Hợp, Ràng Buộc XDC & Phân Tích Timing Vivado",
        level: "Trung cấp",
        description: "Sử dụng Xilinx Vivado, viết file ràng buộc chân và clock (.xdc), tối ưu Timing Closure (Setup/Hold time).",
        skills: ["Xilinx Vivado", "XDC Constraints", "Static Timing Analysis", "LUT & Flip-Flop"],
        recommendedTime: "6 - 8 tuần",
      },
      {
        id: "fpga-3",
        title: "Mốc 3: Tự Thiết Kế Bộ Vi Xử Lý RISC-V RV32I 5 Tầng Pipeline",
        level: "Nâng cao",
        description: "Thiết kế ALU, Register File, giải mã lệnh và khối giải quyết xung đột Data & Control Hazard.",
        skills: ["RISC-V ISA", "Pipeline 5-Stage", "Hazard Detection", "Forwarding Unit"],
        recommendedTime: "10 - 12 tuần",
      },
      {
        id: "fpga-4",
        title: "Mốc 4: Tích Hợp Hệ Thống SoC Chuẩn Bus AXI & Ngoại Vi",
        level: "Thực chiến",
        description: "Ghép nối bus AXI4-Lite, Memory Controller BRAM/DDR và chạy chương trình C trên lõi tự thiết kế.",
        skills: ["AXI4 Bus", "BRAM Controller", "UART/GPIO IP", "SoC Integration"],
        recommendedTime: "8 - 10 tuần",
      },
    ],
  },
  {
    id: "track-pcb-hardware",
    title: "5. PCB (Thiết Kế Mạch In Cao Tốc & Phần Cứng)",
    icon: "Layers",
    category: "pcb-hardware",
    targetRole: "Kỹ sư Phần Cứng (Hardware Engineer), Kỹ sư Thiết kế PCB Cao Tốc",
    description: "Lộ trình thiết kế bo mạch cao tốc kiểm soát trở kháng 50Ω, đo kiểm tương thích điện từ EMC và phối hợp trở kháng anten trên đồ thị Smith.",
    steps: [
      {
        id: "pcb-1",
        title: "Mốc 1: Nguyên Lý Điện Tử & Thiết Kế Schematic Chuẩn Công Nghiệp",
        level: "Cơ bản",
        description: "Chọn linh kiện, tính toán công suất nguồn (Buck/LDO), bảo vệ ESD, Overvoltage và phân tích Datasheet.",
        skills: ["Altium Designer", "Schematic Design", "Power Budget", "ESD Protection"],
        recommendedTime: "4 - 6 tuần",
      },
      {
        id: "pcb-2",
        title: "Mốc 2: Thiết Kế PCB Cao Tốc & Kiểm Soát Trở Kháng 50 Ohm",
        level: "Trung cấp",
        description: "Định tuyến Microstrip & Stripline, xếp chồng lớp (Layer Stackup 4-6 layers), cân bằng chiều dài bus vi sai USB/DDR.",
        skills: ["High-Speed PCB", "50Ω Controlled", "Differential Pairs", "Return Current Path"],
        recommendedTime: "6 - 8 tuần",
      },
      {
        id: "pcb-3",
        title: "Mốc 3: Tương Thích Điện Từ (EMC / Near-Field Probes)",
        level: "Nâng cao",
        description: "Định vị nguồn nhiễu EMI bằng đầu đo trường gần Near-Field Probes và máy phân tích phổ Spectrum Analyzer.",
        skills: ["EMC Precompliance", "Near-Field Probes", "Spectrum Analyzer", "Ferrite Beads"],
        recommendedTime: "4 - 6 tuần",
      },
      {
        id: "pcb-4",
        title: "Mốc 4: Đo Kiểm VNA & Phối Hợp Trở Kháng Đồ Thị Smith",
        level: "Thực chiến",
        description: "Đo ma trận S-Parameters S11/S21 với VNA, tinh chỉnh mạng phối hợp LC và thiết kế anten vi dải 2.4GHz.",
        skills: ["Vector Network Analyzer", "Smith Chart", "Antenna Matching", "LiteVNA"],
        recommendedTime: "6 - 8 tuần",
      },
    ],
  },
];

import { safeStorage } from "./storage";

const STORAGE_KEY = "embedded_lab_dynamic_roadmaps";

export function getStoredRoadmapTracks(): RoadmapTrack[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RoadmapTrack[];
  } catch (error) {
    console.error("Error reading stored roadmap tracks:", error);
    return [];
  }
}

export function saveStoredRoadmapTracks(tracks: RoadmapTrack[]): void {
  if (typeof window === "undefined") return;
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    window.dispatchEvent(new CustomEvent("embedded_roadmap_updated", { detail: tracks }));
  } catch (error) {
    console.error("Error saving stored roadmap tracks:", error);
  }
}

export function getAllRoadmapTracks(): RoadmapTrack[] {
  return getStoredRoadmapTracks();
}

export function getRoadmapTrackById(id: string): RoadmapTrack | undefined {
  const tracks = getAllRoadmapTracks();
  return tracks.find((t) => t.id === id);
}

export function createRoadmapTrack(
  trackData: Omit<RoadmapTrack, "id"> & { id?: string }
): RoadmapTrack {
  const tracks = getStoredRoadmapTracks();
  const id =
    trackData.id ||
    `track_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newTrack: RoadmapTrack = {
    ...trackData,
    id,
    steps: trackData.steps || [],
  };

  const updated = [...tracks, newTrack];
  saveStoredRoadmapTracks(updated);
  return newTrack;
}

export function updateRoadmapTrack(
  id: string,
  updates: Partial<RoadmapTrack>
): RoadmapTrack | null {
  const tracks = getStoredRoadmapTracks();
  const index = tracks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updatedTrack: RoadmapTrack = {
    ...tracks[index],
    ...updates,
  };

  tracks[index] = updatedTrack;
  saveStoredRoadmapTracks(tracks);
  return updatedTrack;
}

export function deleteRoadmapTrack(id: string): boolean {
  const tracks = getStoredRoadmapTracks();
  const filtered = tracks.filter((t) => t.id !== id);
  if (filtered.length === tracks.length) return false;
  saveStoredRoadmapTracks(filtered);
  return true;
}

export function addStepToTrack(
  trackId: string,
  stepData: Omit<RoadmapStep, "id"> & { id?: string }
): RoadmapTrack | null {
  const tracks = getStoredRoadmapTracks();
  const index = tracks.findIndex((t) => t.id === trackId);
  if (index === -1) return null;

  const stepId =
    stepData.id ||
    `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newStep: RoadmapStep = {
    ...stepData,
    id: stepId,
    skills: stepData.skills || [],
  };

  tracks[index].steps = [...tracks[index].steps, newStep];
  saveStoredRoadmapTracks(tracks);
  return tracks[index];
}

export function updateStepInTrack(
  trackId: string,
  stepId: string,
  updates: Partial<RoadmapStep>
): RoadmapTrack | null {
  const tracks = getStoredRoadmapTracks();
  const trackIndex = tracks.findIndex((t) => t.id === trackId);
  if (trackIndex === -1) return null;

  const stepIndex = tracks[trackIndex].steps.findIndex((s) => s.id === stepId);
  if (stepIndex === -1) return null;

  tracks[trackIndex].steps[stepIndex] = {
    ...tracks[trackIndex].steps[stepIndex],
    ...updates,
  };

  saveStoredRoadmapTracks(tracks);
  return tracks[trackIndex];
}

export function deleteStepFromTrack(
  trackId: string,
  stepId: string
): RoadmapTrack | null {
  const tracks = getStoredRoadmapTracks();
  const trackIndex = tracks.findIndex((t) => t.id === trackId);
  if (trackIndex === -1) return null;

  tracks[trackIndex].steps = tracks[trackIndex].steps.filter(
    (s) => s.id !== stepId
  );
  saveStoredRoadmapTracks(tracks);
  return tracks[trackIndex];
}
