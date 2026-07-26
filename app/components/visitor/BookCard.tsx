"use client";

import Link from "next/link";
import Image from "next/image";

interface Buku {
  id: number;
  kodeBuku: string;
  judul: string;
  penulis: string;
  kategori: string;
  deskripsi: string | null;
  imageUrl: string | null;
  stok: number;
  lokasiRak: string | null;
}

export default function BookCard({ buku }: { buku: Buku }) {
  const status = {
    label: buku.stok > 0 ? "Tersedia" : "Dipinjam",
    color:
      buku.stok > 0
        ? "bg-emerald-100 text-emerald-800"
        : "bg-orange-100 text-orange-800",
    dot: buku.stok > 0 ? "bg-emerald-600" : "bg-orange-600",
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-outline-variant book-card-hover transition-all duration-300 group flex flex-col h-full">
      <div className="relative h-72 w-full bg-surface-variant overflow-hidden">
        {buku.imageUrl ? (
          <Image
            src={buku.imageUrl}
            alt={buku.judul}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/10 to-primary/5">
            <span className="text-primary text-6xl material-symbols-outlined">
              book
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span
            className={`${status.color} px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1`}
          >
            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
            {status.label}
          </span>
        </div>
      </div>
      <div className="p-stack-md flex flex-col flex-grow">
        <span className="text-label-sm font-label-sm text-secondary mb-2 block uppercase tracking-wider">
          {buku.kategori}
        </span>
        <h3 className="font-title-lg text-title-lg text-primary mb-1 line-clamp-2">
          {buku.judul}
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
          Oleh: {buku.penulis}
        </p>
        <div className="mt-auto pt-4 border-t border-surface-variant flex gap-2">
          <Link
            href={`/katalog/${buku.id}`}
            className={`flex-grow text-center py-3 rounded-lg font-title-md text-title-md shadow-sm transition-all hover:opacity-90 ${
              buku.stok > 0
                ? "primary-gradient text-on-primary"
                : "bg-surface-container-high text-on-surface-variant hover:bg-outline-variant/30"
            }`}
          >
            {buku.stok > 0 ? "Detail & Pinjam" : "Cek Jadwal Balik"}
          </Link>
          <button
            className="p-3 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors"
            title="Bookmark"
          >
            <span className="material-symbols-outlined">bookmark</span>
          </button>
        </div>
      </div>
    </div>
  );
}
