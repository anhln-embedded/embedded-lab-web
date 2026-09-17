"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

/**
 * Chuẩn hóa mã nguồn Mermaid:
 * - Thay thế mũi tên Unicode (──>, ─>, →, ⟶) thành ASCII chuẩn (-->)
 * - Thay thế nháy kép cong (“”‘’) thành nháy thẳng
 * - Đảm bảo cú pháp flowchart / graph hợp lệ
 */
export function sanitizeMermaidCode(raw: string): string {
  if (!raw) return "";

  let code = raw
    .replace(/\r\n/g, "\n")
    // Chuyển đổi các dạng mũi tên Unicode thành ASCII tiêu chuẩn
    .replace(/[─—–]{2,}>/g, "-->")
    .replace(/[─—–]>/g, "-->")
    .replace(/→/g, "-->")
    .replace(/⟶/g, "-->")
    .replace(/==>/g, "==>")
    .replace(/⟹/g, "==>")
    // Thay thế nháy cong
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();

  // Bổ sung hướng nếu flowchart thiếu hướng mặc định
  if (/^flowchart\b/i.test(code) && !/^flowchart\s+(TD|TB|LR|RL|BT)\b/i.test(code)) {
    code = code.replace(/^flowchart\b/i, "flowchart TD");
  } else if (/^graph\b/i.test(code) && !/^graph\s+(TD|TB|LR|RL|BT)\b/i.test(code)) {
    code = code.replace(/^graph\b/i, "graph TD");
  }

  return code;
}

let mermaidModule: any = null;

async function getMermaidInstance() {
  if (typeof window === "undefined") return null;
  if (!mermaidModule) {
    try {
      const mod = await import("mermaid");
      mermaidModule = mod.default || mod;
    } catch (err) {
      console.error("[MermaidInitializer] Lỗi nạp thư viện mermaid:", err);
      return null;
    }
  }

  // Luôn cấu hình theme sáng trang nhã, nền trắng đồng bộ với tài liệu kỹ thuật
  mermaidModule.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "default",
    fontFamily: "var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    themeVariables: {
      darkMode: false,
      background: "#ffffff",
      primaryColor: "#f0f9ff",
      primaryTextColor: "#0f172a",
      primaryBorderColor: "#0284c7",
      lineColor: "#0284c7",
      secondaryColor: "#f8fafc",
      tertiaryColor: "#ffffff",
      nodeBorder: "#0284c7",
      mainBkg: "#ffffff",
      clusterBkg: "#f8fafc",
      clusterBorder: "#cbd5e1",
      edgeLabelBackground: "#ffffff",
      fontSize: "12px",
    },
    flowchart: {
      htmlLabels: true,
      curve: "basis",
      useMaxWidth: true,
      nodeSpacing: 28,
      rankSpacing: 32,
      padding: 12,
    },
  });

  return mermaidModule;
}

/**
 * Tự động tìm và render toàn bộ sơ đồ Mermaid trong trang với kích thước cân đối và nền sáng trang nhã
 */
export async function renderAllMermaidDiagrams(rootElement?: HTMLElement | Document | null) {
  if (typeof window === "undefined") return;

  const root = rootElement || document;

  // 1. Tự động nâng cấp các block Mermaid cũ
  upgradeLegacyMermaidBlocks(root);

  // 2. Tìm tất cả các container sơ đồ chưa render
  const pendingElements = root.querySelectorAll<HTMLElement>(".lab-mermaid-diagram:not([data-processed='true'])");
  if (pendingElements.length === 0) return;

  const mermaid = await getMermaidInstance();
  if (!mermaid) return;

  for (let i = 0; i < pendingElements.length; i++) {
    const el = pendingElements[i];
    el.setAttribute("data-processed", "true");

    let rawCode = "";
    const b64 = el.getAttribute("data-raw-code");
    if (b64) {
      try {
        rawCode = decodeURIComponent(escape(atob(b64)));
      } catch {
        rawCode = atob(b64);
      }
    } else {
      rawCode = el.getAttribute("data-code") || el.textContent || "";
    }

    const sanitized = sanitizeMermaidCode(rawCode);
    if (!sanitized) continue;

    const uniqueId = `mermaid_svg_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      const { svg } = await mermaid.render(uniqueId, sanitized);
      el.innerHTML = svg;

      // Căn chỉnh SVG kích thước vừa vặn trong bài viết
      const svgEl = el.querySelector("svg");
      if (svgEl) {
        svgEl.style.maxWidth = "min(100%, 580px)";
        svgEl.style.maxHeight = "360px";
        svgEl.style.height = "auto";
        svgEl.style.display = "block";
        svgEl.style.margin = "0 auto";
        svgEl.style.cursor = "zoom-in";
        svgEl.setAttribute("title", "Click vào sơ đồ để phóng to toàn màn hình");
        svgEl.classList.add("transition-transform", "duration-200", "hover:scale-[1.01]");
      }

      // Tự động bổ sung nút Phóng to vào header của card nếu chưa có
      const parentCard = el.closest(".lab-mermaid-card");
      if (parentCard) {
        const headerActions = parentCard.querySelector(".lab-mermaid-header div:last-child");
        if (headerActions && !headerActions.querySelector(".lab-mermaid-fullscreen-btn")) {
          const fsBtn = document.createElement("button");
          fsBtn.type = "button";
          fsBtn.className = "lab-mermaid-fullscreen-btn px-2 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-bg-panel dark:hover:bg-bg-elevated border border-border text-[11px] font-bold text-text-muted hover:text-accent transition-all flex items-center gap-1 cursor-pointer";
          fsBtn.title = "Xem toàn màn hình / Phóng to";
          fsBtn.innerHTML = `<span>🔍</span><span class="hidden sm:inline">Phóng to</span>`;
          headerActions.insertBefore(fsBtn, headerActions.firstChild);
        }
      }
    } catch (renderError: any) {
      console.warn(`[Mermaid] Lỗi render sơ đồ ${uniqueId}:`, renderError);

      // Khi gặp lỗi cú pháp, hiển thị thông báo thân thiện và cho phép xem mã nguồn
      el.innerHTML = `
        <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs flex flex-col gap-1.5 w-full text-center">
          <div class="font-bold flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span>⚠️</span>
            <span>Không thể vẽ sơ đồ do lỗi cú pháp Mermaid</span>
          </div>
          <p class="text-[11px] text-text-muted">Nhấn nút <strong>"Mã nguồn"</strong> ở trên để xem chi tiết cú pháp.</p>
        </div>
      `;

      // Tự động mở khung xem mã nguồn nếu có
      const parentCard = el.closest(".lab-mermaid-card");
      if (parentCard) {
        const codeView = parentCard.querySelector(".lab-mermaid-code-view");
        if (codeView) {
          codeView.classList.remove("hidden");
        }
      }
    }
  }
}

/**
 * Chuẩn bị chuỗi SVG cho chế độ Fullscreen:
 * Loại bỏ giới hạn kích thước thu nhỏ (max-width / max-height) để SVG phóng to hết cỡ trong modal
 */
function prepareSvgForFullscreen(svgEl: SVGElement): string {
  const clone = svgEl.cloneNode(true) as SVGElement;
  clone.removeAttribute("style");
  clone.setAttribute("width", "100%");
  clone.setAttribute("height", "auto");
  return clone.outerHTML;
}

/**
 * Quét các block HTML cũ có chứa "Sơ Đồ Thuật Toán & Luồng Xử Lý (Mermaid Flowchart)"
 * và tự động chuyển đổi sang cấu trúc chuẩn mới để vẽ SVG ngay lập tức
 */
function upgradeLegacyMermaidBlocks(root: HTMLElement | Document) {
  const allCards = root.querySelectorAll<HTMLElement>("div.rounded-2xl.border:not([data-mermaid-upgraded='true'])");

  allCards.forEach((card) => {
    const headerText = card.textContent || "";
    if (headerText.includes("Sơ Đồ Thuật Toán & Luồng Xử Lý") && headerText.includes("Mermaid")) {
      const preCode = card.querySelector("pre code");
      if (preCode) {
        const codeText = preCode.textContent || "";
        const isMermaid = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph)\b/i.test(codeText.trim());

        if (isMermaid) {
          card.setAttribute("data-mermaid-upgraded", "true");
          card.classList.add("lab-mermaid-card", "bg-bg-panel", "border-border/80");

          let b64 = "";
          try {
            b64 = btoa(unescape(encodeURIComponent(codeText)));
          } catch {
            b64 = "";
          }

          const uniqueId = `legacy_mermaid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

          // Cập nhật lại HTML của card cũ với tỷ lệ nhỏ gọn cân đối và nền sáng sạch sẽ
          card.innerHTML = `
            <div class="lab-mermaid-header flex items-center justify-between px-3.5 py-2 bg-slate-50/90 dark:bg-bg-elevated border-b border-border text-xs select-none">
              <div class="flex items-center gap-1.5 font-bold text-accent">
                <span class="text-sm animate-pulse">⚡</span>
                <span class="text-[11px] sm:text-xs">Sơ Đồ Thuật Toán & Luồng Xử Lý</span>
              </div>
              <div class="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  data-mermaid-fullscreen="${uniqueId}"
                  class="lab-mermaid-fullscreen-btn px-2 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-bg-panel dark:hover:bg-bg-elevated border border-border text-[11px] font-bold text-text-muted hover:text-accent transition-all flex items-center gap-1 cursor-pointer"
                  title="Xem toàn màn hình / Phóng to"
                >
                  <span>🔍</span>
                  <span class="hidden sm:inline">Phóng to</span>
                </button>
                <button
                  type="button"
                  data-mermaid-toggle="${uniqueId}"
                  class="lab-mermaid-toggle-btn px-2 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-bg-panel dark:hover:bg-bg-elevated border border-border text-[11px] font-bold text-text-muted hover:text-accent transition-all flex items-center gap-1 cursor-pointer"
                  title="Chuyển đổi giữa xem Sơ đồ và Mã nguồn"
                >
                  <span class="lab-toggle-icon">📝</span>
                  <span class="lab-toggle-text hidden sm:inline">Mã nguồn</span>
                </button>
                <button
                  type="button"
                  data-lab-code="${b64}"
                  class="lab-copy-btn px-2 py-1 rounded-lg bg-white hover:bg-accent hover:text-white dark:bg-bg-panel dark:hover:bg-accent dark:hover:text-white border border-border text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  title="Sao chép mã nguồn sơ đồ"
                >
                  <span>📋</span>
                  <span class="lab-copy-label hidden sm:inline">Sao chép</span>
                </button>
              </div>
            </div>
            <div class="lab-mermaid-viewport relative p-4 sm:p-6 bg-white overflow-x-auto max-h-[420px] flex items-center justify-center border-b border-border/40">
              <div class="lab-mermaid-diagram w-full flex justify-center items-center max-w-[580px] mx-auto" data-raw-code="${b64}" id="${uniqueId}">
                <div class="lab-mermaid-loading flex items-center gap-2 py-6 text-xs font-medium text-text-muted">
                  <div class="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang dựng sơ đồ...</span>
                </div>
              </div>
            </div>
            <div class="lab-mermaid-code-view hidden p-3 sm:p-4 bg-slate-900 dark:bg-[#070b14] overflow-x-auto text-xs font-mono text-cyan-300 leading-relaxed border-b border-border/40">
              <pre class="m-0 p-0 bg-transparent"><code>${codeText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
            </div>
          `;
        }
      }
    }
  });
}

/**
 * Component toàn cục để tự động gắn trình xử lý Mermaid trên toàn trang
 * Kèm Modal Xem Toàn Màn Hình (Fullscreen Zoom Viewer) có bộ điều khiển thu phóng
 */
export function MermaidInitializer() {
  const pathname = usePathname();
  const [fullscreenSvg, setFullscreenSvg] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const openFullscreen = (svgEl: SVGElement) => {
    setFullscreenSvg(prepareSvgForFullscreen(svgEl));
    setScale(1);
    setPosition({ x: 0, y: 0 });
    positionRef.current = { x: 0, y: 0 };
    setIsDragging(false);
  };

  const closeFullscreen = () => {
    setFullscreenSvg(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    positionRef.current = { x: 0, y: 0 };
    setIsDragging(false);
  };

  // Khóa cuộn trang chính khi Modal đang mở
  useEffect(() => {
    if (fullscreenSvg) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [fullscreenSvg]);

  // Lắng nghe sự kiện lăn chuột (Mouse Wheel Zoom) trên Canvas mô phỏng
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !fullscreenSvg) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      setScale((prevScale) => {
        const next = Math.min(5, Math.max(0.25, Number((prevScale * factor).toFixed(2))));
        return next;
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [fullscreenSvg]);

  // Lắng nghe sự kiện nhả chuột trên toàn cửa sổ để dừng kéo rê an toàn
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging]);

  // Thao tác kéo rê chuột (Pan & Drag) như bên phần mềm mô phỏng / CAD
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Chỉ nhận phím chuột trái
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newX = Math.round(e.clientX - dragStartRef.current.x);
    const newY = Math.round(e.clientY - dragStartRef.current.y);
    positionRef.current = { x: newX, y: newY };
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    // Nhấp đúp chuột để căn giữa và đặt lại tỉ lệ 100%
    setScale(1);
    setPosition({ x: 0, y: 0 });
    positionRef.current = { x: 0, y: 0 };
  };

  useEffect(() => {
    // Render ngay khi đường dẫn trang thay đổi
    const timer = setTimeout(() => {
      renderAllMermaidDiagrams();
    }, 150);

    // Lắng nghe sự kiện click các nút chức năng trên Mermaid Card
    const handleCardActions = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 1. Nút Phóng to / Xem toàn màn hình
      const fsBtn = target.closest(".lab-mermaid-fullscreen-btn") as HTMLElement | null;
      if (fsBtn) {
        const card = fsBtn.closest(".lab-mermaid-card");
        if (card) {
          const svgEl = card.querySelector(".lab-mermaid-diagram svg") as SVGElement | null;
          if (svgEl) {
            openFullscreen(svgEl);
          }
        }
        return;
      }

      // Click trực tiếp vào sơ đồ để phóng to toàn màn hình
      const viewportEl = target.closest(".lab-mermaid-viewport") as HTMLElement | null;
      if (viewportEl && !target.closest("button") && !target.closest(".lab-mermaid-code-view")) {
        const svgEl = viewportEl.querySelector(".lab-mermaid-diagram svg") as SVGElement | null;
        if (svgEl) {
          openFullscreen(svgEl);
          return;
        }
      }

      // 2. Nút Toggle "Xem mã nguồn" / "Xem sơ đồ"
      const toggleBtn = target.closest(".lab-mermaid-toggle-btn") as HTMLElement | null;
      if (toggleBtn) {
        const card = toggleBtn.closest(".lab-mermaid-card");
        if (!card) return;

        const viewport = card.querySelector(".lab-mermaid-viewport");
        const codeView = card.querySelector(".lab-mermaid-code-view");
        const toggleText = toggleBtn.querySelector(".lab-toggle-text");
        const toggleIcon = toggleBtn.querySelector(".lab-toggle-icon");

        if (codeView && viewport) {
          const isCodeVisible = !codeView.classList.contains("hidden");
          if (isCodeVisible) {
            codeView.classList.add("hidden");
            viewport.classList.remove("hidden");
            if (toggleText) toggleText.textContent = "Mã nguồn";
            if (toggleIcon) toggleIcon.textContent = "📝";
          } else {
            codeView.classList.remove("hidden");
            viewport.classList.add("hidden");
            if (toggleText) toggleText.textContent = "Sơ đồ";
            if (toggleIcon) toggleIcon.textContent = "📊";
          }
        }
        return;
      }
    };

    // Đóng Modal khi nhấn ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeFullscreen();
      }
    };

    // Theo dõi thay đổi DOM để hỗ trợ Live Preview / Dynamic Content
    const domObserver = new MutationObserver(() => {
      renderAllMermaidDiagrams();
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Theo dõi khi người dùng chuyển đổi theme Sáng / Tối trên thanh Header
    const themeObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "class") {
          // Reset cờ processed để render lại sơ đồ
          document.querySelectorAll(".lab-mermaid-diagram[data-processed='true']").forEach((el) => {
            el.removeAttribute("data-processed");
          });
          renderAllMermaidDiagrams();
          break;
        }
      }
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    document.addEventListener("click", handleCardActions);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      domObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("click", handleCardActions);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pathname]);

  return (
    <>
      {/* Modal Phóng Toàn Màn Hình với Canvas Trắng, Lăn Chuột Phóng To và Kéo Rê Mô Phỏng */}
      {fullscreenSvg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex flex-col select-none overflow-hidden animate-in fade-in duration-150"
        >
          {/* Thanh công cụ đỉnh Modal */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-white/10 text-white flex-shrink-0 z-20 shadow-md">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-sky-400">
              <span className="text-base animate-pulse">⚡</span>
              <span className="hidden sm:inline">Trình Xem Mô Phỏng Sơ Đồ Thuật Toán</span>
              <span className="sm:hidden">Xem Sơ Đồ</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Tỉ lệ: {Math.round(scale * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Bộ điều khiển thu phóng */}
              <div className="flex items-center rounded-xl bg-white/10 border border-white/15 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.max(0.25, Number((s - 0.25).toFixed(2))))}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
                  title="Thu nhỏ (Lăn chuột xuống hoặc phím -)"
                >
                  －
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScale(1);
                    setPosition({ x: 0, y: 0 });
                    positionRef.current = { x: 0, y: 0 };
                  }}
                  className="px-2 font-mono text-[11px] text-white/90 min-w-[52px] text-center font-bold hover:text-sky-300 transition-colors cursor-pointer"
                  title="Nhấn để đặt lại 100%"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.min(5, Number((s + 0.25).toFixed(2))))}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
                  title="Phóng to (Lăn chuột lên hoặc phím +)"
                >
                  ＋
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScale(1);
                    setPosition({ x: 0, y: 0 });
                    positionRef.current = { x: 0, y: 0 };
                  }}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white text-[11px] font-bold transition-all cursor-pointer border-l border-white/10 ml-0.5 flex items-center gap-1"
                  title="Đặt lại kích thước và tọa độ về giữa"
                >
                  <span>🎯</span>
                  <span className="hidden md:inline">Về giữa</span>
                </button>
              </div>

              {/* Nút Đóng Modal */}
              <button
                type="button"
                onClick={closeFullscreen}
                className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
                title="Đóng trình xem (ESC)"
              >
                <span>✕</span>
                <span className="hidden sm:inline">Đóng</span>
              </button>
            </div>
          </div>

          {/* Vùng Canvas Mô Phỏng: Luôn giữ nền trắng tinh tế với lưới tọa độ CAD */}
          <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            className="flex-1 w-full h-full relative overflow-hidden bg-white select-none flex items-center justify-center"
            style={{
              backgroundColor: "#ffffff",
              backgroundImage: "radial-gradient(#cbd5e1 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            {/* Lớp hiển thị SVG sơ đồ với biến đổi translate + scale */}
            <div
              className="select-none pointer-events-none will-change-transform"
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.08s ease-out",
              }}
            >
              <div
                className="w-full flex justify-center items-center [&_svg]:max-w-none [&_svg]:h-auto [&_svg]:block [&_svg]:mx-auto"
                dangerouslySetInnerHTML={{ __html: fullscreenSvg }}
              />
            </div>

            {/* Thanh gợi ý thao tác nổi phía dưới (Simulator HUD Hint Bar) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10 px-4 py-2 rounded-full bg-slate-900/85 text-white text-[11px] sm:text-xs backdrop-blur-md border border-white/15 shadow-xl flex items-center gap-3 sm:gap-4 select-none">
              <span className="flex items-center gap-1">
                <span>🖱️</span>
                <span>Lăn chuột: <strong>Phóng to / Thu nhỏ</strong></span>
              </span>
              <span className="text-white/30 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 hidden sm:flex">
                <span>✋</span>
                <span>Kéo giữ chuột trái: <strong>Di chuyển sơ đồ</strong></span>
              </span>
              <span className="text-white/30 hidden md:inline">•</span>
              <span className="flex items-center gap-1 hidden md:flex">
                <span>🎯</span>
                <span>Nhấp đúp: <strong>Về giữa (100%)</strong></span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
