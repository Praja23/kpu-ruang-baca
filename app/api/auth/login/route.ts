// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-default",
);

export async function POST(request: Request) {
  try {
    const { username, password, remember } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 },
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Username tidak ditemukan" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // ✅ Jika remember = true, token berlaku 7 hari, jika tidak 8 jam
    const expiresIn = remember ? "7d" : "8h";
    const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 8; // 7 hari atau 8 jam

    // Buat JWT token
    const token = await new SignJWT({
      userId: admin.id,
      username: admin.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expiresIn)
      .sign(SECRET);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, username: admin.username, nama: admin.nama },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
