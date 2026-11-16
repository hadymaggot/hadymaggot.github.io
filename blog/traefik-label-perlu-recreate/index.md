# Traefik: Route Baru Perlu Recreate Container

- URL: https://hadymaggot.github.io/blog/traefik-label-perlu-recreate/
- Tanggal: 2026-11-13
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Traefik, Docker, Troubleshooting

> Label router dibaca dari container yang sedang berjalan. Endpoint baru yang menggantung, bukan 404, biasanya berarti label belum terbaca.

Menambah `PathPrefix` baru pada label Traefik sebuah service tidak berlaku dengan `docker compose restart traefik`. Label dibaca dari container yang sedang berjalan, dan container itu masih memegang label lama. Service harus dibuat ulang dengan `docker compose up -d <service>`.

### Gejala yang menyesatkan

Request menggantung, bukan 404. Router frontend memakai `Host(localhost)` tanpa batasan path, sehingga `/api/*` yang tidak cocok dengan router mana pun jatuh ke dev server frontend dan diam di sana sampai timeout. Jika endpoint API yang baru menggantung sementara endpoint lain pada service yang sama menjawab normal, curigai label lebih dulu sebelum kode.

### Memastikan tanpa menebak
# dari dalam container: 200 berarti kodenya benar
docker compose exec -T <service> curl -s -o /tmp/out -w "%{http_code}\n" http://localhost:<port>/api/<endpoint>

# lewat Traefik: 401 berarti route ada, menggantung berarti label belum terbaca
timeout 15 curl -s -o /dev/null -w "%{http_code}\n" http://localhost:<port-traefik>/api/<endpoint>
Setelah service dibuat ulang, tunggu sampai Traefik juga berstatus sehat sebelum menyimpulkan hasilnya.
