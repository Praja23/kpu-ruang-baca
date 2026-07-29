// app/(visitor)/keranjang/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";

const PRIMARY = "#760009";
const SURFACE = "#f8f9ff";
const ON_SURFACE = "#0b1c30";
const ON_SURFACE_VARIANT = "#59413e";
const OUTLINE = "#8d706d";
const OUTLINE_VARIANT = "#e1bfbb";
const SURFACE_CONTAINER_LOW = "#fdf7f6";
const SURFACE_CONTAINER = "#f3e5e2";
const SURFACE_CONTAINER_HIGHEST = "#e5d5d2";
const PRIMARY_CONTAINER = "#ffdad6";
const ON_PRIMARY_CONTAINER = "#410002";
const TERTIARY_FIXED = "#ffdad6";
const TERTIARY_CONTAINER_TEXT = "#5b1a17";
const GOLD_ACCENT = "#f2c14e";

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

export default function KeranjangPage() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, totalItems } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [durasiPinjam, setDurasiPinjam] = useState(2);
  const [form, setForm] = useState({
    nama: "",
    noHp: "",
    nik: "",
    alamat: "",
    instansi: "", // ✅ TAMBAHKAN INI
  });

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

 const handleCheckout = async (e: React.FormEvent) => {
   e.preventDefault();
   setLoading(true);

   try {
     const bukuIds = cart.map((item) => item.id);
     const res = await fetch("/api/peminjaman/checkout", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ ...form, bukuIds }),
     });

     const data = await res.json();

     if (!res.ok || !data.success) {
       const errorMsg =
         data.message || data.error || "Gagal memproses peminjaman";
       showToast(errorMsg, "error");
       setLoading(false);
       return;
     }

     clearCart();
     let msg = `Berhasil meminjam ${cart.length} buku!`;
     if (data.batasWaktu) {
       const batas = new Date(data.batasWaktu);
       const jam = batas.getHours().toString().padStart(2, "0");
       const menit = batas.getMinutes().toString().padStart(2, "0");
       msg += ` Harap kembalikan sebelum pukul ${jam}:${menit} WIB.`;
     } else {
       msg += ` Waktu pengembalian mengikuti aturan yang berlaku.`;
     }

     showToast(msg, "success");
     router.push("/beranda");
   } catch (error) {
     showToast("Terjadi kesalahan", "error");
   } finally {
     setLoading(false);
   }
 };

  if (totalItems === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: SURFACE }}
      >
        <Icon name="shopping_cart" className="text-7xl text-gray-300" />
        <h2 className="text-2xl font-bold mt-4">Keranjang Kosong</h2>
        <p className="text-gray-500 mt-2">Belum ada buku yang dipilih</p>
        <Link
          href="/katalog"
          className="mt-6 inline-block text-white px-6 py-3 rounded-xl"
          style={{
            background: "linear-gradient(180deg,#760009 0%,#991b1b 100%)",
          }}
        >
          Lihat Katalog Buku
        </Link>
      </div>
    );
  }

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
              <Link href="/katalog" style={{ color: ON_SURFACE_VARIANT }}>
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

        <main className="flex-grow">
          {/* Breadcrumb nav */}
          <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-6">
            <nav
              className="flex items-center gap-2 text-sm"
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
                Keranjang
              </span>
            </nav>
          </div>

          <section
            className="pt-8 pb-16 border-b"
            style={{ borderColor: OUTLINE_VARIANT }}
          >
            <div className="max-w-[1280px] mx-auto px-4 md:px-10">
              <div className="flex flex-col gap-2">
                <div
                  className="flex items-center gap-2 uppercase tracking-wider text-xs font-semibold"
                  style={{ color: PRIMARY }}
                >
                  <Icon name="shopping_cart" className="text-[18px]" />
                  <span>Konfirmasi Peminjaman</span>
                </div>
                <h2
                  className="text-4xl font-bold"
                  style={{ color: PRIMARY, fontFamily: "Plus Jakarta Sans" }}
                >
                  Keranjang Buku Anda
                </h2>
                <p
                  className="text-lg max-w-2xl"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  Silakan periksa kembali daftar buku yang ingin Anda pinjam
                  sebelum melanjutkan ke pengisian data kunjungan.
                </p>
              </div>
            </div>
          </section>

          <section className="max-w-[1280px] mx-auto px-4 md:px-10 pt-10 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div
                  className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm"
                  style={{ borderColor: OUTLINE_VARIANT }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: "Plus Jakarta Sans", color: PRIMARY }}
                  >
                    {totalItems} Buku Dipilih
                  </span>
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-1 hover:text-red-600 transition-colors"
                    style={{ color: ON_SURFACE_VARIANT }}
                  >
                    <Icon name="delete_sweep" />
                    <span className="text-xs font-medium">Kosongkan</span>
                  </button>
                </div>

                {cart.map((b) => (
                  <div
                    key={b.id}
                    className="group relative flex flex-col md:flex-row gap-6 bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all"
                    style={{ borderColor: OUTLINE_VARIANT }}
                  >
                    <div
                      className="w-full md:w-32 h-44 shrink-0 rounded-lg overflow-hidden shadow-inner"
                      style={{ backgroundColor: SURFACE_CONTAINER }}
                    >
                      <img
                        alt={b.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={
                          b.imageUrl ||
                          "https://lh3.googleusercontent.com/aida-public/AB6AXuBYSAy5sheG_m4xtzqiPC4Uqz_OFUWG1SLgipt2oe7lqOLEb8dEH8heXEke8J4zITgl2hPOstkhKbxue776QYuy6gy0r_JzMP-cQSF3D2QMo2dG7zfkNRBMc1Jb7aKavZdh324sk1Zlgig-f8MuhsLNXqO2Q4rdkPsMlTtJm6FN_t9wPj71GK_nYgKhGVwiazcGrLaxY3bF3Eo2NWEwRUYXbph9EribWbJGZnzcsBy8sPtBdtI3WGAo"
                        }
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow">
                      <div className="flex flex-col gap-1">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                          style={{
                            backgroundColor: TERTIARY_FIXED,
                            color: TERTIARY_CONTAINER_TEXT,
                          }}
                        >
                          {b.kategori || "Umum"}
                        </span>
                        <h3
                          className="text-xl font-bold"
                          style={{ fontFamily: "Plus Jakarta Sans" }}
                        >
                          {b.judul}
                        </h3>
                        <p style={{ color: ON_SURFACE_VARIANT }}>
                          Penulis: {b.penulis}
                        </p>
                        <p className="text-xs text-gray-400">
                          Kode: {b.kodeBuku}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div
                          className="flex items-center"
                          style={{ color: PRIMARY }}
                        >
                          <Icon name="inventory_2" className="mr-1" />
                          {b.stok > 0 ? "Tersedia" : "Habis"}
                        </div>
                        <button
                          onClick={() => removeFromCart(b.id)}
                          className="p-2 hover:text-red-600 transition-colors"
                          style={{ color: OUTLINE }}
                        >
                          <Icon name="delete" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <Link
                  href="/katalog"
                  className="flex items-center justify-center gap-2 py-4 border-2 border-dashed rounded-xl transition-all hover:bg-white"
                  style={{
                    borderColor: OUTLINE_VARIANT,
                    color: ON_SURFACE_VARIANT,
                  }}
                >
                  <Icon name="add_circle" /> Tambah Buku Lainnya
                </Link>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-4">
                <div
                  className="bg-white p-8 rounded-xl border shadow-lg sticky top-28"
                  style={{ borderColor: OUTLINE_VARIANT }}
                >
                  <h2
                    className="text-xl font-bold mb-6"
                    style={{ fontFamily: "Plus Jakarta Sans" }}
                  >
                    Ringkasan Peminjaman
                  </h2>

                  <div
                    className="p-4 rounded-lg border mb-8"
                    style={{
                      backgroundColor: SURFACE_CONTAINER_LOW,
                      borderColor: "rgba(118,0,9,0.1)",
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Icon name="info" filled style={{ color: PRIMARY }} />
                      <p className="font-semibold" style={{ color: PRIMARY }}>
                        Aturan Peminjaman Tempat
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div
                        className="flex justify-between items-center"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        <span>Waktu Peminjaman:</span>
                        <span
                          className="font-bold"
                          style={{ color: ON_SURFACE }}
                        >
                          Maksimal {durasiPinjam} Jam
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        <span>Lokasi Baca:</span>
                        <span
                          className="font-bold"
                          style={{ color: ON_SURFACE }}
                        >
                          Area Perpustakaan
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <label
                        className="block text-xs font-semibold mb-1"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.nama}
                        onChange={(e) =>
                          setForm({ ...form, nama: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#760009] outline-none"
                        style={{ borderColor: OUTLINE_VARIANT }}
                        placeholder="Nama lengkap"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-semibold mb-1"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        Nomor HP / WA <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.noHp}
                        onChange={(e) =>
                          setForm({ ...form, noHp: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#760009] outline-none"
                        style={{ borderColor: OUTLINE_VARIANT }}
                        placeholder="0812-xxxx-xxxx"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-semibold mb-1"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        NIK (Opsional)
                      </label>
                      <input
                        type="text"
                        value={form.nik}
                        onChange={(e) =>
                          setForm({ ...form, nik: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#760009] outline-none"
                        style={{ borderColor: OUTLINE_VARIANT }}
                        placeholder="16 digit NIK"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-semibold mb-1"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        Alamat (Opsional)
                      </label>
                      <textarea
                        rows={2}
                        value={form.alamat}
                        onChange={(e) =>
                          setForm({ ...form, alamat: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#760009] outline-none resize-none"
                        style={{ borderColor: OUTLINE_VARIANT }}
                        placeholder="Alamat lengkap"
                      />
                    </div>

                    {/* ✅ TAMBAHKAN INPUT INSTANSI */}
                    <div>
                      <label
                        className="block text-xs font-semibold mb-1"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        Instansi / Asal (Opsional)
                      </label>
                      <input
                        type="text"
                        value={form.instansi}
                        onChange={(e) =>
                          setForm({ ...form, instansi: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#760009] outline-none"
                        style={{ borderColor: OUTLINE_VARIANT }}
                        placeholder="Contoh: KPU Kalteng, Bawaslu, Mahasiswa"
                      />
                    </div>

                    <div
                      className="space-y-4 border-t pt-6 mb-4"
                      style={{ borderColor: OUTLINE_VARIANT }}
                    >
                      <div
                        className="flex justify-between"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        <span>Total Koleksi</span>
                        <span>{totalItems} Item</span>
                      </div>
                      <div
                        className="flex justify-between items-center"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        <span>Status Validasi</span>
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded"
                          style={{
                            backgroundColor: "#f0fdf4",
                            color: "#15803d",
                          }}
                        >
                          Siap Dipinjam
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 text-white rounded-lg font-bold shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(180deg,#760009 0%,#991b1b 100%)",
                        fontFamily: "Plus Jakarta Sans",
                      }}
                    >
                      {loading
                        ? "Memproses..."
                        : "Konfirmasi & Isi Data Kunjungan"}
                    </button>
                    <p
                      className="text-center text-xs px-4"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Dengan menekan tombol di atas, Anda menyetujui syarat dan
                      ketentuan peminjaman JDIH KPU.
                    </p>
                  </form>
                </div>

                <div
                  className="p-6 rounded-xl flex items-center gap-4"
                  style={{
                    backgroundColor: PRIMARY_CONTAINER,
                    color: ON_PRIMARY_CONTAINER,
                  }}
                >
                  <Icon name="help_center" className="text-[32px]" />
                  <div>
                    <h4 className="font-bold">Butuh Bantuan?</h4>
                    <p className="text-xs opacity-90">
                      Hubungi petugas pustakawan kami di meja informasi atau
                      klik layanan kontak.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
      </div>
    </>
  );
}
