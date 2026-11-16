# Bulk Update Data: Backup Dulu dan Pastikan Script Idempotent

- URL: https://hadymaggot.github.io/blog/backup-dan-idempotent-bulk-update/
- Tanggal: 2026-11-06
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Database, Operations, Data

> Data yang tampak salah belum tentu salah, dan script perbaikan yang dijalankan dua kali tidak boleh merusak hasil run pertama.

Dua pelajaran dari memperbaiki data dalam jumlah besar.

### Data yang tampak salah belum tentu salah

Sebuah dropdown tampil kosong, dan nilai di database dikira rusak karena tidak cocok dengan label dropdown. Sebanyak 209 baris di-UPDATE agar cocok, dan 19 baris yang tampak janggal diubah menjadi NULL tanpa menyimpan nilai lamanya. Ternyata tabel master yang berisi nilai asli tersedia dan persis sama dengan yang baru saja diubah. Data sudah benar sejak awal; penyebab sebenarnya adalah dropdown yang memakai label hardcoded dan tidak pernah disambungkan ke master data.

Ke-19 baris itu dapat dipulihkan hanya karena ada seed CSV asli untuk dicocokkan berdasarkan nama. Tanpa sumber itu, datanya hilang permanen. Sebelum UPDATE massal, simpan nilai lama dalam tabel snapshot atau dump, dan periksa apakah ada master data yang menjelaskan nilai tersebut.

### Script perbaikan harus idempotent

Script yang meng-UPDATE sebuah kolom tidak boleh mencocokkan (JOIN atau WHERE) ke kolom yang sama. Pada run pertama hasilnya benar. Pada run kedua, nilai yang sudah benar terbaca sebagai input mentah lagi, dan ribuan baris di-remap ulang. Kasus yang terjadi: kode lama dan kode baru sama-sama berupa angka 4 digit, sehingga keduanya tidak dapat dibedakan.

Kolom yang sedang diperbaiki bukan sumber kebenaran yang stabil. Gunakan sumber yang immutable, seperti tabel asal, log, atau snapshot terpisah, sebagai dasar pencocokan. Uji idempotency dengan menjalankan script dua kali pada salinan data, lalu bandingkan hasilnya.
