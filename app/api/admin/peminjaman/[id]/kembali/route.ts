// app/api/admin/peminjaman/[id]/kembali/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const peminjamanId = parseInt(id);
    if (isNaN(peminjamanId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const existing = await prisma.peminjaman.findUnique({
      where: { id: peminjamanId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Peminjaman tidak ditemukan" },
        { status: 404 },
      );
    }

    if (existing.status === "kembali") {
      return NextResponse.json(
        { error: "Buku sudah dikembalikan" },
        { status: 400 },
      );
    }

    const now = new Date();
    const updated = await prisma.peminjaman.update({
      where: { id: peminjamanId },
      data: {
        status: "kembali",
        tanggalKembali: now,
      },
    });

    // Update stok buku (tambah 1)
    await prisma.buku.update({
      where: { id: existing.bukuId },
      data: { stok: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: "Buku berhasil dikembalikan",
      data: updated,
    });
  } catch (error) {
    console.error("Error kembali peminjaman:", error);
    return NextResponse.json(
      { error: "Gagal mengembalikan buku" },
      { status: 500 },
    );
  }
}
