import fs from "fs";
import path from "path";
import { parseSingleMarkdownArticle } from "../src/lib/markdown-importer";

async function main() {
  console.log("=== BẮT ĐẦU ĐÓNG GÓI & TẢI KHÓA HỌC STM32 LÊN EMBEDDED-AIOT.COM ===");

  const mdDir = "F:\\Advance_C\\stm32f103c8";
  const files = fs.readdirSync(mdDir)
    .filter((f) => f.startsWith("Bai ") && f.endsWith(".md"))
    .sort((a, b) => {
      const numA = parseInt(a.match(/Bai\s*(\d+)/)?.[1] || "0", 10);
      const numB = parseInt(b.match(/Bai\s*(\d+)/)?.[1] || "0", 10);
      return numA - numB;
    });

  console.log(`Tìm thấy ${files.length} bài học Markdown trong thư mục ${mdDir}`);

  const parsedLessons: any[] = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(mdDir, filename);
    const content = fs.readFileSync(filePath, "utf-8");

    const order = i + 1;
    const parsed = parseSingleMarkdownArticle(content, order, filename);

    // Chuẩn hóa đường dẫn hình ảnh trong HTML từ images/ sang /images/stm32f103/ hoặc /images/
    let contentHtml = parsed.contentHtml;
    contentHtml = contentHtml.replace(/src=["']images\/([^"']+)["']/g, 'src="/images/stm32f103/$1"');
    contentHtml = contentHtml.replace(/src=["']\/images\/([^"']+)["']/g, (m, p1) => {
      if (!p1.startsWith("stm32f103/")) {
        return `src="/images/stm32f103/${p1}"`;
      }
      return m;
    });

    parsedLessons.push({
      order,
      title: parsed.title,
      slug: parsed.slug,
      duration: order <= 5 ? "20 phút" : "25 phút",
      free: order <= 5,
      summary: parsed.summary,
      contentHtml: contentHtml,
      codeSnippet: parsed.codeSnippet || null,
      codeLang: parsed.codeLang || "c",
      codeFilename: parsed.codeFilename || "main.c",
    });

    console.log(`  ✓ Đã biên dịch bài ${order}: ${parsed.title}`);
  }

  // Phân chia 26 bài học thành 5 Học phần chuẩn sư phạm kỹ thuật
  const moduleDefs = [
    {
      title: "Học phần 1: Nền Tảng ARM Cortex-M3 & Ngoại Vi Cơ Bản",
      range: [1, 5],
    },
    {
      title: "Học phần 2: Hệ Thống Định Thời Timers, PWM & Xử Lý Tín Hiệu ADC",
      range: [6, 12],
    },
    {
      title: "Học phần 3: Các Chuẩn Giao Tiếp Nối Tiếp Công Nghiệp & DMA Controller",
      range: [13, 17],
    },
    {
      title: "Học phần 4: Tiết Kiệm Năng Lượng & Hệ Điều Hành Thời Gian Thực FreeRTOS",
      range: [18, 22],
    },
    {
      title: "Học phần 5: Giao Thức Nâng Cao (CAN Bus, USB FS) & Chuyên Gia Firmware",
      range: [23, 26],
    },
  ];

  const modules = moduleDefs.map((def, mIdx) => {
    const lessonsInMod = parsedLessons
      .filter((l) => l.order >= def.range[0] && l.order <= def.range[1])
      .map((l, lIdx) => ({
        title: l.title,
        slug: l.slug,
        duration: l.duration,
        free: l.free,
        summary: l.summary,
        contentHtml: l.contentHtml,
        codeSnippet: l.codeSnippet,
        order: lIdx + 1,
      }));

    return {
      module: def.title,
      order: mIdx + 1,
      lessons: lessonsInMod,
    };
  });

  const coursePayload = {
    title: "Lập Trình STM32F103 Chuyên Sâu: ARM Cortex-M3 Bare-Metal & SPL",
    slug: "lap-trinh-stm32f103-chuyen-sau",
    description:
      "Khóa học toàn diện 26 bài học thực chiến STM32F103 (Blue Pill) từ kiến trúc thanh ghi Cortex-M3, Bit-Banding, Clock Tree, GPIO, Timer PWM/Encoder, ADC, DMA, các chuẩn giao tiếp UART/I2C/SPI/CAN, USB Device, FreeRTOS đa nhiệm thời gian thực và Custom ISP Bootloader.",
    level: "intermediate",
    category: "embedded-rtos",
    duration: "26 bài học (30 giờ)",
    price: "free",
    thumbnail: "/images/stm32f103/stm32f103c8.webp",
    githubRepo: "https://github.com/anhln-embedded/Advance_C",
    featured: true,
    modules: modules,
  };

  console.log("\nĐang gửi dữ liệu khóa học đến https://embedded-aiot.com/api/courses ...");

  try {
    const response = await fetch("https://embedded-aiot.com/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Embedded-AIoT-Admin-Publisher/1.0",
      },
      body: JSON.stringify(coursePayload),
    });

    const result = await response.json();
    if (result.success) {
      console.log("\n=======================================================");
      console.log("🎉 XUẤT BẢN KHÓA HỌC THÀNH CÔNG LÊN EMBEDDED-AIOT.COM!");
      console.log("=======================================================");
      console.log(`Course ID: ${result.data?.id}`);
      console.log(`Course Title: ${result.data?.title}`);
      console.log(`Course Slug: ${result.data?.slug}`);
      console.log(`URL Truy Cập Trực Tiếp: https://embedded-aiot.com/courses/${result.data?.slug}`);
      console.log(`Số lượng học phần: ${result.data?.modules?.length || modules.length}`);
      console.log(`Tổng số bài học: 26 bài học`);
    } else {
      console.error("Lỗi từ server:", result.error || result);
    }
  } catch (err: any) {
    console.error("Lỗi khi gửi yêu cầu:", err.message);
  }
}

main().catch(console.error);
