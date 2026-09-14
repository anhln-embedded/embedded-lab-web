import { Suspense } from "react";
import { SearchClientView } from "./SearchClientView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm Kiếm Sâu Kỹ Thuật & Bài Viết | Embedded-AIoT Lab",
  description: "Công cụ tìm kiếm thông minh chuyên sâu trong toàn bộ bài viết chuyên đề, bài giảng khóa học, đề tài nghiên cứu khoa học và mã nguồn kỹ thuật nhúng của Embedded-AIoT Lab PTIT.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    }>
      <SearchClientView />
    </Suspense>
  );
}
