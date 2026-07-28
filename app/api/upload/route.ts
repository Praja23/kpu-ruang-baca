import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ✅ Izinkan PDF dan gambar
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf", // ✅ TAMBAHKAN
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP, GIF, and PDF are allowed" },
        { status: 400 },
      );
    }

    // ✅ PDF bisa lebih besar (10MB)
    const maxSize =
      file.type === "application/pdf" ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size must be less than ${file.type === "application/pdf" ? "10MB" : "2MB"}`,
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload ke Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: "kpu-ruang-baca",
      resource_type: "auto", // ✅ Otomatis deteksi gambar/PDF
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
