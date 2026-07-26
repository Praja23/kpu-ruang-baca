"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ========== TYPES ==========
type Kpi = {
  icon: string;
  label: string;
  value: string;
  iconWrap: string;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
};

type Activity = {
  title: string;
  visitor: string;
  action: string;
  status: "Selesai" | "Proses";
  time: string | Date;
};

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// ========== WARNA ==========
const C = {
  primary: "#760009",
  onPrimary: "#ffffff",
  primaryContainer: "#ffdad6",
  onPrimaryContainer: "#410004",
  secondary: "#775652",
  surface: "#f8f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f3fa",
  surfaceContainer: "#e6e7ee",
  surfaceContainerHigh: "#e0e1e8",
  onSurface: "#1c1b1f",
  onSurfaceVariant: "#534341",
  outline: "#85736f",
  outlineVariant: "#e7dedb",
};

// ========== SKELETON ==========
function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: `linear-gradient(90deg, ${C.surfaceContainer} 25%, ${C.surfaceContainerHigh} 50%, ${C.surfaceContainer} 75%)`,
        backgroundSize: "200% 100%",
        animation: "skeletonShimmer 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

// ========== 3D TILT CARD ==========
function TiltCard({
  children,
  className = "",
  style,
  intensity = 10,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(
    "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
  );
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;

    setTransform(
      `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`,
    );
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleLeave = () => {
    setTransform(
      "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
    );
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{ transform, transformStyle: "preserve-3d", ...style }}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 55%)`,
          opacity: glare.opacity > 0 ? 1 : 0,
        }}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const [range, setRange] = useState<"Minggu" | "Bulan">("Minggu");
  const [stats, setStats] = useState({
    totalBuku: 0,
    pengunjungHariIni: 0,
    peminjamanAktif: 0,
    pengunjungBulanan: 0,
  });
  const [chartData, setChartData] = useState<{
    labels: string[];
    values: number[];
  }>({
    labels: DAYS,
    values: [0, 0, 0, 0, 0, 0, 0],
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [activityPage, setActivityPage] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    label: string;
    value: number;
    x: number;
    y: number;
  }>({
    visible: false,
    label: "",
    value: 0,
    x: 0,
    y: 0,
  });

  const fetchAll = async (page: number = 1) => {
    setLoading(true);
    try {
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.data);

      const chartRes = await fetch(`/api/admin/chart?range=${range}`);
      const chartJson = await chartRes.json();
      if (chartJson.success) setChartData(chartJson.data);

      const actRes = await fetch(
        `/api/admin/activities?page=${page}&limit=${itemsPerPage}`,
      );
      const actData = await actRes.json();
      if (actData.success) {
        setActivities(actData.data);
        setActivityTotal(actData.pagination.total);
        setActivityTotalPages(actData.pagination.totalPages);
        setActivityPage(actData.pagination.page);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(1);
  }, [range]);

  const goToActivityPage = (page: number) => {
    if (page >= 1 && page <= activityTotalPages) {
      fetchAll(page);
    }
  };

  const formatNumber = (num: number) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `${diff} detik yang lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
    return `${Math.floor(diff / 86400)} hari yang lalu`;
  };

  const KPIS: Kpi[] = [
    {
      icon: "menu_book",
      label: "Total Buku",
      value: formatNumber(stats.totalBuku),
      iconWrap: "#f5e0dc",
      iconColor: "#7a1f1f",
      trend: "+12%",
      trendUp: true,
    },
    {
      icon: "person_search",
      label: "Pengunjung Hari Ini",
      value: formatNumber(stats.pengunjungHariIni),
      iconWrap: "#fde5cf",
      iconColor: "#7a3f0f",
      trend: "+5%",
      trendUp: true,
    },
    {
      icon: "sync_alt",
      label: "Peminjaman Aktif",
      value: formatNumber(stats.peminjamanAktif),
      iconWrap: "#fbe6c2",
      iconColor: "#7a4f0f",
      trend: "-2%",
      trendUp: false,
    },
    {
      icon: "calendar_month",
      label: "Pengunjung Bulanan",
      value: stats.pengunjungBulanan.toLocaleString(),
      iconWrap: "#eee6dc",
      iconColor: "#6b2a2a",
      trend: "+18%",
      trendUp: true,
    },
  ];

  return (
    <>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .animate-fade-up {
          animation: fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .animate-bar {
          animation: barGrow 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
          transform-origin: bottom;
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          line-height: 1;
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>

      <div className="flex flex-col gap-8">
        {/* ========== Welcome ========== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-up">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{
                color: C.primary,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Ringkasan Perpustakaan
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: C.onSurfaceVariant }}>
              Selamat datang kembali. Berikut ringkasan data terkini Ruang Baca
              JDIH KPU.
            </p>
          </div>

          <Link
            href="/admin/buku/tambah"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${C.primary}, #991b1b)`,
              boxShadow: "0 8px 20px -6px rgba(118,0,9,0.45)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              add
            </span>
            Tambah Buku Baru
          </Link>
        </div>

        {/* ========== KPI Cards ========== */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[140px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {KPIS.map((k, idx) => (
              <TiltCard
                key={k.label}
                intensity={8}
                className="rounded-2xl border overflow-hidden"
                style={{
                  background: C.surfaceContainerLowest,
                  borderColor: C.outlineVariant,
                  boxShadow:
                    "0 1px 3px rgba(20,10,10,0.04), 0 8px 24px rgba(20,10,10,0.04)",
                }}
              >
                <div
                  className="p-5 animate-fade-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: k.iconWrap, color: k.iconColor }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 22 }}
                    >
                      {k.icon}
                    </span>
                  </div>

                  <p
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: C.outline }}
                  >
                    {k.label}
                  </p>
                  <p
                    className="mt-1 text-[28px] font-bold tracking-tight"
                    style={{
                      color: C.onSurface,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {k.value}
                  </p>
                </div>
              </TiltCard>
            ))}
          </div>
        )}

        {/* ========== Analytics + Announce ========== */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
          {/* Chart */}
          <div
            className="rounded-2xl border p-6 animate-fade-up"
            style={{
              background: C.surfaceContainerLowest,
              borderColor: C.outlineVariant,
              boxShadow:
                "0 1px 3px rgba(20,10,10,0.04), 0 8px 24px rgba(20,10,10,0.04)",
              animationDelay: "120ms",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{
                    color: C.onSurface,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Tren Peminjaman
                </h2>
                <p className="text-sm mt-0.5" style={{ color: C.outline }}>
                  Perbandingan sirkulasi buku
                </p>
              </div>

              <div
                className="inline-flex p-1 rounded-xl"
                style={{ background: C.surfaceContainer }}
              >
                {(["Minggu", "Bulan"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={
                      range === r
                        ? {
                            background: C.primaryContainer,
                            color: C.primary,
                          }
                        : { color: C.outline }
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <Skeleton className="h-[240px]" />
            ) : (
              <>
                <div className="h-[220px] flex items-end gap-3 px-1 relative">
                  {chartData.values.length > 0 ? (
                    chartData.values.map((h, i) => {
                      const max = Math.max(...chartData.values, 1);
                      const percent = Math.max((h / max) * 100, 6);
                      const isActive = h === Math.max(...chartData.values);

                      // Warna: jika nilai tertinggi -> solid primary, lainnya -> primary dengan opacity sesuai proporsi
                      const opacity = isActive
                        ? 1
                        : Math.max((h / max) * 0.7 + 0.1, 0.2);
                      const bgColor = isActive
                        ? `linear-gradient(180deg, ${C.primary} 0%, #991b1b 100%)`
                        : `rgba(118, 0, 9, ${opacity})`;

                      return (
                        <div
                          key={i}
                          className="flex-1 relative group cursor-pointer h-full"
                          onMouseEnter={() =>
                            setTooltip({
                              visible: true,
                              label: chartData.labels[i],
                              value: h,
                              x: 0,
                              y: 0,
                            })
                          }
                          onMouseMove={(e) =>
                            setTooltip((prev) => ({
                              ...prev,
                              x: e.clientX,
                              y: e.clientY - 72,
                            }))
                          }
                          onMouseLeave={() =>
                            setTooltip((prev) => ({
                              ...prev,
                              visible: false,
                            }))
                          }
                        >
                          <div
                            className={`absolute bottom-0 left-0 right-0 rounded-t-lg animate-bar`}
                            style={{
                              height: `${percent}%`,
                              background: bgColor,
                              boxShadow: isActive
                                ? "0 4px 12px -2px rgba(118,0,9,0.35)"
                                : "none",
                              animationDelay: `${i * 50}ms`,
                            }}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div
                      className="w-full flex items-center justify-center text-sm"
                      style={{ color: C.outline }}
                    >
                      Tidak ada data
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-3 px-1">
                  {chartData.labels.map((d, i) => (
                    <span
                      key={i}
                      className="flex-1 text-center text-xs font-medium"
                      style={{ color: C.outline }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pengumuman */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden text-white animate-fade-up"
            style={{
              background: `linear-gradient(145deg, ${C.primary} 0%, #5c0007 100%)`,
              animationDelay: "180ms",
            }}
          >
            {/* Decorative blob */}
            <div
              className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: "#fff" }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22 }}
                >
                  campaign
                </span>
                <h2
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Pengumuman Internal
                </h2>
              </div>

              <p className="text-sm leading-relaxed opacity-90 mb-5">
                Audit rutin koleksi fisik akan dilakukan pada hari Jumat sore.
                Mohon pastikan seluruh data peminjaman di sistem telah
                disinkronkan dengan buku di rak.
              </p>

              <div className="space-y-2.5">
                {[
                  { icon: "task_alt", label: "Audit Koleksi Hukum" },
                  { icon: "update", label: "Sinkronisasi Database" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/15 cursor-default"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20 }}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========== Aktivitas Terbaru ========== */}
        <div
          className="rounded-2xl border overflow-hidden animate-fade-up"
          style={{
            background: C.surfaceContainerLowest,
            borderColor: C.outlineVariant,
            boxShadow:
              "0 1px 3px rgba(20,10,10,0.04), 0 8px 24px rgba(20,10,10,0.04)",
            animationDelay: "220ms",
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: C.outlineVariant }}
          >
            <h2
              className="text-lg font-bold"
              style={{
                color: C.onSurface,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Aktivitas Terbaru
            </h2>
            <Link
              href="/admin/peminjaman"
              className="inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
              style={{ color: C.primary }}
            >
              Lihat Semua
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                chevron_right
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="py-16 text-center">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 40, color: C.outline }}
              >
                inbox
              </span>
              <p
                className="mt-3 text-sm font-medium"
                style={{ color: C.outline }}
              >
                Belum ada aktivitas
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: C.surfaceContainerLow }}>
                      {[
                        "Judul Buku",
                        "Pengunjung",
                        "Aksi",
                        "Status",
                        "Waktu",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: C.outline }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((a, i) => (
                      <tr
                        key={i}
                        className="transition-colors duration-150 hover:bg-[rgba(118,0,9,0.03)]"
                        style={{ borderTop: `1px solid ${C.outlineVariant}` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-11 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{
                                background: C.primaryContainer,
                                color: C.primary,
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 18 }}
                              >
                                book
                              </span>
                            </div>
                            <span
                              className="font-semibold text-sm"
                              style={{ color: C.onSurface }}
                            >
                              {a.title}
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: C.onSurfaceVariant }}
                        >
                          {a.visitor}
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: C.onSurfaceVariant }}
                        >
                          {a.action}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={
                              a.status === "Selesai"
                                ? { background: "#d1fae5", color: "#065f46" }
                                : { background: "#dbeafe", color: "#1e40af" }
                            }
                          >
                            {a.status}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: C.outline }}
                        >
                          {formatRelativeTime(a.time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {activityTotalPages > 1 && (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t"
                  style={{
                    background: C.surfaceContainerLow,
                    borderColor: C.outlineVariant,
                  }}
                >
                  <p className="text-xs" style={{ color: C.outline }}>
                    Menampilkan{" "}
                    <b style={{ color: C.onSurface }}>
                      {(activityPage - 1) * itemsPerPage + 1}
                    </b>{" "}
                    –{" "}
                    <b style={{ color: C.onSurface }}>
                      {Math.min(activityPage * itemsPerPage, activityTotal)}
                    </b>{" "}
                    dari <b style={{ color: C.onSurface }}>{activityTotal}</b>{" "}
                    aktivitas
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => goToActivityPage(activityPage - 1)}
                      disabled={activityPage === 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                      style={{
                        border: `1px solid ${C.outlineVariant}`,
                        background: "#fff",
                        color: C.onSurfaceVariant,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 18 }}
                      >
                        chevron_left
                      </span>
                    </button>

                    {Array.from(
                      { length: Math.min(5, activityTotalPages) },
                      (_, i) => i + 1,
                    ).map((p) => (
                      <button
                        key={p}
                        onClick={() => goToActivityPage(p)}
                        className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                        style={
                          p === activityPage
                            ? {
                                background: C.primary,
                                color: "#fff",
                              }
                            : {
                                border: `1px solid ${C.outlineVariant}`,
                                background: "#fff",
                                color: C.onSurfaceVariant,
                              }
                        }
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() => goToActivityPage(activityPage + 1)}
                      disabled={activityPage === activityTotalPages}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                      style={{
                        border: `1px solid ${C.outlineVariant}`,
                        background: "#fff",
                        color: C.onSurfaceVariant,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 18 }}
                      >
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tooltip Chart */}
        {tooltip.visible && (
          <div
            className="fixed pointer-events-none z-[100] px-3.5 py-2 rounded-lg text-sm font-medium text-white shadow-xl"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translateX(-50%)",
              background: C.onSurface,
            }}
          >
            {tooltip.label}: <strong>{tooltip.value}</strong> peminjaman
          </div>
        )}
      </div>
    </>
  );
}
