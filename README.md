# Digital Identity Lookup

Aplikasi lookup kode 12 karakter untuk menemukan profil pemilik terdaftar.

## Stack
- Node.js
- Express
- SQLite (sqlite3)
- Frontend vanilla HTML/CSS/JS (tanpa library eksternal)

## Struktur Proyek

- `public/index.html` — halaman OTP 12 karakter.
- `public/assets/theme.css` — tema bersama untuk halaman OTP, profil, dan 404.
- `public/assets/otp.css` — style khusus komponen OTP.
- `public/404.html` — fallback halaman tidak ditemukan.
- `server/index.js` — server Express + API.
- `server/db.js` — util koneksi SQLite.
- `scripts/db-init.js` — inisialisasi skema database.
- `scripts/db-seed.js` — seed data contoh.
- `data/` — file SQLite (`app.sqlite`) akan dibuat di sini.

## Setup

1. Install dependency:
   ```bash
   npm install
   ```
2. Buat file environment:
   ```bash
   cp .env.example .env
   ```
3. Inisialisasi database:
   ```bash
   npm run db:init
   ```
4. Seed data contoh:
   ```bash
   npm run db:seed
   ```
5. Jalankan server (dev):
   ```bash
   npm run dev
   ```
   atau production:
   ```bash
   npm start
   ```

## API

### `POST /api/lookup`
Body JSON:
```json
{ "code": "ABCD1234EFGH" }
```

Response:
- `200` → `{ "ok": true, "redirect": "/p/<slug>" }`
- `404` → `{ "ok": false, "error": "not_found" }`
- `410` → `{ "ok": false, "error": "inactive" }`
- `400` → `{ "ok": false, "error": "invalid_code" }` (validasi gagal)

### `GET /p/:slug`
Render halaman profil pemilik.

### `GET /health`
```json
{ "ok": true }
```

## Test Flow Lokal

1. Buka `http://localhost:3000`
2. Masukkan kode seed: `ABCD1234EFGH`
3. Klik **Lihat Profil Pemilik**
4. Aplikasi redirect ke halaman profil `/p/budi-santoso`


## Catatan

- Halaman profil `/p/:slug` saat ini adalah MVP (menampilkan data pemilik + tombol kontak), dashboard pengelolaan belum termasuk.
- Seluruh halaman publik memakai tema terpadu dari `public/assets/theme.css`.
