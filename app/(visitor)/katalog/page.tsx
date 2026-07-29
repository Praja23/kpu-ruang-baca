// app/(visitor)/katalog/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// ========== CONSTANTS ==========
const PRIMARY = "#760009";
const SURFACE = "#f8f9ff";
const ON_SURFACE = "#0b1c30";
const ON_SURFACE_VARIANT = "#59413e";
const OUTLINE = "#8d706d";
const OUTLINE_VARIANT = "#e1bfbb";
const SURFACE_VARIANT = "#f3e5e2";
const SURFACE_CONTAINER_HIGH = "#ece0dd";
const SECONDARY = "#545f73";

// ========== ICON ==========
function Icon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className ?? ""}`}
      style={style}
    >
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
        background: `linear-gradient(90deg, #e8e8ee 25%, #f2f2f6 50%, #e8e8ee 75%)`,
        backgroundSize: "200% 100%",
        animation: "skeletonShimmer 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

// ========== TYPE ==========
interface Buku {
  id: number;
  kodeBuku: string;
  judul: string;
  penulis: string;
  kategori: string | null;
  deskripsi: string | null;
  stok: number;
  lokasiRak: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== BOOK CARD ==========
function BookCard({ book, index }: { book: Buku; index: number }) {
  const available = book.stok > 0;
  const coverImage =
    book.imageUrl ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCoPJsTUiNq3pCb7LBtOpRfbB4o7tXJwJ4zdd8YxQ61urktY0pQCh5HwbXLAEWsTVWhdBdkgqa_c2Dyhx8H-iw4GVDLiBzIYHU1Gj_--Or7JvjfdNN5GeNN39sUzCdi2peJWsu4N8YQ7StPTyj1MOO-6rZxo-zwnl7O3cT4VrRjZeU3CrhEj5rKYL3Qs05ZS9-sxLTTAa3TnLiEEJzFVZaBxX0E4GxmVBsq1C_y3ndlH2gp1wLH33Ym";

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group flex flex-col h-full animate-fade-up"
      style={{
        borderColor: OUTLINE_VARIANT,
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div
        className="relative h-72 w-full overflow-hidden"
        style={{ backgroundColor: SURFACE_VARIANT }}
      >
        <img
          src={coverImage}
          alt={book.judul}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm ${
              available
                ? "bg-emerald-100 text-emerald-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                available ? "bg-emerald-600" : "bg-orange-600"
              }`}
            />
            {available ? "Tersedia" : "Habis"}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider mb-2"
          style={{ color: SECONDARY }}
        >
          {book.kategori || "Umum"}
        </span>
        <h3
          className="font-bold text-lg mb-1 line-clamp-2 leading-snug"
          style={{ fontFamily: "Plus Jakarta Sans", color: PRIMARY }}
        >
          {book.judul}
        </h3>
        <p className="text-sm mb-1" style={{ color: ON_SURFACE_VARIANT }}>
          Oleh: {book.penulis}
        </p>
        <p className="text-xs text-gray-400 mb-3">Kode: {book.kodeBuku}</p>

        <div
          className="mt-auto pt-4 border-t"
          style={{ borderColor: SURFACE_VARIANT }}
        >
          {available ? (
            <Link
              href={`/buku/${book.id}`}
              className="w-full block text-center text-white py-3 rounded-xl font-semibold shadow-sm hover:opacity-90 transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(180deg,#760009 0%,#991b1b 100%)",
              }}
            >
              Detail & Pinjam
            </Link>
          ) : (
            <button
              className="w-full py-3 rounded-xl font-semibold cursor-not-allowed"
              style={{
                backgroundColor: SURFACE_CONTAINER_HIGH,
                color: ON_SURFACE_VARIANT,
              }}
            >
              Stok Habis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== BOOK CARD SKELETON ==========
function BookCardSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border flex flex-col h-full"
      style={{ borderColor: OUTLINE_VARIANT }}
    >
      <Skeleton className="h-72 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-11 w-full mt-4 rounded-xl" />
      </div>
    </div>
  );
}

// ========== PAGINATION BUTTON ==========
function PageBtn({
  children,
  active,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  if (active) {
    return (
      <button
        onClick={onClick}
        className="w-10 h-10 rounded-xl text-white font-semibold cursor-default"
        style={{
          background: "linear-gradient(180deg,#760009 0%,#991b1b 100%)",
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 rounded-xl border flex items-center justify-center font-semibold hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ borderColor: OUTLINE_VARIANT, color: PRIMARY }}
    >
      {children}
    </button>
  );
}

// ========== MAIN PAGE ==========
export default function KatalogPage() {
  const [buku, setBuku] = useState<Buku[]>([]);
  const [filtered, setFiltered] = useState<Buku[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchBuku = async () => {
      try {
        const res = await fetch("/api/buku");
        const data = await res.json();
        if (Array.isArray(data)) {
          setBuku(data);
          setFiltered(data);
        } else if (data.data && Array.isArray(data.data)) {
          setBuku(data.data);
          setFiltered(data.data);
        } else {
          console.error("Unexpected response format:", data);
        }
      } catch (error) {
        console.error("Gagal ambil data buku:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuku();
  }, []);

  useEffect(() => {
    let hasil = buku;

    if (search.trim()) {
      const q = search.toLowerCase();
      hasil = hasil.filter(
        (item) =>
          item.judul.toLowerCase().includes(q) ||
          item.penulis.toLowerCase().includes(q) ||
          item.kodeBuku.toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== "Semua") {
      hasil = hasil.filter((item) => item.kategori === selectedCategory);
    }

    setFiltered(hasil);
    setCurrentPage(1);
  }, [search, selectedCategory, buku]);

  const categories = [
    "Semua",
    ...new Set(buku.map((item) => item.kategori).filter((k) => k !== null)),
  ];

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
      />

      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundColor: SURFACE,
          color: ON_SURFACE,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <header
          className="fixed top-0 w-full z-50 backdrop-blur-md border-b shadow-sm"
          style={{
            backgroundColor: "rgba(248,249,255,0.92)",
            borderColor: OUTLINE_VARIANT,
          }}
        >
          <div className="flex justify-between items-center h-16 px-4 md:px-10 max-w-[1280px] mx-auto">
            <Link href="/beranda" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <img
                  alt="KPU"
                  className="w-8 h-8 object-contain"
                  src="https://kalteng.kpu.go.id/assets/img/logo-kpu.png"
                />
              </div>
              <h1
                className="text-xl md:text-2xl font-bold"
                style={{ fontFamily: "Plus Jakarta Sans", color: PRIMARY }}
              >
                Ruang Baca JDIH
              </h1>
            </Link>
            <nav className="hidden md:flex gap-6 items-center">
              <Link
                href="/beranda"
                style={{ color: ON_SURFACE_VARIANT }}
                className="hover:opacity-80 transition-opacity"
              >
                Beranda
              </Link>
              <Link
                href="/katalog"
                className="font-bold pb-1 border-b-2"
                style={{ color: PRIMARY, borderColor: PRIMARY }}
              >
                Katalog Buku
              </Link>
            </nav>
            <Link
              href="/login"
              className="text-white px-4 py-2 rounded-xl hover:opacity-90 flex items-center gap-2 transition-all active:scale-95"
              style={{ backgroundColor: PRIMARY }}
            >
              <Icon name="login" className="text-sm" />
              Admin Login
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="flex-grow pt-24 pb-12">
          <div className="max-w-[1280px] mx-auto px-4 md:px-10">
            {/* Hero */}
            <section className="relative rounded-2xl overflow-hidden mb-12 animate-fade-up">
              <div className="absolute inset-0 z-0">
                <img
                  alt="Perpustakaan JDIH KPU"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuATRsc4g_yiF_F5nkgCuroq-DFvdO1KgvjuO-7yFfy0vvAHEMfQvJs7bAsqL2dt_NMgFCSdzj-hBBbhcuXdmJHZMgca4Tlb_z9rF9pDMENo1Zi6TLvPFPmFfyfVWu-tB32zdOG22C-GTbuPGF7JtRK5Wumk4GGkt0suu4U7pZT5eNBj5svROJh9vtt_LVu6yalIqsq0jRD3WHp5w5XsKEkHxTn5pMaMaicFnu_knBYEOd-OAvN76_rd"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: PRIMARY,
                    opacity: 0.6,
                    mixBlendMode: "multiply",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
                  }}
                />
              </div>

              <div className="relative z-10 py-16 px-6 md:py-20 md:px-12 text-center flex flex-col items-center justify-center min-h-[260px]">
                <h1
                  className="text-3xl md:text-5xl font-bold text-white mb-3"
                  style={{ fontFamily: "Plus Jakarta Sans" }}
                >
                  Katalog Koleksi JDIH KPU
                </h1>
                <p className="text-white/90 text-base md:text-lg max-w-2xl mb-6">
                  Telusuri regulasi, literatur hukum, dan dokumen kepemiluan
                  resmi.
                </p>

                <div className="w-full max-w-3xl bg-white rounded-full shadow-xl flex items-center p-1.5 md:p-2">
                  <Icon
                    name="search"
                    className="ml-3 md:ml-4"
                    style={{ color: "#9ca3af" }}
                  />
                  <input
                    type="text"
                    aria-label="Cari buku"
                    placeholder="Cari judul, pengarang, atau kode buku..."
                    className="flex-1 border-none outline-none px-3 md:px-4 py-2.5 md:py-3 bg-transparent text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                    className="text-white px-5 md:px-6 py-2.5 md:py-3 rounded-full font-semibold active:scale-95 transition-all text-sm"
                    style={{
                      background:
                        "linear-gradient(180deg,#760009 0%,#991b1b 100%)",
                    }}
                  >
                    Cari
                  </button>
                </div>
              </div>
            </section>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filter */}
              <aside
                className="lg:w-64 shrink-0 animate-fade-up"
                style={{ animationDelay: "60ms" }}
              >
                <div
                  className="bg-white rounded-2xl p-6 border sticky top-24"
                  style={{ borderColor: OUTLINE_VARIANT }}
                >
                  <h3
                    className="font-bold mb-4 text-lg"
                    style={{ fontFamily: "Plus Jakarta Sans", color: PRIMARY }}
                  >
                    Filter
                  </h3>

                  <div className="mb-6">
                    <p
                      className="text-[11px] uppercase tracking-wider font-semibold mb-3"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Kategori
                    </p>
                    <div className="space-y-2.5">
                      {categories.map((cat) => (
                        <label
                          key={cat}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="cat"
                            checked={selectedCategory === cat}
                            onChange={() => setSelectedCategory(cat as string)}
                            className="accent-[#760009] w-4 h-4"
                          />
                          <span
                            className={`text-sm transition-colors ${
                              selectedCategory === cat
                                ? "font-semibold"
                                : "group-hover:text-[#760009]"
                            }`}
                            style={{
                              color:
                                selectedCategory === cat
                                  ? PRIMARY
                                  : ON_SURFACE_VARIANT,
                            }}
                          >
                            {cat}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("Semua");
                    }}
                    className="w-full py-2.5 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition-all active:scale-[0.98]"
                    style={{ borderColor: PRIMARY, color: PRIMARY }}
                  >
                    Reset Filter
                  </button>
                </div>
              </aside>

              {/* Grid */}
              <section className="flex-grow">
                <div
                  className="flex justify-between items-center mb-6 animate-fade-up"
                  style={{ animationDelay: "80ms" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: ON_SURFACE_VARIANT }}
                  >
                    {loading ? (
                      <Skeleton className="h-4 w-40 inline-block" />
                    ) : (
                      <>
                        Menampilkan <strong>{filtered.length}</strong> dari{" "}
                        <strong>{buku.length}</strong> koleksi
                      </>
                    )}
                  </span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <BookCardSkeleton key={i} />
                    ))}
                  </div>
                ) : currentItems.length === 0 ? (
                  <div
                    className="text-center py-16 bg-white rounded-2xl border animate-fade-up"
                    style={{ borderColor: OUTLINE_VARIANT }}
                  >
                    <Icon
                      name="search_off"
                      style={{ fontSize: 56, color: "#d1d5db" }}
                    />
                    <p className="mt-4 text-gray-500 font-medium">
                      Tidak ada buku yang ditemukan
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Coba ubah kata kunci atau filter kategori
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {currentItems.map((book, idx) => (
                      <BookCard key={book.id} book={book} index={idx} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!loading && filtered.length > 0 && totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2 flex-wrap animate-fade-up">
                    <PageBtn
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <Icon name="chevron_left" />
                    </PageBtn>

                    {getPageNumbers().map((page, idx) =>
                      typeof page === "number" ? (
                        <PageBtn
                          key={idx}
                          active={page === currentPage}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </PageBtn>
                      ) : (
                        <span
                          key={idx}
                          className="px-2"
                          style={{ color: OUTLINE }}
                        >
                          {page}
                        </span>
                      ),
                    )}

                    <PageBtn
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <Icon name="chevron_right" />
                    </PageBtn>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="w-full py-6 mt-auto"
          style={{
            background: "linear-gradient(135deg, #760009 0%, #991b1b 100%)",
            color: "#ffffff",
            borderTop: "2px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex flex-col md:flex-row justify-center items-center px-4 md:px-10 max-w-[1280px] mx-auto gap-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left shrink-0">
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: "Plus Jakarta Sans", color: "#ffffff" }}
              >
                Ruang Baca JDIH
              </span>
              <p className="text-xs mt-1 opacity-80">
                © 2026 JDIH KPU Provinsi Kalimantan Tengah. Seluruh Hak Cipta
                Dilindungi.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-6 gap-y-3">
              {[
                {
                  href: "https://kalteng.kpu.go.id",
                  icon: "language",
                  label: "kalteng.kpu.go.id",
                },
                {
                  href: "https://www.instagram.com/kpu_kalteng?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
                  icon: "photo_camera",
                  label: "kpu_kalteng",
                },
                {
                  href: "https://x.com/KPU_KaltengProv?s=20",
                  icon: "alternate_email",
                  label: "KPU KaltengProv",
                },
                {
                  href: "https://jdih.kpu.go.id/kalteng/",
                  icon: "link",
                  label: "jdih.kpu.go.id/kalteng",
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80 transition-all"
                  style={{ color: "#ffffff" }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                  >
                    <Icon name={item.icon} className="text-base" />
                  </span>
                  <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
