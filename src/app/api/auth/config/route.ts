import { NextResponse } from "next/server";
import { parseEmailList } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const rawAdmins =
    process.env.SUPER_ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS ||
    "anhln.embedded@gmail.com,anhlnembedded@gmail.com";

  const superAdminEmails = parseEmailList(rawAdmins);

  return NextResponse.json({
    superAdminEmails,
    hasGoogleAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}

