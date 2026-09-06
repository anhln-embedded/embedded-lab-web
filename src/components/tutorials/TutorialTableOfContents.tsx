"use client";

import React, { useEffect, useState } from "react";
import { HeadingItem } from "@/lib/markdown-importer";
import { ListTree, ArrowUp, Share2, Check, Sparkles, Flame, PanelRightClose, Zap } from "lucide-react";

interface TutorialTableOfContentsProps {
  headings: HeadingItem[];
  onCollapse?: () => void;
  isCompleted?: boolean;
}

export function TutorialTableOfContents({
  headings,
  onCollapse,
  isCompleted = false,
}: TutorialTableOfContentsProps) {
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

  return (
    <aside className="hidden xl:flex flex-col w-68 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto space-y-4 pl-2 pr-1 select-none scrollbar-thin">
      {/* LearningVN Style XP / Reward Card (1 Single Clean Accent Color) */}
      <div className="p-3.5 rounded-2xl bg-bg-panel border border-border/80 shadow-md space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Zap className="w-4 h-4 fill-accent" />
          </div>
          <div>
            <div className="text-xs font-black text-text-primary flex items-center gap-1.5">
              <span>+50 XP Thưởng</span>
              {isCompleted && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-accent/15 text-accent border border-accent/30">
                  Đã nhận
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-muted">
              {isCompleted ? "Bạn đã hoàn thành bài học này" : "Khi hoàn thành bài học này"}
            </p>
          </div>
        </div>
      </div>

      {/* Header with Collapse Button */}
      {headings.length > 0 && (
        <>
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
          <nav className="space-y-1 text-xs max-h-[45vh] overflow-y-auto pr-1 scrollbar-thin">
            {headings.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    let el = document.getElementById(item.id);

                    if (!el) {
                      const allHeadings = document.querySelectorAll(
                        "article h2, article h3, main h2, main h3"
                      );
                      for (const h of Array.from(allHeadings)) {
                        const cleanHText = h.textContent?.replace(/#/g, "").trim() || "";
                        if (
                          cleanHText === item.text ||
                          cleanHText.includes(item.text) ||
                          item.text.includes(cleanHText)
                        ) {
                          el = h as HTMLElement;
                          el.id = item.id;
                          break;
                        }
                      }
                    }

                    if (el) {
                      const headerOffset = 95;
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
                  className={`block py-1.5 transition-all leading-snug rounded-xl ${
                    item.level === 3 ? "pl-4 text-[11px]" : "pl-2.5 font-medium"
                  } ${
                    isActive
                      ? "text-accent font-bold bg-accent/15 border-l-2 border-accent shadow-xs"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-elevated/50"
                  }`}
                >
                  <span className="line-clamp-2">{item.text}</span>
                </a>
              );
            })}
          </nav>
        </>
      )}

      {/* Utility Actions */}
      <div className="pt-3 border-t border-border/60 space-y-2 text-xs">
        <button
          type="button"
          onClick={copyPageLink}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-bg-elevated/70 hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border/80 transition-all font-semibold cursor-pointer shadow-xs"
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-bg-elevated/70 hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border/80 transition-all font-semibold cursor-pointer shadow-xs"
        >
          <ArrowUp className="w-3.5 h-3.5 text-accent" />
          <span>Lên đầu trang</span>
        </button>
      </div>
    </aside>
  );
}
