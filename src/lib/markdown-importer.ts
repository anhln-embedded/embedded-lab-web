/**
 * Embedded-AIoT Lab - Smart Markdown Parser & Importer for Tutorials
 * Tự động chuyển đổi văn bản Markdown từ Notion / ChatGPT / Docs sang định dạng chuẩn Lab
 */

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
  c = c.replace(/\*(.*?)\*/g, '<em>$1</em>');
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
  // =========================================================================
  const codeBlockRegex = /^[ \t]*```([a-zA-Z0-9_\-\.]+)?(?:\s+(?:filename=)?["']?([^"'\n]+)["']?)?[ \t]*\n([\s\S]*?)\n[ \t]*```[ \t]*$/gm;

  content = content.replace(codeBlockRegex, (_, rawLang, rawFilename, codeText) => {
    const lang = (rawLang || "c").toLowerCase().trim();
    let filename = rawFilename?.trim() || "";
    const code = codeText || "";

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

    // Code Card chuẩn phong cách High-Tech Lab
    const encodedCode = encodeURIComponent(code);
    const langLabel = lang === "c" ? "C" : lang === "cpp" ? "C++" : lang === "python" ? "Python" : lang === "rust" ? "Rust" : lang === "bash" ? "Bash" : lang.toUpperCase();

    const codeCardHtml = `
      <div class="my-6 rounded-2xl border border-border/80 bg-[#0b101b] overflow-hidden shadow-2xl group">
        <div class="flex items-center justify-between px-4 py-2.5 bg-[#111726] border-b border-white/10 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
            ${
              filename
                ? `<span class="ml-2 px-2.5 py-0.5 rounded-md bg-white/10 text-white font-mono text-[11px] font-bold border border-white/10 flex items-center gap-1.5">📄 ${filename}</span>`
                : ""
            }
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent border border-accent/30 font-mono">${langLabel}</span>
            <button
              type="button"
              onclick="(function(btn){navigator.clipboard.writeText(decodeURIComponent('${encodedCode}')); const s=btn.querySelector('.copy-txt'); if(s){s.textContent='Đã chép!'; setTimeout(()=>s.textContent='Sao chép', 2000)}})(this)"
              class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-accent text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-white/10 hover:border-accent"
              title="Sao chép toàn bộ mã nguồn"
            >
              <span class="copy-txt">Sao chép</span>
            </button>
          </div>
        </div>
        <div class="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-slate-200 leading-relaxed scrollbar-thin">
          <pre class="m-0 p-0 bg-transparent font-mono"><code class="language-${lang}">${escapeHtml(code)}</code></pre>
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
  // BƯỚC 6: Images ![Caption](url)
  // =========================================================================
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
  // BƯỚC 7: Danh sách Lists (Unordered & Ordered)
  // =========================================================================
  const ulBlockRegex = /(?:^[ \t]*[-*]\s+[^\n]+(?:\n[ \t]*[-*]\s+[^\n]+)*)/gm;
  content = content.replace(ulBlockRegex, (match) => {
    const items = match
      .split("\n")
      .map((l) => l.replace(/^[ \t]*[-*]\s+/, "").trim())
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
export function parseSingleMarkdownArticle(rawMarkdown: string, defaultOrder: number = 1): ParsedPost {
  let title = `Bài ${defaultOrder}: Tiêu đề bài viết`;
  let summary = "";
  let codeSnippet = "";
  let codeLang = "c";
  let codeFilename = "main.c";

  // 1. Tách code block đầu tiên nếu có
  const codeBlockRegex = /```([a-zA-Z0-9_\-\.]+)?(?:\s+filename="([^"]+)")?\n([\s\S]*?)```/;
  const codeMatch = rawMarkdown.match(codeBlockRegex);

  let cleanMarkdown = rawMarkdown;

  if (codeMatch) {
    codeLang = codeMatch[1]?.toLowerCase() || "c";
    codeFilename = codeMatch[2] || (codeLang === "c" ? "main.c" : codeLang === "cpp" ? "main.cpp" : "code_snippet");
    codeSnippet = codeMatch[3]?.trim() || "";

    cleanMarkdown = rawMarkdown.replace(codeBlockRegex, "").trim();
  }

  // 2. Tìm Title (# Title)
  const titleMatch = cleanMarkdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
    cleanMarkdown = cleanMarkdown.replace(titleMatch[0], "").trim();
  }

  // 3. Tìm Summary (> Tóm tắt: ...)
  const summaryMatch = cleanMarkdown.match(/^>\s*(?:Tóm tắt|Summary):\s*(.+)$/im);
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
    cleanMarkdown = cleanMarkdown.replace(summaryMatch[0], "").trim();
  }

  // 4. Ước lượng thời gian đọc
  const wordsCount = cleanMarkdown.split(/\s+/).length;
  const readMinutes = Math.max(3, Math.ceil(wordsCount / 180));
  const readTime = `${readMinutes} phút`;

  // 5. Chuyển đổi phần còn lại sang HTML
  const contentHtml = markdownToLabHtml(cleanMarkdown);

  // 6. Tạo slug an toàn
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
    slug: slug || `bai-${defaultOrder}`,
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
