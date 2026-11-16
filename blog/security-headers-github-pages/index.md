# Security Headers di GitHub Pages: Apa yang Bisa dan Tidak

- URL: https://hadymaggot.github.io/blog/security-headers-github-pages/
- Tanggal: 2026-11-16
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Security, Web, Cloudflare

> GitHub Pages tidak mengizinkan header HTTP kustom. Berikut yang tetap dapat dilakukan, dan kapan proxy diperlukan.

GitHub Pages praktis untuk situs statis, tetapi header respons tidak dapat diatur sendiri. Hal ini membatasi kontrol keamanan yang dapat dipasang.

### Yang tetap dapat dilakukan

HTTPS dapat dipaksa lewat pengaturan Pages. CSP dapat dipasang lewat tag `<meta http-equiv="Content-Security-Policy">`, dengan batasan: `frame-ancestors`, `report-uri`, dan `sandbox` tidak didukung. Hindari inline script dan style agar CSP yang ketat dapat dipasang kemudian, dan beri atribut `integrity` (SRI) pada script dan stylesheet dari CDN.

Pasang `/.well-known/security.txt` berisi kontak pelaporan dan tanggal `Expires` sesuai RFC 9116. `robots.txt` dan `sitemap.xml` harus berada di root, bukan di subfolder.

### Jika membutuhkan header sungguhan

Gunakan custom domain dan tempatkan proxy seperti Cloudflare di depannya. Header seperti HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, dan CSP lengkap ditambahkan lewat aturan transformasi respons.

### Verifikasi

Periksa respons yang sebenarnya, bukan konfigurasinya. Audit header dan TLS dari luar secara berkala, dan catat hasilnya agar regresi terlihat.
