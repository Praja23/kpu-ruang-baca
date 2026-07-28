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
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Peminjaman tidak ditemukan" },
        { status: 404 },
      );
    }

    const updateData: any = {};
    const now = new Date();

    // Jika admin mengirim batasWaktu, proses status otomatis
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

    // Jika admin mengirim status manual (tanpa batasWaktu)
    if (status && !batasWaktu) {
      updateData.status = status;
      if (status === "kembali") {
        updateData.tanggalKembali = new Date();
      } else {
        updateData.tanggalKembali = null;
      }
    }

    // Jaga-jaga jika status jadi kembali tapi tanggalKembali null
    if (updateData.status === "kembali" && !updateData.tanggalKembali) {
      updateData.tanggalKembali = new Date();
    }

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

// ✅ TAMBAHKAN DELETE
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

    // 🔥 KEMBALIKAN STOK BUKU JIKA STATUSNYA DIPINJAM ATAU TERLAMBAT
    if (
      existing.bukuId &&
      (existing.status === "dipinjam" || existing.status === "terlambat")
    ) {
      await prisma.buku.update({
        where: { id: existing.bukuId },
        data: { stok: { increment: 1 } },
      });
    }

    // Hapus peminjaman
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
