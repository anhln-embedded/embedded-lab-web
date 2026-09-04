/**
 * Embedded-AIoT Lab - Smart Markdown Parser & Importer for Tutorials
 * Tự động chuyển đổi văn bản Markdown từ Notion / ChatGPT / Docs sang định dạng chuẩn Lab
 */

import { highlightCodeWithLineNumbers } from "./syntax-highlighter";

function safeBase64Encode(str: string): string {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "utf-8").toString("base64");
    }
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return encodeURIComponent(str);
  }
}

export interface ParsedPost {
  title: string;
  slug: string;
  readTime: string;
  summary: string;
  contentHtml: string;
  codeSnippet: string;
  codeLang: string;
  codeFilename: string;
}

export interface ParsedTopicBundle {
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  posts: ParsedPost[];
}

export interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Tạo slug an toàn cho Heading ID
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Định dạng nội dung bên trong từng ô bảng và văn bản thường (Bold, Code, Links, LaTeX)
 */
function formatInlineMarkdown(text: string): string {
  if (!text) return "";
  let c = text;
  c = c.replace(/\$\\rightarrow\$/g, "→");
  c = c.replace(/\$\\leftarrow\$/g, "←");
  c = c.replace(/\$\\Rightarrow\$/g, "⇒");
  c = c.replace(/\$\\Leftarrow\$/g, "⇐");
  c = c.replace(/->/g, "→");
  c = c.replace(/<-/g, "←");
  c = c.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  c = c.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>');
  c = c.replace(/___(.*?)___/g, '<strong><em>$1</em></strong>');
  c = c.replace(/__(.*?)__/g, '<strong class="font-bold text-text-primary">$1</strong>');
  c = c.replace(/\*(.*?)\*/g, '<em>$1</em>');
  c = c.replace(/_([^_]+)_/g, '<em>$1</em>');
  c = c.replace(/~~(.*?)~~/g, '<del class="line-through text-text-muted">$1</del>');
  c = c.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-bg-elevated border border-border text-accent font-mono text-[11px] font-semibold">$1</code>');
  c = c.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline font-semibold">$1</a>');
  return c;
}

/**
 * Phân tích và chuyển đổi Bảng Markdown sang HTML <table> chuẩn phong cách Lab
 */
function parseMarkdownTables(markdown: string): string {
  if (!markdown) return "";

  const normalized = markdown.replace(/\r\n/g, "\n");
  const tableBlockRegex = /(?:^[ \t]*\|[^\n]+\|[ \t]*(?:\n[ \t]*\|[^\n]+\|[ \t]*)+)/gm;

  return normalized.replace(tableBlockRegex, (match) => {
    const rawLines = match.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (rawLines.length < 2) return match;

    // Header cells (dòng 0)
    const headerCells = rawLines[0]
      .split("|")
      .slice(1, -1)
      .map((c) => formatInlineMarkdown(c.trim()));

    // Separator (dòng 1)
    const isSeparator = /^\|(?:\s*:?-+:?\s*\|)+$/.test(rawLines[1]);
    if (!isSeparator) return match;

    // Body rows (từ dòng 2 trở đi)
    const bodyRows = rawLines.slice(2).map((line) => {
      return line
        .split("|")
        .slice(1, -1)
        .map((c) => formatInlineMarkdown(c.trim()));
    });

    const theadHtml = `
      <thead class="bg-bg-elevated/90 border-b border-border text-accent font-bold text-xs uppercase tracking-wider">
        <tr>
          ${headerCells.map((h) => `<th class="py-3 px-4 font-extrabold text-accent text-left">${h || "&nbsp;"}</th>`).join("")}
        </tr>
      </thead>
    `;

    const tbodyHtml = `
      <tbody class="divide-y divide-border/60 bg-bg-panel/40 text-xs sm:text-sm">
        ${bodyRows
          .map(
            (row) => `
          <tr class="hover:bg-bg-elevated/30 transition-colors">
            ${row
              .map(
                (cell, cIdx) =>
                  `<td class="py-3 px-4 ${cIdx === 0 ? "font-bold text-text-primary" : "text-text-secondary"} leading-relaxed">${cell || "&nbsp;"}</td>`
              )
              .join("")}
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;

    return `
      <div class="my-6 overflow-x-auto rounded-2xl border border-border/80 shadow-xl bg-bg-panel">
        <table class="w-full text-left border-collapse min-w-[500px]">
          ${theadHtml}
          ${tbodyHtml}
        </table>
      </div>
    `;
  });
}

/**
 * Trích xuất danh sách Headings (H2, H3) phục vụ Table of Contents theo đúng thứ tự xuất hiện
 */
export function extractHeadingsFromContent(htmlOrMarkdown: string): HeadingItem[] {
  if (!htmlOrMarkdown) return [];
  const headings: HeadingItem[] = [];

  // 1. Quét HTML theo thứ tự xuất hiện thẻ h2 / h3
  const htmlHeadingRegex = /<h([23])(?:\s+[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = htmlHeadingRegex.exec(htmlOrMarkdown)) !== null) {
    const level = parseInt(match[1], 10) as 2 | 3;
    const fullTag = match[0];
    const innerHtml = match[2];

    const idMatch = fullTag.match(/id="([^"]+)"/i);
    const text = innerHtml.replace(/<[^>]*>/g, "").replace(/#/g, "").trim();

    if (text) {
      const id = idMatch ? idMatch[1] : slugifyHeading(text);
      headings.push({ id, text, level });
    }
  }

  if (headings.length > 0) return headings;

  // 2. Nếu là Markdown thô
  const lines = htmlOrMarkdown.split("\n");
  lines.forEach((line) => {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      const text = h2[1].trim();
      headings.push({ id: slugifyHeading(text), text, level: 2 });
      return;
    }
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const text = h3[1].trim();
      headings.push({ id: slugifyHeading(text), text, level: 3 });
    }
  });

  return headings;
}

/**
 * Chuyển đổi Markdown thô thành HTML chuẩn phong cách Lab
 * Hỗ trợ: Fenced Code Blocks (C/C++, Python...), Bảng Markdown, Callout Tip/Warn/Note, Mermaid, LaTeX
 */
export function markdownToLabHtml(markdown: string): string {
  if (!markdown) return "";

  const placeholders: { [key: string]: string } = {};
  let tokenCounter = 0;

  const createToken = (htmlContent: string) => {
    const token = `@@@LAB_BLOCK_TOKEN_${tokenCounter++}@@@`;
    placeholders[token] = htmlContent;
    return `\n\n${token}\n\n`;
  };

  // Chuẩn hóa ký tự ngắt dòng
  let content = "\n" + markdown.replace(/\r\n/g, "\n") + "\n";

  // =========================================================================
  // BƯỚC 1: Trích xuất Fenced Code Blocks (```lang filename="..." ... ```)
  // Sử dụng [ \t] thay vì \s để không nuốt dòng đầu tiên của code thành filename!
  // =========================================================================
  const codeBlockRegex = /^[ \t]*```([a-zA-Z0-9_\-\.]+)?(?:[ \t]+(?:filename=)?["']?([^"'\r\n]+)["']?)?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```[ \t]*$/gm;

  content = content.replace(codeBlockRegex, (_, rawLang, rawFilename, codeText) => {
    const lang = (rawLang || "c").toLowerCase().trim();
    let code = codeText || "";

    // Xử lý riêng khối Mermaid Diagram
    if (lang === "mermaid") {
      const mermaidHtml = `
        <div class="my-6 rounded-2xl border border-accent/40 bg-bg-panel overflow-hidden shadow-xl">
          <div class="flex items-center justify-between px-4 py-2.5 bg-bg-elevated border-b border-border text-xs">
            <div class="flex items-center gap-2 font-bold text-accent">
              <span class="text-base">⚡</span>
              <span>Sơ Đồ Thuật Toán & Luồng Xử Lý (Mermaid Flowchart)</span>
            </div>
          </div>
          <div class="p-4 sm:p-5 bg-[#0b101b] overflow-x-auto text-xs font-mono text-cyan-300 leading-relaxed border-b border-border/40">
            <pre class="m-0 p-0 bg-transparent"><code>${escapeHtml(code)}</code></pre>
          </div>
          <div class="px-4 py-2 bg-bg-panel text-[11px] text-text-muted italic flex items-center justify-between">
            <span>Sơ đồ đồ thị luồng xử lý vi điều khiển</span>
          </div>
        </div>
      `;
      return createToken(mermaidHtml);
    }

    // Kiểm tra rawFilename: Tuyệt đối không để câu lệnh code / tên hàm lọt lên tiêu đề!
    let filename = "";
    if (rawFilename) {
      const trimmed = rawFilename.trim();
      const isCodeStatement = /[;{}()=*/\\#<>|&+]/.test(trimmed) || trimmed.startsWith("//") || trimmed.includes("/*");
      const hasFileExt = /\.(c|h|cpp|hpp|py|rs|v|sv|sh|bash|txt|json|md|makefile)$/i.test(trimmed);

      if (!isCodeStatement && (hasFileExt || (!trimmed.includes(" ") && trimmed.length < 32))) {
        filename = trimmed;
      } else {
        // Nếu chuỗi chứa cú pháp code, đẩy trả về làm dòng đầu tiên của khối code bên dưới!
        code = trimmed + "\n" + code;
      }
    }

    // Tự động phát hiện nếu nội dung thực chất là C/C++ dù tác giả ghi là ```bash hoặc để trống
    let effectiveLang = (rawLang || "c").toLowerCase().trim();
    const isCCode = /\b(int\s+main|typedef\s+struct|char\*|const\s+int|uint32_t|uint8_t|#include|printf\s*\(|void\s+\w+\s*\(|static\s+int|return\s+0;?|data\s+dt)\b/.test(code);
    if ((effectiveLang === "bash" || effectiveLang === "sh" || effectiveLang === "text" || !effectiveLang) && isCCode) {
      effectiveLang = "c";
    }

    if (!filename) {
      if (effectiveLang === "c") filename = "source.c";
      else if (effectiveLang === "cpp") filename = "main.cpp";
      else if (effectiveLang === "python") filename = "script.py";
      else if (effectiveLang === "bash") filename = "terminal.sh";
      else filename = `${effectiveLang || "code"}.txt`;
    }

    const langLabel =
      effectiveLang === "c"
        ? "C (Embedded)"
        : effectiveLang === "cpp"
        ? "C++ (ESP32)"
        : effectiveLang === "python"
        ? "Python"
        : effectiveLang === "rust"
        ? "Rust"
        : effectiveLang === "bash"
        ? "Bash / Shell"
        : effectiveLang.toUpperCase();

    const highlightedCodeHtml = highlightCodeWithLineNumbers(code, effectiveLang, true);
    const b64Code = safeBase64Encode(code);

    // Giao diện khối code mới: XÓA 3 CHẤM MÀU MAC, Header tinh tế, toàn bộ code/tên hàm nằm ở bên dưới
    const codeCardHtml = `
      <div class="lab-code-card my-6 rounded-2xl border overflow-hidden shadow-xl group transition-all">
        <div class="lab-code-header flex items-center justify-between px-4 py-2 border-b text-xs transition-colors">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-mono font-bold text-text-primary flex items-center gap-1.5">
              <span class="text-accent text-xs">⚡</span>
              <span>${filename}</span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 font-mono">${langLabel}</span>
            <button
              type="button"
              data-lab-code="${b64Code}"
              class="lab-copy-btn px-2.5 py-1 rounded-lg bg-bg-elevated hover:bg-accent hover:text-white border border-border text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Sao chép toàn bộ mã nguồn"
            >
              <span>📋</span>
              <span class="lab-copy-label">Sao chép</span>
            </button>
          </div>
        </div>
        <div class="p-3 sm:p-4 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed scrollbar-thin">
          <pre class="m-0 p-0 bg-transparent font-mono"><code class="font-mono text-inherit">${highlightedCodeHtml}</code></pre>
        </div>
      </div>
    `;
    return createToken(codeCardHtml);
  });

  // =========================================================================
  // BƯỚC 2: Trích xuất Bảng Markdown (| col1 | col2 |)
  // =========================================================================
  const tableBlockRegex = /(?:^[ \t]*\|[^\n]+\|[ \t]*(?:\n[ \t]*\|[^\n]+\|[ \t]*)+)/gm;

  content = content.replace(tableBlockRegex, (match) => {
    const rawLines = match.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (rawLines.length < 2) return match;

    const headerCells = rawLines[0]
      .split("|")
      .slice(1, -1)
      .map((c) => formatInlineMarkdown(c.trim()));

    const isSeparator = /^\|(?:\s*:?-+:?\s*\|)+$/.test(rawLines[1]);
    if (!isSeparator) return match;

    const bodyRows = rawLines.slice(2).map((line) => {
      return line
        .split("|")
        .slice(1, -1)
        .map((c) => formatInlineMarkdown(c.trim()));
    });

    const theadHtml = `
      <thead class="bg-bg-elevated/90 border-b border-border text-accent font-bold text-xs uppercase tracking-wider">
        <tr>
          ${headerCells.map((h) => `<th class="py-3 px-4 font-extrabold text-accent text-left">${h || "&nbsp;"}</th>`).join("")}
        </tr>
      </thead>
    `;

    const tbodyHtml = `
      <tbody class="divide-y divide-border/60 bg-bg-panel/40 text-xs sm:text-sm">
        ${bodyRows
          .map(
            (row) => `
          <tr class="hover:bg-bg-elevated/30 transition-colors">
            ${row
              .map(
                (cell, cIdx) =>
                  `<td class="py-3 px-4 ${cIdx === 0 ? "font-bold text-text-primary" : "text-text-secondary"} leading-relaxed">${cell || "&nbsp;"}</td>`
              )
              .join("")}
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;

    const tableHtml = `
      <div class="my-6 overflow-x-auto rounded-2xl border border-border/80 shadow-xl bg-bg-panel">
        <table class="w-full text-left border-collapse min-w-[500px]">
          ${theadHtml}
          ${tbodyHtml}
        </table>
      </div>
    `;
    return createToken(tableHtml);
  });

  // =========================================================================
  // BƯỚC 3: Trích xuất Callout Blocks (> [!TIP], > [!NOTE], > [!WARNING])
  // =========================================================================
  const calloutBlockRegex = /(?:^[ \t]*>[^\n]*(?:\n[ \t]*>[^\n]*)*)/gm;

  content = content.replace(calloutBlockRegex, (match) => {
    const rawLines = match.split("\n").map((l) => l.replace(/^[ \t]*>[ \t]?/, ""));
    const firstLine = rawLines[0] || "";

    const isTip = /^\[!TIP\]/i.test(firstLine);
    const isNote = /^\[!NOTE\]|^\[!INFO\]/i.test(firstLine);
    const isImportant = /^\[!IMPORTANT\]/i.test(firstLine);
    const isWarning = /^\[!WARNING\]|^\[!CAUTION\]|^\[!DANGER\]/i.test(firstLine);

    let title = "";
    let icon = "💡";
    let borderClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
    let remainingLines = rawLines;

    if (isTip) {
      title = "Mẹo Tối Ưu Kỹ Thuật (Nhúng & AIoT)";
      icon = "💡";
      borderClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
      remainingLines = [firstLine.replace(/^\[!TIP\]\s*/i, ""), ...rawLines.slice(1)];
    } else if (isNote) {
      title = "Ghi Chú Kỹ Thuật";
      icon = "ℹ️";
      borderClass = "border-cyan-500 bg-cyan-500/10 text-cyan-400";
      remainingLines = [firstLine.replace(/^\[!(?:NOTE|INFO)\]\s*/i, ""), ...rawLines.slice(1)];
    } else if (isImportant) {
      title = "Lưu Ý Quan Trọng";
      icon = "⚠️";
      borderClass = "border-amber-500 bg-amber-500/10 text-amber-400";
      remainingLines = [firstLine.replace(/^\[!IMPORTANT\]\s*/i, ""), ...rawLines.slice(1)];
    } else if (isWarning) {
      title = "Cảnh Báo Phần Cứng / Crash Hệ Thống";
      icon = "🚨";
      borderClass = "border-red-500 bg-red-500/10 text-red-400";
      remainingLines = [firstLine.replace(/^\[!(?:WARNING|CAUTION|DANGER)\]\s*/i, ""), ...rawLines.slice(1)];
    } else {
      // Blockquote thông thường
      const innerText = rawLines.map((l) => formatInlineMarkdown(l)).join("<br />");
      const quoteHtml = `
        <blockquote class="my-6 p-5 sm:p-6 rounded-2xl bg-bg-elevated/80 border-l-4 border-accent text-sm sm:text-base text-text-secondary leading-relaxed shadow-md italic">
          ${innerText}
        </blockquote>
      `;
      return createToken(quoteHtml);
    }

    const bodyText = remainingLines
      .filter((l) => l.trim().length > 0)
      .map((l) => formatInlineMarkdown(l))
      .join("<br />");

    const calloutHtml = `
      <div class="my-6 p-5 sm:p-6 rounded-2xl border-l-4 ${borderClass} text-sm sm:text-base text-text-secondary shadow-md leading-relaxed">
        <div class="flex items-center gap-2 font-bold mb-1.5 text-sm sm:text-base">
          <span>${icon}</span>
          <span>${title}</span>
        </div>
        <div class="leading-relaxed text-xs sm:text-sm text-text-primary/90 mt-1">
          ${bodyText}
        </div>
      </div>
    `;
    return createToken(calloutHtml);
  });

  // =========================================================================
  // BƯỚC 4: Đường kẻ phân cách ngang (---)
  // =========================================================================
  content = content.replace(/^\s*---\s*$/gm, () => {
    return createToken('<hr class="my-8 border-t border-border/80" />');
  });

  // =========================================================================
  // BƯỚC 5: Tiêu đề Headings (# H1 -> H2, ## H2, ### H3, #### H4)
  // =========================================================================
  content = content.replace(/^# (.*$)/gm, (_, text) => {
    const cleanText = text.trim();
    const id = slugifyHeading(cleanText);
    return createToken(
      `<h2 id="${id}" class="scroll-mt-28 text-2xl sm:text-3xl font-extrabold text-text-primary mt-12 mb-6 flex items-center gap-2.5 tracking-tight group"><span class="w-2 h-7 bg-accent rounded-full inline-block mr-1 flex-shrink-0"></span><span>${formatInlineMarkdown(cleanText)}</span><a href="#${id}" class="opacity-0 group-hover:opacity-100 text-accent/60 hover:text-accent ml-2 text-base transition-opacity">#</a></h2>`
    );
  });

  content = content.replace(/^## (.*$)/gm, (_, text) => {
    const cleanText = text.trim();
    const id = slugifyHeading(cleanText);
    return createToken(
      `<h2 id="${id}" class="scroll-mt-28 text-xl sm:text-2xl font-extrabold text-text-primary mt-12 mb-5 pb-3 border-b border-border/80 tracking-tight flex items-center justify-between group"><span>${formatInlineMarkdown(cleanText)}</span><a href="#${id}" class="opacity-0 group-hover:opacity-100 text-accent/60 hover:text-accent text-base transition-opacity font-mono">#</a></h2>`
    );
  });

  content = content.replace(/^### (.*$)/gm, (_, text) => {
    const cleanText = text.trim();
    const id = slugifyHeading(cleanText);
    return createToken(
      `<h3 id="${id}" class="scroll-mt-28 text-lg sm:text-xl font-bold text-accent mt-8 mb-4 flex items-center gap-2 group"><span class="w-2 h-2 rounded-full bg-accent inline-block flex-shrink-0"></span><span>${formatInlineMarkdown(cleanText)}</span><a href="#${id}" class="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent ml-2 text-sm transition-opacity font-mono">#</a></h3>`
    );
  });

  content = content.replace(/^#### (.*$)/gm, (_, text) => {
    const cleanText = text.trim();
    return createToken(
      `<h4 class="text-base font-bold text-text-primary mt-6 mb-3">${formatInlineMarkdown(cleanText)}</h4>`
    );
  });

  // =========================================================================
  // BƯỚC 6: Images (![Caption](url) & <img src="..." />)
  // =========================================================================
  // 6.1 Xử lý thẻ HTML img thô: <p align="center"><img ...></p> hoặc <img ...>
  content = content.replace(/<p[^>]*>\s*<img\s+([^>]+)>\s*<\/p>/gi, (_, attrs) => {
    const srcMatch = attrs.match(/src\s*=\s*["']?([^"'\s>]+)["']?/i);
    const altMatch = attrs.match(/alt\s*=\s*["']?([^"'>]*)["']?/i);
    const src = srcMatch ? srcMatch[1] : "";
    const alt = altMatch ? altMatch[1] : "";
    if (!src) return "";
    return createToken(`
      <figure class="my-8 text-center">
        <img src="${src}" alt="${alt}" class="rounded-2xl border border-border/80 shadow-2xl max-h-[520px] mx-auto object-contain bg-bg-panel/60 p-2" loading="lazy" />
        ${alt ? `<figcaption class="mt-2.5 text-xs text-text-muted italic font-medium flex items-center justify-center gap-1"><span>📷</span><span>${alt}</span></figcaption>` : ""}
      </figure>
    `);
  });

  content = content.replace(/<img\s+([^>]+)>/gi, (_, attrs) => {
    const srcMatch = attrs.match(/src\s*=\s*["']?([^"'\s>]+)["']?/i);
    const altMatch = attrs.match(/alt\s*=\s*["']?([^"'>]*)["']?/i);
    const src = srcMatch ? srcMatch[1] : "";
    const alt = altMatch ? altMatch[1] : "";
    if (!src) return "";
    return createToken(`
      <figure class="my-8 text-center">
        <img src="${src}" alt="${alt}" class="rounded-2xl border border-border/80 shadow-2xl max-h-[520px] mx-auto object-contain bg-bg-panel/60 p-2" loading="lazy" />
        ${alt ? `<figcaption class="mt-2.5 text-xs text-text-muted italic font-medium flex items-center justify-center gap-1"><span>📷</span><span>${alt}</span></figcaption>` : ""}
      </figure>
    `);
  });

  content = content.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, src) => {
    const captionHtml = alt
      ? `<figcaption class="mt-2.5 text-xs text-text-muted italic font-medium flex items-center justify-center gap-1"><span>📷</span><span>${alt}</span></figcaption>`
      : "";
    const imgHtml = `
      <figure class="my-8 text-center">
        <img src="${src}" alt="${alt}" class="rounded-2xl border border-border/80 shadow-2xl max-h-[520px] mx-auto object-contain bg-bg-panel/60 p-2" loading="lazy" />
        ${captionHtml}
      </figure>
    `;
    return createToken(imgHtml);
  });

  // =========================================================================
  // BƯỚC 7: Danh sách Lists (Unordered & Ordered, hỗ trợ -, *, +)
  // =========================================================================
  const ulBlockRegex = /(?:^[ \t]*[-*+]\s+[^\n]+(?:\n[ \t]*[-*+]\s+[^\n]+)*)/gm;
  content = content.replace(ulBlockRegex, (match) => {
    const items = match
      .split("\n")
      .map((l) => l.replace(/^[ \t]*[-*+]\s+/, "").trim())
      .filter(Boolean);
    const ulHtml = `
      <ul class="my-4 space-y-2 pl-2">
        ${items
          .map(
            (item) =>
              `<li class="text-xs sm:text-sm text-text-secondary leading-relaxed flex items-start gap-2.5"><span class="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></span><span>${formatInlineMarkdown(item)}</span></li>`
          )
          .join("")}
      </ul>
    `;
    return createToken(ulHtml);
  });

  const olBlockRegex = /(?:^[ \t]*\d+\.\s+[^\n]+(?:\n[ \t]*\d+\.\s+[^\n]+)*)/gm;
  content = content.replace(olBlockRegex, (match) => {
    const items = match
      .split("\n")
      .map((l) => l.replace(/^[ \t]*\d+\.\s+/, "").trim())
      .filter(Boolean);
    const olHtml = `
      <ol class="my-4 space-y-2 pl-2">
        ${items
          .map(
            (item, i) =>
              `<li class="text-xs sm:text-sm text-text-secondary leading-relaxed flex items-start gap-2.5"><span class="font-mono text-accent font-bold text-xs mt-0.5 flex-shrink-0">${i + 1}.</span><span>${formatInlineMarkdown(item)}</span></li>`
          )
          .join("")}
      </ol>
    `;
    return createToken(olHtml);
  });

  // =========================================================================
  // BƯỚC 8: Đoạn văn Paragraphs
  // =========================================================================
  const rawParagraphs = content.split(/\n\s*\n/);
  const formattedParagraphs = rawParagraphs.map((para) => {
    const trimmed = para.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("@@@LAB_BLOCK_TOKEN_")) {
      return trimmed;
    }
    // Nếu khối đã là thẻ HTML block-level thì không bọc thêm thẻ <p>
    const isBlockHtml = /^\s*<(?:h[1-6]|div|p|table|blockquote|pre|ul|ol|hr|section|article|header|footer)\b/i.test(trimmed);
    if (isBlockHtml) {
      return trimmed;
    }
    // Format inline markdown cho đoạn văn
    const lines = trimmed.split("\n").map((l) => formatInlineMarkdown(l.trim())).join("<br />");
    return `<p class="text-xs sm:text-sm text-text-secondary leading-relaxed my-3">${lines}</p>`;
  });

  let finalHtml = formattedParagraphs.filter(Boolean).join("\n\n");

  // =========================================================================
  // BƯỚC 9: Phục hồi lại toàn bộ Tokens đã lưu
  // =========================================================================
  Object.keys(placeholders).forEach((token) => {
    finalHtml = finalHtml.replaceAll(token, placeholders[token]);
  });

  return finalHtml;
}


/**
 * Phân tích cú pháp 1 bài Markdown đơn lẻ
 */
/**
 * Phân tích cú pháp 1 bài Markdown đơn lẻ với hỗ trợ trích xuất thông minh từ tên file
 */
export function parseSingleMarkdownArticle(
  rawMarkdown: string,
  defaultOrder: number = 1,
  sourceFilename?: string
): ParsedPost {
  let title = `Bài ${defaultOrder}: Tiêu đề bài viết`;
  let summary = "";
  let codeSnippet = "";
  let codeLang = "c";
  let codeFilename = "main.c";

  let cleanMarkdown = rawMarkdown;

  // 1. Chỉ tách Hero Code Snippet nếu có `filename="..."` chỉ định rõ ràng trên block
  const codeBlockRegex = /```([a-zA-Z0-9_\-\.]+)?(?:[ \t]+(?:filename=)?["']?([^"'\r\n]+)["']?)?\r?\n([\s\S]*?)```/;
  const codeMatch = rawMarkdown.match(codeBlockRegex);

  if (codeMatch) {
    const rawLang = codeMatch[1]?.toLowerCase() || "c";
    const rawFilename = codeMatch[2]?.trim() || "";
    const codeBody = codeMatch[3]?.trim() || "";

    let explicitFilename = "";
    if (rawFilename) {
      const isCodeStatement = /[;{}()=*/\\#<>|&+]/.test(rawFilename) || rawFilename.startsWith("//") || rawFilename.includes("/*");
      const hasFileExt = /\.(c|h|cpp|hpp|py|rs|v|sv|sh|bash|txt|json|md|makefile)$/i.test(rawFilename);
      if (!isCodeStatement && (hasFileExt || (!rawFilename.includes(" ") && rawFilename.length < 32))) {
        explicitFilename = rawFilename;
      }
    }

    // Chỉ tách khỏi nội dung chính nếu có filename="..." hợp lệ chỉ định rõ
    if (explicitFilename) {
      codeLang = rawLang;
      codeFilename = explicitFilename;
      codeSnippet = codeBody;
      cleanMarkdown = rawMarkdown.replace(codeBlockRegex, "").trim();
    }
  }

  // 2. Tìm Title (# Title) trong nội dung
  const titleMatch = cleanMarkdown.match(/^#\s+(.+)$/m);
  let rawH1 = titleMatch ? titleMatch[1].trim() : "";

  // 3. Trích xuất tiêu đề thông minh kết hợp filename và H1
  let lessonOrder = defaultOrder;
  let topicFromFilename = "";

  if (sourceFilename) {
    const baseName = sourceFilename.replace(/\.[^/.]+$/, "").trim();
    // Bóc tách số bài: "Bai 02. bitmask", "02-memory-layout", "bai_03"
    const baiMatch = baseName.match(/^Bai\s*(\d+)[\.\s_-]*(.*)$/i);
    const numMatch = baseName.match(/^(\d+)[\.\s_-]+(.*)$/);

    if (baiMatch) {
      lessonOrder = parseInt(baiMatch[1], 10);
      topicFromFilename = baiMatch[2].trim();
    } else if (numMatch) {
      lessonOrder = parseInt(numMatch[1], 10);
      topicFromFilename = numMatch[2].trim();
    } else {
      topicFromFilename = baseName;
    }

    if (topicFromFilename) {
      topicFromFilename = topicFromFilename.charAt(0).toUpperCase() + topicFromFilename.slice(1);
    }
  }

  // Kiểm tra xem rawH1 có phải là tiêu đề chung chung (generic) không
  const isGenericH1 = !rawH1 || 
    /^\s*\d+[\.\)]\s*(khái niệm|tổng quan|giới thiệu|định nghĩa|mục tiêu)/i.test(rawH1) ||
    /^\s*(khái niệm|tổng quan|giới thiệu|định nghĩa|mục tiêu)\s*$/i.test(rawH1) ||
    /^\s*\d+[\.\s]/i.test(rawH1);

  if (topicFromFilename) {
    if (rawH1 && !isGenericH1 && !rawH1.toLowerCase().includes(topicFromFilename.toLowerCase())) {
      title = `Bài ${lessonOrder}: ${topicFromFilename} - ${rawH1}`;
    } else if (topicFromFilename) {
      title = `Bài ${lessonOrder}: ${topicFromFilename}`;
    }
  } else if (rawH1) {
    if (!rawH1.toLowerCase().startsWith("bài")) {
      title = `Bài ${lessonOrder}: ${rawH1}`;
    } else {
      title = rawH1;
    }
  }

  // Xóa dòng H1 đầu tiên khỏi cleanMarkdown nếu có
  if (titleMatch) {
    cleanMarkdown = cleanMarkdown.replace(titleMatch[0], "").trim();
  }

  // 4. Tìm Summary (> Tóm tắt: ...)
  const summaryMatch = cleanMarkdown.match(/^>\s*(?:Tóm tắt|Summary):\s*(.+)$/im);
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
    cleanMarkdown = cleanMarkdown.replace(summaryMatch[0], "").trim();
  } else {
    // Tự động trích xuất câu giới thiệu đầu tiên của bài viết làm Tóm tắt
    const textWithoutImagesOrTags = cleanMarkdown
      .replace(/<[^>]+>/g, " ")
      .replace(/!\[.*?\]\(.*?\)/g, " ")
      .replace(/```[\s\S]*?```/g, " ")
      .trim();

    const firstParaMatch = textWithoutImagesOrTags.match(/^([^#\n\r]+)/);
    if (firstParaMatch) {
      const firstSentence = firstParaMatch[1]
        .replace(/^[-\*\+]\s+/, "")
        .replace(/^[_\*]{1,3}|[_\*]{1,3}$/g, "")
        .trim();
      if (firstSentence.length > 20) {
        summary = firstSentence.length > 220
          ? firstSentence.slice(0, 217) + "..."
          : firstSentence;
      }
    }
  }

  // 5. Ước lượng thời gian đọc
  const wordsCount = cleanMarkdown.split(/\s+/).length;
  const readMinutes = Math.max(3, Math.ceil(wordsCount / 180));
  const readTime = `${readMinutes} phút`;

  // 6. Chuyển đổi phần còn lại sang HTML
  const contentHtml = markdownToLabHtml(cleanMarkdown);

  // 7. Tạo slug an toàn
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return {
    title,
    slug: slug || `bai-${lessonOrder}`,
    readTime,
    summary,
    contentHtml,
    codeSnippet,
    codeLang,
    codeFilename,
  };
}

/**
 * Phân tích chuỗi Markdown gồm nhiều bài viết
 */
export function parseMultiMarkdownArticles(rawText: string): ParsedPost[] {
  if (rawText.trim().startsWith("[") || rawText.trim().startsWith("{")) {
    try {
      const parsedJson = JSON.parse(rawText);
      const list = Array.isArray(parsedJson) ? parsedJson : parsedJson.posts || [parsedJson];
      return list.map((item: any, idx: number) => ({
        title: item.title || `Bài ${idx + 1}: Tiêu đề bài viết`,
        slug: item.slug || `bai-${idx + 1}`,
        readTime: item.readTime || "10 phút",
        summary: item.summary || "",
        contentHtml: item.contentHtml || (item.content ? markdownToLabHtml(item.content) : ""),
        codeSnippet: item.codeSnippet?.code || item.codeSnippet || "",
        codeLang: item.codeSnippet?.language || item.codeLang || "c",
        codeFilename: item.codeSnippet?.filename || item.codeFilename || "main.c",
      }));
    } catch {
      // Tiếp tục parse theo Markdown nếu JSON lỗi
    }
  }

  const sections = rawText.split(/\n\s*---\s*\n/);
  if (sections.length > 1) {
    return sections
      .map((sec, idx) => parseSingleMarkdownArticle(sec.trim(), idx + 1))
      .filter((p) => p.title && (p.contentHtml || p.codeSnippet));
  }

  const headerSections = rawText.split(/\n(?=#\s+)/);
  if (headerSections.length > 1) {
    return headerSections
      .map((sec, idx) => parseSingleMarkdownArticle(sec.trim(), idx + 1))
      .filter((p) => p.title && (p.contentHtml || p.codeSnippet));
  }

  return [parseSingleMarkdownArticle(rawText.trim(), 1)];
}
