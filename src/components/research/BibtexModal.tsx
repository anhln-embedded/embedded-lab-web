"use client";

import * as React from "react";
import { X, Check, Copy, Quote } from "lucide-react";
import { ResearchPaper } from "@/lib/research-store";

interface BibtexModalProps {
  paper: ResearchPaper | null;
  onClose: () => void;
}

export function BibtexModal({ paper, onClose }: BibtexModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!paper) return null;

  const bibtexContent = paper.bibtex || `@article{paper${paper.year},
  title={${paper.title}},
  author={${paper.authors}},
  journal={${paper.venue}},
  year={${paper.year}},
  doi={${paper.doi || ""}}
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bibtexContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-bg-panel border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-bg-elevated/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Trích Dẫn Khoa Học (BibTeX Citation)
              </h3>
              <p className="text-[11px] text-text-muted">
                Định dạng chuẩn để đưa vào LaTeX / Overleaf / Mendeley
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper title info */}
        <div className="px-6 py-3 bg-bg-elevated/20 border-b border-border/40 text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">Bài báo:</span> {paper.title}
        </div>

        {/* Code body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="relative rounded-xl overflow-hidden border border-border/80 bg-slate-950 font-mono text-xs text-slate-200">
            <pre className="p-4 overflow-x-auto leading-relaxed selection:bg-accent/30 selection:text-white">
              <code>{bibtexContent}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-bg-elevated/50">
          <span className="text-xs text-text-muted">
            {copied ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Đã sao chép vào Clipboard!
              </span>
            ) : (
              "Sử dụng cho các bài báo nghiên cứu và luận văn"
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border/80 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-accent hover:bg-accent-hover text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã Sao Chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao Chép BibTeX</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
