"""Pemindai konten artikel blog sebelum dipublikasikan.

Memblokir data yang tidak boleh keluar ke situs publik: alamat IP, email selain kontak publik,
kredensial, private key, dan istilah pada daftar tolak lokal (nama klien, nama project internal).

Daftar tolak lokal tidak disimpan di repository supaya nama klien tidak ikut terpublikasi.
Lokasinya diambil dari env BLOG_DENYLIST, atau ~/.claude/blog-denylist.txt (satu istilah per baris,
baris berawalan # diabaikan, pencocokan tidak membedakan huruf besar-kecil).

Jalankan dari root repo: python scripts/check_post_safety.py [berkas.json ...]
Tanpa argumen, semua artikel di blog/posts dipindai.
"""
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_EMAIL = "saptohadi@outlook.com"

RULES = [
    ("alamat IP", re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")),
    ("alamat IPv6", re.compile(r"\b(?:[0-9a-fA-F]{1,4}:){4,7}[0-9a-fA-F]{1,4}\b")),
    ("hostname internal", re.compile(r"\b[\w-]+\.(?:local|internal|lan|corp|intra)\b", re.I)),
    ("private key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("token GitHub", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b")),
    ("access key AWS", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("token Slack", re.compile(r"\bxox[abprs]-[A-Za-z0-9-]{10,}\b")),
    ("kredensial dalam URL", re.compile(r"\b[a-z][a-z0-9+.-]*://[^/\s:@]+:[^/\s@]+@")),
    ("password atau secret literal", re.compile(r"\b(?:password|passwd|secret|api[_-]?key|token)\s*[=:]\s*['\"]?[^\s'\"<>&]{6,}", re.I)),
]
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")


# Nama project milik sendiri yang boleh disebut di artikel.
PUBLIC_PROJECTS = {"automation", "security-audit-kit", "hadymaggot-github-io"}


def derive_project_terms():
    """Nama project di ~/.claude/projects dijadikan istilah tolak, supaya project baru otomatis terlindungi."""
    base = Path.home() / ".claude" / "projects"
    terms = set()
    if not base.is_dir():
        return terms
    for d in base.iterdir():
        name = re.sub(r"^[a-zA-Z]--(?:GitHub-)?", "", d.name).lower()
        name = re.sub(r"--claude-worktrees-.*$", "", name)
        if "appdata" in name or "temp" in name or name in PUBLIC_PROJECTS or len(name) < 5:
            continue
        if name.startswith("automation-"):
            name = name[len("automation-"):]
        if name not in PUBLIC_PROJECTS and len(name) >= 5:
            terms.add(name)
    return terms


def load_denylist():
    path = Path(os.environ.get("BLOG_DENYLIST") or Path.home() / ".claude" / "blog-denylist.txt")
    if not path.is_file():
        return [], None
    terms = {ln.strip().lower() for ln in path.read_text(encoding="utf-8").splitlines()
             if ln.strip() and not ln.lstrip().startswith("#")}
    terms |= derive_project_terms()
    return sorted(terms), path


def denied(term, lowered):
    """Cocok per kata utuh, supaya istilah pendek tidak salah menandai kata lain (upt pada corrupt)."""
    return re.search(r"(?<![a-z0-9])" + re.escape(term) + r"(?![a-z0-9])", lowered) is not None


def strip_html(text):
    text = re.sub(r"<[^>]+>", " ", text)
    return (text.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
            .replace("&quot;", '"').replace("&#39;", "'"))


def scan(post, terms):
    problems = []
    fields = [("id", post.get("id", "").replace("-", " ")), ("title", post.get("title", "")),
              ("excerpt", post.get("excerpt", "")),
              ("content", strip_html(post.get("content", ""))), ("tags", " ".join(post.get("tags", [])))]
    for field, text in fields:
        for label, pattern in RULES:
            for m in pattern.finditer(text):
                value = m.group(0)
                # versi image seperti 1.2.3.4 pada angka versi tidak dianggap IP bila tiap bagian > 255
                if label == "alamat IP" and any(int(p) > 255 for p in value.split(".")):
                    continue
                problems.append(f"{field}: {label} ({value[:40]})")
        for m in EMAIL.finditer(text):
            if m.group(0).lower() != PUBLIC_EMAIL:
                problems.append(f"{field}: email selain kontak publik ({m.group(0)})")
        lowered = text.lower()
        # id memakai tanda hubung, sedangkan istilah tolak dapat berupa slug; periksa kedua bentuk
        if field == "id":
            lowered += " " + post.get("id", "").lower()
        for term in terms:
            if denied(term, lowered):
                problems.append(f"{field}: istilah pada daftar tolak lokal")
                break
    return problems


def main(argv):
    terms, path = load_denylist()
    files = [Path(a) for a in argv] or sorted((ROOT / "blog" / "posts").glob("20*.json"))
    failed = False
    for f in files:
        post = json.loads(f.read_text(encoding="utf-8"))
        problems = scan(post, terms)
        if problems:
            failed = True
            print(f"{f.name}:")
            for p in problems:
                print(f"  - {p}")
    if path is None:
        print("Peringatan: daftar tolak lokal tidak ditemukan, hanya aturan generik yang dipakai.")
    if failed:
        print("Pemindaian keamanan artikel gagal.")
        return 1
    print(f"Pemindaian keamanan artikel lulus ({len(files)} berkas).")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
