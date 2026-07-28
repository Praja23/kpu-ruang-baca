"use client";

import {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";

const C = {
  primary: "#760009",
  onPrimary: "#ffffff",
  primaryContainer: "#ffdad6",
  secondary: "#775652",
  surface: "#f8f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f3fa",
  surfaceContainer: "#ecedf4",
  surfaceContainerHigh: "#e6e7ee",
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

export default function TambahBukuPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    kodeBuku: "",
    judul: "",
    penulis: "",
    kategori: "",
    tahun: "",
    stok: 1,
    lokasiRak: "",
    deskripsi: "",
    imageUrl: "",
    pdfUrl: "", // ✅ tambahan PDF
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [kategoriList, setKategoriList] = useState<string[]>([]);
  const [kategoriLoading, setKategoriLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchKategori = async () => {
      setKategoriLoading(true);
      try {
        const res = await fetch("/api/admin/kategori");
        const data = await res.json();
        if (data.success) {
          setKategoriList(data.data.map((item: any) => item.nama));
        }
      } catch (error) {
        console.error("Gagal ambil kategori:", error);
      } finally {
        setKategoriLoading(false);
      }
    };
    fetchKategori();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uploadFileToCloudinary = async (
    file: File,
    folder: string = "kpu-ruang-baca",
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Gagal upload file");
    }

    const data = await res.json();
    return data.url;
  };

  const handleImageFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const url = await uploadFileToCloudinary(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      showToast("Gambar berhasil diupload!", "success");
    } catch (error: any) {
      showToast(error.message || "Gagal upload gambar", "error");
      setPreview(null);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePdfFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Hanya file PDF yang diperbolehkan", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Ukuran file maksimal 10MB", "error");
      return;
    }

    setUploadingPdf(true);
    try {
      const url = await uploadFileToCloudinary(file);
      setForm((prev) => ({ ...prev, pdfUrl: url }));
      setPdfFileName(file.name);
      showToast("PDF berhasil diupload!", "success");
    } catch (error: any) {
      showToast(error.message || "Gagal upload PDF", "error");
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCategorySelect = (value: string) => {
    if (value === "__tambah") {
      router.push("/admin/buku/kategori");
      return;
    }
    setForm({ ...form, kategori: value });
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Validasi client-side (opsional, untuk mengurangi request gagal)
      const errors = [];
      if (form.kodeBuku && form.kodeBuku.length > 50) {
        errors.push("Kode Buku maksimal 50 karakter");
      }
      if (form.judul && form.judul.length > 255) {
        errors.push("Judul Buku maksimal 255 karakter");
      }
      if (form.penulis && form.penulis.length > 100) {
        errors.push("Penulis maksimal 100 karakter");
      }
      if (form.kategori && form.kategori.length > 50) {
        errors.push("Kategori maksimal 50 karakter");
      }
      if (form.lokasiRak && form.lokasiRak.length > 50) {
        errors.push("Lokasi Rak maksimal 50 karakter");
      }

      if (errors.length > 0) {
        showToast(errors.join("; "), "error");
        setLoading(false);
        return;
      }

      const payload = {
        kodeBuku: form.kodeBuku,
        judul: form.judul,
        penulis: form.penulis,
        kategori: form.kategori,
        tahun: form.tahun,
        stok: parseInt(form.stok as any) || 1,
        lokasiRak: form.lokasiRak,
        deskripsi: form.deskripsi,
        imageUrl: form.imageUrl || null,
        pdfUrl: form.pdfUrl || null,
      };

      const res = await fetch("/api/buku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Buku "${data.data.judul}" berhasil ditambahkan!`, "success");
        router.push("/admin/buku");
      } else {
        // ✅ Tampilkan pesan error spesifik dari API
        const errorMsg = data.message || data.error || "Gagal menambahkan buku";
        showToast(errorMsg, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Terjadi kesalahan pada server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          line-height: 1;
          display: inline-block;
          vertical-align: middle;
        }
        .crumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          color: ${C.outline};
          font-size: 12px;
          letter-spacing: 0.03em;
        }
        .crumbs a { transition: color 0.15s; }
        .crumbs a:hover { color: ${C.primary}; }
        .crumbs .cur { color: ${C.primary}; font-weight: 600; }
        .crumbs .material-symbols-outlined { font-size: 16px !important; }
        .form-card {
          background: ${C.surfaceContainerLowest};
          border: 1px solid ${C.outlineVariant};
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(20,10,10,0.04), 0 8px 24px rgba(20,10,10,0.03);
        }
        .form-head {
          padding: 28px 32px;
          border-bottom: 1px solid ${C.outlineVariant};
          background: linear-gradient(135deg, rgba(118,0,9,0.04), transparent);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .form-head h2 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: ${C.onSurface};
          margin: 0;
        }
        .form-head p {
          font-size: 14px;
          color: ${C.onSurfaceVariant};
          margin: 4px 0 0;
        }
        .badge {
          padding: 6px 14px;
          background: ${C.primaryContainer};
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: ${C.primary};
        }
        form.form {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 22px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .field.full { grid-column: 1 / -1; }
        .field label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${C.outline};
        }
        .field input,
        .field textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid ${C.outlineVariant};
          border-radius: 12px;
          background: ${C.surfaceContainerLow};
          font-size: 15px;
          color: ${C.onSurface};
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .field textarea { resize: vertical; min-height: 100px; }
        .field input:focus,
        .field textarea:focus {
          outline: none;
          border-color: ${C.primary};
          background: #fff;
          box-shadow: 0 0 0 3px rgba(118,0,9,0.12);
        }
        .category-dropdown { position: relative; width: 100%; }
        .category-dropdown-trigger {
          width: 100%;
          padding: 12px 16px;
          background: ${C.surfaceContainerLow};
          border: 1px solid ${C.outlineVariant};
          border-radius: 12px;
          font-size: 15px;
          color: ${C.onSurface};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.15s;
          text-align: left;
        }
        .category-dropdown-trigger:hover { border-color: ${C.primary}; }
        .category-dropdown-trigger:focus {
          outline: none;
          border-color: ${C.primary};
          box-shadow: 0 0 0 3px rgba(118,0,9,0.12);
          background: #fff;
        }
        .category-dropdown-trigger .placeholder { color: #999; }
        .category-dropdown-trigger .selected { color: ${C.onSurface}; font-weight: 500; }
        .category-dropdown-trigger .arrow {
          transition: transform 0.2s ease;
          color: ${C.outline};
        }
        .category-dropdown-trigger .arrow.open { transform: rotate(180deg); }
        .category-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid ${C.outlineVariant};
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
          max-height: 240px;
          overflow-y: auto;
          z-index: 50;
          animation: dropdownFade 0.18s ease-out;
          padding: 6px 0;
        }
        .category-item {
          padding: 11px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: ${C.onSurface};
          transition: background 0.15s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .category-item:hover { background: ${C.surfaceContainerLow}; }
        .category-item .check { visibility: hidden; color: ${C.primary}; }
        .category-item.active .check { visibility: visible; }
        .category-item.active { font-weight: 600; background: ${C.primaryContainer}; color: ${C.primary}; }
        .category-divider { height: 1px; background: ${C.outlineVariant}; margin: 6px 12px; }
        .category-add-item {
          padding: 12px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: ${C.primary};
          font-weight: 600;
          transition: background 0.15s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .category-add-item:hover { background: ${C.primaryContainer}; }
        .uploadRow {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .uploadBox {
          flex: 1;
          min-width: 200px;
          border: 2px dashed ${C.outlineVariant};
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${C.surfaceContainerLow};
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .uploadBox:hover { background: ${C.surfaceContainer}; border-color: ${C.primary}; }
        .uploadBox .material-symbols-outlined { font-size: 32px !important; color: ${C.primary}; margin-bottom: 8px; }
        .uploadBox .title { font-size: 14px; color: ${C.onSurface}; font-weight: 600; margin: 0; }
        .uploadBox .sub { font-size: 11px; color: ${C.outline}; margin: 4px 0 0; }
        .uploadBox .file-name { font-size: 12px; color: ${C.primary}; font-weight: 600; margin-top: 6px; }
        .uploadBox .pickBtn {
          margin-top: 12px;
          padding: 6px 18px;
          background: ${C.onSurface};
          color: #fff;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition: background 0.2s;
        }
        .uploadBox:hover .pickBtn { background: ${C.primary}; }
        .uploadBox.disabled { opacity: 0.6; pointer-events: none; }
        .uploadBox .uploading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          gap: 8px;
          z-index: 10;
        }
        .uploadBox .uploading-overlay .material-symbols-outlined {
          font-size: 28px !important;
          animation: spin 1s linear infinite;
        }
        .previewBox {
          width: 120px;
          height: 168px;
          border-radius: 12px;
          background: ${C.surfaceContainer};
          border: 2px dashed ${C.outlineVariant};
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }
        .previewPlaceholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: ${C.outline};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .previewPlaceholder .material-symbols-outlined { font-size: 30px !important; }
        .previewBox img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 28px;
          border-top: 1px solid ${C.outlineVariant};
        }
        .btn {
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s;
        }
        .btn:active { transform: scale(0.97); }
        .btn.outline {
          border: 1.5px solid ${C.primary};
          color: ${C.primary};
          background: transparent;
        }
        .btn.outline:hover { background: rgba(118,0,9,0.05); }
        .btn.primary {
          background: linear-gradient(135deg, ${C.primary}, #a3121b);
          color: #fff;
          box-shadow: 0 6px 18px -4px rgba(118,0,9,0.4);
        }
        .btn.primary:hover { filter: brightness(1.08); }
        .btn.primary:disabled { opacity: 0.65; cursor: not-allowed; filter: none; }
        .foot {
          margin-top: 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: ${C.outline};
          padding-bottom: 20px;
        }
        @media (max-width: 900px) {
          .grid { grid-template-columns: 1fr; }
          .uploadRow { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <div className="flex flex-col">
        <div className="mb-4 animate-fade-up">
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

        <nav
          className="crumbs animate-fade-up"
          style={{ animationDelay: "40ms" }}
        >
          <Link href="/admin/dashboard">Dashboard</Link>
          <Icon name="chevron_right" />
          <Link href="/admin/buku">Manajemen Buku</Link>
          <Icon name="chevron_right" />
          <span className="cur">Tambah Buku Baru</span>
        </nav>

        <div
          className="form-card animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <div className="form-head">
            <div>
              <h2>Informasi Detail Buku</h2>
              <p>
                Lengkapi seluruh data di bawah ini untuk menambah koleksi
                perpustakaan.
              </p>
            </div>
            <div className="badge">KATEGORI: TERSEDIA</div>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="grid">
              <div className="field">
                <label>Kode Buku *</label>
                <input
                  type="text"
                  name="kodeBuku"
                  placeholder="Contoh: UU-001"
                  value={form.kodeBuku}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Kategori</label>
                <div className="category-dropdown" ref={dropdownRef}>
                  <button
                    type="button"
                    className="category-dropdown-trigger"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={kategoriLoading}
                  >
                    <span
                      className={form.kategori ? "selected" : "placeholder"}
                    >
                      {kategoriLoading
                        ? "Memuat kategori..."
                        : form.kategori || "Pilih Kategori"}
                    </span>
                    <span className={`arrow ${isDropdownOpen ? "open" : ""}`}>
                      <Icon name="expand_more" />
                    </span>
                  </button>
                  {isDropdownOpen && !kategoriLoading && (
                    <div className="category-dropdown-menu">
                      {kategoriList.length === 0 ? (
                        <div
                          className="px-4 py-3 text-sm"
                          style={{ color: C.outline }}
                        >
                          Belum ada kategori
                        </div>
                      ) : (
                        kategoriList.map((k) => (
                          <button
                            key={k}
                            type="button"
                            className={`category-item ${form.kategori === k ? "active" : ""}`}
                            onClick={() => handleCategorySelect(k)}
                          >
                            <span className="check">
                              <Icon name="check" style={{ fontSize: 18 }} />
                            </span>
                            {k}
                          </button>
                        ))
                      )}
                      <div className="category-divider" />
                      <button
                        type="button"
                        className="category-add-item"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push("/admin/buku/kategori");
                        }}
                      >
                        <Icon name="add" style={{ fontSize: 18 }} />
                        Tambah Kategori Baru
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="field full">
                <label>Judul Buku *</label>
                <input
                  type="text"
                  name="judul"
                  placeholder="Masukkan judul lengkap buku"
                  value={form.judul}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Penulis *</label>
                <input
                  type="text"
                  name="penulis"
                  placeholder="Nama pengarang / instansi"
                  value={form.penulis}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Tahun Terbit</label>
                <input
                  type="number"
                  name="tahun"
                  placeholder="2024"
                  value={form.tahun}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Jumlah Stok</label>
                <input
                  type="number"
                  name="stok"
                  placeholder="1"
                  value={form.stok}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="field">
                <label>Lokasi Rak</label>
                <input
                  type="text"
                  name="lokasiRak"
                  placeholder="Contoh: Rak A1-04"
                  value={form.lokasiRak}
                  onChange={handleChange}
                />
              </div>
              <div className="field full">
                <label>Deskripsi / Sinopsis</label>
                <textarea
                  rows={4}
                  name="deskripsi"
                  placeholder="Tuliskan ringkasan singkat isi buku..."
                  value={form.deskripsi}
                  onChange={handleChange}
                />
              </div>

              {/* Upload Sampul */}
              <div className="field full" style={{ gap: 12 }}>
                <label>Sampul Buku</label>
                <div className="uploadRow">
                  <div className="previewBox">
                    {uploadingImage ? (
                      <div className="uploading-overlay">
                        <span className="material-symbols-outlined">sync</span>
                        <span>Mengupload...</span>
                      </div>
                    ) : preview ? (
                      <img src={preview} alt="preview" />
                    ) : (
                      <div className="previewPlaceholder">
                        <Icon name="add_photo_alternate" />
                        <span>PREVIEW</span>
                      </div>
                    )}
                  </div>
                  <label className="uploadBox" htmlFor="file-upload">
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageFile}
                      ref={fileInputRef}
                    />
                    <Icon name="cloud_upload" />
                    <p className="title">Klik untuk unggah sampul</p>
                    <p className="sub">JPG, PNG, WEBP (Maks. 2MB)</p>
                    <span className="pickBtn">Pilih File</span>
                  </label>
                </div>
                {form.imageUrl && (
                  <p
                    className="text-xs font-medium flex items-center gap-1.5"
                    style={{ color: "#16a34a" }}
                  >
                    <Icon name="check_circle" style={{ fontSize: 16 }} />
                    Gambar berhasil diupload
                  </p>
                )}
              </div>

              {/* Upload PDF */}
              <div className="field full" style={{ gap: 12 }}>
                <label>Dokumen PDF (Opsional)</label>
                <div className="uploadRow">
                  <div className="flex-1 min-w-[200px] flex items-center gap-4">
                    <div className="flex-1">
                      <label className="uploadBox" htmlFor="pdf-upload">
                        <input
                          id="pdf-upload"
                          type="file"
                          accept=".pdf"
                          hidden
                          onChange={handlePdfFile}
                          ref={pdfInputRef}
                        />
                        <Icon name="description" />
                        <p className="title">Unggah file PDF</p>
                        <p className="sub">Maks. 10MB</p>
                        <span className="pickBtn">
                          {uploadingPdf ? "Mengupload..." : "Pilih PDF"}
                        </span>
                      </label>
                      {uploadingPdf && (
                        <div
                          className="flex items-center gap-2 mt-2 text-sm"
                          style={{ color: C.primary }}
                        >
                          <span
                            className="material-symbols-outlined animate-spin"
                            style={{ fontSize: 18 }}
                          >
                            sync
                          </span>
                          Mengupload PDF...
                        </div>
                      )}
                      {form.pdfUrl && !uploadingPdf && (
                        <div
                          className="flex items-center gap-2 mt-2 text-xs font-medium"
                          style={{ color: "#16a34a" }}
                        >
                          <Icon name="check_circle" style={{ fontSize: 16 }} />
                          PDF terupload: {pdfFileName || "dokumen.pdf"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="actions">
              <Link href="/admin/buku" className="btn outline">
                <Icon name="close" style={{ fontSize: 18 }} />
                Batal
              </Link>
              <button
                type="submit"
                className="btn primary"
                disabled={loading || uploadingImage || uploadingPdf}
              >
                <Icon name="save" style={{ fontSize: 18 }} />
                {loading ? "Menyimpan..." : "Simpan Data Koleksi"}
              </button>
            </div>
          </form>
        </div>

        <div
          className="foot animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <span>© 2024 Bagian Hukum — Ruang Baca JDIH</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">
              Panduan Admin
            </a>
            <a href="#" className="hover:underline">
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
