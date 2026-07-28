import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "Minggu";

    let labels: string[] = [];
    let values: number[] = [];
    let tooltips: string[] = []; // ✅ tambahan tooltip detail

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (range === "Minggu") {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
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
        // ✅ tooltip: "Senin, 20 Jul 2026"
        tooltips.push(
          `${dayNames[i]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
        );
      }
    } else {
      // Mode Bulan: 4 minggu terakhir (Senin–Minggu)
      const dayOfWeek = today.getDay();
      const thisMonday = new Date(today);
      thisMonday.setDate(
        today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
      );
      thisMonday.setHours(0, 0, 0, 0);

      const weeks: Date[] = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(thisMonday);
        weekStart.setDate(thisMonday.getDate() - i * 7);
        weeks.push(weekStart);
      }

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];

      for (let i = 0; i < weeks.length; i++) {
        const weekStart = weeks[i];
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // minggu berakhir Sabtu

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
            weekEnd.getDate() + 1,
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
        // ✅ tooltip: "Minggu 1: 6-12 Jul 2026"
        tooltips.push(
          `Minggu ${i + 1}: ${weekStart.getDate()} ${months[weekStart.getMonth()]} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { labels, values, tooltips }, // ✅ kirim tooltips
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data grafik" },
      { status: 500 },
    );
  }
}
