# Zombie Process di Container: Mengapa PID 1 Perlu init

- URL: https://hadymaggot.github.io/blog/container-zombie-process-init/
- Tanggal: 2026-10-02
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Docker, Operations, Troubleshooting

> Shell sebagai PID 1 tidak memanen proses yatim. Pada container yang sering men-spawn proses latar, zombie menumpuk sampai spawn baru ditolak.

Container dapat berjalan normal selama berminggu-minggu, lalu scheduler berhenti men-spawn proses tanpa error yang jelas. Pada kasus ini penyebabnya ada di PID 1 container, yaitu skrip shell yang menjalankan entrypoint.

Shell tidak memanen (reap) proses anak yang yatim. Setiap proses latar yang di-spawn scheduler lalu selesai menjadi zombie permanen dan tetap memakai satu entry di process table. Pada salah satu service, lebih dari 99% proses PHP berstatus `<defunct>`, dan jumlah proses mendekati batas `threads-max` host.

### Gejala yang menyesatkan

Setelah limit tercapai, `posix_spawn()` menolak dengan `Resource temporarily unavailable`. Scheduler menampilkan mutex yang masih terpegang, sehingga terlihat seperti masalah mutex. Consumer message queue hilang tanpa alarm, memori terdorong ke swap, dan API menjawab lebih dari 30 detik sampai reverse proxy memutus koneksi dengan 500.

### Diagnosis

Hitung proses zombie di dalam container. Jumlah yang terus naik menunjukkan ada proses yang tidak dipanen.
docker exec <container> sh -c 'ps -eo stat | grep -c "^Z"'
docker exec <container> ps -p 1 -o args
### Perbaikan

Aktifkan init pada Compose agar PID 1 adalah init kecil (tini) yang memanen anak yatim.
services:
  app:
    init: true
Opsi yang sama tersedia sebagai `docker run --init`. Untuk image sendiri, `tini` sebagai ENTRYPOINT memberi hasil yang sama. Setelah container dibuat ulang, jumlah zombie tetap nol.
