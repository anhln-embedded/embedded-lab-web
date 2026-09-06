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
