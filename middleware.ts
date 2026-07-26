// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Halaman yang TIDAK perlu login (public)
const PUBLIC_PATHS = [
  "/login",
  "/beranda",
  "/katalog",
  "/buku",
  "/api/auth/login",
  "/api/buku",
  "/api/pengunjung",
  "/api/pengaturan/durasi",
];

// Proteksi penuh untuk path ini (harus login)
const PROTECTED_PATHS = ["/admin", "/api/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Lewati file statis
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/api/test-db"
  ) {
    return NextResponse.next();
  }

  // 2. Lewati halaman publik
  if (
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/"),
    )
  ) {
    return NextResponse.next();
  }

  // 3. Cek token untuk semua path yang diproteksi
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (isProtected) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // 🔥 Ambil JWT_SECRET di dalam fungsi, bukan di top-level
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error("JWT_SECRET is not set");
        // Jika tidak ada secret, redirect ke login
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
      const encodedSecret = new TextEncoder().encode(secret);
      await jwtVerify(token, encodedSecret);
      return NextResponse.next();
    } catch (error) {
      // Token tidak valid atau expired
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/test-db).*)"],
};
