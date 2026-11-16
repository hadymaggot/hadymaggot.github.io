# Migrasi Legacy: Handler JS Belum Berarti Aturan Hidup

- URL: https://hadymaggot.github.io/blog/legacy-handler-js-bukan-aturan-hidup/
- Tanggal: 2026-10-14
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Migrasi, Legacy, Engineering

> Saat memetakan kondisional form legacy, keberadaan handler JavaScript tidak membuktikan bahwa aturannya masih aktif.

Saat memetakan kondisional form aplikasi legacy, kehadiran handler JavaScript tidak membuktikan bahwa aturan itu aktif. Legacy menyimpan banyak sisa kode: handler `$('#id').change(...)` untuk elemen yang tidak pernah dirender, dan `$form->field(...)` yang sudah dikomentari.

Jika sisa kode itu disalin apa adanya, aplikasi baru menghidupkan perilaku yang di legacy sendiri sudah mati. Pengguna mendapat checkbox dan aturan yang tidak pernah mereka lihat sebelumnya, dan parity justru rusak. Pada satu form, sebuah kolom beserta checkbox-nya sempat dibuat, padahal checkbox itu tidak ada di view mana pun.

### Tiga pemeriksaan berurutan

Pertama, cari nama field pada view dan pastikan ada baris yang merender field tersebut, bukan hanya referensi di blok JavaScript atau baris yang dikomentari.

```
grep -n "nama_field" view.php
```

Kedua, hitung pemakaiannya pada data legacy. Angka satu digit di antara puluhan ribu baris berarti praktis mati.

```
SELECT SUM(nama_kolom = 1), COUNT(*) FROM tabel_aktivitas;
```

Ketiga, putuskan apakah aturan itu dipindahkan, lalu catat keputusan beserta buktinya pada dokumen parity agar tidak diperiksa ulang.
