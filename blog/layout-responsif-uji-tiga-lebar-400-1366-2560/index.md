# Layout Responsif: Uji di 400px, 1366px, dan 2560px

- URL: https://hadymaggot.github.io/blog/layout-responsif-uji-tiga-lebar-400-1366-2560/
- Tanggal: 2026-11-24
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Frontend, Vue, Web Development

> Komponen layout system-wide wajib diuji di 400px, 1366px, dan 2560px. Pola flex-wrap, min-w-0 + truncate, dan grid per breakpoint mencegah meluber.

Perubahan kecil pada komponen yang berlaku di seluruh halaman, seperti strip breadcrumb, bar filter, navigasi tab, dan deretan kartu KPI, mudah terlihat rapi di satu ukuran layar dan rusak di ukuran lain. Dashboard yang sama dibuka di laptop 1366px, monitor 4K, dan sesekali ponsel. Pengujian yang hanya dilakukan di lebar sekitar 1750px tidak mewakili satu pun dari ketiga kondisi itu.

### Gejala di tiga lebar

Di ponsel sekitar 400px, teks judul yang diberi `shrink-0` menolak menyempit sehingga baris kontrol meluber ke kanan dan memunculkan scroll horizontal pada seluruh halaman. Di laptop 1366px, kelompok pil tab yang mengandalkan `overflow-x` memotong item terakhir tanpa petunjuk visual apa pun. Di 2560px ke atas, grid kartu dengan jumlah kolom tunggal merentang terlalu lebar sehingga angka KPI tampak kecil dan jarak antarkartu tidak proporsional.

### Penyebab: kelas yang mengunci satu asumsi lebar

Akar masalahnya bukan pada framework, melainkan pada kelas utilitas yang menetapkan satu asumsi lebar. `shrink-0` pada elemen yang isinya bisa panjang, `grid-cols-5` tanpa breakpoint, dan container tanpa batas maksimum adalah tiga pola yang hanya benar pada lebar tempat komponen itu dibuat. Tailwind menyediakan breakpoint justru agar asumsi itu dinyatakan secara eksplisit per rentang lebar, bukan diwariskan diam-diam dari layar pengembang.

### Perbaikan pada pola kelas

Baris kontrol memakai `flex-wrap` agar item turun ke baris berikutnya alih-alih meluber. Elemen teks yang panjang diberi `min-w-0` dan `truncate`, bukan `shrink-0`. Grid kartu menyatakan jumlah kolom per breakpoint, dan lebar konten dibatasi mengikuti container utama, misalnya `2xl:max-w-[1800px]`. Halaman peta penuh menjadi pengecualian karena strip kontrolnya harus sejajar dengan tepi peta.
-<div class="flex items-center gap-2">
+<div class="flex flex-wrap items-center gap-2 min-w-0">
-  <span class="shrink-0">{{ judulPanjang }}</span>
+  <span class="min-w-0 truncate">{{ judulPanjang }}</span>

-<div class="grid grid-cols-5 gap-4">
+<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
### Verifikasi sebelum menyatakan selesai

Tiga lebar menjadi syarat minimum sebelum perubahan dianggap selesai: 400px untuk ponsel, 1366px untuk laptop umum, dan 2560px ke atas untuk monitor besar. Pemeriksaan ini dapat dilakukan lewat mode responsif di DevTools browser atau diotomatiskan dengan screenshot di Playwright sehingga hasilnya tersimpan bersama perubahan.
for (const width of [400, 1366, 2560]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('<url-halaman>');
  await page.screenshot({ path: `strip-${width}.png` });
}
Tanpa aturan ini, setiap perubahan pada komponen system-wide berpotensi menjadi regresi yang baru terlihat ketika halaman dibuka di perangkat lain. Perbaikannya murah jika dilakukan saat komponen diubah, dan mahal jika ditemukan setelah deploy karena harus ditelusuri kembali ke commit mana yang mengubah kelas layout.
