// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// 🔥 WAJIB: Pastikan JWT_SECRET ada di environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const SECRET = new TextEncoder().encode(JWT_SECRET);

// Halaman yang TIDAK perlu login (public)
const PUBLIC_PATHS = [
  "/login",
  "/beranda",
  "/katalog",
  "/buku", // halaman katalog publik
  "/api/auth/login",
  "/api/buku", // API publik untuk katalog
  "/api/pengunjung", // API publik untuk daftar pengunjung (jika diperlukan)
  "/api/pengaturan/durasi",
];

// Proteksi penuh untuk path ini (harus login)
const PROTECTED_PATHS = [
  "/admin", // semua halaman admin
  "/api/admin", // semua API admin
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Lewati file statis (Next.js sudah handle, tapi ini tambahan)
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
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token tidak valid atau expired
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Semua path lain (default) izinkan akses
  return NextResponse.next();
}

// Konfigurasi matcher (opsional, Next.js sudah punya default yang baik)
export const config = {
  matcher: [
    /*
     * Match semua request kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api/test-db
     */
    "/((?!_next/static|_next/image|favicon.ico|api/test-db).*)",
  ],
};
