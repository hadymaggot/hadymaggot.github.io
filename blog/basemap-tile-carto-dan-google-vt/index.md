# Basemap Tile: Watermark CARTO dan Larangan Google vt

- URL: https://hadymaggot.github.io/blog/basemap-tile-carto-dan-google-vt/
- Tanggal: 2026-09-29
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: GIS, Web, Operations

> Sumber tile yang gagal secara senyap: HTTP 200 dengan gambar watermark, dan endpoint internal yang tidak boleh dipakai.

Pada aplikasi peta, dua sumber tile bermasalah dengan cara yang tidak terlihat di monitoring biasa.

### CARTO menutup akses anonim

`basemaps.cartocdn.com` tetap menjawab HTTP 200, tetapi isinya gambar watermark berisi tulisan API key wajib. Kegagalannya senyap karena tidak ada status error yang dapat dipantau. Pemeriksaan yang berguna adalah memuat satu tile contoh dan membandingkan ukuran atau hash-nya dengan watermark yang dikenal.

### Endpoint Google vt bukan opsi

Endpoint `mt1.google.com/vt/lyrs=...` adalah endpoint internal Google Maps: tanpa key, tanpa dokumentasi, dan di luar ketentuan layanan Maps Platform. Walau terlihat berfungsi, jangan dihidupkan kembali. Penggunaan Google Maps yang sah adalah Maps JavaScript API atau Map Tiles API, dan keduanya mewajibkan billing aktif.

### Konfigurasi yang dipakai

Pusatkan semua sumber tile pada satu modul, sehingga penggantian sumber tidak menyebar ke banyak komponen. Pilihan yang tidak memerlukan key adalah Esri (satelit, jalan, topografi, kanvas abu-abu), OpenStreetMap, dan OpenTopoMap, dengan memperhatikan kebijakan penggunaan masing-masing. Atur `maxZoom` per sumber, karena zoom di atas batas sumber menghasilkan tile kosong.

```
export const TILES = {
  satelit: { url: '.../World_Imagery/MapServer/tile/{z}/{y}/{x}', maxZoom: 19 },
  osm:     { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19 },
}
```
