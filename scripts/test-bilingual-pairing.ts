import fs from "fs";
import path from "path";
import { pairBilingualMarkdownFiles } from "../src/lib/markdown-importer";

const baseDir = "F:/Advance_C/stm32f103c8";
const viDir = path.join(baseDir, "vi");
const enDir = path.join(baseDir, "en");

const files: Array<{ name: string; content: string }> = [];

if (fs.existsSync(viDir)) {
  const viFiles = fs.readdirSync(viDir).filter((f) => f.endsWith(".md"));
  viFiles.forEach((f) => {
    files.push({
      name: `vi/${f}`,
      content: fs.readFileSync(path.join(viDir, f), "utf-8"),
    });
  });
}

if (fs.existsSync(enDir)) {
  const enFiles = fs.readdirSync(enDir).filter((f) => f.endsWith(".md"));
  enFiles.forEach((f) => {
    files.push({
      name: `en/${f}`,
      content: fs.readFileSync(path.join(enDir, f), "utf-8"),
    });
  });
}

// Fallback to root if vi doesn't exist
if (files.length === 0) {
  const rootFiles = fs.readdirSync(baseDir).filter((f) => f.endsWith(".md") && !f.toLowerCase().includes("readme"));
  rootFiles.forEach((f) => {
    files.push({
      name: f,
      content: fs.readFileSync(path.join(baseDir, f), "utf-8"),
    });
  });
}

console.log(`Tìm thấy tổng cộng ${files.length} file .md từ cấu trúc thư mục.`);
const paired = pairBilingualMarkdownFiles(files);
console.log(`Đã ghép thành ${paired.length} bài học:`);

paired.slice(0, 5).forEach((p) => {
  console.log(`\n--- BÀI ${p.lessonNumber} [Status: ${p.status}] ---`);
  console.log(`  🇻🇳 Title VI: ${p.title}`);
  console.log(`     File VI:  ${p.filenameVi}`);
  console.log(`     HTML VI Length: ${p.contentHtml?.length || 0}`);
  console.log(`  🇬🇧 Title EN: ${p.titleEn || "(chưa có)"}`);
  console.log(`     File EN:  ${p.filenameEn || "(chưa có)"}`);
  console.log(`     HTML EN Length: ${p.contentHtmlEn?.length || 0}`);
});
