// app/api/admin/laporan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNowWIB, formatWIB } from "@/lib/date";

function startOfDayWIB(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDayWIB(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const nowWIB = getNowWIB();

    let start: Date, end: Date;

    if (startDate && endDate) {
      start = new Date(startDate + "T00:00:00+07:00");
      end = new Date(endDate + "T23:59:59+07:00");
    } else {
      end = endOfDayWIB(nowWIB);
      start = new Date(end);
      start.setDate(start.getDate() - 30);
      start = startOfDayWIB(start);
    }

    // === SUMMARY ===
    const totalPengunjung = await prisma.pengunjung.count({
      where: { tanggalKunjungan: { gte: start, lte: end } },
    });

    const totalTransaksi = await prisma.peminjaman.count({
      where: { createdAt: { gte: start, lte: end } },
    });

    const totalKembali = await prisma.peminjaman.count({
      where: {
        status: "kembali",
        createdAt: { gte: start, lte: end },
      },
    });

    const rasioPengembalian =
      totalTransaksi > 0
        ? Math.round((totalKembali / totalTransaksi) * 100)
        : 0;

    // === CHART: HARIAN ===
    const dailyLabels: string[] = [];
    const dailyValues: number[] = [];
    const todayWIB = startOfDayWIB(nowWIB);

    let currentDay = new Date(todayWIB);
    while (currentDay.getDay() !== 1) {
      currentDay.setDate(currentDay.getDate() - 1);
    }

    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDay);
      d.setDate(d.getDate() + i);
      const dayStart = startOfDayWIB(d);
      const dayEnd = endOfDayWIB(d);

      const count = await prisma.pengunjung.count({
        where: {
          tanggalKunjungan: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      dailyLabels.push(
        d.toLocaleDateString("id-ID", {
          weekday: "short",
          timeZone: "Asia/Jakarta",
        }),
      );
      dailyValues.push(count);
    }

    // === CHART: MINGGUAN ===
    const weeklyLabels: string[] = [];
    const weeklyValues: number[] = [];

    let monday = new Date(todayWIB);
    while (monday.getDay() !== 1) {
      monday.setDate(monday.getDate() - 1);
    }
    monday = startOfDayWIB(monday);

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(monday);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const count = await prisma.pengunjung.count({
        where: {
          tanggalKunjungan: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      });

      weeklyLabels.push(`Minggu ${4 - i}`);
      weeklyValues.push(count);
    }

    // === CHART: BULANAN ===
    const monthlyLabels: string[] = [];
    const monthlyValues: number[] = [];
    const startMonth = new Date(nowWIB.getFullYear(), 0, 1);

    for (let i = 0; i < 12; i++) {
      const d = new Date(startMonth);
      d.setMonth(i);
      const monthStart = startOfDayWIB(d);
      const monthEnd = new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const count = await prisma.pengunjung.count({
        where: {
          tanggalKunjungan: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      monthlyLabels.push(
        d.toLocaleDateString("id-ID", {
          month: "short",
          timeZone: "Asia/Jakarta",
        }),
      );
      monthlyValues.push(count);
    }

    // === CHART: TAHUNAN ===
    const yearlyLabels: string[] = [];
    const yearlyValues: number[] = [];
    const currentYear = nowWIB.getFullYear();

    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

      const count = await prisma.pengunjung.count({
        where: {
          tanggalKunjungan: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      yearlyLabels.push(year.toString());
      yearlyValues.push(count);
    }

    // === DONUT ===
    const bacaDiTempat = await prisma.pengunjung.count({
      where: {
        tujuan: "baca_di_tempat",
        tanggalKunjungan: { gte: start, lte: end },
      },
    });

    const bawaKeluar = await prisma.pengunjung.count({
      where: {
        tujuan: "bawa_keluar",
        tanggalKunjungan: { gte: start, lte: end },
      },
    });

    // === POPULAR CATEGORIES ===
    const allPeminjaman = await prisma.peminjaman.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { buku: { select: { kategori: true } } },
    });

    const kategoriCount: Record<string, number> = {};
    for (const p of allPeminjaman) {
      const kategori = p.buku?.kategori;
      if (kategori) {
        kategoriCount[kategori] = (kategoriCount[kategori] || 0) + 1;
      }
    }

    const topCategories = Object.entries(kategoriCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // === AKTIVITAS TERBARU ===
    const activities = await prisma.peminjaman.findMany({
      where: { createdAt: { gte: start, lte: end } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        pengunjung: { select: { nama: true } },
        buku: { select: { judul: true } },
      },
    });

    const formattedActivities = activities.map((item) => {
      let status = "Dipinjam";
      let statusBg = "#dbeafe";
      let statusColor = "#1d4ed8";
      let aktivitas = "Dipinjam";

      if (item.status === "kembali") {
        aktivitas = "Dikembalikan";
        status = "Sukses";
        statusBg = "#dcfce7";
        statusColor = "#15803d";
      } else if (item.status === "terlambat") {
        aktivitas = "Terlambat Kembali";
        status = "Terlambat";
        statusBg = "#fee2e2";
        statusColor = "#b91c1c";
      }

      return {
        tanggal: formatWIB(item.createdAt),
        nama: item.pengunjung?.nama || "Tidak diketahui",
        aktivitas,
        buku: item.buku?.judul || item.judulBuku || "Buku telah dihapus",
        status,
        statusBg,
        statusColor,
      };
    });

    // === DATA PENGUNJUNG UNTUK EXPORT ===
    const visitorData = await prisma.pengunjung.findMany({
      where: { tanggalKunjungan: { gte: start, lte: end } },
      orderBy: { tanggalKunjungan: "desc" },
      select: {
        nama: true,
        nik: true,
        alamat: true,
        noHp: true,
        instansi: true,
        tujuan: true,
        tanggalKunjungan: true,
      },
    });

    const formattedVisitors = visitorData.map((v) => ({
      nama: v.nama,
      nik: v.nik || "-",
      alamat: v.alamat,
      noHp: v.noHp,
      instansi: v.instansi || "-",
      tujuan: v.tujuan === "baca_di_tempat" ? "Baca di Tempat" : "Bawa Keluar",
      tanggalKunjungan: formatWIB(v.tanggalKunjungan),
    }));

    // === PERIODE TAMPILAN ===
    const displayStart =
      startDate && endDate ? start : new Date(nowWIB.getFullYear(), 0, 1);
    const displayEnd =
      startDate && endDate
        ? end
        : new Date(nowWIB.getFullYear(), 11, 31, 23, 59, 59, 999);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalPengunjung,
          totalPeminjaman: await prisma.peminjaman.count({
            where: { status: "dipinjam", createdAt: { gte: start, lte: end } },
          }),
          totalTransaksi,
          rasioPengembalian,
        },
        chart: {
          daily: { labels: dailyLabels, values: dailyValues },
          weekly: { labels: weeklyLabels, values: weeklyValues },
          monthly: { labels: monthlyLabels, values: monthlyValues },
          yearly: { labels: yearlyLabels, values: yearlyValues },
        },
        donut: {
          bacaDiTempat,
          bawaKeluar,
        },
        popularCategories: topCategories,
        activities: formattedActivities,
        visitors: formattedVisitors,
        period: {
          start: displayStart.toISOString(),
          end: displayEnd.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching laporan:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data laporan" },
      { status: 500 },
    );
  }
}
