# Mesin 2-Tak 3D (Android)

Aplikasi Android pembungkus visualisasi 3D mesin motor 2-tak (Three.js) dalam WebView.

## Yang sudah ditambahkan pada tahap ini
- **Loading screen**: durasi minimum + pesan tambahan jika proses lebih lama dari biasanya (mis. jaringan lambat/offline).
- **Mode offline**: WebView memakai `cacheMode = LOAD_DEFAULT`, jadi library 3D (dimuat dari CDN) otomatis tersimpan di cache setelah pertama kali dibuka dengan internet, dan dipakai ulang tanpa internet sesudahnya. Ada pita kecil "MODE OFFLINE" di layar saat tidak ada koneksi.
- **Responsif**: elemen UI (indikator fase & dock kontrol) memakai `env(safe-area-inset-*)`, ukuran clamp(), dan dock kontrol bisa digeser (scroll) horizontal agar tidak tumpang tindih di layar sempit/pendek (termasuk mode landscape HP kecil).

## Cara build APK
1. Push seluruh folder ini ke repository GitHub (branch `main`).
2. Buka tab **Actions** di repo tersebut — workflow "Build APK" akan berjalan otomatis.
3. Setelah selesai (~2-4 menit), buka hasil run tersebut → bagian **Artifacts** → unduh `Motor2TakViewer3D-debug-apk`.
4. Ekstrak zip-nya, dapatkan `app-debug.apk`, lalu instal di HP (aktifkan "Izinkan dari sumber tidak dikenal" jika diminta).

## Catatan
- Build pertama di HP membutuhkan koneksi internet sekali (untuk mengunduh Three.js dari CDN ke cache WebView). Setelahnya bisa dibuka offline.
- Ikon aplikasi masih versi sederhana (lingkaran gear + piston) — bisa diganti belakangan.
