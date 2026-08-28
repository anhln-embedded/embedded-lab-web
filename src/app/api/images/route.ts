import { NextResponse } from "next/server";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";

export interface MediaItem {
  name: string;
  url: string;
  size: number;
  createdAt: string;
  source: "disk" | "db";
}

// GET /api/images - Liệt kê toàn bộ danh sách hình ảnh
export async function GET() {
  try {
    const mediaList: MediaItem[] = [];
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // 1. Quét từ thư mục /public/uploads/
    try {
      const files = await readdir(uploadDir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
          const filePath = path.join(uploadDir, file);
          const fileStat = await stat(filePath);
          mediaList.push({
            name: file,
            url: `/uploads/${file}`,
            size: fileStat.size,
            createdAt: fileStat.mtime.toISOString(),
            source: "disk",
          });
        }
      }
    } catch {
      // Bỏ qua nếu thư mục chưa tồn tại
    }

    // Sắp xếp theo ngày tạo mới nhất trước
    mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: mediaList });
  } catch (error: any) {
    console.error("GET /api/images error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lấy danh sách hình ảnh" },
      { status: 500 }
    );
  }
}

// DELETE /api/images - Xóa ảnh khỏi disk
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { success: false, error: "Thiếu tên file cần xóa" },
        { status: 400 }
      );
    }

    // Ngăn chặn Path Traversal
    const safeName = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", safeName);

    try {
      await unlink(filePath);
    } catch (e) {
      console.warn("File not found on disk:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa ảnh ${safeName} thành công`,
    });
  } catch (error: any) {
    console.error("DELETE /api/images error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi xóa ảnh" },
      { status: 500 }
    );
  }
}
