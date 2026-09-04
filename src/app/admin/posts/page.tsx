import { redirect } from "next/navigation";

export default function AdminPostsRedirect() {
  redirect("/admin?tab=posts");
}
