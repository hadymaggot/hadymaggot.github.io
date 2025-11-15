# SQL ↔ GeoJSON conversion tools

Ringkasan: skrip sederhana untuk membantu konversi file SQL (PostGIS-style INSERTs
yang memakai ST_GeomFromText/ST_GeomFromGeoJSON) menjadi GeoJSON, dan sebaliknya
GeoJSON -> SQL (INSERT dengan ST_GeomFromText WKT).

Lokasi: `tools/sql_geojson/`

File utama:

- `sql_to_geojson.py` — ekstrak geometri dari SQL ke GeoJSON FeatureCollection.
- `geojson_to_sql.py` — konversi GeoJSON FeatureCollection menjadi INSERT SQL.
- `requirements.txt` — dependensi Python (shapely, geojson)

Contoh cepat:

1. SQL -> GeoJSON

python3 tools/sql_geojson/sql_to_geojson.py path/to/file.sql -o out.geojson

# split into files with at most 10 features each

python3 tools/sql_geojson/sql_to_geojson.py path/to/file.sql -o out.geojson --batch-size 10

# apply mapping (rename and reorder properties) using JSON mapping file

python3 tools/sql_geojson/sql_to_geojson.py path/to/file.sql -o out.geojson --map tools/sql_geojson/samples/mapping.json

2. GeoJSON -> SQL

python3 tools/sql_geojson/geojson_to_sql.py path/to/file.geojson -t my_table -o out.sql

# control WKT precision (reduce decimals)

python3 tools/sql_geojson/geojson_to_sql.py path/to/file.geojson -t my_table -o out.sql --wkt-precision 6

Catatan dan limitasi

- Parser untuk SQL menggunakan heuristik; file SQL yang sangat kompleks, multiline
  dengan fungsi PostGIS yang tidak standar, atau WKB/EWKB mungkin tidak ditangani.
- Untuk pekerjaan produksi atau dataset besar, rekomendasi: muat data ke PostGIS atau
  gunakan ogr2ogr yang lebih handal.

Notes on SRID

- The SQL -> GeoJSON tool tries to extract SRID from EWKT strings (e.g. 'SRID=4326;POINT(...)')
  and from EWKB hex blobs. When an SRID is found it is attached as a top-level `srid` key on the
  GeoJSON Feature (e.g. {"type":"Feature","srid":4326,...}). You can change this behavior by
  editing the script if you prefer `_srid` or placing SRID back under `properties`.
- Skrip `geojson_to_sql.py` mengumpulkan semua kunci properti dari fitur dan
  menghasilkan kolom sesuai urutan munculnya kunci; pastikan skema tabel
  konsisten.

Mapping transforms supported

- regex extraction: mapping.json transforms.regex: {"field": {"pattern":"(...)", "group":1}}
- date parsing: transforms.date: {"field": "%Y-%m-%d"} (output ISO format)
- csv lookup: transforms.csv_lookup: {"field": {"file": "path/to/file.csv","key":0,"value":1}}
- Skrip `geojson_to_sql.py` mengumpulkan semua kunci properti dari fitur dan
  menghasilkan kolom sesuai urutan munculnya kunci; pastikan skema tabel
  konsisten.

Perbaikan yang bisa dilakukan

- Tambahkan dukungan WKB/HEX.
- Tambah flag untuk menentukan nama dan tipe kolom secara eksplisit.
- Menambahkan test suite dan CI.
