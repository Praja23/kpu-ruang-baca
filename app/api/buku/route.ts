// app/api/buku/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper validasi panjang
const validateLength = (value: string | undefined | null, max: number, fieldName: string) => {
  if (value && value.length > max) {
    return { valid: false, field: fieldName, message: `${fieldName} terlalu panjang, maksimal ${max} karakter` };
  }
  return { valid: true };
};

export async function GET() {
  try {
    const buku = await prisma.buku.findMany({
      orderBy: { kodeBuku: "asc" },
    });
    return NextResponse.json(buku);
  } catch (error) {
    console.error("Error GET buku:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      kodeBuku,
      judul,
      penulis,
      kategori,
      tahun,
      stok,
      lokasiRak,
      imageUrl,
      deskripsi,
      pdfUrl,
    } = body;

    // Validasi wajib
    if (!kodeBuku || !judul || !penulis) {
      return NextResponse.json(
        { field: 'general', message: "Kode Buku, Judul, dan Penulis wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi panjang field
    const validations = [
      validateLength(kodeBuku, 50, 'Kode Buku'),
      validateLength(judul, 255, 'Judul Buku'),
      validateLength(penulis, 100, 'Penulis'),
      validateLength(kategori, 50, 'Kategori'),
      validateLength(tahun, 10, 'Tahun'),
      validateLength(lokasiRak, 50, 'Lokasi Rak'),
      validateLength(deskripsi, 1000, 'Deskripsi'), // asumsi max 1000
      validateLength(imageUrl, 500, 'URL Gambar'), // asumsi max 500
      validateLength(pdfUrl, 500, 'URL PDF'), // asumsi max 500
    ];

    for (const v of validations) {
      if (!v.valid) {
        return NextResponse.json(
          { field: v.field, message: v.message },
          { status: 400 }
        );
      }
    }

    // Cek duplikat kode
    const existing = await prisma.buku.findUnique({
      where: { kodeBuku },
    });
    if (existing) {
      return NextResponse.json(
        { field: 'kodeBuku', message: `Kode buku "${kodeBuku}" sudah digunakan. Gunakan kode lain!` },
        { status: 400 }
      );
    }

    // Simpan buku
    const bukuBaru = await prisma.buku.create({
      data: {
        kodeBuku,
        judul,
        penulis,
        kategori: kategori || null,
        tahun: tahun || null,
        stok: parseInt(stok) || 0,
        lokasiRak: lokasiRak || null,
        imageUrl: imageUrl || null,
        deskripsi: deskripsi || null,
        pdfUrl: pdfUrl || null,
      },
    });

    return NextResponse.json(
      { success: true, data: bukuBaru },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error POST buku:", error);
    // Error Prisma P2002 (unique constraint) — fallback
    if (error.code === "P2002") {
      return NextResponse.json(
        { field: 'kodeBuku', message: "Kode buku sudah digunakan. Gunakan kode lain!" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { field: 'general', message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}