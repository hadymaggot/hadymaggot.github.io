# Crosswalk Kode Kabupaten/Kota Legacy ke Kode Resmi

- URL: https://hadymaggot.github.io/blog/crosswalk-kode-kabupaten-legacy/
- Tanggal: 2026-07-23
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: GIS, Migrasi, Data

> Hampir 40% kabupaten/kota pada sistem legacy tidak cocok dengan kode resmi. Pemetaannya harus dilakukan di level kabupaten/kota, bukan provinsi.

Sistem legacy memakai penomoran kabupaten/kota sendiri yang berbeda dari kode resmi pada master wilayah baru. Perbedaan itu pertama terlihat di satu provinsi, lalu dicek ke seluruh 511 kabupaten/kota lewat `postgres_fdw`. Hasilnya 166 nama tidak cocok dan 35 data tidak ditemukan, total 199 dari 511 (sekitar 39%), tersebar di hampir semua provinsi.

### Penyebabnya berlapis

Sebagian kabupaten/kota hanya berbeda urutan nomor: namanya sama, kodenya berbeda. Provinsi Papua lama sudah dipecah menjadi enam provinsi sejak pemekaran 2022, sehingga satu kode provinsi lama dapat jatuh ke beberapa provinsi baru tergantung kabupaten/kotanya. Karena itu remap harus dilakukan di level kabupaten/kota. Sebagian kecil kabupaten juga berganti nama resmi setelah data legacy dibuat, misalnya Toba Samosir menjadi Toba dan Mamuju Utara menjadi Pasangkayu.

### Pendekatan yang dipakai

Bangun tabel crosswalk dari kode legacy ke kode resmi, dengan sumber legacy yang tidak diubah (diakses lewat foreign data wrapper), lalu terapkan ke seluruh tabel yang mereferensikan wilayah. Simpan snapshot sebelum UPDATE, dan pastikan script dapat dijalankan ulang tanpa merusak hasil sebelumnya. Cocokkan juga dengan nama, bukan hanya kode, karena nama yang cocok dengan kode yang berbeda adalah tanda pergeseran urutan.
