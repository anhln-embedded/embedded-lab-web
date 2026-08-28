"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TutorialTopic } from "@/lib/tutorials-data";
import { HeadingItem } from "@/lib/markdown-importer";
import {
  BookOpen,
  ListTree,
  X,
  ChevronRight,
  Clock,
  GraduationCap,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TutorialMobileNavProps {
  topic: TutorialTopic;
  currentPostSlug: string;
  headings: HeadingItem[];
}

export function TutorialMobileNav({
  topic,
  currentPostSlug,
  headings,
}: TutorialMobileNavProps) {
  const [drawerOpen, setDrawerOpen] = useState<"curriculum" | "toc" | null>(null);

  const currentIndex = topic.posts.findIndex((p) => p.slug === currentPostSlug);
  const currentPostOrder = currentIndex !== -1 ? currentIndex + 1 : 1;
  const progressPercent = Math.round((currentPostOrder / Math.max(1, topic.posts.length)) * 100);

  return (
    <div className="lg:hidden mb-6 select-none">
      {/* Mobile Top Controls Card */}
      <div className="p-3.5 rounded-2xl bg-bg-panel border border-border shadow-md space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl p-1 rounded-lg bg-bg-elevated border border-border flex-shrink-0">
              {topic.icon}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                {topic.categoryName}
              </span>
              <h2 className="text-xs font-bold text-text-primary line-clamp-1">
                {topic.title}
              </h2>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30 flex-shrink-0">
            {progressPercent}%
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen("curriculum")}
            className="text-xs h-8 px-2 rounded-xl flex items-center justify-center gap-1.5 border-border hover:border-accent text-text-primary"
          >
            <BookOpen className="w-3.5 h-3.5 text-accent" />
            <span className="truncate">Giáo trình ({currentPostOrder}/{topic.posts.length})</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen("toc")}
            disabled={headings.length === 0}
            className="text-xs h-8 px-2 rounded-xl flex items-center justify-center gap-1.5 border-border hover:border-accent text-text-primary disabled:opacity-50"
          >
            <ListTree className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate">Mục lục ({headings.length})</span>
          </Button>
        </div>
      </div>

      {/* Drawer Overlay Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          <div
            className="bg-bg-panel border-t border-border rounded-t-3xl p-5 max-h-[80vh] flex flex-col shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <div className="flex items-center gap-2">
                {drawerOpen === "curriculum" ? (
                  <>
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="font-extrabold text-sm text-text-primary">
                      Danh Sách Bài Học ({topic.posts.length} bài)
                    </span>
                  </>
                ) : (
                  <>
                    <ListTree className="w-4 h-4 text-amber-500" />
                    <span className="font-extrabold text-sm text-text-primary">
                      Mục Lục Bài Viết
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(null)}
                className="p-1 rounded-full text-text-muted hover:text-text-primary bg-bg-elevated"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {drawerOpen === "curriculum" && (
                <>
                  {topic.posts.map((post) => {
                    const isActive = post.slug === currentPostSlug;
                    const isPassed = post.order < currentPostOrder;

                    return (
                      <Link
                        key={post.slug}
                        href={`/tutorials/${topic.slug}/${post.slug}`}
                        onClick={() => setDrawerOpen(null)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl text-xs transition-all ${
                          isActive
                            ? "bg-accent/15 text-accent font-bold border border-accent/40 shadow-sm"
                            : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold ${
                            isActive
                              ? "bg-accent text-white"
                              : isPassed
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-bg-elevated text-text-muted"
                          }`}
                        >
                          {isPassed ? "✓" : post.order}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="line-clamp-2 leading-snug">{post.title}</span>
                          <span className="text-[10px] text-text-muted mt-0.5 block">
                            {post.readTime}
                          </span>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 text-accent self-center" />}
                      </Link>
                    );
                  })}
                </>
              )}

              {drawerOpen === "toc" && (
                <div className="space-y-1 py-1">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setDrawerOpen(null);
                        setTimeout(() => {
                          let el = document.getElementById(h.id);
                          if (!el) {
                            const allHeadings = document.querySelectorAll("article h2, article h3, main h2, main h3");
                            for (const node of Array.from(allHeadings)) {
                              const cleanHText = node.textContent?.replace(/#/g, "").trim() || "";
                              if (
                                cleanHText === h.text ||
                                cleanHText.includes(h.text) ||
                                h.text.includes(cleanHText)
                              ) {
                                el = node as HTMLElement;
                                el.id = h.id;
                                break;
                              }
                            }
                          }
                          if (el) {
                            const headerOffset = 90;
                            const elementPosition = el.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                            window.scrollTo({
                              top: Math.max(0, offsetPosition),
                              behavior: "smooth",
                            });
                            window.history.pushState(null, "", `#${h.id}`);
                          }
                        }, 150);
                      }}
                      className={`block py-2.5 px-3 rounded-xl text-xs transition-colors hover:text-accent hover:bg-bg-elevated ${
                        h.level === 3 ? "pl-6 text-text-muted" : "font-bold text-text-primary"
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
