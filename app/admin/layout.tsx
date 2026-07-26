"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ======================== Warna =========================
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

// ======================== Tipe Notifikasi =========================
type Notification = {
  id: string;
  title: string;
  desc: string;
  time: string;
};

// ======================== Context Notifikasi =========================
const NotificationContext = createContext<{
  notifications: Notification[];
  addNotification: (title: string, desc: string) => void;
  markAllRead: () => void;
} | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Gagal fetch notifikasi:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (title: string, desc: string) => {
    // Tidak digunakan, dipertahankan untuk kompatibilitas
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications/mark-read", {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Gagal mark read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ======================== Komponen Ikon =========================
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

// ======================== Profile Sidebar =========================
function ProfileSidebar({ collapsed }: { collapsed: boolean }) {
  const [profile, setProfile] = useState<{
    username: string;
    nama: string;
    imageUrl?: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/admin/profile");
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
        }
      } catch (error) {
        console.error("Gagal ambil profil:", error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-2xl transition-all duration-300 ${
        collapsed ? "justify-center p-2" : "p-3"
      }`}
      style={{ background: C.surfaceContainerLow }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
       <div
  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
  style={{
    background: C.primary,
    boxShadow: `0 0 0 2px ${C.surfaceContainerLow}, 0 0 0 4px ${C.primaryContainer}`,
  }}
>
          {profile?.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            profile?.nama?.charAt(0)?.toUpperCase() || "A"
          )}
        </div>
        {/* Online indicator */}
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
          style={{
            background: "#22c55e",
            borderColor: C.surfaceContainerLow,
          }}
        />
      </div>

      {/* Info */}
      {!collapsed && (
        <div className="flex-1 min-w-0 animate-fade-in">
          <div
            className="text-sm font-semibold truncate"
            style={{ color: C.onSurface }}
          >
            {profile?.nama || "Administrator"}
          </div>
          <div className="text-xs truncate" style={{ color: C.outline }}>
            @{profile?.username || "admin"}
          </div>
        </div>
      )}

      {/* Logout */}
      {!collapsed && (
        <button
          onClick={handleLogout}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ color: C.outline }}
          title="Logout"
        >
          <Icon name="logout" style={{ fontSize: 20 }} />
        </button>
      )}

      {/* Tooltip saat collapsed */}
      {collapsed && (
        <div
          className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg"
          style={{ background: C.onSurface, color: C.surfaceContainerLowest }}
        >
          {profile?.nama || "Administrator"}
        </div>
      )}
    </div>
  );
}

// ======================== Sidebar =========================
function Sidebar({
  currentPath,
  collapsed,
  setCollapsed,
}: {
  currentPath: string;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const items = [
    { icon: "dashboard", label: "Dashboard", href: "/admin/dashboard" },
    { icon: "menu_book", label: "Manajemen Buku", href: "/admin/buku" },
    { icon: "sync_alt", label: "Peminjaman", href: "/admin/peminjaman" },
    { icon: "person_search", label: "Pengunjung", href: "/admin/pengunjung" },
    { icon: "bar_chart", label: "Laporan", href: "/admin/laporan" },
    { icon: "settings", label: "Pengaturan", href: "/admin/pengaturan" },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen border-r flex flex-col z-40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
      style={{
        background: C.surfaceContainerLowest,
        borderColor: C.outlineVariant,
      }}
    >
      {/* Header Sidebar */}
      <div
        className={`border-b flex items-center gap-3 transition-all duration-300 ${
          collapsed ? "p-4 justify-center" : "p-5"
        }`}
        style={{ borderColor: C.outlineVariant }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0 shadow-md"
          style={{ background: C.primary }}
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8wtweayWAJbLrAS-35eWBgjCkYEgILi0bCjHiIEIpmw&s=10"
            alt="KPU"
            className="w-full h-full object-cover"
          />
        </div>

        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <div
              className="font-bold text-sm tracking-tight"
              style={{ color: C.onSurface, fontFamily: "Plus Jakarta Sans" }}
            >
              JDIH KPU
            </div>
            <div className="text-xs font-medium" style={{ color: C.outline }}>
              Ruang Baca
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {items.map((it) => {
          const active =
            currentPath === it.href || currentPath.startsWith(it.href + "/");

          return (
            <Link
              key={it.label}
              href={it.href}
              className={`group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? "justify-center px-0 py-3" : "px-3.5 py-3"
              }`}
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${C.primaryContainer} 0%, rgba(255,218,214,0.6) 100%)`,
                      color: C.primary,
                      boxShadow: "0 2px 8px -2px rgba(118,0,9,0.15)",
                    }
                  : { color: C.onSurfaceVariant }
              }
            >
              {/* Active indicator */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: C.primary }}
                />
              )}

              <Icon
                name={it.icon}
                className={`transition-transform duration-200 ${
                  active ? "scale-110" : "group-hover:scale-110"
                }`}
                style={{ fontSize: 22 }}
              />

              {!collapsed && (
                <span className="truncate animate-fade-in">{it.label}</span>
              )}

              {/* Tooltip collapsed */}
              {collapsed && (
                <div
                  className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 shadow-lg"
                  style={{
                    background: C.onSurface,
                    color: C.surfaceContainerLowest,
                  }}
                >
                  {it.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: C.surfaceContainerLow,
            color: C.onSurfaceVariant,
          }}
        >
          <Icon
            name={collapsed ? "chevron_right" : "chevron_left"}
            style={{ fontSize: 18 }}
          />
          {!collapsed && <span>Ciutkan</span>}
        </button>
      </div>

      {/* Profile */}
      <div
        className={`border-t transition-all duration-300 ${
          collapsed ? "p-2" : "p-3"
        }`}
        style={{ borderColor: C.outlineVariant }}
      >
        <ProfileSidebar collapsed={collapsed} />
      </div>
    </aside>
  );
}

// ======================== TopBar =========================
function TopBar() {
  const [time, setTime] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, markAllRead } = useNotification();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const wib = now.toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const jam = now.toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(`${wib} • ${jam} WIB`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const count = notifications.length;
  const countLabel = count > 9 ? "9+" : count;

  return (
    <header
      className="sticky top-0 h-[72px] border-b flex items-center justify-end px-6 z-30 backdrop-blur-md"
      style={{
        background: "rgba(255,255,255,0.85)",
        borderColor: C.outlineVariant,
      }}
    >
      <style>{`
        @keyframes notifRing {
          0% { box-shadow: 0 0 0 0 rgba(118,0,9,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(118,0,9,0); }
          100% { box-shadow: 0 0 0 0 rgba(118,0,9,0); }
        }
        @keyframes notifBadgePop {
          0% { transform: scale(0); }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes notifItemIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-6px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .notif-bell-active { animation: notifRing 2.4s ease-out infinite; }
        .notif-badge { animation: notifBadgePop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .notif-item { animation: notifItemIn 0.3s ease-out both; }
        .animate-fade-in { animation: fadeIn 0.25s ease-out both; }
      `}</style>

      <div className="flex items-center gap-3">
        {/* Notifikasi */}
        <div className="relative" ref={notifRef}>
          <button
            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              notifOpen ? "scale-95" : "hover:scale-105"
            }`}
            style={{
              color: notifOpen ? C.primary : C.onSurfaceVariant,
              background: notifOpen ? C.primaryContainer : "transparent",
            }}
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifikasi"
          >
            <span className={count > 0 ? "notif-bell-active rounded-full" : ""}>
              <Icon name="notifications" style={{ fontSize: 22 }} />
            </span>
            {count > 0 && (
              <span
                className="notif-badge absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2"
                style={{
                  background: "linear-gradient(135deg,#991b1b,#760009)",
                  borderColor: "#ffffff",
                }}
              >
                {countLabel}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          <div
            className="absolute right-0 top-full mt-3 w-[400px] max-h-[520px] overflow-hidden rounded-2xl border z-50 flex flex-col transition-all duration-250 origin-top-right"
            style={{
              borderColor: C.outlineVariant,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 25px 50px -12px rgba(118,0,9,0.18), 0 8px 16px -6px rgba(0,0,0,0.08)",
              opacity: notifOpen ? 1 : 0,
              transform: notifOpen
                ? "scale(1) translateY(0)"
                : "scale(0.94) translateY(-10px)",
              pointerEvents: notifOpen ? "auto" : "none",
            }}
          >
            {/* Header */}
            <div
              className="flex justify-between items-center px-5 py-4 border-b"
              style={{
                borderColor: C.outlineVariant,
                background:
                  "linear-gradient(135deg, rgba(118,0,9,0.06), rgba(118,0,9,0))",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="font-bold text-[15px]"
                  style={{
                    color: C.onSurface,
                    fontFamily: "Plus Jakarta Sans",
                  }}
                >
                  Notifikasi
                </span>
                {count > 0 && (
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ background: C.primary }}
                  >
                    {count} baru
                  </span>
                )}
              </div>
              {count > 0 && (
                <button
                  onClick={() => {
                    markAllRead();
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:bg-white active:scale-95"
                  style={{ color: C.primary }}
                >
                  <Icon name="done_all" style={{ fontSize: 16 }} />
                  Tandai semua
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-2.5">
              {count === 0 ? (
                <div className="px-6 py-16 text-center flex flex-col items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: C.surfaceContainerLow }}
                  >
                    <Icon
                      name="notifications_off"
                      style={{ fontSize: 32, color: C.outline }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: C.onSurface }}
                    >
                      Semua sudah beres
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: C.outline }}>
                      Belum ada notifikasi baru saat ini.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((n, idx) => (
                    <div
                      key={n.id}
                      className="notif-item group relative flex gap-3.5 px-3.5 py-3.5 rounded-xl hover:bg-[rgba(118,0,9,0.04)] transition-all duration-150 cursor-default"
                      style={{ animationDelay: `${idx * 45}ms` }}
                    >
                      <span
                        className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: C.primary }}
                      />
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm"
                        style={{
                          background: C.primaryContainer,
                          color: C.primary,
                        }}
                      >
                        <Icon name="menu_book" style={{ fontSize: 20 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold leading-snug"
                          style={{ color: C.onSurface }}
                        >
                          {n.title}
                        </p>
                        <p
                          className="text-xs mt-1 leading-relaxed"
                          style={{ color: C.onSurfaceVariant }}
                        >
                          {n.desc}
                        </p>
                        <p
                          className="text-[11px] mt-2 flex items-center gap-1.5"
                          style={{ color: C.outline }}
                        >
                          <Icon name="schedule" style={{ fontSize: 13 }} />
                          {n.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-8 w-px mx-1"
          style={{ background: C.outlineVariant }}
        />

        {/* Clock */}
        <div className="text-right pr-1">
          <div
            className="text-[13px] font-semibold tracking-tight"
            style={{ color: C.onSurface }}
          >
            {time}
          </div>
        </div>
      </div>
    </header>
  );
}

// ======================== Fungsi Logout =========================
async function handleLogout() {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });
    if (res.ok) {
      window.location.href = "/login";
    } else {
      console.error("Logout gagal");
    }
  } catch (error) {
    console.error("Error saat logout:", error);
  }
}

// ======================== Layout Utama =========================
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <NotificationProvider>
      {/* Fonts & Icons */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined"
      />

      <div
        className="min-h-screen"
        style={{ background: C.surface, fontFamily: "Inter, sans-serif" }}
      >
        <Sidebar
          currentPath={pathname}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main
          className={`min-h-screen flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            collapsed ? "ml-[72px]" : "ml-64"
          }`}
        >
          <TopBar />
          <div className="p-6 md:p-8 max-w-[1440px] w-full mx-auto flex-1">
            {children}
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}
