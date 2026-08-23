import { Metadata } from "next";
import Link from "next/link";
import { allPosts, getAllTags } from "@/lib/content";
import { BlogPostList } from "@/components/blog/BlogPostList";
import { QuickStatusCreator } from "@/components/blog/QuickStatusCreator";
import { FanpageHeader } from "@/components/blog/FanpageHeader";
import { Button } from "@/components/ui/Button";
import {
  ExternalLink,
  MapPin,
  Users,
  CheckCircle2,
  GitBranch,
  Calendar,
  Sparkles,
  Megaphone,
  BookOpen,
  GraduationCap,
  Award,
  Share2,
  Mail,
  ShieldCheck
} from "lucide-react";
import { FacebookIcon } from "@/components/ui/FacebookIcon";

export const metadata: Metadata = {
  title: "Fanpage & Nhật Ký Hoạt Động | Embedded AIoT Laboratory",
  description:
    "Trang tin tức, nhật ký thực nghiệm bàn đo và thông báo tuyển thành viên chính thức của Embedded AIoT Laboratory - Khoa Điện Tử 1 PTIT.",
};

export default function BlogPage() {
  const tags = getAllTags();

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* 1. INTERACTIVE FANPAGE COVER & PROFILE HEADER WITH IMAGE UPLOADERS */}
      <FanpageHeader />

      {/* 2. MAIN 2-COLUMN INDEPENDENT SCROLL LAYOUT (2 cột lăn riêng độc lập) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Column: Feed Stream & Status Creator - Cuộn độc lập */}
        <div className="lg:col-span-8 space-y-6 min-w-0 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-3 lg:sticky lg:top-20">
          {/* Quick Post / Status Creator Box */}
          <QuickStatusCreator />

          {/* Fanpage Social Posts Feed Stream */}
          <BlogPostList />
        </div>

        {/* Right Column: Fanpage Info & Widgets - Cuộn độc lập */}
        <div className="lg:col-span-4 space-y-6 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-2 lg:sticky lg:top-20">
          {/* Widget 1: Giới thiệu Fanpage Lab */}
          <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-md space-y-4">
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-3">
              <ShieldCheck className="w-4 h-4 text-accent" />
              Thông Tin Phòng Lab
            </h3>

            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">🏢</span>
                <div>
                  <strong className="text-text-primary">Đơn vị chủ quản:</strong> Khoa Điện Tử 1, Học viện Công nghệ Bưu chính Viễn thông.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">📍</span>
                <div>
                  <strong className="text-text-primary">Địa điểm:</strong> Sân B9 (PTIT Hà Đông).
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FacebookIcon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary">Facebook:</strong>{" "}
                  <a
                    href="https://www.facebook.com/EmbeddedAIoTLAB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-mono"
                  >
                    fb.com/EmbeddedAIoTLAB
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <a
                href="https://www.facebook.com/EmbeddedAIoTLAB"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
                <span>Nhắn tin cho Fanpage</span>
              </a>
            </div>
          </div>

          {/* Widget 2: Tuyển thành viên Highlight Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-bg-panel via-rose-500/5 to-bg-elevated border border-rose-500/30 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Megaphone className="w-4 h-4" />
              Tuyển Thành Viên Lab
            </div>
            <h4 className="font-bold text-sm text-text-primary">
              Mở Đơn Tuyển CTV & Kỹ Sư Nghiên Cứu Gen Mới
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Dành cho sinh viên PTIT đam mê mạch thật, firmware và AIoT. Đào tạo bài bản theo 5 lộ trình chuyên sâu.
            </p>
            <Button variant="primary" size="sm" asChild className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
              <a
                href="https://www.facebook.com/EmbeddedAIoTLAB"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
                <span>Đăng ký ứng tuyển ngay</span>
              </a>
            </Button>
          </div>

          {/* Widget 3: Quick Links & GitHub */}
          <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-md space-y-3">
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-2.5">
              <Sparkles className="w-4 h-4 text-accent" />
              Lối Tắt Nhanh
            </h3>
            <div className="space-y-2 text-xs">
              <Link href="/roadmap" className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-accent" />
                  Lộ trình học tập (Roadmap)
                </span>
                <span>&rarr;</span>
              </Link>
              <Link href="/courses" className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  Khóa học thực hành
                </span>
                <span>&rarr;</span>
              </Link>
              <a
                href="https://github.com/embedded-aiot-ptit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-text-muted" />
                  GitHub Organization Lab
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}