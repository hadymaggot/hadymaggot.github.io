"""Kumpulkan berkas situs ke dist/ untuk dideploy sebagai static assets di Cloudflare Workers.

Hanya berkas yang melayani situs yang disalin; folder tools, docs, scripts, dan .github tidak ikut.
Skrip berhenti dengan error bila hasilnya mendekati batas free tier Workers (20.000 file per versi,
25 MiB per file), supaya deploy tidak pernah gagal atau berbayar karena batas itu.

Jalankan dari root repo: python scripts/build_dist.py
"""
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

FILES = ["index.html", "blog.html", "404.html", "robots.txt", "sitemap.xml", "feed.xml", "llms.txt"]
DIRS = ["assets", "blog", "meta", ".well-known"]
SKIP_NAMES = {"README.md"}

# Batas free tier: 20.000 file per versi dan 25 MiB per file. Dipakai dengan margin.
MAX_FILES = 5000
MAX_FILE_BYTES = 20 * 1024 * 1024


def copy_tree(src, dst):
    for item in src.rglob("*"):
        if item.is_dir() or item.name in SKIP_NAMES or "__pycache__" in item.parts:
            continue
        target = dst / item.relative_to(src)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, target)


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for name in FILES:
        src = ROOT / name
        if not src.is_file():
            print(f"Berkas wajib tidak ada: {name}")
            return 1
        shutil.copy2(src, DIST / name)
    for name in DIRS:
        src = ROOT / name
        if not src.is_dir():
            print(f"Folder wajib tidak ada: {name}")
            return 1
        copy_tree(src, DIST / name)
    shutil.copy2(ROOT / "cloudflare" / "_headers", DIST / "_headers")

    files = [p for p in DIST.rglob("*") if p.is_file()]
    total = sum(p.stat().st_size for p in files)
    biggest = max(files, key=lambda p: p.stat().st_size)
    print(f"dist: {len(files)} file, {total / 1024:.0f} KB, terbesar {biggest.relative_to(DIST)} "
          f"({biggest.stat().st_size / 1024:.0f} KB)")
    if len(files) > MAX_FILES:
        print(f"Terlalu banyak file ({len(files)} > {MAX_FILES}); batas free tier 20.000 per versi.")
        return 1
    if biggest.stat().st_size > MAX_FILE_BYTES:
        print(f"File terlalu besar: {biggest.relative_to(DIST)}; batas free tier 25 MiB per file.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
