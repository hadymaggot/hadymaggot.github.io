# Mempercepat Import Track PostGIS dengan CTE MATERIALIZED

- URL: https://hadymaggot.github.io/blog/import-track-postgis-detoast-materialized/
- Tanggal: 2026-11-08
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: GIS, PostGIS, Performance

> Query yang mencocokkan jutaan titik ke poligon provinsi lambat karena geometri di-detoast berulang. CTE MATERIALIZED memangkas waktu dari 59 ke 19 detik.

Sebuah proses import track patroli memerlukan sekitar satu menit untuk data setahun, sebagian besar bukan di sisi aplikasi. Log menunjukkan waktu terbanyak ada pada dua tempat di server: pencocokan titik ke poligon provinsi, dan pembentukan LineString titik demi titik.

### Detoast per titik

Geometri poligon provinsi berukuran besar disimpan sebagai TOAST. Pada query yang mengakses kolom itu untuk setiap titik, PostgreSQL men-detoast geometri yang sama berulang kali. Dengan 1,83 juta titik, biayanya terasa. Perbaikannya mengambil poligon sekali dalam CTE `MATERIALIZED`, lalu menyaring titik yang berada di provinsi kawasan sebelum pemeriksaan yang lebih mahal.

```
WITH prov AS MATERIALIZED (
  SELECT geom FROM provinsi WHERE kode = :kode
)
SELECT t.id
FROM titik t, prov p
WHERE ST_Intersects(t.geom, p.geom);
```

### Geometri dari WKB

Pembentukan LineString dari titik-titik diganti dengan geometri yang dibangun dari WKB melalui shapely, dan file DBF dibaca satu kali dengan hasilnya di-cache selama proses. Hasilnya, pada data setahun dengan 514 garis dan 1,83 juta titik, waktu turun dari 59 detik menjadi 19 detik, dan dari 45–48 detik menjadi 15–16 detik di server dev.

Pengujian terhadap alat pembanding yang menulis langsung ke PostGIS menunjukkan bahwa selisih waktu sebagian berasal dari tahap ekspor di aplikasi sumber, bukan dari proses import. Ukur dulu di mana waktu habis sebelum mengoptimalkan.
