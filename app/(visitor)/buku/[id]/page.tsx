"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";

const PRIMARY = "#760009";
const SURFACE = "#f8f9ff";
const ON_SURFACE = "#0b1c30";
const ON_SURFACE_VARIANT = "#59413e";
const OUTLINE_VARIANT = "#e1bfbb";
const SURFACE_CONTAINER_LOW = "#fdf7f6";
const SURFACE_CONTAINER_HIGH = "#ece0dd";
const SECONDARY_CONTAINER = "#d5e0f8";
const ON_SECONDARY_CONTAINER = "#586377";
const OUTLINE = "#8d706d";

function Icon({
  name,
  className,
  filled,
  style,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className ?? ""}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}

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
  pdfUrl: string | null; // ✅ tambahan
  createdAt: string;
  updatedAt: string;
}

export default function DetailBukuPage() {
  const params = useParams();
  const id = params.id as string;
  const { addToCart, isInCart, totalItems } = useCart();
  const { showToast } = useToast();

  const [buku, setBuku] = useState<Buku | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [durasiPinjam, setDurasiPinjam] = useState(2);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  useEffect(() => {
    const fetchDurasi = async () => {
      try {
        const res = await fetch("/api/pengaturan/durasi");
        const data = await res.json();
        if (data.value) setDurasiPinjam(parseInt(data.value));
      } catch (e) {
        console.error("Gagal ambil durasi:", e);
      }
    };
    fetchDurasi();
  }, []);

  useEffect(() => {
    const fetchBuku = async () => {
      try {
        const res = await fetch(`/api/buku/${id}`);
        if (!res.ok) throw new Error("Buku tidak ditemukan");
        const data = await res.json();
        setBuku(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBuku();
  }, [id]);

  const handleAddToCart = () => {
    if (buku) {
      addToCart(buku);
      showToast(`"${buku.judul}" ditambahkan ke keranjang!`, "success");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: SURFACE }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#760009] mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat detail buku...</p>
        </div>
      </div>
    );
  }

  if (error || !buku) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: SURFACE }}
      >
        <div className="text-center">
          <Icon name="error" className="text-6xl text-red-500" />
          <p className="mt-4 text-gray-700">
            {error || "Buku tidak ditemukan"}
          </p>
          <Link
            href="/katalog"
            className="mt-4 inline-block text-[#760009] hover:underline"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  const coverImage =
    buku.imageUrl ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA25mo9y-6_Nr6QRWugTMxzYTpIMs14HdyjlCBjT9w-YDS6lemefJrqWaAV0ndCX-iIB38f2vEAraK-XHHzB1PSFM5boH9JSeslMsqiZUzeXbTpShcR4j_Ys77IFrG2uY1pgxK-DVB2v29z2e9OZppFmg5tzqJ9umV8OQfU9psQC4_kkDYaaKOlYbPiNcr-wSL_L-2icWrBNFZsGSoqszot5aEYz5mCDMw1H9jweLFRTA7Bon-qg5e4";

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Work+Sans:wght@400;500;600&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />

      <div
        className="min-h-screen flex flex-col"
        style={{
          fontFamily: "Inter, sans-serif",
          backgroundColor: SURFACE,
          color: ON_SURFACE,
        }}
      >
        <header
          className="sticky top-0 z-50 backdrop-blur-md border-b shadow-sm"
          style={{
            backgroundColor: "rgba(248,249,255,0.9)",
            borderColor: OUTLINE_VARIANT,
          }}
        >
          <div className="flex justify-between items-center h-16 px-4 md:px-10 max-w-[1280px] mx-auto">
            <Link href="/beranda" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  alt="KPU Logo"
                  className="w-8 h-8 object-contain"
                  src="https://kalteng.kpu.go.id/assets/img/logo-kpu.png"
                />
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "Plus Jakarta Sans", color: PRIMARY }}
              >
                Ruang Baca JDIH
              </h1>
            </Link>
            <nav className="hidden md:flex gap-6 items-center">
              <Link href="/beranda" style={{ color: ON_SURFACE_VARIANT }}>
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
              className="text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: PRIMARY }}
            >
              <Icon name="login" className="text-sm" /> Admin Login
            </Link>
          </div>
        </header>

        <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8">
          <nav
            className="flex items-center gap-2 text-sm mb-6"
            style={{ color: ON_SURFACE_VARIANT }}
          >
            <Link href="/beranda" className="hover:underline">
              Beranda
            </Link>
            <Icon name="chevron_right" className="text-base" />
            <Link href="/katalog" className="hover:underline">
              Katalog
            </Link>
            <Icon name="chevron_right" className="text-base" />
            <span className="font-semibold" style={{ color: ON_SURFACE }}>
              {buku.judul}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div
                className="relative group aspect-[3/4] rounded-xl overflow-hidden shadow-xl border"
                style={{
                  backgroundColor: SURFACE_CONTAINER_HIGH,
                  borderColor: OUTLINE_VARIANT,
                }}
              >
                <img
                  alt={buku.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={coverImage}
                />
              </div>
              <div
                className="p-6 rounded-xl border"
                style={{
                  backgroundColor: SURFACE_CONTAINER_LOW,
                  borderColor: OUTLINE_VARIANT,
                }}
              >
                <h3
                  className="text-lg font-bold mb-4 flex items-center gap-2"
                  style={{ fontFamily: "Plus Jakarta Sans" }}
                >
                  <Icon name="info" style={{ color: PRIMARY }} /> Detail Teknis
                </h3>
                <dl className="space-y-3">
                  <div
                    className="flex justify-between border-b pb-2"
                    style={{ borderColor: "rgba(225,191,187,0.3)" }}
                  >
                    <dt
                      className="text-xs"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Kode Buku
                    </dt>
                    <dd className="font-semibold">{buku.kodeBuku}</dd>
                  </div>
                  <div
                    className="flex justify-between border-b pb-2"
                    style={{ borderColor: "rgba(225,191,187,0.3)" }}
                  >
                    <dt
                      className="text-xs"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Lokasi Rak
                    </dt>
                    <dd className="font-semibold">{buku.lokasiRak || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt
                      className="text-xs"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Stok Tersedia
                    </dt>
                    <dd className="font-bold" style={{ color: PRIMARY }}>
                      {buku.stok} Eksemplar
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className="px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider"
                  style={{
                    backgroundColor: "rgba(118,0,9,0.1)",
                    color: PRIMARY,
                  }}
                >
                  {buku.kategori || "Umum"}
                </span>
                <span
                  className="px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider flex items-center gap-1"
                  style={{
                    backgroundColor: SECONDARY_CONTAINER,
                    color: ON_SECONDARY_CONTAINER,
                  }}
                >
                  <Icon name="location_on" className="text-sm" />{" "}
                  {buku.lokasiRak || "-"}
                </span>
                <span
                  className="px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider flex items-center gap-1"
                  style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                >
                  <Icon name="check_circle" filled className="text-sm" />{" "}
                  {buku.stok > 0 ? "Tersedia" : "Habis"}
                </span>
              </div>

              <h1
                className="text-4xl md:text-5xl font-bold mb-2 leading-tight"
                style={{
                  fontFamily: "Plus Jakarta Sans",
                  letterSpacing: "-0.02em",
                }}
              >
                {buku.judul}
              </h1>
              <p
                className="text-lg mb-8 flex items-center gap-2"
                style={{ color: ON_SURFACE_VARIANT }}
              >
                <Icon name="person" /> Oleh{" "}
                <span className="font-bold" style={{ color: PRIMARY }}>
                  {buku.penulis}
                </span>
              </p>

              <div
                className="p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-4"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(10px)",
                  borderColor: "rgba(225,191,187,0.3)",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              >
                <button
                  onClick={handleAddToCart}
                  disabled={buku.stok <= 0}
                  className={`text-white flex-1 w-full px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-all ${buku.stok <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{
                    background:
                      "linear-gradient(180deg,#760009 0%,#991b1b 100%)",
                    fontFamily: "Plus Jakarta Sans",
                  }}
                >
                  <Icon name="book_4" />{" "}
                  {isInCart(buku.id) ? "Sudah di Keranjang" : "Pinjam Sekarang"}
                </button>
              </div>

              {buku.deskripsi && (
                <div>
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ fontFamily: "Plus Jakarta Sans" }}
                  >
                    Ringkasan Buku
                  </h2>
                  <p
                    className="leading-relaxed text-justify"
                    style={{ color: ON_SURFACE_VARIANT }}
                  >
                    {buku.deskripsi}
                  </p>
                </div>
              )}

              {/* ✅ PDF PREVIEW & DOWNLOAD */}
              {buku.pdfUrl && (
                <div
                  className="border rounded-2xl overflow-hidden"
                  style={{
                    borderColor: OUTLINE_VARIANT,
                    backgroundColor: SURFACE_CONTAINER_LOW,
                  }}
                >
                  <div
                    className="p-5 flex flex-wrap items-center justify-between gap-3 border-b"
                    style={{ borderColor: OUTLINE_VARIANT }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="description" style={{ color: PRIMARY }} />
                      <h3
                        className="font-bold text-base"
                        style={{
                          fontFamily: "Plus Jakarta Sans",
                          color: ON_SURFACE,
                        }}
                      >
                        Dokumen Terkait
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {!showPdfPreview && (
                        <button
                          onClick={() => setShowPdfPreview(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: `linear-gradient(135deg, ${PRIMARY}, #a3121b)`,
                            boxShadow: "0 4px 12px -4px rgba(118,0,9,0.3)",
                          }}
                        >
                          <Icon name="visibility" style={{ fontSize: 18 }} />
                          Preview
                        </button>
                      )}
                      <a
                        href={buku.pdfUrl}
                        download
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:bg-white"
                        style={{
                          borderColor: PRIMARY,
                          color: PRIMARY,
                          backgroundColor: "transparent",
                        }}
                      >
                        <Icon name="download" style={{ fontSize: 18 }} />
                        Download
                      </a>
                    </div>
                  </div>
                  {showPdfPreview && (
                    <div className="relative">
                      <button
                        onClick={() => setShowPdfPreview(false)}
                        className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                      >
                        <Icon name="close" style={{ fontSize: 20 }} />
                      </button>
                      <div
                        style={{ height: "500px", backgroundColor: "#f0f0f0" }}
                      >
                        <iframe
                          src={`${buku.pdfUrl}#toolbar=0&navpanes=0`}
                          className="w-full h-full"
                          title="PDF Preview"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div
                className="p-6 rounded-xl border-l-4"
                style={{
                  backgroundColor: "rgba(236,224,221,0.5)",
                  borderColor: PRIMARY,
                }}
              >
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Icon name="assignment_return" /> Alur Peminjaman Buku
                </h4>
                <ul
                  className="space-y-2 text-sm"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: PRIMARY }}>
                      •
                    </span>
                    <span>
                      Peminjaman berlaku maksimal{" "}
                      <strong>{durasiPinjam} jam</strong> untuk dibaca di Ruang
                      Baca JDIH KPU.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: PRIMARY }}>
                      •
                    </span>
                    <span>
                      Pastikan Anda telah melakukan registrasi kunjungan sebelum
                      meminjam.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: PRIMARY }}>
                      •
                    </span>
                    <span>
                      Peminjaman keluar diperbolehkan dengan jaminan identitas
                      resmi.
                    </span>
                  </li>
                </ul>
              </div>
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
                © 2024 JDIH KPU Provinsi Kalimantan Tengah. Seluruh Hak Cipta
                Dilindungi.
              </p>
            </div>
            <div className="flex flex-nowrap items-center justify-center lg:justify-end gap-x-6">
              <a
                href="https://kalteng.kpu.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-all"
                style={{ color: "#ffffff" }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <Icon name="language" className="text-base" />
                </span>
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                  kalteng.kpu.go.id
                </span>
              </a>
              <a
                href="https://www.instagram.com/kpu_kalteng?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-all"
                style={{ color: "#ffffff" }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <Icon name="photo_camera" className="text-base" />
                </span>
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                  kpu_kalteng
                </span>
              </a>
              <a
                href="https://www.facebook.com/share/1BwA5xvDpq/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-all"
                style={{ color: "#ffffff" }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
                  </svg>
                </span>
                <span className="text-xs md:text-sm font-semibold uppercase whitespace-nowrap">
                  KPU Provinsi Kalimantan Tengah
                </span>
              </a>
              <a
                href="https://x.com/KPU_KaltengProv?s=20"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-all"
                style={{ color: "#ffffff" }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <Icon name="alternate_email" className="text-base" />
                </span>
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                  KPU KaltengProv
                </span>
              </a>
              <a
                href="https://jdih.kpu.go.id/kalteng/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-all"
                style={{ color: "#ffffff" }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <Icon name="link" className="text-base" />
                </span>
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                  jdih.kpu.go.id/kalteng
                </span>
              </a>
            </div>
          </div>
        </footer>

        <Link href="/keranjang">
          <div className="fixed bottom-32 right-8 z-50 cursor-pointer">
            <button
              className="text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative"
              style={{
                background: "linear-gradient(180deg,#760009 0%,#991b1b 100%)",
              }}
            >
              <Icon name="shopping_cart" className="text-3xl" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm"
                  style={{ color: PRIMARY, borderColor: PRIMARY }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </Link>
      </div>
    </>
  );
}
