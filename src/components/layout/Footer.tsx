"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/utils";
import {
  MapPin,
  ExternalLink,
  GitBranch,
  Mail,
  Rss,
  GraduationCap,
  Layers,
  BookOpen,
  Send
} from "lucide-react";
import { FacebookIcon } from "@/components/ui/FacebookIcon";

export function Footer() {
  const pathname = usePathname();
  const [tracks, setTracks] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadTracks = () => {
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("embedded_lab_roadmap_tracks");
          if (raw) {
            setTracks(JSON.parse(raw));
          } else {
            setTracks([]);
          }
        } catch {
          setTracks([]);
        }
      }
    };

    loadTracks();

    window.addEventListener("embedded_roadmap_updated", loadTracks);
    return () => window.removeEventListener("embedded_roadmap_updated", loadTracks);
  }, []);

  // Ẩn hoàn toàn Footer trên trang đăng nhập (sau khi tất cả React Hooks đã được khai báo)
  if (pathname === "/login" || pathname?.startsWith("/login")) {
    return null;
  }

  return (
    <footer className="bg-bg-panel border-t border-border/80 text-text-secondary mt-auto">
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 1. Brand & Lab Info */}
          <div className="space-y-3 lg:pr-4">
            <Link href="/" className="flex items-center gap-3 group" aria-label="EMBEDDED-AIOT Home">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white dark:bg-bg-elevated p-1 border border-border flex items-center justify-center flex-shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="EMBEDDED-AIOT Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-text-primary group-hover:text-accent transition-colors">
                  EMBEDDED<span className="text-accent">-AIOT</span>
                </span>
                <span className="text-[11px] text-text-muted font-medium">
                  Khoa Điện Tử 1 · PTIT
                </span>
              </div>
            </Link>

            <p className="text-text-secondary text-xs leading-relaxed">
              Phòng nghiên cứu & đào tạo chuyên sâu về <strong>Hệ thống Nhúng, AIoT, Thiết kế Vi mạch & Phần cứng</strong>.
            </p>

            <div className="flex items-start gap-1.5 text-xs text-text-muted">
              <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
              <span>Sân B9 - Học viện Công nghệ Bưu chính Viễn thông (Hà Đông)</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.facebook.com/EmbeddedAIoTLAB"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-bg-elevated border border-border text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all text-xs font-semibold flex items-center gap-1.5"
                title="Fanpage Facebook chính thức"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
                <span>Fanpage Lab</span>
              </a>

              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-bg-elevated border border-border text-text-muted hover:text-accent hover:border-accent/40 transition-all"
                aria-label="GitHub Organization Lab"
                title="GitHub Lab"
              >
                <GitBranch className="h-3.5 w-3.5" />
              </a>

              <a
                href={`mailto:${siteConfig.email}`}
                className="p-2 rounded-xl bg-bg-elevated border border-border text-text-muted hover:text-accent hover:border-accent/40 transition-all"
                aria-label="Email liên hệ Lab"
                title="Email Lab"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* 2. Navigation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-accent" />
              Điều Hướng
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="hover:text-accent transition-colors flex items-center gap-1.5 font-semibold text-text-primary">
                  <span>Chuyên đề Kỹ thuật</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/15 text-amber-500 font-semibold">Hot</span>
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-accent transition-colors">
                  Lộ trình Kỹ sư Chuyên nghiệp
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-accent transition-colors">
                  Danh mục Khóa học
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <span>Bảng tin & Fanpage Lab</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-accent transition-colors text-text-muted">
                  Cổng Quản Trị (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Specialized Tracks or Learning Resources (Dynamic) */}
          <div className="space-y-3">
            {tracks.length > 0 ? (
              <>
                <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  Lộ Trình Chuyên Môn
                </h3>
                <ul className="space-y-2 text-xs">
                  {tracks.map((t) => (
                    <li key={t.id}>
                      <Link href="/roadmap" className="hover:text-accent transition-colors flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="line-clamp-1">{t.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  Tài Nguyên & Học Tập
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/courses" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Khóa học thực hành Lab</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-accent transition-colors flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>Bảng tin kỹ thuật & NCKH</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/roadmap" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Định hướng lộ trình Kỹ sư</span>
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://github.com/embedded-aiot-ptit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-purple-400 transition-colors flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span>Kho mã nguồn mở Lab</span>
                    </a>
                  </li>
                </ul>
              </>
            )}
          </div>

          {/* 4. Newsletter & Community */}
          <div className="space-y-3">
            <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider">
              Nhận Bản Tin Kỹ Thuật
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Đăng ký để nhận tài liệu thực hành bàn đo, slide bài giảng và thông báo tuyển thành viên mới.
            </p>
            <form className="flex flex-col gap-2" action="/api/newsletter" method="POST">
              <div className="flex items-center gap-1.5">
                <input
                  type="email"
                  name="email"
                  placeholder="email.sinhvien@ptit.edu.vn"
                  required
                  className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-accent hover:bg-accent-hover text-white transition-colors"
                  title="Gửi đăng ký"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 mt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-text-muted">
          <div>
            © {new Date().getFullYear()} Embedded AIoT Laboratory · Khoa Điện Tử 1 - Học viện Công nghệ Bưu chính Viễn thông.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/EmbeddedAIoTLAB" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400 flex items-center gap-1">
              <FacebookIcon className="w-3 h-3" />
              <span>Facebook Fanpage</span>
            </a>
            <span>·</span>
            <Link href="/roadmap" className="hover:underline hover:text-text-primary">
              Lộ trình
            </Link>
            <span>·</span>
            <Link href="/courses" className="hover:underline hover:text-text-primary">
              Khóa học
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}