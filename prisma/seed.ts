import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_POSTS = [
  {
    title: "📢 [THÔNG BÁO CHÍNH THỨC] MỞ ĐƠN TUYỂN THÀNH VIÊN & CỘNG TÁC VIÊN NGHIÊN CỨU GEN MỚI - EMBEDDED-AIOT LAB (KHOA ĐIỆN TỬ 1 PTIT)",
    slug: "thong-bao-tuyen-thanh-vien-gen-moi-embedded-aiot-lab",
    postType: "recruitment",
    pinned: true,
    featured: true,
    likesCount: 142,
    readingTime: 4,
    tags: "tuyen-thanh-vien,ptit,embedded,aiot,nckh",
    authorName: "Embedded-AIoT Lab PTIT",
    authorTitle: "Ban Chủ Nhiệm Phòng Lab",
    coverImage: "/images/logo.png",
    facebookPostUrl: "https://www.facebook.com/EmbeddedAIoTLAB",
    excerpt: "Embedded-AIoT Lab chính thức mở đơn tuyển thành viên thế hệ mới dành cho sinh viên Khoa Điện Tử 1 & PTIT đam mê Hệ thống nhúng, Linux, TinyML, FPGA và Thiết kế Mạch in Cao tốc!",
    contentHtml: `
<h2>🚀 Về Embedded-AIoT Lab - Khoa Điện Tử 1 PTIT</h2>
<p>Phòng thí nghiệm <strong>Embedded-AIoT Lab</strong> trực thuộc Khoa Điện Tử 1 - Học viện Công nghệ Bưu chính Viễn thông là môi trường nghiên cứu & đào tạo chuyên sâu về:</p>
<ol>
  <li><strong>Embedded Systems & RTOS</strong>: STM32, Zephyr RTOS, FreeRTOS, ESP32, Kiến trúc Firmware.</li>
  <li><strong>Embedded Linux</strong>: Kernel Driver, Yocto Project, BSP, Raspberry Pi / NXP i.MX.</li>
  <li><strong>TinyML & Edge AI</strong>: Lượng tử hóa mô hình INT8, ESP32-S3 Vector ESP-DL, TensorFlow Lite Micro.</li>
  <li><strong>FPGA & ASIC</strong>: Thiết kế vi mạch số bằng Verilog HDL, CPU RISC-V 32-bit trên Xilinx Vivado.</li>
  <li><strong>High-Speed PCB & RF</strong>: Thiết kế mạch in 50Ω với Altium Designer, đo kiểm EMC & VNA Smith Chart.</li>
</ol>

<hr />

<div class="callout callout-tip" style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0; font-weight: 600; color: #10b981;">💡 Quyền Lợi Khi Tham Gia Lab:</p>
  <ul style="margin-top: 8px; margin-bottom: 0;">
    <li>Được làm việc trực tiếp trên <strong>thiết bị mạch thật tại Phòng 502 A3</strong> (Máy hiện sóng, VNA, Máy phân tích phổ, Bộ nạp JTAG Segger, Kit phát triển STM32 / ESP32-S3 / FPGA Zynq).</li>
    <li>Được sự <strong>hướng dẫn 1-1</strong> từ các Thầy Cô giảng viên và các anh chị Kỹ sư nghiên cứu khóa trước.</li>
    <li>Cơ hội tham gia các <strong>Đề tài Nghiên cứu Khoa học sinh viên</strong>, Cuộc thi Sáng tạo Kỹ thuật và đồ án tốt nghiệp xuất sắc.</li>
    <li>Rèn luyện tác phong làm việc chuẩn R&D công nghiệp: Git flow, Clean code, Unit testing và Báo cáo chuyên đề.</li>
  </ul>
</div>

<hr />

<h2>📋 Yêu Cầu & Đối Tượng Tuyển:</h2>
<ul>
  <li>Sinh viên các khóa D22, D23, D24, D25 thuộc Học viện (Ưu tiên các ngành Kỹ thuật Điện tử, IoT, CNTT, Viễn thông).</li>
  <li>Có tinh thần <strong>chủ động, kiên trì, đam mê tìm hiểu phần cứng và lập trình nhúng</strong>.</li>
  <li>Cam kết dành tối thiểu 10 - 15 giờ/tuần sinh hoạt và làm việc tại phòng Lab.</li>
</ul>

<p>👉 <strong>Link Đăng ký phỏng vấn online:</strong> <a href="https://www.facebook.com/EmbeddedAIoTLAB" target="_blank">https://www.facebook.com/EmbeddedAIoTLAB</a></p>
<p>📍 <strong>Địa điểm Lab:</strong> Phòng Thực Hành 502 A3 - Khoa Điện Tử 1, Học viện Công nghệ Bưu chính Viễn thông (Cơ sở Hà Đông).</p>
`,
  },
  {
    title: "🔬 [NHẬT KÝ BÀN ĐO] Buổi Thực Nghiệm Bắn Mạch & Kiểm Tra Ngắt DMA Trên Bo STM32G4 Kết Hợp Zephyr RTOS",
    slug: "nhat-ky-ban-do-thuc-nghiem-stm32g4-zephyr-rtos",
    postType: "daily",
    pinned: false,
    featured: false,
    likesCount: 89,
    readingTime: 3,
    tags: "nhat-ky-lab,stm32,zephyr,dma,bando",
    authorName: "Nhóm Nghiên Cứu Firmware",
    authorTitle: "Kỹ sư Thực nghiệm Lab",
    coverImage: "/images/logo.png",
    facebookPostUrl: "https://www.facebook.com/EmbeddedAIoTLAB",
    excerpt: "Hôm nay các bạn sinh viên Lab đã hoàn thành việc đo đạc dạng sóng xung ngắt UART DMA trên máy hiện sóng Rigol và chạy thử bản build Zephyr RTOS đa luồng đầu tiên!",
    contentHtml: `
<p>Chiều nay tại phòng 502 A3, nhóm nghiên cứu Firmware Lab vừa hoàn thành buổi thực nghiệm kiểm chứng driver UART Circular RingBuffer kết hợp DMA Idle Line Detection trên chip STM32G474.</p>

<h3>Một số kết quả đo đạc:</h3>
<ul>
  <li><strong>Tải CPU:</strong> Giảm từ 42% xuống dưới 3.5% khi truyền nhận dữ liệu tốc độ cao 921600 baud.</li>
  <li><strong>Thời gian đáp ứng ngắt:</strong> Đo bằng Logic Analyzer đạt dưới 1.2 micro giây.</li>
  <li>Chạy ổn định trên Kernel <strong>Zephyr RTOS v3.7</strong> với bộ quản lý luồng Semaphore đồng bộ.</li>
</ul>

<div class="code-block-container" style="background: #0d0e10; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin: 16px 0; font-family: monospace;">
  <div style="color: #8a8f98; font-size: 12px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px;">// Đoạn mã khởi tạo DMA UART Zephyr RTOS</div>
  <pre style="margin: 0; color: #e2e8f0; font-size: 13px;"><code>#include &lt;zephyr/kernel.h&gt;
#include &lt;zephyr/drivers/uart.h&gt;

static void uart_dma_callback(const struct device *dev, struct uart_event *evt, void *user_data) {
    switch (evt->type) {
        case UART_RX_RDY:
            // Xử lý gói tin nhận tức thì không tốn CPU
            k_sem_give(&amp;uart_rx_sem);
            break;
        default:
            break;
    }
}</code></pre>
</div>

<p>Mỗi tuần một đề tài thực chiến! Chúc mừng các bạn thành viên đã hoàn thành xuất sắc mục tiêu milestone tuần này! 🎉</p>
`,
  },
  {
    title: "⚡ [CHIA SẺ KỸ THUẬT] Pipeline Lượng Tử Hóa INT8 & Nhúng Mô Hình YOLOv8 Lên ESP32-S3 Với Khung ESP-DL",
    slug: "chia-se-ky-thuat-pipeline-tinyml-esp32-s3-esp-dl",
    postType: "technical",
    pinned: false,
    featured: true,
    likesCount: 165,
    readingTime: 5,
    tags: "chia-se-ky-thuat,tinyml,esp32-s3,esp-dl,aiot",
    authorName: "Lab Research Team",
    authorTitle: "TinyML Group",
    coverImage: "/images/logo.png",
    facebookPostUrl: "https://www.facebook.com/EmbeddedAIoTLAB",
    excerpt: "Chia sẻ toàn bộ mã nguồn và quy trình chuyển đổi model YOLOv8 Nano từ PyTorch sang ESP-DL tận dụng tập lệnh Vector PIE của ESP32-S3, tốc độ suy luận ~14.2ms.",
    contentHtml: `
<h2>Quy Trình Triển Khai TinyML Trên ESP32-S3</h2>
<p>Khi chạy Deep Learning trên vi điều khiển có bộ nhớ hạn chế (512KB SRAM), kỹ thuật lượng tử hóa <strong>Post-Training Quantization (PTQ) INT8</strong> là chìa khóa sống còn giúp:</p>
<ul>
  <li>Giảm dung lượng trọng số mô hình từ <strong>12MB (Float32)</strong> xuống chỉ còn <strong>3.1MB (INT8)</strong>.</li>
  <li>Tăng tốc độ tính toán hơn <strong>3.8 lần</strong> nhờ tập lệnh Vector SIMD 128-bit trên lõi kép Xtensa LX7 của ESP32-S3.</li>
</ul>

<div class="callout callout-note" style="background: rgba(94, 106, 210, 0.1); border-left: 4px solid #5e6ad2; padding: 16px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0; font-weight: 600; color: #5e6ad2;">📌 Tài nguyên mã nguồn:</p>
  <p style="margin: 8px 0 0 0;">Mã nguồn mẫu và file cấu hình đã được upload lên GitHub Lab: <a href="https://github.com/embedded-aiot-ptit" target="_blank">https://github.com/embedded-aiot-ptit</a></p>
</div>
`,
  },
  {
    title: "🏆 [CHÚC MỪNG] Đội Tuyển Sinh Viên Embedded-AIoT Lab Đạt Giải Nhất Nghiên Cứu Khoa Học Cấp Học Viện 2026",
    slug: "chuc-mung-sinh-vien-lab-dat-giai-nhat-nckh-2026",
    postType: "event",
    pinned: false,
    featured: false,
    likesCount: 240,
    readingTime: 3,
    tags: "su-kien,thanh-tich,nckh-ptit,dientu1",
    authorName: "Embedded-AIoT Lab PTIT",
    authorTitle: "Ban Truyền Thông Lab",
    coverImage: "/images/logo.png",
    facebookPostUrl: "https://www.facebook.com/EmbeddedAIoTLAB",
    excerpt: "Đề tài 'Hệ thống Smart Camera AIoT nhận diện bất thường thời gian thực trên bo mạch vi xử lý lai FPGA-NPU' do nhóm sinh viên Lab thực hiện đã xuất sắc đạt Giải Nhất!",
    contentHtml: `
<p>Xin chúc mừng nhóm nghiên cứu sinh viên Khoa Điện Tử 1 tại Embedded-AIoT Lab đã xuất sắc giành <strong>Giải Nhất Hội Nghị Nghiên Cứu Khoa Học Sinh Viên Cấp Học Viện</strong> năm 2026!</p>

<p>Đề tài được hội đồng giám khảo đánh giá rất cao nhờ tính thực tiễn:</p>
<ol>
  <li>Tự thiết kế toàn bộ bo mạch phần cứng 4 lớp kiểm soát trở kháng 50Ω.</li>
  <li>Tích hợp mô hình Edge AI chạy trực tiếp trên chip tăng tốc phần cứng không phụ thuộc internet.</li>
  <li>Độ trễ phát hiện cảnh báo dưới 20 mili-giây.</li>
</ol>

<p>Cảm ơn sự hướng dẫn tận tình của các Thầy Cô Khoa Điện Tử 1 và nỗ lực không ngừng nghỉ suốt 6 tháng qua của các bạn thành viên! 💐🎉</p>
`,
  },
];

const DEFAULT_COURSES = [
  {
    title: "Chinh Phục Zephyr RTOS & STM32 Bare-Metal Chuyên Sâu",
    slug: "chinh-phuc-zephyr-rtos-stm32",
    description: "Khóa học nền tảng từ Bare-Metal CMSIS, NVIC, DMA cho tới kiến trúc RTOS đa nhiệm, Device Driver và Kiến trúc Hệ điều hành Zephyr RTOS chuẩn công nghiệp.",
    level: "intermediate",
    category: "embedded-rtos",
    duration: "18 giờ",
    price: "free",
    featured: true,
    thumbnail: "/images/logo.png",
    modules: [
      {
        module: "Module 1: Nền tảng Vi Điều Khiển ARM Cortex-M & Bare-Metal",
        order: 1,
        lessons: [
          {
            title: "Bài 1: Kiến trúc ARM Cortex-M4/M7, Memory Map & Startup Code",
            slug: "bai-1-kien-truc-arm-cortex-m",
            duration: "25 phút",
            free: true,
            summary: "Hiểu sâu về Register Bank, Stack Pointer (MSP/PSP), Vector Table và chu trình Boot của vi điều khiển STM32.",
          },
          {
            title: "Bài 2: Cơ chế Ngắt NVIC, SysTick & Xử lý Tranh Chấp Ưu Tiên",
            slug: "bai-2-co-che-ngat-nvic-systick",
            duration: "30 phút",
            free: true,
            summary: "Phân tích Preemption Priority vs Sub-priority, viết ISR an toàn không gây nghẽn hệ thống.",
          },
        ],
      },
      {
        module: "Module 2: Chuyển Dịch Lên Zephyr RTOS v3.7",
        order: 2,
        lessons: [
          {
            title: "Bài 3: Cài đặt Toolchain Zephyr West, Kconfig & Device Tree (DTS)",
            slug: "bai-3-cai-dat-zephyr-dts",
            duration: "35 phút",
            free: true,
            summary: "Làm chủ cú pháp DeviceTree (.dts) và Kconfig để cấu hình phần cứng linh hoạt.",
          },
        ],
      },
    ],
  },
  {
    title: "TinyML: Triển Khai Deep Learning & YOLO Trên ESP32-S3",
    slug: "tinyml-deep-learning-esp32-s3",
    description: "Tối ưu hóa và nén mô hình mạng Neural Network (INT8 Quantization, Pruning) chạy trực tiếp trên chip ESP32-S3 với tập lệnh tăng tốc phần cứng ESP-DL.",
    level: "advanced",
    category: "tinyml",
    duration: "14 giờ",
    price: "free",
    featured: true,
    thumbnail: "/images/logo.png",
    modules: [
      {
        module: "Module 1: Pipeline TinyML Từ PyTorch Đến C Code",
        order: 1,
        lessons: [
          {
            title: "Bài 1: Tổng quan Edge AI & Thách thức bộ nhớ trên Microcontroller",
            slug: "bai-1-tong-quan-edge-ai",
            duration: "20 phút",
            free: true,
            summary: "So sánh các framework TinyML: TFLite Micro, Edge Impulse, ESP-DL.",
          },
        ],
      },
    ],
  },
  {
    title: "Thiết Kế Vi Mạch Số Verilog & CPU RISC-V Trên Xilinx FPGA",
    slug: "thiet-ke-vi-mach-verilog-riscv-fpga",
    description: "Học thiết kế phần cứng số từ mức cổng logic (RTL), FSM, thiết kế đường truyền dữ liệu (Datapath) và tự build 1 CPU RISC-V 32-bit hoàn chỉnh.",
    level: "advanced",
    category: "fpga",
    duration: "22 giờ",
    price: "free",
    featured: true,
    thumbnail: "/images/logo.png",
    modules: [
      {
        module: "Module 1: Ngôn ngữ Verilog HDL & Testbench",
        order: 1,
        lessons: [
          {
            title: "Bài 1: Cú pháp Verilog tổng hợp được (Synthesizable Verilog)",
            slug: "bai-1-cu-phap-verilog-tong-hop",
            duration: "30 phút",
            free: true,
            summary: "Blocking vs Non-blocking assignments, Clock domain, Reset logic.",
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log("🌱 Bắt đầu seed Database SQLite cho Embedded-AIoT Lab...");

  // Seed Posts
  for (const post of DEFAULT_POSTS) {
    const existing = await prisma.post.findUnique({ where: { slug: post.slug } });
    if (!existing) {
      await prisma.post.create({
        data: post,
      });
      console.log(`✅ Đã thêm bài viết: ${post.title.substring(0, 40)}...`);
    }
  }

  // Seed Courses
  for (const courseData of DEFAULT_COURSES) {
    const { modules, ...courseFields } = courseData;
    const existing = await prisma.course.findUnique({ where: { slug: courseFields.slug } });
    if (!existing) {
      const course = await prisma.course.create({
        data: courseFields,
      });

      for (const mod of modules) {
        const createdMod = await prisma.courseModule.create({
          data: {
            module: mod.module,
            order: mod.order,
            courseId: course.id,
          },
        });

        for (let i = 0; i < mod.lessons.length; i++) {
          const lesson = mod.lessons[i];
          await prisma.lesson.create({
            data: {
              title: lesson.title,
              slug: lesson.slug,
              duration: lesson.duration,
              free: lesson.free,
              summary: lesson.summary,
              order: i + 1,
              moduleId: createdMod.id,
            },
          });
        }
      }
      console.log(`✅ Đã thêm khóa học: ${courseFields.title.substring(0, 40)}...`);
    }
  }

  // Seed Default Super Admin User
  const primaryAdminEmail = "anhln.embedded@gmail.com";
  const defaultAdmin = await prisma.user.findUnique({ where: { email: primaryAdminEmail } });
  if (!defaultAdmin) {
    await prisma.user.create({
      data: {
        email: primaryAdminEmail,
        name: "Super Admin (Embedded AIoT Lab)",
        role: "superadmin",
        avatar: "🛡️",
        title: "Quản trị viên tối cao hệ thống Embedded AIoT Laboratory PTIT",
      },
    });
    console.log(`✅ Đã tạo tài khoản quản trị Lab: ${primaryAdminEmail}`);
  }

  // Dọn dẹp tài khoản admin mẫu cũ nếu tồn tại trong database
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["admin@embeddedlab.vn", "admin@ptit.edu.vn", "superadmin@ptit.edu.vn", "student@ptit.edu.vn"],
      },
    },
  }).catch(() => {});

  console.log("✨ Seed database hoàn tất thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
