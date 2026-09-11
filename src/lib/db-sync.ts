import prisma from "@/lib/prisma";

let isSchemaEnsured = false;

/**
 * Tự động đảm bảo các bảng và cột mới trong SQLite tồn tại ở mọi môi trường
 * (Local, Docker, Production VPS) mà không bắt buộc phải chạy `prisma db push` thủ công.
 */
export async function ensureTutorialSchema() {
  if (isSchemaEnsured) return;

  try {
    // 1. Thêm các cột mới cho TutorialArticle nếu chưa tồn tại
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "TutorialArticle" ADD COLUMN "authorName" TEXT DEFAULT 'Embedded-AIoT Lab PTIT'`
      );
    } catch {}

    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "TutorialArticle" ADD COLUMN "authorTitle" TEXT DEFAULT 'Kỹ sư Nghiên cứu Embedded'`
      );
    } catch {}

    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "TutorialArticle" ADD COLUMN "authorAvatar" TEXT DEFAULT '/images/logo.png'`
      );
    } catch {}

    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "TutorialArticle" ADD COLUMN "draft" BOOLEAN DEFAULT 0`
      );
    } catch {}

    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "TutorialTopic" ADD COLUMN "authorAvatar" TEXT DEFAULT '/images/logo.png'`
      );
    } catch {}

    // 2. Tạo bảng TutorialComment nếu chưa tồn tại
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "TutorialComment" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "articleId" TEXT NOT NULL,
          "userId" TEXT,
          "userName" TEXT NOT NULL,
          "userAvatar" TEXT DEFAULT '/images/logo.png',
          "userRole" TEXT DEFAULT 'user',
          "userEmail" TEXT,
          "content" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "TutorialComment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "TutorialArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
    } catch {}

    // 3. Tạo bảng ArticleEditHistory nếu chưa tồn tại
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ArticleEditHistory" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "articleId" TEXT NOT NULL,
          "userId" TEXT,
          "userName" TEXT NOT NULL,
          "userEmail" TEXT,
          "userRole" TEXT,
          "userAvatar" TEXT,
          "title" TEXT NOT NULL,
          "readTime" TEXT,
          "summary" TEXT,
          "contentHtml" TEXT,
          "codeSnippet" TEXT,
          "codeLang" TEXT,
          "codeFilename" TEXT,
          "changeSummary" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ArticleEditHistory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "TutorialArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
    } catch {}

    isSchemaEnsured = true;
  } catch (error) {
    console.error("Lỗi khi tự động đồng bộ schema:", error);
  }
}

let isCircuitPresetEnsured = false;

/**
 * Tự động đồng bộ bảng CircuitPreset và nạp 3 mạch mẫu ban đầu vào Database
 */
export async function ensureCircuitPresetSchema() {
  try {
    // 1. Tạo bảng CircuitPreset nếu chưa tồn tại
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CircuitPreset" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "mcuType" TEXT NOT NULL DEFAULT 'stm32',
        "diagramJson" TEXT NOT NULL,
        "firmwareHex" TEXT NOT NULL,
        "firmwareName" TEXT NOT NULL DEFAULT 'blink.hex',
        "author" TEXT NOT NULL DEFAULT 'Embedded-AIoT Lab PTIT',
        "order" INTEGER NOT NULL DEFAULT 0,
        "isPublished" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Kiểm tra nếu chưa có bản ghi nào thì seed 3 mạch mẫu ban đầu
    const existing: any = await prisma.$queryRawUnsafe(
      `SELECT "id" FROM "CircuitPreset" LIMIT 1`
    );

    if (!existing || existing.length === 0) {
      const { PRESET_DIAGRAMS } = await import("@/lib/emulator/diagram-parser");
      const { SAMPLE_BLINK_HEX } = await import("@/components/simulator/FirmwareUploader");

      const initialPresets = [
        {
          id: "preset_stm32_blink",
          title: "STM32F103 - Chớp tắt LED PC13 (Keil MDK)",
          slug: "stm32f103-blink-led-pc13",
          description: "Mạch cơ bản với STM32F103 Blue Pill và 1 đèn LED xanh nối vào chân PC13. Nạp sẵn firmware blink.hex chuẩn Keil MDK.",
          mcuType: "stm32",
          diagramJson: JSON.stringify(PRESET_DIAGRAMS.blink_pc13),
          firmwareHex: SAMPLE_BLINK_HEX,
          firmwareName: "blink.hex",
          author: "Embedded-AIoT Lab PTIT",
          order: 1,
        },
        {
          id: "preset_stm32_button",
          title: "STM32F103 - Nút bấm PB0 điều khiển LED PC13",
          slug: "stm32f103-button-led-pc13",
          description: "Mạch đọc nút nhấn PB0 (kéo lên) điều khiển bật tắt LED PC13, đủ 2 dây song song chống vắt chéo.",
          mcuType: "stm32",
          diagramJson: JSON.stringify(PRESET_DIAGRAMS.button_pc13),
          firmwareHex: SAMPLE_BLINK_HEX,
          firmwareName: "blink.hex",
          author: "Embedded-AIoT Lab PTIT",
          order: 2,
        },
        {
          id: "preset_stm32_oled",
          title: "STM32F103 - Màn hình OLED SSD1306 (I2C1 B6/B7)",
          slug: "stm32f103-oled-ssd1306-i2c",
          description: "Mạch giao tiếp I2C1 giữa STM32 Blue Pill và màn hình OLED 128x64 qua chân SCL (B6) và SDA (B7).",
          mcuType: "stm32",
          diagramJson: JSON.stringify(PRESET_DIAGRAMS.stm32_oled),
          firmwareHex: SAMPLE_BLINK_HEX,
          firmwareName: "blink.hex",
          author: "Embedded-AIoT Lab PTIT",
          order: 3,
        },
      ];

      for (const p of initialPresets) {
        try {
          await prisma.$executeRawUnsafe(
            `INSERT OR IGNORE INTO "CircuitPreset" ("id", "title", "slug", "description", "mcuType", "diagramJson", "firmwareHex", "firmwareName", "author", "order", "isPublished", "createdAt", "updatedAt")
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            p.id,
            p.title,
            p.slug,
            p.description,
            p.mcuType,
            p.diagramJson,
            p.firmwareHex,
            p.firmwareName,
            p.author,
            p.order
          );
        } catch (insertErr) {
          console.error("Lỗi insert preset mẫu:", p.id, insertErr);
        }
      }
    }

    isCircuitPresetEnsured = true;
  } catch (error) {
    console.error("Lỗi khi đồng bộ bảng CircuitPreset:", error);
  }
}
