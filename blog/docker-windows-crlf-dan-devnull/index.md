# Gotcha Docker di Windows: CRLF pada Bind Mount dan /dev/null

- URL: https://hadymaggot.github.io/blog/docker-windows-crlf-dan-devnull/
- Tanggal: 2026-09-24
- Penulis: Sapto Hadi (Ahadizapto)
- Tag: Docker, Windows, Troubleshooting

> Dua masalah kecil di Windows dengan Git Bash dan Docker: shell script berakhiran CRLF dan file bernama nul yang muncul di repository.

### CRLF pada file yang di-bind mount

Menulis ulang file lewat skrip, misalnya `open(p, 'w')` di Python atau `Set-Content` di PowerShell, menghasilkan akhiran baris CRLF di Windows. Untuk file yang di-bind mount ke container Linux, ini merusak: `dash` membaca `set -e\r` sebagai `set: Illegal option -`, dan container masuk crash-loop.

`.gitattributes` dengan `*.sh text eol=lf` hanya melindungi isi yang masuk ke git. Container membaca working tree secara langsung, sebelum git menyentuhnya, sehingga perlindungan itu tidak berlaku. Gunakan tool edit bawaan editor, atau tulis dengan `newline='\n'` di Python. Setelah menulis skrip shell, periksa dengan `file <path>`; hasilnya tidak boleh menyebut CRLF, dan jika menyebut, perbaiki dengan `sed -i 's/\r$//'`. Gejala lain di container adalah `bad interpreter: /bin/sh^M`.

### /dev/null yang menjadi file nul

Pada Git Bash, argumen `/dev/null` yang diteruskan ke `docker compose exec` terkena konversi path MSYS dan sampai di container sebagai `nul`, yaitu file biasa. Karena working directory container adalah bind mount ke repository, file `nul` muncul di dalam repository dan hampir ikut ter-commit.

Buang output di sisi host, setelah perintah docker, bukan sebagai argumen yang menyeberang ke container. Periksa juga `git status --short | grep -i nul` sebelum commit. Untuk path absolut di dalam container, set `MSYS_NO_PATHCONV=1`.
docker compose exec -T app curl -s http://localhost:8000/health >/dev/null
MSYS_NO_PATHCONV=1 docker compose exec -T app sh -c 'cd /app && ls'
