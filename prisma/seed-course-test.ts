import prisma from "../src/lib/prisma";

async function main() {
  const courseData = {
    title: "Lập Trình C/C++ Chuyên Sâu Cho Hệ Thống Nhúng & Vi Điều Khiển",
    slug: "lap-trinh-c-cpp-chuyen-sau-cho-he-thong-nhung",
    description:
      "Khoá học trang bị tư duy quản lý bộ nhớ, con trỏ hàm, bitwise, volatile, struct packing, thanh ghi ngoại vi và OOP trong C++ tối ưu cho ARM Cortex-M (STM32/ESP32).",
    level: "advanced",
    category: "embedded-rtos",
    duration: "35 giờ",
    price: "free",
    thumbnail: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=600&q=80",
    githubRepo: "https://github.com/embedded-aiot-ptit/embedded-c-cpp-mastery",
    featured: true,
  };

  // Upsert course
  const existing = await prisma.course.findUnique({
    where: { slug: courseData.slug },
  });

  if (existing) {
    await prisma.course.delete({ where: { id: existing.id } });
  }

  const created = await prisma.course.create({
    data: {
      ...courseData,
      modules: {
        create: [
          {
            module: "Học phần 1: Quản Lý Phân Vùng Bộ Nhớ & Thao Tác Bitwise Thanh Ghi",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Bài 1: Kiến trúc phân vùng nhớ (Flash, SRAM, Stack, Heap) & Bitmasking",
                  slug: "bai-1-kien-truc-phan-vung-nho-va-bitmasking",
                  duration: "45 phút",
                  free: true,
                  summary:
                    "Tìm hiểu cách CPU ARM Cortex-M nạp chương trình, bản đồ bộ nhớ Vector Table, phân tích Stack vs Heap và thực hành Set/Clear/Toggle bit trên thanh ghi GPIO.",
                  contentHtml: `
                    <h3>🎯 Mục tiêu bài học</h3>
                    <p>Trong bài mở đầu này, kỹ sư sẽ hiểu rõ bản chất vật lý của từng phân vùng bộ nhớ trên vi điều khiển và phương pháp truy xuất trực tiếp địa chỉ phần cứng bằng con trỏ trong ngôn ngữ C chuẩn công nghiệp.</p>
                    
                    <h3>1. Bản đồ bộ nhớ Vi điều khiển ARM Cortex-M (Memory Map)</h3>
                    <ul>
                      <li><strong>Flash ROM (0x08000000):</strong> Chứa mã thực thi (.text), bảng Vector Table và dữ liệu hằng số const (.rodata).</li>
                      <li><strong>SRAM (0x20000000):</strong> Chứa biến toàn cục đã khởi tạo (.data), biến chưa khởi tạo (.bss), vùng Heap và Stack.</li>
                      <li><strong>Peripherals Bus (0x40000000):</strong> Vùng địa chỉ ánh xạ các thanh ghi ngoại vi (GPIO, UART, SPI, I2C, Timer).</li>
                    </ul>

                    <h3>2. Kỹ thuật thao tác Bitmask trên thanh ghi</h3>
                    <pre><code class="language-c">
// Định nghĩa địa chỉ thanh ghi GPIOA_ODR (Output Data Register)
#define GPIOA_BASE        (0x40020000UL)
#define GPIOA_ODR_OFFSET  (0x14UL)
#define GPIOA_ODR         (*(volatile uint32_t *)(GPIOA_BASE + GPIOA_ODR_OFFSET))

// Set bit 5 (Bật LED PA5)
GPIOA_ODR |= (1UL << 5);

// Clear bit 5 (Tắt LED PA5)
GPIOA_ODR &= ~(1UL << 5);

// Toggle bit 5 (Đảo trạng thái LED PA5)
GPIOA_ODR ^= (1UL << 5);
                    </code></pre>

                    <h3>3. Ý nghĩa tối quan trọng của từ khóa <code>volatile</code></h3>
                    <p>Từ khóa <code>volatile</code> báo cho trình biên dịch GCC không được tối ưu hóa (optimize out) việc đọc/ghi thanh ghi, bắt buộc CPU phải truy xuất trực tiếp vào địa chỉ phần cứng tại mỗi chu kỳ lệnh.</p>
                  `,
                  codeSnippet: `#include <stdint.h>\n\n#define RCC_AHB1ENR (*(volatile uint32_t *)0x40023830UL)\n#define GPIOA_MODER  (*(volatile uint32_t *)0x40020000UL)\n#define GPIOA_ODR    (*(volatile uint32_t *)0x40020014UL)\n\nvoid delay_ms(volatile uint32_t count) {\n    while (count--) { __asm__("nop"); }\n}\n\nint main(void) {\n    // Bật clock GPIOA\n    RCC_AHB1ENR |= (1UL << 0);\n    // Cấu hình PA5 làm Output\n    GPIOA_MODER |= (1UL << 10);\n    \n    while (1) {\n        GPIOA_ODR ^= (1UL << 5); // Toggle LED\n        delay_ms(500000);\n    }\n}`,
                  order: 1,
                },
                {
                  title: "Bài 2: Con trỏ hàm (Function Pointer) & Xây dựng Bảng Hàm Điều Khiển (Driver vtable)",
                  slug: "bai-2-con-tro-ham-va-bang-ham-dieu-khien",
                  duration: "50 phút",
                  free: false,
                  summary: "Áp dụng con trỏ hàm để hiện thực kiến trúc hướng đối tượng C thuần, lập trình Callback ngắt và viết HAL Driver tách biệt lớp phần cứng.",
                  order: 2,
                },
              ],
            },
          },
          {
            module: "Học phần 2: Tối Ưu Cấu Trúc Struct & Lập Trình Driver Ngoại Vi",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Bài 3: Cấu trúc Struct Alignment, Padding và Bitfield trong C",
                  slug: "bai-3-struct-alignment-padding-bitfield",
                  duration: "40 phút",
                  free: false,
                  summary: "Cách trình biên dịch căn chỉnh ô nhớ 32-bit, sử dụng __attribute__((packed)) cho giao thức truyền nhận và ánh xạ Struct trực tiếp lên Register.",
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      modules: {
        include: { lessons: true },
      },
    },
  });

  console.log("✅ Đã tạo thành công khóa học:", created.title);
  console.log("👉 Slug:", created.slug);
  console.log("👉 Số học phần:", created.modules.length);
  console.log("👉 Số bài học:", created.modules.reduce((sum, m) => sum + m.lessons.length, 0));
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
