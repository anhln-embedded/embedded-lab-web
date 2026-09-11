import { Metadata } from "next";
import { ResearchPaperList } from "@/components/research/ResearchPaperList";

export const metadata: Metadata = {
  title: "Nghiên Cứu & Công Bố Khoa Học (Research) | EMBEDDED-AIOT PTIT",
  description:
    "Nơi đăng tải và công bố các công trình nghiên cứu, bài báo khoa học chuẩn ISI/Scopus, kỷ yếu hội nghị quốc tế IEEE/ACM và đề tài R&D công nghệ của Lab Embedded & AIoT - Khoa Điện Tử 1 PTIT.",
};

export default function ResearchPage() {
  return (
    <div className="container py-10 md:py-14 space-y-10">
      {/* 1. HERO SECTION */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
          Nghiên Cứu Khoa Học & Công Bố Quốc Tế
        </h1>

        <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-3xl mx-auto">
          Tổng hợp các công trình nghiên cứu, bài báo khoa học xuất bản trên các tạp chí quốc tế hàng đầu (IEEE Transactions, Elsevier, Springer), kỷ yếu hội nghị uy tín (IEEE/ACM), đề tài NCKH các cấp và bằng sáng chế công nghệ của nhóm nghiên cứu Embedded & AIoT.
        </p>
      </div>

      {/* 2. MAIN RESEARCH PAPERS HUB */}
      <ResearchPaperList />
    </div>
  );
}
