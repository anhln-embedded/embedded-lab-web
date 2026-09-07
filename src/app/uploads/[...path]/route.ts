import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
  ".avif": "image/avif",
};

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    // Ghép các phân đoạn đường dẫn an toàn
    const relativePath = pathSegments.map((p) => decodeURIComponent(p)).join("/");

    // Chống Path Traversal
    if (relativePath.includes("..") || path.isAbsolute(relativePath)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const filename = path.basename(relativePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // 1. Kiểm tra file trên ổ đĩa thư mục public/uploads/
    const diskPath = path.join(process.cwd(), "public", "uploads", relativePath);
    try {
      const fileStat = await stat(diskPath);
      if (fileStat.isFile()) {
        const fileBuffer = await readFile(diskPath);
        return new Response(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Length": fileStat.size.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch {
      // Bỏ qua nếu file chưa có trên đĩa cứng
    }

    // 2. Dự phòng: Kiểm tra dữ liệu trong bảng Media của Database SQLite
    try {
      if ((prisma as any).media) {
        const media = await (prisma as any).media.findFirst({
          where: {
            filename: {
              in: [filename, relativePath],
            },
          },
        });

        if (media && media.data) {
          const mediaBuffer = Buffer.from(media.data);
          return new Response(mediaBuffer, {
            status: 200,
            headers: {
              "Content-Type": media.mimeType || contentType,
              "Content-Length": mediaBuffer.length.toString(),
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Database media lookup fallback error:", dbErr);
    }

    return new NextResponse("File Not Found", { status: 404 });
  } catch (error: any) {
    console.error("GET /uploads error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
