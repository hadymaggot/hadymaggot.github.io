# Artikel blog harian

Artikel dibuat dari catatan memory Claude Code di laptop ini, lalu masuk sebagai PR draft untuk ditinjau. Tidak ada artikel yang terbit tanpa merge manual.

## Alur

1. `daily_post.py pick` memilih satu catatan bertipe `reference` atau `feedback` yang belum ada di ledger. Pemilihan acak, dengan seed tanggal.
2. Isi catatan dikirim ke model lewat `claude -p` tanpa tool apa pun (Bash, Read, Write, Edit, dan lainnya dinonaktifkan). Model hanya mengembalikan JSON artikel, atau `{"skip": true}` bila pelajarannya tidak dapat digeneralisasi.
3. Runner membuat worktree sementara dari `origin/main`, menulis artikel, lalu menjalankan validasi: skema, lint register, pemindaian keamanan, build halaman, dan `check_site.py`.
4. Jika semua lulus, runner membuat satu commit, push ke branch `blog/harian-<tanggal>-<jam>`, dan membuka PR draft.
5. Catatan yang sudah dipakai dicatat di ledger agar tidak diulang.

## Pemeriksaan sebelum artikel dibuat

| Pemeriksaan | Memblokir |
| --- | --- |
| Skema | kunci wajib hilang, id bukan slug, tanggal salah format, tag di luar 1 sampai 4, tag HTML terlarang |
| Lint register | slang (cuma, bikin, biar, dan sejenisnya) dan istilah teknis yang diterjemahkan (berkas, antrean, galat, dan sejenisnya) |
| Pemindaian keamanan | alamat IP, hostname internal, kredensial, token, private key, email selain kontak publik |
| Daftar tolak lokal | nama klien dan project internal pada `~/.claude/blog-denylist.txt` |

Daftar tolak dan ledger berada di luar repository supaya nama klien dan nama berkas memory tidak ikut terpublikasi. Lokasinya dapat diganti lewat env `BLOG_DENYLIST` dan `BLOG_LEDGER`.

Pemeriksaan otomatis tidak menggantikan tinjauan. Sebelum merge, baca artikel dan pastikan tidak ada konteks klien yang lolos.

## Menjalankan manual

```
python scripts/daily_post_run.py --dry-run
python scripts/daily_post_run.py
```

`--dry-run` hanya menampilkan bahan dan prompt. Opsi `--fake-response <berkas.json> --base HEAD --no-push` menguji seluruh alur tanpa memanggil model dan tanpa push.

## Menjadwalkan di Windows

Runner perlu laptop menyala, `claude` dan `gh` sudah login, dan repository ini sudah ter-clone dengan semua PR terkait ter-merge ke `main` (worktree dibuat dari `origin/main`).

```
schtasks /Create /SC DAILY /ST 08:00 /TN "BlogHarian" /TR "python D:\automation\hadymaggot.github.io\scripts\daily_post_run.py"
```

Hasil dan error dicatat di `~/.claude/blog-daily.log`. Untuk menghentikan: `schtasks /Delete /TN "BlogHarian" /F`.
