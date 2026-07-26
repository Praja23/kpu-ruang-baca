import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bukuId = parseInt(id);
    if (isNaN(bukuId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }
    const buku = await prisma.buku.findUnique({
      where: { id: bukuId },
    });
    if (!buku) {
      return NextResponse.json(
        { error: "Buku tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json(buku);
  } catch (error) {
    console.error("Error GET detail buku:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
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
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
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
    } = body;

    if (!kodeBuku || !judul || !penulis) {
      return NextResponse.json(
        { error: "Kode Buku, Judul, dan Penulis wajib diisi" },
        { status: 400 },
      );
    }

    // Cek apakah buku dengan id tersebut ada
    const existing = await prisma.buku.findUnique({
      where: { id: bukuId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Buku tidak ditemukan" },
        { status: 404 },
      );
    }

    // CEK DUPLIKAT KODE BUKU (kecuali untuk buku itu sendiri)
    const bukuDenganKodeSama = await prisma.buku.findFirst({
      where: {
        kodeBuku: kodeBuku,
        NOT: {
          id: bukuId,
        },
      },
    });

    if (bukuDenganKodeSama) {
      return NextResponse.json(
        {
          error: `Kode buku "${kodeBuku}" sudah digunakan oleh buku lain. Gunakan kode lain!`,
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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Buku berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error PUT buku:", error);
    // Fallback jika terjadi error Prisma P2002 (unique constraint) meskipun sudah dicek
    if (error.code === "P2002" && error.meta?.target?.includes("kodeBuku")) {
      return NextResponse.json(
        {
          error: "Kode buku sudah digunakan oleh buku lain. Gunakan kode lain!",
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal memperbarui buku" },
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
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const existing = await prisma.buku.findUnique({
      where: { id: bukuId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Buku tidak ditemukan" },
        { status: 404 },
      );
    }

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
      { error: "Gagal menghapus buku" },
      { status: 500 },
    );
  }
}
