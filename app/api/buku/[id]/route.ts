// app/api/buku/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper validasi panjang (sama seperti di POST)
const validateLength = (
  value: string | undefined | null,
  max: number,
  fieldName: string,
) => {
  if (value && value.length > max) {
    return {
      valid: false,
      field: fieldName,
      message: `${fieldName} terlalu panjang, maksimal ${max} karakter`,
    };
  }
  return { valid: true };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bukuId = parseInt(id);
    if (isNaN(bukuId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }
    const buku = await prisma.buku.findUnique({
      where: { id: bukuId },
    });
    if (!buku) {
      return NextResponse.json(
        { message: "Buku tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json(buku);
  } catch (error) {
    console.error("Error GET detail buku:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bukuId = parseInt(id);
    if (isNaN(bukuId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

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
        { message: "Kode Buku, Judul, dan Penulis wajib diisi" },
        { status: 400 },
      );
    }

    // Validasi panjang field
    const validations = [
      validateLength(kodeBuku, 50, "Kode Buku"),
      validateLength(judul, 255, "Judul Buku"),
      validateLength(penulis, 100, "Penulis"),
      validateLength(kategori, 50, "Kategori"),
      validateLength(tahun, 10, "Tahun"),
      validateLength(lokasiRak, 50, "Lokasi Rak"),
      validateLength(deskripsi, 1000, "Deskripsi"),
      validateLength(imageUrl, 500, "URL Gambar"),
      validateLength(pdfUrl, 500, "URL PDF"),
    ];

    for (const v of validations) {
      if (!v.valid) {
        return NextResponse.json(
          { field: v.field, message: v.message },
          { status: 400 },
        );
      }
    }

    // Cek apakah buku ada
    const existing = await prisma.buku.findUnique({
      where: { id: bukuId },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Buku tidak ditemukan" },
        { status: 404 },
      );
    }

    // Cek duplikat kode (kecuali dirinya sendiri)
    const duplicate = await prisma.buku.findFirst({
      where: {
        kodeBuku: kodeBuku,
        NOT: { id: bukuId },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        {
          field: "kodeBuku",
          message: `Kode buku "${kodeBuku}" sudah digunakan oleh buku lain.`,
        },
        { status: 400 },
      );
    }

    // Update buku
    const updated = await prisma.buku.update({
      where: { id: bukuId },
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

    return NextResponse.json({
      success: true,
      message: "Buku berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error PUT buku:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          field: "kodeBuku",
          message: "Kode buku sudah digunakan oleh buku lain.",
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Gagal memperbarui buku" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bukuId = parseInt(id);
    if (isNaN(bukuId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const existing = await prisma.buku.findUnique({
      where: { id: bukuId },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Buku tidak ditemukan" },
        { status: 404 },
      );
    }

    // Hapus buku — Prisma otomatis set bukuId = NULL di Peminjaman
    await prisma.buku.delete({
      where: { id: bukuId },
    });

    return NextResponse.json({
      success: true,
      message: "Buku berhasil dihapus",
    });
  } catch (error) {
    console.error("Error DELETE buku:", error);
    return NextResponse.json(
      { message: "Gagal menghapus buku" },
      { status: 500 },
    );
  }
}
