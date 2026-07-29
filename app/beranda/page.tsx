// app/beranda/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";

const PRIMARY = "#760009";
const PRIMARY_DARK = "#4d0006";
const SURFACE = "#f8f9ff";
const ON_SURFACE = "#0b1c30";
const ON_SURFACE_VARIANT = "#59413e";
const OUTLINE = "#8d706d";
const OUTLINE_VARIANT = "#e1bfbb";
const SECONDARY_CONTAINER = "#d5e0f8";
const ON_SECONDARY_CONTAINER = "#586377";
const GOLD = "#f2c14e";

/* ============================================================
   ICON WRAPPER
   ============================================================ */
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

/* ============================================================
   ORNAMEN / DEKORASI
   ============================================================ */

// URL gambar Talawang 3D (letakkan file talawang-3d.jpg di /public/images/)
const TALAWANG_IMG = "/images/talawang-3d.jpg";

// Talawang — perisai khas Dayak Kalimantan Tengah (gambar 3D asli)
function TalawangIcon({
  className,
  style,
  alt = "Talawang — perisai Dayak Kalimantan Tengah",
}: {
  className?: string;
  color?: string; // dipertahankan untuk kompatibilitas API lama (tidak dipakai)
  style?: React.CSSProperties;
  alt?: string;
}) {
  return (
    <img
      src={TALAWANG_IMG}
      alt={alt}
      className={className}
      style={{
        objectFit: "contain",
        filter: "drop-shadow(0 12px 24px rgba(118,0,9,0.25))",
        ...style,
      }}
      loading="lazy"
      draggable={false}
    />
  );
}

// Stub aman untuk komponen ornamen lama yang sudah dihapus.
// Dibiarkan agar semua pemanggilan lama di JSX tidak error — merender null.
function DayakHookMotif(_: {
  className?: string;
  color?: string;
  opacity?: number;
}) {
  return null;
}
function BatangGaringIcon(_: {
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}) {
  return null;
}
function EnggangIcon(_: {
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}) {
  return null;
}
function MandauPattern(_: {
  className?: string;
  color?: string;
  opacity?: number;
}) {
  return null;
}

// Divider profesional — garis halus dengan aksen chip warna primer.
// Tidak lagi memakai ornamen Dayak stilasi.
function DayakDivider({
  color = PRIMARY,
  background = "transparent",
}: {
  color?: string;
  background?: string;
}) {
  return (
    <div
      className="w-full flex items-center justify-center py-10"
      style={{ background }}
    >
      <div className="flex items-center gap-4">
        <span
          className="h-px w-16 md:w-40"
          style={{
            background: `linear-gradient(to right, transparent, ${color}55)`,
          }}
        />
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: color, opacity: 0.35 }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
        />
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: color, opacity: 0.35 }}
        />
        <span
          className="h-px w-16 md:w-40"
          style={{
            background: `linear-gradient(to left, transparent, ${color}55)`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   3D TILT CARD
   ============================================================ */
function TiltCard({
  children,
  className,
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
    "perspective(900px) rotateX(0deg) rotateY(0deg)",
  );

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `perspective(900px) rotateX(${(-y * intensity).toFixed(2)}deg) rotateY(${(x * (intensity + 2)).toFixed(2)}deg) scale3d(1.02,1.02,1.02)`,
    );
  };

  const handleLeave = () => {
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg)");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        transform,
        transition: "transform 0.25s ease-out",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   REVEAL ON SCROLL (IntersectionObserver)
   ============================================================ */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function BerandaPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    nama: "",
    noHp: "",
    nik: "",
    alamat: "",
    instansi: "", // ✅ TAMBAHKAN INI
    tujuan: "baca_di_tempat",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pengunjung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Ambil pesan error dari API
        const errorMsg = data.message || "Gagal mendaftar";
        showToast(errorMsg, "error");
        setLoading(false);
        return;
      }

      // Jika sukses
      setSuccess(true);
      showToast(
        "Pendaftaran berhasil! Silakan masuk ke area perpustakaan.",
        "success",
      );
      setTimeout(() => {
        setSuccess(false);
        setForm({
          nama: "",
          noHp: "",
          nik: "",
          alamat: "",
          instansi: "",
          tujuan: "baca_di_tempat",
        });
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  };

  const scrollToPendaftaran = () => {
    document
      .getElementById("pendaftaran")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTentang = () => {
    document.getElementById("tentang")?.scrollIntoView({ behavior: "smooth" });
  };

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

      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes checkPop {
          0% { transform: scale(0); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes floatBlob {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-24px) scale(1.05); }
        }
        @keyframes floatBlobSlow {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-24px,18px) scale(1.08); }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
        }
        @keyframes drift {
          0% { transform: translateX(-4%); }
          100% { transform: translateX(4%); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fade-up { animation: fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-scale-in { animation: scaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-check { animation: checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .blob-1 { animation: floatBlob 9s ease-in-out infinite; }
        .blob-2 { animation: floatBlobSlow 11s ease-in-out infinite; }
        .bounce-down { animation: bounceDown 1.8s ease-in-out infinite; }
        .float-slow { animation: floatSlow 7s ease-in-out infinite; }
        .drift { animation: drift 14s ease-in-out infinite alternate; }
        .spin-slow { animation: spinSlow 40s linear infinite; }

        .tujuan-card { transition: all 0.2s ease; }
        .tujuan-card:hover { border-color: ${PRIMARY} !important; background: rgba(118,0,9,0.03); }
        input:focus, textarea:focus {
          border-color: ${PRIMARY} !important;
          box-shadow: 0 0 0 3px rgba(118,0,9,0.12);
        }

        .feature-card {
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -12px rgba(118,0,9,0.18);
          border-color: rgba(118,0,9,0.25) !important;
        }
        .cta-shimmer {
          background: linear-gradient(90deg, #760009 0%, #991b1b 45%, #c23a3a 50%, #991b1b 55%, #760009 100%);
          background-size: 200% 100%;
          animation: shimmer 3.5s linear infinite;
        }

        .step-card {
          transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .step-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px -16px rgba(118,0,9,0.28);
        }

        .gallery-item {
          transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease;
        }
        .gallery-item:hover {
          transform: scale(1.03);
          box-shadow: 0 30px 60px -20px rgba(118,0,9,0.35);
          z-index: 2;
        }
        .gallery-item img {
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .gallery-item:hover img { transform: scale(1.08); }

        /* Marquee angka statistik */
        .stat-badge {
          background: linear-gradient(135deg, #ffffff 0%, #fdf7f6 100%);
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col"
        style={{
          fontFamily: "Inter, sans-serif",
          backgroundColor: SURFACE,
          color: ON_SURFACE,
        }}
      >
        {/* ================= HEADER ================= */}
        <header
          className="fixed top-0 w-full z-50 backdrop-blur-md border-b shadow-sm"
          style={{
            backgroundColor: "rgba(248,249,255,0.92)",
            borderColor: OUTLINE_VARIANT,
          }}
        >
          <div className="flex justify-between items-center h-16 px-4 md:px-10 max-w-[1280px] mx-auto">
            <Link href="/beranda" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  alt="Logo JDIH KPU Kalimantan Tengah"
                  className="w-8 h-8 object-contain"
                  src="https://jdih.gunungmaskab.go.id/wp-content/uploads/2021/06/logo-awal-jdihn-small.png"
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
                className="font-bold pb-1 border-b-2 transition-all"
                style={{ color: PRIMARY, borderColor: PRIMARY }}
              >
                Beranda
              </Link>
              <Link
                href="/katalog"
                className="transition-all hover:opacity-80"
                style={{ color: ON_SURFACE_VARIANT }}
              >
                Katalog Buku
              </Link>
            </nav>
            <Link
              href="/login"
              className="text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 active:scale-95"
              style={{ backgroundColor: PRIMARY }}
            >
              <Icon name="login" className="text-sm" />
              Admin Login
            </Link>
          </div>
        </header>

        <main className="flex-grow">
          {/* ======================= HERO ======================= */}
          <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(118,0,9,0.06), transparent 45%), radial-gradient(circle at 80% 70%, rgba(118,0,9,0.05), transparent 45%), #f8f9ff",
            }}
          >
            {/* Blob dekoratif */}
            <div
              className="blob-1 absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none"
              style={{ background: "rgba(118,0,9,0.18)" }}
            />
            <div
              className="blob-2 absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: "rgba(242,193,78,0.25)" }}
            />

            {/* Pattern Mandau di background */}
            <MandauPattern
              className="absolute inset-0 w-full h-full pointer-events-none"
              color={PRIMARY}
              opacity={0.045}
            />

            {/* Ornamen Enggang melayang */}
            <EnggangIcon
              className="absolute top-24 right-8 w-40 hidden lg:block float-slow pointer-events-none"
              color={PRIMARY}
              style={{ opacity: 0.08 }}
            />

            <div className="max-w-6xl w-full mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6 animate-fade-up text-center lg:text-left">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase inline-flex items-center gap-1.5"
                  style={{
                    backgroundColor: SECONDARY_CONTAINER,
                    color: ON_SECONDARY_CONTAINER,
                  }}
                >
                  <Icon name="verified" style={{ fontSize: 14 }} filled />
                  Layanan Resmi KPU Provinsi Kalimantan Tengah
                </span>

                <h1
                  className="text-4xl md:text-5xl xl:text-6xl leading-[1.08] font-bold"
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    color: PRIMARY,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Ruang Baca JDIH,
                  <br />
                  Pusat Literasi Hukum &amp; Kepemiluan
                </h1>

                <p
                  className="text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  Jaringan Dokumentasi dan Informasi Hukum (JDIH) KPU Provinsi
                  Kalimantan Tengah menghadirkan ruang baca fisik dan digital
                  untuk masyarakat mengakses regulasi, produk hukum, dan bahan
                  bacaan kepemiluan secara mudah dan terbuka.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
                  <button
                    onClick={scrollToPendaftaran}
                    className="cta-shimmer w-full sm:w-auto text-white px-7 py-3.5 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 transition-transform"
                    style={{
                      fontFamily: "Plus Jakarta Sans",
                      boxShadow: "0 10px 24px -6px rgba(118,0,9,0.45)",
                    }}
                  >
                    Daftar Kunjungan
                    <Icon name="arrow_downward" style={{ fontSize: 18 }} />
                  </button>
                  <Link
                    href="/katalog"
                    className="w-full sm:w-auto text-center px-7 py-3.5 rounded-xl font-semibold border-2 transition-all hover:bg-white flex items-center justify-center gap-2"
                    style={{
                      borderColor: OUTLINE_VARIANT,
                      color: ON_SURFACE,
                      fontFamily: "Plus Jakarta Sans",
                    }}
                  >
                    <Icon name="menu_book" style={{ fontSize: 18 }} />
                    Lihat Katalog Buku
                  </Link>
                </div>

                <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
                  <div>
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: PRIMARY,
                        fontFamily: "Plus Jakarta Sans",
                      }}
                    >
                      14
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Kabupaten/Kota Terlayani
                    </div>
                  </div>
                  <div
                    className="h-8 w-px"
                    style={{ background: OUTLINE_VARIANT }}
                  />
                  <div>
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: PRIMARY,
                        fontFamily: "Plus Jakarta Sans",
                      }}
                    >
                      100%
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Akses Terbuka &amp; Gratis
                    </div>
                  </div>
                </div>
              </div>

              {/* Kartu 3D tilt di kanan — sudut baca terbuka */}
              <div
                className="lg:col-span-5 animate-fade-up flex justify-center relative"
                style={{ animationDelay: "100ms" }}
              >
                {/* Ornamen kaét di belakang kartu */}
                <DayakHookMotif
                  className="absolute -top-4 -right-6 w-56 h-10 hidden md:block"
                  color={PRIMARY}
                  opacity={0.35}
                />
                <TiltCard
                  className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] w-full max-w-sm"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <img
                    alt="Sudut baca hangat dengan buku dan cahaya alami"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=900&auto=format&fit=crop"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(118,0,9,0.72), transparent 55%)",
                    }}
                  />
                  <div
                    className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      color: PRIMARY,
                      transform: "translateZ(30px)",
                    }}
                  >
                    <Icon
                      name="local_library"
                      style={{ fontSize: 14 }}
                      filled
                    />
                    Ruang Baca JDIH
                  </div>
                  <div
                    className="absolute bottom-6 left-6 right-6 text-white"
                    style={{ transform: "translateZ(40px)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="verified" filled />
                      <span className="font-medium">KPU Kalimantan Tengah</span>
                    </div>
                    <p className="text-sm opacity-95 italic leading-relaxed">
                      &quot;Membangun pemilih cerdas melalui informasi hukum
                      yang akurat dan terjangkau.&quot;
                    </p>
                  </div>
                </TiltCard>
              </div>
            </div>

            <button
              onClick={scrollToTentang}
              className="bounce-down absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10"
              style={{ color: ON_SURFACE_VARIANT }}
              aria-label="Scroll ke bawah"
            >
              <span className="text-[11px] font-medium tracking-wide uppercase">
                Scroll
              </span>
              <Icon name="expand_more" />
            </button>
          </section>

          {/* ======================= SAMBUTAN / TENTANG ======================= */}
          <section
            className="py-20 md:py-28 px-4 md:px-8 relative overflow-hidden"
            id="tentang"
          >
            <BatangGaringIcon
              className="absolute -left-6 top-1/2 -translate-y-1/2 w-16 h-40 hidden xl:block pointer-events-none"
              color={PRIMARY}
              style={{ opacity: 0.06 }}
            />
            <EnggangIcon
              className="absolute right-4 top-8 w-24 hidden lg:block pointer-events-none drift"
              color={PRIMARY}
              style={{ opacity: 0.08 }}
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              <Reveal className="lg:col-span-6 order-2 lg:order-1 space-y-5">
                <span
                  className="text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2"
                  style={{ color: PRIMARY }}
                >
                  <span
                    className="inline-block w-6 h-px"
                    style={{ background: PRIMARY }}
                  />
                  Sambutan &amp; Tentang Kami
                </span>
                <h2
                  className="text-3xl md:text-4xl font-bold leading-tight"
                  style={{ fontFamily: "Plus Jakarta Sans", color: ON_SURFACE }}
                >
                  Selamat Datang di Portal Ruang Baca JDIH KPU Kalimantan Tengah
                </h2>
                <p
                  className="leading-relaxed"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  Ruang Baca Jaringan Dokumentasi dan Informasi Hukum (JDIH) KPU
                  Provinsi Kalimantan Tengah hadir sebagai wujud komitmen kami
                  dalam mewujudkan transparansi informasi kepemiluan dan
                  regulasi hukum kepada masyarakat luas. Melalui layanan ini,
                  kami menjembatani akses publik terhadap dokumen hukum,
                  peraturan perundang-undangan, serta bahan literasi demokrasi
                  secara mudah, cepat, dan terbuka.
                </p>
                <p
                  className="leading-relaxed"
                  style={{ color: ON_SURFACE_VARIANT }}
                >
                  Ruang baca kami memang tidak besar — koleksi buku tersimpan
                  rapi di rak-rak yang mudah dijangkau. Pengunjung dapat membaca
                  langsung di area ruangan, atau membawa buku ke ruang terbuka
                  di sekitar kantor untuk suasana yang lebih santai. Proses
                  pendaftarannya pun kami buat mandiri (self-service) agar
                  praktis bagi siapa saja yang berkunjung.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { icon: "menu_book", label: "Koleksi terkurasi" },
                    { icon: "wifi", label: "WiFi & area kerja" },
                    { icon: "coffee", label: "Area santai luar" },
                    { icon: "support_agent", label: "Petugas siap bantu" },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: ON_SURFACE }}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: "rgba(118,0,9,0.08)",
                          color: PRIMARY,
                        }}
                      >
                        <Icon name={f.icon} style={{ fontSize: 18 }} filled />
                      </span>
                      <span className="font-medium">{f.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal
                delay={120}
                className="lg:col-span-6 order-1 lg:order-2 flex justify-center relative"
              >
                <div className="relative w-full max-w-md aspect-square overflow-visible">
                  <div
                    className="absolute inset-0 rounded-full blur-2xl opacity-30 pointer-events-none"
                    style={{ background: PRIMARY }}
                  />

                  {/* Talawang di pojok kanan atas — ukuran besar */}
                  <TalawangIcon
                    className="absolute spin-slow pointer-events-none select-none"
                    style={{
                      width: 320,
                      height: 320,
                      top: -100,
                      right: -100,
                      opacity: 0.1,
                      zIndex: 0,
                    }}
                  />

                  <TiltCard
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-8"
                    style={{ borderColor: "#ffffff", zIndex: 1 }}
                    intensity={7}
                  >
                    <img
                      alt="Rak penyimpanan buku ruang baca JDIH KPU Kalteng"
                      className="w-full h-full object-cover"
                      src="/images/rak 1.jpeg"
                    />
                    <div
                      className="absolute bottom-4 left-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{
                        background: "rgba(255,255,255,0.95)",
                        color: PRIMARY,
                        transform: "translateZ(30px)",
                      }}
                    >
                      <Icon
                        name="inventory_2"
                        style={{ fontSize: 16 }}
                        filled
                      />
                      Rak koleksi tersusun rapi & mudah dijangkau
                    </div>
                  </TiltCard>
                </div>
              </Reveal>
            </div>
          </section>

          <DayakDivider color={PRIMARY} />

          {/* ======================= VISI & MISI ======================= */}
          <section
            className="py-20 md:py-28 px-4 md:px-8 relative overflow-hidden"
            style={{ backgroundColor: "#fdf7f6" }}
            id="visi-misi"
          >
            <BatangGaringIcon
              className="absolute -right-10 -top-6 w-40 h-64 hidden lg:block pointer-events-none"
              color={PRIMARY}
              style={{ opacity: 0.05 }}
            />
            <BatangGaringIcon
              className="absolute -left-10 -bottom-10 w-40 h-64 hidden lg:block pointer-events-none scale-x-[-1]"
              color={PRIMARY}
              style={{ opacity: 0.05 }}
            />
            <MandauPattern
              className="absolute inset-0 w-full h-full pointer-events-none"
              color={PRIMARY}
              opacity={0.035}
            />
            <div className="max-w-6xl mx-auto relative z-10">
              <Reveal className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                <span
                  className="text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 justify-center"
                  style={{ color: PRIMARY }}
                >
                  Visi &amp; Misi
                </span>
                <h2
                  className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: "Plus Jakarta Sans", color: ON_SURFACE }}
                >
                  Komitmen Kami untuk Literasi Demokrasi
                </h2>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Reveal>
                  <div
                    className="feature-card rounded-2xl p-8 border bg-white h-full relative overflow-hidden"
                    style={{ borderColor: OUTLINE_VARIANT }}
                  >
                    <DayakHookMotif
                      className="absolute -top-2 -right-4 w-40 h-8"
                      color={PRIMARY}
                      opacity={0.15}
                    />
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                      style={{
                        background: "rgba(118,0,9,0.08)",
                        color: PRIMARY,
                      }}
                    >
                      <Icon name="visibility" style={{ fontSize: 28 }} />
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        color: ON_SURFACE,
                      }}
                    >
                      Visi
                    </h3>
                    <p
                      style={{ color: ON_SURFACE_VARIANT }}
                      className="leading-relaxed"
                    >
                      Menjadi pusat rujukan informasi hukum dan kepemiluan yang
                      terpercaya, mudah diakses, dan mendorong partisipasi
                      masyarakat dalam demokrasi di Kalimantan Tengah.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={120}>
                  <div
                    className="feature-card rounded-2xl p-8 border bg-white h-full relative overflow-hidden"
                    style={{ borderColor: OUTLINE_VARIANT }}
                  >
                    <DayakHookMotif
                      className="absolute -bottom-2 -left-4 w-40 h-8"
                      color={PRIMARY}
                      opacity={0.15}
                    />
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                      style={{
                        background: "rgba(118,0,9,0.08)",
                        color: PRIMARY,
                      }}
                    >
                      <Icon name="flag" style={{ fontSize: 28 }} />
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        color: ON_SURFACE,
                      }}
                    >
                      Misi
                    </h3>
                    <ul
                      className="space-y-2 text-sm leading-relaxed"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      <li className="flex gap-2">
                        <Icon
                          name="check_circle"
                          filled
                          style={{ fontSize: 18, color: PRIMARY }}
                        />
                        Menyediakan akses terbuka terhadap produk hukum KPU.
                      </li>
                      <li className="flex gap-2">
                        <Icon
                          name="check_circle"
                          filled
                          style={{ fontSize: 18, color: PRIMARY }}
                        />
                        Meningkatkan literasi kepemiluan masyarakat.
                      </li>
                      <li className="flex gap-2">
                        <Icon
                          name="check_circle"
                          filled
                          style={{ fontSize: 18, color: PRIMARY }}
                        />
                        Menghadirkan layanan digital yang praktis dan modern.
                      </li>
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <DayakDivider color={PRIMARY} />

          {/* ======================= LAYANAN KAMI ======================= */}
          <section
            className="py-20 md:py-28 px-4 md:px-8 relative overflow-hidden"
            id="layanan"
          >
            <div className="max-w-6xl mx-auto relative z-10">
              <Reveal className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: PRIMARY }}
                >
                  Layanan Kami
                </span>
                <h2
                  className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: "Plus Jakarta Sans", color: ON_SURFACE }}
                >
                  Semua yang Anda Butuhkan, dalam Satu Kunjungan
                </h2>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: "how_to_reg",
                    title: "Registrasi Mandiri",
                    desc: "Daftar kunjungan cukup lewat formulir digital tanpa antre di meja petugas.",
                  },
                  {
                    icon: "auto_stories",
                    title: "Katalog Digital",
                    desc: "Jelajahi koleksi buku hukum dan kepemiluan secara online sebelum berkunjung.",
                  },
                  {
                    icon: "meeting_room",
                    title: "Ruang Baca Nyaman",
                    desc: "Fasilitas baca di tempat maupun opsi pinjam buku untuk dibawa pulang.",
                  },
                ].map((f, i) => (
                  <Reveal key={f.title} delay={i * 120}>
                    <div
                      className="feature-card rounded-2xl p-8 border bg-white text-center h-full"
                      style={{ borderColor: OUTLINE_VARIANT }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto"
                        style={{
                          background:
                            "linear-gradient(135deg, #760009, #991b1b)",
                          color: "#ffffff",
                          boxShadow: "0 10px 20px -8px rgba(118,0,9,0.5)",
                        }}
                      >
                        <Icon name={f.icon} style={{ fontSize: 30 }} />
                      </div>
                      <h3
                        className="text-lg font-bold mb-2"
                        style={{
                          fontFamily: "Plus Jakarta Sans",
                          color: ON_SURFACE,
                        }}
                      >
                        {f.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        {f.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <DayakDivider color={PRIMARY} />

          {/* ======================= ALUR KUNJUNGAN (baru) ======================= */}
          <section
            className="py-20 md:py-28 px-4 md:px-8 relative overflow-hidden"
            style={{ backgroundColor: "#fdf7f6" }}
            id="alur"
          >
            <EnggangIcon
              className="absolute left-0 top-8 w-32 hidden lg:block pointer-events-none drift"
              color={PRIMARY}
              style={{ opacity: 0.07, transform: "scaleX(-1)" }}
            />
            <div className="max-w-6xl mx-auto relative z-10">
              <Reveal className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: PRIMARY }}
                >
                  Alur Kunjungan
                </span>
                <h2
                  className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: "Plus Jakarta Sans", color: ON_SURFACE }}
                >
                  Empat Langkah Sederhana Menuju Ruang Baca
                </h2>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    n: "01",
                    icon: "edit_note",
                    title: "Isi Formulir",
                    desc: "Lengkapi nama, kontak, dan tujuan kunjungan pada formulir digital.",
                  },
                  {
                    n: "02",
                    icon: "verified_user",
                    title: "Verifikasi",
                    desc: "Petugas akan memverifikasi data Anda dalam hitungan detik.",
                  },
                  {
                    n: "03",
                    icon: "local_library",
                    title: "Masuk Ruang Baca",
                    desc: "Silakan menuju rak koleksi & pilih buku yang ingin dibaca.",
                  },
                  {
                    n: "04",
                    icon: "sentiment_satisfied",
                    title: "Nikmati Bacaan",
                    desc: "Baca di tempat atau di area santai luar sesuai kenyamanan Anda.",
                  },
                ].map((s, i) => (
                  <Reveal key={s.n} delay={i * 100}>
                    <div
                      className="step-card rounded-2xl p-6 bg-white border relative overflow-hidden h-full"
                      style={{ borderColor: OUTLINE_VARIANT }}
                    >
                      <span
                        className="absolute -top-2 -right-2 text-6xl font-black opacity-10"
                        style={{
                          fontFamily: "Plus Jakarta Sans",
                          color: PRIMARY,
                        }}
                      >
                        {s.n}
                      </span>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{
                          background:
                            "linear-gradient(135deg, #760009, #991b1b)",
                          color: "#fff",
                        }}
                      >
                        <Icon name={s.icon} style={{ fontSize: 24 }} filled />
                      </div>
                      <h4
                        className="font-bold text-lg mb-1"
                        style={{
                          fontFamily: "Plus Jakarta Sans",
                          color: ON_SURFACE,
                        }}
                      >
                        {s.title}
                      </h4>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        {s.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ======================= GALERI RUANG BACA (baru) ======================= */}
          <section
            className="py-20 md:py-28 px-4 md:px-8 relative overflow-hidden"
            id="galeri"
          >
            <MandauPattern
              className="absolute inset-0 w-full h-full pointer-events-none"
              color={PRIMARY}
              opacity={0.03}
            />
            <div className="max-w-6xl mx-auto relative z-10">
              <Reveal className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: PRIMARY }}
                >
                  Galeri Ruang Baca
                </span>
                <h2
                  className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: "Plus Jakarta Sans", color: ON_SURFACE }}
                >
                  Sudut-Sudut Nyaman untuk Membaca
                </h2>
                <p style={{ color: ON_SURFACE_VARIANT }}>
                  Meski mungil, ruang baca kami dirancang agar nyaman — atau
                  bawa buku ke area terbuka di sekitar kantor untuk suasana yang
                  lebih santai.
                </p>
              </Reveal>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {[
                  {
                    src: "/images/rak 2.jpeg",
                    alt: "Rak buku hukum tertata",
                    label: "Rak koleksi",
                    span: "md:col-span-2 md:row-span-2 aspect-square",
                  },
                  {
                    src: "/images/andre.jpeg",
                    alt: "Buku terbuka di meja kayu",
                    label: "Baca di tempat",
                    span: "aspect-square",
                  },
                  {
                    src: "/images/tenang.jpeg",
                    alt: "Area santai luar ruangan",
                    label: "Area santai",
                    span: "aspect-square",
                  },
                  {
                    src: "/images/hukum.jpeg",
                    alt: "Buku hukum tersusun rapi",
                    label: "Koleksi hukum",
                    span: "aspect-square",
                  },
                  {
                    src: "/images/santai.jpeg",
                    alt: "Ruang belajar tenang",
                    label: "Ruang tenang",
                    span: "aspect-square",
                  },
                ].map((g) => (
                  <div
                    key={g.label}
                    className={`gallery-item relative rounded-2xl overflow-hidden shadow-md ${g.span}`}
                    style={{ borderColor: OUTLINE_VARIANT }}
                  >
                    <img
                      src={g.src}
                      alt={g.alt}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(118,0,9,0.65), transparent 55%)",
                      }}
                    />
                    <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1.5">
                      <Icon
                        name="photo_camera"
                        style={{ fontSize: 14 }}
                        filled
                      />
                      {g.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <DayakDivider color={PRIMARY} background="#fdf7f6" />

          {/* ======================= JAM & LOKASI (baru) ======================= */}
          <section
            className="py-20 md:py-24 px-4 md:px-8 relative overflow-hidden"
            style={{ backgroundColor: "#fdf7f6" }}
            id="lokasi"
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              <Reveal>
                <div
                  className="rounded-2xl p-8 bg-white border h-full feature-card"
                  style={{ borderColor: OUTLINE_VARIANT }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(118,0,9,0.08)", color: PRIMARY }}
                  >
                    <Icon name="schedule" style={{ fontSize: 28 }} filled />
                  </div>
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{
                      fontFamily: "Plus Jakarta Sans",
                      color: ON_SURFACE,
                    }}
                  >
                    Jam Operasional
                  </h3>
                  <ul
                    className="text-sm space-y-2"
                    style={{ color: ON_SURFACE_VARIANT }}
                  >
                    <li className="flex justify-between">
                      <span>Senin – Kamis</span>
                      <span
                        className="font-semibold"
                        style={{ color: ON_SURFACE }}
                      >
                        08.00 – 16.00
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Jumat</span>
                      <span
                        className="font-semibold"
                        style={{ color: ON_SURFACE }}
                      >
                        08.00 – 11.00
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Sabtu &amp; Minggu</span>
                      <span
                        className="font-semibold"
                        style={{ color: PRIMARY }}
                      >
                        Tutup
                      </span>
                    </li>
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div
                  className="rounded-2xl p-8 bg-white border h-full feature-card"
                  style={{ borderColor: OUTLINE_VARIANT }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(118,0,9,0.08)", color: PRIMARY }}
                  >
                    <Icon name="location_on" style={{ fontSize: 28 }} filled />
                  </div>
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{
                      fontFamily: "Plus Jakarta Sans",
                      color: ON_SURFACE,
                    }}
                  >
                    Alamat Kami
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: ON_SURFACE_VARIANT }}
                  >
                    Kantor KPU Provinsi Kalimantan Tengah
                    <br />
                    Jl. jend. Sudirman, Palangka Raya
                    <br />
                    Kalimantan Tengah 74874
                  </p>
                  <a
                    href="https://maps.google.com/?q=KPU+Kalimantan+Tengah"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold mt-4 hover:opacity-80"
                    style={{ color: PRIMARY }}
                  >
                    Buka di Google Maps{" "}
                    <Icon name="open_in_new" style={{ fontSize: 14 }} />
                  </a>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div
                  className="rounded-2xl p-8 h-full text-white relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #760009 0%, #4d0006 100%)",
                    boxShadow: "0 20px 40px -12px rgba(118,0,9,0.4)",
                  }}
                >
                  <DayakHookMotif
                    className="absolute -bottom-2 -right-2 w-40 h-8"
                    color="#ffffff"
                    opacity={0.25}
                  />
                  <BatangGaringIcon
                    className="absolute -top-4 -right-4 w-20 h-32"
                    color="#ffffff"
                    style={{ opacity: 0.12 }}
                  />
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <Icon
                      name="contact_support"
                      style={{ fontSize: 28 }}
                      filled
                    />
                  </div>
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{ fontFamily: "Plus Jakarta Sans" }}
                  >
                    Butuh Bantuan?
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed mb-4">
                    Hubungi petugas Ruang Baca JDIH kami untuk pertanyaan
                    seputar koleksi atau kunjungan.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="call" style={{ fontSize: 16 }} filled />
                      (0536) 322-xxxx
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="mail" style={{ fontSize: 16 }} filled />
                      jdih.kalteng@kpu.go.id
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ======================= PENDAFTARAN PENGUNJUNG ======================= */}
          <section
            id="pendaftaran"
            className="scroll-mt-20 py-20 md:py-28 px-4 md:px-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #f8f9ff 0%, #fdf7f6 100%)",
            }}
          >
            <MandauPattern
              className="absolute inset-0 w-full h-full pointer-events-none"
              color={PRIMARY}
              opacity={0.04}
            />
            <EnggangIcon
              className="absolute right-8 top-8 w-40 hidden lg:block pointer-events-none float-slow"
              color={PRIMARY}
              style={{ opacity: 0.07 }}
            />
            <BatangGaringIcon
              className="absolute left-4 bottom-8 w-16 h-40 hidden lg:block pointer-events-none"
              color={PRIMARY}
              style={{ opacity: 0.08 }}
            />

            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left */}
              <div className="lg:col-span-5 space-y-6 hidden lg:block animate-fade-up">
                <div className="space-y-2">
                  <span
                    className="px-3 py-1 rounded-full text-[12px] font-bold tracking-widest uppercase inline-block"
                    style={{
                      backgroundColor: SECONDARY_CONTAINER,
                      color: ON_SECONDARY_CONTAINER,
                    }}
                  >
                    Self-Service Registration
                  </span>
                  <h2
                    className="text-4xl xl:text-5xl leading-tight font-bold"
                    style={{
                      fontFamily: "Plus Jakarta Sans",
                      color: PRIMARY,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Daftarkan Kunjungan Anda Sekarang
                  </h2>
                  <p
                    className="text-base xl:text-lg max-w-md leading-relaxed"
                    style={{ color: ON_SURFACE_VARIANT }}
                  >
                    Silakan daftarkan kehadiran Anda untuk menikmati layanan
                    perpustakaan kami. Literasi demokrasi dimulai dari sini.
                  </p>
                </div>

                <div
                  className="stat-badge rounded-2xl p-5 border flex items-center gap-4"
                  style={{ borderColor: OUTLINE_VARIANT }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(118,0,9,0.1)", color: PRIMARY }}
                  >
                    <Icon name="lock" filled />
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: ON_SURFACE_VARIANT }}
                  >
                    Data Anda hanya digunakan untuk kepentingan layanan Ruang
                    Baca JDIH dan dilindungi sesuai kebijakan privasi KPU RI.
                  </div>
                </div>
              </div>

              {/* Right - Form */}
              <div className="lg:col-span-7 animate-fade-up">
                <div
                  className="rounded-2xl p-7 md:p-10 border relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(12px)",
                    borderColor: "rgba(225,191,187,0.35)",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 20px 40px -8px rgb(118 0 9 / 0.12)",
                  }}
                >
                  <DayakHookMotif
                    className="absolute top-0 left-0 w-full h-6"
                    color={PRIMARY}
                    opacity={0.5}
                  />
                  <div className="mb-8 text-center lg:text-left pt-2">
                    <h3
                      className="text-2xl font-bold mb-2"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        color: ON_SURFACE,
                      }}
                    >
                      Pendaftaran Pengunjung
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: ON_SURFACE_VARIANT }}
                    >
                      Mohon lengkapi formulir di bawah ini untuk memulai
                      kunjungan Anda.
                    </p>
                  </div>

                  {success ? (
                    <div
                      className="border p-8 rounded-2xl text-center animate-scale-in"
                      style={{
                        backgroundColor: "#ecfdf5",
                        borderColor: "#10b981",
                        color: "#065f46",
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-check"
                        style={{ background: "#d1fae5" }}
                      >
                        <Icon
                          name="check_circle"
                          style={{ fontSize: 40, color: "#059669" }}
                        />
                      </div>
                      <p className="font-bold text-lg">Pendaftaran Berhasil!</p>
                      <p className="text-sm mt-1.5 opacity-80">
                        Silakan masuk ke area perpustakaan.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label
                            className="block ml-1 text-[11px] font-semibold uppercase tracking-wider"
                            style={{ color: ON_SURFACE_VARIANT }}
                          >
                            Nama Lengkap
                          </label>
                          <div className="relative">
                            <span
                              className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined"
                              style={{ color: OUTLINE, fontSize: 20 }}
                            >
                              person
                            </span>
                            <input
                              type="text"
                              required
                              value={form.nama}
                              onChange={(e) =>
                                setForm({ ...form, nama: e.target.value })
                              }
                              placeholder="Contoh: Budi Santoso"
                              className="w-full pl-12 pr-4 py-3 bg-white border rounded-xl outline-none transition-all text-sm"
                              style={{ borderColor: OUTLINE_VARIANT }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            className="block ml-1 text-[11px] font-semibold uppercase tracking-wider"
                            style={{ color: ON_SURFACE_VARIANT }}
                          >
                            Nomor Telepon / WA
                          </label>
                          <div className="relative">
                            <span
                              className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined"
                              style={{ color: OUTLINE, fontSize: 20 }}
                            >
                              call
                            </span>
                            <input
                              type="tel"
                              required
                              value={form.noHp}
                              onChange={(e) =>
                                setForm({ ...form, noHp: e.target.value })
                              }
                              placeholder="0812-xxxx-xxxx"
                              className="w-full pl-12 pr-4 py-3 bg-white border rounded-xl outline-none transition-all text-sm"
                              style={{ borderColor: OUTLINE_VARIANT }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          className="block ml-1 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: ON_SURFACE_VARIANT }}
                        >
                          NIK (Opsional)
                        </label>
                        <div className="relative">
                          <span
                            className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined"
                            style={{ color: OUTLINE, fontSize: 20 }}
                          >
                            badge
                          </span>
                          <input
                            type="text"
                            value={form.nik}
                            onChange={(e) =>
                              setForm({ ...form, nik: e.target.value })
                            }
                            placeholder="Masukkan 16 digit NIK Anda"
                            className="w-full pl-12 pr-4 py-3 bg-white border rounded-xl outline-none transition-all text-sm"
                            style={{ borderColor: OUTLINE_VARIANT }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          className="block ml-1 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: ON_SURFACE_VARIANT }}
                        >
                          Alamat Domisili
                        </label>
                        <div className="relative">
                          <span
                            className="absolute left-4 top-3.5 material-symbols-outlined"
                            style={{ color: OUTLINE, fontSize: 20 }}
                          >
                            location_on
                          </span>
                          <textarea
                            rows={2}
                            value={form.alamat}
                            onChange={(e) =>
                              setForm({ ...form, alamat: e.target.value })
                            }
                            placeholder="Alamat lengkap sesuai KTP"
                            className="w-full pl-12 pr-4 py-3 bg-white border rounded-xl outline-none resize-none transition-all text-sm"
                            style={{ borderColor: OUTLINE_VARIANT }}
                          />
                        </div>
                      </div>

                      {/* ✅ TAMBAHKAN INPUT INSTANSI */}
                      <div className="space-y-2">
                        <label
                          className="block ml-1 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: ON_SURFACE_VARIANT }}
                        >
                          Instansi / Asal (Opsional)
                        </label>
                        <div className="relative">
                          <span
                            className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined"
                            style={{ color: OUTLINE, fontSize: 20 }}
                          >
                            business
                          </span>
                          <input
                            type="text"
                            value={form.instansi}
                            onChange={(e) =>
                              setForm({ ...form, instansi: e.target.value })
                            }
                            placeholder="Contoh: KPU Kalteng, Bawaslu, Mahasiswa"
                            className="w-full pl-12 pr-4 py-3 bg-white border rounded-xl outline-none transition-all text-sm"
                            style={{ borderColor: OUTLINE_VARIANT }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          className="block ml-1 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: ON_SURFACE_VARIANT }}
                        >
                          Tujuan Kunjungan
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Baca di Tempat */}
                          <label className="cursor-pointer">
                            <input
                              type="radio"
                              name="tujuan"
                              value="baca_di_tempat"
                              checked={form.tujuan === "baca_di_tempat"}
                              onChange={(e) =>
                                setForm({ ...form, tujuan: e.target.value })
                              }
                              className="peer hidden"
                            />
                            <div
                              className="tujuan-card flex flex-col items-center gap-2 p-4 rounded-xl border-2 bg-white peer-checked:border-[#760009] peer-checked:bg-[rgba(118,0,9,0.05)]"
                              style={{ borderColor: OUTLINE_VARIANT }}
                            >
                              <span
                                className="material-symbols-outlined text-2xl peer-checked:text-[#760009]"
                                style={{
                                  color:
                                    form.tujuan === "baca_di_tempat"
                                      ? PRIMARY
                                      : OUTLINE,
                                }}
                              >
                                menu_book
                              </span>
                              <span
                                className="font-semibold text-sm"
                                style={{
                                  color:
                                    form.tujuan === "baca_di_tempat"
                                      ? PRIMARY
                                      : ON_SURFACE,
                                }}
                              >
                                Baca di Tempat
                              </span>
                            </div>
                          </label>

                          {/* Pinjam Buku → redirect ke katalog */}
                          <label className="cursor-pointer">
                            <input
                              type="radio"
                              name="tujuan"
                              value="bawa_keluar"
                              checked={form.tujuan === "bawa_keluar"}
                              onChange={() => {
                                router.push("/katalog");
                              }}
                              className="peer hidden"
                            />
                            <div
                              className="tujuan-card flex flex-col items-center gap-2 p-4 rounded-xl border-2 bg-white"
                              style={{ borderColor: OUTLINE_VARIANT }}
                            >
                              <span
                                className="material-symbols-outlined text-2xl"
                                style={{ color: OUTLINE }}
                              >
                                handshake
                              </span>
                              <span className="font-semibold text-sm">
                                Pinjam Buku
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full text-white py-4 rounded-xl shadow-lg font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                          style={{
                            background:
                              "linear-gradient(180deg, #760009 0%, #991b1b 100%)",
                            fontFamily: "Plus Jakarta Sans",
                            boxShadow: "0 8px 20px -6px rgba(118,0,9,0.4)",
                          }}
                        >
                          {loading ? (
                            <>
                              <Icon name="sync" className="animate-spin" />
                              <span>Memproses...</span>
                            </>
                          ) : (
                            <>
                              <span>Daftar Kunjungan</span>
                              <Icon name="arrow_forward" />
                            </>
                          )}
                        </button>
                      </div>

                      <p
                        className="text-center text-xs pt-1"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        Data Anda dilindungi oleh Kebijakan Privasi KPU RI.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="w-full py-6 mt-auto relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #760009 0%, #991b1b 100%)",
            color: "#ffffff",
            borderTop: "2px solid rgba(255,255,255,0.1)",
          }}
        >
          <DayakHookMotif
            className="absolute top-0 left-0 w-full h-5"
            color="#ffffff"
            opacity={0.35}
          />
          <div className="flex flex-col md:flex-row justify-center items-center px-4 md:px-10 max-w-[1280px] mx-auto gap-10 pt-4">
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
