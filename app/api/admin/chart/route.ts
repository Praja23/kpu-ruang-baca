import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "Minggu";

    let labels: string[] = [];
    let values: number[] = [];

    const now = new Date();
    // Gunakan tanggal lokal (tanpa jam) untuk menentukan hari ini
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (range === "Minggu") {
      // Hari ini adalah hari ke-? (0=Minggu, 1=Senin, ..., 6=Sabtu)
      const dayOfWeek = today.getDay(); // 0 = Minggu
      // Tentukan hari Senin minggu ini
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        // Buat rentang hari dalam UTC
        const start = new Date(
          Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0),
        );
        const end = new Date(
          Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0),
        );

        const count = await prisma.peminjaman.count({
          where: {
            createdAt: {
              gte: start,
              lt: end,
            },
          },
        });
        labels.push(dayNames[i]);
        values.push(count);
      }
    } else {
      // Mode Bulan: 4 minggu terakhir (Senin–Minggu)
      const dayOfWeek = today.getDay();
      const thisMonday = new Date(today);
      thisMonday.setDate(
        today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
      );
      thisMonday.setHours(0, 0, 0, 0);

      // Buat 4 minggu ke belakang: minggu ke-1 = paling lama, minggu ke-4 = minggu ini
      const weeks: Date[] = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(thisMonday);
        weekStart.setDate(thisMonday.getDate() - i * 7);
        weeks.push(weekStart);
      }

      for (let i = 0; i < weeks.length; i++) {
        const weekStart = weeks[i];
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const startUTC = new Date(
          Date.UTC(
            weekStart.getFullYear(),
            weekStart.getMonth(),
            weekStart.getDate(),
            0,
            0,
            0,
          ),
        );
        const endUTC = new Date(
          Date.UTC(
            weekEnd.getFullYear(),
            weekEnd.getMonth(),
            weekEnd.getDate(),
            0,
            0,
            0,
          ),
        );

        const count = await prisma.peminjaman.count({
          where: {
            createdAt: {
              gte: startUTC,
              lt: endUTC,
            },
          },
        });
        labels.push(`Minggu ${i + 1}`);
        values.push(count);
      }
    }

    return NextResponse.json({
      success: true,
      data: { labels, values },
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data grafik" },
      { status: 500 },
    );
  }
}
