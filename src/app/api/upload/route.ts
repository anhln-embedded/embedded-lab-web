import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy file hình ảnh tải lên" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Lưu file vào thư mục public/uploads/ để phục vụ tĩnh siêu tốc và bền vững
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".png";
    const cleanBaseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_\-]/g, "_")
      .slice(0, 40);

    const uniqueFileName = `${cleanBaseName}_${Date.now().toString().slice(-6)}${ext}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;

    // 2. Thử lưu thêm vào bảng Media (nếu Prisma Client khả dụng)
    try {
      if ((prisma as any).media) {
        await (prisma as any).media.create({
          data: {
            filename: file.name || uniqueFileName,
            mimeType: file.type || "image/png",
            data: buffer,
            size: buffer.length,
          },
        });
      }
    } catch (dbErr) {
      console.warn("Prisma media table sync skipped:", dbErr);
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: uniqueFileName,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi lưu hình ảnh lên hệ thống" },
      { status: 500 }
    );
  }
}
