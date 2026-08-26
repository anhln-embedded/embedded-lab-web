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

/**
 * Chuyển đổi Markdown thô thành HTML chuẩn phong cách Lab
 */
export function markdownToLabHtml(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // 1. Loại bỏ các khối code ``` đã được tách (nếu có)
  // Xử lý tiêu đề H1 -> H2, H2 -> H3
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-xl font-bold text-text-primary mt-6 mb-3 flex items-center gap-2">$1</h2>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-text-primary mt-6 mb-3 pb-2 border-b border-border/60">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-accent mt-4 mb-2">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-sm font-bold text-text-primary mt-3 mb-1.5">$1</h4>');

  // 2. Xử lý Blockquote / Callouts (> [!NOTE], > [!IMPORTANT], > [!TIP], > Ghi chú:)
  html = html.replace(
    /^>\s*\[!TIP\]\s*(.*$)/gim,
    '<div class="my-4 p-4 rounded-2xl bg-emerald-500/10 border-l-4 border-emerald-500 text-xs sm:text-sm text-text-secondary"><strong>💡 Mẹo Tối Ưu:</strong> $1</div>'
  );
  html = html.replace(
    /^>\s*\[!IMPORTANT\]\s*(.*$)/gim,
    '<div class="my-4 p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-xs sm:text-sm text-text-secondary"><strong>⚠️ Lưu Ý Quan Trọng:</strong> $1</div>'
  );
  html = html.replace(
    /^>\s*\[!WARNING\]\s*(.*$)/gim,
    '<div class="my-4 p-4 rounded-2xl bg-red-500/10 border-l-4 border-red-500 text-xs sm:text-sm text-text-secondary"><strong>🚨 Cảnh Báo:</strong> $1</div>'
  );
  html = html.replace(
    /^>\s*(.*$)/gim,
    '<div class="my-3 p-3.5 rounded-xl bg-bg-elevated/70 border-l-4 border-accent text-xs text-text-secondary leading-relaxed">$1</div>'
  );

  // 3. Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-text-primary font-bold">$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // 4. Inline Code `code`
  html = html.replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 rounded bg-bg-elevated border border-border text-accent font-mono text-[11px] font-semibold">$1</code>');

  // 5. Unordered List Items (- or *)
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="text-xs sm:text-sm text-text-secondary leading-relaxed my-1">$1</li>');

  // 6. Ordered List Items (1. 2.)
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="text-xs sm:text-sm text-text-secondary leading-relaxed my-1">$1</li>');

  // 7. Paragraphs
  const lines = html.split("\n");
  const parsedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<div") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<table")
    ) {
      return trimmed;
    }
    return `<p class="text-xs sm:text-sm text-text-secondary leading-relaxed my-2">${trimmed}</p>`;
  });

  return parsedLines.join("\n");
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

    // Xóa code block khỏi markdown để chuyển phần còn lại sang HTML
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
 * Phân tích chuỗi Markdown gồm nhiều bài viết (ngăn cách bởi --- hoặc ## Bài 1, ## Bài 2)
 */
export function parseMultiMarkdownArticles(rawText: string): ParsedPost[] {
  // Thử parse nếu là JSON
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

  // Tách các bài bằng separator ---
  const sections = rawText.split(/\n\s*---\s*\n/);
  if (sections.length > 1) {
    return sections
      .map((sec, idx) => parseSingleMarkdownArticle(sec.trim(), idx + 1))
      .filter((p) => p.title && (p.contentHtml || p.codeSnippet));
  }

  // Nếu không có ---, tách bằng tiêu đề cấp 1 (# Bài X hoặc # Chương X)
  const headerSections = rawText.split(/\n(?=#\s+)/);
  if (headerSections.length > 1) {
    return headerSections
      .map((sec, idx) => parseSingleMarkdownArticle(sec.trim(), idx + 1))
      .filter((p) => p.title && (p.contentHtml || p.codeSnippet));
  }

  // Nếu chỉ có 1 bài
  return [parseSingleMarkdownArticle(rawText.trim(), 1)];
}
