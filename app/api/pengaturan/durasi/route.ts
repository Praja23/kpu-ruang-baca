// app/api/pengaturan/durasi/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.pengaturan.findUnique({
      where: { key: "durasi_pinjam_jam" },
    });
    return NextResponse.json({
      value: setting ? parseInt(setting.value) : 2,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil durasi" },
      { status: 500 },
    );
  }
}
