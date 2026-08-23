"use client";

import { CourseData, CourseCategory } from "@/lib/content";

export interface CourseCategoryMeta {
  id: CourseCategory;
  name: string;
  enName: string;
  icon: string;
  description: string;
  badgeColor: string;
  accentColor: string;
}

export const COURSE_CATEGORIES: CourseCategoryMeta[] = [
  {
    id: "embedded-rtos",
    name: "Embedded RTOS",
    enName: "Hệ Thống Nhúng & RTOS",
    icon: "Cpu",
    description: "Lập trình ARM Cortex-M, STM32 HAL, FreeRTOS, Zephyr RTOS, Device Tree & Bare-metal C/C++",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    accentColor: "#06b6d4",
  },
  {
    id: "embedded-linux",
    name: "Linux",
    enName: "Linux Nhúng & Kernel / BSP",
    icon: "Terminal",
    description: "Xây dựng hệ điều hành nhúng với Yocto Project, Buildroot, Linux Device Driver & Char/I2C/SPI subsystem",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    accentColor: "#f59e0b",
  },
  {
    id: "tinyml",
    name: "TinyML",
    enName: "Trí Tuệ Nhân Tạo Biên (Edge AI)",
    icon: "Zap",
    description: "Lượng tử hóa INT8, TensorFlow Lite Micro, ESP-DL Vector Extension trên ESP32-S3 và Kria NPU",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    accentColor: "#10b981",
  },
  {
    id: "fpga",
    name: "FPGA",
    enName: "Thiết Kế Vi Mạch Số & RISC-V",
    icon: "Binary",
    description: "Ngôn ngữ mô tả phần cứng Verilog HDL, tổng hợp Vivado, tự thiết kế CPU RISC-V 32-bit & SoC AXI4",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    accentColor: "#a855f7",
  },
  {
    id: "pcb-hardware",
    name: "PCB",
    enName: "Thiết Kế Mạch In & Phần Cứng",
    icon: "Layers",
    description: "Thiết kế mạch in cao tốc 50Ω với Altium Designer, đo kiểm EMC Near-Field, VNA Smith Chart & Anten",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    accentColor: "#f43f5e",
  },
];

export const DEFAULT_LAB_COURSES: CourseData[] = [
  {
    _id: "course-embedded-rtos-zephyr",
    title: "Làm Chủ Zephyr RTOS & FreeRTOS: Từ Căn Bản Đến Kiến Trúc Driver & Network",
    slug: "zephyr-rtos-freertos-mastery",
    category: "embedded-rtos",
    description: "Khóa học thực hành toàn diện về Zephyr RTOS và FreeRTOS trên vi điều khiển ARM Cortex-M và ESP32: Quản lý luồng đa nhiệm, IPC, Device Tree, Kconfig, BLE Host và Wi-Fi Subsystem.",
    level: "intermediate",
    duration: "8 giờ học (30 bài giảng)",
    lessons: 30,
    prerequisites: ["Lập trình C nâng cao (con trỏ, struct, macro)", "Kiến thức căn bản về vi điều khiển"],
    tags: ["embedded-rtos", "zephyr", "freertos", "arm", "stm32"],
    price: "free",
    thumbnail: "/images/logo.png",
    instructor: "Embedded-AIoT Lab PTIT",
    curriculum: [
      {
        module: "Học phần 1: Khởi đầu với Zephyr RTOS & Công cụ West",
        lessons: [
          {
            title: "Cài đặt Zephyr SDK và Toolchain trên Windows/Linux",
            slug: "cai-dat-zephyr-sdk",
            duration: "20 phút",
            free: true,
            summary: "Thiết lập môi trường virtualenv, west workspace và biên dịch ứng dụng Blinky đầu tiên.",
          },
          {
            title: "Hiểu sâu Device Tree (.dts) và Kconfig (.conf)",
            slug: "hieu-sau-device-tree",
            duration: "30 phút",
            free: true,
            summary: "Cú pháp node, property, aliases, GPIO labels và cách viết overlay file cho board tùy biến.",
          },
        ],
      },
    ],
    url: "/courses/zephyr-rtos-freertos-mastery",
    body: { raw: "" },
  },
  {
    _id: "course-embedded-linux-yocto",
    title: "Phát Triển Linux Nhúng Thực Chiến Với Yocto Project & Linux Device Driver",
    slug: "embedded-linux-yocto-device-driver",
    category: "embedded-linux",
    description: "Xây dựng bản phân phối Linux tùy biến với Yocto Project (Poky, BitBake), cấu hình U-Boot Bootloader, Device Tree và viết Linux Kernel Module / Char Driver.",
    level: "advanced",
    duration: "10 giờ học (26 bài giảng)",
    lessons: 26,
    prerequisites: ["Lập trình C trên Linux", "Lệnh dòng lệnh Shell / Bash", "Kiến trúc hệ điều hành"],
    tags: ["embedded-linux", "yocto", "device-driver", "kernel", "bsp"],
    price: "free",
    thumbnail: "/images/logo.png",
    instructor: "Embedded-AIoT Lab PTIT",
    curriculum: [
      {
        module: "Học phần 1: Tổng quan Linux Nhúng & Yocto Project",
        lessons: [
          {
            title: "Kiến trúc 4 thành phần Linux Nhúng: Toolchain, Bootloader, Kernel, RootFS",
            slug: "kien-truc-linux-nhung",
            duration: "25 phút",
            free: true,
            summary: "Sự khác nhau giữa Desktop Linux và Embedded Linux cho bo mạch ARM SoC.",
          },
        ],
      },
    ],
    url: "/courses/embedded-linux-yocto-device-driver",
    body: { raw: "" },
  },
  {
    _id: "course-tinyml-esp32",
    title: "TinyML & Edge AI Chuyên Sâu Trên ESP32-S3 Với Khung ESP-DL",
    slug: "tinyml-edge-ai-esp32-s3",
    category: "tinyml",
    description: "Xây dựng hệ thống camera thông minh AIoT: Thu thập dữ liệu cảm biến, huấn luyện mô hình TinyML, lượng tử hóa INT8 và nhúng trực tiếp lên vi điều khiển ESP32-S3.",
    level: "intermediate",
    duration: "9 giờ học (28 bài giảng)",
    lessons: 28,
    prerequisites: ["Python & PyTorch căn bản", "Lập trình C++ trên ESP-IDF", "Xử lý ảnh cơ bản"],
    tags: ["tinyml", "edge-ai", "esp32", "yolov8", "esp-dl"],
    price: "free",
    thumbnail: "/images/logo.png",
    instructor: "Embedded-AIoT Lab PTIT",
    curriculum: [
      {
        module: "Học phần 1: Pipeline Triển Khai Edge AI Từ Zero",
        lessons: [
          {
            title: "Tổng quan TinyML: Đánh đổi Độ chính xác, Dung lượng Flash/RAM và Tốc độ suy luận",
            slug: "tong-quan-tinyml",
            duration: "25 phút",
            free: true,
            summary: "Hiểu giới hạn tài nguyên của vi điều khiển 512KB SRAM vs 8MB PSRAM.",
          },
        ],
      },
    ],
    url: "/courses/tinyml-edge-ai-esp32-s3",
    body: { raw: "" },
  },
  {
    _id: "course-fpga-verilog",
    title: "Thiết Kế Vi Mạch Số Với Verilog & FPGA: Từ Cổng Logic Đến Soft Core RISC-V",
    slug: "fpga-verilog-riscv-soc",
    category: "fpga",
    description: "Khóa học thực hành thiết kế phần cứng số bằng Verilog HDL. Triển khai pipeline, FSM, giao tiếp AXI-Lite và tự tay hiện thực vi xử lý RISC-V 32-bit trên Vivado.",
    level: "intermediate",
    duration: "12 giờ học (36 bài giảng)",
    lessons: 36,
    prerequisites: ["Toán rời rạc / Đại số Boole", "Kỹ thuật số cơ bản"],
    tags: ["fpga", "verilog", "risc-v", "vivado", "xilinx"],
    price: "free",
    thumbnail: "/images/logo.png",
    instructor: "Embedded-AIoT Lab PTIT",
    curriculum: [
      {
        module: "Học phần 1: Tư duy Phần cứng với Verilog HDL",
        lessons: [
          {
            title: "Sự khác biệt cốt tử giữa Phần mềm tuần tự và Phần cứng song song",
            slug: "phan-mem-vs-phan-cung",
            duration: "25 phút",
            free: true,
            summary: "Hiểu rõ blocking (=) vs non-blocking (<=) và mạch tổ hợp vs mạch tuần tự.",
          },
        ],
      },
    ],
    url: "/courses/fpga-verilog-riscv-soc",
    body: { raw: "" },
  },
  {
    _id: "course-pcb-high-speed",
    title: "Thiết Kế Mạch In Cao Tốc (High-Speed PCB) & Kiểm Soát Trở Kháng 50Ω với Altium",
    slug: "high-speed-pcb-design-altium",
    category: "pcb-hardware",
    description: "Kỹ thuật định tuyến đường truyền vi dải (Microstrip & Stripline), tính toán suy hao điện môi, cân bằng chiều dài bus vi sai (Differential Pairs) và triệt tiêu EMI.",
    level: "intermediate",
    duration: "7 giờ học (22 bài giảng)",
    lessons: 22,
    prerequisites: ["Điện tử căn bản", "Sử dụng cơ bản Altium Designer hoặc KiCad"],
    tags: ["pcb-hardware", "altium", "high-speed-pcb", "emc", "smith-chart"],
    price: "free",
    thumbnail: "/images/logo.png",
    instructor: "Embedded-AIoT Lab PTIT",
    curriculum: [
      {
        module: "Học phần 1: Nguyên Lý Đường Truyền Sóng & Trở Kháng Đặc Trưng",
        lessons: [
          {
            title: "Khi nào một đường mạch trở thành đường truyền sóng (Transmission Line)?",
            slug: "khi-nao-mach-thanh-duong-truyen",
            duration: "20 phút",
            free: true,
            summary: "Quy tắc thời gian tăng tín hiệu (Rise Time) và chiều dài tới hạn.",
          },
        ],
      },
    ],
    url: "/courses/high-speed-pcb-design-altium",
    body: { raw: "" },
  },
];

const STORAGE_KEY = "embedded_lab_dynamic_courses";

export function getStoredCourses(): CourseData[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CourseData[];
  } catch (error) {
    console.error("Error reading stored courses:", error);
    return [];
  }
}

export function saveStoredCourses(courses: CourseData[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new CustomEvent("embedded_courses_updated", { detail: courses }));
  } catch (error) {
    console.error("Error saving stored courses:", error);
  }
}

export function getAllCourses(): CourseData[] {
  return getStoredCourses();
}

export function getCourseBySlug(slug: string): CourseData | undefined {
  const courses = getAllCourses();
  return courses.find((c) => c.slug === slug);
}

export function createCourse(courseData: Omit<CourseData, "_id" | "url">): CourseData {
  const courses = getStoredCourses();
  const id = `course_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const slug = courseData.slug || courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const totalLessons = courseData.curriculum.reduce(
    (total, mod) => total + (mod.lessons ? mod.lessons.length : 0),
    0
  );

  const newCourse: CourseData = {
    ...courseData,
    _id: id,
    slug,
    url: `/courses/${slug}`,
    lessons: totalLessons || courseData.lessons || 1,
  };

  const updated = [newCourse, ...courses];
  saveStoredCourses(updated);
  return newCourse;
}

export function updateCourse(id: string, updates: Partial<CourseData>): CourseData | null {
  const courses = getStoredCourses();
  const index = courses.findIndex((c) => c._id === id);
  if (index === -1) return null;

  const existing = courses[index];
  const slug = updates.slug || existing.slug;

  const totalLessons = updates.curriculum
    ? updates.curriculum.reduce((total, mod) => total + (mod.lessons ? mod.lessons.length : 0), 0)
    : existing.lessons;

  const updatedCourse: CourseData = {
    ...existing,
    ...updates,
    slug,
    url: `/courses/${slug}`,
    lessons: totalLessons,
  };

  courses[index] = updatedCourse;
  saveStoredCourses(courses);
  return updatedCourse;
}

export function deleteCourse(id: string): boolean {
  const courses = getStoredCourses();
  const filtered = courses.filter((c) => c._id !== id);
  if (filtered.length === courses.length) return false;
  saveStoredCourses(filtered);
  return true;
}
