// components/visitor/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm">
      <div className="flex justify-between items-center h-16 px-margin-desktop max-w-container-max mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
            <img
              alt="KPU Logo"
              className="w-8 h-8 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaEI10cdBZv4uDUGm3hcfR9-mEXdoTsUeXSXFNi3RmPcpBBJXAbyQSWVSxruo6WM1WNtdx4zH_k7xAREAlJ7kpraIBtywmcYsqbUH8xlTbPmDzpONfx5gshisi_qefZLvo_2YBSUwd-pq-eWPJTl4F_BjJW0Zr4m0WEJXAOkiDD3BOJUA4B_T744lsaZXm0VVNmCERYIxpHo-M6F_avgoE-U5SI8kWAx3IDwszsMVZ_OJXExg6gZsM"
            />
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">
              Ruang Baca JDIH
            </h1>
          </div>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <Link
            href="/beranda"
            className={`${
              pathname === "/beranda"
                ? "text-primary border-b-2 border-primary font-bold pb-1"
                : "text-on-surface-variant hover:text-primary"
            } transition-all`}
          >
            Beranda
          </Link>
          <Link
            href="/katalog"
            className={`${
              pathname === "/katalog"
                ? "text-primary border-b-2 border-primary font-bold pb-1"
                : "text-on-surface-variant hover:text-primary"
            } transition-all`}
          >
            Katalog Buku
          </Link>
        </div>
        <Link
          href="/login"
          className="bg-primary text-on-primary px-4 py-2 rounded-xl hover:opacity-80 transition-all font-body-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">login</span>
          Admin Login
        </Link>
      </div>
    </header>
  );
}
