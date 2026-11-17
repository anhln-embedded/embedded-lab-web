import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { markdownToLabHtml } from "../src/lib/markdown-importer";

const prisma = new PrismaClient();

const TOPIC_CONFIG = {
  title: "LoRa & LoRaWAN — Từ Nền Tảng Đến Ứng Dụng Thực Chiến",
  slug: "lora-lorawan",
  category: "mcu",
  categoryName: "Sóng Vô Tuyến & IoT",
  icon: "radio",
  badge: "Series Mới",
  level: "Intermediate",
  description:
    "Chuỗi chuyên đề toàn diện về công nghệ vô tuyến LoRa, kỹ thuật điều chế Chirp Spread Spectrum (CSS), kiến trúc giao thức LoRaWAN 1.0.4, vi mạch Semtech SX1262, trạm thu Gateway và máy chủ mạng ChirpStack v4.",
  author: "Embedded-AIoT Lab PTIT",
  authorTitle: "Kỹ sư Nghiên cứu Embedded-AIoT",
  authorAvatar: "/images/logo.png",
  coverImage: "/images/lora/lora_series_cover.svg",
  order: 1,
};

const CHAPTER_01_ARTICLES = [
  {
    file: "01-what-is-lora-principles-features-applications.md",
    slug: "01-what-is-lora-principles-features-applications",
    title: "Bài 01: LoRa Là Gì? Nguyên Lý Vật Lý, Đặc Tính Kỹ Thuật và Ứng Dụng Thực Chiến",
    titleEn: "Article 01: What Is LoRa? Principles, Features and Real-World Applications",
    readTime: "15 phút",
    summary:
      "Khám phá bản chất vật lý của công nghệ vô tuyến LoRa, nguyên lý điều chế Chirp Spread Spectrum (CSS), quan hệ giữa Spreading Factor (SF), Băng thông (BW), độ nhạy máy thu và tổng quỹ suy hao đường truyền (Link Budget).",
    summaryEn:
      "Explore the physical fundamentals of LoRa radio, Chirp Spread Spectrum modulation, the mathematical relationship between Spreading Factor, Bandwidth, receiver sensitivity, and Link Budget.",
    order: 1,
    codeLang: "c",
    codeFilename: "lora_phy_calc.c",
  },
  {
    file: "02-lora-vs-lorawan-phy-mac-network.md",
    slug: "02-lora-vs-lorawan-phy-mac-network",
    title: "Bài 02: LoRa vs LoRaWAN: Phân Biệt Tầng Vật Lý (PHY), Tầng Giao Thức (MAC) và Kiến Trúc Mạng",
    titleEn: "Article 02: LoRa vs LoRaWAN: PHY, MAC and Network Architecture",
    readTime: "16 phút",
    summary:
      "Phân định rõ ràng ranh giới giữa tầng vật lý vô tuyến LoRa và tầng giao thức mạng LoRaWAN MAC. Giải phẫu cấu trúc khung bản tin, so sánh hành vi 3 lớp thiết bị Class A, B, C và cơ chế bảo mật kép AES-128.",
    summaryEn:
      "Demarcate the technical boundary between LoRa PHY and LoRaWAN MAC according to the OSI model. Frame structure breakdown, Class A/B/C behaviors, and dual-layer AES-128 security.",
    order: 2,
    codeLang: "c",
    codeFilename: "lorawan_packet_parser.c",
  },
  {
    file: "03-lora-vs-wifi-ble-zigbee-nbiot-ltem.md",
    slug: "03-lora-vs-wifi-ble-zigbee-nbiot-ltem",
    title: "Bài 03: So Sánh LoRa/LoRaWAN Với Wi-Fi, BLE, Zigbee, NB-IoT và LTE-M",
    titleEn: "Article 03: LoRa vs Wi-Fi, BLE, Zigbee, NB-IoT and LTE-M",
    readTime: "17 phút",
    summary:
      "Ma trận đối đầu định lượng giữa LoRaWAN và các công nghệ không dây IoT. So sánh cự ly, tốc độ dữ liệu, mức tiêu thụ năng lượng, công thức tính tuổi thọ pin và bài toán chi phí sở hữu (TCO) mạng riêng vs mạng di động.",
    summaryEn:
      "Quantitative comparison matrix between LoRaWAN and other IoT wireless protocols. Deep dive into range, throughput, energy per packet, battery lifespan models, and TCO analysis.",
    order: 3,
    codeLang: "c",
    codeFilename: "iot_battery_simulator.c",
  },
  {
    file: "04-end-to-end-lora-lorawan-system-architecture.md",
    slug: "04-end-to-end-lora-lorawan-system-architecture",
    title: "Bài 04: Kiến Trúc Mạng Toàn Trình End-to-End LoRa/LoRaWAN: Từ Cảm Biến Đến Đám Mây",
    titleEn: "Article 04: End-to-End LoRa/LoRaWAN System Architecture",
    readTime: "18 phút",
    summary:
      "Hành trình toàn trình của gói dữ liệu IoT: Từ thiết bị đầu cuối qua trạm thu Gateway, giao thức chuyển tiếp gói tin Semtech UDP/Basic Station, máy chủ mạng ChirpStack lọc trùng và bộ giải mã Payload Codec đẩy lên Dashboard.",
    summaryEn:
      "End-to-End data journey in LoRaWAN Star-of-Stars topology: End Devices, Gateways (UDP Packet Forwarder & Basic Station), Network Server deduplication, Join Server OTAA flow, and Application Server JSON codecs.",
    order: 4,
    codeLang: "c",
    codeFilename: "mock_packet_forwarder.c",
  },
];

async function sync() {
  console.log("🚀 Bắt đầu đồng bộ an toàn Chuyên đề LoRa & LoRaWAN vào Database...");

  // 1. Upsert Topic
  const topic = await prisma.tutorialTopic.upsert({
    where: { slug: TOPIC_CONFIG.slug },
    update: {
      title: TOPIC_CONFIG.title,
      category: TOPIC_CONFIG.category,
      categoryName: TOPIC_CONFIG.categoryName,
      icon: TOPIC_CONFIG.icon,
      badge: TOPIC_CONFIG.badge,
      level: TOPIC_CONFIG.level,
      description: TOPIC_CONFIG.description,
      author: TOPIC_CONFIG.author,
      authorTitle: TOPIC_CONFIG.authorTitle,
      authorAvatar: TOPIC_CONFIG.authorAvatar,
      coverImage: TOPIC_CONFIG.coverImage,
    },
    create: {
      title: TOPIC_CONFIG.title,
      slug: TOPIC_CONFIG.slug,
      category: TOPIC_CONFIG.category,
      categoryName: TOPIC_CONFIG.categoryName,
      icon: TOPIC_CONFIG.icon,
      badge: TOPIC_CONFIG.badge,
      level: TOPIC_CONFIG.level,
      description: TOPIC_CONFIG.description,
      author: TOPIC_CONFIG.author,
      authorTitle: TOPIC_CONFIG.authorTitle,
      authorAvatar: TOPIC_CONFIG.authorAvatar,
      coverImage: TOPIC_CONFIG.coverImage,
      order: TOPIC_CONFIG.order,
    },
  });

  console.log(`✅ Chuyên đề đã được đảm bảo: [${topic.id}] ${topic.title}`);

  // 2. Synchronize Articles
  const contentDir = path.join(__dirname, "..", "content", "tutorials", "lora-lorawan");

  for (const item of CHAPTER_01_ARTICLES) {
    const filePath = path.join(contentDir, item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Không tìm thấy file bài viết: ${filePath}`);
      continue;
    }

    const rawMarkdown = fs.readFileSync(filePath, "utf-8");
    const richHtml = markdownToLabHtml(rawMarkdown);

    // Trích xuất mã nguồn mẫu nếu có
    const codeMatch = rawMarkdown.match(/```c\s*([\s\S]*?)```/);
    const codeSnippet = codeMatch ? codeMatch[1].trim() : null;

    const article = await prisma.tutorialArticle.upsert({
      where: {
        topicId_slug: {
          topicId: topic.id,
          slug: item.slug,
        },
      },
      update: {
        title: item.title,
        titleEn: item.titleEn,
        readTime: item.readTime,
        summary: item.summary,
        summaryEn: item.summaryEn,
        contentHtml: richHtml,
        codeSnippet: codeSnippet,
        codeLang: item.codeLang,
        codeFilename: item.codeFilename,
        order: item.order,
        draft: false,
      },
      create: {
        topicId: topic.id,
        slug: item.slug,
        title: item.title,
        titleEn: item.titleEn,
        readTime: item.readTime,
        summary: item.summary,
        summaryEn: item.summaryEn,
        contentHtml: richHtml,
        codeSnippet: codeSnippet,
        codeLang: item.codeLang,
        codeFilename: item.codeFilename,
        order: item.order,
        draft: false,
      },
    });

    console.log(`   [✔] Đã đồng bộ Bài ${item.order}: "${article.title}" (${richHtml.length} bytes HTML)`);
  }

  // 3. Verify total articles in topic
  const totalInTopic = await prisma.tutorialArticle.count({
    where: { topicId: topic.id },
  });
  const totalAllTopics = await prisma.tutorialTopic.count();
  const totalAllArticles = await prisma.tutorialArticle.count();

  console.log("\n===============================================================");
  console.log(`🎉 HOÀN THÀNH ĐỒNG BỘ: Chuyên đề "${topic.title}" hiện có ${totalInTopic} bài viết.`);
  console.log(`📊 Tổng số chuyên đề trong hệ thống: ${totalAllTopics}`);
  console.log(`📊 Tổng số bài viết trong toàn bộ hệ thống: ${totalAllArticles}`);
  console.log("===============================================================");
}

sync()
  .catch((e) => {
    console.error("❌ Lỗi khi đồng bộ:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

