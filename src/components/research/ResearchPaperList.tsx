"use client";

import * as React from "react";
import Link from "next/link";
import {
  ResearchPaper,
  PublicationType,
  PUBLICATION_TYPES,
  RESEARCH_FIELDS,
} from "@/lib/research-store";
import { canUserDeleteContent } from "@/lib/permissions";
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
  GraduationCap,
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export function ResearchPaperList() {
  const { user } = useAuth();
  const { dict, locale } = useLanguage();
  const isAdmin = Boolean(user && (user.role === "admin" || user.role === "superadmin"));

  const [papers, setPapers] = React.useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
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
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Nạp trực tiếp dữ liệu từ Database SQLite trung tâm (nguồn chân lý duy nhất cho mọi User)
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/research", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPapers(json.data);
      } else {
        throw new Error(json.error || "Không thể tải danh sách bài báo từ máy chủ");
      }
    } catch (err: any) {
      console.error("Lỗi khi fetch API research từ database:", err);
      setFetchError(err.message || "Lỗi kết nối cơ sở dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

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
    if (!isAdmin) {
      showToast("Chỉ Quản trị viên (Admin) mới có quyền đăng bài báo khoa học!");
      return;
    }
    setEditingPaper(null);
    setEditModalOpen(true);
  };

  const handleOpenEditModal = (paper: ResearchPaper) => {
    if (!isAdmin) {
      showToast("Chỉ Quản trị viên (Admin) mới có quyền chỉnh sửa bài báo khoa học!");
      return;
    }
    setEditingPaper(paper);
    setEditModalOpen(true);
  };

  const handleSavePaper = async (paper: ResearchPaper) => {
    if (!isAdmin) {
      showToast("Chỉ Quản trị viên (Admin) mới có quyền lưu bài báo khoa học!");
      return;
    }

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user?.role || "",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify({
          ...paper,
          user: { id: user?.id, email: user?.email, role: user?.role },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || "Không thể lưu bài báo lên cơ sở dữ liệu.");
        return;
      }

      // Nạp lại danh sách chính xác từ Database SQLite trung tâm
      await loadData();
      showToast(editingPaper ? "Đã cập nhật bài báo thành công vào Database!" : "Đã đăng bài nghiên cứu mới vào Database thành công!");
    } catch (err: any) {
      console.error("Lỗi khi đồng bộ bài báo lên server database:", err);
      showToast("Lỗi kết nối khi gửi bài báo lên máy chủ");
    }
  };

  const handleDeletePaper = async (id: string, title: string) => {
    if (!isAdmin) {
      showToast("Chỉ Quản trị viên (Admin) mới có quyền xóa bài báo!");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài báo:\n"${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/research/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": user?.role || "",
          "x-user-email": user?.email || "",
          "x-user-id": user?.id || "",
          "x-user-name": user?.name ? encodeURIComponent(user.name) : "",
        },
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || "Không thể xóa bài báo trên máy chủ.");
        return;
      }

      // Xóa thành công khỏi database, cập nhật danh sách
      setPapers((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
      showToast("Đã xóa bài báo nghiên cứu khỏi Database thành công!");
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu xóa bài lên server database:", err);
      showToast("Lỗi kết nối khi gửi yêu cầu xóa bài báo");
    }
  };

  const getPubTypeLabel = (type: PublicationType, isShort = false) => {
    if (locale === "en") {
      switch (type) {
        case "journal":
          return isShort ? "ISI/Scopus Journal" : "International Journals (ISI / Scopus)";
        case "conference":
          return isShort ? "IEEE/ACM Conference" : "International Conferences (IEEE / ACM / Springer)";
        case "project":
          return isShort ? "R&D Project" : "Research Projects & Tech Transfer";
        case "patent":
          return isShort ? "Patent" : "Patents & Practical Solutions";
      }
    }
    return isShort ? PUBLICATION_TYPES[type].shortLabel : PUBLICATION_TYPES[type].label;
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
              {dict.research.totalPublications}
            </span>
            <div className="p-2 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary">{stats.total}</span>
            <span className="text-xs text-text-muted">{dict.research.worksCount}</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">{dict.research.publishedAndAccepted}</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {dict.research.isiScopusJournals}
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
              {dict.research.ieeeAcmConferences}
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary">{stats.conferences}</span>
            <span className="text-xs text-purple-400 font-semibold">{dict.research.intlProceedings}</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">IEEE ATC, SOCC, RIVF...</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {dict.research.projectsAndPatents}
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
          <p className="text-[11px] text-text-muted mt-1">{dict.research.ministryAndIpDesc}</p>
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
              placeholder={dict.research.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-elevated/70 border border-border/80 text-xs text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
              >
                {dict.research.clear}
              </button>
            )}
          </div>

          {/* Action: Add Paper Button (Chỉ Admin mới nhìn thấy và thao tác) */}
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md hover:shadow-accent/20 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{dict.research.addPaper}</span>
            </button>
          )}
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
              {dict.research.tabAll} ({papers.length})
            </button>

            {(Object.keys(PUBLICATION_TYPES) as PublicationType[]).map((type) => {
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
                  {getPubTypeLabel(type, true)} ({count})
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
              aria-label={dict.research.filterByYear}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-bg-elevated border border-border/80 text-text-primary text-xs font-medium focus:outline-none focus:border-accent cursor-pointer truncate"
            >
              <option value="all">{dict.research.allYears}</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr.toString()}>
                  {dict.research.yearPrefix} {yr}
                </option>
              ))}
            </select>

            {/* Field Selector */}
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              aria-label={dict.research.filterByField}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-bg-elevated border border-border/80 text-text-primary text-xs font-medium focus:outline-none focus:border-accent cursor-pointer max-w-full truncate"
            >
              <option value="all">{dict.research.allFields}</option>
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
        {isLoading ? (
          <div className="p-16 text-center rounded-2xl bg-bg-panel border border-border/80 space-y-4">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
            <p className="text-xs text-text-muted font-medium">Đang đồng bộ danh sách bài báo nghiên cứu từ Database...</p>
          </div>
        ) : fetchError ? (
          <div className="p-12 text-center rounded-2xl bg-bg-panel border border-rose-500/30 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Không thể tải dữ liệu từ máy chủ</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">{fetchError}</p>
            <button
              type="button"
              onClick={() => loadData()}
              className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all cursor-pointer inline-flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử kết nối lại</span>
            </button>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-bg-panel border border-border/80 space-y-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">
              {dict.research.noPapersTitle}
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              {dict.research.noPapersDesc}
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
              {dict.research.clearFilters}
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
                      {getPubTypeLabel(paper.publicationType, true)}
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
                        {paper.citationCount} {dict.research.citations}
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
                  <span className="font-semibold text-text-primary">{dict.research.authors}: </span>
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
                      <strong className="text-text-primary not-italic">{dict.research.abstract}: </strong>
                      {paper.abstract}
                    </p>

                    <button
                      onClick={() => toggleAbstract(paper.id)}
                      className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {isAbstractExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>{dict.research.hideAbstract}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>{dict.research.viewAbstract}</span>
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
                        <span>{dict.research.downloadPdf}</span>
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
                        <span>{dict.research.originalDoi}</span>
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
                        <span>{dict.research.sourceCode}</span>
                      </a>
                    )}

                    <button
                      onClick={() => setBibtexPaper(paper)}
                      className="px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-bg-panel border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Quote className="w-3.5 h-3.5 text-accent" />
                      <span>{dict.research.exportBibtex}</span>
                    </button>
                  </div>

                  {/* Management: Edit / Delete (Chỉ Admin mới nhìn thấy và thao tác) */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 border-l border-border/60 pl-2">
                      <button
                        onClick={() => handleOpenEditModal(paper)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                        title="Chỉnh sửa bài báo này (Chỉ Admin)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {(() => {
                        const canDeletePaper = Boolean(
                          user &&
                            canUserDeleteContent({
                              currentUser: user,
                              author: {
                                id: (paper as any).createdById,
                                email: (paper as any).createdByEmail,
                                name: (paper as any).creatorName || paper.authors,
                                role: (paper as any).creatorRole || "admin",
                              },
                              isDiscussionOrComment: false,
                            }).allowed
                        );

                        return canDeletePaper ? (
                          <button
                            onClick={() => handleDeletePaper(paper.id, paper.title)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Xóa bài báo này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 rounded-lg text-text-muted/30 cursor-not-allowed opacity-40"
                            title="Chỉ Superadmin hoặc chính tác giả mới có quyền xóa bài báo này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        );
                      })()}
                    </div>
                  )}
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
