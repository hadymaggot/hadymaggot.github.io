# Ekspor SMART Desktop: DBF UTF-8 dan File di Atas 2 GB

- URL: https://hadymaggot.github.io/blog/ekspor-smart-dbf-utf8-dan-file-besar/
- Tanggal: 2026-11-12
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: GIS, Data, Python

> Karakter rusak pada kolom teks dan DBF yang melebihi 2 GB adalah dua masalah yang muncul saat mengimpor ekspor shapefile dari SMART Desktop.

Mengimpor ekspor shapefile dari SMART Desktop memunculkan beberapa masalah yang tidak terlihat pada data uji kecil.

### DBF UTF-8 tanpa .cpg

File DBF ditulis dalam UTF-8 tanpa file `.cpg`. GDAL, pyogrio, dan `foreign::read.dbf` mengasumsikan latin1, sehingga karakter seperti tanda pisah (en dash) berubah menjadi `â€“`. Tentukan encoding secara eksplisit, atau deteksi dengan memeriksa apakah isi file valid sebagai UTF-8.

### DBF lebih dari 2 GB

Kolom teks sepanjang 254 byte dengan 129 kolom menghasilkan sekitar 25 KB per record. Pada 143.964 record, ukurannya 3,6 GB, padahal ZIP-nya hanya 33 MB. `foreign::read.dbf` gagal karena memakai `fseek` 32-bit. Solusinya membaca DBF secara streaming per blok record, bukan memuat semuanya.

### Identitas record

Ekspor query observasi tertentu tidak memuat Patrol ID, sehingga tidak dapat direlasikan ke patroli. Gunakan query standar yang memuat relasi itu. Patrol ID juga dipakai ulang untuk patroli berbeda pada tanggal berbeda, sehingga identitas yang benar adalah kombinasi Patrol ID, tanggal mulai, dan unit pengelola. Mengelompokkan hanya berdasarkan Patrol ID menggabungkan patroli yang berbeda.
