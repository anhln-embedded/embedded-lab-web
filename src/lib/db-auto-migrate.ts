import prisma from "@/lib/prisma";

let isMigrated = false;

/**
 * Tự động kiểm tra và bổ sung các cột SQLite còn thiếu (backward compatibility).
 * Đảm bảo hệ thống tự phục hồi schema trên Production Server ngay cả khi
 * database SQLite cũ chưa kịp chạy `prisma db push`.
 */
export async function ensureSqliteSchema() {
  if (isMigrated) return;

  const alterStatements = [
    // Model Course
    `ALTER TABLE "Course" ADD COLUMN "titleEn" TEXT;`,
    `ALTER TABLE "Course" ADD COLUMN "descriptionEn" TEXT;`,
    // Model CourseModule
    `ALTER TABLE "CourseModule" ADD COLUMN "moduleEn" TEXT;`,
    // Model Lesson
    `ALTER TABLE "Lesson" ADD COLUMN "titleEn" TEXT;`,
    `ALTER TABLE "Lesson" ADD COLUMN "summaryEn" TEXT;`,
    `ALTER TABLE "Lesson" ADD COLUMN "contentHtmlEn" TEXT;`,
    `ALTER TABLE "Lesson" ADD COLUMN "contentMarkdown" TEXT;`,
    `ALTER TABLE "Lesson" ADD COLUMN "contentMarkdownEn" TEXT;`,
  ];

  for (const sql of alterStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch {
      // Bỏ qua lỗi nếu cột đã tồn tại (duplicate column name)
    }
  }

  isMigrated = true;
}
