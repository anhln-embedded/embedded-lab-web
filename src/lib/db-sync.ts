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

    // Dọn dẹp các title/authorTitle mặc định (Super Admin Lab, Mentor Lab, Kỹ sư...)
    try {
      await prisma.$executeRawUnsafe(`UPDATE "User" SET "title" = '' WHERE "title" LIKE '%Super Admin%' OR "title" LIKE '%Kỹ sư%' OR "title" LIKE '%Mentor Lab%'`);
      await prisma.$executeRawUnsafe(`UPDATE "TutorialTopic" SET "authorTitle" = '' WHERE "authorTitle" LIKE '%Super Admin%' OR "authorTitle" LIKE '%Mentor Lab%' OR "authorTitle" LIKE '%Kỹ sư%'`);
      await prisma.$executeRawUnsafe(`UPDATE "TutorialArticle" SET "authorTitle" = '' WHERE "authorTitle" LIKE '%Super Admin%' OR "authorTitle" LIKE '%Mentor Lab%' OR "authorTitle" LIKE '%Kỹ sư%'`);
      await prisma.$executeRawUnsafe(`UPDATE "Post" SET "authorTitle" = '' WHERE "authorTitle" LIKE '%Super Admin%' OR "authorTitle" LIKE '%Kỹ sư%' OR "authorTitle" LIKE '%Mentor Lab%'`);
    } catch {}

    // Chuẩn hóa icon chuyên ngành cho TutorialCategory (thay 🎛️ bằng cpu / circuit)
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "TutorialCategory" 
        SET "icon" = 'cpu' 
        WHERE "slug" = 'mcu' AND ("icon" = '🎛️' OR "icon" = '🎛' OR "icon" = '' OR "icon" IS NULL)
      `);
      await prisma.$executeRawUnsafe(`
        UPDATE "TutorialCategory" 
        SET "icon" = 'circuit' 
        WHERE ("slug" = 'vi-mach' OR "slug" = 'hardware') AND ("icon" = '🎛️' OR "icon" = '🎛' OR "icon" = '📐' OR "icon" = '' OR "icon" IS NULL)
      `);
      await prisma.$executeRawUnsafe(`
        UPDATE "TutorialCategory" 
        SET "icon" = 'code' 
        WHERE ("slug" = 'programming' OR "slug" = 'ngon-ngu-lap-trinh') AND ("icon" = '💻' OR "icon" = '' OR "icon" IS NULL)
      `);
      await prisma.$executeRawUnsafe(`
        UPDATE "TutorialCategory" 
        SET "icon" = 'clock' 
        WHERE "slug" = 'rtos' AND ("icon" = '⚡' OR "icon" = '' OR "icon" IS NULL)
      `);
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

    // 4. Đồng bộ bảng và cột Gamification
    await ensureGamificationSchema();

    // 5. Đồng bộ bảng Diễn đàn thảo luận
    await ensureDiscussionSchema();

    isSchemaEnsured = true;
  } catch (error) {
    console.error("Lỗi khi tự động đồng bộ schema:", error);
  }
}

let isGamificationEnsured = false;

/**
 * Tự động đồng bộ schema Gamification (EXP, Level, Điểm cống hiến, Bảng log đọc)
 */
export async function ensureGamificationSchema() {
  if (isGamificationEnsured) return;

  try {
    // 1. Thêm các cột Gamification cho bảng User
    const userColumns = [
      `ALTER TABLE "User" ADD COLUMN "exp" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN "level" INTEGER DEFAULT 1`,
      `ALTER TABLE "User" ADD COLUMN "contributionPoints" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN "readArticlesCount" INTEGER DEFAULT 0`,
      `ALTER TABLE "User" ADD COLUMN "streakDays" INTEGER DEFAULT 1`,
      `ALTER TABLE "User" ADD COLUMN "lastActiveDate" TEXT`,
      `ALTER TABLE "User" ADD COLUMN "badges" TEXT DEFAULT '[]'`,
    ];

    for (const sql of userColumns) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch {}
    }

    // 2. Tạo bảng UserReadingLog & Cột tiêu đề bài viết
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "UserReadingLog" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "articleId" TEXT NOT NULL,
          "articleType" TEXT NOT NULL DEFAULT 'post',
          "title" TEXT,
          "earnedExp" INTEGER NOT NULL DEFAULT 15,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "UserReadingLog" ADD COLUMN "title" TEXT`);
      } catch {}
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "UserReadingLog_userId_articleId_key" ON "UserReadingLog"("userId", "articleId")
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "UserReadingLog_userId_idx" ON "UserReadingLog"("userId")
      `);
    } catch {}

    // 2.1 Tạo bảng PointAuditLog (Nhật ký kiểm tra & thay đổi điểm số)
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PointAuditLog" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "adminEmail" TEXT,
          "actionType" TEXT NOT NULL, -- 'admin_adjust', 'read_reward', 'sync_recalculated'
          "pointType" TEXT NOT NULL,  -- 'exp', 'cp', 'both'
          "amount" INTEGER NOT NULL,
          "oldExp" INTEGER,
          "newExp" INTEGER,
          "oldCP" INTEGER,
          "newCP" INTEGER,
          "reason" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "PointAuditLog_userId_idx" ON "PointAuditLog"("userId")
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "PointAuditLog_createdAt_idx" ON "PointAuditLog"("createdAt")
      `);
    } catch {}

    // 3. Tự động khởi tạo điểm cống hiến cho tác giả chính nếu đang là 0
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "User" 
        SET "contributionPoints" = 450, 
            "exp" = 220, 
            "level" = 4, 
            "readArticlesCount" = 12, 
            "streakDays" = 5, 
            "badges" = '["pioneer_author","embedded_scholar","streak_3","master_aiot"]' 
        WHERE "email" LIKE '%anhln%' AND ("contributionPoints" IS NULL OR "contributionPoints" = 0)
      `);
    } catch {}

    isGamificationEnsured = true;
  } catch (error) {
    console.error("Lỗi khi tự động đồng bộ Gamification schema:", error);
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

let isDiscussionEnsured = false;

/**
 * Tự động đồng bộ bảng DiscussionThread & DiscussionComment trong SQLite
 * Đảm bảo hoạt động ngay lập tức trên Docker VPS mà không cần chạy migration thủ công
 */
export async function ensureDiscussionSchema() {
  if (isDiscussionEnsured) return;

  try {
    // 1. Tạo bảng DiscussionThread
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DiscussionThread" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'embedded-mcu',
        "flair" TEXT NOT NULL DEFAULT 'thao-luan',
        "author" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "authorRole" TEXT DEFAULT 'user',
        "authorAvatar" TEXT DEFAULT '👤',
        "authorTitle" TEXT DEFAULT 'Thành viên',
        "content" TEXT NOT NULL,
        "codeSnippet" TEXT,
        "attachedFiles" TEXT,
        "hasSimulatorPreview" BOOLEAN NOT NULL DEFAULT 0,
        "simulatorCode" TEXT,
        "votes" INTEGER NOT NULL DEFAULT 1,
        "viewsCount" INTEGER NOT NULL DEFAULT 0,
        "repliesCount" INTEGER NOT NULL DEFAULT 0,
        "reactions" TEXT DEFAULT '{"ung":0,"gach":0,"ung_bung":0,"haha":0,"nguong_mo":0}',
        "isPinned" BOOLEAN NOT NULL DEFAULT 0,
        "tags" TEXT DEFAULT '[]',
        "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Tạo bảng DiscussionComment
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DiscussionComment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "threadId" TEXT NOT NULL,
        "parentId" TEXT,
        "author" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "authorRole" TEXT DEFAULT 'user',
        "authorAvatar" TEXT DEFAULT '👤',
        "authorTitle" TEXT DEFAULT 'Thành viên',
        "content" TEXT NOT NULL,
        "quoteContent" TEXT,
        "quoteAuthor" TEXT,
        "attachedFiles" TEXT,
        "votes" INTEGER NOT NULL DEFAULT 0,
        "reactions" TEXT DEFAULT '{"ung":0,"gach":0,"ung_bung":0}',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DiscussionComment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "DiscussionThread" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // 3. Tạo index
    try {
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "DiscussionThread_category_idx" ON "DiscussionThread"("category")
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "DiscussionThread_createdAt_idx" ON "DiscussionThread"("createdAt")
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "DiscussionComment_threadId_idx" ON "DiscussionComment"("threadId")
      `);
    } catch {}

    isDiscussionEnsured = true;
  } catch (error) {
    console.error("Lỗi khi tự động đồng bộ Discussion schema:", error);
  }
}
