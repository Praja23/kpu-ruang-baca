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

interface Kategori {
  nama: string;
  jumlahBuku: number;
}

export default function KategoriPage() {
  const { showToast } = useToast();
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKategori, setNewKategori] = useState("");
  const [editData, setEditData] = useState<{ old: string; new: string } | null>(
    null,
  );
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    nama: string;
  }>({
    isOpen: false,
    nama: "",
  });

  const fetchKategori = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kategori");
      const data = await res.json();
      if (data.success) {
        setKategori(data.data);
      } else {
        showToast(data.message || "Gagal memuat kategori", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const filtered = kategori.filter((k) =>
    k.nama.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const totalKategori = kategori.length;
  const totalBuku = kategori.reduce((sum, k) => sum + k.jumlahBuku, 0);
  const kategoriTerbanyak =
    kategori.length > 0
      ? [...kategori].sort((a, b) => b.jumlahBuku - a.jumlahBuku)[0]
      : null;
  const totalRak = totalKategori;

  // ======== HANDLE ADD ========
  const handleAdd = async () => {
    if (!newKategori.trim()) {
      showToast("Nama kategori wajib diisi", "error");
      return;
    }
    if (newKategori.trim().length > 50) {
      showToast("Nama kategori maksimal 50 karakter", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: newKategori.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Kategori berhasil ditambahkan", "success");
        setIsAddModalOpen(false);
        setNewKategori("");
        fetchKategori();
      } else {
        showToast(data.message || "Gagal menambah kategori", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan pada server", "error");
    }
  };

  // ======== HANDLE EDIT ========
  const handleEdit = async () => {
    if (!editData || !editData.new.trim()) {
      showToast("Nama kategori wajib diisi", "error");
      return;
    }
    if (editData.new.trim().length > 50) {
      showToast("Nama kategori maksimal 50 karakter", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldNama: editData.old,
          newNama: editData.new.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Kategori berhasil diperbarui", "success");
        setEditData(null);
        fetchKategori();
      } else {
        showToast(data.message || "Gagal mengedit kategori", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan pada server", "error");
    }
  };

  // ======== CONFIRM DELETE ========
  const confirmDelete = async () => {
    const { nama } = deleteModal;
    try {
      const res = await fetch(
        `/api/admin/kategori?nama=${encodeURIComponent(nama)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (data.success) {
        showToast(`Kategori "${nama}" berhasil dihapus`, "success");
        setDeleteModal({ isOpen: false, nama: "" });
        fetchKategori();
      } else {
        showToast(data.message || "Gagal menghapus kategori", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan pada server", "error");
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
        .crumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          color: ${C.outline};
          font-size: 12px;
          letter-spacing: 0.03em;
        }
        .crumbs a {
          transition: color 0.15s;
        }
        .crumbs a:hover { color: ${C.primary}; }
        .crumbs .cur {
          color: ${C.primary};
          font-weight: 600;
        }
        .crumbs .material-symbols-outlined {
          font-size: 16px !important;
        }
      `}</style>

      <div className="flex flex-col gap-6">
        {/* Back button */}
        <div className="animate-fade-up">
          <Link
            href="/admin/buku"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, #a3121b 100%)`,
              boxShadow: "0 6px 16px -4px rgba(118,0,9,0.4)",
            }}
          >
            <Icon name="arrow_back" style={{ fontSize: 18 }} />
            Kembali
          </Link>
        </div>

        {/* Breadcrumb */}
        <nav
          className="crumbs animate-fade-up"
          style={{ animationDelay: "40ms" }}
        >
          <Link href="/admin/dashboard">Dashboard</Link>
          <Icon name="chevron_right" />
          <Link href="/admin/buku">Manajemen Buku</Link>
          <Icon name="chevron_right" />
          <span className="cur">Kategori</span>
        </nav>

        {/* HEADER */}
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                color: C.primary,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Manajemen Kategori
            </h1>
            <p className="text-sm mt-1.5" style={{ color: C.outline }}>
              Kelola kategori buku perpustakaan JDIH KPU secara efisien.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, #a3121b 100%)`,
              boxShadow: "0 8px 20px -6px rgba(118,0,9,0.4)",
            }}
          >
            <Icon name="add" style={{ fontSize: 20 }} />
            Tambah Kategori
          </button>
        </div>

        {/* STATS */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[120px]" />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "#ffdad6", color: "#760009" }}
              >
                <Icon name="category" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Total Kategori
              </p>
              <h3
                className="text-2xl font-bold mt-0.5"
                style={{ color: C.onSurface }}
              >
                {totalKategori}
              </h3>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "#d5e0f8", color: "#545f73" }}
              >
                <Icon name="menu_book" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Total Buku
              </p>
              <h3
                className="text-2xl font-bold mt-0.5"
                style={{ color: C.onSurface }}
              >
                {totalBuku}
              </h3>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "#fbe6c2", color: "#7a4f0f" }}
              >
                <Icon name="trending_up" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Kategori Terbanyak
              </p>
              <h3
                className="text-lg font-bold mt-0.5 truncate"
                style={{ color: C.onSurface }}
              >
                {kategoriTerbanyak
                  ? `${kategoriTerbanyak.nama} (${kategoriTerbanyak.jumlahBuku})`
                  : "—"}
              </h3>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{ background: "#e0e2e8", color: "#1c1b1f" }}
              >
                <Icon name="shelves" />
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mt-3"
                style={{ color: C.outline }}
              >
                Total Rak
              </p>
              <h3
                className="text-2xl font-bold mt-0.5"
                style={{ color: C.onSurface }}
              >
                {totalRak}
              </h3>
            </div>
          </div>
        )}

        {/* SEARCH */}
        <div className="animate-fade-up" style={{ animationDelay: "140ms" }}>
          <div className="relative max-w-md">
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: C.outline, fontSize: 18 }}
            />
            <input
              type="text"
              placeholder="Cari kategori..."
              className="w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-all"
              style={{
                borderColor: C.outlineVariant,
                background: C.surfaceContainerLow,
              }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* TABLE / SKELETON */}
        {loading ? (
          <div
            className="rounded-2xl border overflow-hidden animate-fade-up"
            style={{
              background: C.surfaceContainerLowest,
              borderColor: C.outlineVariant,
              animationDelay: "160ms",
            }}
          >
            <div
              className="px-6 py-4 flex gap-8"
              style={{ background: C.surfaceContainerLow }}
            >
              {[40, 160, 100, 80].map((w, i) => (
                <Skeleton key={i} className="h-3" style={{ width: w }} />
              ))}
            </div>
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-40" />
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
          <div
            className="rounded-2xl border overflow-hidden animate-fade-up"
            style={{
              background: C.surfaceContainerLowest,
              borderColor: C.outlineVariant,
              boxShadow:
                "0 1px 3px rgba(20,10,10,0.04), 0 8px 24px rgba(20,10,10,0.03)",
              animationDelay: "160ms",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead style={{ background: C.surfaceContainerLow }}>
                  <tr>
                    <th
                      className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold"
                      style={{ color: C.outline }}
                    >
                      No
                    </th>
                    <th
                      className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold"
                      style={{ color: C.outline }}
                    >
                      Nama Kategori
                    </th>
                    <th
                      className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-center"
                      style={{ color: C.outline }}
                    >
                      Jumlah Buku
                    </th>
                    <th
                      className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-right"
                      style={{ color: C.outline }}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <Icon
                            name="category"
                            style={{ fontSize: 40, color: C.outline }}
                          />
                          <p
                            className="text-sm font-medium"
                            style={{ color: C.outline }}
                          >
                            Tidak ada kategori
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((k, idx) => (
                      <tr
                        key={k.nama}
                        className="transition-colors duration-150 hover:bg-[rgba(118,0,9,0.03)]"
                        style={{
                          borderTop: `1px solid ${C.outlineVariant}`,
                        }}
                      >
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: C.onSurfaceVariant }}
                        >
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td
                          className="px-6 py-4 font-semibold text-sm"
                          style={{ color: C.onSurface }}
                        >
                          {k.nama}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className="inline-flex items-center gap-1.5 text-sm font-medium"
                            style={{ color: C.onSurfaceVariant }}
                          >
                            <Icon name="menu_book" style={{ fontSize: 16 }} />
                            {k.jumlahBuku}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() =>
                                setEditData({ old: k.nama, new: k.nama })
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
                                setDeleteModal({ isOpen: true, nama: k.nama })
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div
                className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t"
                style={{
                  background: C.surfaceContainerLow,
                  borderColor: C.outlineVariant,
                }}
              >
                <p className="text-xs" style={{ color: C.outline }}>
                  Menampilkan{" "}
                  <b style={{ color: C.onSurface }}>{startIndex + 1}</b> –{" "}
                  <b style={{ color: C.onSurface }}>
                    {Math.min(startIndex + itemsPerPage, filtered.length)}
                  </b>{" "}
                  dari <b style={{ color: C.onSurface }}>{filtered.length}</b>{" "}
                  kategori
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
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
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
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

      {/* MODAL TAMBAH */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4" style={{ color: C.primary }}>
              Tambah Kategori
            </h3>
            <input
              type="text"
              placeholder="Nama kategori baru..."
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-all"
              style={{ borderColor: C.outlineVariant }}
              value={newKategori}
              onChange={(e) => setNewKategori(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setIsAddModalOpen(false)}
              >
                Batal
              </button>
              <button className="btn-primary" onClick={handleAdd}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {editData && (
        <div className="modal-overlay" onClick={() => setEditData(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4" style={{ color: C.primary }}>
              Edit Kategori
            </h3>
            <input
              type="text"
              placeholder="Nama kategori baru..."
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-all"
              style={{ borderColor: C.outlineVariant }}
              value={editData.new}
              onChange={(e) =>
                setEditData({ ...editData, new: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditData(null)}>
                Batal
              </button>
              <button className="btn-primary" onClick={handleEdit}>
                Perbarui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {deleteModal.isOpen && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteModal({ isOpen: false, nama: "" })}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <Icon name="delete_forever" />
            </div>
            <h3
              className="text-xl font-bold text-center"
              style={{ color: C.onSurface }}
            >
              Hapus Kategori?
            </h3>
            <p
              className="text-center text-sm mt-2"
              style={{ color: C.onSurfaceVariant }}
            >
              Anda yakin ingin menghapus kategori
              <br />
              <strong style={{ color: C.primary }}>“{deleteModal.nama}”</strong>
              ?
              <br />
              <span style={{ color: "#ba1a1a", fontSize: 13 }}>
                Semua buku dengan kategori ini akan diubah menjadi
                &quot;Umum&quot;.
              </span>
            </p>
            <div className="modal-actions justify-center">
              <button
                className="btn-cancel"
                onClick={() => setDeleteModal({ isOpen: false, nama: "" })}
              >
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
