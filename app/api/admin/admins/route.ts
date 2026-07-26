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

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        imageUrl: true, // ✅ TAMBAHKAN INI
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    console.error("Error GET admins:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar admin" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, nama, password } = body;

    if (!username || !nama || !password) {
      return NextResponse.json(
        { error: "Username, nama, dan password wajib diisi" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 },
      );
    }

    const existing = await prisma.admin.findUnique({
      where: { username },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        nama,
        password: hashedPassword,
        role: "admin",
      },
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        imageUrl: true, // ✅ TAMBAHKAN INI
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin berhasil ditambahkan",
        data: newAdmin,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error POST admin:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan admin" },
      { status: 500 },
    );
  }
}
