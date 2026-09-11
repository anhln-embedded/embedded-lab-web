"use client";

import { safeStorage } from "./storage";
import { UserRole } from "@/context/AuthContext";

export type CategoryId = "embedded-mcu" | "aiot-edge" | "hardware-pcb" | "qa-projects" | "f17-b9";

export interface DiscussionCategory {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
}

export const DISCUSSION_CATEGORIES: DiscussionCategory[] = [
  {
    id: "embedded-mcu",
    name: "Vi Điều Khiển & Firmware",
    shortName: "MCU & Firmware",
    description: "STM32, ESP32, ARM Cortex-M, FreeRTOS, Zephyr, Bare-metal & Embedded Linux",
    icon: "⚡",
    color: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "aiot-edge",
    name: "AIoT & Edge AI",
    shortName: "AIoT & Edge AI",
    description: "TinyML, Edge Impulse, Thị giác máy tính, ROS2, Jetson Nano, NPU On-Device",
    icon: "🧠",
    color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "hardware-pcb",
    name: "Phần Cứng & Thiết Kế PCB",
    shortName: "Hardware & PCB",
    description: "Altium Designer, KiCad, Mạch cao tốc, RF/Antenna, Nguồn xung, Tiêu chuẩn EMC/EMI",
    icon: "🔌",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "qa-projects",
    name: "Đồ Án, Dự Án & Hợp Tác",
    shortName: "Dự Án & Hợp Tác",
    description: "Hỏi đáp đồ án kỹ thuật, dự án mở cá nhân & nhóm, tìm đồng đội hợp tác nghiên cứu & phát triển",
    icon: "🎓",
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "f17-b9",
    name: "F17 - Chuyện Trò Kỹ Thuật",
    shortName: "Chuyện Trò & Đời Sống",
    description: "Giao lưu cộng đồng kỹ sư nhúng, tâm sự chuyện nghề, kinh nghiệm phỏng vấn và phát triển sự nghiệp",
    icon: "☕",
    color: "from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/30",
  },
];

export type FlairType = "hoi-dap" | "chia-se" | "do-an" | "thao-luan" | "debug" | "tuyen-dung";

export interface DiscussionFlair {
  id: FlairType;
  label: string;
  prefix: string; // VOZ prefix style e.g. [Hỏi đáp]
  badgeClass: string;
}

export const DISCUSSION_FLAIRS: Record<FlairType, DiscussionFlair> = {
  "hoi-dap": {
    id: "hoi-dap",
    label: "Hỏi đáp",
    prefix: "[Hỏi đáp]",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  "chia-se": {
    id: "chia-se",
    label: "Chia sẻ",
    prefix: "[Chia sẻ]",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  "do-an": {
    id: "do-an",
    label: "Đồ án / Dự án",
    prefix: "[Project]",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  "thao-luan": {
    id: "thao-luan",
    label: "Thảo luận",
    prefix: "[Thảo luận]",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  debug: {
    id: "debug",
    label: "Báo lỗi / Debug",
    prefix: "[Debug]",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  "tuyen-dung": {
    id: "tuyen-dung",
    label: "Tuyển thành viên",
    prefix: "[Tìm đồng đội]",
    badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
};

export type VozReactionType = "ung" | "gach" | "ung_bung" | "haha" | "nguong_mo";

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: "image" | "document" | "code" | "archive" | "other";
  dataUrl: string;
}

export interface DiscussionComment {
  id: string;
  threadId: string;
  parentId?: string;
  author: string;
  authorId: string;
  authorRole?: UserRole;
  authorAvatar?: string;
  authorTitle?: string;
  content: string;
  quoteContent?: string;
  quoteAuthor?: string;
  attachedFiles?: AttachedFile[];
  votes: number;
  userVote?: 1 | -1 | 0;
  reactions: {
    ung: number;
    gach: number;
    ung_bung: number;
  };
  createdAt: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  category?: CategoryId;
  flair: FlairType;
  author: string;
  authorId: string;
  authorRole?: UserRole;
  authorAvatar?: string;
  authorTitle?: string;
  content: string;
  codeSnippet?: string;
  attachedFiles?: AttachedFile[];
  hasSimulatorPreview?: boolean;
  simulatorCode?: string;
  votes: number;
  userVote?: 1 | -1 | 0;
  viewsCount: number;
  repliesCount: number;
  reactions: {
    ung: number;
    gach: number;
    ung_bung: number;
    haha: number;
    nguong_mo: number;
  };
  userReactions?: VozReactionType[];
  isPinned?: boolean;
  createdAt: string;
  lastActivity: string;
  tags: string[];
}

const STORAGE_THREADS_KEY = "embedded_aiot_forum_threads_v3";
const STORAGE_COMMENTS_KEY = "embedded_aiot_forum_comments_v3";

const DEFAULT_THREADS: DiscussionThread[] = [
  {
    id: "thread-exti-stm32f4",
    title: "Debug ngắt ngoài EXTI trên STM32F401 không nhảy vào hàm callback HAL_GPIO_EXTI_Callback?",
    category: "embedded-mcu",
    flair: "debug",
    author: "Quang Cường",
    authorId: "usr_cuong_d21",
    authorRole: "user",
    authorAvatar: "👨‍💻",
    authorTitle: "Thành viên Cộng đồng",
    content: `Chào mọi người trong cộng đồng, mình đang làm mạch đo tốc độ động cơ dùng cảm biến quang nối vào chân PB0 (EXTI0). 
Mình đã cấu hình GPIO PB0 là \`GPIO_MODE_IT_FALLING\` và đã bật NVIC Interrupt trong CubeMX.
Tuy nhiên khi dùng nút nhấn thử nghiệm thì vi điều khiển không bao giờ nhảy vào hàm \`HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)\`. 

Đo xung trên chân PB0 bằng dao động ký vẫn thấy mức logic rớt xuống 0V chuẩn xác. Bạn nào từng gặp lỗi này trên dòng STM32F4 BlackPill xin chia sẻ hướng xử lý với ạ!`,
    codeSnippet: `// Cấu hình trong main.c
static void MX_GPIO_Init(void) {
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  __HAL_RCC_GPIOB_CLK_ENABLE();
  
  GPIO_InitStruct.Pin = GPIO_PIN_0;
  GPIO_InitStruct.Mode = GPIO_MODE_IT_FALLING;
  GPIO_InitStruct.Pull = GPIO_PULLUP;
  HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);

  HAL_NVIC_SetPriority(EXTI0_IRQn, 2, 0);
  HAL_NVIC_EnableIRQ(EXTI0_IRQn);
}

// Callback trong stm32f4xx_it.c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
  if (GPIO_Pin == GPIO_PIN_0) {
    // Không bao giờ nhảy vào đây!
    HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
  }
}`,
    hasSimulatorPreview: true,
    simulatorCode: `// Thử nghiệm mô phỏng GPIO Interrupt trên STM32F4
void setup() {
  pinMode(PC13, OUTPUT);
  pinMode(PB0, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PB0), isrHandler, FALLING);
}

void loop() {
  delay(10);
}`,
    votes: 42,
    userVote: 0,
    viewsCount: 520,
    repliesCount: 4,
    reactions: {
      ung: 31,
      gach: 1,
      ung_bung: 12,
      haha: 0,
      nguong_mo: 8,
    },
    userReactions: [],
    isPinned: false,
    createdAt: "2026-09-08T09:15:00Z",
    lastActivity: "2026-09-10T14:20:00Z",
    tags: ["stm32", "exti", "hal-driver", "interrupt", "f401"],
  },
  {
    id: "thread-zephyr-roadmap",
    title: "Kinh nghiệm chuyển dịch từ FreeRTOS sang Zephyr RTOS cho các dự án IoT Công Nghiệp",
    category: "embedded-mcu",
    flair: "chia-se",
    author: "Hoàng Nam",
    authorId: "usr_superadmin",
    authorRole: "superadmin",
    authorAvatar: "🛡️",
    authorTitle: "Kỹ sư Firmware",
    content: `Sau thời gian dài triển khai các Gateway quan trắc môi trường và thiết bị truyền tin LoRaWAN, mình đã quyết định chuyển dần codebase từ FreeRTOS sang **Zephyr RTOS**.
Dưới đây là một số đúc kết quan trọng dành cho các bạn quan tâm đến kiến trúc firmware hiện đại:

1. **Device Tree (DTS)**: Giúp tách rời hoàn toàn mã nguồn driver khỏi phần cứng vật lý. Khi đổi chân vi điều khiển, chỉ sửa file DTS mà không cần chạm vào logic nghiệp vụ C.
2. **Kconfig**: Cấu hình tính năng như Linux Kernel, tối ưu bộ nhớ Flash/RAM đến từng byte.
3. **BLE Subsystem & Networking Stack**: Zephyr có stack Bluetooth Mesh và TCP/IP native cực kỳ mạnh mẽ, ổn định hơn nhiều so với việc ghép LwIP thủ công vào FreeRTOS.
4. **Hệ sinh thái West Tool**: Quản lý đa repository tương tự Repo tool của Android.

Anh em quan tâm cùng thảo luận và chia sẻ thêm kinh nghiệm thực tế bên dưới nhé!`,
    codeSnippet: `// Đoạn mẫu tạo Thread trên Zephyr RTOS
#include <zephyr/kernel.h>
#include <zephyr/drivers/gpio.h>

#define STACK_SIZE 1024
#define PRIORITY 7

void sensor_thread(void *dummy1, void *dummy2, void *dummy3) {
  while (1) {
    printk("[Zephyr Community] Reading sensors...\\n");
    k_msleep(1000);
  }
}

K_THREAD_DEFINE(sensor_tid, STACK_SIZE, sensor_thread, NULL, NULL, NULL, PRIORITY, 0, 0);`,
    hasSimulatorPreview: true,
    votes: 98,
    userVote: 1,
    viewsCount: 1420,
    repliesCount: 7,
    reactions: {
      ung: 78,
      gach: 0,
      ung_bung: 45,
      haha: 2,
      nguong_mo: 36,
    },
    userReactions: ["ung", "ung_bung"],
    isPinned: true,
    createdAt: "2026-09-02T10:00:00Z",
    lastActivity: "2026-09-11T08:30:00Z",
    tags: ["zephyr-rtos", "freertos", "iot", "firmware-architecture"],
  },
  {
    id: "thread-tinyml-cam",
    title: "Triển khai mô hình TinyML phân loại khuyết tật bề mặt sản phẩm chạy trên ESP32-S3 Eye",
    category: "aiot-edge",
    flair: "do-an",
    author: "Trần Minh Quang",
    authorId: "usr_labmember",
    authorRole: "lab_member",
    authorAvatar: "🔬",
    authorTitle: "Kỹ sư AIoT",
    content: `Chào mọi người! Mình vừa hoàn thành module nhận diện lỗi cơ khí tự động trên băng chuyền thu nhỏ:
- **Hardware**: ESP32-S3 (8MB PSRAM, camera OV2640).
- **Mô hình**: MobileNetV2 thu gọn (Quantized INT8), huấn luyện bằng Edge Impulse Studio và xuất file C++ library.
- **Tốc độ suy luận (Inference Time)**: ~85ms/frame (tương đương 11 FPS) nhờ tập lệnh tăng tốc SIMD Vector Instructions của ESP32-S3!
- **Độ chính xác**: 94.6% trên tập dữ liệu 1500 mẫu chi tiết cơ khí.`,
    codeSnippet: `// Gọi suy luận INT8 trực tiếp trên ESP32-S3
signal_t signal;
signal.total_length = EI_CLASSIFIER_INPUT_FRAMES;
signal.get_data = &raw_feature_get_data;

ei_impulse_result_t result = { 0 };
EI_IMPULSE_ERROR r = run_classifier(&signal, &result, false);
if (r == EI_IMPULSE_OK) {
  printf("Defect Class: %s (Confidence: %.2f%%)\\n", 
         result.classification[1].label, 
         result.classification[1].value * 100.0f);
}`,
    hasSimulatorPreview: false,
    votes: 65,
    userVote: 0,
    viewsCount: 890,
    repliesCount: 5,
    reactions: {
      ung: 48,
      gach: 0,
      ung_bung: 29,
      haha: 1,
      nguong_mo: 22,
    },
    userReactions: [],
    isPinned: false,
    createdAt: "2026-09-05T14:40:00Z",
    lastActivity: "2026-09-10T16:15:00Z",
    tags: ["tinyml", "esp32-s3", "edge-impulse", "computer-vision", "aiot"],
  },
  {
    id: "thread-pcb-emc",
    title: "Bẫy thiết kế PCB nguồn xung DC-DC Buck Converter khiến mạch bị nhiễu EMI nặng",
    category: "hardware-pcb",
    flair: "chia-se",
    author: "Hoàng Đức Anh",
    authorId: "usr_hardware",
    authorRole: "user",
    authorAvatar: "⚡",
    authorTitle: "Kỹ sư Thiết kế Phần cứng",
    content: `Chào các bạn đam mê layout mạch phần cứng!
Vừa rồi mình đo kiểm một bo mạch STM32 dùng IC nguồn Buck MP2307 hạ từ 12V xuống 3.3V. Vi điều khiển cứ thỉnh thoảng bị reset ngẫu nhiên khi cắm tải RF.
Sau khi soi kính lúp và quét quang phổ thì phát hiện 3 lỗi kinh điển:
1. **Vòng lặp High di/dt Loop (Vòng lặp dòng xung) quá rộng**: Tụ lọc đầu vào Cin đặt quá xa IC, tạo thành ăng-ten bức xạ sóng nhiễu sang đường SW.
2. **Đường hồi tiếp Feedback (FB) đi qua dưới cuộn cảm**: Cuộn cảm tạo từ trường biến thiên cảm ứng nhiễu trực tiếp vào chân FB cực kỳ nhạy cảm.
3. **Mặt đất (GND) bị chia cắt nham nhở**: Không có đường dẫn dòng về liên tục (Solid Return Path).

Khắc phục: Thu nhỏ tối đa vòng lặp Cin - Top FET - Inductor, bọc đường FB bằng Ground Shielding. Bo mạch sau khi redesign chạy êm ru không một gợn sóng!`,
    hasSimulatorPreview: false,
    votes: 82,
    userVote: 0,
    viewsCount: 1120,
    repliesCount: 6,
    reactions: {
      ung: 70,
      gach: 0,
      ung_bung: 34,
      haha: 0,
      nguong_mo: 25,
    },
    userReactions: [],
    isPinned: false,
    createdAt: "2026-09-04T08:20:00Z",
    lastActivity: "2026-09-09T11:05:00Z",
    tags: ["altium", "pcb-design", "emc-emi", "buck-converter", "hardware"],
  },
  {
    id: "thread-interview-experience",
    title: "Tổng hợp kinh nghiệm phỏng vấn Embedded Firmware Engineer tại các công ty công nghệ",
    category: "f17-b9",
    flair: "thao-luan",
    author: "Vũ Hải Đăng",
    authorId: "usr_alumni",
    authorRole: "user",
    authorAvatar: "💼",
    authorTitle: "Senior Firmware Developer",
    content: `Chào các bạn đam mê lập trình nhúng!
Hôm nay rảnh rỗi mình viết một bài tổng hợp lại các câu hỏi phỏng vấn vị trí Firmware / Embedded C mà anh em trong ngành thường gặp:

**Vòng 1: Kiến thức C cốt lõi (C Core)**
- Con trỏ hàm (Function Pointer) và cách cài đặt State Machine hoặc Callback Driver.
- Từ khóa \`volatile\`: Bản chất ngăn compiler optimize thanh ghi phần cứng và biến chia sẻ giữa Interrupt & Main loop.
- Memory Layout: Stack, Heap, BSS, Data, Text segment và hiện tượng tràn Stack (Stack Overflow).
- Thao tác Bitwise: Bật, tắt, toggle và đọc trạng thái bit trên thanh ghi SFR mà không làm ảnh hưởng các bit khác.

**Vòng 2: Kiến trúc Vi điều khiển & RTOS**
- Phân biệt Semaphore nhị phân vs Mutex (Hiện tượng Đảo ngược mức ưu tiên - Priority Inversion & Priority Inheritance).
- Cơ chế DMA (Direct Memory Access) và xử lý ngắt Half-Transfer / Transfer-Complete.
- Trình bày một sự cố khó nhất từng debug bằng Logic Analyzer hoặc J-Link Ozone.

Các bạn có câu hỏi nào cứ bình luận bên dưới chúng ta cùng thảo luận nhé!`,
    hasSimulatorPreview: false,
    votes: 115,
    userVote: 1,
    viewsCount: 2350,
    repliesCount: 12,
    reactions: {
      ung: 95,
      gach: 0,
      ung_bung: 62,
      haha: 5,
      nguong_mo: 58,
    },
    userReactions: ["ung", "nguong_mo"],
    isPinned: false,
    createdAt: "2026-09-01T20:00:00Z",
    lastActivity: "2026-09-11T12:00:00Z",
    tags: ["phong-van", "kinh-nghiem", "embedded-c", "rtos", "career"],
  },
];

const DEFAULT_COMMENTS: DiscussionComment[] = [
  {
    id: "comment-exti-1",
    threadId: "thread-exti-stm32f4",
    author: "Hoàng Nam",
    authorId: "usr_superadmin",
    authorRole: "superadmin",
    authorAvatar: "🛡️",
    authorTitle: "Kỹ sư Firmware",
    content: `Chào Cường, khả năng rất cao là bạn quên bật Clock cho khối **SYSCFG** (System Configuration Controller).
Trên STM32F4, để map chân PB0 vào EXTI0 Line, vi điều khiển sử dụng thanh ghi \`SYSCFG_EXTICR1\`. Nếu chưa gọi lệnh:
\`\`\`c
__HAL_RCC_SYSCFG_CLK_ENABLE();
\`\`\`
thì đường ngắt EXTI0 vẫn mặc định nối với chân PA0 chứ không phải PB0! Bạn kiểm tra lại xem trong hàm Init đã có macro này chưa nhé!`,
    votes: 18,
    userVote: 1,
    reactions: { ung: 14, gach: 0, ung_bung: 8 },
    createdAt: "2026-09-08T10:05:00Z",
  },
  {
    id: "comment-exti-2",
    threadId: "thread-exti-stm32f4",
    author: "Quang Cường",
    authorId: "usr_cuong_d21",
    authorRole: "user",
    authorAvatar: "👨‍💻",
    authorTitle: "Thành viên Cộng đồng",
    quoteAuthor: "Hoàng Nam",
    quoteContent: "Chào Cường, khả năng rất cao là bạn quên bật Clock cho khối SYSCFG...",
    content: `Mình đã thêm lệnh \`__HAL_RCC_SYSCFG_CLK_ENABLE()\` vào trước cấu hình và ngắt đã nhảy vào callback chính xác rồi bạn ơi! Cảm ơn bạn rất nhiều vì đã hỗ trợ kịp thời!`,
    votes: 9,
    userVote: 0,
    reactions: { ung: 7, gach: 0, ung_bung: 5 },
    createdAt: "2026-09-08T10:45:00Z",
  },
  {
    id: "comment-zephyr-1",
    threadId: "thread-zephyr-roadmap",
    author: "Tuấn Anh",
    authorId: "usr_student",
    authorRole: "user",
    authorAvatar: "🎓",
    authorTitle: "Thành viên",
    content: `Cảm ơn bạn vì bài viết rất tâm huyết! Bạn cho mình hỏi Zephyr có hỗ trợ tốt việc debug dòng tiêu thụ (Power Management / Low Power mode) trên các chip nRF52 hoặc STM32L4 không?`,
    votes: 12,
    userVote: 0,
    reactions: { ung: 9, gach: 0, ung_bung: 4 },
    createdAt: "2026-09-02T14:30:00Z",
  },
];

export function getDiscussionThreads(): DiscussionThread[] {
  if (typeof window === "undefined") return DEFAULT_THREADS;
  try {
    const data = safeStorage.getItem(STORAGE_THREADS_KEY);
    if (!data) {
      safeStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(DEFAULT_THREADS));
      return DEFAULT_THREADS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_THREADS;
  }
}

export function saveDiscussionThreads(threads: DiscussionThread[]): void {
  if (typeof window === "undefined") return;
  safeStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(threads));
}

export function getDiscussionComments(threadId?: string): DiscussionComment[] {
  if (typeof window === "undefined") return DEFAULT_COMMENTS;
  try {
    const data = safeStorage.getItem(STORAGE_COMMENTS_KEY);
    const comments: DiscussionComment[] = data ? JSON.parse(data) : DEFAULT_COMMENTS;
    if (threadId) {
      return comments.filter((c) => c.threadId === threadId);
    }
    return comments;
  } catch {
    return DEFAULT_COMMENTS;
  }
}

export function saveDiscussionComments(comments: DiscussionComment[]): void {
  if (typeof window === "undefined") return;
  safeStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
}

export function getThreadById(id: string): DiscussionThread | null {
  const threads = getDiscussionThreads();
  return threads.find((t) => t.id === id) || null;
}

export function incrementThreadViews(threadId: string): void {
  const threads = getDiscussionThreads();
  const updated = threads.map((t) => {
    if (t.id === threadId) {
      return { ...t, viewsCount: t.viewsCount + 1 };
    }
    return t;
  });
  saveDiscussionThreads(updated);
}

export interface CreateThreadParams {
  title: string;
  category?: CategoryId;
  flair: FlairType;
  content: string;
  codeSnippet?: string;
  attachedFiles?: AttachedFile[];
  hasSimulatorPreview?: boolean;
  simulatorCode?: string;
  tags?: string[];
  author: {
    id: string;
    name: string;
    role?: UserRole;
    avatar?: string;
    bio?: string;
  };
}

export function createDiscussionThread(params: CreateThreadParams): DiscussionThread {
  const threads = getDiscussionThreads();
  const id = `thread-${Date.now()}`;
  const now = new Date().toISOString();

  let authorTitle = "Thành viên";
  if (params.author.role === "superadmin") authorTitle = "Quản trị viên";
  else if (params.author.role === "admin") authorTitle = "Điều hành viên";
  else if (params.author.role === "lab_member") authorTitle = "Thành viên tích cực";
  else authorTitle = "Thành viên";

  const newThread: DiscussionThread = {
    id,
    title: params.title.trim(),
    category: params.category || "embedded-mcu",
    flair: params.flair,
    author: params.author.name,
    authorId: params.author.id,
    authorRole: params.author.role,
    authorAvatar: params.author.avatar || "👤",
    authorTitle,
    content: params.content.trim(),
    codeSnippet: params.codeSnippet?.trim() || undefined,
    attachedFiles: params.attachedFiles || [],
    hasSimulatorPreview: Boolean(params.hasSimulatorPreview),
    simulatorCode: params.simulatorCode,
    votes: 1,
    userVote: 1,
    viewsCount: 1,
    repliesCount: 0,
    reactions: {
      ung: 1,
      gach: 0,
      ung_bung: 0,
      haha: 0,
      nguong_mo: 0,
    },
    userReactions: ["ung"],
    isPinned: false,
    createdAt: now,
    lastActivity: now,
    tags: params.tags && params.tags.length > 0 ? params.tags : ["thao-luan"],
  };

  const updated = [newThread, ...threads];
  saveDiscussionThreads(updated);
  return newThread;
}

export function voteDiscussionThread(threadId: string, direction: 1 | -1): DiscussionThread | null {
  const threads = getDiscussionThreads();
  let updatedThread: DiscussionThread | null = null;

  const updated = threads.map((t) => {
    if (t.id === threadId) {
      const currentVote = t.userVote || 0;
      let newVote: 1 | -1 | 0 = direction;
      let diff = 0;

      if (currentVote === direction) {
        newVote = 0;
        diff = -direction;
      } else if (currentVote === 0) {
        diff = direction;
      } else {
        diff = direction * 2;
      }

      updatedThread = {
        ...t,
        votes: t.votes + diff,
        userVote: newVote,
      };
      return updatedThread;
    }
    return t;
  });

  saveDiscussionThreads(updated);
  return updatedThread;
}

export function reactDiscussionThread(threadId: string, reaction: VozReactionType): DiscussionThread | null {
  const threads = getDiscussionThreads();
  let updatedThread: DiscussionThread | null = null;

  const updated = threads.map((t) => {
    if (t.id === threadId) {
      const userReactions = [...(t.userReactions || [])];
      const reactions = { ...t.reactions };

      const hasReacted = userReactions.includes(reaction);
      if (hasReacted) {
        reactions[reaction] = Math.max(0, reactions[reaction] - 1);
        const filtered = userReactions.filter((r) => r !== reaction);
        updatedThread = { ...t, reactions, userReactions: filtered };
      } else {
        reactions[reaction] = (reactions[reaction] || 0) + 1;
        updatedThread = { ...t, reactions, userReactions: [...userReactions, reaction] };
      }
      return updatedThread;
    }
    return t;
  });

  saveDiscussionThreads(updated);
  return updatedThread;
}

export interface CreateCommentParams {
  threadId: string;
  content: string;
  quoteContent?: string;
  quoteAuthor?: string;
  author: {
    id: string;
    name: string;
    role?: UserRole;
    avatar?: string;
  };
}

export function createDiscussionComment(params: CreateCommentParams): DiscussionComment {
  const comments = getDiscussionComments();
  const threads = getDiscussionThreads();
  const id = `comment-${Date.now()}`;
  const now = new Date().toISOString();

  let authorTitle = "Thành viên";
  if (params.author.role === "superadmin") authorTitle = "Quản trị viên";
  else if (params.author.role === "admin") authorTitle = "Điều hành viên";
  else if (params.author.role === "lab_member") authorTitle = "Thành viên tích cực";

  const newComment: DiscussionComment = {
    id,
    threadId: params.threadId,
    author: params.author.name,
    authorId: params.author.id,
    authorRole: params.author.role,
    authorAvatar: params.author.avatar || "👤",
    authorTitle,
    content: params.content.trim(),
    quoteContent: params.quoteContent,
    quoteAuthor: params.quoteAuthor,
    votes: 0,
    userVote: 0,
    reactions: { ung: 0, gach: 0, ung_bung: 0 },
    createdAt: now,
  };

  const updatedComments = [...comments, newComment];
  saveDiscussionComments(updatedComments);

  const updatedThreads = threads.map((t) => {
    if (t.id === params.threadId) {
      return {
        ...t,
        repliesCount: t.repliesCount + 1,
        lastActivity: now,
      };
    }
    return t;
  });
  saveDiscussionThreads(updatedThreads);

  return newComment;
}

export function deleteDiscussionThread(threadId: string): boolean {
  const threads = getDiscussionThreads();
  const filteredThreads = threads.filter((t) => t.id !== threadId);
  if (filteredThreads.length === threads.length) return false;

  saveDiscussionThreads(filteredThreads);

  // Xóa luôn các bình luận thuộc về thread này
  const comments = getDiscussionComments();
  const filteredComments = comments.filter((c) => c.threadId !== threadId);
  saveDiscussionComments(filteredComments);

  return true;
}

export function deleteDiscussionComment(commentId: string): boolean {
  const comments = getDiscussionComments();
  const targetComment = comments.find((c) => c.id === commentId);
  if (!targetComment) return false;

  const filteredComments = comments.filter((c) => c.id !== commentId);
  saveDiscussionComments(filteredComments);

  // Giảm số repliesCount của thread
  const threads = getDiscussionThreads();
  const updatedThreads = threads.map((t) => {
    if (t.id === targetComment.threadId) {
      return {
        ...t,
        repliesCount: Math.max(0, t.repliesCount - 1),
      };
    }
    return t;
  });
  saveDiscussionThreads(updatedThreads);

  return true;
}
