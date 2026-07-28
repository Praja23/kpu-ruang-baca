//app/admin/buku/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";

// ========== CONSTANTS ==========
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

interface Buku {
  id: number;
  kodeBuku: string;
  judul: string;
  penulis: string;
  kategori: string | null;
  tahun: string | null;
  deskripsi: string | null;
  stok: number;
  lokasiRak: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ManajemenBukuPage() {
  const { showToast } = useToast();
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterTahun, setFilterTahun] = useState("Semua");
  const [filterStok, setFilterStok] = useState("Semua");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    judul: string;
  }>({ isOpen: false, id: null, judul: "" });

  const fetchBuku = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/buku");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setBukuList(data);
    } catch (error) {
      console.error(error);
      showToast("Gagal memuat data buku", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuku();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterKategori, filterTahun, filterStok]);

  const openDeleteModal = (id: number, judul: string) => {
    setDeleteModal({ isOpen: true, id, judul });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null, judul: "" });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const { id, judul } = deleteModal;
    try {
      const res = await fetch(`/api/buku/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast(`Buku "${judul}" berhasil dihapus`, "success");
        fetchBuku();
      } else {
        showToast(data.error || "Gagal menghapus", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      closeDeleteModal();
    }
  };

  const filtered = bukuList.filter((b) => {
    const matchSearch =
      b.judul.toLowerCase().includes(search.toLowerCase()) ||
      b.kodeBuku.toLowerCase().includes(search.toLowerCase()) ||
      b.penulis.toLowerCase().includes(search.toLowerCase());
    const matchKategori =
      filterKategori === "Semua" || b.kategori === filterKategori;
    const matchTahun =
      filterTahun === "Semua" || (b.tahun !== null && b.tahun === filterTahun);
    const matchStok =
      filterStok === "Semua" ||
      (filterStok === "Tersedia" && b.stok > 0) ||
      (filterStok === "Habis" && b.stok === 0);
    return matchSearch && matchKategori && matchTahun && matchStok;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const kategoriOptions = [
    "Semua",
    ...new Set(
      bukuList
        .map((b) => b.kategori)
        .filter((k): k is string => k !== null && k !== undefined && k !== ""),
    ),
  ];

  const tahunOptions = [
    "Semua",
    ...new Set(
      bukuList
        .map((b) => b.tahun)
        .filter((t): t is string => t !== null && t !== undefined && t !== ""),
    ),
  ].sort((a, b) => {
    if (a === "Semua") return -1;
    if (b === "Semua") return 1;
    return Number(b) - Number(a);
  });

  const handleDownload = () => {
    const headers = [
      "Kode",
      "Judul",
      "Penulis",
      "Kategori",
      "Tahun",
      "Stok",
      "Lokasi",
    ];
    const rows = filtered.map((b) => [
      b.kodeBuku,
      b.judul,
      b.penulis,
      b.kategori || "",
      b.tahun || "",
      b.stok,
      b.lokasiRak || "",
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
    a.download = `laporan-buku-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const now = new Date();
  const printDate = now.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

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
        .filter-chip:hover {
          background: ${C.surfaceContainer};
        }
        .filter-chip:focus {
          outline: none;
          border-color: ${C.primary};
          box-shadow: 0 0 0 3px rgba(118,0,9,0.12);
        }

        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: #fff;
          }
          #print-area h2 {
            font-size: 24px;
            margin-bottom: 4px;
            color: #760009;
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
          #print-area .print-date {
            font-size: 14px;
            color: #555;
            margin-bottom: 16px;
            border-bottom: 2px solid #760009;
            padding-bottom: 8px;
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
            color: #ffffff;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
          }
          #print-area tr:nth-child(even) { background: #f9f9f9; }
          .no-print { display: none !important; }
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
          text-align: center;
          animation: scaleIn 0.25s cubic-bezier(0.22,1,0.36,1);
        }
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
        .modal-title {
          font-size: 20px; font-weight: 700; color: #1c1b1f;
          margin-bottom: 8px;
        }
        .modal-desc {
          font-size: 14px; color: #534341;
          margin-bottom: 24px;
          line-height: 1.55;
        }
        .modal-actions {
          display: flex; gap: 12px; justify-content: center;
        }
        .modal-actions button {
          padding: 10px 24px; border-radius: 12px;
          font-weight: 600; font-size: 14px;
          border: none; cursor: pointer;
          transition: all 0.15s;
        }
        .modal-actions .btn-cancel {
          background: #f2f3fa; color: #1c1b1f;
        }
        .modal-actions .btn-cancel:hover { background: #e6e7ee; }
        .modal-actions .btn-danger {
          background: #760009; color: #fff;
        }
        .modal-actions .btn-danger:hover { background: #5a0007; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print animate-fade-up">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                color: C.primary,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Manajemen Buku
            </h1>
            <p className="text-sm mt-1.5" style={{ color: C.outline }}>
              Kelola katalog buku, inventaris, dan lokasi rak perpustakaan JDIH
              KPU.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/buku/kategori"
              className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${C.primary} 0%, #a3121b 100%)`,
                boxShadow: "0 8px 20px -6px rgba(118,0,9,0.4)",
              }}
            >
              <Icon name="category" style={{ fontSize: 20 }} />
              Kelola Kategori
            </Link>
            <Link
              href="/admin/buku/tambah"
              className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${C.primary} 0%, #a3121b 100%)`,
                boxShadow: "0 8px 20px -6px rgba(118,0,9,0.4)",
              }}
            >
              <Icon name="add" style={{ fontSize: 20 }} />
              Tambah Buku
            </Link>
          </div>
        </div>

        {/* FILTERS */}
        <div
          className="p-4 flex flex-wrap items-center gap-3 rounded-2xl border no-print animate-fade-up"
          style={{
            background: C.surfaceContainerLowest,
            borderColor: C.outlineVariant,
            animationDelay: "60ms",
          }}
        >
          <select
            className="filter-chip"
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            {kategoriOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          <select
            className="filter-chip"
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
          >
            {tahunOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            className="filter-chip"
            value={filterStok}
            onChange={(e) => setFilterStok(e.target.value)}
          >
            <option value="Semua">Semua Stok</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Habis">Habis</option>
          </select>

          <div className="ml-auto flex items-center gap-2.5">
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: C.outline, fontSize: 18 }}
              />
              <input
                type="text"
                placeholder="Cari buku, kode, atau penulis..."
                className="pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-all w-56 sm:w-64"
                style={{
                  borderColor: C.outlineVariant,
                  background: C.surfaceContainerLow,
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={handleDownload}
              className="bg-white border px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 transition-all"
              style={{ borderColor: C.outlineVariant, color: C.onSurface }}
            >
              <Icon
                name="description"
                style={{ color: "#16a34a", fontSize: 18 }}
              />
              Excel
            </button>
            <button
              onClick={handlePrint}
              className="bg-white border px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 transition-all"
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

        {/* TABLE / SKELETON */}
        {loading ? (
          <div
            className="rounded-2xl border overflow-hidden animate-fade-up"
            style={{
              background: C.surfaceContainerLowest,
              borderColor: C.outlineVariant,
              animationDelay: "100ms",
            }}
          >
            {/* Header skeleton */}
            <div
              className="px-6 py-4 flex gap-6"
              style={{ background: C.surfaceContainerLow }}
            >
              {[80, 180, 120, 90, 60, 80, 70].map((w, i) => (
                <Skeleton key={i} className="h-3" style={{ width: w }} />
              ))}
            </div>

            {/* Rows skeleton */}
            <div className="p-4 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-14 w-10 rounded-md" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-2 ml-auto">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* PRINT AREA */}
            <div id="print-area" style={{ display: "none" }}>
              <h2>Laporan Daftar Buku</h2>
              <div className="print-date">Dicetak pada: {printDate} WIB</div>
              <table>
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Judul</th>
                    <th>Penulis</th>
                    <th>Kategori</th>
                    <th>Tahun</th>
                    <th>Stok</th>
                    <th>Lokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                  <tr key={b.id}>
  <td style={{ whiteSpace: "nowrap", minWidth: "70px" }}>
    {b.kodeBuku}
  </td>
  <td>{b.judul}</td>
  <td>{b.penulis}</td>
  <td>{b.kategori || "-"}</td>
  <td>{b.tahun || "-"}</td>
  <td>{b.stok}</td>
  <td>{b.lokasiRak || "-"}</td>
</tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* MAIN TABLE */}
            <div
              className="overflow-hidden rounded-2xl border animate-fade-up"
              style={{
                background: C.surfaceContainerLowest,
                borderColor: C.outlineVariant,
                boxShadow:
                  "0 1px 3px rgba(20,10,10,0.04), 0 8px 24px rgba(20,10,10,0.03)",
                animationDelay: "100ms",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead style={{ background: C.surfaceContainerLow }}>
                    <tr>
                      {[
                        "Kode",
                        "Judul",
                        "Penulis",
                        "Kategori",
                        "Stok",
                        "Lokasi",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold"
                          style={{ color: C.outline }}
                        >
                          {h}
                        </th>
                      ))}
                      <th
                        className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-right no-print"
                        style={{ color: C.outline }}
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <Icon
                              name="menu_book"
                              style={{ fontSize: 40, color: C.outline }}
                            />
                            <p
                              className="text-sm font-medium"
                              style={{ color: C.outline }}
                            >
                              Tidak ada buku ditemukan
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((b, idx) => {
                        const stockPct =
                          b.stok > 0 ? Math.min((b.stok / 10) * 100, 100) : 0;
                        const stockColor = b.stok <= 0 ? C.error : C.primary;

                        return (
                          <tr key={b.id}
                            className="transition-colors duration-150 hover:bg-[rgba(118,0,9,0.03)]"
                            style={{
                              borderTop: `1px solid ${C.outlineVariant}`,
                            }}
                          >
                            <td
                              className="px-6 py-4 font-semibold text-sm whitespace-nowrap"
                              style={{ color: C.primary }}
                            >
                              {b.kodeBuku}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-14 rounded-md overflow-hidden flex-shrink-0"
                                  style={{ background: C.surfaceContainer }}
                                >
                                  {b.imageUrl ? (
                                    <img
                                      src={b.imageUrl}
                                      alt={b.judul}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Icon
                                        name="book"
                                        style={{
                                          color: C.outline,
                                          fontSize: 20,
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <span
                                  className="font-semibold text-sm leading-snug"
                                  style={{ color: C.onSurface }}
                                >
                                  {b.judul}
                                </span>
                              </div>
                            </td>
                            <td
                              className="px-6 py-4 text-sm"
                              style={{ color: C.onSurfaceVariant }}
                            >
                              {b.penulis}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  background:
                                    b.kategori === "Hukum"
                                      ? C.primaryContainer
                                      : C.tertiaryFixed,
                                  color:
                                    b.kategori === "Hukum"
                                      ? C.primary
                                      : C.onTertiaryFixedVariant,
                                }}
                              >
                                {b.kategori || "Umum"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1.5">
                                <span
                                  className="font-semibold text-sm"
                                  style={{ color: C.onSurface }}
                                >
                                  {b.stok}
                                </span>
                                <div
                                  className="w-16 h-1.5 rounded-full overflow-hidden"
                                  style={{ background: C.outlineVariant }}
                                >
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(stockPct, 100)}%`,
                                      background: stockColor,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td
                              className="px-6 py-4 text-sm"
                              style={{ color: C.onSurfaceVariant }}
                            >
                              {b.lokasiRak || "—"}
                            </td>
                            <td className="px-6 py-4 text-right no-print">
                              <div className="flex justify-end gap-1">
                                <Link
                                  href={`/admin/buku/edit/${b.id}`}
                                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-black/5"
                                  style={{ color: C.secondary }}
                                  title="Edit"
                                >
                                  <Icon
                                    name="edit_square"
                                    style={{ fontSize: 20 }}
                                  />
                                </Link>
                                <button
                                  onClick={() => openDeleteModal(b.id, b.judul)}
                                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-50"
                                  style={{ color: C.error }}
                                  title="Hapus"
                                >
                                  <Icon
                                    name="delete"
                                    style={{ fontSize: 20 }}
                                  />
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
              <div
                className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t no-print"
                style={{
                  background: C.surfaceContainerLow,
                  borderColor: C.outlineVariant,
                }}
              >
                <p className="text-sm" style={{ color: C.outline }}>
                  Menampilkan{" "}
                  <b style={{ color: C.onSurface }}>{currentItems.length}</b>{" "}
                  dari <b style={{ color: C.onSurface }}>{totalItems}</b> buku
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      style={{
                        borderColor: C.outlineVariant,
                        color: C.outline,
                        background: "#fff",
                      }}
                    >
                      <Icon name="chevron_left" style={{ fontSize: 18 }} />
                    </button>

                    {getPageNumbers().map((p, idx) =>
                      typeof p === "number" ? (
                        <button
                          key={idx}
                          onClick={() => goToPage(p)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all"
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
                      ) : (
                        <span
                          key={idx}
                          className="px-1 text-sm"
                          style={{ color: C.outline }}
                        >
                          {p}
                        </span>
                      ),
                    )}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      style={{
                        borderColor: C.outlineVariant,
                        color: C.outline,
                        background: "#fff",
                      }}
                    >
                      <Icon name="chevron_right" style={{ fontSize: 18 }} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <Icon name="delete_forever" />
            </div>
            <h3 className="modal-title">Hapus Koleksi Buku?</h3>
            <p className="modal-desc">
              Anda yakin ingin menghapus buku
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
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeDeleteModal}>
                Batal
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
