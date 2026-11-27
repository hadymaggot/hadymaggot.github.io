# Stack Compose Parsial: Penyebab E2E Gagal Berulang

- URL: https://hadymaggot.github.io/blog/stack-compose-parsial-penyebab-e2e-gagal/
- Tanggal: 2026-11-28
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Docker, Testing, Troubleshooting

> Test e2e yang gagal berulang sering berasal dari stack compose setengah jadi. Nyalakan semua service dengan file compose eksplisit.

Test end-to-end berbasis browser yang gagal terus-menerus sering bukan masalah di test-nya, melainkan di stack yang dijalankan sebelumnya. Container yang dinyalakan satu per satu dengan `up -d --no-deps <service>` menghasilkan stack setengah jadi, dan reverse proxy di depannya dapat berhenti merutekan request dengan benar.

### Gejala dan penyebab

Gejalanya berupa timeout pada halaman pertama, response 404 atau 502 dari gateway, dan hasil test yang berubah antar run tanpa ada perubahan kode. Opsi `--no-deps` melewati service yang menjadi dependency, sehingga database, queue, atau service pendukung lain tidak ikut naik. Reverse proxy yang membaca label container saat start juga dapat menyimpan state routing yang tidak lengkap jika service yang diharapkan belum ada ketika ia aktif.

Penyebab kedua ada pada pemilihan file compose. Script pembungkus yang memakai variabel environment `COMPOSE_FILE` dapat ikut memuat override yang tidak relevan, misalnya override untuk GPU pada mesin yang tidak memilikinya. Kombinasi file yang dimuat menentukan service dan konfigurasi apa yang benar-benar berjalan.

### Diagnosis

Bandingkan service yang seharusnya ada dengan yang benar-benar berjalan, lalu periksa file compose yang aktif dan log reverse proxy.
docker compose -f docker-compose.yml -f docker-compose.dev.yml config --services
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
echo "$COMPOSE_FILE"
docker logs --tail 100 <proxy-container>
Jika daftar service pada `ps` lebih pendek daripada hasil `config --services`, atau jika variabel `COMPOSE_FILE` memuat file yang tidak diharapkan, stack tersebut tidak layak dipakai untuk e2e.

### Perbaikan dan akibat jika dilanggar

Nyalakan seluruh service dengan daftar file compose yang ditulis eksplisit, tanpa subset dan tanpa `--no-deps`, lalu tunggu sampai healthcheck lulus sebelum test dijalankan.
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
Jika stack macet dan reverse proxy tidak pulih, hapus compose project lalu naikkan ulang dari awal. Gunakan `down` tanpa opsi `-v` agar volume data tidak ikut terhapus. Script pembungkus dan restart Docker Desktop sebaiknya tidak dijalankan tanpa kebutuhan yang jelas, karena keduanya mengubah keadaan seluruh mesin, bukan hanya satu project.

Jika aturan ini dilanggar, kegagalan test tidak lagi mencerminkan kualitas kode. Waktu habis untuk men-debug test yang sebenarnya benar, sementara regresi nyata tersamar di antara kegagalan yang berasal dari environment.
