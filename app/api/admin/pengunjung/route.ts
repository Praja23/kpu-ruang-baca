// app/api/admin/pengunjung/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const tujuan = searchParams.get("tujuan") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const sort = searchParams.get("sort") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { nik: { contains: search, mode: "insensitive" } },
        { noHp: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tujuan && tujuan !== "Semua") {
      where.tujuan = tujuan;
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.tanggalKunjungan = { ...where.tanggalKunjungan, gte: start };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.tanggalKunjungan = { ...where.tanggalKunjungan, lte: end };
    }

    const [data, total] = await Promise.all([
      prisma.pengunjung.findMany({
        where,
        orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
        skip,
        take: limit,
      }),
      prisma.pengunjung.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error GET admin pengunjung:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}
