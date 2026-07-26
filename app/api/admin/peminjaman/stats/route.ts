// app/api/admin/peminjaman/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // 🔥 Awal dan akhir bulan ini
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Total Peminjaman Aktif = status "dipinjam"
    const totalAktif = await prisma.peminjaman.count({
      where: { status: "dipinjam" },
    });

    // Buku Kembali Hari Ini = status "kembali" DAN tanggalKembali = hari ini
    const kembaliHariIni = await prisma.peminjaman.count({
      where: {
        status: "kembali",
        tanggalKembali: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Terlambat = status "terlambat"
    const terlambat = await prisma.peminjaman.count({
      where: { status: "terlambat" },
    });

    // 🔥 Total Peminjaman Bulan Ini (SEMUA STATUS)
    const peminjamanBulanIni = await prisma.peminjaman.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalAktif,
        kembaliHariIni,
        terlambat,
        peminjamanBulanIni, // 🔥 ganti pengunjungHariIni
      },
    });
  } catch (error) {
    console.error("Error fetching peminjaman stats:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil statistik" },
      { status: 500 },
    );
  }
}
