"""Buat satu artikel blog harian dari memory Claude Code sebagai draft lokal untuk ditinjau.

Tidak ada yang meninggalkan laptop sebelum disetujui: runner hanya membuat commit di branch lokal
blog/harian-*, menulis ringkasan di ~/.claude/blog-drafts, dan berhenti. Push dan PR hanya terjadi
lewat --publish, yaitu perintah eksplisit dari pemilik blog setelah membaca draft. Merge tetap manual.

Alur harian: pilih memory yang belum dipakai dan lolos penyaringan sensitif -> model menulis artikel
sebagai JSON (tanpa tool apa pun) -> validasi (skema, register, pemindaian keamanan) -> tinjauan kedua
oleh model terhadap kebocoran konteks klien (gagal tertutup) -> build di worktree sementara -> commit lokal.

Contoh:
  python scripts/daily_post_run.py                       buat draft hari ini
  python scripts/daily_post_run.py --list-drafts         daftar draft lokal
  python scripts/daily_post_run.py --publish <branch>    push dan buka PR draft untuk satu draft
  python scripts/daily_post_run.py --dry-run             tampilkan bahan dan prompt tanpa memanggil model
"""
import argparse
import json
import math
import os
import re
import subprocess
import sys
import tempfile
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import check_post_safety as safety  # noqa: E402

AUTHOR = "Ahadizapto"
LOG = Path.home() / ".claude" / "blog-daily.log"
DRAFTS = Path.home() / ".claude" / "blog-drafts"
# Pemakaian model per hari dibatasi (satu penulisan dan satu tinjauan per bahan) agar kuota langganan tidak terkuras.
MAX_PICKS = 3
MIN_DENYLIST_TERMS = 10
BRANCH_PREFIX = "blog/harian-"
DENY_TOOLS = ["Bash", "Edit", "Write", "Read", "Glob", "Grep", "NotebookEdit", "WebFetch", "WebSearch", "Agent"]

REVIEW_PROMPT = """Kamu adalah peninjau kerahasiaan untuk artikel blog publik. Pemilik blog adalah konsultan yang terikat kerahasiaan klien.

Di bawah ada SUMBER (catatan kerja yang bersifat rahasia) dan ARTIKEL (calon tulisan publik). Tentukan apakah ARTIKEL membocorkan informasi yang dapat mengidentifikasi klien, instansi, perusahaan, project, atau sistem internal, baik langsung maupun lewat kombinasi detail.

Periksa: nama klien, instansi, atau perusahaan; nama project, sistem, atau produk internal; nama class, tabel, kolom, atau service yang unik pada satu codebase; nama host, alamat IP, port, path, dan URL internal; kredensial atau nama akun; nama orang; nomor PR, issue, atau commit; tanggal insiden yang spesifik; detail bisnis atau domain yang cukup khas untuk menebak klien; serta rujukan ke AI atau asisten. Nama produk dan library publik, nama regulasi publik, dan angka teknis yang tidak khas boleh.

Jika ragu, anggap tidak aman. Keluarkan hanya satu objek JSON tanpa teks lain:
{"aman": true atau false, "temuan": ["detail yang berisiko, satu per item, tanpa mengutip kata rahasianya secara penuh"]}

## SUMBER

{{SUMBER}}

## ARTIKEL

{{ARTIKEL}}
"""


def log(msg):
    line = f"{datetime.now().isoformat(timespec='seconds')} {msg}"
    print(line)
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def run(cmd, cwd=None, input_text=None, timeout=None):
    return subprocess.run(cmd, cwd=cwd, input=input_text, capture_output=True, text=True, encoding="utf-8",
                          timeout=timeout)


def need(result, what):
    if result.returncode != 0:
        raise RuntimeError(f"{what} gagal: {(result.stderr or result.stdout).strip()[:400]}")
    return result.stdout


def existing_posts(base_dir):
    titles, tags = [], set()
    for f in sorted((base_dir / "blog" / "posts").glob("20*.json")):
        p = json.loads(f.read_text(encoding="utf-8"))
        titles.append(p["title"])
        tags.update(p.get("tags", []))
    return titles, sorted(tags)


def pick(seed):
    r = run([sys.executable, "-I", str(ROOT / "scripts" / "daily_post.py"), "pick", "--seed", seed])
    return json.loads(r.stdout.strip().splitlines()[-1]) if r.returncode == 0 else None


def build_prompt(memory_text, titles, tags):
    tpl = (ROOT / "scripts" / "daily_post_prompt.md").read_text(encoding="utf-8")
    body = re.sub(r"\A---.*?---\s*", "", memory_text, count=1, flags=re.S)
    return (tpl.replace("{{TAGS}}", ", ".join(tags) or "-")
               .replace("{{JUDUL}}", "; ".join(titles) or "-")
               .replace("{{CATATAN}}", body.strip()))


def call_model(prompt, fake=None):
    if fake:
        return Path(fake).read_text(encoding="utf-8")
    cmd = ["claude", "-p", "--no-session-persistence", "--disallowedTools", *DENY_TOOLS]
    if os.environ.get("BLOG_MODEL"):
        cmd += ["--model", os.environ["BLOG_MODEL"]]
    return need(run(cmd, input_text=prompt, timeout=600), "pemanggilan model")


def parse_json(text):
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        raise ValueError("respons model tidak memuat objek JSON")
    return json.loads(text[start:end + 1])


def read_time(html):
    words = len(re.sub(r"<[^>]+>", " ", html).split())
    return max(3, math.ceil(words / 200))


def review_article(article, source_text, fake=None):
    """Tinjauan kedua oleh model. Gagal tertutup: hanya {"aman": true} yang diterima."""
    prompt = (REVIEW_PROMPT.replace("{{SUMBER}}", re.sub(r"\A---.*?---\s*", "", source_text, count=1, flags=re.S).strip())
                           .replace("{{ARTIKEL}}", json.dumps(article, ensure_ascii=False, indent=2)))
    verdict = parse_json(call_model(prompt, fake))
    if verdict.get("aman") is not True:
        raise RuntimeError("tinjauan kerahasiaan menolak artikel: " + "; ".join(map(str, verdict.get("temuan", ["tanpa alasan"]))))


def require_denylist():
    terms, path = safety.load_denylist()
    if path is None or len(terms) < MIN_DENYLIST_TERMS:
        raise RuntimeError("daftar tolak lokal tidak ditemukan atau terlalu pendek; berhenti agar tidak ada kebocoran")


def draft_branches():
    out = need(run(["git", "-C", str(ROOT), "branch", "--list", f"{BRANCH_PREFIX}*", "--format=%(refname:short)"]), "git branch")
    local = [b for b in out.split() if b]
    remote = run(["git", "-C", str(ROOT), "branch", "-r", "--list", f"origin/{BRANCH_PREFIX}*", "--format=%(refname:short)"]).stdout.split()
    return [b for b in local if f"origin/{b}" not in remote]


def post_file_of(branch):
    # artikel ada pada commit terakhir branch; bandingkan hanya dengan induknya
    out = need(run(["git", "-C", str(ROOT), "diff-tree", "--no-commit-id", "--name-only", "-r", branch]), "git diff-tree")
    files = [f for f in out.split() if re.search(r"blog/posts/20\d\d-.*\.json$", f)]
    if len(files) != 1:
        raise RuntimeError(f"branch {branch} harus mengubah tepat satu artikel, ditemukan {len(files)}")
    return files[0]


def cmd_list_drafts():
    for b in draft_branches():
        try:
            f = post_file_of(b)
            title = json.loads(need(run(["git", "-C", str(ROOT), "show", f"{b}:{f}"]), "git show"))["title"]
        except Exception as exc:  # noqa: BLE001
            title = f"(tidak terbaca: {exc})"
        print(f"{b}\t{title}")
    return 0


def cmd_publish(branch):
    """Satu-satunya jalur yang mengirim sesuatu keluar laptop. Dijalankan manual setelah draft dibaca."""
    if not branch.startswith(BRANCH_PREFIX) or branch not in draft_branches():
        raise RuntimeError("hanya draft lokal blog/harian-* yang belum di-push yang dapat dipublikasikan")
    require_denylist()
    f = post_file_of(branch)
    content = need(run(["git", "-C", str(ROOT), "show", f"{branch}:{f}"]), "git show")
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
        tmp.write(content)
    try:
        v = run([sys.executable, "-I", str(ROOT / "scripts" / "daily_post.py"), "validate", tmp.name])
        if v.returncode != 0:
            raise RuntimeError("validasi ulang gagal:\n" + v.stdout)
    finally:
        os.unlink(tmp.name)
    title = json.loads(content)["title"]
    need(run(["git", "-C", str(ROOT), "push", "-q", "-u", "origin", branch]), "git push")
    body = ("Artikel harian. Draft ini sudah ditinjau pemilik blog sebelum dikirim. Pastikan sekali lagi tidak ada "
            "konteks klien atau project internal sebelum merge.\n\n"
            "Pemeriksaan otomatis yang lulus: skema, lint register, pemindaian keamanan (IP, kredensial, email, "
            "daftar tolak lokal), tinjauan kerahasiaan, build halaman, dan check_site.")
    out = need(run(["gh", "pr", "create", "--draft", "--base", "main", "--head", branch, "--title",
                    f"docs(blog): tambah artikel {title.lower()}"[:72], "--body", body], cwd=ROOT), "gh pr create")
    log(f"Dipublikasikan sebagai PR draft: {out.strip().splitlines()[-1]}")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--list-drafts", action="store_true")
    ap.add_argument("--publish", metavar="BRANCH")
    ap.add_argument("--fake-response", help="uji alur: JSON artikel sebagai pengganti model")
    ap.add_argument("--fake-review", help="uji alur: JSON hasil tinjauan sebagai pengganti model")
    ap.add_argument("--base", default="origin/main")
    ap.add_argument("--keep", action="store_true", help="biarkan worktree sementara")
    ap.add_argument("--branch")
    args = ap.parse_args()

    if args.list_drafts:
        return cmd_list_drafts()
    if args.publish:
        return cmd_publish(args.publish)

    require_denylist()
    today = date.today()
    stamp = datetime.now().strftime("%H%M")
    branch = args.branch or f"{BRANCH_PREFIX}{today.isoformat()}-{stamp}"
    wt = Path(tempfile.gettempdir()) / f"blog-daily-{today.isoformat()}-{stamp}"

    if args.base.startswith("origin/"):
        need(run(["git", "-C", str(ROOT), "fetch", "-q", "origin"]), "git fetch")

    # 1. pilih bahan dan minta artikel; bahan yang tidak dapat digeneralisasi dilewati
    post = chosen = memory_text = None
    for attempt in range(MAX_PICKS):
        chosen = pick(f"{today.isoformat()}-{attempt}")
        if chosen is None:
            log("Tidak ada memory baru yang memenuhi syarat.")
            return 0
        memory_text = Path(chosen["path"]).read_text(encoding="utf-8", errors="replace")
        titles, tags = existing_posts(ROOT)
        prompt = build_prompt(memory_text, titles, tags)
        if args.dry_run:
            log(f"[dry-run] bahan: {chosen['key']} (sisa kandidat {chosen['sisa_kandidat']}), prompt {len(prompt)} karakter")
            print(prompt[:1200] + ("\n..." if len(prompt) > 1200 else ""))
            return 0
        data = parse_json(call_model(prompt, args.fake_response))
        if data.get("skip"):
            log(f"Dilewati {chosen['key']}: {data.get('alasan', '-')}")
            run([sys.executable, "-I", str(ROOT / "scripts" / "daily_post.py"), "mark", chosen["path"], "--post", "SKIPPED"])
            if args.fake_response:
                return 0
            continue
        post = data
        break
    if post is None:
        log("Semua bahan yang dicoba dilewati.")
        return 0

    article = {"id": post["id"], "title": post["title"], "date": today.isoformat(), "author": AUTHOR,
               "tags": post["tags"], "readTime": read_time(post["content"]), "excerpt": post["excerpt"],
               "content": post["content"]}

    # 2. validasi lokal, lalu tinjauan kedua oleh model (gagal tertutup)
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
        json.dump(article, tmp, ensure_ascii=False)
    try:
        v = run([sys.executable, "-I", str(ROOT / "scripts" / "daily_post.py"), "validate", tmp.name])
        if v.returncode != 0:
            raise RuntimeError("validasi gagal:\n" + v.stdout + v.stderr)
    finally:
        os.unlink(tmp.name)
    review_article(article, memory_text, args.fake_review if args.fake_response else None)

    # 3. build di worktree sementara dan commit lokal tanpa trailer atribusi
    need(run(["git", "-C", str(ROOT), "worktree", "add", "-q", "-b", branch, str(wt), args.base]), "git worktree add")
    committed = False
    try:
        posts_dir = wt / "blog" / "posts"
        fname = f"{today.isoformat()}-{article['id']}.json"
        if any(p.name.endswith(f"-{article['id']}.json") for p in posts_dir.glob("20*.json")):
            raise RuntimeError(f"id artikel sudah dipakai: {article['id']}")
        (posts_dir / fname).write_text(json.dumps(article, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
        index_path = posts_dir / "index.json"
        index = json.loads(index_path.read_text(encoding="utf-8"))
        index["posts"].insert(0, {"file": fname, "featured": False})
        index["posts"].sort(key=lambda e: e["file"][:10], reverse=True)
        index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

        py = [sys.executable, "-I"]
        need(run(py + [str(wt / "scripts" / "build_blog.py")], cwd=wt), "build blog")
        need(run(py + [str(wt / "scripts" / "check_site.py")], cwd=wt), "check_site")
        need(run(["git", "-C", str(wt), "add", "-A"]), "git add")
        subject = f"docs(blog): tambah artikel {article['id'].replace('-', ' ')}"[:72]
        need(run(["git", "-C", str(wt), "commit", "-q", "-m", subject]), "git commit")
        committed = True
        run([sys.executable, "-I", str(ROOT / "scripts" / "daily_post.py"), "mark", chosen["path"], "--post", article["id"]])

        # 4. ringkasan draft untuk ditinjau pemilik blog; hanya tersimpan lokal
        DRAFTS.mkdir(parents=True, exist_ok=True)
        summary = DRAFTS / f"{today.isoformat()}-{article['id']}.md"
        summary.write_text(
            f"# {article['title']}\n\n{article['excerpt']}\n\n"
            f"Branch lokal: {branch}\nRepository: {ROOT}\n\n"
            "Baca artikel lengkap:\n\n"
            f"    git -C \"{ROOT}\" show {branch}:blog/posts/{fname}\n\n"
            "Jika aman dipublikasikan:\n\n"
            f"    python \"{ROOT / 'scripts' / 'daily_post_run.py'}\" --publish {branch}\n\n"
            "Jika tidak, hapus draft:\n\n"
            f"    git -C \"{ROOT}\" branch -D {branch}\n", encoding="utf-8")
        log(f"Draft siap ditinjau: {article['title']} (cabang {branch}, ringkasan {summary})")
    finally:
        if not args.keep:
            run(["git", "-C", str(ROOT), "worktree", "remove", "--force", str(wt)])
        if not committed:
            run(["git", "-C", str(ROOT), "branch", "-D", branch])
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # noqa: BLE001 - kegagalan dicatat ke log agar terbaca saat dijalankan terjadwal
        log(f"Gagal: {exc}")
        sys.exit(1)
