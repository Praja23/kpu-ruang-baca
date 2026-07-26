import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-default",
);

export async function createToken(userId: number, username: string) {
  return await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function setSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}

// ✅ EKSPOR FUNGSI INI AGAR BISA DIPAKAI DI API ROUTES
export async function requireAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}
