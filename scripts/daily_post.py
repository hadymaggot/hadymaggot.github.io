"""Alat bantu untuk artikel blog harian yang bersumber dari memory Claude Code di laptop ini.

Subcommand:
  pick      pilih satu memory yang belum dipakai sebagai bahan artikel berikutnya
  lint      periksa register tulisan (slang dan istilah teknis yang diterjemahkan)
  validate  periksa satu artikel: skema, lint, dan pemindaian keamanan
  mark      catat memory yang sudah dipakai ke ledger

Ledger disimpan di luar repository (~/.claude/blog-ledger.json, atau env BLOG_LEDGER) karena memuat nama
berkas memory yang bisa mengungkap nama project.
"""
import argparse
import hashlib
import json
import os
import random
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import check_post_safety as safety  # noqa: E402

MEMORY_GLOB = "*/memory/*.md"
DEFAULT_TYPES = ("reference", "feedback")
MIN_CHARS, MAX_CHARS = 500, 9000

# Slang yang ditolak pada register netral-teknis.
SLANG = ["cuma", "bikin", "ngecek", "biar", "nggak", "ngga", "gak", "gampang", "banget", "kebaca", "nyempil",
         "nempel", "nyangkut", "ketangkep", "udah", "sih", "deh", "dong", "kok"]
# Istilah teknis yang tidak boleh diterjemahkan: terjemahan -> istilah yang dipakai.
TRANSLATED = {
    "berkas": "file", "unggah": "upload", "unduh": "download", "kueri": "query", "basis data": "database",
    "peramban": "browser", "pustaka": "library", "antarmuka": "interface", "tautan": "link", "muatan": "payload",
    "larik": "array", "gerbang": "gateway", "penyaringan": "filtering", "keluaran": "output",
    "dependensi": "dependency", "pratinjau": "preview", "kata sandi": "password", "sandi": "password",
    "kunci api": "API key", "galat": "error", "cadangan": "backup", "pencadangan": "backup", "templat": "template",
    "antrean": "queue", "pemuat": "loader", "skema": "schema",
}
REQUIRED_KEYS = ("id", "title", "date", "author", "tags", "readTime", "excerpt", "content")
FORBIDDEN_HTML = re.compile(r"<\s*(script|iframe|object|embed|style)\b|\son\w+\s*=|javascript:", re.I)


def ledger_path():
    return Path(os.environ.get("BLOG_LEDGER") or Path.home() / ".claude" / "blog-ledger.json")


def load_ledger():
    p = ledger_path()
    return json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {"used": {}}


def memory_files():
    base = Path.home() / ".claude" / "projects"
    return [f for f in base.glob(MEMORY_GLOB) if f.name != "MEMORY.md"]


def memory_type(text):
    m = re.search(r"^\s*type:\s*(\w+)", text, re.M)
    return m.group(1) if m else ""


SENSITIVE_WORDS = re.compile(r"\b(kredensial|password|passwd|kata sandi|secret|private key|api key|ssh key|token akses)\b", re.I)
MAX_CLIENT_TERMS = 2


def sensitive_source(text, terms):
    """Bahan yang memuat IP, kredensial, atau banyak istilah klien tidak dikirim ke model sama sekali."""
    if SENSITIVE_WORDS.search(text):
        return True
    for label, pattern in safety.RULES:
        if label == "password atau secret literal":
            continue
        for m in pattern.finditer(text):
            # angka versi seperti 1.2.3.400 bukan alamat IP
            if label == "alamat IP" and any(int(p) > 255 for p in m.group(0).split(".")):
                continue
            return True
    lowered = text.lower()
    hits = sum(1 for t in terms if safety.denied(t, lowered))
    return hits > MAX_CLIENT_TERMS


def cmd_pick(args):
    ledger = load_ledger()
    types = tuple(t for t in args.types.split(",") if t)
    terms, _ = safety.load_denylist()
    candidates = []
    for f in memory_files():
        key = f"{f.parent.parent.name}/{f.name}"
        if key in ledger["used"]:
            continue
        text = f.read_text(encoding="utf-8", errors="replace")
        if memory_type(text) not in types or not (MIN_CHARS <= len(text) <= MAX_CHARS):
            continue
        if sensitive_source(text, terms):
            continue
        candidates.append((key, f))
    if not candidates:
        print("Tidak ada memory baru yang memenuhi syarat.")
        return 1
    rng = random.Random(args.seed or date.today().isoformat())
    key, f = rng.choice(sorted(candidates))
    print(json.dumps({"key": key, "path": str(f), "sisa_kandidat": len(candidates)}, ensure_ascii=False))
    return 0


def strip_code(html):
    return re.sub(r"<pre\b.*?</pre>", " ", html, flags=re.S | re.I)


def lint_text(text):
    """Periksa prosa, bukan blok kode. Kembalikan daftar pelanggaran."""
    plain = safety.strip_html(strip_code(text)).lower()
    issues = []
    for word in SLANG:
        if re.search(rf"\b{re.escape(word)}\b", plain):
            issues.append(f"slang: '{word}'")
    for term, use in TRANSLATED.items():
        if re.search(rf"\b{re.escape(term)}\b", plain):
            issues.append(f"istilah diterjemahkan: '{term}' (pakai '{use}')")
    return issues


def validate_post(path):
    problems = []
    post = json.loads(Path(path).read_text(encoding="utf-8"))
    missing = [k for k in REQUIRED_KEYS if k not in post]
    if missing:
        return [f"kunci wajib hilang: {', '.join(missing)}"]
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", post["id"]):
        problems.append("id harus slug huruf kecil dengan tanda hubung")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", post["date"]):
        problems.append("date harus berformat YYYY-MM-DD")
    if not (isinstance(post["tags"], list) and 1 <= len(post["tags"]) <= 4):
        problems.append("tags harus berisi 1 sampai 4 item")
    if not (isinstance(post["readTime"], int) and post["readTime"] >= 1):
        problems.append("readTime harus bilangan bulat positif")
    if len(post["title"]) > 62:
        problems.append("title terlalu panjang (maksimal 62 karakter agar tidak terpotong di hasil pencarian)")
    if len(post["excerpt"]) > 260:
        problems.append("excerpt terlalu panjang (maksimal 260 karakter)")
    if FORBIDDEN_HTML.search(post["content"]):
        problems.append("content memuat tag atau atribut yang tidak diizinkan")
    problems += [f"lint: {i}" for i in lint_text(" ".join([post["title"], post["excerpt"], post["content"]]))]
    terms, _ = safety.load_denylist()
    problems += [f"keamanan: {i}" for i in safety.scan(post, terms)]
    return problems


def cmd_lint(args):
    failed = False
    files = [Path(a) for a in args.files] or sorted((ROOT / "blog" / "posts").glob("20*.json"))
    for f in files:
        post = json.loads(f.read_text(encoding="utf-8"))
        issues = lint_text(" ".join([post["title"], post["excerpt"], post["content"]]))
        if issues:
            failed = True
            print(f"{f.name}: " + "; ".join(sorted(set(issues))))
    print("Lint register gagal." if failed else "Lint register lulus.")
    return 1 if failed else 0


def cmd_validate(args):
    problems = validate_post(args.file)
    for p in problems:
        print(f"  - {p}")
    print("Validasi gagal." if problems else "Validasi lulus.")
    return 1 if problems else 0


def cmd_mark(args):
    ledger = load_ledger()
    f = Path(args.path)
    key = f"{f.parent.parent.name}/{f.name}"
    ledger["used"][key] = {"tanggal": date.today().isoformat(),
                           "sha1": hashlib.sha1(f.read_bytes()).hexdigest()[:12], "artikel": args.post}
    p = ledger_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(ledger, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Dicatat: {key}")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("pick")
    p.add_argument("--types", default=",".join(DEFAULT_TYPES))
    p.add_argument("--seed")
    p.set_defaults(fn=cmd_pick)
    p = sub.add_parser("lint")
    p.add_argument("files", nargs="*")
    p.set_defaults(fn=cmd_lint)
    p = sub.add_parser("validate")
    p.add_argument("file")
    p.set_defaults(fn=cmd_validate)
    p = sub.add_parser("mark")
    p.add_argument("path")
    p.add_argument("--post", required=True)
    p.set_defaults(fn=cmd_mark)
    args = ap.parse_args()
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
