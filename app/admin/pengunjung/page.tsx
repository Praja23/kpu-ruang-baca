// app/admin/pengunjung/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";

const C = {
  primary: "#760009",
  onPrimary: "#ffffff",
  primaryContainer: "#ffdad6",
  secondary: "#775652",
  tertiaryFixed: "#ffdcc2",
  onTertiaryFixedVariant: "#5c3a1e",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  background: "#fffbff",
  surface: "#f8f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f3fa",
  surfaceContainer: "#ecedf4",
  surfaceContainerHigh: "#e6e7ee",
  surfaceContainerHighest: "#e0e2e8",
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

interface Pengunjung {
  id: number;
  nama: string;
  nik: string | null;
  alamat: string;
  noHp: string;
  tujuan: "baca_di_tempat" | "bawa_keluar";
  tanggalKunjungan: string;
  createdAt: string;
}

export default function CatatanPengunjungPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    bacaDiTempat: 0,
    bawaKeluar: 0,
  });

  const [pengunjung, setPengunjung] = useState<Pengunjung[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [filterTujuan, setFilterTujuan] = useState("Semua");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/pengunjung/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error("Gagal ambil stats:", error);
    }
  };

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sort: sortOrder,
      });
      if (search) params.append("search", search);
      if (filterTujuan !== "Semua") params.append("tujuan", filterTujuan);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);

      const res = await fetch(`/api/admin/pengunjung?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPengunjung(data.data);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        });
      } else {
        showToast(data.message || "Gagal memuat data", "error");
      }
    } catch (error) {
      console.error("Error fetch pengunjung:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchData(1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filterTujuan, filterStartDate, filterEndDate, sortOrder]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchData(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleExport = () => {
    const headers = ["Nama", "NIK", "No HP", "Alamat", "Tujuan", "Tanggal"];
    const rows = pengunjung.map((p) => [
      p.nama,
      p.nik || "",
      p.noHp,
      p.alamat,
      p.tujuan === "baca_di_tempat" ? "Baca di Tempat" : "Bawa Keluar",
      new Date(p.tanggalKunjungan).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    ]);

    const escapeCSV = (val: unknown) => {
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-pengunjung-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

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
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          line-height: 1;
          display: inline-block;
          vertical-align: middle;
        }
        .stat-card {
          background: ${C.surfaceContainerLowest};
          border: 1px solid ${C.outlineVariant};
          border-radius: 16px;
          padding: 20px;
          transition: all 0.2s;
        }
        .stat-card:hover {
          border-color: ${C.primary};
          box-shadow: 0 4px 16px -4px rgba(118,0,9,0.12);
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .badge-purpose {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-baca {
          background: ${C.primaryContainer};
          color: ${C.primary};
        }
        .badge-bawa {
          background: #d5e0f8;
          color: #545f73;
        }
      `}</style>

      <div className="flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-up">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                color: C.primary,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Manajemen Pengunjung
            </h1>
            <p className="text-sm mt-1.5" style={{ color: C.outline }}>
              Kelola dan pantau data kunjungan harian perpustakaan secara
              real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: C.surfaceContainerLowest,
                color: C.primary,
                borderColor: C.outlineVariant,
              }}
            >
              <Icon name="download" style={{ fontSize: 18 }} />
              Ekspor Laporan
            </button>
            <Link
              href="/beranda"
              className="px-5 py-2.5 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${C.primary}, #a3121b)`,
                boxShadow: "0 8px 20px -6px rgba(118,0,9,0.4)",
              }}
            >
              <Icon name="person_add" style={{ fontSize: 18 }} />
              Input Kunjungan
            </Link>
          </div>
        </div>

        {/* STATS */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[120px]" />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "#ffdad6", color: "#760009" }}
              >
                <Icon name="group" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Total Pengunjung
              </p>
              <h3
                className="text-2xl font-bold mt-0.5"
                style={{ color: C.onSurface }}
              >
                {stats.total.toLocaleString()}
              </h3>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "#ffdcc2", color: "#5c3a1e" }}
              >
                <Icon name="menu_book" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Baca di Tempat
              </p>
              <h3
                className="text-2xl font-bold mt-0.5"
                style={{ color: C.onSurface }}
              >
                {stats.bacaDiTempat}
              </h3>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "#d5e0f8", color: "#545f73" }}
              >
                <Icon name="handshake" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Bawa Keluar
              </p>
              <h3
                className="text-2xl font-bold mt-0.5"
                style={{ color: C.onSurface }}
              >
                {stats.bawaKeluar}
              </h3>
            </div>

            <div
              className="stat-card"
              style={{
                background: `linear-gradient(145deg, ${C.primary}, #5c0007)`,
                borderColor: C.primary,
                color: "#fff",
              }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="stat-icon"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                  }}
                >
                  <Icon name="calendar_month" />
                </div>
                <span className="text-[11px] font-semibold text-white/70">
                  Terakhir 7 hari
                </span>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider mt-3 text-white/80">
                Jam Sibuk
              </p>
              <h3 className="text-2xl font-bold mt-0.5 text-white">
                14:00 – 16:00
              </h3>
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div
          className="p-5 rounded-2xl border flex flex-wrap items-end gap-4 animate-fade-up"
          style={{
            background: C.surfaceContainerLowest,
            borderColor: C.outlineVariant,
            animationDelay: "100ms",
          }}
        >
          <div className="flex items-end gap-2 flex-1 min-w-[280px]">
            <div className="flex-1">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
                style={{ color: C.outline }}
              >
                Tanggal Awal
              </label>
              <input
                type="date"
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  borderColor: C.outlineVariant,
                  background: C.surfaceContainerLow,
                }}
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <span
              className="pb-2.5 font-medium"
              style={{ color: C.onSurfaceVariant }}
            >
              –
            </span>
            <div className="flex-1">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
                style={{ color: C.outline }}
              >
                Tanggal Akhir
              </label>
              <input
                type="date"
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  borderColor: C.outlineVariant,
                  background: C.surfaceContainerLow,
                }}
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label
              className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
              style={{ color: C.outline }}
            >
              Tujuan
            </label>
            <select
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-all"
              style={{
                borderColor: C.outlineVariant,
                background: C.surfaceContainerLow,
              }}
              value={filterTujuan}
              onChange={(e) => setFilterTujuan(e.target.value)}
            >
              <option value="Semua">Semua Tujuan</option>
              <option value="baca_di_tempat">Baca di Tempat</option>
              <option value="bawa_keluar">Bawa Keluar</option>
            </select>
          </div>

          <div className="min-w-[130px]">
            <label
              className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
              style={{ color: C.outline }}
            >
              Urutkan
            </label>
            <select
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none transition-all"
              style={{
                borderColor: C.outlineVariant,
                background: C.surfaceContainerLow,
              }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
          </div>

          <div className="relative min-w-[200px] flex-1">
            <label
              className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
              style={{ color: C.outline }}
            >
              Cari
            </label>
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: C.outline, fontSize: 18 }}
              />
              <input
                type="text"
                placeholder="Nama, NIK, atau No HP..."
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  borderColor: C.outlineVariant,
                  background: C.surfaceContainerLow,
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setFilterTujuan("Semua");
              setFilterStartDate("");
              setFilterEndDate("");
              setSortOrder("desc");
            }}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: C.onSurface,
            }}
          >
            Reset
          </button>
        </div>

        {/* TABLE / SKELETON */}
        {loading ? (
          <div
            className="rounded-2xl border overflow-hidden animate-fade-up"
            style={{
              background: C.surfaceContainerLowest,
              borderColor: C.outlineVariant,
              animationDelay: "140ms",
            }}
          >
            <div
              className="px-6 py-4 flex gap-8"
              style={{ background: C.surfaceContainerLow }}
            >
              {[140, 120, 100, 110, 130].map((w, i) => (
                <Skeleton key={i} className="h-3" style={{ width: w }} />
              ))}
            </div>
            <div className="p-4 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-2">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl border overflow-hidden animate-fade-up"
            style={{
              background: C.surfaceContainerLowest,
              borderColor: C.outlineVariant,
              boxShadow:
                "0 1px 3px rgba(20,10,10,0.04), 0 8px 24px rgba(20,10,10,0.03)",
              animationDelay: "140ms",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead style={{ background: C.surfaceContainerLow }}>
                  <tr>
                    {[
                      "Nama Pengunjung",
                      "NIK / Identitas",
                      "Kontak",
                      "Tujuan",
                      "Waktu Kunjungan",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold"
                        style={{ color: C.outline }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pengunjung.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <Icon
                            name="person_search"
                            style={{ fontSize: 40, color: C.outline }}
                          />
                          <p
                            className="text-sm font-medium"
                            style={{ color: C.outline }}
                          >
                            Tidak ada data pengunjung
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pengunjung.map((p) => {
                      const isBaca = p.tujuan === "baca_di_tempat";
                      return (
                        <tr
                          key={p.id}
                          className="transition-colors duration-150 hover:bg-[rgba(118,0,9,0.03)]"
                          style={{
                            borderTop: `1px solid ${C.outlineVariant}`,
                          }}
                        >
                          <td className="px-6 py-4">
                            <p
                              className="font-semibold text-sm"
                              style={{ color: C.onSurface }}
                            >
                              {p.nama}
                            </p>
                            <p
                              className="text-xs mt-0.5 truncate max-w-[220px]"
                              style={{ color: C.outline }}
                            >
                              {p.alamat}
                            </p>
                          </td>
                          <td
                            className="px-6 py-4 text-sm font-medium"
                            style={{ color: C.onSurface }}
                          >
                            {p.nik || "—"}
                          </td>
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: C.onSurfaceVariant }}
                          >
                            {p.noHp}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`badge-purpose ${
                                isBaca ? "badge-baca" : "badge-bawa"
                              }`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background: isBaca ? C.primary : C.secondary,
                                }}
                              />
                              {isBaca ? "Baca di Tempat" : "Bawa Keluar"}
                            </span>
                          </td>
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: C.onSurfaceVariant }}
                          >
                            {formatDateTime(p.tanggalKunjungan)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div
                className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t"
                style={{
                  background: C.surfaceContainerLow,
                  borderColor: C.outlineVariant,
                }}
              >
                <p className="text-xs" style={{ color: C.outline }}>
                  Menampilkan{" "}
                  <b style={{ color: C.onSurface }}>
                    {(pagination.page - 1) * pagination.limit + 1}
                  </b>{" "}
                  –{" "}
                  <b style={{ color: C.onSurface }}>
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}
                  </b>{" "}
                  dari <b style={{ color: C.onSurface }}>{pagination.total}</b>{" "}
                  pengunjung
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => goToPage(pagination.page - 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border disabled:opacity-30 transition-all"
                    style={{
                      borderColor: C.outlineVariant,
                      color: C.outline,
                      background: "#fff",
                    }}
                  >
                    <Icon name="chevron_left" style={{ fontSize: 18 }} />
                  </button>

                  {getPageNumbers().map((page, idx) =>
                    typeof page === "number" ? (
                      <button
                        key={idx}
                        onClick={() => goToPage(page)}
                        className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                        style={
                          pagination.page === page
                            ? { background: C.primary, color: "#fff" }
                            : {
                                border: `1px solid ${C.outlineVariant}`,
                                color: C.outline,
                                background: "#fff",
                              }
                        }
                      >
                        {page}
                      </button>
                    ) : (
                      <span
                        key={idx}
                        className="px-1 text-sm"
                        style={{ color: C.outline }}
                      >
                        {page}
                      </span>
                    ),
                  )}

                  <button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => goToPage(pagination.page + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border disabled:opacity-30 transition-all"
                    style={{
                      borderColor: C.outlineVariant,
                      color: C.outline,
                      background: "#fff",
                    }}
                  >
                    <Icon name="chevron_right" style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
