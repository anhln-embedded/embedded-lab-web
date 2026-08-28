"use client";

import React, { useEffect, useState } from "react";
import { HeadingItem } from "@/lib/markdown-importer";
import { ListTree, ArrowUp, Share2, Check, Bookmark, Sparkles, PanelRightClose } from "lucide-react";

interface TutorialTableOfContentsProps {
  headings: HeadingItem[];
  onCollapse?: () => void;
}

export function TutorialTableOfContents({ headings, onCollapse }: TutorialTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            setActiveId(headings[i].id);
            return;
          }
        }
      }
      setActiveId(headings[0]?.id || "");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyPageLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block w-64 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto space-y-6 pl-2 pr-1 select-none scrollbar-thin">
      {/* Header with Collapse Button */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-text-muted">
          <ListTree className="w-4 h-4 text-accent" />
          <span>Mục Lục Bài Viết</span>
        </div>

        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border transition-all cursor-pointer"
            title="Thu gọn mục lục"
          >
            <PanelRightClose className="w-3.5 h-3.5 text-text-muted hover:text-accent" />
          </button>
        )}
      </div>

      {/* Headings List */}
      <nav className="space-y-1 text-xs">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                let el = document.getElementById(item.id);

                // Fallback nếu DOM chưa có ID khớp (tìm theo text content)
                if (!el) {
                  const allHeadings = document.querySelectorAll("article h2, article h3, main h2, main h3");
                  for (const h of Array.from(allHeadings)) {
                    const cleanHText = h.textContent?.replace(/#/g, "").trim() || "";
                    if (
                      cleanHText === item.text ||
                      cleanHText.includes(item.text) ||
                      item.text.includes(cleanHText)
                    ) {
                      el = h as HTMLElement;
                      el.id = item.id; // Gán lại ID cho các lần click sau
                      break;
                    }
                  }
                }

                if (el) {
                  const headerOffset = 95; // Khoảng cách header cố định
                  const elementPosition = el.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                  window.scrollTo({
                    top: Math.max(0, offsetPosition),
                    behavior: "smooth",
                  });

                  setActiveId(item.id);
                  history.pushState(null, "", `#${item.id}`);
                }
              }}
              className={`block py-1.5 transition-all leading-snug rounded-lg ${
                item.level === 3 ? "pl-5 text-[11px]" : "pl-2.5 font-medium"
              } ${
                isActive
                  ? "text-accent font-bold bg-accent/10 border-l-2 border-accent"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-elevated/50"
              }`}
            >
              <span className="line-clamp-2">{item.text}</span>
            </a>
          );
        })}
      </nav>

      {/* Utility Actions */}
      <div className="pt-4 border-t border-border/60 space-y-2 text-xs">
        <button
          type="button"
          onClick={copyPageLink}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-elevated/70 hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border/80 transition-all font-semibold"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Đã sao chép link</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-accent" />
              <span>Chia sẻ bài viết</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={scrollToTop}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-elevated/70 hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border/80 transition-all font-semibold"
        >
          <ArrowUp className="w-3.5 h-3.5 text-accent" />
          <span>Lên đầu trang</span>
        </button>
      </div>
    </aside>
  );
}
