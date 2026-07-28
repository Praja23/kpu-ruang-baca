import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function updateStatusTerlambat() {
  const now = new Date();
  await prisma.peminjaman.updateMany({
    where: {
      batasWaktu: { lt: now },
      status: "dipinjam",
    },
    data: { status: "terlambat" },
  });
}

export async function GET(request: NextRequest) {
  try {
    await updateStatusTerlambat();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const sort = searchParams.get("sort") || "desc";

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { pengunjung: { nama: { contains: search, mode: "insensitive" } } },
        { pengunjung: { instansi: { contains: search, mode: "insensitive" } } },
        { buku: { judul: { contains: search, mode: "insensitive" } } },
        { buku: { kodeBuku: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status && status !== "Semua") {
      where.status = status;
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.tanggalPinjam = { ...where.tanggalPinjam, gte: start };
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.tanggalPinjam = { ...where.tanggalPinjam, lte: end };
    }

    const [data, total] = await Promise.all([
      prisma.peminjaman.findMany({
        where,
        orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
        skip,
        take: limit,
        include: {
          pengunjung: {
            select: { nama: true, noHp: true, instansi: true },
          },
          buku: {
            select: { judul: true, kategori: true, kodeBuku: true },
          },
        },
      }),
      prisma.peminjaman.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const formattedData = data.map((item) => ({
      id: item.id,
      pengunjung: item.pengunjung?.nama || "Tidak diketahui",
      instansi: item.pengunjung?.instansi || null,
      noHp: item.pengunjung?.noHp || "-",
      buku: item.buku?.judul || item.judulBuku || "Buku telah dihapus", // ✅ PRIORITAS: judulBuku jika buku null
      kodeBuku: item.buku?.kodeBuku || "-",
      kategori: item.buku?.kategori || "Umum",
      tanggalPinjam: item.tanggalPinjam,
      batasWaktu: item.batasWaktu,
      status: item.status,
      tanggalKembali: item.tanggalKembali,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error GET admin peminjaman:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}
