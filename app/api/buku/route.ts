import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const buku = await prisma.buku.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(buku);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
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
    } = body;

    if (!kodeBuku || !judul || !penulis) {
      return NextResponse.json(
        { error: "Kode Buku, Judul, dan Penulis wajib diisi" },
        { status: 400 },
      );
    }

    // Cek apakah kodeBuku sudah ada di database
    const existingBuku = await prisma.buku.findUnique({
      where: { kodeBuku },
    });

    if (existingBuku) {
      return NextResponse.json(
        { error: `Kode buku "${kodeBuku}" sudah ada. Gunakan kode lain!` },
        { status: 400 },
      );
    }

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
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Buku berhasil ditambahkan",
        data: bukuBaru,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error(error);
    // Fallback jika terjadi error Prisma P2002 (unique constraint) meskipun sudah dicek
    if (error.code === 'P2002' && error.meta?.target?.includes('kodeBuku')) {
      return NextResponse.json(
        { error: "Kode buku sudah ada. Gunakan kode lain!" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal menambah buku" },
      { status: 500 },
    );
  }
}