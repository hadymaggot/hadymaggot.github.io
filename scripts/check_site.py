"""Pengecekan statis untuk situs: JSON/XML valid, tautan internal ada, robots dan sitemap konsisten.

Jalankan dari root repo: python scripts/check_site.py
"""
import json
import re
import sys
import xml.dom.minidom
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://hadymaggot.github.io"
PAGES = ["index.html", "blog.html"]

errors = []


def fail(msg):
    errors.append(msg)


def check_json():
    files = sorted((ROOT / "blog" / "posts").glob("*.json")) + [ROOT / "meta" / "manifest.json"]
    for f in files:
        try:
            json.loads(f.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            fail(f"{f.relative_to(ROOT)}: JSON tidak valid ({exc})")

    index = ROOT / "blog" / "posts" / "index.json"
    try:
        entries = json.loads(index.read_text(encoding="utf-8"))["posts"]
    except (OSError, ValueError, KeyError) as exc:
        fail(f"blog/posts/index.json: tidak bisa dibaca ({exc})")
        return
    for entry in entries:
        if not (index.parent / entry["file"]).is_file():
            fail(f"blog/posts/index.json: berkas {entry['file']} tidak ada")


def check_xml():
    try:
        xml.dom.minidom.parse(str(ROOT / "sitemap.xml"))
    except Exception as exc:  # parser menaikkan beberapa jenis galat
        fail(f"sitemap.xml: XML tidak valid ({exc})")


def local_target(ref):
    """Petakan tautan internal ke berkas di repo, atau None kalau bukan tautan internal."""
    parsed = urlparse(ref)
    if parsed.scheme in ("http", "https"):
        if parsed.netloc != urlparse(BASE_URL).netloc:
            return None
        path = parsed.path
    elif parsed.scheme or ref.startswith("//") or ref.startswith("#"):
        return None
    else:
        path = parsed.path
    if not path.startswith("/"):
        return None
    path = path[1:] or "index.html"
    if path.endswith("/"):
        path += "index.html"
    return ROOT / path


def check_links():
    pattern = re.compile(r'(?:href|src)="([^"]+)"')
    for page in PAGES:
        html = (ROOT / page).read_text(encoding="utf-8")
        for ref in pattern.findall(html):
            target = local_target(ref)
            if target is not None and not target.exists():
                fail(f"{page}: tautan internal {ref} tidak ada berkasnya")
        if f'rel="canonical" href="{BASE_URL}' not in html:
            fail(f"{page}: canonical tidak mengarah ke {BASE_URL}")


def check_robots_and_sitemap():
    robots = ROOT / "robots.txt"
    if not robots.is_file():
        fail("robots.txt tidak ada di root")
        return
    if f"Sitemap: {BASE_URL}/sitemap.xml" not in robots.read_text(encoding="utf-8"):
        fail("robots.txt: baris Sitemap tidak mengarah ke /sitemap.xml")
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    for page in ("/", "/blog.html"):
        if f"<loc>{BASE_URL}{page}</loc>" not in sitemap:
            fail(f"sitemap.xml: {page} belum terdaftar")


def check_security_txt():
    text = (ROOT / ".well-known" / "security.txt").read_text(encoding="utf-8")
    for field in ("Contact:", "Expires:"):
        if field not in text:
            fail(f".well-known/security.txt: field {field} wajib ada (RFC 9116)")


def main():
    check_json()
    check_xml()
    check_links()
    check_robots_and_sitemap()
    check_security_txt()
    if errors:
        print("Pengecekan gagal:")
        for e in errors:
            print(f"  - {e}")
        return 1
    print("Semua pengecekan lulus.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
