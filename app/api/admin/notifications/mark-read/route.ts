import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = payload.userId as number;

    await prisma.admin.update({
      where: { id: userId },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Semua notifikasi telah ditandai sebagai sudah dibaca",
    });
  } catch (error) {
    console.error("Error mark read:", error);
    return NextResponse.json(
      { error: "Gagal menandai notifikasi" },
      { status: 500 }
    );
  }
}