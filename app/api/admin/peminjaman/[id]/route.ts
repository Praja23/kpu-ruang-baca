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

    // 1. Ambil data peminjaman yang ada (termasuk relasi buku)
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

    // 2. Tentukan status baru
    // Prioritas: status manual > batasWaktu
    let newStatus: string | undefined;
    let newBatasWaktu: Date | undefined;
    let newTanggalKembali: Date | null | undefined;

    if (status) {
      // Jika ada status manual, pakai itu
      newStatus = status;
      if (status === "kembali") {
        newTanggalKembali = new Date();
      } else {
        newTanggalKembali = null;
      }
      // batasWaktu bisa tetap atau diupdate jika dikirim
      if (batasWaktu) {
        newBatasWaktu = new Date(batasWaktu);
      } else {
        newBatasWaktu = existing.batasWaktu;
      }
    } else if (batasWaktu) {
      // Jika tidak ada status manual, tentukan dari batasWaktu
      newBatasWaktu = new Date(batasWaktu);
      const now = new Date();
      if (existing.status === "kembali") {
        if (newBatasWaktu > now) {
          newStatus = "dipinjam";
          newTanggalKembali = null;
        } else {
          newStatus = "terlambat";
          newTanggalKembali = null;
        }
      } else {
        // status sebelumnya dipinjam/terlambat
        if (newBatasWaktu < now) {
          newStatus = "terlambat";
        } else {
          newStatus = "dipinjam";
        }
        if (newStatus !== "kembali") {
          newTanggalKembali = null;
        }
      }
    } else {
      // Tidak ada perubahan status atau batasWaktu
      return NextResponse.json(
        { error: "Tidak ada perubahan yang diminta" },
        { status: 400 },
      );
    }

    // 3. Validasi: jika newStatus = "dipinjam" dan bukuId ada, cek stok
    const oldStatus = existing.status;
    const bukuId = existing.bukuId;

    // Log untuk debug
    console.log(
      `[DEBUG PUT] oldStatus=${oldStatus}, newStatus=${newStatus}, bukuId=${bukuId}`,
    );

    // 🔥 4. Logika stok: hanya jika bukuId ada dan status berubah
    if (bukuId !== null) {
      // a. Dari kembali -> dipinjam : stok -1
      if (oldStatus === "kembali" && newStatus === "dipinjam") {
        const buku = await prisma.buku.findUnique({ where: { id: bukuId } });
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
          where: { id: bukuId },
          data: { stok: { decrement: 1 } },
        });
        console.log(`[DEBUG] Stok dikurangi 1, stok sekarang ${buku.stok - 1}`);
      }

      // b. Dari dipinjam/terlambat -> kembali : stok +1
      if (
        (oldStatus === "dipinjam" || oldStatus === "terlambat") &&
        newStatus === "kembali"
      ) {
        await prisma.buku.update({
          where: { id: bukuId },
          data: { stok: { increment: 1 } },
        });
        console.log(`[DEBUG] Stok ditambah 1`);
      }

      // c. Dari dipinjam -> terlambat : stok tetap (tidak berubah)
      // d. Dari terlambat -> dipinjam : stok tetap
      // e. Dari kembali -> terlambat? tidak mungkin karena kembali sudah selesai, tapi kita biarkan
    } else {
      console.log(`[DEBUG] bukuId null, lewati update stok`);
    }

    // 5. Update data peminjaman
    const updateData: any = {};
    if (newStatus !== undefined) updateData.status = newStatus;
    if (newBatasWaktu !== undefined) updateData.batasWaktu = newBatasWaktu;
    if (newTanggalKembali !== undefined)
      updateData.tanggalKembali = newTanggalKembali;

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
      include: { buku: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Peminjaman tidak ditemukan" },
        { status: 404 },
      );
    }

    // Kembalikan stok jika status masih dipinjam atau terlambat
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
