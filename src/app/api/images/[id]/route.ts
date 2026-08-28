import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media || !media.data) {
      return new NextResponse("Image Not Found", { status: 404 });
    }

    // Trả về luồng nhị phân trực tiếp từ Database với header caching
    return new Response(Buffer.from(media.data), {
      status: 200,
      headers: {
        "Content-Type": media.mimeType || "image/png",
        "Content-Length": media.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("GET /api/images/[id] error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
