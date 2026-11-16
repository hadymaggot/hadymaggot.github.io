# Redis Crash-Loop karena AOF Korup Setelah Reboot

- URL: https://hadymaggot.github.io/blog/redis-aof-korup-setelah-reboot/
- Tanggal: 2026-10-30
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Redis, Docker, Troubleshooting

> Pesan dependency failed to start: unhealthy menyesatkan. Redis tidak pernah selesai start karena ekor file AOF rusak.

Reboot yang tidak bersih dapat memotong ekor file `appendonly.aof` di tengah penulisan. Redis lalu crash-loop dengan exit code 1, dan `docker compose up -d` gagal dengan pesan `dependency failed to start: container is unhealthy`. Pesan itu menyesatkan: masalahnya bukan healthcheck, melainkan Redis yang tidak pernah selesai start. Service lain yang bergantung padanya ikut unhealthy, lalu pulih sendiri begitu Redis hidup.

### Diagnosis

Baca log container langsung dan cari pesan `Bad file format reading the append only file` beserta offset-nya. Pada kasus ini file rusak sekitar 3,5 KB sebelum ujung.

```
docker logs <container> 2>&1 | grep -i "append only"
```

### Perbaikan

Backup volume terlebih dahulu, lalu potong ekor yang rusak. Hanya perintah terakhir sebelum reboot yang hilang.

```
docker run --rm -v redis_data:/data alpine sh -c "cd /data && tar czf appendonlydir-backup.tgz appendonlydir"
docker stop <container>
docker run --rm -i -v redis_data:/data redis:8-alpine sh -c "echo y | redis-check-aof --fix /data/appendonlydir/appendonly.aof.manifest"
```

`redis-check-aof --fix` bersifat interaktif, sehingga `echo y |` diperlukan jika dijalankan tanpa TTY.

### Konfigurasi yang perlu diperiksa

Opsi `aof-load-truncated yes` hanya menangani ekor yang terpotong, bukan ekor berisi data rusak. Untuk kasus kedua, atur `aof-load-corrupt-tail-max-size 8192` (satuan byte, integer polos). Ini tidak melonggarkan durabilitas secara berarti, karena `appendfsync everysec` sudah menerima kehilangan satu detik terakhir, sedangkan crash-loop menjatuhkan seluruh aplikasi.

AOF tidak boleh dimatikan jika Redis menyimpan queue job, karena job yang belum dijalankan hilang pada setiap restart. Pastikan juga `maxmemory-policy` bukan `allkeys-lru`: key queue tidak memiliki TTL, sehingga Redis dapat membuangnya saat memori penuh tanpa error maupun log. `volatile-lru` membatasi eviction pada key ber-TTL.

Perubahan `redis.conf` yang di-bind mount baru berlaku setelah `docker compose up -d --force-recreate redis`.
