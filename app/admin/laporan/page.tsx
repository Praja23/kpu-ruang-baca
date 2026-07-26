// app/admin/laporan/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useToast } from "@/app/context/ToastContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

const C = {
  primary: "#760009",
  primaryContainer: "#ffdad6",
  onPrimaryContainer: "#410004",
  primaryFixedDim: "#ffb4ac",
  surfaceTint: "#b02d29",
  surface: "#f8f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f3fa",
  surfaceContainer: "#ecedf4",
  surfaceContainerHigh: "#e6e7ee",
  onSurface: "#1c1b1f",
  onSurfaceVariant: "#534341",
  outline: "#85736f",
  outlineVariant: "#e7dedb",
};

function Icon({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  );
}

function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: `linear-gradient(90deg, ${C.surfaceContainer} 25%, ${C.surfaceContainerHigh} 50%, ${C.surfaceContainer} 75%)`,
        backgroundSize: "200% 100%",
        animation: "skeletonShimmer 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

interface LaporanData {
  summary: {
    totalPengunjung: number;
    totalPeminjaman: number;
    totalTransaksi: number;
    rasioPengembalian: number;
  };
  chart: {
    daily: { labels: string[]; values: number[] };
    weekly: { labels: string[]; values: number[] };
    monthly: { labels: string[]; values: number[] };
  };
  donut: {
    bacaDiTempat: number;
    bawaKeluar: number;
  };
  popularCategories: { name: string; count: number }[];
  activities: {
    tanggal: string;
    nama: string;
    aktivitas: string;
    buku: string;
    status: string;
    statusBg: string;
    statusColor: string;
  }[];
  period: {
    start: string;
    end: string;
  };
}

export default function LaporanPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartType, setChartType] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/admin/laporan?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        showToast(result.message || "Gagal memuat data laporan", "error");
      }
    } catch (error) {
      console.error("Error fetching laporan:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const formatNumber = (num: number) => num.toLocaleString("id-ID");

  const barChartData = (labels: string[], values: number[]) => ({
    labels,
    datasets: [
      {
        label: "Pengunjung",
        data: values,
        backgroundColor: values.map((v) => {
          const max = Math.max(...values, 1);
          const opacity = v / max;
          return `rgba(118, 0, 9, ${Math.max(opacity, 0.15)})`;
        }),
        borderColor: C.primary,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  });

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.onSurface,
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  const donutData = (bacaDiTempat: number, bawaKeluar: number) => ({
    labels: ["Baca di Tempat", "Bawa Keluar"],
    datasets: [
      {
        data: [bacaDiTempat, bawaKeluar],
        backgroundColor: [C.primary, C.surfaceTint],
        borderWidth: 0,
      },
    ],
  });

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.onSurface,
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage =
              total > 0 ? Math.round((context.parsed / total) * 100) : 0;
            return `${context.label}: ${percentage}% (${context.parsed} orang)`;
          },
        },
      },
    },
  };

  const handleExportExcel = () => {
    if (!data) return;
    const { summary, activities } = data;

    const summaryRows = [
      ["LAPORAN PERPUSTAKAAN"],
      [
        `Periode: ${new Date(data.period.start).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })} - ${new Date(data.period.end).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
      ],
      [],
      ["RINGKASAN"],
      ["Total Pengunjung", summary.totalPengunjung],
      ["Buku Dipinjam", summary.totalPeminjaman],
      ["Total Transaksi Peminjaman", summary.totalTransaksi],
      ["Rasio Pengembalian", `${summary.rasioPengembalian}%`],
      [],
      [],
      ["RIWAYAT AKTIVITAS"],
      ["Tanggal", "Nama Anggota", "Aktivitas", "Detail Buku", "Status"],
      ...activities.map((a) => [
        a.tanggal,
        a.nama,
        a.aktivitas,
        a.buku,
        a.status,
      ]),
    ];

    const csvContent = summaryRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-perpustakaan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Laporan berhasil diekspor", "success");
  };

  const handleExportPDF = () => {
    window.print();
  };

  const totalDonut = data ? data.donut.bacaDiTempat + data.donut.bawaKeluar : 0;

  // ========== LOADING SKELETON ==========
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes skeletonShimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-up {
            animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
        `}</style>

        <div className="space-y-6 animate-fade-up">
          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[110px]" />
            ))}
          </div>

          {/* Charts skeleton */}
          <div className="grid grid-cols-12 gap-6">
            <Skeleton className="col-span-12 lg:col-span-8 h-[340px]" />
            <Skeleton className="col-span-12 lg:col-span-4 h-[340px]" />
          </div>

          {/* Categories skeleton */}
          <Skeleton className="h-[200px]" />

          {/* Table skeleton */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: C.outlineVariant }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: C.outlineVariant }}
            >
              <Skeleton className="h-6 w-56" />
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Icon name="bar_chart" style={{ fontSize: 48, color: C.outline }} />
        <p className="text-sm font-medium" style={{ color: C.outline }}>
          Tidak ada data laporan
        </p>
      </div>
    );
  }

  const chartLabels =
    chartType === "daily"
      ? data.chart.daily.labels
      : chartType === "weekly"
        ? data.chart.weekly.labels
        : data.chart.monthly.labels;
  const chartValues =
    chartType === "daily"
      ? data.chart.daily.values
      : chartType === "weekly"
        ? data.chart.weekly.values
        : data.chart.monthly.values;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          line-height: 1;
          display: inline-block;
          vertical-align: middle;
        }
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: #fff;
            font-family: 'Inter', sans-serif;
          }
          #print-area h2 {
            font-size: 24px;
            margin-bottom: 8px;
            color: #760009;
          }
          #print-area .print-date {
            font-size: 14px;
            color: #555;
            margin-bottom: 16px;
          }
          #print-area table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          #print-area th, #print-area td {
            border: 1px solid #ccc;
            padding: 8px 12px;
            text-align: left;
          }
          #print-area th {
            background: #760009;
            color: #fff;
            font-weight: 600;
          }
          #print-area tr:nth-child(even) { background: #f9f9f9; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* PRINT AREA */}
      <div id="print-area" style={{ display: "none" }}>
        <h2>Laporan Perpustakaan</h2>
        <p className="print-date">
          Periode:{" "}
          {new Date(data.period.start).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          -{" "}
          {new Date(data.period.end).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <div style={{ marginBottom: 20 }}>
          <p>
            <strong>Total Pengunjung:</strong>{" "}
            {formatNumber(data.summary.totalPengunjung)}
          </p>
          <p>
            <strong>Buku Dipinjam:</strong>{" "}
            {formatNumber(data.summary.totalPeminjaman)}
          </p>
          <p>
            <strong>Total Transaksi Peminjaman:</strong>{" "}
            {formatNumber(data.summary.totalTransaksi)}
          </p>
          <p>
            <strong>Rasio Pengembalian:</strong>{" "}
            {data.summary.rasioPengembalian}%
          </p>
        </div>
        <h3 style={{ marginBottom: 12 }}>Riwayat Aktivitas</h3>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Nama Anggota</th>
              <th>Aktivitas</th>
              <th>Detail Buku</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.activities.map((a, idx) => (
              <tr key={idx}>
                <td>{a.tanggal}</td>
                <td>{a.nama}</td>
                <td>{a.aktivitas}</td>
                <td>{a.buku}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 20, fontSize: 12, color: "#555" }}>
          Dicetak pada:{" "}
          {new Date().toLocaleString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}{" "}
          WIB
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="space-y-6 no-print">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 animate-fade-up">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                color: C.primary,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Laporan & Analitik
            </h1>
            <p className="text-sm mt-1.5" style={{ color: C.onSurfaceVariant }}>
              Data statistik perpustakaan periode{" "}
              <span className="font-semibold" style={{ color: C.onSurface }}>
                {new Date(data.period.start).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                –{" "}
                {new Date(data.period.end).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="px-3.5 py-2.5 border rounded-xl text-sm transition-all focus:outline-none"
                style={{
                  borderColor: C.outlineVariant,
                  background: C.surfaceContainerLow,
                }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span style={{ color: C.onSurfaceVariant }}>–</span>
              <input
                type="date"
                className="px-3.5 py-2.5 border rounded-xl text-sm transition-all focus:outline-none"
                style={{
                  borderColor: C.outlineVariant,
                  background: C.surfaceContainerLow,
                }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button
              onClick={handleExportExcel}
              className="bg-white border px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 transition-all"
              style={{ borderColor: C.outlineVariant, color: C.onSurface }}
            >
              <Icon
                name="description"
                style={{ color: "#16a34a", fontSize: 18 }}
              />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-white border px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 transition-all"
              style={{ borderColor: C.outlineVariant, color: C.onSurface }}
            >
              <Icon
                name="picture_as_pdf"
                style={{ color: C.primary, fontSize: 18 }}
              />
              PDF
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          {[
            {
              label: "Total Pengunjung",
              value: formatNumber(data.summary.totalPengunjung),
              icon: "group",
            },
            {
              label: "Buku Dipinjam",
              value: formatNumber(data.summary.totalPeminjaman),
              icon: "menu_book",
            },
            {
              label: "Total Transaksi Peminjaman",
              value: formatNumber(data.summary.totalTransaksi),
              icon: "swap_horiz",
            },
            {
              label: "Rasio Pengembalian",
              value: `${data.summary.rasioPengembalian}%`,
              icon: "history",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white p-5 rounded-2xl border flex items-center justify-between transition-all hover:border-[#760009] hover:shadow-md"
              style={{
                borderColor: C.outlineVariant,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <p
                  className="text-[11px] uppercase font-bold tracking-wider mb-1"
                  style={{ color: C.onSurfaceVariant }}
                >
                  {s.label}
                </p>
                <h3
                  className="text-2xl font-bold"
                  style={{
                    color: C.onSurface,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {s.value}
                </h3>
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: C.primaryContainer,
                  color: C.primary,
                }}
              >
                <Icon name={s.icon} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div
          className="grid grid-cols-12 gap-6 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          {/* Bar Chart */}
          <div
            className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl border"
            style={{
              borderColor: C.outlineVariant,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{
                    color: C.onSurface,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Tren Pengunjung
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: C.onSurfaceVariant }}
                >
                  Visualisasi jumlah kunjungan harian / mingguan / bulanan
                </p>
              </div>
              <div
                className="inline-flex p-1 rounded-xl"
                style={{ background: C.surfaceContainerLow }}
              >
                {(["daily", "weekly", "monthly"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={
                      chartType === t
                        ? { background: C.primary, color: "#fff" }
                        : { color: C.onSurfaceVariant }
                    }
                  >
                    {t === "daily"
                      ? "Harian"
                      : t === "weekly"
                        ? "Mingguan"
                        : "Bulanan"}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[260px]">
              <Bar
                data={barChartData(chartLabels, chartValues)}
                options={barChartOptions}
                key={chartType}
              />
            </div>
          </div>

          {/* Donut */}
          <div
            className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl border"
            style={{
              borderColor: C.outlineVariant,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              className="text-lg font-bold mb-1"
              style={{
                color: C.onSurface,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Tujuan Kunjungan
            </h3>
            <p className="text-xs mb-6" style={{ color: C.onSurfaceVariant }}>
              Distribusi alasan utama pemustaka berkunjung
            </p>
            <div className="relative w-48 h-48 mx-auto mb-6">
              <Doughnut
                data={donutData(data.donut.bacaDiTempat, data.donut.bawaKeluar)}
                options={donutOptions}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                  className="text-2xl font-bold leading-none"
                  style={{
                    color: C.onSurface,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {formatNumber(totalDonut)}
                </span>
                <span
                  className="text-[10px] uppercase font-bold mt-1"
                  style={{ color: C.onSurfaceVariant }}
                >
                  Total Respon
                </span>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: C.primary }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: C.onSurfaceVariant }}
                  >
                    Baca di Tempat
                  </span>
                </div>
                <span
                  className="font-bold text-sm"
                  style={{ color: C.onSurface }}
                >
                  {totalDonut > 0
                    ? Math.round((data.donut.bacaDiTempat / totalDonut) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: C.surfaceTint }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: C.onSurfaceVariant }}
                  >
                    Bawa Keluar
                  </span>
                </div>
                <span
                  className="font-bold text-sm"
                  style={{ color: C.onSurface }}
                >
                  {totalDonut > 0
                    ? Math.round((data.donut.bawaKeluar / totalDonut) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div
          className="bg-white p-6 rounded-2xl border animate-fade-up"
          style={{
            borderColor: C.outlineVariant,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            animationDelay: "140ms",
          }}
        >
          <div className="mb-6">
            <h3
              className="text-lg font-bold"
              style={{
                color: C.onSurface,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Kategori Buku Populer
            </h3>
            <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>
              Perbandingan minat peminjaman berdasarkan rumpun ilmu
            </p>
          </div>

          {data.popularCategories.length === 0 ? (
            <p className="text-sm" style={{ color: C.outline }}>
              Belum ada data kategori
            </p>
          ) : (
            <div className="space-y-4">
              {data.popularCategories.map((cat, index) => {
                const max = Math.max(
                  ...data.popularCategories.map((c) => c.count),
                  1,
                );
                const width = Math.round((cat.count / max) * 100);
                const opacity = Math.max(1 - index * 0.12, 0.4);
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span
                        className="font-medium"
                        style={{ color: C.onSurface }}
                      >
                        {cat.name}
                      </span>
                      <span style={{ color: C.onSurfaceVariant }}>
                        {cat.count} peminjaman
                      </span>
                    </div>
                    <div
                      className="h-2.5 w-full rounded-full overflow-hidden"
                      style={{ background: C.surfaceContainerLow }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(width, 5)}%`,
                          background: C.primary,
                          opacity,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activities Table */}
        <div
          className="bg-white rounded-2xl border overflow-hidden animate-fade-up"
          style={{
            borderColor: C.outlineVariant,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            animationDelay: "180ms",
          }}
        >
          <div
            className="p-5 border-b"
            style={{ borderColor: C.outlineVariant }}
          >
            <h3
              className="text-lg font-bold"
              style={{
                color: C.onSurface,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Riwayat Aktivitas Terbaru
            </h3>
          </div>

          <div className="overflow-x-auto">
            {data.activities.length === 0 ? (
              <div className="py-16 text-center">
                <Icon
                  name="history"
                  style={{ fontSize: 40, color: C.outline }}
                />
                <p
                  className="mt-3 text-sm font-medium"
                  style={{ color: C.outline }}
                >
                  Belum ada aktivitas
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead style={{ background: C.surfaceContainerLow }}>
                  <tr>
                    {[
                      "Tanggal",
                      "Nama Anggota",
                      "Aktivitas",
                      "Detail Buku",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: C.outline }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.activities.map((r, idx) => (
                    <tr
                      key={idx}
                      className="transition-colors duration-150 hover:bg-[rgba(118,0,9,0.03)]"
                      style={{ borderTop: `1px solid ${C.outlineVariant}` }}
                    >
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: C.onSurface }}
                      >
                        {r.tanggal}
                      </td>
                      <td
                        className="px-6 py-4 text-sm font-semibold"
                        style={{ color: C.onSurface }}
                      >
                        {r.nama}
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: C.onSurfaceVariant }}
                      >
                        {r.aktivitas}
                      </td>
                      <td
                        className="px-6 py-4 text-sm italic"
                        style={{ color: C.onSurfaceVariant }}
                      >
                        &quot;{r.buku}&quot;
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: r.statusBg,
                            color: r.statusColor,
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
