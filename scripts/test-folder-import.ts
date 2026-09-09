import fs from "fs";
import path from "path";
import prisma from "../src/lib/prisma";
import { parseSingleMarkdownArticle } from "../src/lib/markdown-importer";
import { ensureTutorialSchema } from "../src/lib/db-sync";

async function main() {
  const folderPath = "F:\\Advance_C\\ESP32-IOT";
  console.log("==================================================");
  console.log("KIỂM THỬ TÍNH NĂNG NẠP CẢ THƯ MỤC TẠO CHUYÊN ĐỀ");
  console.log("Thư mục nguồn:", folderPath);
  console.log("==================================================");

  if (!fs.existsSync(folderPath)) {
    throw new Error(`Thư mục không tồn tại: ${folderPath}`);
  }

  // 1. Quét danh sách file .md
  const files = fs
    .readdirSync(folderPath)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  console.log(`[1] Đã tìm thấy ${files.length} bài giảng Markdown trong thư mục.`);

  // 2. Phân tích nội dung từng bài (Parser)
  const parsedPosts = files.map((file, idx) => {
    const rawContent = fs.readFileSync(path.join(folderPath, file), "utf-8");
    const parsed = parseSingleMarkdownArticle(rawContent, idx + 1, file);
    return {
      title: parsed.title,
      slug: parsed.slug,
      readTime: parsed.readTime,
      summary: parsed.summary,
      contentHtml: parsed.contentHtml,
      codeSnippet: parsed.codeSnippet,
      codeLang: parsed.codeLang,
      codeFilename: parsed.codeFilename,
      order: idx + 1,
    };
  });

  console.log(`[2] Phân tích hoàn tất 100% bài giảng.`);
  parsedPosts.forEach((p) => {
    console.log(`    ✓ [Bài ${p.order}] ${p.title} (${p.readTime})`);
  });

  // 3. Đảm bảo schema DB
  await ensureTutorialSchema();

  // 4. Cấu hình Topic
  const topicSlug = "esp32-iot-co-ban-den-nang-cao";
  const topicTitle = "Lập Trình ESP32 & IoT Từ Cơ Bản Đến Nâng Cao";

  // Kiểm tra nếu topic đã tồn tại thì xóa cũ để cập nhật mới
  const existing = await prisma.tutorialTopic.findUnique({
    where: { slug: topicSlug },
  });

  if (existing) {
    console.log(`[3] Chuyên đề '${topicSlug}' đã tồn tại -> Xóa bản ghi cũ để ghi đè cập nhật...`);
    await prisma.tutorialTopic.delete({
      where: { id: existing.id },
    });
  }

  // 5. Tạo mới Chuyên đề cùng 16 bài viết
  console.log(`[4] Đang lưu chuyên đề mới và 16 bài giảng vào cơ sở dữ liệu...`);
  const createdTopic = await prisma.tutorialTopic.create({
    data: {
      title: topicTitle,
      slug: topicSlug,
      category: "mcu",
      categoryName: "Microcontrollers & IoT",
      icon: "⚡",
      badge: "16 Buổi Thực Hành",
      level: "Beginner to Advanced",
      description:
        "Khóa học lập trình vi điều khiển ESP32 và hệ điều hành thời gian thực FreeRTOS toàn diện từ cơ bản đến nâng cao trên nền tảng Arduino IDE và giả lập trực tuyến Wokwi: GPIO, ADC, PWM, UART, I2C, cảm biến môi trường, Wi-Fi, Web Server, HTTP Client, MQTT Cloud và Đồ án Smart Home.",
      author: "Kỹ sư Lab PTIT",
      authorTitle: "Mentor Lab",
      coverImage: "/images/logo.png",
      articles: {
        create: parsedPosts.map((p) => ({
          title: p.title,
          slug: p.slug,
          readTime: p.readTime,
          summary: p.summary,
          contentHtml: p.contentHtml,
          codeSnippet: p.codeSnippet || null,
          codeLang: p.codeLang || "c",
          codeFilename: p.codeFilename || "main.c",
          order: p.order,
        })),
      },
    },
    include: {
      articles: true,
    },
  });

  console.log("==================================================");
  console.log("🎉 TẠO CHUYÊN ĐỀ TỪ THƯ MỤC THÀNH CÔNG RỰC RỠ!");
  console.log(`- ID Chuyên đề: ${createdTopic.id}`);
  console.log(`- Tên Chuyên đề: ${createdTopic.title}`);
  console.log(`- Slug: ${createdTopic.slug}`);
  console.log(`- Tổng số bài giảng: ${createdTopic.articles.length} bài`);
  console.log(`- Đường dẫn xem trên web: /tutorials/${createdTopic.slug}`);
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
