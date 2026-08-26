/**
 * Embedded-AIoT Lab - Technical Tutorials & Knowledge Base Hub
 * Lấy cảm hứng từ cấu trúc chuyên sâu của EmbeTronicX
 */

export interface TutorialPost {
  slug: string;
  title: string;
  order: number;
  readTime: string;
  updatedAt: string;
  summary: string;
  contentHtml: string;
  codeSnippet?: {
    code: string;
    language: string;
    filename: string;
  };
  tags?: string[];
}

export interface TutorialTopic {
  id: string;
  slug: string;
  title: string;
  category: "linux" | "rtos" | "automotive" | "mcu" | "programming" | "hardware";
  categoryName: string;
  icon: string;
  badge: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  totalArticles: number;
  author: string;
  authorTitle: string;
  authorAvatar?: string;
  coverImage?: string;
  posts: TutorialPost[];
}

export const TUTORIAL_CATEGORIES = [
  { id: "all", label: "Tất cả chuyên đề", icon: "📚" },
  { id: "linux", label: "Embedded Linux & Kernel", icon: "🐧" },
  { id: "rtos", label: "Real-Time OS (RTOS)", icon: "⚡" },
  { id: "automotive", label: "Automotive & CAN/UDS", icon: "🚗" },
  { id: "mcu", label: "Vi Điều Khiển & SoC", icon: "🎛️" },
  { id: "programming", label: "Lập Trình C & Kỹ Năng", icon: "💻" },
  { id: "hardware", label: "Phần Cứng PCB & FPGA", icon: "📐" },
];

export const TUTORIAL_TOPICS: TutorialTopic[] = [
  // 1. LINUX DEVICE DRIVER
  {
    id: "linux-device-driver",
    slug: "linux-device-driver-tutorials",
    title: "Linux Device Driver & Kernel Programming",
    category: "linux",
    categoryName: "Embedded Linux",
    icon: "🐧",
    badge: "Hot Series",
    level: "Advanced",
    description: "Giáo trình phát triển Trình điều khiển thiết bị (Device Driver) trên nhân Linux: Character Driver, Platform Device, Device Tree, I2C/SPI Subsystem và Interrupt Handling.",
    totalArticles: 8,
    author: "Kỹ sư Lab PTIT",
    authorTitle: "Linux Kernel Specialist",
    coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
    posts: [
      {
        slug: "bai-1-tong-quan-kien-truc-linux-kernel-va-module",
        title: "Bài 1: Kiến trúc Linux Kernel & Khởi tạo Kernel Module đầu tiên",
        order: 1,
        readTime: "12 phút",
        updatedAt: "2026-08-20",
        summary: "Tìm hiểu không gian Kernel Space vs User Space, cấu trúc một Loadable Kernel Module (LKM), viết init/exit function và biên dịch Makefile.",
        codeSnippet: {
          language: "c",
          filename: "hello_module.c",
          code: `#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Embedded-AIoT Lab PTIT");
MODULE_DESCRIPTION("A Simple Hello World Linux Kernel Module");
MODULE_VERSION("1.0");

static int __init lab_module_init(void) {
    pr_info("Embedded-AIoT Lab: Kernel Module Initialized Successfully!\\n");
    return 0;
}

static void __exit lab_module_exit(void) {
    pr_info("Embedded-AIoT Lab: Kernel Module Exited!\\n");
}

module_init(lab_module_init);
module_exit(lab_module_exit);`,
        },
        contentHtml: `
          <h2>1. Tổng quan Kiến Trúc Linux Kernel</h2>
          <p>Hệ điều hành Linux phân chia bộ nhớ thành hai vùng đặc quyền nghiêm ngặt:</p>
          <ul>
            <li><strong>User Space:</strong> Nơi các ứng dụng người dùng chạy ở chế độ Ring 3 (Unprivileged mode), không được can thiệp trực tiếp vào thanh ghi phần cứng.</li>
            <li><strong>Kernel Space:</strong> Vùng không gian lõi chạy ở chế độ Ring 0 (Privileged mode), toàn quyền truy cập bộ nhớ và phần cứng ngoại vi.</li>
          </ul>

          <h2>2. Loadable Kernel Module (LKM) là gì?</h2>
          <p>LKM cho phép chúng ta nạp thêm hoặc gỡ bỏ các đoạn mã trình điều khiển vào trực tiếp Kernel đang chạy mà <strong>không cần phải khởi động lại hệ thống</strong> hoặc biên dịch lại toàn bộ nhân Linux.</p>

          <h2>3. Lệnh Thao Tác Với Module Trên Terminal</h2>
          <p>Sau khi biên dịch ra file <code>hello_module.ko</code>, sử dụng các lệnh chuẩn sau:</p>
          <ul>
            <li><code>sudo insmod hello_module.ko</code>: Nạp module vào Kernel.</li>
            <li><code>dmesg | tail -n 10</code>: Xem log in ra từ hàm <code>pr_info()</code>.</li>
            <li><code>lsmod | grep hello</code>: Kiểm tra trạng thái nạp của module.</li>
            <li><code>sudo rmmod hello_module</code>: Gỡ bỏ module khỏi Kernel.</li>
          </ul>
        `,
      },
      {
        slug: "bai-2-lap-trinh-character-device-driver-major-minor-number",
        title: "Bài 2: Lập trình Character Driver, Phân bổ Major & Minor Number",
        order: 2,
        readTime: "18 phút",
        updatedAt: "2026-08-22",
        summary: "Phân bổ động số Major/Minor với alloc_chrdev_region, khởi tạo cdev structure, triển khai file_operations (open, read, write, release).",
        codeSnippet: {
          language: "c",
          filename: "char_driver.c",
          code: `#include <linux/init.h>
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/uaccess.h>

#define DRIVER_NAME "lab_char_dev"
static dev_t dev_num;
static struct cdev my_cdev;

static int dev_open(struct inode *in, struct file *f) {
    pr_info("Device: Opened\\n");
    return 0;
}

static int dev_release(struct inode *in, struct file *f) {
    pr_info("Device: Closed\\n");
    return 0;
}

static struct file_operations fops = {
    .owner   = THIS_MODULE,
    .open    = dev_open,
    .release = dev_release,
};

static int __init char_init(void) {
    alloc_chrdev_region(&dev_num, 0, 1, DRIVER_NAME);
    cdev_init(&my_cdev, &fops);
    cdev_add(&my_cdev, dev_num, 1);
    pr_info("Driver Registered: Major=%d, Minor=%d\\n", MAJOR(dev_num), MINOR(dev_num));
    return 0;
}

static void __exit char_exit(void) {
    cdev_del(&my_cdev);
    unregister_chrdev_region(dev_num, 1);
    pr_info("Driver Unregistered!\\n");
}

module_init(char_init);
module_exit(char_exit);
MODULE_LICENSE("GPL");`,
        },
        contentHtml: `
          <h2>1. Bản Chất Của Major & Minor Number Trong Linux</h2>
          <p>Trong Linux, mọi thiết bị phần cứng đều được trừu tượng hóa dưới dạng tập tin trong thư mục <code>/dev/</code>:</p>
          <ul>
            <li><strong>Major Number:</strong> Xác định Trình điều khiển (Driver) nào trong Kernel sẽ phụ trách xử lý thiết bị.</li>
            <li><strong>Minor Number:</strong> Phân biệt giữa các thiết bị cụ thể sử dụng chung Driver đó.</li>
          </ul>

          <h2>2. Cấu Trúc <code>file_operations</code> (VFS Bridge)</h2>
          <p>Là cây cầu kết nối giữa các System Call trong User Space (như <code>open()</code>, <code>read()</code>, <code>write()</code>, <code>ioctl()</code>) với các hàm xử lý nội bộ trong Driver.</p>
        `,
      },
      {
        slug: "bai-3-giao-tiep-user-space-kernel-space-copy-to-user",
        title: "Bài 3: Truyền nhận dữ liệu User Space & Kernel Space với copy_to_user",
        order: 3,
        readTime: "15 phút",
        updatedAt: "2026-08-24",
        summary: "Bảo vệ an toàn bộ nhớ nhân, chuyển đổi buffer an toàn giữa user application và kernel buffer.",
        contentHtml: `
          <h2>Tại sao không thể dùng con trỏ trực tiếp?</h2>
          <p>Không gian địa chỉ ảo của User Space và Kernel Space hoàn toàn độc lập và có bảng phân trang (Page Table) riêng. Sử dụng con trỏ User Space trong Kernel mà không kiểm tra sẽ gây ra lỗi Kernel Panic!</p>
          <p>Linux cung cấp hai hàm chuẩn:</p>
          <ul>
            <li><code>copy_from_user(void *to, const void __user *from, unsigned long n)</code></li>
            <li><code>copy_to_user(void __user *to, const void *from, unsigned long n)</code></li>
          </ul>
        `,
      },
    ],
  },

  // 2. FREERTOS MASTERY
  {
    id: "freertos-architecture",
    slug: "freertos-tutorials",
    title: "FreeRTOS Chuyên Sâu Cho STM32 & ESP32",
    category: "rtos",
    categoryName: "Real-Time OS",
    icon: "⚡",
    badge: "Core Subject",
    level: "Intermediate",
    description: "Khám phá thuật toán lập lịch Preemptive Scheduler, Task Context Switching, Đồng bộ hóa với Semaphore/Mutex, Queue IPC, Event Groups và Memory Management trong RTOS.",
    totalArticles: 10,
    author: "Kỹ sư Lab PTIT",
    authorTitle: "RTOS Firmware Engineer",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    posts: [
      {
        slug: "bai-1-kien-truc-freertos-va-co-che-task-scheduling",
        title: "Bài 1: Kiến trúc FreeRTOS & Cơ chế lập lịch Task (Scheduler & Context Switch)",
        order: 1,
        readTime: "14 phút",
        updatedAt: "2026-08-18",
        summary: "Hiểu rõ vòng đời Task (Ready, Running, Blocked, Suspended), ngắt SysTick Timer, quá trình lưu/phục hồi Context Stack của vi điều khiển ARM Cortex-M.",
        codeSnippet: {
          language: "c",
          filename: "main_freertos.c",
          code: `#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

void vTaskLED(void *pvParameters) {
    for (;;) {
        printf("[Task 1] LED Blinking at Priority %d\\n", (int)uxTaskPriorityGet(NULL));
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

void vTaskSensor(void *pvParameters) {
    for (;;) {
        printf("[Task 2] Reading Sensor Telemetry...\\n");
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}

void app_main(void) {
    xTaskCreate(vTaskLED, "LED_Task", 2048, NULL, 2, NULL);
    xTaskCreate(vTaskSensor, "Sensor_Task", 2048, NULL, 1, NULL);
    printf("FreeRTOS Scheduler Initialized!\\n");
}`,
        },
        contentHtml: `
          <h2>1. Khái Niệm Hệ Điều Hành Thời Gian Thực (RTOS)</h2>
          <p>Khác với hệ điều hành thông thường (General Purpose OS) như Windows/Linux hướng tới tối ưu thông lượng đa người dùng, RTOS đặt tính <strong>tất định về mặt thời gian (Deterministic Latency)</strong> lên hàng đầu.</p>

          <h2>2. Bốn Trạng Thái Của Task Trong FreeRTOS</h2>
          <ul>
            <li><strong>Running:</strong> Task đang được CPU thực thi lệnh.</li>
            <li><strong>Ready:</strong> Task đã sẵn sàng chạy nhưng đang chờ CPU (do có task ưu tiên cao hơn đang chạy).</li>
            <li><strong>Blocked:</strong> Task đang chờ một sự kiện (hết thời gian Delay, có dữ liệu trong Queue, hoặc chờ Mutex).</li>
            <li><strong>Suspended:</strong> Task bị tạm ngưng hoàn toàn bằng hàm <code>vTaskSuspend()</code>.</li>
          </ul>
        `,
      },
      {
        slug: "bai-2-hang-doi-queue-va-dong-bo-tien-trinh-ipc",
        title: "Bài 2: Hàng đợi Queue & Giao tiếp liên tiến trình (Inter-Process Communication)",
        order: 2,
        readTime: "16 phút",
        updatedAt: "2026-08-21",
        summary: "Truyền dữ liệu an toàn giữa các Task không bị xung đột, thiết kế Producer-Consumer Pattern với FreeRTOS Queue.",
        contentHtml: `
          <h2>Nguyên lý hoạt động của Queue</h2>
          <p>Queue trong FreeRTOS hoạt động theo cơ chế FIFO (First In First Out), dữ liệu được truyền theo hình thức <strong>Copy by Value</strong> (hoặc truyền con trỏ pointer cho các gói tin dung lượng lớn).</p>
        `,
      },
    ],
  },

  // 3. AUTOMOTIVE & VEHICLE PROTOCOLS
  {
    id: "automotive-protocols",
    slug: "automotive-uds-can-tutorials",
    title: "Automotive Protocols (CAN, UDS ISO 14229, AUTOSAR)",
    category: "automotive",
    categoryName: "Automotive & EV",
    icon: "🚗",
    badge: "Industry Focus",
    level: "Advanced",
    description: "Bộ chuyên đề tiêu chuẩn công nghiệp Ô tô: Giao thức chẩn đoán UDS (Unified Diagnostic Services), mạng CAN/CAN-FD, Viết Custom OTA Bootloader cho ECU và kiến trúc AUTOSAR.",
    totalArticles: 6,
    author: "Kỹ sư Lab PTIT",
    authorTitle: "Automotive Systems Engineer",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    posts: [
      {
        slug: "bai-1-tong-quan-giao-thuc-chan-doan-uds-iso-14229",
        title: "Bài 1: Tổng quan Giao thức Chẩn đoán UDS (ISO 14229) trong Ô tô",
        order: 1,
        readTime: "15 phút",
        updatedAt: "2026-08-19",
        summary: "Phân tích các dịch vụ chẩn đoán Diagnostic Session Control (0x10), Security Access (0x27), Read/Write Data by Identifier (0x22/0x2E).",
        codeSnippet: {
          language: "c",
          filename: "uds_parser.c",
          code: `#include <stdint.h>
#include <stdbool.h>

// UDS Service Identifiers (SID)
#define UDS_SID_DIAGNOSTIC_SESSION_CONTROL   (0x10)
#define UDS_SID_ECU_RESET                    (0x11)
#define UDS_SID_SECURITY_ACCESS              (0x27)
#define UDS_SID_READ_DATA_BY_ID              (0x22)
#define UDS_SID_WRITE_DATA_BY_ID             (0x2E)

typedef struct {
    uint8_t sid;
    uint8_t subFunction;
    uint8_t data[6];
    uint8_t length;
} UDS_Request_t;

void UDS_ProcessRequest(const UDS_Request_t *req) {
    switch (req->sid) {
        case UDS_SID_DIAGNOSTIC_SESSION_CONTROL:
            // Switch session: Default, Programming, Extended
            break;
        case UDS_SID_READ_DATA_BY_ID:
            // Read DID (e.g., VIN, Battery Voltage)
            break;
        default:
            // Send Negative Response (NRC 0x11 - ServiceNotSupported)
            break;
    }
}`,
        },
        contentHtml: `
          <h2>1. UDS (Unified Diagnostic Services) là gì?</h2>
          <p>UDS (tiêu chuẩn ISO 14229) là giao thức chẩn đoán được sử dụng trên hầu hết mọi Hộp điều khiển điện tử (ECU) trong ngành công nghiệp ô tô hiện đại.</p>

          <h2>2. Cấu Trúc Khung Bản Tin UDS</h2>
          <p>Mỗi bản tin UDS Request gửi từ thiết bị chẩn đoán (Tester) tới ECU bao gồm:</p>
          <ul>
            <li><strong>SID (Service Identifier):</strong> 1 byte chỉ định dịch vụ cần gọi (vd <code>0x10</code>, <code>0x22</code>).</li>
            <li><strong>Sub-function:</strong> Byte chỉ định chế độ con (nếu có).</li>
            <li><strong>Data Parameter:</strong> Các tham số phụ tải (Payload).</li>
          </ul>
        `,
      },
    ],
  },

  // 4. STM32 BARE-METAL & HAL
  {
    id: "stm32-firmware-mastery",
    slug: "stm32-bare-metal-tutorials",
    title: "Lập Trình STM32 ARM Cortex-M: Bare-Metal & Register Mapping",
    category: "mcu",
    categoryName: "Microcontrollers",
    icon: "🎛️",
    badge: "Hardware Level",
    level: "Intermediate",
    description: "Học lập trình STM32 từ thanh ghi gốc (Bare-Metal): Cấu hình RCC Clock Tree, GPIO, USART Baudrate Generator, DMA Transfer, Timer PWM và Ngắt NVIC.",
    totalArticles: 12,
    author: "Kỹ sư Lab PTIT",
    authorTitle: "Hardware & Firmware Mentor",
    coverImage: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80",
    posts: [
      {
        slug: "bai-1-cau-hinh-rcc-clock-va-thanh-ghi-gpio-bare-metal",
        title: "Bài 1: Cấu hình RCC Clock Tree & Lập trình Thanh Ghi GPIO STM32",
        order: 1,
        readTime: "15 phút",
        updatedAt: "2026-08-15",
        summary: "Bật xung clock ngoại vi AHB1ENR, cấu hình chế độ MODER, OSPEEDR, PUPDR và điều khiển Output Data Register ODR.",
        codeSnippet: {
          language: "c",
          filename: "stm32f4_gpio.c",
          code: `#include <stdint.h>

// Địa chỉ thanh ghi Base & Offset STM32F4
#define RCC_BASE         (0x40023800UL)
#define RCC_AHB1ENR      (*(volatile uint32_t *)(RCC_BASE + 0x30UL))

#define GPIOA_BASE       (0x40020000UL)
#define GPIOA_MODER      (*(volatile uint32_t *)(GPIOA_BASE + 0x00UL))
#define GPIOA_ODR        (*(volatile uint32_t *)(GPIOA_BASE + 0x14UL))

int main(void) {
    // 1. Cấp xung Clock cho GPIOA trên bus AHB1
    RCC_AHB1ENR |= (1UL << 0);

    // 2. Đặt chân PA5 làm General Purpose Output Mode (01b)
    GPIOA_MODER &= ~(3UL << (5 * 2));
    GPIOA_MODER |=  (1UL << (5 * 2));

    while (1) {
        // Toggle bit 5 (PA5 LED)
        GPIOA_ODR ^= (1UL << 5);
        for (volatile int i = 0; i < 500000; i++);
    }
}`,
        },
        contentHtml: `
          <h2>1. Cây Xung Nhịp RCC (Reset and Clock Control)</h2>
          <p>Trên kiến trúc ARM Cortex-M, mọi khối ngoại vi mặc định đều bị <strong>ngắt xung nhịp (Disabled Clock)</strong> để tiết kiệm năng lượng. Do đó, nguyên tắc số 1 trước khi cấu hình bất kỳ thanh ghi nào là phải bật bit tương ứng trong thanh ghi RCC.</p>
        `,
      },
    ],
  },
];
