import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const adminId = parseInt(id);
    if (isNaN(adminId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { nama, password } = body;

    if (!nama) {
      return NextResponse.json(
        { error: "Nama wajib diisi" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = { nama };
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password minimal 8 karakter" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error PUT admin:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui admin" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const adminId = parseInt(id);
    if (isNaN(adminId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Cek total admin
    const totalAdmins = await prisma.admin.count();
    if (totalAdmins <= 1) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus admin terakhir" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    }

    await prisma.admin.delete({
      where: { id: adminId },
    });

    return NextResponse.json({
      success: true,
      message: "Admin berhasil dihapus",
    });
  } catch (error) {
    console.error("Error DELETE admin:", error);
    return NextResponse.json(
      { error: "Gagal menghapus admin" },
      { status: 500 }
    );
  }
}