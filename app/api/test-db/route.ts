import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const bukuCount = await prisma.buku.count();

    return NextResponse.json({
      status: "✅ Database Connected!",
      totalBuku: bukuCount,
      message: "Koneksi ke Neon berhasil!",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        status: "❌ Connection Failed",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
