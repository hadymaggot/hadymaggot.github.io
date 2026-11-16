"""Buat satu artikel blog harian dari memory Claude Code, lalu buka PR draft untuk ditinjau.

Alur: pilih memory yang belum dipakai -> minta model menulis artikel sebagai JSON (tanpa tool apa pun) ->
validasi (skema, register, pemindaian keamanan) -> bangun halaman di worktree sementara -> commit ->
push dan PR draft. Artikel tidak pernah dipublikasikan otomatis: PR harus ditinjau dan di-merge manual.

Contoh:
  python scripts/daily_post_run.py                      jalankan penuh
  python scripts/daily_post_run.py --dry-run            tampilkan bahan dan prompt, tanpa memanggil model
  python scripts/daily_post_run.py --fake-response r.json --base HEAD --no-push   uji alur tanpa model
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

AUTHOR = "Ahadizapto"
LOG = Path.home() / ".claude" / "blog-daily.log"
MAX_PICKS = 5
DENY_TOOLS = ["Bash", "Edit", "Write", "Read", "Glob", "Grep", "NotebookEdit", "WebFetch", "WebSearch", "Agent"]


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
    if r.returncode != 0:
        return None
    return json.loads(r.stdout.strip().splitlines()[-1])


def build_prompt(memory_text, titles, tags):
    tpl = (ROOT / "scripts" / "daily_post_prompt.md").read_text(encoding="utf-8")
    body = re.sub(r"\A---.*?---\s*", "", memory_text, count=1, flags=re.S)
    return (tpl.replace("{{TAGS}}", ", ".join(tags) or "-")
               .replace("{{JUDUL}}", "; ".join(titles) or "-")
               .replace("{{CATATAN}}", body.strip()))


def call_model(prompt, fake):
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


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--fake-response")
    ap.add_argument("--base", default="origin/main")
    ap.add_argument("--no-push", action="store_true")
    ap.add_argument("--keep", action="store_true", help="biarkan worktree sementara")
    ap.add_argument("--branch")
    args = ap.parse_args()

    today = date.today()
    stamp = datetime.now().strftime("%H%M")
    branch = args.branch or f"blog/harian-{today.isoformat()}-{stamp}"
    wt = Path(tempfile.gettempdir()) / f"blog-daily-{today.isoformat()}-{stamp}"

    if args.base.startswith("origin/"):
        need(run(["git", "-C", str(ROOT), "fetch", "-q", "origin"]), "git fetch")

    # 1. pilih bahan dan minta artikel; lewati bahan yang tidak dapat digeneralisasi
    post = None
    chosen = None
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
        try:
            data = parse_json(call_model(prompt, args.fake_response))
        except Exception as exc:  # noqa: BLE001 - satu bahan gagal tidak boleh menghentikan semuanya
            log(f"Respons tidak dapat dipakai untuk {chosen['key']}: {exc}")
            return 1
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

    # 2. rakit artikel
    article = {"id": post["id"], "title": post["title"], "date": today.isoformat(), "author": AUTHOR,
              "tags": post["tags"], "readTime": read_time(post["content"]), "excerpt": post["excerpt"],
              "content": post["content"]}

    need(run(["git", "-C", str(ROOT), "worktree", "add", "-q", "-b", branch, str(wt), args.base]), "git worktree add")
    pushed = False
    try:
        posts_dir = wt / "blog" / "posts"
        fname = f"{today.isoformat()}-{article['id']}.json"
        target = posts_dir / fname
        if any(p.name.endswith(f"-{article['id']}.json") for p in posts_dir.glob("20*.json")):
            raise RuntimeError(f"id artikel sudah dipakai: {article['id']}")
        target.write_text(json.dumps(article, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
        index_path = posts_dir / "index.json"
        index = json.loads(index_path.read_text(encoding="utf-8"))
        index["posts"].insert(0, {"file": fname, "featured": False})
        index["posts"].sort(key=lambda e: e["file"][:10], reverse=True)
        index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

        # 3. validasi dan build memakai skrip milik worktree
        py = [sys.executable, "-I"]
        v = run(py + [str(wt / "scripts" / "daily_post.py"), "validate", str(target)], cwd=wt)
        if v.returncode != 0:
            raise RuntimeError("validasi gagal:\n" + v.stdout + v.stderr)
        need(run(py + [str(wt / "scripts" / "build_blog.py")], cwd=wt), "build blog")
        need(run(py + [str(wt / "scripts" / "check_site.py")], cwd=wt), "check_site")

        # 4. commit tanpa trailer atribusi, sesuai format Conventional Commits
        need(run(["git", "-C", str(wt), "add", "-A"]), "git add")
        subject = f"docs(blog): tambah artikel {article['id'].replace('-', ' ')}"[:72]
        need(run(["git", "-C", str(wt), "commit", "-q", "-m", subject]), "git commit")
        run([sys.executable, "-I", str(ROOT / "scripts" / "daily_post.py"), "mark", chosen["path"], "--post", article["id"]])
        log(f"Artikel siap: {article['title']} (cabang {branch})")

        # 5. push dan PR draft
        if args.no_push:
            log("--no-push: berhenti sebelum push.")
        else:
            need(run(["git", "-C", str(wt), "push", "-q", "-u", "origin", branch]), "git push")
            pushed = True
            body = ("Artikel harian otomatis. Ditinjau dulu sebelum merge: pastikan tidak ada informasi klien atau "
                    "project internal, dan register tulisan sudah sesuai.\n\n"
                    "Pemeriksaan otomatis yang sudah lulus: skema artikel, lint register, pemindaian keamanan "
                    "(IP, kredensial, email, daftar tolak lokal), build halaman, dan check_site.")
            out = need(run(["gh", "pr", "create", "--draft", "--base", "main", "--head", branch, "--title", subject,
                            "--body", body], cwd=wt), "gh pr create")
            log(f"PR draft: {out.strip().splitlines()[-1]}")
    finally:
        if not args.keep:
            run(["git", "-C", str(ROOT), "worktree", "remove", "--force", str(wt)])
            if not pushed:
                run(["git", "-C", str(ROOT), "branch", "-D", branch])
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # noqa: BLE001 - kegagalan dicatat ke log agar terbaca saat dijalankan terjadwal
        log(f"Gagal: {exc}")
        sys.exit(1)
