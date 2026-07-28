import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// helper untuk validasi panjang
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { nama, noHp, nik, alamat, instansi, tujuan, bukuId } = body;

    // Validasi wajib
    if (!nama || !noHp || !tujuan) {
      return NextResponse.json(
        {
          success: false,
          field: "general",
          message: "Nama, Nomor HP, dan Tujuan wajib diisi",
        },
        { status: 400 },
      );
    }

    // Validasi panjang field
    const validations = [
      validateLength(nama, 100, "Nama"),
      validateLength(noHp, 20, "Nomor HP"),
      validateLength(nik, 16, "NIK"),
      validateLength(alamat, 255, "Alamat"),
      validateLength(instansi, 100, "Instansi"),
    ];

    for (const v of validations) {
      if (!v.valid) {
        return NextResponse.json(
          { success: false, field: v.field, message: v.message },
          { status: 400 },
        );
      }
    }

    // Jika NIK tidak valid (bukan 16 digit angka), tapi kita hanya cek panjang di atas
    // Bisa tambahkan regex jika perlu

    const alamatFinal = alamat || "";

    if (nik) {
      const existing = await prisma.pengunjung.findUnique({
        where: { nik },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, field: "nik", message: "NIK sudah terdaftar." },
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
        instansi: instansi || null,
        tujuan: tujuan as "baca_di_tempat" | "bawa_keluar",
      },
    });

    // ... (sisanya sama seperti kode Anda, hanya saja tidak perlu diubah)
    // Lanjutkan logika untuk bawa_keluar, dll.

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

    if (tujuan === "bawa_keluar" && bukuId) {
      const buku = await prisma.buku.findUnique({
        where: { id: parseInt(bukuId) },
      });
      if (!buku) {
        return NextResponse.json(
          { success: false, field: "buku", message: "Buku tidak ditemukan" },
          { status: 404 },
        );
      }
      if (buku.stok <= 0) {
        return NextResponse.json(
          { success: false, field: "buku", message: "Stok buku habis." },
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
      {
        success: false,
        field: "general",
        message: "Terjadi kesalahan pada server",
      },
      { status: 500 },
    );
  }
}

// GET tetap sama
