-- CreateEnum
CREATE TYPE "TujuanPengunjung" AS ENUM ('baca_di_tempat', 'bawa_keluar');

-- CreateEnum
CREATE TYPE "StatusPeminjaman" AS ENUM ('dipinjam', 'kembali', 'terlambat');

-- CreateTable
CREATE TABLE "Buku" (
    "id" SERIAL NOT NULL,
    "kodeBuku" VARCHAR(50) NOT NULL,
    "judul" VARCHAR(255) NOT NULL,
    "penulis" VARCHAR(100) NOT NULL,
    "kategori" VARCHAR(50) NOT NULL,
    "deskripsi" TEXT,
    "stok" INTEGER NOT NULL DEFAULT 1,
    "lokasiRak" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengunjung" (
    "id" SERIAL NOT NULL,
    "nik" VARCHAR(16),
    "nama" VARCHAR(100) NOT NULL,
    "alamat" VARCHAR(255) NOT NULL,
    "noHp" VARCHAR(20) NOT NULL,
    "tujuan" "TujuanPengunjung" NOT NULL DEFAULT 'baca_di_tempat',
    "tanggalKunjungan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengunjung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Peminjaman" (
    "id" SERIAL NOT NULL,
    "pengunjungId" INTEGER NOT NULL,
    "bukuId" INTEGER NOT NULL,
    "tanggalPinjam" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durasiJam" INTEGER NOT NULL DEFAULT 2,
    "batasWaktu" TIMESTAMP(3) NOT NULL,
    "status" "StatusPeminjaman" NOT NULL DEFAULT 'dipinjam',
    "tanggalKembali" TIMESTAMP(3),
    "denda" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Peminjaman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengaturan" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengaturan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Buku_kodeBuku_key" ON "Buku"("kodeBuku");

-- CreateIndex
CREATE UNIQUE INDEX "Pengunjung_nik_key" ON "Pengunjung"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Pengaturan_key_key" ON "Pengaturan"("key");

-- AddForeignKey
ALTER TABLE "Peminjaman" ADD CONSTRAINT "Peminjaman_pengunjungId_fkey" FOREIGN KEY ("pengunjungId") REFERENCES "Pengunjung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Peminjaman" ADD CONSTRAINT "Peminjaman_bukuId_fkey" FOREIGN KEY ("bukuId") REFERENCES "Buku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
