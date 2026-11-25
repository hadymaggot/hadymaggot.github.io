# Rekonsiliasi Data Legacy: Jangan Join lewat Kunci Alami

- URL: https://hadymaggot.github.io/blog/rekonsiliasi-data-legacy-jangan-join-lewat-kunci-alami/
- Tanggal: 2026-11-26
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Database, Data, Legacy, Troubleshooting

> Join lewat entitas dan periode menghasilkan selisih palsu saat rekonsiliasi data legacy. Telusuri legacy_id baris rinciannya agar pembanding tepat.

Setelah data dipindahkan dari database legacy ke schema baru, langkah berikutnya adalah rekonsiliasi: membandingkan total setiap laporan di sistem baru dengan record asalnya. Query pembanding yang paling cepat ditulis biasanya memakai kunci alami, yaitu entitas pemilik laporan ditambah periode. Pasangan itu tampak setara dengan identitas laporan, padahal tidak selalu demikian.

### Gejala: selisih yang tidak pernah hilang

Pada satu rekonsiliasi atas sekitar 48 ribu laporan, join lewat entitas dan tahun melaporkan tujuh laporan yang totalnya berbeda, bahkan setelah script penyelaras dijalankan. Penelusuran satu contoh sampai ke record asalnya menunjukkan bahwa angka di sistem baru persis sama dengan angka legacy. Data sudah benar, sedangkan pembandingnya mengambil record legacy yang keliru.

### Penyebab: entitas hasil merge dan relokasi

Di sistem legacy, sebagian entitas pernah digabung atau dipindahkan. Laporan yang di schema baru melekat pada entitas A ternyata tersimpan di legacy sebagai record milik entitas B. Kolom `legacy_id` pada tabel entitas menunjuk ke A, sehingga join lewat entitas dan periode menemukan record lain atau tidak menemukan apa pun. Kunci alami hanya sah selama relasi entitas tidak pernah berubah, dan asumsi itu jarang bertahan pada data berumur belasan tahun.

### Perbaikan: ikuti rantai legacy_id baris rincian

Baris rincian laporan menyimpan `legacy_id` yang menunjuk langsung ke baris asalnya, dan baris asal itu memegang foreign key ke record laporan legacy. Rantai tersebut tidak bergantung pada entitas mana yang kini memiliki laporan.
SELECT r.id, r.total AS total_baru, l.total AS total_legacy
FROM reports r
JOIN (
  SELECT report_id, MIN(legacy_id) AS legacy_item_id
  FROM report_items
  GROUP BY report_id
) i ON i.report_id = r.id
JOIN legacy_items li ON li.id = i.legacy_item_id
JOIN legacy_reports l ON l.id = li.report_id
WHERE r.total IS DISTINCT FROM l.total;
Dengan rantai ini, rekonsiliasi yang sama menghasilkan nol selisih. Dua aturan kerja mengikuti dari sini:

- Jika script penyelaras sudah memiliki mode verifikasi dengan rantai yang benar, output mode itu lebih layak dipercaya daripada join ad-hoc yang ditulis ulang.
- Sebelum melaporkan bahwa masih ada sejumlah selisih, satu contoh perlu ditelusuri sampai ke record asalnya untuk memastikan temuan itu bukan positif palsu.

Akibat melanggar aturan ini tidak berhenti pada laporan yang keliru. Selisih palsu mendorong perbaikan atas data yang sudah benar, dan perbaikan semacam itu menimpa nilai yang sah dengan nilai dari record yang salah. Kerusakan baru kemudian terdeteksi sebagai selisih sungguhan pada rekonsiliasi berikutnya, tanpa jejak yang menjelaskan asalnya.
