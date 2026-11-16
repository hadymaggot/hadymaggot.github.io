# Konversi SQL ke GeoJSON: Geometri Kosong dan Perbaikan

- URL: https://hadymaggot.github.io/blog/sql-ke-geojson-geometri-kosong/
- Tanggal: 2026-04-22
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: GIS, Python, Tooling

> Dump SQL berisi INSERT dengan ST_GeomFromText sering memuat geometri kosong atau tidak valid. Berikut cara menanganinya pada tool sql_geojson.

Data batas wilayah sering didistribusikan sebagai dump SQL berisi `INSERT` dengan `ST_GeomFromText` atau `ST_GeomFromGeoJSON`. Untuk menampilkannya di peta web, data itu perlu dikonversi menjadi GeoJSON. Tool [sql_geojson](https://github.com/hadymaggot/hadymaggot.github.io/tree/main/tools/sql_geojson) melakukan konversi dua arah dan ditest di CI.

### Geometri kosong

Sebagian baris memuat geometri kosong. Baris itu tidak dapat digambar, dan pada beberapa library membuat seluruh FeatureCollection gagal dimuat. Opsi `--drop-empty-geometry` membuangnya, dan `report_geojson_stats.py --report-missing` mendaftar kode dan nama fitur yang tidak memiliki geometri, agar kekurangan data dapat dilaporkan ke sumbernya.

### Geometri tidak valid

Poligon dengan self-intersection atau cincin yang tidak tertutup membuat operasi seperti intersect dan union gagal. Opsi `--repair-geometries` memperbaikinya dengan shapely sebelum disimpan.

```
python tools/sql_geojson/sql_to_geojson.py --in-dir sql --out-dir geojson \
  --drop-empty-geometry --repair-geometries --skip-errors --recursive
```

Dump dengan `VALUES` multi-baris juga didukung. Setelah konversi, jalankan laporan statistik untuk memastikan jumlah fitur dan cakupan geometri sesuai harapan.
