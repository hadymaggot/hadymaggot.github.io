# Gitleaks Melewatkan Secret pada Commit Rename

- URL: https://hadymaggot.github.io/blog/gitleaks-celah-rename-detection/
- Tanggal: 2026-10-23
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Security, CI/CD, Gitleaks

> Peringatan exhaustive rename detection was skipped terlihat kosmetik, tetapi membuat commit rename tidak dipindai.

Gitleaks pada history sekitar 860 commit menampilkan peringatan `exhaustive rename detection was skipped due to too many files`. Peringatan itu tampak kosmetik, padahal berdampak pada hasil pemindaian.

Ketika git membaca sebuah commit sebagai rename murni, tidak ada isi yang di-diff, sehingga gitleaks tidak memiliki apa pun untuk diperiksa pada commit itu. Secret yang masuk lewat commit semacam itu lolos begitu saja. Perbandingan pada repository yang sama:

```
tanpa flag      861 commit terpindai, 0 temuan
--no-renames   862 commit terpindai, 1 temuan
```

Temuan satu-satunya adalah password lama yang sudah tidak aktif, pada commit yang memindahkan sebuah dokumen ke subfolder. Tidak berbahaya, tetapi cukup untuk membuktikan celahnya.

### Perbaikan

Tambahkan `--no-renames` pada pemanggilan gitleaks di workflow. Rename lalu tampil sebagai hapus dan tambah, sehingga isinya ikut diperiksa dan peringatannya hilang.

```
gitleaks detect --log-opts="--no-renames"
```

Saran git untuk menaikkan `diff.renameLimit` juga menghilangkan peringatan, tetapi menambah deteksi rename sehingga celahnya melebar, bukan tertutup. Setelah perbaikan, hasilnya 858 commit terpindai tanpa temuan dan tanpa peringatan. Karena fingerprint temuan bergantung pada commit tempat isinya muncul, baseline atau allowlist yang sudah ada perlu diperiksa ulang.
