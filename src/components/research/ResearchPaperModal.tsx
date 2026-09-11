"use client";

import * as React from "react";
import { X, Plus, Sparkles, FileText, Check, AlertCircle } from "lucide-react";
import {
  ResearchPaper,
  PublicationType,
  PUBLICATION_TYPES,
  RESEARCH_FIELDS,
  generateBibtex,
} from "@/lib/research-store";

interface ResearchPaperModalProps {
  paper?: ResearchPaper | null; // null: tạo mới, có giá trị: chỉnh sửa
  isOpen: boolean;
  onClose: () => void;
  onSave: (paper: ResearchPaper) => void;
}

export function ResearchPaperModal({
  paper,
  isOpen,
  onClose,
  onSave,
}: ResearchPaperModalProps) {
  const [formData, setFormData] = React.useState<Partial<ResearchPaper>>({
    title: "",
    authors: "",
    labAuthors: [],
    publicationType: "journal",
    venue: "",
    year: new Date().getFullYear(),
    month: "",
    volume: "",
    doi: "",
    doiUrl: "",
    pdfUrl: "",
    codeUrl: "",
    demoUrl: "",
    abstract: "",
    keywords: [],
    field: "Edge AI & TinyML",
    badge: "Scopus Q1",
    status: "published",
    featured: false,
    bibtex: "",
  });

  const [keywordsInput, setKeywordsInput] = React.useState("");
  const [labAuthorsInput, setLabAuthorsInput] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (paper) {
      setFormData(paper);
      setKeywordsInput(paper.keywords ? paper.keywords.join(", ") : "");
      setLabAuthorsInput(paper.labAuthors ? paper.labAuthors.join(", ") : "");
    } else {
      setFormData({
        title: "",
        authors: "",
        labAuthors: [],
        publicationType: "journal",
        venue: "",
        year: new Date().getFullYear(),
        month: "",
        volume: "",
        doi: "",
        doiUrl: "",
        pdfUrl: "",
        codeUrl: "",
        demoUrl: "",
        abstract: "",
        keywords: [],
        field: "Edge AI & TinyML",
        badge: "Scopus Q1",
        status: "published",
        featured: false,
        bibtex: "",
      });
      setKeywordsInput("");
      setLabAuthorsInput("");
    }
    setError("");
  }, [paper, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "year") {
      setFormData((prev) => ({ ...prev, year: parseInt(value, 10) || new Date().getFullYear() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAutoGenerateBibtex = () => {
    const generated = generateBibtex({
      ...formData,
      keywords: keywordsInput.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setFormData((prev) => ({ ...prev, bibtex: generated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setError("Vui lòng nhập tiêu đề bài báo khoa học");
      return;
    }
    if (!formData.authors?.trim()) {
      setError("Vui lòng nhập danh sách tác giả");
      return;
    }
    if (!formData.venue?.trim()) {
      setError("Vui lòng nhập tên tạp chí, hội nghị hoặc đơn vị cấp đề tài");
      return;
    }

    const keywords = keywordsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const labAuthors = labAuthorsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const id = paper?.id || `paper-${Date.now()}`;
    const slug =
      formData.slug ||
      (formData.title || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 60);

    const fullPaper: ResearchPaper = {
      id,
      title: formData.title.trim(),
      slug,
      authors: formData.authors.trim(),
      labAuthors: labAuthors.length > 0 ? labAuthors : undefined,
      publicationType: (formData.publicationType as PublicationType) || "journal",
      venue: formData.venue.trim(),
      year: formData.year || new Date().getFullYear(),
      month: formData.month?.trim() || undefined,
      volume: formData.volume?.trim() || undefined,
      doi: formData.doi?.trim() || undefined,
      doiUrl: formData.doiUrl?.trim() || undefined,
      pdfUrl: formData.pdfUrl?.trim() || undefined,
      codeUrl: formData.codeUrl?.trim() || undefined,
      demoUrl: formData.demoUrl?.trim() || undefined,
      abstract: formData.abstract?.trim() || "",
      keywords,
      field: formData.field || "Edge AI & TinyML",
      badge: formData.badge?.trim() || undefined,
      citationCount: formData.citationCount || 0,
      bibtex: formData.bibtex?.trim() || undefined,
      status: (formData.status as "published" | "accepted" | "in_review") || "published",
      featured: Boolean(formData.featured),
      createdAt: paper?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(fullPaper);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-3xl bg-bg-panel border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border/60 bg-bg-elevated/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent text-white shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text-primary">
                {paper ? "Chỉnh Sửa Bài Báo Nghiên Cứu" : "Đăng Bài Nghiên Cứu Mới"}
              </h3>
              <p className="text-[11px] sm:text-xs text-text-muted line-clamp-1">
                Công bố bài báo khoa học trên hệ thống của Lab Embedded & AIoT PTIT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Tiêu đề */}
          <div className="space-y-1.5">
            <label className="font-semibold text-text-primary flex items-center justify-between">
              <span>Tiêu đề bài báo khoa học (Title) *</span>
              <span className="text-[11px] text-text-muted">Tiếng Anh hoặc Tiếng Việt</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="VD: Ultra-Low-Latency Edge AI Inference on Microcontrollers..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-xs font-medium"
              required
            />
          </div>

          {/* 2. Tác giả & Lab Authors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">
                Danh sách tác giả (Authors) *
              </label>
              <input
                type="text"
                name="authors"
                value={formData.authors || ""}
                onChange={handleChange}
                placeholder="VD: Lê Như Anh*, Trần Văn Nam, Hoàng Đức Minh"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-xs font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary flex items-center justify-between">
                <span>Tác giả thuộc Lab (để làm nổi bật)</span>
                <span className="text-[10px] text-text-muted">Cách nhau dấu phẩy</span>
              </label>
              <input
                type="text"
                value={labAuthorsInput}
                onChange={(e) => setLabAuthorsInput(e.target.value)}
                placeholder="VD: Lê Như Anh, Trần Văn Nam"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-xs font-medium"
              />
            </div>
          </div>

          {/* 3. Phân loại, Tên Tạp chí / Hội nghị & Năm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Phân loại công bố *</label>
              <select
                name="publicationType"
                value={formData.publicationType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium"
              >
                <option value="journal">Tạp chí Quốc tế (ISI / Scopus)</option>
                <option value="conference">Hội nghị Quốc tế (IEEE / ACM)</option>
                <option value="project">Đề tài NCKH & Dự án R&D</option>
                <option value="patent">Bằng Sáng Chế & Sở Hữu Trí Tuệ</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-text-primary">
                Tên Tạp chí / Kỷ yếu Hội nghị / Cơ quan cấp *
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue || ""}
                onChange={handleChange}
                placeholder="VD: IEEE Transactions on Industrial Informatics"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium"
                required
              />
            </div>
          </div>

          {/* 4. Năm, Tập/Trang, Badge, Lĩnh vực */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Năm xuất bản *</label>
              <input
                type="number"
                name="year"
                value={formData.year || new Date().getFullYear()}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Tập / Số / Trang</label>
              <input
                type="text"
                name="volume"
                value={formData.volume || ""}
                onChange={handleChange}
                placeholder="VD: Vol. 21, Issue 6"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Huy hiệu (Badge)</label>
              <input
                type="text"
                name="badge"
                value={formData.badge || ""}
                onChange={handleChange}
                placeholder="VD: Scopus Q1, IEEE Xplore"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Lĩnh vực nghiên cứu</label>
              <select
                name="field"
                value={formData.field}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium"
              >
                {RESEARCH_FIELDS.filter((f) => f !== "Tất cả lĩnh vực").map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. DOI & Links (PDF, Code) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Mã DOI / DOI URL</label>
              <input
                type="text"
                name="doi"
                value={formData.doi || ""}
                onChange={handleChange}
                placeholder="10.1109/TII.2024.3398712"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">Link File PDF Bài Báo</label>
              <input
                type="url"
                name="pdfUrl"
                value={formData.pdfUrl || ""}
                onChange={handleChange}
                placeholder="https://... / link file PDF"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary">GitHub Repository (Code)</label>
              <input
                type="url"
                name="codeUrl"
                value={formData.codeUrl || ""}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium"
              />
            </div>
          </div>

          {/* 6. Abstract */}
          <div className="space-y-1.5">
            <label className="font-semibold text-text-primary">Tóm tắt nghiên cứu (Abstract)</label>
            <textarea
              name="abstract"
              value={formData.abstract || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Tóm tắt phương pháp nghiên cứu, đóng góp mới và kết quả thực nghiệm đạt được..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium leading-relaxed"
            />
          </div>

          {/* 7. Keywords */}
          <div className="space-y-1.5">
            <label className="font-semibold text-text-primary flex items-center justify-between">
              <span>Từ khóa (Keywords)</span>
              <span className="text-[11px] text-text-muted">Ngăn cách bởi dấu phẩy</span>
            </label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="VD: Edge AI, TinyML, FreeRTOS, Anomaly Detection"
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary focus:outline-none focus:border-accent text-xs font-medium"
            />
          </div>

          {/* 8. BibTeX */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-text-primary">Mã trích dẫn BibTeX (LaTeX)</label>
              <button
                type="button"
                onClick={handleAutoGenerateBibtex}
                className="text-[11px] text-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tự động sinh từ thông tin trên</span>
              </button>
            </div>
            <textarea
              name="bibtex"
              value={formData.bibtex || ""}
              onChange={handleChange}
              rows={3}
              placeholder={`@article{author2025title,\n  title={...},\n  author={...}\n}`}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 font-mono text-slate-200 border border-border/80 focus:outline-none focus:border-accent text-[11px] leading-relaxed"
            />
          </div>

          {/* 9. Trạng thái & Ghim nổi bật */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/40">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="featured"
                checked={Boolean(formData.featured)}
                onChange={handleChange}
                className="w-4 h-4 rounded text-accent focus:ring-accent border-border"
              />
              <span className="font-medium text-text-primary text-xs">
                Ghim lên đầu mục nổi bật (Featured Research)
              </span>
            </label>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-text-secondary text-xs">Trạng thái:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none"
              >
                <option value="published">Đã xuất bản (Published)</option>
                <option value="accepted">Được chấp nhận (Accepted)</option>
                <option value="in_review">Đang bình duyệt (In Review)</option>
              </select>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border/80 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-accent hover:bg-accent-hover text-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{paper ? "Lưu Thay Đổi" : "Đăng Bài Nghiên Cứu"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
