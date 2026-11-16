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


def check_blog_build():
    """Hasil build_blog.py yang di-commit harus sama dengan hasil render ulang dari sumbernya."""
    sys.path.insert(0, str(ROOT / "scripts"))
    import build_blog

    posts = build_blog.load_posts()
    for post in posts:
        page = ROOT / "blog" / post["id"] / "index.html"
        if not page.is_file():
            fail(f"blog/{post['id']}/index.html belum dibangun (jalankan scripts/build_blog.py)")
        elif page.read_text(encoding="utf-8") != build_blog.render_page(post):
            fail(f"blog/{post['id']}/index.html tidak sama dengan sumbernya (jalankan scripts/build_blog.py)")
    for name, expected in (("feed.xml", build_blog.render_feed(posts)), ("sitemap.xml", build_blog.render_sitemap(posts))):
        target = ROOT / name
        if not target.is_file() or target.read_text(encoding="utf-8") != expected:
            fail(f"{name} tidak sama dengan hasil build (jalankan scripts/build_blog.py)")


def check_post_safety():
    """Artikel tidak boleh memuat IP, kredensial, email pribadi, atau istilah pada daftar tolak lokal."""
    sys.path.insert(0, str(ROOT / "scripts"))
    import check_post_safety as safety

    terms, _ = safety.load_denylist()
    for f in sorted((ROOT / "blog" / "posts").glob("20*.json")):
        for problem in safety.scan(json.loads(f.read_text(encoding="utf-8")), terms):
            fail(f"{f.name}: {problem}")


def check_cloudflare():
    """Pengaman free tier Cloudflare: Worker hanya aset statis, aturan header di bawah batas, dan dist lengkap."""
    cfg = (ROOT / "wrangler.jsonc").read_text(encoding="utf-8")
    cfg = re.sub(r"^\s*//.*$", "", cfg, flags=re.M)
    data = json.loads(cfg)
    if "main" in data:
        fail('wrangler.jsonc: "main" membuat Worker memproses request dan menghitung ke batas 100.000 per hari')
    if "run_worker_first" in data.get("assets", {}):
        fail("wrangler.jsonc: assets.run_worker_first membuat request menghitung ke batas harian paket Free")
    if data.get("assets", {}).get("directory") != "./dist":
        fail("wrangler.jsonc: assets.directory harus ./dist")

    rules = [ln for ln in (ROOT / "cloudflare" / "_headers").read_text(encoding="utf-8").splitlines()
             if ln and not ln.startswith(" ") and not ln.startswith("\t") and not ln.startswith("#")]
    if len(rules) > 100:
        fail(f"cloudflare/_headers: {len(rules)} aturan, batas 100")

    sys.path.insert(0, str(ROOT / "scripts"))
    import build_dist

    if build_dist.main() != 0:
        fail("build_dist.py gagal atau melewati batas free tier")
        return
    dist = build_dist.DIST
    pages = [dist / "index.html", dist / "blog.html", dist / "404.html"] + sorted((dist / "blog").glob("*/index.html"))
    pattern = re.compile(r'(?:href|src)="([^"]+)"')
    for page in pages:
        for ref in pattern.findall(page.read_text(encoding="utf-8")):
            target = local_target(ref)
            if target is None:
                continue
            in_dist = dist / target.relative_to(ROOT)
            if not in_dist.exists():
                fail(f"dist: {page.relative_to(dist)} menautkan {ref} yang tidak ada di dist")


def main():
    check_json()
    check_xml()
    check_links()
    check_robots_and_sitemap()
    check_security_txt()
    check_blog_build()
    check_post_safety()
    check_cloudflare()
    if errors:
        print("Pengecekan gagal:")
        for e in errors:
            print(f"  - {e}")
        return 1
    print("Semua pengecekan lulus.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
