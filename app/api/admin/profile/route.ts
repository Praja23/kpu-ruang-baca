import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = payload.userId as number;

    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: admin });
  } catch (error) {
    console.error("Error GET profile:", error);
    return NextResponse.json(
      { error: "Gagal mengambil profil" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = payload.userId as number;

    const body = await request.json();
    const { nama, imageUrl, passwordLama, passwordBaru } = body;

    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });
    if (!admin) {
      return NextResponse.json(
        { error: "Admin tidak ditemukan" },
        { status: 404 },
      );
    }

    const updateData: any = {};
    if (nama !== undefined) updateData.nama = nama;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    // Ganti password jika passwordBaru diisi
    if (passwordBaru) {
      if (!passwordLama) {
        return NextResponse.json(
          { error: "Password lama wajib diisi" },
          { status: 400 },
        );
      }
      const valid = await bcrypt.compare(passwordLama, admin.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Password lama salah" },
          { status: 400 },
        );
      }
      if (passwordBaru.length < 8) {
        return NextResponse.json(
          { error: "Password baru minimal 8 karakter" },
          { status: 400 },
        );
      }
      updateData.password = await bcrypt.hash(passwordBaru, 10);
    }

    const updated = await prisma.admin.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error PUT profile:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil" },
      { status: 500 },
    );
  }
}
