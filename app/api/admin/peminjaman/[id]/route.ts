// app/api/admin/peminjaman/[id]/route.ts
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

    // 🔥 Jika admin mengirim batasWaktu, proses status otomatis
    if (batasWaktu) {
      const newBatasWaktu = new Date(batasWaktu);
      updateData.batasWaktu = newBatasWaktu;

      // Jika status saat ini adalah "kembali", ubah jadi dipinjam/terlambat sesuai batasWaktu
      if (existing.status === "kembali") {
        // Jika batasWaktu baru > sekarang, status = dipinjam
        if (newBatasWaktu > now) {
          updateData.status = "dipinjam";
          updateData.tanggalKembali = null;
        } else {
          updateData.status = "terlambat";
          updateData.tanggalKembali = null;
        }
      } else {
        // Status sebelumnya dipinjam atau terlambat
        if (newBatasWaktu < now) {
          updateData.status = "terlambat";
        } else {
          updateData.status = "dipinjam";
        }
        // Reset tanggalKembali jika status bukan kembali
        if (updateData.status !== "kembali") {
          updateData.tanggalKembali = null;
        }
      }
    }

    // 🔥 Jika admin mengirim status manual, override dengan status manual (kecuali batasWaktu juga dikirim, maka batasWaktu lebih prioritas)
    if (status && !batasWaktu) {
      updateData.status = status;
      if (status === "kembali") {
        updateData.tanggalKembali = new Date();
      } else {
        updateData.tanggalKembali = null;
      }
    }

    // Jika status diubah menjadi "kembali" via batasWaktu logika (seharusnya tidak terjadi, tapi jaga-jaga)
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
