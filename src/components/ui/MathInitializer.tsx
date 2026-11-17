"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import katex from "katex";

/**
 * Quét và render các công thức toán học LaTeX ($...$ và $$...$$) trong một DOM node
 * Đảm bảo bỏ qua các thẻ mã nguồn như pre, code, script, style và các khối đã render KaTeX
 */
export function renderMathInContainer(container: HTMLElement) {
  if (!container) return;

  const ignoreTagNames = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "PRE", "CODE", "SVG"]);

  function shouldIgnoreNode(node: Node): boolean {
    let parent = node.parentElement;
    while (parent && parent !== container) {
      if (ignoreTagNames.has(parent.tagName)) return true;
      if (
        parent.classList.contains("katex") ||
        parent.classList.contains("lab-math-block") ||
        parent.classList.contains("lab-math-inline") ||
        parent.classList.contains("lab-code-card")
      ) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  // Thu thập các text nodes chứa ký tự '$'
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent || !node.textContent.includes("$")) {
        return NodeFilter.FILTER_REJECT;
      }
      if (shouldIgnoreNode(node)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  let currentNode: Node | null;
  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode as Text);
  }

  // Xử lý từng text node chứa ký tự '$'
  for (const textNode of textNodes) {
    const parent = textNode.parentNode;
    if (!parent) continue;

    const text = textNode.textContent || "";
    // Kiểm tra xem có chứa công thức block $$...$$ hoặc inline $...$
    const hasBlockMath = /\$\$([\s\S]+?)\$\$/.test(text);
    const hasInlineMath = /(?<!\\)\$([^\s$](?:[^$\n]*?[^\s$])?)\$(?!\d)/.test(text);

    if (!hasBlockMath && !hasInlineMath) continue;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    // Regex kết hợp bắt cả block $$...$$ và inline $...$
    const mathRegex = /(\$\$[\s\S]+?\$\$|(?<!\\)\$[^\s$](?:[^$\n]*?[^\s$])?\$(?!\d))/g;
    let match: RegExpExecArray | null;

    while ((match = mathRegex.exec(text)) !== null) {
      // Thêm đoạn text thông thường phía trước công thức
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
      }

      const matchStr = match[0];
      const isBlock = matchStr.startsWith("$$") && matchStr.endsWith("$$");
      const formula = isBlock
        ? matchStr.slice(2, -2).trim()
        : matchStr.slice(1, -1).trim();

      try {
        const span = document.createElement(isBlock ? "div" : "span");
        span.className = isBlock
          ? "lab-math-block my-5 py-3 px-4 bg-slate-50/80 dark:bg-bg-elevated/40 rounded-2xl border border-border/80 overflow-x-auto text-center flex justify-center items-center select-text shadow-xs"
          : "lab-math-inline px-1 py-0.5 rounded select-text";

        span.innerHTML = katex.renderToString(formula, {
          displayMode: isBlock,
          throwOnError: false,
          output: "htmlAndMathml",
        });

        fragment.appendChild(span);
      } catch (err) {
        console.error("[MathInitializer] Lỗi render công thức KaTeX:", err);
        fragment.appendChild(document.createTextNode(matchStr));
      }

      lastIndex = match.index + matchStr.length;
    }

    // Thêm đoạn text còn lại sau công thức cuối cùng
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    parent.replaceChild(fragment, textNode);
  }
}

/**
 * Tự động tìm và render toàn bộ công thức trên trang
 */
export function renderAllMathInDocument() {
  if (typeof window === "undefined") return;

  const targets = document.querySelectorAll<HTMLElement>(
    "article, .prose, [data-lab-content], .lab-article-content, .lab-math-scope"
  );

  if (targets.length > 0) {
    targets.forEach((el) => renderMathInContainer(el));
  } else {
    // Quét các phần tử chính nếu không tìm thấy target cụ thể
    const main = document.querySelector<HTMLElement>("main");
    if (main) {
      renderMathInContainer(main);
    }
  }
}

/**
 * Component React tự động quét và kích hoạt KaTeX toàn cục mỗi khi điều hướng trang
 */
export function MathInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    // Render ngay khi trang được nạp
    renderAllMathInDocument();

    const t1 = setTimeout(() => {
      renderAllMathInDocument();
    }, 100);

    const t2 = setTimeout(() => {
      renderAllMathInDocument();
    }, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}
