import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = payload.userId as number;

    // Ambil admin lengkap (tanpa select) agar field lastReadAt tersedia
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin tidak ditemukan" },
        { status: 404 },
      );
    }

    const lastReadAt = admin.lastReadAt || new Date(0);

    const limit = 10;

    // Ambil notifikasi yang dibuat SETELAH lastReadAt
    const bukuTerbaru = await prisma.buku.findMany({
      where: {
        createdAt: { gte: lastReadAt },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        judul: true,
        createdAt: true,
      },
    });

    const peminjamanTerbaru = await prisma.peminjaman.findMany({
      where: {
        createdAt: { gte: lastReadAt },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        pengunjung: { select: { nama: true } },
        buku: { select: { judul: true } },
      },
    });

    const pengunjungTerbaru = await prisma.pengunjung.findMany({
      where: {
        createdAt: { gte: lastReadAt },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        nama: true,
        createdAt: true,
      },
    });

    const notifications: {
      id: string;
      title: string;
      desc: string;
      time: string;
    }[] = [];

    bukuTerbaru.forEach((b) => {
      notifications.push({
        id: `buku-${b.id}`,
        title: "Buku Baru Ditambahkan",
        desc: b.judul,
        time: b.createdAt.toISOString(),
      });
    });

    peminjamanTerbaru.forEach((p) => {
      notifications.push({
        id: `pinjam-${p.id}`,
        title: "Peminjaman Baru",
        desc: `${p.pengunjung.nama} meminjam "${p.buku.judul}"`,
        time: p.createdAt.toISOString(),
      });
    });

    pengunjungTerbaru.forEach((p) => {
      notifications.push({
        id: `pengunjung-${p.id}`,
        title: "Pengunjung Baru",
        desc: p.nama,
        time: p.createdAt.toISOString(),
      });
    });

    notifications.sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    const hasil = notifications.slice(0, limit).map((n) => ({
      ...n,
      time: new Date(n.time).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    return NextResponse.json({ success: true, data: hasil });
  } catch (error) {
    console.error("Error GET notifications:", error);
    return NextResponse.json(
      { error: "Gagal mengambil notifikasi" },
      { status: 500 },
    );
  }
}
