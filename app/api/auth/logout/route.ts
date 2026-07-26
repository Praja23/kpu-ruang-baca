// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });

    // Hapus cookie token
    response.cookies.delete("token");

    // Atau set cookie expired (cara kedua untuk memastikan)
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Gagal logout" }, { status: 500 });
  }
}
