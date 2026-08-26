import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const DEFAULT_CATEGORIES = [
  { slug: "linux", name: "Embedded Linux & Kernel", icon: "🐧", order: 1 },
  { slug: "rtos", name: "Real-Time OS (RTOS)", icon: "⚡", order: 2 },
  { slug: "automotive", name: "Automotive & CAN/UDS", icon: "🚗", order: 3 },
  { slug: "mcu", name: "Vi Điều Khiển & SoC", icon: "🎛️", order: 4 },
  { slug: "programming", name: "Lập Trình C & Kỹ Năng", icon: "💻", order: 5 },
  { slug: "hardware", name: "Phần Cứng PCB & FPGA", icon: "📐", order: 6 },
];

export async function GET() {
  try {
    let categories = await prisma.tutorialCategory.findMany({
      orderBy: { order: "asc" },
    });

    // Nếu database chưa có category nào, khởi tạo tự động các danh mục mặc định
    if (!categories || categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.tutorialCategory.create({
          data: cat,
        });
      }
      categories = await prisma.tutorialCategory.findMany({
        orderBy: { order: "asc" },
      });
    }

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error("GET /api/tutorials/categories error:", error);
    return NextResponse.json({ success: true, data: DEFAULT_CATEGORIES });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, icon = "📚", order = 0 } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên nhóm và slug danh mục." },
        { status: 400 }
      );
    }

    const created = await prisma.tutorialCategory.create({
      data: {
        name,
        slug,
        icon,
        order: Number(order) || 0,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("POST /api/tutorials/categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi tạo nhóm danh mục mới" },
      { status: 500 }
    );
  }
}
