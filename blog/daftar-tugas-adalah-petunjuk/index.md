# Daftar Tugas Adalah Petunjuk, Bukan Keadaan Kode

- URL: https://hadymaggot.github.io/blog/daftar-tugas-adalah-petunjuk/
- Tanggal: 2026-10-17
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Engineering, Workflow

> Butir belum dikerjakan pada daftar tugas atau ringkasan sesi belum tentu benar. Satu grep dapat menghemat seluruh pekerjaan.

Butir yang tertulis belum dikerjakan pada daftar tugas, ADR, atau ringkasan sesi belum tentu mencerminkan kode saat ini. Sebuah fitur hampir dibangun ulang dari entri `- [ ]`, padahal fitur itu sudah ada lengkap beserta test parity dua sisi. Satu grep sudah cukup untuk menghemat seluruh pekerjaan tersebut.

Kasus kembarannya terjadi di sesi kerja lain pada hari yang sama. Ringkasan bertanggal beberapa hari sebelumnya menyatakan sebuah fitur belum dibangun, padahal fitur itu selesai satu jam setelah ringkasan dibuat. Hasilnya pekerjaan ganda, ditambah perubahan di disk yang disangka berasal dari pihak lain.

### Aturan yang dipakai

Perlakukan daftar tugas sebagai petunjuk, bukan keadaan. Sebelum merancang, cek simbol kuncinya di kode.
git log -S"NamaSimbol" --oneline
grep -rn "NamaSimbol" src/
Jika butir tidak menyebut nama simbol, cari lewat gejalanya. Saat menutup sebuah butir, tulis tanggal dan buktinya agar pembaca berikutnya tidak mengulang penyelidikan yang sama. Aturan ini berlaku juga ke arah sebaliknya: sebelum melaporkan bahwa sesuatu rusak, verifikasi dulu keadaannya.
