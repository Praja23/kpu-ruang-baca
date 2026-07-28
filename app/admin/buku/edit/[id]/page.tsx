"use client";

import {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
  useRef,
} from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";

const C = {
  primary: "#760009",
  onPrimary: "#ffffff",
  primaryContainer: "#991b1b",
  onPrimaryContainer: "#ffaaa1",
  background: "#f8f9ff",
  onBackground: "#0b1c30",
  surface: "#f8f9ff",
  surfaceBright: "#ffffff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#eef3fb",
  surfaceContainer: "#e6ecf6",
  onSurface: "#0b1c30",
  onSurfaceVariant: "#59413e",
  outlineVariant: "#d8c2be",
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

export default function EditBukuPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
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
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [kategoriList, setKategoriList] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBuku = async () => {
      try {
        const res = await fetch(`/api/buku/${id}`);
        if (!res.ok) throw new Error("Buku tidak ditemukan");
        const data = await res.json();
        setForm({
          kodeBuku: data.kodeBuku || "",
          judul: data.judul || "",
          penulis: data.penulis || "",
          kategori: data.kategori || "",
          tahun: data.tahun || "",
          stok: data.stok || 1,
          lokasiRak: data.lokasiRak || "",
          deskripsi: data.deskripsi || "",
          imageUrl: data.imageUrl || "",
          pdfUrl: data.pdfUrl || "", // ✅ tambahan
        });
        if (data.imageUrl) setPreview(data.imageUrl);
        if (data.pdfUrl) setPdfFileName("dokumen.pdf");
      } catch (error) {
        console.error(error);
        showToast("Gagal memuat data buku", "error");
        router.push("/admin/buku");
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchBuku();
  }, [id, showToast, router]);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await fetch("/api/admin/kategori");
        const data = await res.json();
        if (data.success) {
          setKategoriList(data.data.map((item: any) => item.nama));
        }
      } catch (error) {
        console.error("Gagal ambil kategori:", error);
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

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      showToast("Hanya file JPG, PNG, WEBP, GIF yang diizinkan", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran file maksimal 2MB", "error");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadFileToCloudinary(file);
      setPreview(url);
      setForm({ ...form, imageUrl: url });
      showToast("Gambar berhasil diupload!", "success");
    } catch (error: any) {
      showToast(error.message || "Gagal upload gambar", "error");
    } finally {
      setUploading(false);
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
      setForm({ ...form, pdfUrl: url });
      setPdfFileName(file.name);
      showToast("PDF berhasil diupload!", "success");
    } catch (error: any) {
      showToast(error.message || "Gagal upload PDF", "error");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      // ✅ Validasi client-side
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

      const res = await fetch(`/api/buku/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Buku "${data.data.judul}" berhasil diperbarui!`, "success");
        router.push("/admin/buku");
      } else {
        // ✅ Gunakan data.message (dari API) sebagai prioritas, fallback ke data.error
        const errorMsg = data.message || data.error || "Gagal memperbarui buku";
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
        .material-symbols-outlined { 
          font-family: 'Material Symbols Outlined'; 
          font-weight: normal; 
          font-style: normal; 
          line-height: 1; 
          display: inline-block; 
          vertical-align: middle; 
        }
        .card { 
          background: #fff; 
          border: 1px solid #d8c2be; 
          border-radius: 12px; 
          overflow: hidden; 
        }
        .cardHead { 
          padding: 32px; 
          border-bottom: 1px solid #d8c2be; 
          background: #ffffff; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }
        .cardHead h2 { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          font-size: 24px; 
          font-weight: 600; 
          color: #0b1c30; 
          margin: 0; 
        }
        .cardHead p { 
          font-size: 16px; 
          color: #59413e; 
          margin: 0; 
        }
        .badge { 
          padding: 6px 16px; 
          background: rgba(118,0,9,.1); 
          border-radius: 9999px; 
        }
        .badge span { 
          font-family: 'Work Sans', sans-serif; 
          font-size: 12px; 
          color: #760009; 
          font-weight: 700; 
          letter-spacing: .05em; 
        }
        form.form { 
          padding: 32px; 
          display: flex; 
          flex-direction: column; 
          gap: 32px; 
        }
        .grid { 
          display: grid; 
          grid-template-columns: repeat(2,1fr); 
          gap: 24px; 
        }
        .field { 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
        }
        .field.full { 
          grid-column: 1 / -1; 
        }
        .field label { 
          font-family: 'Work Sans', sans-serif; 
          font-size: 12px; 
          font-weight: 500; 
          letter-spacing: .08em; 
          text-transform: uppercase; 
          color: #59413e; 
        }
        .field input, 
        .field textarea { 
          width: 100%; 
          padding: 12px 16px; 
          border: 1px solid #d8c2be; 
          border-radius: 8px; 
          background: #fff; 
          font-size: 16px; 
          color: #0b1c30; 
          transition: border-color .15s,box-shadow .15s; 
        }
        .field textarea { 
          resize: none; 
        }
        .field input:focus, 
        .field textarea:focus { 
          border-color: #760009; 
          box-shadow: 0 0 0 1px #760009; 
        }

        /* Custom Dropdown Styling */
        .category-dropdown {
          position: relative;
          width: 100%;
        }
        .category-dropdown-trigger {
          width: 100%;
          padding: 12px 16px;
          background: #fff;
          border: 1px solid #d8c2be;
          border-radius: 8px;
          font-size: 16px;
          color: #0b1c30;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color .15s, box-shadow .15s;
          font-family: inherit;
          text-align: left;
        }
        .category-dropdown-trigger:hover {
          border-color: #760009;
        }
        .category-dropdown-trigger:focus {
          border-color: #760009;
          box-shadow: 0 0 0 1px #760009;
          outline: none;
        }
        .category-dropdown-trigger .placeholder {
          color: #999;
        }
        .category-dropdown-trigger .selected {
          color: #0b1c30;
          font-weight: 500;
        }
        .category-dropdown-trigger .arrow {
          transition: transform 0.2s ease;
          color: #59413e;
        }
        .category-dropdown-trigger .arrow.open {
          transform: rotate(180deg);
        }

        .category-dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #d8c2be;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          max-height: 200px;
          overflow-y: auto;
          z-index: 50;
          animation: dropdownFade 0.15s ease-out;
          padding: 4px 0;
        }
        .category-dropdown-menu::-webkit-scrollbar {
          width: 4px;
        }
        .category-dropdown-menu::-webkit-scrollbar-thumb {
          background: #d8c2be;
          border-radius: 4px;
        }
        .category-dropdown-menu::-webkit-scrollbar-track {
          background: transparent;
        }

        .category-item {
          padding: 10px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          color: #0b1c30;
          transition: background 0.15s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          font-family: inherit;
        }
        .category-item:hover {
          background: #eef3fb;
        }
        .category-item:active {
          background: #e6ecf6;
        }
        .category-item .check {
          visibility: hidden;
          color: #760009;
        }
        .category-item.active .check {
          visibility: visible;
        }
        .category-item.active {
          font-weight: 600;
          background: #f8f9ff;
        }

        .category-divider {
          height: 1px;
          background: #d8c2be;
          margin: 4px 12px;
        }

        .category-add-item {
          padding: 10px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          color: #760009;
          font-weight: 600;
          transition: background 0.15s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          font-family: inherit;
          border-top: 1px solid #d8c2be;
          margin-top: 4px;
          padding-top: 12px;
        }
        .category-add-item:hover {
          background: #ffdad6;
        }
        .category-add-item .material-symbols-outlined {
          font-size: 20px;
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .uploadRow { 
          display: flex; 
          gap: 24px; 
          align-items: flex-start; 
          flex-wrap: wrap;
        }
        .uploadBox {
          flex: 1;
          min-width: 200px;
          border: 2px dashed #d8c2be;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #eef3fb;
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
        }
        .uploadBox:hover { background: #e6ecf6; }
        .uploadBox.disabled { opacity: 0.6; pointer-events: none; }
        .uploadBox .material-symbols-outlined { font-size: 32px !important; color: #760009; margin-bottom: 8px; }
        .uploadBox .title { font-size: 14px; color: #0b1c30; font-weight: 600; margin: 0; }
        .uploadBox .sub { font-family: 'Work Sans', sans-serif; font-size: 11px; color: #59413e; opacity: .7; margin: 4px 0 0; }
        .uploadBox .file-name { font-size: 12px; color: #760009; font-weight: 600; margin-top: 6px; }
        .uploadBox .pickBtn { 
          margin-top: 12px; 
          padding: 6px 18px; 
          background: #0b1c30; 
          color: #f8f9ff; 
          border-radius: 9999px; 
          font-size: 11px; 
          font-weight: 700; 
          letter-spacing: .06em; 
          transition: background 0.15s;
        }
        .uploadBox:hover .pickBtn { background: #760009; }
        .uploadBox .uploading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          gap: 8px;
          z-index: 10;
        }
        .uploadBox .uploading-overlay .material-symbols-outlined {
          font-size: 24px !important;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .previewBox { 
          width: 160px; 
          height: 224px; 
          border-radius: 8px; 
          background: #e6ecf6; 
          border: 2px dashed #d8c2be; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          overflow: hidden; 
          position: relative; 
          flex-shrink: 0; 
        }
        .previewBox .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          gap: 8px;
        }
        .previewPlaceholder { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 8px; 
          color: rgba(89,65,62,.55); 
        }
        .previewPlaceholder .material-symbols-outlined { 
          font-size: 36px !important; 
        }
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
          gap: 16px; 
          padding-top: 32px; 
          border-top: 1px solid #d8c2be; 
        }
        .btn { 
          padding: 12px 32px; 
          border-radius: 8px; 
          font-weight: 700; 
          font-size: 14px; 
          letter-spacing: .02em; 
          transition: transform .1s,background .2s; 
          display: inline-flex; 
          align-items: center; 
          gap: 8px; 
        }
        .btn:active { transform: scale(.96); }
        .btn.outline { 
          border: 2px solid #760009; 
          color: #760009; 
          background: transparent; 
        }
        .btn.outline:hover { background: rgba(118,0,9,.05); }
        .btn.primary { 
          background: #760009; 
          color: #fff; 
          padding: 12px 40px; 
          box-shadow: 0 6px 16px rgba(118,0,9,.25); 
        }
        .btn.primary:hover { filter: brightness(1.1); }
        .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .crumbs { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          margin-bottom: 24px; 
          color: rgba(89,65,62,.7); 
          font-family: 'Work Sans', sans-serif; 
          font-size: 12px; 
          letter-spacing: .05em; 
        }
        .crumbs a:hover { color: #760009; }
        .crumbs .cur { color: #760009; font-weight: 600; }
        .crumbs .material-symbols-outlined { font-size: 16px !important; }
        .foot { 
          margin-top: 40px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          font-family: 'Work Sans', sans-serif; 
          font-size: 12px; 
          color: rgba(89,65,62,.55); 
          padding-bottom: 40px; 
        }
        .foot a:hover { color: #760009; }
        .foot .links { display: flex; gap: 16px; }
        @media (max-width: 900px) { 
          .grid { grid-template-columns: 1fr; } 
          .uploadRow { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <div className="flex flex-col">
        <div className="mb-4">
          <Link
            href="/admin/buku"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all text-white no-print"
            style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, #a3121b 100%)`,
            }}
          >
            <Icon name="arrow_back" /> Kembali
          </Link>
        </div>

        <nav className="crumbs">
          <Link href="/admin/dashboard">Dashboard</Link>
          <Icon name="chevron_right" />
          <Link href="/admin/buku">Manajemen Buku</Link>
          <Icon name="chevron_right" />
          <span className="cur">Edit Buku</span>
        </nav>

        <div className="card">
          <div className="cardHead">
            <div>
              <h2>Edit Informasi Buku</h2>
              <p>Perbarui data koleksi perpustakaan.</p>
            </div>
            <div className="badge">
              <span>KATEGORI: TERSEDIA</span>
            </div>
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
                  >
                    <span
                      className={form.kategori ? "selected" : "placeholder"}
                    >
                      {form.kategori || "Pilih Kategori"}
                    </span>
                    <span className={`arrow ${isDropdownOpen ? "open" : ""}`}>
                      <Icon name="expand_more" />
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div className="category-dropdown-menu">
                      {kategoriList.map((k) => (
                        <button
                          key={k}
                          type="button"
                          className={`category-item ${form.kategori === k ? "active" : ""}`}
                          onClick={() => handleCategorySelect(k)}
                        >
                          <span className="check">
                            <Icon name="check" />
                          </span>
                          {k}
                        </button>
                      ))}
                      <div className="category-divider" />
                      <button
                        type="button"
                        className="category-add-item"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push("/admin/buku/kategori");
                        }}
                      >
                        <Icon name="add" />
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
                  placeholder="Nama pengarang/instansi"
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
                  placeholder="2023"
                  value={form.tahun}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Jumlah Stok</label>
                <input
                  type="number"
                  name="stok"
                  placeholder="0"
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

              {/* Upload Sampul Buku */}
              <div className="field full" style={{ gap: 12 }}>
                <label>Sampul Buku</label>
                <div className="uploadRow">
                  <div className="previewBox">
                    {uploading ? (
                      <div className="loading-overlay">
                        <span className="material-symbols-outlined animate-spin">
                          sync
                        </span>
                        <span>Uploading...</span>
                      </div>
                    ) : preview ? (
                      <img src={preview} alt="preview" />
                    ) : (
                      <div className="previewPlaceholder">
                        <Icon name="add_photo_alternate" />
                        <span>PREVIEW SAMPUL</span>
                      </div>
                    )}
                  </div>
                  <label
                    className={`uploadBox ${uploading ? "disabled" : ""}`}
                    htmlFor="file-upload"
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageFile}
                      disabled={uploading}
                    />
                    <Icon name="cloud_upload" />
                    <p className="title">Klik untuk unggah sampul</p>
                    <p className="sub">JPG, PNG, WEBP (Maks. 2MB)</p>
                    <span className="pickBtn">
                      {uploading ? "Mengunggah..." : "Pilih File"}
                    </span>
                  </label>
                </div>
                {form.imageUrl && !uploading && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Icon name="check_circle" style={{ fontSize: 14 }} />
                    Gambar tersimpan di Cloudinary
                  </p>
                )}
              </div>

              {/* Upload PDF */}
              <div className="field full" style={{ gap: 12 }}>
                <label>Dokumen PDF (Opsional)</label>
                <div className="uploadRow">
                  <div className="flex-1 min-w-[200px] flex items-center gap-4">
                    <div className="flex-1">
                      <label
                        className={`uploadBox ${uploadingPdf ? "disabled" : ""}`}
                        htmlFor="pdf-upload"
                      >
                        <input
                          id="pdf-upload"
                          type="file"
                          accept=".pdf"
                          hidden
                          onChange={handlePdfFile}
                          disabled={uploadingPdf}
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
                <Icon name="close" /> Batal
              </Link>
              <button
                type="submit"
                className="btn primary"
                disabled={loading || uploading || uploadingPdf}
              >
                <Icon name="save" />
                {loading ? "Menyimpan..." : "Perbarui Data"}
              </button>
            </div>
          </form>
        </div>

        <div className="foot">
          <span>© 2024 Bagian Hukum - Ruang Baca JDIH</span>
          <div className="links">
            <a href="#">Panduan Admin</a>
            <a href="#">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </>
  );
}
