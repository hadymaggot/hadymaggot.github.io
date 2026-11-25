# Entrypoint Tanpa set -e: Container Naik, Migration Gagal

- URL: https://hadymaggot.github.io/blog/entrypoint-tanpa-set-e-container-naik-migration-gagal/
- Tanggal: 2026-11-25
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Docker, Laravel, DevOps, Troubleshooting

> Entrypoint shell tanpa set -e membiarkan container tetap naik meskipun migration gagal, sehingga aplikasi berjalan di atas schema yang setengah jadi.

Sebuah aplikasi Laravel di dalam container berstatus sehat: proses web berjalan, halaman depan menjawab 200, dan pipeline deploy selesai tanpa error. Namun login gagal dengan pesan bahwa sebuah kolom tidak ditemukan di tabel. Container naik di atas database yang baru setengah termigrasi, dan tidak ada satu pun tahap deploy yang melaporkannya.

### Penyebab: exit code yang diabaikan

Script entrypoint menjalankan migration lalu menyerahkan kendali ke proses utama. Shell secara default melanjutkan ke baris berikutnya walaupun sebuah perintah keluar dengan status bukan nol. Tanpa `set -e` dan tanpa pemeriksaan hasil, kegagalan `php artisan migrate --force` hanya menjadi beberapa baris log, sedangkan web server tetap dijalankan.
#!/bin/sh
php artisan migrate --force
exec "$@"
Migration yang berhenti di tengah meninggalkan sebagian tabel pada schema baru dan sebagian pada schema lama. Kode aplikasi sudah mengharapkan schema baru, sehingga error hanya muncul pada fitur yang menyentuh tabel yang tertinggal.

### Cara diagnosis

Status container tidak dapat dijadikan bukti, karena proses utamanya memang hidup. Bukti yang relevan ada pada log awal container dan pada status migration itu sendiri.
docker logs <container> 2>&1 | head -n 50
docker exec <container> php artisan migrate:status
Baris berstatus Pending pada container yang sudah melayani request menandakan bahwa entrypoint melewati kegagalan migration.

### Perbaikan

Entrypoint harus berhenti pada kegagalan pertama, sehingga container keluar dengan status bukan nol dan orchestrator atau pipeline mencatatnya sebagai deploy yang gagal.
#!/bin/sh
set -e

if ! php artisan migrate --force; then
  echo "migration gagal, container dihentikan" >&2
  exit 1
fi

exec "$@"
Opsi `set -e` memiliki pengecualian: perintah di dalam kondisi `if`, di sisi kiri `&&` atau `||`, dan di dalam pipeline selain perintah terakhir tidak menghentikan script. Karena itu langkah kritis seperti migration layak diperiksa secara eksplisit. Healthcheck yang hanya memeriksa halaman statis juga tidak menangkap keadaan ini. Healthcheck perlu menyentuh database, atau pipeline perlu menjalankan `migrate:status` setelah deploy dan gagal jika masih ada migration yang tertunda.

### Akibat jika dibiarkan

Gejala dapat hilang dengan sendirinya ketika deploy berikutnya berhasil menjalankan migration, tetapi perangkapnya tetap terbuka. Selama entrypoint mengabaikan exit code, setiap migration yang gagal menghasilkan container yang tampak sehat dengan schema yang tidak konsisten. Kegagalan itu baru ditemukan oleh orang yang mencoba login, bukan oleh pipeline, dan data yang telanjur ditulis pada schema campuran mempersulit rollback.
