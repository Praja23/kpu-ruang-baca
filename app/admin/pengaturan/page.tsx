"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useToast } from "@/app/context/ToastContext";

const C = {
  primary: "#760009",
  onPrimary: "#ffffff",
  primaryContainer: "#ffdad6",
  onPrimaryContainer: "#410004",
  secondary: "#775652",
  onSecondaryContainer: "#2c1512",
  surface: "#f8f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f3fa",
  surfaceContainer: "#eceef4",
  surfaceContainerHigh: "#e6e7ee",
  onSurface: "#1c1b1f",
  onSurfaceVariant: "#534341",
  outline: "#85736f",
  outlineVariant: "#e7dedb",
  inverseSurface: "#313033",
  inverseOnSurface: "#f4eff4",
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

interface Admin {
  id: number;
  username: string;
  nama: string;
  role: string;
  imageUrl: string | null;
  createdAt: string;
}

interface Profile {
  id: number;
  username: string;
  nama: string;
  imageUrl: string | null;
  role: string;
}

export default function PengaturanPage() {
  const { showToast } = useToast();

  const [durasi, setDurasi] = useState<number>(72);
  const [loadingDurasi, setLoadingDurasi] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formNama, setFormNama] = useState("");
  const [formPasswordLama, setFormPasswordLama] = useState("");
  const [formPasswordBaru, setFormPasswordBaru] = useState("");
  const [formKonfirmasiPassword, setFormKonfirmasiPassword] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [modalUsername, setModalUsername] = useState("");
  const [modalNama, setModalNama] = useState("");
  const [modalPassword, setModalPassword] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    admin: Admin | null;
  }>({ isOpen: false, admin: null });

  const fetchDurasi = async () => {
    try {
      const res = await fetch("/api/admin/pengaturan?key=durasi_pinjam_jam");
      const data = await res.json();
      if (data.success && data.value) {
        setDurasi(parseInt(data.value));
      }
    } catch (error) {
      console.error("Gagal ambil durasi:", error);
    }
  };

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/admin/profile");
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFormNama(data.data.nama || "");
      } else {
        showToast(data.error || "Gagal ambil profil", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
      } else {
        showToast(data.error || "Gagal ambil daftar admin", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchDurasi();
    fetchProfile();
    fetchAdmins();
  }, []);

  const handleSaveDurasi = async () => {
    setLoadingDurasi(true);
    try {
      const res = await fetch("/api/admin/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "durasi_pinjam_jam",
          value: durasi.toString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Durasi peminjaman berhasil diperbarui", "success");
        await fetchDurasi();
      } else {
        showToast(data.error || "Gagal menyimpan durasi", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoadingDurasi(false);
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal upload foto");
    }
    const data = await res.json();
    return data.url;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadPhoto(file);
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Foto profil berhasil diperbarui", "success");
        await fetchProfile();
      } else {
        showToast(data.error || "Gagal update foto", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Gagal upload foto", "error");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdateProfile = async () => {
    if (formPasswordBaru && formPasswordBaru !== formKonfirmasiPassword) {
      showToast("Konfirmasi password tidak cocok", "error");
      return;
    }
    try {
      const body: any = { nama: formNama };
      if (formPasswordBaru) {
        body.passwordLama = formPasswordLama;
        body.passwordBaru = formPasswordBaru;
      }
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Profil berhasil diperbarui", "success");
        await fetchProfile();
        setFormPasswordLama("");
        setFormPasswordBaru("");
        setFormKonfirmasiPassword("");
      } else {
        showToast(data.error || "Gagal update profil", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    }
  };

  const handleAddAdmin = async () => {
    if (!modalUsername || !modalNama || !modalPassword) {
      showToast("Semua field wajib diisi", "error");
      return;
    }
    setModalLoading(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: modalUsername,
          nama: modalNama,
          password: modalPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Admin berhasil ditambahkan", "success");
        setShowModal(false);
        setModalUsername("");
        setModalNama("");
        setModalPassword("");
        fetchAdmins();
      } else {
        showToast(data.error || "Gagal tambah admin", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditAdmin = async () => {
    if (!editingAdmin) return;
    if (!modalNama) {
      showToast("Nama wajib diisi", "error");
      return;
    }
    setModalLoading(true);
    try {
      const body: any = { nama: modalNama };
      if (modalPassword) body.password = modalPassword;
      const res = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Admin berhasil diperbarui", "success");
        setShowModal(false);
        setEditingAdmin(null);
        setModalUsername("");
        setModalNama("");
        setModalPassword("");
        fetchAdmins();
      } else {
        showToast(data.error || "Gagal update admin", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (admins.length <= 1) {
      showToast("Tidak dapat menghapus admin terakhir", "error");
      closeDeleteModal();
      return;
    }
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Admin berhasil dihapus", "success");
        fetchAdmins();
        closeDeleteModal();
      } else {
        showToast(data.error || "Gagal hapus admin", "error");
        closeDeleteModal();
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
      closeDeleteModal();
    }
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setModalUsername(admin.username);
    setModalNama(admin.nama);
    setModalPassword("");
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingAdmin(null);
    setModalUsername("");
    setModalNama("");
    setModalPassword("");
    setShowModal(true);
  };

  const openDeleteModal = (admin: Admin) => {
    setDeleteModal({ isOpen: true, admin });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, admin: null });
  };

  const confirmDeleteAdmin = () => {
    if (!deleteModal.admin) return;
    handleDeleteAdmin(deleteModal.admin.id);
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
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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
        .modal-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              color: C.primary,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Pengaturan Sistem
          </h1>
          <p className="text-sm mt-1.5" style={{ color: C.onSurfaceVariant }}>
            Kelola konfigurasi perpustakaan dan informasi profil administrator
            di sini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Durasi Peminjaman */}
            <section
              className="p-6 rounded-2xl border animate-fade-up"
              style={{
                background: C.surfaceContainerLowest,
                borderColor: C.outlineVariant,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                animationDelay: "40ms",
              }}
            >
              <div
                className="flex items-center gap-3 mb-4"
                style={{ color: C.primary }}
              >
                <Icon name="schedule" />
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Durasi Peminjaman
                </h3>
              </div>
              <p
                className="text-[11px] uppercase tracking-wider mb-5 font-semibold"
                style={{ color: C.outline }}
              >
                Parameter Global
              </p>
              <div className="space-y-5">
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: C.outline }}
                  >
                    Durasi Peminjaman (Jam)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={durasi}
                      onChange={(e) => setDurasi(parseInt(e.target.value) || 0)}
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[rgba(118,0,9,0.15)]"
                      style={{
                        background: C.surfaceContainerLow,
                        borderColor: C.outlineVariant,
                        color: C.primary,
                        fontWeight: 600,
                      }}
                    />
                    <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm opacity-60"
                      style={{ color: C.onSurfaceVariant }}
                    >
                      jam
                    </span>
                  </div>
                  <p
                    className="mt-2 text-xs italic"
                    style={{ color: C.secondary }}
                  >
                    Standard default adalah 72 jam (3 hari).
                  </p>
                </div>
                <button
                  onClick={handleSaveDurasi}
                  disabled={loadingDurasi}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-70 hover:brightness-110"
                  style={{
                    background: `linear-gradient(135deg, ${C.primary}, #a3121b)`,
                    boxShadow: "0 6px 16px -4px rgba(118,0,9,0.35)",
                  }}
                >
                  {loadingDurasi ? "Menyimpan..." : "Simpan Durasi"}
                </button>
              </div>
            </section>

            {/* Help Center */}
            <section
              className="p-6 rounded-2xl relative overflow-hidden animate-fade-up"
              style={{
                background: C.primaryContainer,
                color: C.onPrimaryContainer,
                animationDelay: "80ms",
              }}
            >
              <div className="relative z-10">
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Pusat Bantuan
                </h3>
                <p className="text-sm opacity-90 mb-5">
                  Butuh bantuan teknis terkait pengaturan sistem perpustakaan?
                </p>
                <a
                  href="#"
                  className="inline-flex items-center font-bold text-sm hover:underline"
                  style={{ color: C.primary }}
                >
                  Hubungi IT Support
                  <Icon
                    name="arrow_forward"
                    className="ml-2"
                    style={{ fontSize: 16 }}
                  />
                </a>
              </div>
              <Icon
                name="support_agent"
                className="absolute -right-4 -bottom-4 opacity-10"
                style={{ fontSize: 160 }}
              />
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Profile Settings */}
            <section
              className="p-6 rounded-2xl border animate-fade-up"
              style={{
                background: C.surfaceContainerLowest,
                borderColor: C.outlineVariant,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                animationDelay: "60ms",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className="flex items-center gap-3"
                  style={{ color: C.primary }}
                >
                  <Icon name="person_outline" />
                  <h3
                    className="text-lg font-bold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Profil Administrator
                  </h3>
                </div>
                <span
                  className="px-3 py-1 text-[11px] rounded-full font-bold uppercase tracking-wider"
                  style={{
                    background: C.primaryContainer,
                    color: C.primary,
                  }}
                >
                  {profile?.role || "Admin"}
                </span>
              </div>

              {loadingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-11 w-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div>
                      <label
                        className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
                        style={{ color: C.outline }}
                      >
                        Username
                      </label>
                      <div
                        className="w-full border rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                        style={{
                          background: C.surfaceContainerLow,
                          borderColor: C.outlineVariant,
                          color: C.onSurface,
                        }}
                      >
                        {profile?.username || "—"}
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
                        style={{ color: C.outline }}
                      >
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={formNama}
                        onChange={(e) => setFormNama(e.target.value)}
                        className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[rgba(118,0,9,0.15)]"
                        style={{
                          background: C.surfaceContainerLow,
                          borderColor: C.outlineVariant,
                          color: C.onSurface,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed relative"
                    style={{
                      background: C.surfaceContainerLow,
                      borderColor: C.outlineVariant,
                    }}
                  >
                    <div
                      className="w-24 h-24 rounded-full mb-3 shadow-md overflow-hidden border-4"
                      style={{ borderColor: "#fff", background: "#fff" }}
                    >
                      {profile?.imageUrl ? (
                        <img
                          className="w-full h-full object-cover"
                          src={profile.imageUrl}
                          alt="Admin"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          <Icon name="person" style={{ fontSize: 36 }} />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="font-bold text-xs flex items-center transition-colors disabled:opacity-50 hover:underline"
                      style={{ color: C.primary }}
                    >
                      <Icon
                        name="photo_camera"
                        className="mr-1"
                        style={{ fontSize: 16 }}
                      />
                      {uploadingPhoto ? "Mengupload..." : "Ubah Foto"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              )}

              <div
                className="mt-6 pt-6 border-t flex justify-end"
                style={{ borderColor: C.outlineVariant }}
              >
                <button
                  onClick={handleUpdateProfile}
                  className="px-8 py-3 rounded-xl font-bold text-white transition-all active:scale-95 hover:brightness-110"
                  style={{
                    background: `linear-gradient(135deg, ${C.primary}, #a3121b)`,
                    boxShadow: "0 6px 16px -4px rgba(118,0,9,0.35)",
                  }}
                >
                  Perbarui Profil
                </button>
              </div>
            </section>

            {/* Security Settings */}
            <section
              className="p-6 rounded-2xl border animate-fade-up"
              style={{
                background: C.surfaceContainerLowest,
                borderColor: C.outlineVariant,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                animationDelay: "100ms",
              }}
            >
              <div
                className="flex items-center gap-3 mb-6"
                style={{ color: C.primary }}
              >
                <Icon name="lock_reset" />
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Keamanan & Password
                </h3>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
                      style={{ color: C.outline }}
                    >
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      value={formPasswordLama}
                      onChange={(e) => setFormPasswordLama(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[rgba(118,0,9,0.15)]"
                      style={{
                        background: C.surfaceContainerLow,
                        borderColor: C.outlineVariant,
                        color: C.onSurface,
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
                      style={{ color: C.outline }}
                    >
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={formPasswordBaru}
                      onChange={(e) => setFormPasswordBaru(e.target.value)}
                      placeholder="Min. 8 karakter"
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[rgba(118,0,9,0.15)]"
                      style={{
                        background: C.surfaceContainerLow,
                        borderColor: C.outlineVariant,
                        color: C.onSurface,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
                      style={{ color: C.outline }}
                    >
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={formKonfirmasiPassword}
                      onChange={(e) =>
                        setFormKonfirmasiPassword(e.target.value)
                      }
                      placeholder="Ulangi password baru"
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[rgba(118,0,9,0.15)]"
                      style={{
                        background: C.surfaceContainerLow,
                        borderColor: C.outlineVariant,
                        color: C.onSurface,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                className="mt-6 pt-6 border-t flex items-center justify-between flex-wrap gap-3"
                style={{ borderColor: C.outlineVariant }}
              >
                <p className="text-xs" style={{ color: C.secondary }}>
                  Biarkan kosong jika tidak ingin mengubah password
                </p>
                <button
                  onClick={handleUpdateProfile}
                  className="px-8 py-3 rounded-xl font-bold border-2 transition-all active:scale-95 hover:bg-[rgba(118,0,9,0.04)]"
                  style={{
                    borderColor: C.primary,
                    color: C.primary,
                    background: "transparent",
                  }}
                >
                  Ganti Password
                </button>
              </div>
            </section>

            {/* Kelola Admin */}
            <section
              className="p-6 rounded-2xl border animate-fade-up"
              style={{
                background: C.surfaceContainerLowest,
                borderColor: C.outlineVariant,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                animationDelay: "140ms",
              }}
            >
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div
                  className="flex items-center gap-3"
                  style={{ color: C.primary }}
                >
                  <Icon name="admin_panel_settings" />
                  <h3
                    className="text-lg font-bold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Kelola Admin
                  </h3>
                </div>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${C.primary}, #a3121b)`,
                    boxShadow: "0 6px 16px -4px rgba(118,0,9,0.35)",
                  }}
                >
                  <Icon name="add" style={{ fontSize: 18 }} />
                  Tambah Admin
                </button>
              </div>

              {loadingAdmins ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                      <div className="flex gap-2 ml-auto">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : admins.length === 0 ? (
                <div className="py-12 text-center">
                  <Icon
                    name="admin_panel_settings"
                    style={{ fontSize: 40, color: C.outline }}
                  />
                  <p
                    className="mt-3 text-sm font-medium"
                    style={{ color: C.outline }}
                  >
                    Belum ada admin
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead style={{ background: C.surfaceContainerLow }}>
                      <tr>
                        {[
                          "Foto",
                          "Username",
                          "Nama",
                          "Role",
                          "Dibuat",
                          "Aksi",
                        ].map((h) => (
                          <th
                            key={h}
                            className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider ${
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
                      {admins.map((admin) => (
                        <tr
                          key={admin.id}
                          className="transition-colors duration-150 hover:bg-[rgba(118,0,9,0.03)]"
                          style={{
                            borderTop: `1px solid ${C.outlineVariant}`,
                          }}
                        >
                          <td className="px-4 py-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                              {admin.imageUrl ? (
                                <img
                                  src={admin.imageUrl}
                                  alt={admin.nama}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Icon
                                  name="person"
                                  style={{ fontSize: 20, color: "#999" }}
                                />
                              )}
                            </div>
                          </td>
                          <td
                            className="px-4 py-3 text-sm font-semibold"
                            style={{ color: C.onSurface }}
                          >
                            {admin.username}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: C.onSurfaceVariant }}
                          >
                            {admin.nama}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                              style={{
                                background: C.primaryContainer,
                                color: C.primary,
                              }}
                            >
                              {admin.role}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: C.onSurfaceVariant }}
                          >
                            {new Date(admin.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => openEditModal(admin)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-black/5"
                                style={{ color: C.primary }}
                                title="Edit"
                              >
                                <Icon name="edit" style={{ fontSize: 18 }} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(admin)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-50"
                                style={{ color: "#dc2626" }}
                                title="Hapus"
                              >
                                <Icon name="delete" style={{ fontSize: 18 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit Admin */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            style={{ animation: "scaleIn 0.25s cubic-bezier(0.22,1,0.36,1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-xl font-bold mb-5"
              style={{
                color: C.onSurface,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {editingAdmin ? "Edit Admin" : "Tambah Admin Baru"}
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: C.outline }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={modalUsername}
                  onChange={(e) => setModalUsername(e.target.value)}
                  disabled={!!editingAdmin}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-60"
                  style={{
                    background: editingAdmin
                      ? C.surfaceContainerLow
                      : C.surfaceContainerLowest,
                    borderColor: C.outlineVariant,
                    color: C.onSurface,
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: C.outline }}
                >
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={modalNama}
                  onChange={(e) => setModalNama(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: C.surfaceContainerLowest,
                    borderColor: C.outlineVariant,
                    color: C.onSurface,
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: C.outline }}
                >
                  {editingAdmin
                    ? "Password Baru (kosongkan jika tidak diubah)"
                    : "Password"}
                </label>
                <input
                  type="password"
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  placeholder={
                    editingAdmin
                      ? "Kosongkan jika tidak diubah"
                      : "Min. 8 karakter"
                  }
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: C.surfaceContainerLowest,
                    borderColor: C.outlineVariant,
                    color: C.onSurface,
                  }}
                />
              </div>
            </div>
            <div
              className="flex justify-end gap-3 mt-6 pt-4 border-t"
              style={{ borderColor: C.outlineVariant }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-sm border transition-all"
                style={{
                  borderColor: C.outlineVariant,
                  color: C.onSurfaceVariant,
                }}
              >
                Batal
              </button>
              <button
                onClick={editingAdmin ? handleEditAdmin : handleAddAdmin}
                disabled={modalLoading}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-70 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${C.primary}, #a3121b)`,
                }}
              >
                {modalLoading
                  ? "Menyimpan..."
                  : editingAdmin
                    ? "Simpan Perubahan"
                    : "Tambah Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Admin */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            style={{ animation: "scaleIn 0.25s cubic-bezier(0.22,1,0.36,1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "#fee2e2" }}
              >
                <Icon
                  name="delete_forever"
                  style={{ fontSize: 40, color: "#dc2626" }}
                />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{
                  color: C.onSurface,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Hapus Admin?
              </h3>
              <p className="text-sm mb-6" style={{ color: C.onSurfaceVariant }}>
                Anda yakin ingin menghapus admin
                <br />
                <strong style={{ color: C.primary }}>
                  “{deleteModal.admin?.nama}”
                </strong>
                ?
                <br />
                <span style={{ color: "#ba1a1a", fontSize: 13 }}>
                  Tindakan ini tidak dapat dibatalkan.
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-6 py-2.5 rounded-xl font-medium border transition-all"
                  style={{
                    borderColor: C.outlineVariant,
                    color: C.onSurfaceVariant,
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteAdmin}
                  className="px-6 py-2.5 rounded-xl font-bold text-white transition-all"
                  style={{ background: "#dc2626" }}
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
