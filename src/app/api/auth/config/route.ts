import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const rawAdmins =
    process.env.SUPER_ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS ||
    "";

  const superAdminEmails = rawAdmins
    .split(",")
    .map((e) => {
      const clean = e.toLowerCase().trim();
      const [l, d] = clean.split("@");
      if (d === "gmail.com" || d === "googlemail.com") {
        return `${l.replace(/\./g, "")}@${d}`;
      }
      return clean;
    })
    .filter(Boolean);

  return NextResponse.json({
    superAdminEmails,
    hasGoogleAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}
