// app/api/admin/kategori/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const KATEGORI_KEY = "kategori_list";

// Helper validasi
const validateKategoriName = (name: string) => {
  if (!name || name.trim() === "") {
    return {
      valid: false,
      field: "nama",
      message: "Nama kategori wajib diisi",
    };
  }
  if (name.trim().length > 50) {
    return {
      valid: false,
      field: "nama",
      message: "Nama kategori maksimal 50 karakter",
    };
  }
  return { valid: true };
};

async function getKategoriList(): Promise<string[]> {
  const setting = await prisma.pengaturan.findUnique({
    where: { key: KATEGORI_KEY },
  });
  if (!setting) {
    const defaultList = ["Hukum", "Sosial Politik", "Laporan Tahunan", "Umum"];
    await prisma.pengaturan.create({
      data: {
        key: KATEGORI_KEY,
        value: JSON.stringify(defaultList),
      },
    });
    return defaultList;
  }
  try {
    return JSON.parse(setting.value);
  } catch {
    return [];
  }
}

async function saveKategoriList(list: string[]) {
  await prisma.pengaturan.upsert({
    where: { key: KATEGORI_KEY },
    update: { value: JSON.stringify(list) },
    create: {
      key: KATEGORI_KEY,
      value: JSON.stringify(list),
    },
  });
}

export async function GET() {
  try {
    const list = await getKategoriList();
    const withCount = await Promise.all(
      list.map(async (nama) => {
        const count = await prisma.buku.count({
          where: { kategori: nama },
        });
        return { nama, jumlahBuku: count };
      }),
    );
    return NextResponse.json({
      success: true,
      data: withCount,
    });
  } catch (error) {
    console.error("Error GET kategori:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data kategori" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nama } = await request.json();
    const validation = validateKategoriName(nama);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          field: validation.field,
          message: validation.message,
        },
        { status: 400 },
      );
    }

    const list = await getKategoriList();
    if (list.includes(nama.trim())) {
      return NextResponse.json(
        {
          success: false,
          field: "nama",
          message: `Kategori "${nama.trim()}" sudah ada`,
        },
        { status: 400 },
      );
    }

    list.push(nama.trim());
    await saveKategoriList(list);

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: { nama: nama.trim(), jumlahBuku: 0 },
    });
  } catch (error) {
    console.error("Error POST kategori:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah kategori" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { oldNama, newNama } = await request.json();

    if (!oldNama || oldNama.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          field: "oldNama",
          message: "Nama kategori lama wajib diisi",
        },
        { status: 400 },
      );
    }

    const validation = validateKategoriName(newNama);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          field: validation.field,
          message: validation.message,
        },
        { status: 400 },
      );
    }

    const list = await getKategoriList();
    const index = list.indexOf(oldNama.trim());
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          field: "oldNama",
          message: "Kategori tidak ditemukan",
        },
        { status: 404 },
      );
    }

    const newNameTrim = newNama.trim();
    if (list.includes(newNameTrim) && newNameTrim !== oldNama.trim()) {
      return NextResponse.json(
        {
          success: false,
          field: "newNama",
          message: `Kategori "${newNameTrim}" sudah ada`,
        },
        { status: 400 },
      );
    }

    list[index] = newNameTrim;
    await saveKategoriList(list);

    // Update semua buku dengan kategori lama ke kategori baru
    await prisma.buku.updateMany({
      where: { kategori: oldNama.trim() },
      data: { kategori: newNameTrim },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error PUT kategori:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengedit kategori" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nama = searchParams.get("nama");

    if (!nama || nama.trim() === "") {
      return NextResponse.json(
        { success: false, field: "nama", message: "Nama kategori wajib diisi" },
        { status: 400 },
      );
    }

    const list = await getKategoriList();
    const index = list.indexOf(nama.trim());
    if (index === -1) {
      return NextResponse.json(
        { success: false, field: "nama", message: "Kategori tidak ditemukan" },
        { status: 404 },
      );
    }

    list.splice(index, 1);
    await saveKategoriList(list);

    await prisma.buku.updateMany({
      where: { kategori: nama.trim() },
      data: { kategori: "Umum" },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("Error DELETE kategori:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus kategori" },
      { status: 500 },
    );
  }
}
