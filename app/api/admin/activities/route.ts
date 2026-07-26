// app/api/admin/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Ambil parameter page & limit dari query string
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    // Ambil data dengan pagination + total count
    const [activities, total] = await Promise.all([
      prisma.peminjaman.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          pengunjung: {
            select: { nama: true },
          },
          buku: {
            select: { judul: true },
          },
        },
      }),
      prisma.peminjaman.count(),
    ]);

    // Format data
    const formatted = activities.map((item) => {
      const statusMap: Record<
        string,
        { label: string; status: "Selesai" | "Proses" }
      > = {
        dipinjam: { label: "Dipinjam", status: "Proses" },
        kembali: { label: "Dikembalikan", status: "Selesai" },
        terlambat: { label: "Terlambat", status: "Proses" },
      };

      const info = statusMap[item.status] || {
        label: item.status,
        status: "Proses",
      };

      return {
        title: item.buku?.judul || "Buku tidak ditemukan",
        visitor: item.pengunjung?.nama || "Tidak diketahui",
        action: info.label,
        status: info.status,
        time: item.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil aktivitas" },
      { status: 500 },
    );
  }
}
