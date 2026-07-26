import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const total = await prisma.pengunjung.count();
    const bacaDiTempat = await prisma.pengunjung.count({
      where: { tujuan: "baca_di_tempat" },
    });
    const bawaKeluar = await prisma.pengunjung.count({
      where: { tujuan: "bawa_keluar" },
    });

    return NextResponse.json({
      success: true,
      data: {
        total,
        bacaDiTempat,
        bawaKeluar,
      },
    });
  } catch (error) {
    console.error("Error stats pengunjung:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil statistik" },
      { status: 500 },
    );
  }
}
