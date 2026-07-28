// app/api/peminjaman/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper validasi panjang
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
    const { nama, noHp, nik, alamat, instansi, bukuIds } = body;

    // Validasi wajib
    if (!nama || !noHp || !bukuIds || bukuIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          field: "general",
          message: "Nama, No HP, dan minimal 1 buku wajib diisi",
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

    const bukuList = await prisma.buku.findMany({
      where: { id: { in: bukuIds } },
    });

    if (bukuList.length !== bukuIds.length) {
      return NextResponse.json(
        {
          success: false,
          field: "buku",
          message: "Ada buku yang tidak ditemukan",
        },
        { status: 404 },
      );
    }

    for (const buku of bukuList) {
      if (buku.stok <= 0) {
        return NextResponse.json(
          {
            success: false,
            field: "buku",
            message: `Stok buku "${buku.judul}" habis`,
          },
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
          instansi: instansi || null,
          tujuan: "bawa_keluar",
        },
      });
    } else {
      if (!pengunjung.instansi && instansi) {
        pengunjung = await prisma.pengunjung.update({
          where: { id: pengunjung.id },
          data: { instansi },
        });
      }
    }

    const setting = await prisma.pengaturan.findUnique({
      where: { key: "durasi_pinjam_jam" },
    });
    const durasiJam = setting ? parseInt(setting.value) : 2;

    const now = new Date();
    const peminjamanList = [];

    for (const bukuId of bukuIds) {
      const buku = bukuList.find((b) => b.id === bukuId);
      const batasWaktu = new Date(now.getTime() + durasiJam * 60 * 60 * 1000);

      const peminjaman = await prisma.peminjaman.create({
        data: {
          pengunjungId: pengunjung.id,
          bukuId: bukuId,
          judulBuku: buku?.judul || "Buku tidak ditemukan",
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
      {
        success: false,
        field: "general",
        message: "Terjadi kesalahan pada server",
      },
      { status: 500 },
    );
  }
}
