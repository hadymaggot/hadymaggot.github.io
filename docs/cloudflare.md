# Cloudflare (hanya layanan gratis)

GitHub Pages tetap menjadi situs utama dan sumber canonical. Cloudflare dipakai untuk dua hal: CI pengganti GitHub Actions (build, pengecekan, dan preview per PR) dan salinan situs dengan header keamanan. Salinan itu diberi `X-Robots-Tag: noindex` agar tidak bersaing dengan situs utama di hasil pencarian.

## Layanan dan batas free tier

| Layanan | Dipakai untuk | Batas paket Free | Bila terlampaui |
| --- | --- | --- | --- |
| Workers static assets | Menyajikan `dist/` | Request ke aset gratis dan tidak dibatasi. Maksimal 20.000 file per versi dan 25 MiB per file | Deploy ditolak |
| Workers Builds | `check_site.py` dan build di setiap push | 3.000 menit build per bulan, 1 build bersamaan, timeout 20 menit | Build ditunda atau ditolak, tidak ditagih |

Workers Free juga membatasi request yang memicu script Worker sebesar 100.000 per hari. Situs ini tidak memakai script, jadi semua request adalah request aset. Konfigurasinya dijaga `scripts/check_site.py`: `wrangler.jsonc` tidak boleh memuat `main` atau `assets.run_worker_first`, `dist/` tidak boleh melebihi 5.000 file atau 20 MiB per file, dan `cloudflare/_headers` tidak boleh melebihi 100 aturan.

Sumber: developers.cloudflare.com/workers/platform/limits, /workers/ci-cd/builds/limits-and-pricing, dan /workers/static-assets/billing-and-limitations.

## Menghubungkan repository (sekali, di dashboard)

Integrasi Git memerlukan otorisasi GitHub, jadi langkah ini dilakukan manual.

1. Buka Workers & Pages, pilih Create application, lalu Import a repository.
2. Hubungkan GitHub dan beri akses ke repository `hadymaggot/hadymaggot.github.io`.
3. Pakai akun `Saptohadi@outlook.com's Account`. Nama project harus `ahadizapto-site`, sama dengan `name` di `wrangler.jsonc`.
4. Production branch `main`. Build command: `python scripts/check_site.py && python scripts/build_dist.py`. Deploy command: `npx wrangler deploy`.
5. Pada Settings, Build, Branch control, aktifkan Preview Builds.

Hasilnya: setiap push dan PR menjalankan `check_site.py` di CI Cloudflare, dengan check run dan komentar URL preview di PR. Push ke `main` men-deploy ke `https://ahadizapto-site.saptohadi.workers.dev`. Build image Workers Builds sudah menyertakan Python 3.14.

## R2

R2 tidak diperlukan oleh situs ini. Data kecil, seperti GeoJSON beberapa MB, cukup menjadi aset statis. Jika kelak dipakai:

- Pakai hanya storage class Standard. Free tier tidak berlaku untuk Infrequent Access.
- Free tier per bulan: 10 GB-bulan storage, 1 juta operasi Class A (tulis dan list), dan 10 juta operasi Class B (baca). Egress gratis. Lebihnya ditagih: $0,015 per GB-bulan, $4,50 per juta operasi Class A, dan $0,36 per juta operasi Class B. Tidak ada batas keras, jadi pantau pemakaian.
- Batas pribadi yang dipakai di proyek ini: 5 GB.

## Domain kustom

`ahadizapto.tech` saat ini tidak memiliki DNS, sehingga tidak dapat dipakai. Domain kustom memerlukan zona di Cloudflare. Tanpa domain, salinan tetap tersedia di `workers.dev`.
