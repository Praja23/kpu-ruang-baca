"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm h-16 flex items-center">
      <div className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto h-full">
        <div className="flex items-center gap-stack-md">
          <span className="font-headline-md text-headline-md font-bold text-primary">
            Ruang Baca JDIH
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all"
            href="/"
          >
            Beranda
          </Link>
          <Link
            className="font-body-md text-body-md text-primary border-b-2 border-primary font-bold pb-1 transition-all"
            href="/katalog"
          >
            Katalog Buku
          </Link>
          <Link
            href="/daftar"
            className="primary-gradient text-on-primary px-6 py-2 rounded-xl font-title-md text-title-md hover:opacity-90 active:opacity-80 transition-all"
          >
            Visitor Login
          </Link>
        </nav>
        <button className="md:hidden p-2 text-primary">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
}
