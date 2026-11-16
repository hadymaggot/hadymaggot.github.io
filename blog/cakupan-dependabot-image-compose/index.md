# Cakupan Dependabot: Image di docker-compose Luput Dipantau

- URL: https://hadymaggot.github.io/blog/cakupan-dependabot-image-compose/
- Tanggal: 2026-09-04
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Security, Dependabot, Docker

> Ekosistem docker pada Dependabot hanya memindai direktori yang dikonfigurasi. Deklarasi image di docker-compose.yml bisa luput sepenuhnya.

Konfigurasi Dependabot untuk ekosistem docker yang hanya mencakup `/docker/*` memindai Dockerfile di direktori itu, tetapi tidak membaca `docker-compose.yml` di root. Pada repository ini, 23 deklarasi `image:` tidak terpantau sama sekali: message broker, reverse proxy, object storage, stack monitoring, dan lainnya. Dua image di antaranya tertinggal beberapa versi dari rilis stabil terbaru.

Perbaikannya menambahkan `"/"` pada daftar `directories`.
- package-ecosystem: docker
  directories: ["/docker/*", "/"]
  target-branch: development
### Tag latest dan digest

Tag `:latest` yang dipatok dengan `@sha256:` tetap dapat diulang, karena digest yang menentukan isi image. Masalahnya bukan isi yang bergeser sendiri, melainkan digest yang tidak pernah diperbarui karena tidak ada yang memeriksanya.

### Branch tujuan dan aturan image dasar

Tanpa `target-branch`, setiap kenaikan dependency masuk sebagai PR ke branch default, dipindai di sana, dan main yang tersandera jika hasilnya merah. Arahkan ke branch integrasi, dan jalankan pemindaian keamanan pada setiap push ke branch itu agar sudah tersapu sebelum PR ke main dibuka.

Aturan untuk image dasar: hanya LTS atau stable, dan yang terbaru dari keduanya. Versi current, edge, atau RC ditolak seberapa pun barunya, karena Dependabot tidak mengetahui status LTS sebuah rilis.
