import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      const setting = await prisma.pengaturan.findUnique({
        where: { key },
      });
      return NextResponse.json({
        success: true,
        value: setting?.value || null,
      });
    }

    const settings = await prisma.pengaturan.findMany();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error GET pengaturan:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan" },
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

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Key dan value wajib diisi" },
        { status: 400 },
      );
    }

    const updated = await prisma.pengaturan.upsert({
      where: { key },
      update: { value: value.toString() },
      create: { key, value: value.toString() },
    });

    return NextResponse.json({
      success: true,
      message: "Pengaturan berhasil disimpan",
      data: updated,
    });
  } catch (error) {
    console.error("Error PUT pengaturan:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 },
    );
  }
}
