import { redirect } from "next/navigation";

export default function AdminTutorialsRedirect() {
  redirect("/admin?tab=tutorials");
}
