"use client";

import * as React from "react";
import Link from "next/link";
import {
  ResearchPaper,
  PublicationType,
  PUBLICATION_TYPES,
  RESEARCH_FIELDS,
  DEFAULT_RESEARCH_PAPERS,
  getAllResearchPapers,
  saveResearchPaper,
  deleteResearchPaper,
} from "@/lib/research-store";
import { BibtexModal } from "./BibtexModal";
import { ResearchPaperModal } from "./ResearchPaperModal";
import {
  Search,
  Plus,
  FileText,
  Award,
  Compass,
  ShieldCheck,
  ExternalLink,
  Download,
  Quote,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
  Calendar,
  BookOpen,
  Sparkles,
  GitBranch,
  Layers,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ResearchPaperList() {
  const [papers, setPapers] = React.useState<ResearchPaper[]>(DEFAULT_RESEARCH_PAPERS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [selectedYear, setSelectedYear] = React.useState<string>("all");
  const [selectedField, setSelectedField] = React.useState<string>("all");
  const [expandedAbstracts, setExpandedAbstracts] = React.useState<Record<string, boolean>>({});

  // Modals state
  const [bibtexPaper, setBibtexPaper] = React.useState<ResearchPaper | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingPaper, setEditingPaper] = React.useState<ResearchPaper | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load papers on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/research");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPapers(json.data);
          return;
        }
      } catch (err) {
        console.warn("Không thể fetch API research, dùng store cục bộ:", err);
      }
      setPapers(getAllResearchPapers());
    };
    loadData();
  }, []);

  // Compute available years
  const availableYears = React.useMemo(() => {
    const years = Array.from(new Set(papers.map((p) => p.year))).sort((a, b) => b - a);
    return years;
  }, [papers]);

  // Compute counts for stats
  const stats = React.useMemo(() => {
    const total = papers.length;
    const journals = papers.filter((p) => p.publicationType === "journal").length;
    const conferences = papers.filter((p) => p.publicationType === "conference").length;
    const projectsAndPatents = papers.filter(
      (p) => p.publicationType === "project" || p.publicationType === "patent"
    ).length;
    return { total, journals, conferences, projectsAndPatents };
  }, [papers]);

  // Filter papers
  const filteredPapers = React.useMemo(() => {
    return papers.filter((paper) => {
      // Filter by type
      if (selectedType !== "all" && paper.publicationType !== selectedType) {
        return false;
      }
      // Filter by year
      if (selectedYear !== "all" && paper.year.toString() !== selectedYear) {
        return false;
      }
      // Filter by field
      if (selectedField !== "all" && paper.field !== selectedField) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = paper.title.toLowerCase().includes(q);
        const matchAuthors = paper.authors.toLowerCase().includes(q);
        const matchVenue = paper.venue.toLowerCase().includes(q);
        const matchAbstract = paper.abstract.toLowerCase().includes(q);
        const matchKeywords = paper.keywords.some((k) => k.toLowerCase().includes(q));
        const matchDoi = paper.doi ? paper.doi.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchAuthors && !matchVenue && !matchAbstract && !matchKeywords && !matchDoi) {
          return false;
        }
      }
      return true;
    });
  }, [papers, selectedType, selectedYear, selectedField, searchQuery]);

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenAddModal = () => {
    setEditingPaper(null);
    setEditModalOpen(true);
  };

  const handleOpenEditModal = (paper: ResearchPaper) => {
    setEditingPaper(paper);
    setEditModalOpen(true);
  };

  const handleSavePaper = (paper: ResearchPaper) => {
    const updated = saveResearchPaper(paper);
    setPapers(updated);
    showToast(editingPaper ? "Đã cập nhật bài báo thành công!" : "Đã đăng bài nghiên cứu mới thành công!");
  };

  const handleDeletePaper = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài báo:\n"${title}"?`)) {
      const updated = deleteResearchPaper(id);
      setPapers(updated);
      showToast("Đã xóa bài báo nghiên cứu thành công!");
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. KEY STATS BANNER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm relative overflow-hidden group hover:border-accent/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Tổng Công Bố
            </span>
            <div className="p-2 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary">{stats.total}</span>
            <span className="text-xs text-text-muted">công trình</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">Đã công bố & nghiệm thu</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Tạp Chí ISI/Scopus
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary">{stats.journals}</span>
            <span className="text-xs text-blue-400 font-semibold">Q1 & Q2</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">IEEE Transactions & Elsevier</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Hội Nghị IEEE/ACM
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary">{stats.conferences}</span>
            <span className="text-xs text-purple-400 font-semibold">Kỷ yếu quốc tế</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">IEEE ATC, SOCC, RIVF...</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Đề Tài & Sáng Chế
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary">
              {stats.projectsAndPatents}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">R&D & Patent</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">Đề tài Bộ TT&TT & Cục SHTT</p>
        </div>
      </div>

      {/* 2. TOOLBAR: SEARCH & FILTERS & ADD BUTTON */}
      <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài báo, tác giả, DOI, hội nghị, từ khóa (vd: TinyML, FreeRTOS, LoRaWAN)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-elevated/70 border border-border/80 text-xs text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Action: Add Paper Button */}
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md hover:shadow-accent/20 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng Bài Nghiên Cứu</span>
          </button>
        </div>

        {/* Filters Row: Type Tabs & Dropdowns */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
          {/* Type Filter Pills with Touch Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 flex-nowrap md:flex-wrap">
            <button
              onClick={() => setSelectedType("all")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0",
                selectedType === "all"
                  ? "bg-accent text-white shadow-xs"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-elevated/80"
              )}
            >
              Tất cả ({papers.length})
            </button>

            {(Object.keys(PUBLICATION_TYPES) as PublicationType[]).map((type) => {
              const meta = PUBLICATION_TYPES[type];
              const count = papers.filter((p) => p.publicationType === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0",
                    selectedType === type
                      ? "bg-accent text-white shadow-xs"
                      : "bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-elevated/80"
                  )}
                >
                  {meta.shortLabel} ({count})
                </button>
              );
            })}
          </div>

          {/* Secondary Dropdown Filters: Year & Field */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto md:flex md:items-center">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              aria-label="Lọc theo năm xuất bản"
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-bg-elevated border border-border/80 text-text-primary text-xs font-medium focus:outline-none focus:border-accent cursor-pointer truncate"
            >
              <option value="all">Tất cả các năm</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr.toString()}>
                  Năm {yr}
                </option>
              ))}
            </select>

            {/* Field Selector */}
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              aria-label="Lọc theo lĩnh vực chuyên môn"
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-bg-elevated border border-border/80 text-text-primary text-xs font-medium focus:outline-none focus:border-accent cursor-pointer max-w-full truncate"
            >
              <option value="all">Tất cả lĩnh vực</option>
              {RESEARCH_FIELDS.filter((f) => f !== "Tất cả lĩnh vực").map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. PAPERS LIST */}
      <div className="space-y-4">
        {filteredPapers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-bg-panel border border-border/80 space-y-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">
              Không tìm thấy bài báo nghiên cứu nào
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Không có công bố nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại. Vui lòng điều chỉnh tiêu chí lọc.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
                setSelectedYear("all");
                setSelectedField("all");
              }}
              className="px-4 py-2 rounded-xl bg-bg-elevated border border-border text-xs font-semibold text-text-primary hover:bg-bg-panel cursor-pointer"
            >
              Xóa bộ lọc & xem tất cả
            </button>
          </div>
        ) : (
          filteredPapers.map((paper, index) => {
            const typeMeta = PUBLICATION_TYPES[paper.publicationType] || PUBLICATION_TYPES.journal;
            const isAbstractExpanded = Boolean(expandedAbstracts[paper.id]);

            return (
              <div
                key={paper.id}
                className={cn(
                  "p-5 md:p-6 rounded-2xl bg-bg-panel border transition-all duration-200 space-y-4 group",
                  paper.featured
                    ? "border-accent/40 shadow-md shadow-accent/5"
                    : "border-border/80 hover:border-accent/30 shadow-xs"
                )}
              >
                {/* Header Row: Badges & Year */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                        typeMeta.badgeColor
                      )}
                    >
                      {typeMeta.shortLabel}
                    </span>

                    {paper.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-accent/15 text-accent border border-accent/30">
                        {paper.badge}
                      </span>
                    )}

                    <span className="text-xs font-semibold text-text-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{paper.month || paper.year}</span>
                    </span>

                    {paper.citationCount !== undefined && paper.citationCount > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {paper.citationCount} trích dẫn
                      </span>
                    )}
                  </div>

                  {/* Field Badge */}
                  <span className="text-[11px] font-medium text-text-muted bg-bg-elevated px-2.5 py-1 rounded-lg border border-border/60">
                    {paper.field}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base md:text-lg font-bold text-text-primary group-hover:text-accent transition-colors leading-snug">
                  {paper.doiUrl ? (
                    <a
                      href={paper.doiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-start gap-1.5"
                    >
                      <span>{paper.title}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0 mt-1 opacity-60 group-hover:opacity-100" />
                    </a>
                  ) : (
                    <span>{paper.title}</span>
                  )}
                </h3>

                {/* Authors */}
                <div className="text-xs text-text-secondary leading-relaxed">
                  <span className="font-semibold text-text-primary">Tác giả: </span>
                  {paper.authors}
                </div>

                {/* Venue & Details */}
                <div className="text-xs text-text-muted italic flex flex-wrap items-center gap-2">
                  <span>{paper.venue}</span>
                  {paper.volume && (
                    <>
                      <span>•</span>
                      <span>{paper.volume}</span>
                    </>
                  )}
                  {paper.doi && (
                    <>
                      <span>•</span>
                      <span className="font-mono not-italic text-[11px] text-text-muted">
                        DOI: {paper.doi}
                      </span>
                    </>
                  )}
                </div>

                {/* Abstract Section */}
                {paper.abstract && (
                  <div className="space-y-2">
                    <p
                      className={cn(
                        "text-xs text-text-secondary leading-relaxed",
                        !isAbstractExpanded && "line-clamp-2"
                      )}
                    >
                      <strong className="text-text-primary not-italic">Tóm tắt (Abstract): </strong>
                      {paper.abstract}
                    </p>

                    <button
                      onClick={() => toggleAbstract(paper.id)}
                      className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {isAbstractExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Thu gọn</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Xem toàn bộ tóm tắt</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Keywords */}
                {paper.keywords && paper.keywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {paper.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded-md bg-bg-elevated text-[11px] font-mono text-text-muted border border-border/50"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                  <div className="flex flex-wrap items-center gap-2">
                    {paper.pdfUrl && (
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-accent/10 hover:bg-accent hover:text-white text-accent border border-accent/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Xem PDF</span>
                      </a>
                    )}

                    {paper.doiUrl && (
                      <a
                        href={paper.doiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-bg-panel border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Bản Gốc (DOI)</span>
                      </a>
                    )}

                    {paper.codeUrl && (
                      <a
                        href={paper.codeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-bg-panel border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Source Code</span>
                      </a>
                    )}

                    <button
                      onClick={() => setBibtexPaper(paper)}
                      className="px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-bg-panel border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Quote className="w-3.5 h-3.5 text-accent" />
                      <span>Trích Dẫn BibTeX</span>
                    </button>
                  </div>

                  {/* Management: Edit / Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(paper)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                      title="Chỉnh sửa bài báo này"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePaper(paper.id, paper.title)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Xóa bài báo này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BibTeX Citation Modal */}
      <BibtexModal paper={bibtexPaper} onClose={() => setBibtexPaper(null)} />

      {/* Add / Edit Paper Modal */}
      <ResearchPaperModal
        paper={editingPaper}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingPaper(null);
        }}
        onSave={handleSavePaper}
      />
    </div>
  );
}
