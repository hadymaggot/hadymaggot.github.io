# Checklist Ops Sebelum Deploy ke Produksi

- URL: https://hadymaggot.github.io/blog/checklist-ops-sebelum-deploy/
- Tanggal: 2026-11-16
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: DevOps, SRE, Operations

> Daftar periksa sebelum rilis: dry-run, rollback, backup yang teruji, pengelolaan secret, dan observability.

Rilis yang tenang hampir selalu hasil persiapan. Daftar periksa berikut dipakai sebelum deploy ke production.

### Sebelum rilis

Jalankan dry-run untuk setiap perubahan: `terraform plan`, `ansible-playbook --check`, atau `kubectl apply --dry-run=server`. Baca hasilnya, jangan hanya melihat status hijau. Siapkan rencana rollback tertulis yang sudah pernah dicoba, termasuk migration database yang dapat dibalik.

Pastikan backup teruji restore, bukan sekadar berkasnya ada. Pastikan secret tidak ada di repository dengan gitleaks, dan pindai image serta dependency dengan Trivy. Healthcheck dan readiness harus benar-benar mencerminkan kesiapan service.

### Saat rilis

Lakukan rilis bertahap jika memungkinkan, dan pantau error rate serta latency pada beberapa menit pertama. Tetapkan satu orang yang memegang keputusan rollback, dengan ambang batas yang disepakati sebelumnya.

### Sesudahnya

Setiap alert memiliki pemilik dan runbook, bukan hanya notifikasi. Catat hasil rilis, lalu perbarui daftar periksa ini.
