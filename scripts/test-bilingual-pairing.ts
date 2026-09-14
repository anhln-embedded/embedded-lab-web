import fs from "fs";
import path from "path";
import { pairBilingualMarkdownFiles } from "../src/lib/markdown-importer";

const dir = "F:/Advance_C/stm32f103c8";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".md")).map(f => ({
  name: f,
  content: fs.readFileSync(path.join(dir, f), "utf-8")
}));

console.log(`Tìm thấy tổng cộng ${files.length} file .md`);
const paired = pairBilingualMarkdownFiles(files);
console.log(`Đã ghép thành ${paired.length} bài học:`);

paired.slice(0, 3).forEach(p => {
  console.log(`\n--- BÀI ${p.lessonNumber} [Status: ${p.status}] ---`);
  console.log(`  🇻🇳 Title VI: ${p.title}`);
  console.log(`     File VI:  ${p.filenameVi}`);
  console.log(`     HTML VI Length: ${p.contentHtml?.length || 0}`);
  console.log(`  🇬🇧 Title EN: ${p.titleEn || "(chưa có)"}`);
  console.log(`     File EN:  ${p.filenameEn || "(chưa có)"}`);
  console.log(`     HTML EN Length: ${p.contentHtmlEn?.length || 0}`);
});
