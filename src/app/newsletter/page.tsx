import { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Mail, Sparkles, BookOpen, Wrench, Microscope, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Bản Tin Nghiên Cứu Lab (Newsletter) | EMBEDDED-AIOT PTIT",
  description:
    "Đăng ký nhận bản tin kỹ thuật hàng tuần từ Embedded-AIoT Lab (Khoa Điện Tử PTIT): Bài viết chuyên sâu, ghi chép từ bàn đo RF và tài liệu vi điều khiển mới nhất.",
};

export default function NewsletterPage() {
  return (
    <div className="container py-12 md:py-16 max-w-4xl space-y-16">
      {/* Header & Subscribe Box */}
      <div className="text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent-muted text-accent text-xs font-semibold border border-accent/20">
          <Mail className="h-3.5 w-3.5" />
          Bản Tin Hàng Tuần • Thứ Sáu Hàng Tuần
        </div>

        <h1 className="text-display-hero font-bold tracking-tight text-text-primary">
          Bản Tin Kỹ Thuật Embedded-AIoT
        </h1>

        <p className="text-body-large text-text-secondary leading-relaxed">
          Mỗi tuần một bài phân tích chuyên sâu về phần cứng/firmware, 3 công cụ & thư viện mã nguồn mở đáng thử và ghi chép thực tế từ trạm đo của Lab.
        </p>

        {/* Subscribe Form */}
        <form
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto p-2 rounded-2xl bg-bg-panel border border-border/80 shadow-md"
          action="/api/newsletter"
          method="POST"
        >
          <input
            type="email"
            name="email"
            placeholder="email.sinhvien@ptit.edu.vn"
            required
            className="flex-1 px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent text-sm"
          />
          <Button type="submit" variant="primary" size="md" className="bg-accent hover:bg-accent-hover text-white font-semibold whitespace-nowrap">
            Đăng ký nhận tin
          </Button>
        </form>

        <p className="text-xs text-text-muted">
          Hoàn toàn miễn phí cho sinh viên và kỹ sư. Không spam quảng cáo.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          {
            icon: Microscope,
            color: "text-accent",
            title: "Ghi Chép Bàn Đo (Lab Bench)",
            desc: "Số liệu đo đạc thực tế từ VNA, Spectrum Analyzer, lỗi HardFault và kinh nghiệm debug vi mạch.",
          },
          {
            icon: Wrench,
            color: "text-accent-amber",
            title: "Tools & Thư Viện Open-Source",
            desc: "Chia sẻ template GitHub Actions CI/CD nhúng, firmware drivers, và script phân tích tín hiệu Python.",
          },
          {
            icon: BookOpen,
            color: "text-accent-cyan",
            title: "Tài Liệu & Khóa Học Mới",
            desc: "Thông báo sớm nhất về các workshop, chuyên đề nghiên cứu và bài giảng mở tại PTIT.",
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} variant="bordered" className="p-6 text-center bg-bg-panel space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-border mx-auto flex items-center justify-center">
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <h3 className="text-sm font-bold text-text-primary">{item.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* Recent Issues Preview */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-text-primary">
            Các Số Đã Phát Hành Gần Đây
          </h2>
          <p className="text-xs text-text-muted">Lưu trữ các bài viết tuyển chọn đã gửi qua email.</p>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          {[
            {
              issue: "#042",
              date: "15 Tháng 8, 2026",
              title: "Setup Lab RF: So sánh thực tế LiteVNA vs Siglent SSA3021X",
              preview: "Các bẫy đo thông số S11 thường gặp và kỹ thuật bù trừ cáp đo.",
            },
            {
              issue: "#041",
              date: "08 Tháng 8, 2026",
              title: "Zephyr Device Tree: Viết custom driver binding cho cảm biến IMU",
              preview: "Tối ưu hóa ngắt GPIO và định nghĩa thuộc tính .yaml chuẩn Zephyr.",
            },
            {
              issue: "#040",
              date: "01 Tháng 8, 2026",
              title: "ESP32-S3 YOLOv8 Edge AI: 14 FPS với 2MB PSRAM",
              preview: "Tận dụng tập lệnh vector Xtensa và thư viện ESP-DL INT8.",
            },
            {
              issue: "#039",
              date: "25 Tháng 7, 2026",
              title: "Soft Core RISC-V trên FPGA: PicoRV32 vs VexRiscv",
              preview: "Phân tích tài nguyên LUT, BRAM và khả năng kết nối ngoại vi AXI.",
            },
          ].map((issue) => (
            <div
              key={issue.issue}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-bg-panel border border-border hover:border-accent/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-accent">{issue.issue}</span>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">{issue.title}</h4>
                  <p className="text-[11px] text-text-muted">{issue.preview}</p>
                </div>
              </div>
              <time className="text-[11px] text-text-muted font-mono whitespace-nowrap">{issue.date}</time>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}