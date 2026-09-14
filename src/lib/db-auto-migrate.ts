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
    // Model TutorialTopic
    `ALTER TABLE "TutorialTopic" ADD COLUMN "titleEn" TEXT;`,
    `ALTER TABLE "TutorialTopic" ADD COLUMN "descriptionEn" TEXT;`,
    `ALTER TABLE "TutorialTopic" ADD COLUMN "authorAvatar" TEXT DEFAULT '/images/logo.png';`,
    `ALTER TABLE "TutorialTopic" ADD COLUMN "authorEmail" TEXT;`,
    `ALTER TABLE "TutorialTopic" ADD COLUMN "authorId" TEXT;`,
    `ALTER TABLE "TutorialTopic" ADD COLUMN "authorRole" TEXT DEFAULT 'admin';`,
    // Model TutorialArticle
    `ALTER TABLE "TutorialArticle" ADD COLUMN "titleEn" TEXT;`,
    `ALTER TABLE "TutorialArticle" ADD COLUMN "summaryEn" TEXT;`,
    `ALTER TABLE "TutorialArticle" ADD COLUMN "contentHtmlEn" TEXT;`,
    `ALTER TABLE "TutorialArticle" ADD COLUMN "authorName" TEXT DEFAULT 'Embedded-AIoT Lab PTIT';`,
    `ALTER TABLE "TutorialArticle" ADD COLUMN "authorTitle" TEXT DEFAULT 'Kỹ sư Nghiên cứu Embedded';`,
    `ALTER TABLE "TutorialArticle" ADD COLUMN "authorAvatar" TEXT DEFAULT '/images/logo.png';`,
    `ALTER TABLE "TutorialArticle" ADD COLUMN "draft" BOOLEAN DEFAULT 0;`,
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
