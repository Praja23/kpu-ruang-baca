import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    let start: Date, end: Date;
    const now = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    }

    // === SUMMARY ===
    const totalPengunjung = await prisma.pengunjung.count({
      where: { tanggalKunjungan: { gte: start, lte: end } },
    });

    const totalPeminjaman = await prisma.peminjaman.count({
      where: {
        status: "dipinjam",
        createdAt: { gte: start, lte: end },
      },
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
    const today = new Date(now);
    today.setHours(23, 59, 59, 999);
    let currentDay = new Date(today);
    while (currentDay.getDay() !== 1) {
      currentDay.setDate(currentDay.getDate() - 1);
    }
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDay);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = await prisma.pengunjung.count({
        where: { tanggalKunjungan: { gte: d, lt: next } },
      });
      dailyLabels.push(d.toLocaleDateString("id-ID", { weekday: "short" }));
      dailyValues.push(count);
    }

    // === CHART: MINGGUAN ===
    const weeklyLabels: string[] = [];
    const weeklyValues: number[] = [];
    const todayWeek = new Date(now);
    todayWeek.setHours(23, 59, 59, 999);
    for (let i = 3; i >= 0; i--) {
      const d = new Date(todayWeek);
      d.setDate(d.getDate() - (i * 7 + 7));
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 7);
      const count = await prisma.pengunjung.count({
        where: { tanggalKunjungan: { gte: d, lt: next } },
      });
      weeklyLabels.push(`Minggu ${4 - i}`);
      weeklyValues.push(count);
    }

    // === CHART: BULANAN (12 bulan) ===
    const monthlyLabels: string[] = [];
    const monthlyValues: number[] = [];
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    for (let i = 0; i < 12; i++) {
      const d = new Date(startOfYear);
      d.setMonth(i);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setMonth(next.getMonth() + 1);
      const count = await prisma.pengunjung.count({
        where: { tanggalKunjungan: { gte: d, lt: next } },
      });
      monthlyLabels.push(d.toLocaleDateString("id-ID", { month: "short" }));
      monthlyValues.push(count);
    }

    // === CHART: TAHUNAN (5 tahun terakhir) ===
    const yearlyLabels: string[] = [];
    const yearlyValues: number[] = [];
    const currentYear = now.getFullYear();
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      const d = new Date(year, 0, 1);
      const next = new Date(year + 1, 0, 1);
      const count = await prisma.pengunjung.count({
        where: { tanggalKunjungan: { gte: d, lt: next } },
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

    // === KATEGORI BUKU POPULER ===
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

    // === AKTIVITAS TERBARU (untuk tampilan halaman) ===
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
        tanggal: item.createdAt.toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        nama: item.pengunjung?.nama || "Tidak diketahui",
        aktivitas,
        buku: item.buku?.judul || item.judulBuku || "Buku telah dihapus", // ✅ PRIORITAS: judulBuku jika buku null
        status,
        statusBg,
        statusColor,
      };
    });

    // ✅ DATA PENGUNJUNG UNTUK EXPORT (sesuai range)
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
      tanggalKunjungan: v.tanggalKunjungan.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    // Periode untuk display
    const displayStart =
      startDate && endDate ? start : new Date(now.getFullYear(), 0, 1);
    const displayEnd =
      startDate && endDate ? end : new Date(now.getFullYear(), 11, 31);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalPengunjung,
          totalPeminjaman,
          totalTransaksi,
          rasioPengembalian,
        },
        chart: {
          daily: { labels: dailyLabels, values: dailyValues },
          weekly: { labels: weeklyLabels, values: weeklyValues },
          monthly: { labels: monthlyLabels, values: monthlyValues },
          yearly: { labels: yearlyLabels, values: yearlyValues }, // ✅ TAMBAHKAN
        },
        donut: {
          bacaDiTempat,
          bawaKeluar,
        },
        popularCategories: topCategories,
        activities: formattedActivities,
        visitors: formattedVisitors, // ✅ DATA PENGUNJUNG UNTUK EXPORT
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
