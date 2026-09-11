import { Metadata } from "next";
import { UserProfileView } from "@/components/profile/UserProfileView";

export const metadata: Metadata = {
  title: "Hồ Sơ & Tài Khoản Của Tôi | EMBEDDED-AIOT PTIT",
  description: "Trang quản lý thông tin tài khoản, ảnh đại diện và hồ sơ tác giả bài viết trên hệ thống phòng lab Embedded-AIoT PTIT.",
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-bg-base">
      <UserProfileView />
    </main>
  );
}
