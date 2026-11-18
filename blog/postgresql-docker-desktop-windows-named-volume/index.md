# PostgreSQL di Docker Desktop Windows: Pakai Named Volume

- URL: https://hadymaggot.github.io/blog/postgresql-docker-desktop-windows-named-volume/
- Tanggal: 2026-11-18
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Docker, Database, Windows, Troubleshooting

> Bind mount dari path Windows tidak menjamin fsync, sehingga PGDATA PostgreSQL di Docker Desktop gagal atau tidak tersimpan. Pakai named volume.

PostgreSQL membutuhkan jaminan bahwa data yang sudah di-fsync benar-benar tersimpan di disk. Docker Desktop untuk Windows dengan backend WSL2 tidak menaruh folder Windows yang di-bind mount ke container di filesystem Linux biasa. Folder itu dilewatkan melalui lapisan file sharing (9P) antara Windows dan VM Linux. Lapisan ini tidak memberikan semantik fsync dan durability yang dibutuhkan PostgreSQL, sehingga PGDATA di path Windows adalah konfigurasi yang rapuh.

### Gejala yang muncul

Kegagalannya jarang muncul sebagai satu error yang jelas. Pola yang umum adalah error disk penuh, padahal disk host masih lapang:
FATAL:  could not write to file "pg_wal/xlogtemp.N": No space left on device
Gejala ini biasanya datang bersama gejala lain. Folder mount kadang tampak kosong dari dalam container, sehingga entrypoint melaporkan `/docker-entrypoint-initdb.d/*` di-ignore walaupun file-nya ada di host. Inisialisasi cluster terlihat sukses, tetapi folder data di host tetap kosong dan data hilang saat container dibuat ulang. File berukuran puluhan gigabyte juga bisa sama sekali tidak terlihat dari dalam container.

### Cara diagnosis

Periksa sumber mount dan jenis filesystem tempat PGDATA berada. Jika sumbernya path Windows dan filesystem di dalam container bukan ext4 milik VM Docker, masalahnya hampir pasti ada di situ.
docker inspect <container> --format '{{json .Mounts}}'
docker exec <container> df -T /var/lib/postgresql/data
### Perbaikan

Simpan PGDATA di named volume. Named volume berada di disk VM Docker dan memakai filesystem Linux native:
services:
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
Pilihan lain adalah menjalankan PostgreSQL langsung di distro WSL2 dengan PGDATA di ext4. Jika data harus berada di drive selain C:, buat vhdx khusus lalu pasang dengan `wsl --mount --vhd`. Bind mount read-only untuk file kecil seperti init script dan konfigurasi umumnya berjalan, tetapi tetap rawan. Cara yang lebih aman adalah memasukkan file tersebut ke image lewat Dockerfile.

File dump besar sebaiknya tidak di-bind mount. Alirkan file itu lewat stdin dengan pipe milik cmd.exe. Pipeline Windows PowerShell 5.1 memperlakukan data sebagai teks dan dapat merusak byte biner:
cmd /c "type <dump>.sql.gz | docker exec -i <container> sh -c ""gunzip | psql -U <db_user> -d <db_name>"""
Alternatifnya, salin file ke dalam container dengan `docker cp` sebelum restore.

### Akibat jika diabaikan

Database yang tampak berjalan normal dapat kehilangan transaksi yang sudah di-commit, gagal menulis WAL saat beban tinggi, atau kosong setelah restart. Kerusakan seperti ini sulit dibedakan dari bug aplikasi, sehingga waktu diagnosis habis di tempat yang salah. Aturan ini khusus berlaku untuk Docker Desktop di Windows. Di Linux native, bind mount berada di filesystem host yang sama dengan container, sehingga masalah ini tidak terjadi.
