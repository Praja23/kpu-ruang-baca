import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const peminjamanId = parseInt(id);
    if (isNaN(peminjamanId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id: peminjamanId },
      include: {
        pengunjung: true,
        buku: true,
      },
    });

    if (!peminjaman) {
      return NextResponse.json(
        { error: "Peminjaman tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(peminjaman);
  } catch (error) {
    console.error("Error GET peminjaman detail:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail peminjaman" },
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
    const peminjamanId = parseInt(id);
    if (isNaN(peminjamanId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { batasWaktu, status } = body;

    const existing = await prisma.peminjaman.findUnique({
      where: { id: peminjamanId },
      include: { buku: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Peminjaman tidak ditemukan" },
        { status: 404 },
      );
    }

    const updateData: any = {};
    const now = new Date();
    const oldStatus = existing.status;

    // 🔥 1. Tentukan status dan batasWaktu baru
    if (batasWaktu) {
      const newBatasWaktu = new Date(batasWaktu);
      updateData.batasWaktu = newBatasWaktu;

      if (existing.status === "kembali") {
        if (newBatasWaktu > now) {
          updateData.status = "dipinjam";
          updateData.tanggalKembali = null;
        } else {
          updateData.status = "terlambat";
          updateData.tanggalKembali = null;
        }
      } else {
        if (newBatasWaktu < now) {
          updateData.status = "terlambat";
        } else {
          updateData.status = "dipinjam";
        }
        if (updateData.status !== "kembali") {
          updateData.tanggalKembali = null;
        }
      }
    }

    if (status && !batasWaktu) {
      updateData.status = status;
      if (status === "kembali") {
        updateData.tanggalKembali = new Date();
      } else {
        updateData.tanggalKembali = null;
      }
    }

    if (updateData.status === "kembali" && !updateData.tanggalKembali) {
      updateData.tanggalKembali = new Date();
    }

    // 🔥 2. Logika stok berdasarkan perubahan status
    const newStatus = updateData.status || existing.status;
    const isReturnToBorrow =
      oldStatus === "kembali" && newStatus === "dipinjam";
    const isBorrowToReturn =
      oldStatus === "dipinjam" && newStatus === "kembali";

    if (existing.bukuId) {
      if (isReturnToBorrow) {
        // Perpanjangan: stok harus berkurang
        const buku = await prisma.buku.findUnique({
          where: { id: existing.bukuId },
        });
        if (!buku) {
          return NextResponse.json(
            { error: "Buku tidak ditemukan" },
            { status: 404 },
          );
        }
        if (buku.stok <= 0) {
          return NextResponse.json(
            { error: "Stok buku habis, tidak dapat memperpanjang peminjaman" },
            { status: 400 },
          );
        }
        await prisma.buku.update({
          where: { id: existing.bukuId },
          data: { stok: { decrement: 1 } },
        });
      } else if (isBorrowToReturn) {
        // Pengembalian via edit: stok bertambah
        await prisma.buku.update({
          where: { id: existing.bukuId },
          data: { stok: { increment: 1 } },
        });
      }
    }

    // 🔥 3. Update peminjaman
    const updated = await prisma.peminjaman.update({
      where: { id: peminjamanId },
      data: updateData,
      include: {
        pengunjung: true,
        buku: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Peminjaman berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error PUT peminjaman:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui peminjaman" },
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
    const peminjamanId = parseInt(id);
    if (isNaN(peminjamanId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const existing = await prisma.peminjaman.findUnique({
      where: { id: peminjamanId },
      include: {
        buku: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Peminjaman tidak ditemukan" },
        { status: 404 },
      );
    }

    if (
      existing.bukuId &&
      (existing.status === "dipinjam" || existing.status === "terlambat")
    ) {
      await prisma.buku.update({
        where: { id: existing.bukuId },
        data: { stok: { increment: 1 } },
      });
    }

    await prisma.peminjaman.delete({
      where: { id: peminjamanId },
    });

    return NextResponse.json({
      success: true,
      message: "Peminjaman berhasil dihapus",
    });
  } catch (error) {
    console.error("Error DELETE peminjaman:", error);
    return NextResponse.json(
      { error: "Gagal menghapus peminjaman" },
      { status: 500 },
    );
  }
}
