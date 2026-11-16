# Artikel blog harian

Artikel dibuat dari catatan memory Claude Code di laptop ini sebagai draft lokal. Tidak ada yang meninggalkan laptop sebelum draft dibaca dan dipublikasikan secara eksplisit, dan tidak ada artikel yang terbit tanpa merge manual.

## Alur harian

1. `daily_post.py pick` memilih satu catatan bertipe `reference` atau `feedback` yang belum ada di ledger. Catatan yang memuat alamat IP, kredensial, atau lebih dari dua istilah pada daftar tolak tidak pernah dipilih dan tidak dikirim ke model.
2. Isi catatan dikirim ke model lewat `claude -p` tanpa tool apa pun (Bash, Read, Write, Edit, dan lainnya dinonaktifkan). Model mengembalikan JSON artikel, atau `{"skip": true}` bila pelajarannya tidak dapat digeneralisasi.
3. Validasi lokal: skema, lint register, dan pemindaian keamanan.
4. Tinjauan kedua oleh model membandingkan sumber dan artikel untuk mencari detail yang dapat mengidentifikasi klien. Hasilnya gagal tertutup: hanya `{"aman": true}` yang diterima.
5. Artikel dibangun di worktree sementara dari `origin/main`, dilewatkan ke `check_site.py`, lalu di-commit ke branch lokal `blog/harian-<tanggal>-<jam>`.
6. Ringkasan ditulis ke `~/.claude/blog-drafts/<tanggal>-<id>.md`, berisi perintah untuk membaca, mempublikasikan, atau menghapus draft. Proses berhenti di sini.

## Kerahasiaan

| Lapisan | Perlindungan |
| --- | --- |
| Pemilihan bahan | Menolak catatan dengan IP, kredensial, atau banyak istilah klien |
| Prompt | Melarang nama klien, instansi, project, host, IP, identifier kode internal, nama orang, nomor PR, dan tanggal insiden |
| Pemindaian keamanan | IP, hostname internal, kredensial, token, private key, email selain kontak publik |
| Daftar tolak lokal | Nama klien dan project pada `~/.claude/blog-denylist.txt`, ditambah istilah turunan otomatis dari nama setiap project di `~/.claude/projects`. Pencocokan per kata utuh |
| Tinjauan kedua | Model memeriksa kebocoran konteks dan menolak bila ragu |
| Draft lokal | Tidak ada push atau PR otomatis |
| Merge manual | PR draft harus di-merge pemilik blog |

Daftar tolak dan ledger berada di luar repository supaya nama klien dan nama file memory tidak ikut terpublikasi. Runner berhenti bila daftar tolak tidak ditemukan. Lokasinya dapat diganti lewat env `BLOG_DENYLIST` dan `BLOG_LEDGER`.

Pemeriksaan otomatis tidak menggantikan tinjauan. Sebelum `--publish`, baca artikel dan pastikan tidak ada konteks klien yang lolos.

## Meninjau dan mempublikasikan draft

```
python scripts/daily_post_run.py --list-drafts
git show <branch>:blog/posts/<file>.json
python scripts/daily_post_run.py --publish <branch>
git branch -D <branch>
```

`--publish` hanya menerima draft lokal yang belum di-push. Perintah itu memvalidasi ulang artikel dengan daftar tolak terbaru, mendorong branch, dan membuka PR draft. Ini satu-satunya jalur yang mengirim sesuatu keluar laptop.

## Menjadwalkan

Jadwal memakai pola yang sama seperti task `Edlink Harian`: harian jam 07:00 dengan random delay 45 menit, `StartWhenAvailable`, wajib jaringan, dan berjalan tanpa jendela.

```
powershell -ExecutionPolicy Bypass -File scripts\pasang_jadwal.ps1
```

Skrip itu membuat klon khusus di `~/.claude/blog-daily/repo` dan pembungkus `run.ps1` yang memperbarui klon ke `origin/main` sebelum menjalankan runner. Runner baru berjalan setelah PR artikel harian ter-merge ke `main`; sebelum itu, pembungkus hanya mencatat bahwa runner belum ada. Log ada di `~/.claude/blog-daily/run.log` dan `~/.claude/blog-daily.log`.

Menghapus jadwal: `Unregister-ScheduledTask -TaskName 'Blog Harian' -Confirm:$false`.

## Menguji tanpa model

```
python scripts/daily_post_run.py --dry-run
python scripts/daily_post_run.py --fake-response a.json --fake-review r.json --base HEAD --branch blog/harian-uji
```

## Mode otomatis penuh (opsional)

Secara bawaan runner hanya membuat draft lokal. Mode otomatis penuh menerbitkan artikel tanpa tinjauan manusia, dan hanya menyala bila pemilik blog menjalankannya sendiri:

```
python "%USERPROFILE%\.claude\blog-daily\repo\scripts\daily_post_run.py" --enable-auto
```

Perintah itu melakukan dua hal. Pertama, menulis `~/.claude/blog-auto.json` sebagai saklar. Kedua, memasang aturan pada branch `main` yang mewajibkan check `Workers Builds: ahadizapto-site` lulus sebelum merge (admin tetap dapat melewatinya). Setelah itu, setiap artikel yang lulus semua pemeriksaan otomatis di-push, dibuka sebagai PR biasa (bukan draft), dan dipasangi auto-merge. GitHub baru men-merge setelah check Workers Builds lulus, lalu branch dihapus otomatis oleh pengaturan repo.

Auto-merge hanya dipasang bila aturan check wajib di `main` sudah ada. Tanpa aturan itu PR akan langsung ter-merge sebelum check berjalan, jadi runner melewatinya dan mencatat alasannya di log.

Mematikan: `--disable-auto`. Saklar dihapus dan runner kembali membuat draft lokal saja. Aturan check wajib di `main` tidak dihapus.

Risiko yang perlu disadari: pada mode ini tidak ada manusia yang membaca artikel sebelum terbit. Perlindungannya seluruhnya otomatis: bahan sensitif disaring sebelum dikirim ke model, daftar tolak nama klien, pemindaian IP dan kredensial, dan tinjauan kedua oleh model yang gagal tertutup. Lapisan itu menurunkan risiko, tetapi tidak menghilangkannya. Sebuah detail yang tidak ada di daftar tolak dan lolos tinjauan model tetap dapat terbit. Jika ada keraguan, matikan mode ini dan kembali ke draft.

Pengujian tanpa mengirim apa pun: tambahkan env `BLOG_DRY_GIT=1`, maka push, pembuatan PR, auto-merge, dan pengaturan repo hanya dicatat di log.
