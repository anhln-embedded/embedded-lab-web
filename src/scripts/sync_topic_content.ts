import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";
import { parseSingleMarkdownArticle } from "../lib/markdown-importer";

async function main() {
  const dir = "F:/Advance_C";
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  console.log(`Đang phân tích ${files.length} bài từ ${dir}...`);
  const parsedArticles = files.map((file, idx) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    return parseSingleMarkdownArticle(raw, idx + 1, file);
  });

  const mainSlug = "lap-trinh-c-cpp-he-thong-nhung-chuyen-sau";
  let topic = await prisma.tutorialTopic.findUnique({
    where: { slug: mainSlug },
  });

  if (!topic) {
    topic = await prisma.tutorialTopic.findFirst({
      where: { title: { contains: "Lập Trình C & C++ Hệ Thống Nhúng Chuyên Sâu" } },
    });
  }

  if (!topic) {
    console.error("Không tìm thấy topic nào phù hợp!");
    return;
  }

  console.log(`Đang cập nhật 24 bài viết cho topic: "${topic.title}" (ID: ${topic.id}, Slug: ${topic.slug})...`);

  // Xóa bài cũ và chèn lại với Dual-Theme Code Blocks mới
  await prisma.tutorialArticle.deleteMany({
    where: { topicId: topic.id },
  });

  for (let i = 0; i < parsedArticles.length; i++) {
    const p = parsedArticles[i];
    await prisma.tutorialArticle.create({
      data: {
        title: p.title,
        slug: p.slug,
        readTime: p.readTime,
        summary: p.summary,
        contentHtml: p.contentHtml,
        codeSnippet: p.codeSnippet || null,
        codeLang: p.codeLang || "c",
        codeFilename: p.codeFilename || "main.c",
        order: i,
        draft: false,
        topicId: topic.id,
      },
    });
  }

  // Dọn dẹp topic trùng
  const duplicates = await prisma.tutorialTopic.findMany({
    where: {
      slug: { startsWith: "lap-trinh-c-cpp-he-thong-nhung-chuyen-sau-" },
    },
  });
  for (const dup of duplicates) {
    await prisma.tutorialTopic.delete({ where: { id: dup.id } });
    console.log(`Đã dọn dẹp topic trùng: ${dup.slug}`);
  }

  console.log("✅ ĐÃ ĐỒNG BỘ THÀNH CÔNG TOÀN BỘ 24 BÀI CHUYÊN ĐỀ VÀO DATABASE VỚI DUAL-THEME CODE BLOCKS!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
