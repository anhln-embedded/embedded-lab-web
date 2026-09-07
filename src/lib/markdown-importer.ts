/**
 * Embedded-AIoT Lab - Smart Markdown Parser & Importer for Tutorials
 * Tự động chuyển đổi văn bản Markdown từ Notion / ChatGPT / Docs sang định dạng chuẩn Lab
 */

import { highlightCodeWithLineNumbers } from "./syntax-highlighter";
import { Marked } from "marked";

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
  // Thoát an toàn toán tử dịch bit và so sánh để tránh trình duyệt nuốt chữ hoặc hiểu nhầm là thẻ HTML
  c = c.replace(/<</g, "&lt;&lt;");
  c = c.replace(/>>/g, "&gt;&gt;");
  c = c.replace(/\s<\s/g, " &lt; ");
  c = c.replace(/\s>\s/g, " &gt; ");
  c = c.replace(/<(\s|\d)/g, "&lt;$1");
  c = c.replace(/(\s|\d)>/g, "$1&gt;");
  c = c.replace(/<=\s/g, "&lt;= ");
  c = c.replace(/>=\s/g, "&gt;= ");

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
    // Bỏ thẻ anchor link # ở cuối, bỏ các thẻ HTML khác và loại bỏ backtick thô nếu còn sót
    const cleanInner = innerHtml
      .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/`/g, "")
      .trim();

    if (cleanInner) {
      const id = idMatch ? idMatch[1] : slugifyHeading(cleanInner);
      headings.push({ id, text: cleanInner, level });
    }
  }

  if (headings.length > 0) return headings;

  // 2. Nếu là Markdown thô
  const lines = htmlOrMarkdown.split("\n");
  lines.forEach((line) => {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      const text = h2[1].replace(/`/g, "").trim();
      headings.push({ id: slugifyHeading(text), text, level: 2 });
      return;
    }
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const text = h3[1].replace(/`/g, "").trim();
      headings.push({ id: slugifyHeading(text), text, level: 3 });
    }
  });

  return headings;
}

/**
 * Chuyển đổi Markdown thô thành HTML chuẩn phong cách Lab
 * Hỗ trợ: Fenced Code Blocks (C/C++, Python...), Bảng Markdown, Callout Tip/Warn/Note, Mermaid, LaTeX
 */
// Khởi tạo bộ biên dịch Markdown chuẩn công nghiệp (GitHub Flavored Markdown)
const labMarkedInstance = new Marked({
  gfm: true,
  breaks: false,
});

labMarkedInstance.use({
  renderer: {
    codespan({ text }) {
      return `<code class="px-1.5 py-0.5 mx-0.5 rounded bg-bg-elevated border border-border/80 text-accent font-mono text-[0.88em] font-semibold">${text}</code>`;
    },

    heading(token) {
      const { depth, tokens, text } = token;
      const content = tokens ? this.parser.parseInline(tokens) : text;
      const cleanText = text.replace(/<[^>]*>/g, "").replace(/`/g, "").trim();
      const id = slugifyHeading(cleanText);

      if (depth === 1 || depth === 2) {
        return `<h2 id="${id}" class="scroll-mt-28 text-xl sm:text-2xl font-extrabold text-text-primary mt-12 mb-5 pb-3 border-b border-border/80 tracking-tight flex items-center justify-between group"><span>${content}</span><a href="#${id}" class="opacity-0 group-hover:opacity-100 text-accent/60 hover:text-accent text-base transition-opacity font-mono">#</a></h2>\n`;
      }
      if (depth === 3) {
        return `<h3 id="${id}" class="scroll-mt-28 text-lg sm:text-xl font-bold text-accent mt-8 mb-4 flex items-center gap-2 group border-l-4 border-accent pl-3"><span>${content}</span><a href="#${id}" class="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent ml-2 text-sm transition-opacity font-mono">#</a></h3>\n`;
      }
      return `<h${depth} class="text-base font-bold text-text-primary mt-6 mb-3">${content}</h${depth}>\n`;
    },

    code({ text, lang: rawLang }) {
      const lang = (rawLang || "").toLowerCase().trim();
      if (lang === "mermaid") {
        return `
          <div class="my-6 rounded-2xl border border-accent/40 bg-bg-panel overflow-hidden shadow-xl">
            <div class="flex items-center justify-between px-4 py-2.5 bg-bg-elevated border-b border-border text-xs">
              <div class="flex items-center gap-2 font-bold text-accent">
                <span class="text-base">⚡</span>
                <span>Sơ Đồ Thuật Toán & Luồng Xử Lý (Mermaid Flowchart)</span>
              </div>
            </div>
            <div class="p-4 sm:p-5 bg-[#0b101b] overflow-x-auto text-xs font-mono text-cyan-300 leading-relaxed border-b border-border/40">
              <pre class="m-0 p-0 bg-transparent"><code>${escapeHtml(text)}</code></pre>
            </div>
          </div>\n`;
      }

      let effectiveLang = lang || "c";
      const isCCode = /\b(int\s+main|typedef\s+struct|char\*|const\s+int|uint32_t|uint8_t|#include|printf\s*\(|void\s+\w+\s*\(|static\s+int|return\s+0;?|data\s+dt)\b/.test(text);
      if ((effectiveLang === "bash" || effectiveLang === "sh" || effectiveLang === "text" || !effectiveLang) && isCCode) {
        effectiveLang = "c";
      }

      let filename = "";
      if (effectiveLang === "c") filename = "source.c";
      else if (effectiveLang === "cpp") filename = "main.cpp";
      else if (effectiveLang === "python") filename = "script.py";
      else if (effectiveLang === "bash") filename = "terminal.sh";
      else filename = `${effectiveLang || "code"}.txt`;

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

      const highlightedCodeHtml = highlightCodeWithLineNumbers(text, effectiveLang, true);
      const b64Code = safeBase64Encode(text);

      return `
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
        </div>\n`;
    },

    table(token) {
      let theadCells = "";
      for (const cell of token.header) {
        const content = this.parser.parseInline(cell.tokens);
        theadCells += `<th class="py-3 px-4 text-xs font-extrabold uppercase tracking-wider text-accent border-b border-border/80 bg-bg-elevated/90">${content}</th>`;
      }

      let tbodyRows = "";
      for (const row of token.rows) {
        let rowCells = "";
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          const content = this.parser.parseInline(cell.tokens);
          const isFirst = i === 0;
          rowCells += `<td class="py-3 px-4 text-xs sm:text-sm border-b border-border/50 ${isFirst ? "font-bold text-text-primary" : "text-text-secondary"}">${content}</td>`;
        }
        tbodyRows += `<tr class="hover:bg-bg-elevated/30 transition-colors">${rowCells}</tr>`;
      }

      return `
        <div class="my-6 overflow-x-auto rounded-2xl border border-border/80 shadow-xl bg-bg-panel">
          <table class="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr>${theadCells}</tr>
            </thead>
            <tbody class="divide-y divide-border/60 bg-bg-panel/40">
              ${tbodyRows}
            </tbody>
          </table>
        </div>\n`;
    },

    blockquote({ text }) {
      const trimmed = text.trim();
      if (/^<p>\s*\[!TIP\]/i.test(trimmed)) {
        const body = trimmed.replace(/^<p>\s*\[!TIP\]\s*/i, "<p>");
        return `
          <div class="my-6 p-5 sm:p-6 rounded-2xl border-l-4 border-emerald-500 bg-emerald-500/10 text-emerald-400 text-sm sm:text-base shadow-md leading-relaxed">
            <div class="flex items-center gap-2 font-bold mb-1.5 text-sm sm:text-base">💡 Mẹo Tối Ưu Kỹ Thuật</div>
            <div class="leading-relaxed text-xs sm:text-sm text-text-primary/90 mt-1">${body}</div>
          </div>\n`;
      }
      if (/^<p>\s*\[!NOTE\]|^<p>\s*\[!INFO\]/i.test(trimmed)) {
        const body = trimmed.replace(/^<p>\s*\[!(?:NOTE|INFO)\]\s*/i, "<p>");
        return `
          <div class="my-6 p-5 sm:p-6 rounded-2xl border-l-4 border-cyan-500 bg-cyan-500/10 text-cyan-400 text-sm sm:text-base shadow-md leading-relaxed">
            <div class="flex items-center gap-2 font-bold mb-1.5 text-sm sm:text-base">ℹ️ Ghi Chú Kỹ Thuật</div>
            <div class="leading-relaxed text-xs sm:text-sm text-text-primary/90 mt-1">${body}</div>
          </div>\n`;
      }
      if (/^<p>\s*\[!WARNING\]|^<p>\s*\[!CAUTION\]|^<p>\s*\[!DANGER\]/i.test(trimmed)) {
        const body = trimmed.replace(/^<p>\s*\[!(?:WARNING|CAUTION|DANGER)\]\s*/i, "<p>");
        return `
          <div class="my-6 p-5 sm:p-6 rounded-2xl border-l-4 border-red-500 bg-red-500/10 text-red-400 text-sm sm:text-base shadow-md leading-relaxed">
            <div class="flex items-center gap-2 font-bold mb-1.5 text-sm sm:text-base">🚨 Cảnh Báo Phần Cứng</div>
            <div class="leading-relaxed text-xs sm:text-sm text-text-primary/90 mt-1">${body}</div>
          </div>\n`;
      }
      return `
        <blockquote class="my-6 p-5 sm:p-6 rounded-2xl bg-bg-elevated/80 border-l-4 border-accent text-sm sm:text-base text-text-secondary leading-relaxed shadow-md italic">
          ${text}
        </blockquote>\n`;
    },

    image({ href, title, text }) {
      return `
        <figure class="my-6 text-center flex flex-col items-center justify-center">
          <div class="inline-block max-w-full">
            <img src="${href}" alt="${text || ""}" class="rounded-2xl border border-border/80 shadow-lg max-h-[560px] mx-auto object-contain bg-bg-panel/40 p-1.5" loading="lazy" />
          </div>
          ${text ? `<figcaption class="mt-2 text-xs text-text-muted italic font-medium flex items-center justify-center gap-1"><span>📷</span><span>${text}</span></figcaption>` : ""}
        </figure>\n`;
    }
  }
});

/**
 * Chuyển đổi Markdown thô thành HTML chuẩn phong cách Lab bằng thư viện Marked (GFM)
 * Hỗ trợ 100% cú pháp CommonMark / GitHub Flavored Markdown:
 * Fenced Code Blocks (C/C++, Python...), Bảng Markdown GFM, Danh sách thụt lề nhiều cấp, Callouts, Images, v.v.
 */
export function markdownToLabHtml(markdown: string): string {
  if (!markdown) return "";

  // 1. Trích xuất và chuẩn hóa mọi thẻ HTML <img> (kể cả có lỗi cú pháp thuộc tính như width = "640 , height = "480">, thiếu </p>...)
  const imgTokens: Record<string, string> = {};
  let imgCounter = 0;

  const imgBlockRegex = /(?:<p[^>]*align\s*=\s*["']?center["']?[^>]*>\s*)?<img\s+([^>]+)>(?:\s*<\/p>)?/gi;

  let preprocessed = markdown.replace(imgBlockRegex, (fullMatch, attrs) => {
    const srcMatch = attrs.match(/src\s*=\s*["']?([^"'\s>]+)["']?/i);
    const src = srcMatch ? srcMatch[1] : "";
    if (!src) return fullMatch;

    const altMatch = attrs.match(/alt\s*=\s*["']?([^"'>]*)["']?/i);
    const alt = altMatch ? altMatch[1] : "";

    // Nhận diện thông minh width (kể cả dạng width = "640 , height = "480"> hoặc width = 640)
    const widthMatch = attrs.match(/width\s*=\s*["']?\s*(\d+(?:px|%)?)/i);
    const width = widthMatch ? widthMatch[1] : "";

    const heightMatch = attrs.match(/height\s*=\s*["']?\s*(\d+(?:px|%)?)/i);
    const height = heightMatch ? heightMatch[1] : "";

    const styleParts = ["max-width: 100%", "height: auto"];
    if (width) {
      const wCss = /^\d+$/.test(width) ? `${width}px` : width;
      styleParts.unshift(`max-width: min(100%, ${wCss})`);
    }
    if (height) {
      const hCss = /^\d+$/.test(height) ? `${height}px` : height;
      styleParts.push(`max-height: ${hCss}`);
    }

    const html = `\n\n<figure class="my-6 text-center flex flex-col items-center justify-center">
  <div class="inline-block max-w-full">
    <img src="${src}" alt="${alt}" ${width ? `width="${width}"` : ""} ${height ? `height="${height}"` : ""} style="${styleParts.join("; ")}" class="rounded-2xl border border-border/80 shadow-lg mx-auto object-contain bg-bg-panel/40 p-1.5" loading="lazy" />
  </div>
  ${alt ? `<figcaption class="mt-2 text-xs text-text-muted italic font-medium flex items-center justify-center gap-1"><span>📷</span><span>${alt}</span></figcaption>` : ""}
</figure>\n\n`;

    const token = `@@@LAB_IMG_TOKEN_${imgCounter++}@@@`;
    imgTokens[token] = html;
    return `\n\n${token}\n\n`;
  });

  // Dọn dẹp thẻ <p align="center"> mồ côi nếu có
  preprocessed = preprocessed.replace(/<p[^>]*align\s*=\s*["']?center["']?[^>]*>\s*/gi, "");

  try {
    let html = labMarkedInstance.parse(preprocessed) as string;

    // Phục hồi lại toàn bộ khối ảnh HTML
    Object.keys(imgTokens).forEach((token) => {
      html = html.replaceAll(token, imgTokens[token]);
    });

    return html;
  } catch (err) {
    console.error("Lỗi khi parse Markdown bằng marked:", err);
    return markdown;
  }
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

  // Chỉ xóa dòng H1 đầu tiên khỏi cleanMarkdown NẾU nó thực sự là tiêu đề trùng lặp với tên bài viết
  // Tuyệt đối KHÔNG xóa nếu nó là đề mục con (ví dụ: # 1. KHÁI NIỆM, # 1. Giới thiệu...)
  if (titleMatch) {
    const rawLower = rawH1.toLowerCase().trim();
    const isSectionNumberHeading = /^\s*(?:\d+[\.\)]|[IVXLCDM]+[\.\)]|phần\s+\d+|chương\s+\d+)/i.test(rawH1);
    const isDuplicatedArticleTitle =
      !isSectionNumberHeading &&
      (rawLower === title.toLowerCase() ||
        (topicFromFilename && rawLower === topicFromFilename.toLowerCase()) ||
        rawLower.startsWith("bài "));

    if (isDuplicatedArticleTitle) {
      cleanMarkdown = cleanMarkdown.replace(titleMatch[0], "").trim();
    }
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

  // 1. Phân tách bằng đường phân cách '---' rõ ràng
  const sections = rawText.split(/\n\s*---\s*\n/);
  if (sections.length > 1) {
    return sections
      .map((sec, idx) => parseSingleMarkdownArticle(sec.trim(), idx + 1))
      .filter((p) => p.title && (p.contentHtml || p.codeSnippet));
  }

  // 2. Chỉ phân tách theo header NẾU các header chỉ định rõ bài mới (ví dụ: # Bài 1, # Bài 2, # Lesson 1)
  // Tuyệt đối không tự ý chia bài theo các đề mục đánh số thông thường (# 1. Khái niệm, # 2. Cài đặt...)
  const isExplicitMultiLesson = /(?:^|\n)#\s+(?:bài|lesson|chương|session|phần|chuyên đề)\s+\d+/i.test(rawText);
  if (isExplicitMultiLesson) {
    const lessonSections = rawText.split(/\n(?=#\s+(?:bài|lesson|chương|session|phần|chuyên đề)\s+\d+)/i);
    if (lessonSections.length > 1) {
      return lessonSections
        .map((sec, idx) => parseSingleMarkdownArticle(sec.trim(), idx + 1))
        .filter((p) => p.title && (p.contentHtml || p.codeSnippet));
    }
  }

  // 3. Mặc định: Coi toàn bộ nội dung là 1 bài học hoàn chỉnh
  return [parseSingleMarkdownArticle(rawText.trim(), 1)];
}
