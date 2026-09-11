import { redirect } from "next/navigation";

/**
 * Trang /admin/posts/new đã được gỡ bỏ theo yêu cầu.
 * Tự động chuyển hướng toàn bộ truy cập về bảng điều khiển quản trị /admin.
 */
export default function NewPostPage() {
  redirect("/admin");
}
