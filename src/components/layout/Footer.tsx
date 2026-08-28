"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/utils";
import {
  MapPin,
  GitBranch,
  Mail,
  GraduationCap,
  Sparkles,
  Compass,
  FileText,
  ExternalLink,
  Code2
} from "lucide-react";
import { FacebookIcon } from "@/components/ui/FacebookIcon";

export function Footer() {
  const pathname = usePathname();
  const footerRef = React.useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  // Ẩn hoàn toàn Footer trên trang đăng nhập
  if (pathname === "/login" || pathname?.startsWith("/login")) {
    return null;
  }

  // IntersectionObserver: Kích hoạt hiệu ứng Slide-in khi cuộn tới gần chân trang
  React.useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <footer
      ref={footerRef}
      className={`bg-slate-50/95 dark:bg-[#0b0f19]/95 border-t border-slate-200/90 dark:border-slate-800/90 text-slate-600 dark:text-slate-400 mt-auto transition-all duration-700 ease-out will-change-transform ${
        isVisible
          ? "opacity-100 translate-y-0 shadow-2xl"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <div className="container py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Cột 1: Thương hiệu & Thông tin Lab (Chiếm 6/12) */}
          <div className="md:col-span-6 space-y-3.5">
            <Link href="/" className="flex items-center gap-3 group w-fit" aria-label="EMBEDDED-AIOT Home">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center flex-shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="EMBEDDED-AIOT Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[15px] tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-accent transition-colors">
                  EMBEDDED<span className="text-accent">-AIOT LAB</span>
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold tracking-wide uppercase">
                  Khoa Điện Tử 1 · Học Viện CN Bưu Chính Viễn Thông
                </span>
              </div>
            </Link>

            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-md">
              Phòng nghiên cứu & đào tạo chuyên sâu về <strong>Hệ thống Nhúng, AIoT, Firmware Kiến trúc Vi xử lý & Thiết kế Vi mạch</strong>.
            </p>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
              <span>Phòng Lab Sân B9 — Học viện Công nghệ Bưu chính Viễn thông (Hà Nội)</span>
            </div>

            {/* Cụm icon mạng xã hội tròn gọn gàng đồng nhất */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.facebook.com/EmbeddedAIoTLAB"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center shadow-xs"
                aria-label="Fanpage Facebook chính thức"
                title="Fanpage Facebook chính thức"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
              </a>

              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all flex items-center justify-center shadow-xs"
                aria-label="GitHub Organization Lab"
                title="GitHub Lab"
              >
                <GitBranch className="h-3.5 w-3.5" />
              </a>

              <a
                href={`mailto:${siteConfig.email}`}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all flex items-center justify-center shadow-xs"
                aria-label="Email liên hệ Lab"
                title="Email Lab"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Cột 2: Đào Tạo & Học Tập (Chiếm 3/12) */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              Đào Tạo & Học Tập
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/tutorials"
                  className="group flex items-center justify-between py-0.5 text-slate-600 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Compass className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors" />
                    <span>Chuyên đề Kỹ thuật</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                    Mới
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/roadmap"
                  className="group flex items-center gap-2 py-0.5 text-slate-600 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors" />
                  <span>Lộ trình Kỹ sư Nhúng</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="group flex items-center gap-2 py-0.5 text-slate-600 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors" />
                  <span>Khóa học Thực hành</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="group flex items-center gap-2 py-0.5 text-slate-600 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors" />
                  <span>Bảng tin & Nghiên cứu</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Tài Nguyên & Kết Nối (Chiếm 3/12) */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              Tài Nguyên & Kết Nối
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-0.5 text-slate-600 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <GitBranch className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors" />
                    <span>Mã nguồn mở GitHub</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/EmbeddedAIoTLAB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-0.5 text-slate-600 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <FacebookIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors" />
                    <span>Cộng đồng Lab PTIT</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="group flex items-center gap-2 py-0.5 text-slate-600 dark:text-slate-400 hover:text-accent dark:hover:text-accent transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors" />
                  <span>Hợp tác & Tuyển thành viên</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Dải phân cách & Bản quyền dưới đáy */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <p>© 2026 Embedded-AIoT Lab · Khoa Điện Tử 1 — Học viện Công nghệ Bưu chính Viễn thông.</p>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
              PTIT Electronics
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}