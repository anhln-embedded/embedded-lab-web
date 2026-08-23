import { Metadata } from "next";
import { allCourses } from "@/lib/content";
import { CourseList } from "@/components/courses/CourseList";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Danh Mục Khóa Học Thực Hành (Courses) | EMBEDDED-AIOT PTIT",
  description:
    "Các chương trình đào tạo & khóa học thực chiến về Lập trình Zephyr RTOS, Kiến trúc Firmware, Thiết kế Vi mạch FPGA Verilog và AIoT Edge AI trên ESP32-S3.",
};

export default function CoursesPage() {
  return (
    <div className="container py-12 md:py-16 space-y-12">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent-muted text-accent text-xs font-semibold border border-accent/20">
          <GraduationCap className="h-3.5 w-3.5" />
          Đào Tạo Kỹ Sư Thực Chiến • Khoa Điện Tử 1 PTIT
        </div>
        <h1 className="text-display-hero font-bold tracking-tight text-text-primary">
          Khóa Học Kỹ Thuật Chuyên Sâu
        </h1>
        <p className="text-body-large text-text-secondary leading-relaxed">
          Lộ trình đào tạo chuẩn hóa từ căn bản đến nâng cao: Tiếp cận trực tiếp phần cứng thực tế, mã nguồn mẫu chuẩn công nghiệp và tài liệu hướng dẫn thực hành chi tiết.
        </p>
      </div>

      <CourseList />
    </div>
  );
}