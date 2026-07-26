// app/api/pengunjung/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { nama, noHp, nik, alamat, tujuan, bukuId } = body;

    if (!nama || !noHp || !tujuan) {
      return NextResponse.json(
        { success: false, message: "Nama, Nomor HP, dan Tujuan wajib diisi" },
        { status: 400 },
      );
    }

    const alamatFinal = alamat || "";

    if (nik) {
      const existing = await prisma.pengunjung.findUnique({
        where: { nik },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "NIK sudah terdaftar." },
          { status: 400 },
        );
      }
    }

    // Buat pengunjung
    const pengunjung = await prisma.pengunjung.create({
      data: {
        nama,
        noHp,
        nik: nik || null,
        alamat: alamatFinal,
        tujuan: tujuan as "baca_di_tempat" | "bawa_keluar",
      },
    });

    // Jika tujuan bawa_keluar tapi tidak ada bukuId, ubah menjadi baca_di_tempat
    if (tujuan === "bawa_keluar" && !bukuId) {
      const updated = await prisma.pengunjung.update({
        where: { id: pengunjung.id },
        data: { tujuan: "baca_di_tempat" },
      });
      return NextResponse.json(
        {
          success: true,
          message: "Pendaftaran berhasil! (tanpa peminjaman)",
          data: updated,
        },
        { status: 201 },
      );
    }

    // Jika tujuan bawa_keluar dan ada bukuId, proses peminjaman
    if (tujuan === "bawa_keluar" && bukuId) {
      const buku = await prisma.buku.findUnique({
        where: { id: parseInt(bukuId) },
      });
      if (!buku) {
        return NextResponse.json(
          { success: false, message: "Buku tidak ditemukan" },
          { status: 404 },
        );
      }
      if (buku.stok <= 0) {
        return NextResponse.json(
          { success: false, message: "Stok buku habis." },
          { status: 400 },
        );
      }

      const setting = await prisma.pengaturan.findUnique({
        where: { key: "durasi_pinjam_jam" },
      });
      const durasiJam = setting ? parseInt(setting.value) : 2;
      const now = new Date();
      const batasWaktu = new Date(now.getTime() + durasiJam * 60 * 60 * 1000);

      await prisma.peminjaman.create({
        data: {
          pengunjungId: pengunjung.id,
          bukuId: parseInt(bukuId),
          durasiJam,
          batasWaktu,
          status: "dipinjam",
        },
      });

      await prisma.buku.update({
        where: { id: parseInt(bukuId) },
        data: { stok: { decrement: 1 } },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Pendaftaran berhasil! Buku berhasil dipinjam.",
          data: pengunjung,
          batasWaktu: batasWaktu.toISOString(),
        },
        { status: 201 },
      );
    }

    // Default: baca_di_tempat
    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil! Selamat membaca.",
        data: pengunjung,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

// GET: Ambil semua pengunjung (untuk keperluan lain, misal admin)
export async function GET(request: NextRequest) {
  try {
    const pengunjung = await prisma.pengunjung.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        peminjaman: {
          include: {
            buku: true,
          },
        },
      },
    });
    return NextResponse.json(pengunjung);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan" },
      { status: 500 },
    );
  }
}
