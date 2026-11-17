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
    hint = "(jalankan scripts/build_blog.py)"
    for rel, expected in build_blog.generated_files(posts).items():
        target = ROOT / rel
        if not target.is_file():
            fail(f"{rel} belum dibangun {hint}")
        elif target.read_text(encoding="utf-8") != expected:
            fail(f"{rel} tidak sama dengan hasil build {hint}")
    for rel in build_blog.INJECTIONS:
        current = (ROOT / rel).read_text(encoding="utf-8")
        try:
            if build_blog.injected_text(rel, posts) != current:
                fail(f"{rel}: bagian otomatis tidak sama dengan hasil build {hint}")
        except ValueError as exc:
            fail(f"{rel}: {exc}")
    for p in posts:
        if not (ROOT / build_blog.og_path(p)).is_file():
            fail(f"{build_blog.og_path(p)} belum dibuat {hint}")
    if not (ROOT / build_blog.OG_DEFAULT).is_file():
        fail(f"{build_blog.OG_DEFAULT} belum dibuat {hint}")


def meta_content(html, attr, name):
    m = re.search(rf'<meta\s+{attr}="{re.escape(name)}"\s+content="([^"]*)"', html)
    return m.group(1) if m else None


def check_seo():
    """Judul, deskripsi, h1, canonical, Open Graph, dan JSON-LD untuk setiap halaman yang diindeks."""
    import html as htmllib

    pages = [ROOT / "index.html", ROOT / "blog.html"]
    pages += sorted((ROOT / "blog").glob("*/index.html")) + sorted((ROOT / "blog" / "tag").glob("*/index.html"))
    titles, descs = {}, {}
    for page in pages:
        rel = page.relative_to(ROOT).as_posix()
        text = page.read_text(encoding="utf-8")
        title = re.search(r"<title>(.*?)</title>", text, re.S)
        title = htmllib.unescape(title.group(1).strip()) if title else ""
        desc = htmllib.unescape(meta_content(text, "name", "description") or "")
        if not (10 <= len(title) <= 70):
            fail(f"{rel}: panjang title {len(title)} (harus 10 sampai 70)")
        if not (70 <= len(desc) <= 165):
            fail(f"{rel}: panjang meta description {len(desc)} (harus 70 sampai 165)")
        if titles.setdefault(title, rel) != rel:
            fail(f"{rel}: title sama dengan {titles[title]}")
        if descs.setdefault(desc, rel) != rel:
            fail(f"{rel}: meta description sama dengan {descs[desc]}")
        if len(re.findall(r"<h1[\s>]", text)) != 1:
            fail(f"{rel}: harus memiliki tepat satu h1")
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', text)
        expected = BASE_URL + "/" + ("" if rel == "index.html" else rel.replace("/index.html", "/"))
        if not canonical or canonical.group(1) != expected:
            fail(f"{rel}: canonical harus {expected}")
        for prop in ("og:title", "og:description", "og:url", "og:image", "og:type"):
            if not meta_content(text, "property", prop):
                fail(f"{rel}: meta {prop} tidak ada")
        if not meta_content(text, "name", "twitter:image"):
            fail(f"{rel}: meta twitter:image tidak ada")
        for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
            try:
                json.loads(raw)
            except ValueError as exc:
                fail(f"{rel}: JSON-LD tidak valid ({exc})")
        if '<script type="application/ld+json">' not in text:
            fail(f"{rel}: JSON-LD tidak ada")
        image = meta_content(text, "property", "og:image") or ""
        target = local_target(image)
        if target is not None and not target.exists():
            fail(f"{rel}: og:image {image} tidak ada berkasnya")


def check_post_safety():
    """Artikel tidak boleh memuat IP, kredensial, email pribadi, atau istilah pada daftar tolak lokal."""
    sys.path.insert(0, str(ROOT / "scripts"))
    import check_post_safety as safety

    terms, _ = safety.load_denylist()
    for f in sorted((ROOT / "blog" / "posts").glob("20*.json")):
        for problem in safety.scan(json.loads(f.read_text(encoding="utf-8")), terms):
            fail(f"{f.name}: {problem}")


def check_code_blocks():
    """Setiap blok kode pada artikel wajib menyebut bahasanya, untuk penyorotan sintaks dan label."""
    for f in sorted((ROOT / "blog" / "posts").glob("20*.json")):
        content = json.loads(f.read_text(encoding="utf-8"))["content"]
        bad = len(re.findall(r"<pre><code(?![^>]*\bclass=\"language-)", content))
        if bad:
            fail(f"{f.name}: {bad} blok kode tanpa class=\"language-...\"")
    if not (ROOT / "assets" / "js" / "vendor" / "highlight.min.js").is_file():
        fail("assets/js/vendor/highlight.min.js tidak ada")


STALE_PHRASES = ("GIS Engineer", "engineer di bidang security, operations", "engineer security,", "Security, Operations, dan GIS",
                 "Full-stack Developer", "full-stack developer dan DevOps", "Development, DevOps, Security",
                 "development, DevOps, security", "web development, DevOps, cybersecurity")
TAGLINE = "Security, Operations, dan Software Engineer"
CAPTION = "Security | Operations | Software Engineer"
OSS_PR = "torproject/community/pull/149"


def check_consistency():
    """Jabatan, daftar skills, dan proyek publik harus sama di menu terminal, ringkasan, dan llms.txt."""
    files = ["index.html", "blog.html", "assets/js/main.js", "llms.txt", "scripts/build_blog.py"]
    for rel in files:
        text = (ROOT / rel).read_text(encoding="utf-8")
        for phrase in STALE_PHRASES:
            if phrase in text:
                fail(f"{rel}: masih memuat frasa jabatan lama \"{phrase}\"")

    js = (ROOT / "assets" / "js" / "main.js").read_text(encoding="utf-8")
    if CAPTION not in js or CAPTION not in (ROOT / "index.html").read_text(encoding="utf-8"):
        fail(f"caption banner harus sama di index.html dan main.js: {CAPTION}")
    for rel in ("index.html", "blog.html"):
        if TAGLINE not in (ROOT / rel).read_text(encoding="utf-8"):
            fail(f"{rel}: tagline baku \"{TAGLINE}\" tidak ditemukan")
    llms = (ROOT / "llms.txt").read_text(encoding="utf-8")
    index_text = (ROOT / "index.html").read_text(encoding="utf-8")
    for rel, text in (("assets/js/main.js", js), ("llms.txt", llms), ("index.html", index_text)):
        if OSS_PR not in text:
            fail(f"{rel}: kontribusi open source ({OSS_PR}) tidak tercantum")
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    summary = index[index.index('id="ringkasan"'):]

    def norm(items):
        return [i.strip().lower().replace("vuejs", "vue").replace("tile xyz/wms", "xyz/wms tiles") for i in items]

    groups = re.search(r"const skillGroups = \{(.*?)\n\s*\};", js, re.S).group(1)
    menu = {name.lower(): norm(re.findall(r'"([^"]+)"', body)) for name, body in re.findall(r"'(\w+)/': \[(.*?)\]", groups)}
    for label, key in (("Dev", "dev"), ("Ops", "ops"), ("Security", "security"), ("GIS", "gis")):
        llms_line = re.search(rf"^- {label}: (.*)$", llms, re.M)
        if not llms_line or norm(llms_line.group(1).split(",")) != menu[key]:
            fail(f"llms.txt: baris skills {label} tidak sama dengan menu terminal")
        sr_line = re.search(rf"<li>{label}: (.*?)\.</li>", summary)
        if not sr_line or norm(sr_line.group(1).split(",")) != menu[key]:
            fail(f"index.html: skills {label} pada ringkasan tidak sama dengan menu terminal")

    projects = re.search(r"const projects = \[(.*?)\n\s*\];", js, re.S).group(1)
    public = re.findall(r"name: '([^']+)'", projects)
    for name in public:
        if f"[{name}](" not in llms:
            fail(f"llms.txt: proyek publik {name} tidak tercantum")
        if f">{name}</a>" not in summary:
            fail(f"index.html: proyek publik {name} tidak tercantum pada ringkasan")


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
    pages = [dist / "index.html", dist / "blog.html", dist / "404.html"] + sorted((dist / "blog").rglob("index.html"))
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
    check_seo()
    check_code_blocks()
    check_consistency()
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
