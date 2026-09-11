import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDiscussionSchema } from "@/lib/db-sync";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/discussions/[id]/view - Tăng số lượt xem
export async function POST(request: Request, { params }: Params) {
  try {
    await ensureDiscussionSchema();
    const { id } = await params;

    const thread = await prisma.discussionThread.update({
      where: { id },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        viewsCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: thread,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to increment views" },
      { status: 500 }
    );
  }
}
