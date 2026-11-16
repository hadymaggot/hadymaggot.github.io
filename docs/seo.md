# SEO dan keterbacaan oleh AI

Semua halaman dibangun agar terindeks mesin pencari dan dapat dibaca asisten AI tanpa menjalankan JavaScript. `scripts/check_site.py` menjaga aturan ini pada setiap perubahan.

## Struktur halaman

| Halaman | Isi |
| --- | --- |
| `/` | Terminal interaktif untuk pengunjung, ditambah ringkasan profil sebagai HTML biasa (`#ringkasan`): satu `h1`, keahlian, proyek publik, artikel terbaru, dan kontak. Ringkasan disembunyikan secara visual, tetapi tetap terbaca crawler dan pembaca layar |
| `/blog.html` | Daftar semua artikel yang dirender langsung di HTML, chip topik, dan JSON-LD `Blog` |
| `/blog/<id>/` | Artikel dengan meta lengkap, JSON-LD `BlogPosting` dan `BreadcrumbList`, artikel terkait, tautan sebelum dan sesudah, dan kotak penulis |
| `/blog/<id>/index.md` | Versi Markdown tiap artikel untuk AI |
| `/blog/tag/<tag>/` | Halaman topik, hanya untuk tag dengan minimal dua artikel agar tidak menjadi thin content |
| `/feed.xml` | RSS dengan isi penuh (`content:encoded`) |
| `/llms.txt` dan `/llms-full.txt` | Ringkasan situs dan seluruh artikel dalam satu file Markdown untuk asisten AI |
| `/sitemap.xml` dan `/robots.txt` | Sitemap dengan `lastmod`, dan robots yang mengizinkan crawler mesin pencari serta AI |

Setiap halaman diindeks memiliki satu `h1`, `title` sampai 70 karakter, meta description 70 sampai 165 karakter, canonical, Open Graph, Twitter Card, dan gambar pratinjau 1200x630. Judul dan deskripsi tidak boleh duplikat.

## Alur kerja

Setelah menambah atau mengubah artikel di `blog/posts/`, jalankan:

```
python scripts/build_blog.py
python scripts/check_site.py
```

`build_blog.py` membuat seluruh halaman turunan, `llms.txt`, bagian otomatis di `blog.html` dan `index.html`, serta gambar pratinjau per artikel (memerlukan Pillow; gambar yang sudah ada tidak dibuat ulang).

## Setelah situs terbit

Langkah berikut memerlukan akun dan dilakukan manual:

1. Google Search Console: tambahkan properti `https://hadymaggot.github.io/`, verifikasi dengan tag meta HTML, lalu kirim `https://hadymaggot.github.io/sitemap.xml`.
2. Bing Webmaster Tools: impor properti dari Search Console, atau tambahkan manual dan kirim sitemap yang sama. Data Bing juga dipakai beberapa mesin pencari dan asisten AI.
3. Periksa hasil pada Rich Results Test (search.google.com/test/rich-results) untuk JSON-LD artikel.

## Domain

Canonical yang dipakai adalah `https://hadymaggot.github.io`. `ahadizapto.tech` tidak memiliki DNS, jadi tidak boleh dipakai sebagai canonical atau tautan. Jika kelak domain kustom dipasang, ubah `BASE_URL` di `scripts/build_blog.py` dan canonical di `index.html` dan `blog.html`, lalu jalankan `build_blog.py`.
