import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

const BRANDING_FILE_PATH = path.join(process.cwd(), "public", "branding.json");

// Đảm bảo bảng SystemSetting tồn tại trong SQLite
async function ensureSettingTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SystemSetting" (
        "key" TEXT NOT NULL PRIMARY KEY,
        "value" TEXT NOT NULL,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.warn("Failed to ensure SystemSetting table:", err);
  }
}

// 1. GET: Lấy thông tin ảnh bìa và avatar fanpage của Lab cho tất cả mọi người
export async function GET() {
  try {
    await ensureSettingTable();

    let coverUrl = "";
    let avatarUrl = "/images/logo.png";

    // 1.1 Thử đọc từ Database SQLite
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(`
        SELECT "key", "value" FROM "SystemSetting" WHERE "key" IN ('fanpage_cover_url', 'fanpage_avatar_url')
      `);

      for (const row of rows) {
        if (row.key === "fanpage_cover_url" && row.value) {
          coverUrl = row.value;
        }
        if (row.key === "fanpage_avatar_url" && row.value) {
          avatarUrl = row.value;
        }
      }
    } catch (dbErr) {
      console.warn("Lỗi đọc branding từ DB:", dbErr);
    }

    // 1.2 Nếu trong DB chưa có coverUrl, thử đọc từ file dự phòng public/branding.json
    if (!coverUrl) {
      try {
        const fileContent = await readFile(BRANDING_FILE_PATH, "utf-8");
        const json = JSON.parse(fileContent);
        if (json.coverUrl) coverUrl = json.coverUrl;
        if (json.avatarUrl) avatarUrl = json.avatarUrl;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: {
        coverUrl,
        avatarUrl,
      },
    });
  } catch (error: any) {
    console.error("GET /api/fanpage/branding error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lấy thông tin ảnh bìa" },
      { status: 500 }
    );
  }
}

// 2. POST: Lưu ảnh bìa và avatar fanpage (áp dụng cho toàn bộ người xem web)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coverUrl, avatarUrl } = body;

    await ensureSettingTable();

    // 2.1 Lưu vào SQLite Database
    if (coverUrl !== undefined) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "SystemSetting" ("key", "value", "updatedAt")
         VALUES ('fanpage_cover_url', ?, CURRENT_TIMESTAMP)
         ON CONFLICT("key") DO UPDATE SET "value" = excluded."value", "updatedAt" = CURRENT_TIMESTAMP`,
        coverUrl || ""
      );
    }

    if (avatarUrl !== undefined) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "SystemSetting" ("key", "value", "updatedAt")
         VALUES ('fanpage_avatar_url', ?, CURRENT_TIMESTAMP)
         ON CONFLICT("key") DO UPDATE SET "value" = excluded."value", "updatedAt" = CURRENT_TIMESTAMP`,
        avatarUrl || "/images/logo.png"
      );
    }

    // 2.2 Đồng thời ghi ra file public/branding.json để đảm bảo tính sẵn sàng cao
    try {
      const uploadDir = path.dirname(BRANDING_FILE_PATH);
      await mkdir(uploadDir, { recursive: true });

      let currentData: any = {};
      try {
        const raw = await readFile(BRANDING_FILE_PATH, "utf-8");
        currentData = JSON.parse(raw);
      } catch {}

      const newData = {
        coverUrl: coverUrl !== undefined ? coverUrl : currentData.coverUrl || "",
        avatarUrl: avatarUrl !== undefined ? avatarUrl : currentData.avatarUrl || "/images/logo.png",
        updatedAt: new Date().toISOString(),
      };

      await writeFile(BRANDING_FILE_PATH, JSON.stringify(newData, null, 2), "utf-8");
    } catch (fsErr) {
      console.warn("Không thể ghi public/branding.json:", fsErr);
    }

    return NextResponse.json({
      success: true,
      message: "Đã lưu ảnh bìa và ảnh đại diện Fanpage thành công cho toàn bộ người dùng!",
      data: {
        coverUrl,
        avatarUrl,
      },
    });
  } catch (error: any) {
    console.error("POST /api/fanpage/branding error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi lưu ảnh bìa Fanpage" },
      { status: 500 }
    );
  }
}
