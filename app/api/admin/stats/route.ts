// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Total Buku
    const totalBuku = await prisma.buku.count();

    // Pengunjung Hari Ini (dalam WIB)
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const pengunjungHariIni = await prisma.pengunjung.count({
      where: {
        tanggalKunjungan: {
          gte: startOfDay,
        },
      },
    });

    // ✅ Peminjaman Aktif (HANYA status "dipinjam", TIDAK termasuk terlambat)
    const peminjamanAktif = await prisma.peminjaman.count({
      where: {
        status: "dipinjam",
      },
    });

    // Pengunjung Bulanan (bulan ini)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const pengunjungBulanan = await prisma.pengunjung.count({
      where: {
        tanggalKunjungan: {
          gte: startOfMonth,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalBuku,
        pengunjungHariIni,
        peminjamanAktif,
        pengunjungBulanan,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil statistik" },
      { status: 500 },
    );
  }
}
