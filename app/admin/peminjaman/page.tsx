"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";

const C = {
  primary: "#760009",
  onPrimary: "#ffffff",
  primaryContainer: "#ffdad6",
  onPrimaryContainer: "#410004",
  secondary: "#775652",
  secondaryContainer: "#ffdad6",
  onSecondaryContainer: "#2c1512",
  tertiary: "#725b2e",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  surface: "#f8f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f3fa",
  surfaceContainer: "#e6e7ee",
  surfaceContainerHigh: "#e0e1e8",
  surfaceContainerHighest: "#dadbe2",
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

interface Peminjaman {
  id: number;
  pengunjung: string;
  noHp: string;
  instansi: string | null; // ✅ TAMBAHKAN
  buku: string;
  kodeBuku: string;
  kategori: string;
  tanggalPinjam: string;
  batasWaktu: string;
  status: "dipinjam" | "kembali" | "terlambat";
  tanggalKembali?: string | null;
}

export default function ManajemenPeminjamanPage() {
  const { showToast } = useToast();

  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const itemsPerPage = 10;

  const [stats, setStats] = useState({
    totalAktif: 0,
    kembaliHariIni: 0,
    terlambat: 0,
    peminjamanBulanIni: 0,
  });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    id: number | null;
    batasWaktu: string;
  }>({ isOpen: false, id: null, batasWaktu: "" });

  const [returnModal, setReturnModal] = useState<{
    isOpen: boolean;
    id: number | null;
    judul: string;
  }>({ isOpen: false, id: null, judul: "" });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    judul: string;
  }>({ isOpen: false, id: null, judul: "" });

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/peminjaman/stats");
      const result = await res.json();
      if (result.success) setStats(result.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sort: "desc",
      });
      if (search) params.append("search", search);
      if (filterStatus !== "Semua") params.append("status", filterStatus);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);

      const res = await fetch(`/api/admin/peminjaman?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalData(result.pagination.total);
        setCurrentPage(result.pagination.page);
      } else {
        showToast(result.message || "Gagal memuat data", "error");
      }
    } catch (error) {
      console.error("Error fetching peminjaman:", error);
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
  }, [search, filterStatus, filterStartDate, filterEndDate]);

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

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      dipinjam: {
        label: "Dipinjam",
        bg: C.secondaryContainer,
        text: C.onSecondaryContainer,
      },
      kembali: { label: "Kembali", bg: "#d1fae5", text: "#065f46" },
      terlambat: { label: "Terlambat", bg: C.error, text: "#ffffff" },
    };
    return map[status] || map.dipinjam;
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ limit: "99999", sort: "desc" });
      if (search) params.append("search", search);
      if (filterStatus !== "Semua") params.append("status", filterStatus);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);

      const res = await fetch(`/api/admin/peminjaman?${params.toString()}`);
      const result = await res.json();
      if (!result.success) {
        showToast("Gagal mengambil data", "error");
        return;
      }
      const allData = result.data;
      if (allData.length === 0) {
        showToast("Tidak ada data untuk diekspor", "error");
        return;
      }

      // ✅ TAMBAHKAN "Instansi" di header
      const headers = [
        "No",
        "Pengunjung",
        "Instansi",
        "No HP",
        "Kode Buku",
        "Judul Buku",
        "Tanggal Pinjam",
        "Batas Waktu",
        "Status",
      ];
      const rows = allData.map((item: any, index: number) => [
        index + 1,
        item.pengunjung || "-",
        item.instansi || "-",
        item.noHp || "-",
        item.kodeBuku || "-",
        item.buku || "-",
        formatDateTime(item.tanggalPinjam),
        formatDateTime(item.batasWaktu),
        item.status === "dipinjam"
          ? "Dipinjam"
          : item.status === "kembali"
            ? "Kembali"
            : "Terlambat",
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
        ...rows.map((r: any[]) => r.map(escapeCSV).join(",")),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-peminjaman-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Laporan berhasil diekspor", "success");
    } catch (error) {
      console.error("Error export:", error);
      showToast("Gagal mengekspor laporan", "error");
    }
  };

  const handleReturn = async () => {
    if (!returnModal.id) return;
    try {
      const res = await fetch(
        `/api/admin/peminjaman/${returnModal.id}/kembali`,
        { method: "PUT" },
      );
      const result = await res.json();
      if (result.success) {
        showToast(
          `Buku "${returnModal.judul}" berhasil dikembalikan`,
          "success",
        );
        setReturnModal({ isOpen: false, id: null, judul: "" });
        fetchStats();
        fetchData(currentPage);
      } else {
        showToast(result.error || "Gagal mengembalikan", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    }
  };

  const handleEdit = async () => {
    if (!editModal.id || !editModal.batasWaktu) {
      showToast("Batas waktu wajib diisi", "error");
      return;
    }
    try {
      const res = await fetch(`/api/admin/peminjaman/${editModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batasWaktu: editModal.batasWaktu }),
      });
      const result = await res.json();

      if (result.success) {
        showToast("Peminjaman berhasil diperbarui", "success");
        setEditModal({ isOpen: false, id: null, batasWaktu: "" });
        await fetchStats();
        await fetchData(currentPage);
      } else {
        showToast(result.error || "Gagal memperbarui", "error");
      }
    } catch (error) {
      console.error("Error edit:", error);
      showToast("Terjadi kesalahan", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`/api/admin/peminjaman/${deleteModal.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        showToast(
          `Peminjaman "${deleteModal.judul}" berhasil dihapus`,
          "success",
        );
        setDeleteModal({ isOpen: false, id: null, judul: "" });
        fetchStats();
        fetchData(currentPage);
      } else {
        showToast(result.error || "Gagal menghapus", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchData(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 10px;
          background: ${C.surfaceContainerLow};
          border: 1px solid ${C.outlineVariant};
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: ${C.onSurface};
          transition: all 0.15s;
        }
        .filter-chip:hover { background: ${C.surfaceContainer}; }
        .filter-chip:focus {
          outline: none;
          border-color: ${C.primary};
          box-shadow: 0 0 0 3px rgba(118,0,9,0.12);
        }
        .badge-status {
          display: inline-flex;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .date-range {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .date-range input[type="date"] {
          padding: 8px 12px;
          border: 1px solid ${C.outlineVariant};
          border-radius: 10px;
          font-size: 13px;
          background: ${C.surfaceContainerLow};
          color: ${C.onSurface};
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .date-range input[type="date"]:focus {
          border-color: ${C.primary};
          box-shadow: 0 0 0 3px rgba(118,0,9,0.12);
          background: #fff;
        }
        .date-range span {
          color: ${C.onSurfaceVariant};
          font-size: 13px;
          font-weight: 500;
        }
        .modal-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-box {
          background: #fff;
          border-radius: 20px;
          max-width: 420px;
          width: 90%;
          padding: 32px 28px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.25);
          animation: scaleIn 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .modal-actions {
          display: flex; gap: 12px; justify-content: flex-end;
          margin-top: 20px;
        }
        .modal-actions button {
          padding: 10px 24px; border-radius: 12px;
          font-weight: 600; font-size: 14px;
          border: none; cursor: pointer;
          transition: all 0.15s;
        }
        .btn-cancel { background: #f2f3fa; color: #1c1b1f; }
        .btn-cancel:hover { background: #e6e7ee; }
        .btn-primary { background: #760009; color: #fff; }
        .btn-primary:hover { background: #5a0007; }
        .btn-danger { background: #ba1a1a; color: #fff; }
        .btn-danger:hover { background: #991b1b; }
        .modal-icon {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: #fee2e2;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .modal-icon .material-symbols-outlined {
          font-size: 40px !important;
          color: #b91c1c;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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
              Manajemen Peminjaman
            </h1>
            <p className="text-sm mt-1.5" style={{ color: C.onSurfaceVariant }}>
              Pantau dan kelola aktivitas peminjaman buku perpustakaan secara
              real-time.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
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
              href="/katalog"
              className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${C.primary}, #a3121b)`,
                boxShadow: "0 8px 20px -6px rgba(118,0,9,0.4)",
              }}
            >
              <Icon name="add" style={{ fontSize: 18 }} />
              Input Peminjaman Baru
            </Link>
          </div>
        </div>

        {/* STATS */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[120px]" />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "rgba(118,0,9,0.1)", color: C.primary }}
              >
                <Icon name="library_books" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Total Peminjaman Aktif
              </p>
              <h3
                className="text-3xl font-bold mt-0.5"
                style={{
                  color: C.primary,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {stats.totalAktif}
              </h3>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "#d1fae5", color: "#065f46" }}
              >
                <Icon name="check_circle" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Buku Kembali (Hari Ini)
              </p>
              <h3
                className="text-3xl font-bold mt-0.5"
                style={{
                  color: C.onSurface,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {stats.kembaliHariIni}
              </h3>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "#fee2e2", color: C.error }}
              >
                <Icon name="warning" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Terlambat
              </p>
              <h3
                className="text-3xl font-bold mt-0.5"
                style={{
                  color: C.error,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {stats.terlambat}
              </h3>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "#e0e2e8", color: C.onSurfaceVariant }}
              >
                <Icon name="group" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Total Peminjaman Bulan Ini
              </p>
              <h3
                className="text-3xl font-bold mt-0.5"
                style={{
                  color: C.onSurface,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {stats.peminjamanBulanIni}
              </h3>
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div
          className="p-4 flex flex-wrap items-center gap-3 rounded-2xl border animate-fade-up"
          style={{
            background: C.surfaceContainerLowest,
            borderColor: C.outlineVariant,
            animationDelay: "100ms",
          }}
        >
          <select
            className="filter-chip"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Semua">Semua Status</option>
            <option value="dipinjam">Dipinjam</option>
            <option value="kembali">Kembali</option>
            <option value="terlambat">Terlambat</option>
          </select>

          <div className="date-range">
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
            <span>–</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: C.outline, fontSize: 18 }}
              />
              <input
                type="text"
                placeholder="Cari pengunjung atau buku..."
                className="pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-all w-52 sm:w-64"
                style={{
                  borderColor: C.outlineVariant,
                  background: C.surfaceContainerLow,
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setSearch("");
                setFilterStatus("Semua");
                setFilterStartDate("");
                setFilterEndDate("");
              }}
              className="px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all hover:bg-gray-50"
              style={{ borderColor: C.outlineVariant, color: C.primary }}
            >
              Reset
            </button>
          </div>
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
              className="px-6 py-4 flex gap-6 overflow-x-auto"
              style={{ background: C.surfaceContainerLow }}
            >
              {[40, 100, 80, 70, 140, 110, 110, 80, 70].map((w, i) => (
                <Skeleton
                  key={i}
                  className="h-3 flex-shrink-0"
                  style={{ width: w }}
                />
              ))}
            </div>
            <div className="p-4 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div className="flex gap-2 ml-auto">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
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
                      "No",
                      "Pengunjung",
                      "Instansi", // ✅ TAMBAHKAN
                      "No HP",
                      "Kode Buku",
                      "Judul Buku",
                      "Tanggal Pinjam",
                      "Batas Waktu",
                      "Status",
                      "Aksi",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-[11px] uppercase tracking-wider font-semibold ${
                          h === "Aksi" ? "text-right" : ""
                        }`}
                        style={{ color: C.outline }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <Icon
                            name="sync_alt"
                            style={{ fontSize: 40, color: C.outline }}
                          />
                          <p
                            className="text-sm font-medium"
                            style={{ color: C.outline }}
                          >
                            Tidak ada data peminjaman
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((item, idx) => {
                      const statusBadge = getStatusBadge(item.status);
                      return (
                        <tr
                          key={item.id}
                          className="transition-colors duration-150 hover:bg-[rgba(118,0,9,0.03)]"
                          style={{
                            borderTop: `1px solid ${C.outlineVariant}`,
                          }}
                        >
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: C.onSurfaceVariant }}
                          >
                            {idx + 1 + (currentPage - 1) * itemsPerPage}
                          </td>
                          <td className="px-6 py-4">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: C.onSurface }}
                            >
                              {item.pengunjung}
                            </p>
                          </td>
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: C.onSurfaceVariant }}
                          >
                            {item.instansi || "-"} {/* ✅ TAMBAHKAN */}
                          </td>
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: C.onSurfaceVariant }}
                          >
                            {item.noHp}
                          </td>
                          <td
                            className="px-6 py-4 text-sm font-mono font-medium"
                            style={{ color: C.primary }}
                          >
                            {item.kodeBuku}
                          </td>
                          <td className="px-6 py-4">
                            <p
                              className="text-sm font-medium"
                              style={{ color: C.onSurface }}
                            >
                              {item.buku || "Buku telah dihapus"}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: C.outline }}
                            >
                              {item.kategori || "Umum"}
                            </p>
                          </td>
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: C.onSurfaceVariant }}
                          >
                            {formatDateTime(item.tanggalPinjam)}
                          </td>
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: C.onSurfaceVariant }}
                          >
                            {formatDateTime(item.batasWaktu)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="badge-status"
                              style={{
                                background: statusBadge.bg,
                                color: statusBadge.text,
                              }}
                            >
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              {item.status !== "kembali" && (
                                <button
                                  onClick={() =>
                                    setReturnModal({
                                      isOpen: true,
                                      id: item.id,
                                      judul: item.buku,
                                    })
                                  }
                                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-green-50"
                                  style={{ color: "#065f46" }}
                                  title="Kembalikan"
                                >
                                  <Icon
                                    name="keyboard_return"
                                    style={{ fontSize: 20 }}
                                  />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  setEditModal({
                                    isOpen: true,
                                    id: item.id,
                                    batasWaktu: item.batasWaktu.slice(0, 16),
                                  })
                                }
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-black/5"
                                style={{ color: C.secondary }}
                                title="Edit"
                              >
                                <Icon
                                  name="edit_square"
                                  style={{ fontSize: 20 }}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    isOpen: true,
                                    id: item.id,
                                    judul: item.buku,
                                  })
                                }
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-50"
                                style={{ color: C.error }}
                                title="Hapus"
                              >
                                <Icon name="delete" style={{ fontSize: 20 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div
                className="px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3"
                style={{
                  background: C.surfaceContainerLow,
                  borderColor: C.outlineVariant,
                }}
              >
                <p className="text-xs" style={{ color: C.outline }}>
                  Menampilkan{" "}
                  <b style={{ color: C.onSurface }}>{data.length}</b> dari{" "}
                  <b style={{ color: C.onSurface }}>{totalData}</b> data
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border disabled:opacity-30 transition-all"
                    style={{
                      borderColor: C.outlineVariant,
                      color: C.outline,
                      background: "#fff",
                    }}
                  >
                    <Icon name="chevron_left" style={{ fontSize: 18 }} />
                  </button>

                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                      style={
                        p === currentPage
                          ? { background: C.primary, color: "#fff" }
                          : {
                              border: `1px solid ${C.outlineVariant}`,
                              color: C.outline,
                              background: "#fff",
                            }
                      }
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
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

      {/* MODAL EDIT */}
      {editModal.isOpen && (
        <div
          className="modal-overlay"
          onClick={() =>
            setEditModal({ isOpen: false, id: null, batasWaktu: "" })
          }
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4" style={{ color: C.primary }}>
              Edit Batas Waktu
            </h3>
            <input
              type="datetime-local"
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-all"
              style={{ borderColor: C.outlineVariant }}
              value={editModal.batasWaktu}
              onChange={(e) =>
                setEditModal({ ...editModal, batasWaktu: e.target.value })
              }
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() =>
                  setEditModal({ isOpen: false, id: null, batasWaktu: "" })
                }
              >
                Batal
              </button>
              <button className="btn-primary" onClick={handleEdit}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KEMBALI */}
      {returnModal.isOpen && (
        <div
          className="modal-overlay"
          onClick={() => setReturnModal({ isOpen: false, id: null, judul: "" })}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: "#d1fae5" }}>
              <Icon
                name="check_circle"
                style={{ color: "#065f46", fontSize: 40 }}
              />
            </div>
            <h3
              className="text-xl font-bold text-center"
              style={{ color: C.onSurface }}
            >
              Kembalikan Buku?
            </h3>
            <p
              className="text-center text-sm mt-2"
              style={{ color: C.onSurfaceVariant }}
            >
              Anda yakin ingin mengembalikan buku
              <br />
              <strong style={{ color: C.primary }}>
                “{returnModal.judul}”
              </strong>
              ?
            </p>
            <div className="modal-actions justify-center">
              <button
                className="btn-cancel"
                onClick={() =>
                  setReturnModal({ isOpen: false, id: null, judul: "" })
                }
              >
                Batal
              </button>
              <button className="btn-primary" onClick={handleReturn}>
                Ya, Kembalikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {deleteModal.isOpen && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteModal({ isOpen: false, id: null, judul: "" })}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <Icon name="delete_forever" />
            </div>
            <h3
              className="text-xl font-bold text-center"
              style={{ color: C.onSurface }}
            >
              Hapus Peminjaman?
            </h3>
            <p
              className="text-center text-sm mt-2"
              style={{ color: C.onSurfaceVariant }}
            >
              Anda yakin ingin menghapus peminjaman buku
              <br />
              <strong style={{ color: C.primary }}>
                “{deleteModal.judul}”
              </strong>
              ?
              <br />
              <span style={{ color: "#ba1a1a", fontSize: 13 }}>
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </p>
            <div className="modal-actions justify-center">
              <button
                className="btn-cancel"
                onClick={() =>
                  setDeleteModal({ isOpen: false, id: null, judul: "" })
                }
              >
                Batal
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
