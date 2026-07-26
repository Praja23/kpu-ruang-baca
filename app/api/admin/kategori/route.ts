// app/api/admin/kategori/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const KATEGORI_KEY = "kategori_list";

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
      { success: false, message: "Gagal mengambil kategori" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nama } = await request.json();
    if (!nama || nama.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi" },
        { status: 400 },
      );
    }
    const list = await getKategoriList();
    if (list.includes(nama.trim())) {
      return NextResponse.json(
        { success: false, message: "Kategori sudah ada" },
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
    if (!oldNama || !newNama || newNama.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Data tidak valid" },
        { status: 400 },
      );
    }
    const list = await getKategoriList();
    const index = list.indexOf(oldNama);
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 },
      );
    }
    if (list.includes(newNama.trim()) && newNama.trim() !== oldNama) {
      return NextResponse.json(
        { success: false, message: "Kategori dengan nama tersebut sudah ada" },
        { status: 400 },
      );
    }
    list[index] = newNama.trim();
    await saveKategoriList(list);
    await prisma.buku.updateMany({
      where: { kategori: oldNama },
      data: { kategori: newNama.trim() },
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
    if (!nama) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi" },
        { status: 400 },
      );
    }
    const list = await getKategoriList();
    const index = list.indexOf(nama);
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 },
      );
    }
    list.splice(index, 1);
    await saveKategoriList(list);
    await prisma.buku.updateMany({
      where: { kategori: nama },
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
