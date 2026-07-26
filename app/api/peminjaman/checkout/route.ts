// app/api/peminjaman/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, noHp, nik, alamat, bukuIds } = body;

    if (!nama || !noHp || !bukuIds || bukuIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama, No HP, dan minimal 1 buku wajib diisi",
        },
        { status: 400 },
      );
    }

    const bukuList = await prisma.buku.findMany({
      where: { id: { in: bukuIds } },
    });

    if (bukuList.length !== bukuIds.length) {
      return NextResponse.json(
        { success: false, error: "Ada buku yang tidak ditemukan" },
        { status: 404 },
      );
    }

    for (const buku of bukuList) {
      if (buku.stok <= 0) {
        return NextResponse.json(
          { success: false, error: `Stok buku "${buku.judul}" habis` },
          { status: 400 },
        );
      }
    }

    let pengunjung;
    if (nik) {
      pengunjung = await prisma.pengunjung.findUnique({
        where: { nik },
      });
    }

    if (!pengunjung) {
      pengunjung = await prisma.pengunjung.create({
        data: {
          nama,
          noHp,
          nik: nik || null,
          alamat: alamat || "",
          tujuan: "bawa_keluar",
        },
      });
    }

    const setting = await prisma.pengaturan.findUnique({
      where: { key: "durasi_pinjam_jam" },
    });
    const durasiJam = setting ? parseInt(setting.value) : 2;

    const now = new Date();
    const peminjamanList = [];

    for (const bukuId of bukuIds) {
      const batasWaktu = new Date(now.getTime() + durasiJam * 60 * 60 * 1000);

      const peminjaman = await prisma.peminjaman.create({
        data: {
          pengunjungId: pengunjung.id,
          bukuId: bukuId,
          durasiJam,
          batasWaktu,
          status: "dipinjam",
        },
      });

      await prisma.buku.update({
        where: { id: bukuId },
        data: { stok: { decrement: 1 } },
      });

      peminjamanList.push(peminjaman);
    }

    // 🔥 Perbaikan: batasWaktu di root agar mudah diakses
    return NextResponse.json(
      {
        success: true,
        message: `Berhasil meminjam ${peminjamanList.length} buku`,
        batasWaktu: peminjamanList[0]?.batasWaktu,
        data: {
          pengunjung,
          peminjaman: peminjamanList,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error checkout:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
