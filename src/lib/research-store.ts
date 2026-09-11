import { safeStorage } from "./storage";

export type PublicationType = "journal" | "conference" | "project" | "patent";

export interface ResearchPaper {
  id: string;
  title: string;
  slug?: string;
  authors: string;
  labAuthors?: string[];
  publicationType: PublicationType;
  venue: string;
  year: number;
  month?: string;
  volume?: string;
  doi?: string;
  doiUrl?: string;
  pdfUrl?: string;
  codeUrl?: string;
  demoUrl?: string;
  abstract: string;
  keywords: string[];
  field: string;
  badge?: string;
  citationCount?: number;
  bibtex?: string;
  status: "published" | "accepted" | "in_review";
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const PUBLICATION_TYPES: Record<
  PublicationType,
  { label: string; shortLabel: string; badgeColor: string; icon: string }
> = {
  journal: {
    label: "Tạp chí Quốc tế (ISI / Scopus)",
    shortLabel: "Tạp chí ISI/Scopus",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: "FileText",
  },
  conference: {
    label: "Hội nghị Quốc tế (IEEE / ACM / Springer)",
    shortLabel: "Hội nghị Quốc tế",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    icon: "Award",
  },
  project: {
    label: "Đề tài NCKH & Dự án R&D Chuyển Giao",
    shortLabel: "Đề tài NCKH",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: "Compass",
  },
  patent: {
    label: "Bằng Sáng Chế & Giải Pháp Hữu Ích",
    shortLabel: "Bằng Sáng Chế",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: "ShieldCheck",
  },
};

export const RESEARCH_FIELDS = [
  "Tất cả lĩnh vực",
  "Edge AI & TinyML",
  "Embedded Linux & RTOS",
  "IoT & Mạng Cảm Biến Không Dây",
  "Thiết Kế Vi Mạch FPGA & ASIC",
  "Robotics & Điều Khiển Tự Động",
];

export const DEFAULT_RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: "paper-edge-ai-vibration-2025",
    title:
      "Ultra-Low-Latency Edge AI Inference on Microcontrollers for Industrial Vibration Anomaly Detection",
    slug: "ultra-low-latency-edge-ai-inference-microcontrollers",
    authors: "Lê Như Anh*, Trần Văn Nam, Hoàng Đức Minh, Vũ Quang Huy",
    labAuthors: ["Lê Như Anh", "Trần Văn Nam"],
    publicationType: "journal",
    venue: "IEEE Transactions on Industrial Informatics (Scopus Q1, Impact Factor: 12.3)",
    year: 2025,
    month: "06/2025",
    volume: "Vol. 21, Issue 6, pp. 4120-4132",
    doi: "10.1109/TII.2024.3398712",
    doiUrl: "https://doi.org/10.1109/TII.2024.3398712",
    pdfUrl: "https://arxiv.org/pdf/2405.12345.pdf",
    codeUrl: "https://github.com/embedded-aiot-ptit/edge-ai-vibration-detection",
    abstract:
      "Nghiên cứu đề xuất kiến trúc mạng nơ-ron tích chập 1D lượng tử hóa siêu nhẹ (INT8 Quantized 1D-CNN) triển khai trực tiếp trên vi điều khiển ARM Cortex-M4 (STM32F4) nhằm phát hiện sớm các bất thường cơ khí trong động cơ công nghiệp. Thuật toán đạt độ trễ suy luận dưới 1.8ms và mức tiêu thụ năng lượng giảm 64% so với các giải pháp truyền thống trên Raspberry Pi.",
    keywords: ["Edge AI", "TinyML", "Anomaly Detection", "ARM Cortex-M", "Industrial IoT"],
    field: "Edge AI & TinyML",
    badge: "Scopus Q1",
    citationCount: 14,
    status: "published",
    featured: true,
    bibtex: `@article{anh2025ultralow,
  title={Ultra-Low-Latency Edge AI Inference on Microcontrollers for Industrial Vibration Anomaly Detection},
  author={Le, Nhu Anh and Tran, Van Nam and Hoang, Duc Minh and Vu, Quang Huy},
  journal={IEEE Transactions on Industrial Informatics},
  volume={21},
  number={6},
  pages={4120--4132},
  year={2025},
  publisher={IEEE},
  doi={10.1109/TII.2024.3398712}
}`,
    createdAt: "2025-06-15T08:00:00Z",
    updatedAt: "2025-06-15T08:00:00Z",
  },
  {
    id: "paper-freertos-linux-sync-2025",
    title:
      "A Deterministic Inter-Core Communication Framework for Heterogeneous Dual-Core ARM Cortex-A/Cortex-M SoCs",
    slug: "deterministic-inter-core-communication-framework-soc",
    authors: "Lê Như Anh*, Nguyễn Thành Trung, Đặng Việt Hưng",
    labAuthors: ["Lê Như Anh", "Nguyễn Thành Trung"],
    publicationType: "journal",
    venue: "IEEE Embedded Systems Letters (Scopus Q2, IEEE Xplore)",
    year: 2025,
    month: "03/2025",
    volume: "Vol. 17, Issue 1, pp. 28-32",
    doi: "10.1109/LES.2024.3371902",
    doiUrl: "https://doi.org/10.1109/LES.2024.3371902",
    pdfUrl: "https://arxiv.org/pdf/2403.09876.pdf",
    codeUrl: "https://github.com/embedded-aiot-ptit/openamp-freertos-linux-bridge",
    abstract:
      "Bài báo giới thiệu cơ chế chia sẻ bộ nhớ zero-copy kết hợp giao thức OpenAMP tối ưu hóa cho hệ thống SoC dị thể (STM32MP157 / NXP i.MX8M). Kết quả thực nghiệm chứng minh độ trễ giao tiếp giữa Linux Kernel (Cortex-A) và FreeRTOS (Cortex-M) được giới hạn dưới 4.2 microsecond với độ biến thiên jitter cực thấp, đáp ứng yêu cầu điều khiển thời gian thực cứng trong xe tự hành.",
    keywords: ["Heterogeneous SoC", "FreeRTOS", "Linux Device Driver", "OpenAMP", "Real-Time"],
    field: "Embedded Linux & RTOS",
    badge: "IEEE Xplore",
    citationCount: 8,
    status: "published",
    featured: true,
    bibtex: `@article{anh2025deterministic,
  title={A Deterministic Inter-Core Communication Framework for Heterogeneous Dual-Core ARM Cortex-A/Cortex-M SoCs},
  author={Le, Nhu Anh and Nguyen, Thanh Trung and Dang, Viet Hung},
  journal={IEEE Embedded Systems Letters},
  volume={17},
  number={1},
  pages={28--32},
  year={2025},
  publisher={IEEE},
  doi={10.1109/LES.2024.3371902}
}`,
    createdAt: "2025-03-20T10:00:00Z",
    updatedAt: "2025-03-20T10:00:00Z",
  },
  {
    id: "paper-lorawan-energy-harvesting-2024",
    title:
      "Self-Powered LoRaWAN Sensor Node with Adaptive Transmission Rate for Precision Agriculture in Vietnam",
    slug: "self-powered-lorawan-sensor-node-precision-agriculture",
    authors: "Trần Văn Nam, Lê Như Anh*, Bùi Xuân Bách, PGS.TS. Phạm Văn C",
    labAuthors: ["Trần Văn Nam", "Lê Như Anh", "Bùi Xuân Bách"],
    publicationType: "conference",
    venue: "IEEE International Conference on Advanced Technologies for Communications (ATC 2024)",
    year: 2024,
    month: "10/2024",
    volume: "IEEE ATC 2024 Proceedings, pp. 204-209",
    doi: "10.1109/ATC62189.2024.10756789",
    doiUrl: "https://doi.org/10.1109/ATC62189.2024.10756789",
    pdfUrl: "https://ieeexplore.ieee.org/document/10756789",
    codeUrl: "https://github.com/embedded-aiot-ptit/solar-lorawan-node",
    abstract:
      "Thiết kế nút cảm biến nông nghiệp thông minh tự cấp nguồn từ năng lượng mặt trời (Solar Energy Harvesting) kết hợp siêu tụ điện (Supercapacitor). Sử dụng thuật toán học tăng cường Q-learning thích nghi tần suất gửi gói tin dựa trên trạng thái năng lượng dự trữ, đảm bảo hoạt động liên tục 365 ngày không cần thay pin trong điều kiện khí hậu nhiệt đới gió mùa.",
    keywords: ["LoRaWAN", "Energy Harvesting", "Precision Agriculture", "Q-learning", "IoT Node"],
    field: "IoT & Mạng Cảm Biến Không Dây",
    badge: "IEEE ATC",
    citationCount: 6,
    status: "published",
    featured: false,
    bibtex: `@inproceedings{nam2024selfpowered,
  title={Self-Powered LoRaWAN Sensor Node with Adaptive Transmission Rate for Precision Agriculture in Vietnam},
  author={Tran, Van Nam and Le, Nhu Anh and Bui, Xuan Bach and Pham, Van C},
  booktitle={2024 International Conference on Advanced Technologies for Communications (ATC)},
  pages={204--209},
  year={2024},
  organization={IEEE},
  doi={10.1109/ATC62189.2024.10756789}
}`,
    createdAt: "2024-10-18T14:30:00Z",
    updatedAt: "2024-10-18T14:30:00Z",
  },
  {
    id: "paper-fpga-riscv-accelerator-2024",
    title:
      "An Open-Source RISC-V Custom Coprocessor for Accelerating Cryptographic Hash and AES in Edge Security",
    slug: "open-source-riscv-cryptographic-accelerator-fpga",
    authors: "Lê Như Anh*, Hoàng Đức Minh, Nguyễn Văn Dũng",
    labAuthors: ["Lê Như Anh", "Hoàng Đức Minh"],
    publicationType: "conference",
    venue: "IEEE International System-on-Chip Conference (SOCC 2024)",
    year: 2024,
    month: "09/2024",
    volume: "IEEE SOCC 2024, pp. 88-93",
    doi: "10.1109/SOCC61720.2024.10689345",
    doiUrl: "https://doi.org/10.1109/SOCC61720.2024.10689345",
    pdfUrl: "https://ieeexplore.ieee.org/document/10689345",
    codeUrl: "https://github.com/embedded-aiot-ptit/riscv-crypto-coprocessor",
    abstract:
      "Bài báo trình bày thiết kế và hiện thực vi mạch đồng xử lý mật mã (AES-256, SHA-256) tích hợp trực tiếp vào tập lệnh RISC-V thông qua giao diện RoCC trên nền tảng FPGA Xilinx Artix-7. Bộ tăng tốc phần cứng giúp tăng thông lượng mã hóa lên 23.5 lần so với thực thi bằng phần mềm thuần túy, chỉ chiếm dụng dưới 8% tài nguyên LUT của chip.",
    keywords: ["RISC-V", "FPGA", "Hardware Accelerator", "Cryptography", "AES Hardware"],
    field: "Thiết Kế Vi Mạch FPGA & ASIC",
    badge: "IEEE SOCC",
    citationCount: 9,
    status: "published",
    featured: false,
    bibtex: `@inproceedings{anh2024opensource,
  title={An Open-Source RISC-V Custom Coprocessor for Accelerating Cryptographic Hash and AES in Edge Security},
  author={Le, Nhu Anh and Hoang, Duc Minh and Nguyen, Van Dung},
  booktitle={2024 IEEE 37th International System-on-Chip Conference (SOCC)},
  pages={88--93},
  year={2024},
  organization={IEEE},
  doi={10.1109/SOCC61720.2024.10689345}
}`,
    createdAt: "2024-09-22T09:00:00Z",
    updatedAt: "2024-09-22T09:00:00Z",
  },
  {
    id: "paper-project-ministry-2025",
    title:
      "Đề tài NCKH Cấp Bộ: Nghiên Cứu Thiết Kế Vi Mạch SoC Chuyên Dụng và Giao Thức Bảo Mật Nhẹ Cho Hệ Thống Giám Sát AIoT Công Nghiệp",
    slug: "de-tai-nckh-cap-bo-soc-aiot-cong-nghiep",
    authors: "Chủ trì: Nhóm Nghiên Cứu Lab Embedded & AIoT (Khoa Điện Tử 1 - PTIT)",
    labAuthors: ["Lê Như Anh", "Trần Văn Nam", "Hoàng Đức Minh"],
    publicationType: "project",
    venue: "Bộ Thông Tin và Truyền Thông / Học Viện Công Nghệ Bưu Chính Viễn Thông",
    year: 2025,
    month: "2024 - 2025",
    volume: "Mã số: B2024-HV-08",
    doi: "B2024-HV-08",
    abstract:
      "Đề tài tập trung nghiên cứu toàn diện từ thiết kế phần cứng vi mạch nhúng, tối ưu hóa thuật toán nén mô hình mạng nơ-ron học sâu (Deep Learning Model Compression) đến giao thức bảo mật lớp mạng cảm biến công nghiệp. Đã nghiệm thu thành công sản phẩm mẫu bo mạch thử nghiệm đạt chuẩn môi trường công nghiệp tại các nhà máy đối tác.",
    keywords: ["Đề tài cấp Bộ", "Chuyển giao công nghệ", "AIoT", "SoC", "Bảo mật công nghiệp"],
    field: "Edge AI & TinyML",
    badge: "Đề Tài Trọng Điểm",
    status: "published",
    featured: true,
    createdAt: "2025-01-10T12:00:00Z",
    updatedAt: "2025-01-10T12:00:00Z",
  },
  {
    id: "paper-patent-motor-anomaly-2024",
    title:
      "Bằng Độc Quyền Giải Pháp Hữu Ích: Thiết Bị Thu Thập Và Phân Tích Dữ Liệu Rung Chấn Bằng Máy Học Nhúng Tự Động",
    slug: "bang-doc-quyen-thiet-bi-may-hoc-nhung-rung-chan",
    authors: "Lê Như Anh, Trần Văn Nam, Khoa Điện Tử 1 - Học Viện Công Nghệ Bưu Chính Viễn Thông",
    labAuthors: ["Lê Như Anh", "Trần Văn Nam"],
    publicationType: "patent",
    venue: "Cục Sở Hữu Trí Tuệ Việt Nam (Bộ Khoa học và Công nghệ)",
    year: 2024,
    month: "12/2024",
    volume: "Số bằng: 3128/GPHI-2024",
    doi: "VN-GPHI-3128",
    abstract:
      "Giải pháp hữu ích bảo hộ độc quyền cho cấu trúc mạch điện tử tích hợp cảm biến gia tốc MEMS dải rộng kết hợp thuật toán tiền xử lý biến đổi Wavelet và mạng nơ-ron nén trực tiếp trong bộ nhớ SRAM của vi điều khiển, cho phép phát hiện sự cố lệch trục, mòn ổ bi trước 48 giờ mà không cần đường truyền dữ liệu lên đám mây.",
    keywords: ["Bằng sáng chế", "Giải pháp hữu ích", "Sở hữu trí tuệ", "Cục SHTT", "Chẩn đoán lỗi"],
    field: "Robotics & Điều Khiển Tự Động",
    badge: "Bằng Sáng Chế",
    status: "published",
    featured: false,
    createdAt: "2024-12-05T08:00:00Z",
    updatedAt: "2024-12-05T08:00:00Z",
  },
];

const STORAGE_KEY = "embedded_lab_research_papers";

export function generateBibtex(paper: Partial<ResearchPaper>): string {
  const authorLastName = (paper.authors || "Author")
    .split(",")[0]
    .trim()
    .split(" ")
    .pop()
    ?.toLowerCase() || "paper";
  const year = paper.year || new Date().getFullYear();
  const firstWord = (paper.title || "paper")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .trim()
    .split(/\s+/)[0] || "work";
  const citeKey = `${authorLastName}${year}${firstWord}`;

  if (paper.publicationType === "journal") {
    return `@article{${citeKey},
  title={${paper.title || ""}},
  author={${paper.authors || ""}},
  journal={${paper.venue || ""}},
  volume={${paper.volume || ""}},
  year={${year}},
  doi={${paper.doi || ""}}
}`;
  }

  if (paper.publicationType === "conference") {
    return `@inproceedings{${citeKey},
  title={${paper.title || ""}},
  author={${paper.authors || ""}},
  booktitle={${paper.venue || ""}},
  year={${year}},
  doi={${paper.doi || ""}}
}`;
  }

  return `@misc{${citeKey},
  title={${paper.title || ""}},
  author={${paper.authors || ""}},
  howpublished={${paper.venue || ""}},
  year={${year}}
}`;
}

export function getAllResearchPapers(): ResearchPaper[] {
  if (typeof window === "undefined") {
    return DEFAULT_RESEARCH_PAPERS;
  }

  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RESEARCH_PAPERS));
      return DEFAULT_RESEARCH_PAPERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_RESEARCH_PAPERS;
  } catch (err) {
    console.error("Lỗi đọc research papers từ local storage:", err);
    return DEFAULT_RESEARCH_PAPERS;
  }
}

export function saveResearchPaper(paper: ResearchPaper): ResearchPaper[] {
  if (typeof window === "undefined") return DEFAULT_RESEARCH_PAPERS;

  try {
    const current = getAllResearchPapers();
    const existingIndex = current.findIndex((p) => p.id === paper.id);

    let updated: ResearchPaper[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = {
        ...paper,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updated = [
        {
          ...paper,
          createdAt: paper.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...current,
      ];
    }

    safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Đồng bộ background qua API
    fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paper),
    }).catch((e) => console.warn("Background API sync error:", e));

    return updated;
  } catch (err) {
    console.error("Lỗi lưu bài nghiên cứu:", err);
    return getAllResearchPapers();
  }
}

export function deleteResearchPaper(id: string): ResearchPaper[] {
  if (typeof window === "undefined") return DEFAULT_RESEARCH_PAPERS;

  try {
    const current = getAllResearchPapers();
    const updated = current.filter((p) => p.id !== id);
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Đồng bộ API delete
    fetch(`/api/research/${id}`, {
      method: "DELETE",
    }).catch((e) => console.warn("Background API delete error:", e));

    return updated;
  } catch (err) {
    console.error("Lỗi xóa bài nghiên cứu:", err);
    return getAllResearchPapers();
  }
}
