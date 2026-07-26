"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/visitor/Header";
import Footer from "@/app/components/visitor/Footer";

export default function DaftarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    noHp: "",
    nik: "",
    alamat: "",
    tujuan: "baca_di_tempat",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/pengunjung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Pendaftaran berhasil! Silakan masuk ke area perpustakaan.");
        router.push("/katalog");
      } else {
        alert("❌ Gagal: " + data.message);
      }
    } catch (error) {
      alert("❌ Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-grow pt-24 pb-12 px-4 md:px-8 flex items-center justify-center relative overflow-hidden min-h-screen">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-5 space-y-6 hidden lg:block">
            <div className="space-y-2">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[12px] font-bold tracking-widest uppercase">
                Self-Service Registration
              </span>
              <h2 className="font-display-lg text-display-lg text-primary leading-tight">
                Selamat Datang di Ruang Baca JDIH KPU
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                Silakan daftarkan kehadiran Anda untuk menikmati layanan
                perpustakaan kami. Literasi demokrasi dimulai dari sini.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-b from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-8xl text-primary/30">
                library_books
              </span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 md:p-10 shadow-xl border border-outline-variant/30">
              <div className="mb-8 text-center lg:text-left">
                <h3 className="font-headline-md text-headline-md text-on-background mb-2">
                  Pendaftaran Pengunjung
                </h3>
                <p className="font-body-md text-on-surface-variant">
                  Mohon lengkapi formulir di bawah ini untuk memulai kunjungan
                  Anda.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant ml-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                      className="w-full pl-4 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant ml-1">
                      Nomor Telepon / WA *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.noHp}
                      onChange={(e) =>
                        setFormData({ ...formData, noHp: e.target.value })
                      }
                      className="w-full pl-4 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      placeholder="0812-xxxx-xxxx"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant ml-1">
                    NIK (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) =>
                      setFormData({ ...formData, nik: e.target.value })
                    }
                    className="w-full pl-4 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                    placeholder="Masukkan 16 digit NIK Anda"
                    maxLength={16}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant ml-1">
                    Alamat Domisili *
                  </label>
                  <textarea
                    required
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    className="w-full pl-4 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none"
                    placeholder="Alamat lengkap sesuai KTP"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant ml-1">
                    Tujuan Kunjungan *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="cursor-pointer group">
                      <input
                        type="radio"
                        name="tujuan"
                        value="baca_di_tempat"
                        checked={formData.tujuan === "baca_di_tempat"}
                        onChange={(e) =>
                          setFormData({ ...formData, tujuan: e.target.value })
                        }
                        className="peer hidden"
                      />
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-outline-variant bg-white peer-checked:border-primary peer-checked:bg-primary/5 transition-all group-hover:bg-surface-container">
                        <span className="material-symbols-outlined text-2xl text-outline peer-checked:text-primary">
                          menu_book
                        </span>
                        <span className="font-body-md font-semibold">
                          Baca di Tempat
                        </span>
                      </div>
                    </label>
                    <label className="cursor-pointer group">
                      <input
                        type="radio"
                        name="tujuan"
                        value="bawa_keluar"
                        checked={formData.tujuan === "bawa_keluar"}
                        onChange={(e) =>
                          setFormData({ ...formData, tujuan: e.target.value })
                        }
                        className="peer hidden"
                      />
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-outline-variant bg-white peer-checked:border-primary peer-checked:bg-primary/5 transition-all group-hover:bg-surface-container">
                        <span className="material-symbols-outlined text-2xl text-outline peer-checked:text-primary">
                          handshake
                        </span>
                        <span className="font-body-md font-semibold">
                          Pinjam Buku
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full primary-gradient text-white py-4 rounded-xl font-headline-md shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">
                          sync
                        </span>
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <span>Daftar Kunjungan</span>
                        <span className="material-symbols-outlined">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-center font-label-sm text-on-surface-variant pt-2">
                  Data Anda dilindungi oleh Kebijakan Privasi KPU RI.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
