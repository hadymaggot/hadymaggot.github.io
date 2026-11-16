"""Bangun seluruh keluaran blog dari blog/posts/*.json: halaman artikel, versi Markdown, halaman tag, feed RSS,
sitemap, llms-full.txt, bagian yang disisipkan ke blog.html, index.html, dan llms.txt, serta gambar pratinjau sosial.

Jalankan dari root repo setelah menambah atau mengubah artikel: python scripts/build_blog.py
Hasilnya ikut di-commit karena GitHub Pages melayani berkas apa adanya. scripts/check_site.py memastikan hasil
yang di-commit sama dengan hasil render dari sumbernya.
"""
import json
import math
import re
from datetime import date, datetime, timezone
from email.utils import format_datetime
from html import escape, unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://hadymaggot.github.io"
SITE_NAME = "Ahadizapto"
AUTHOR_NAME = "Sapto Hadi"
PERSON_ID = f"{BASE_URL}/#person"
BLOG_ID = f"{BASE_URL}/blog.html#blog"
FA_SRI = "sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
OG_W, OG_H = 1200, 630
OG_DEFAULT = "assets/images/og-default.png"
MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober",
          "November", "Desember"]

HEAD_COMMON = """    <link rel="icon" href="/assets/images/ico2.png" type="image/png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="{fa_sri}" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/main.css">
    <link rel="alternate" type="application/rss+xml" title="Blog Ahadizapto" href="/feed.xml">
    <meta name="theme-color" content="#7AC55A">
    <meta name="author" content="Sapto Hadi">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">"""

STYLE = """    <style>
        body { background-color: var(--dark-color); color: var(--text-color); font-family: 'Poppins', sans-serif; margin: 0; height: auto; min-height: 100vh; }
        .post-page { max-width: 800px; margin: 0 auto; padding: 2rem 1rem 4rem; }
        .post-nav { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; font-family: 'JetBrains Mono', monospace; }
        .post-nav a, .post-body a, .post-page a { color: var(--primary-color); }
        .breadcrumb { font-size: 0.85rem; opacity: 0.85; margin-bottom: 1rem; }
        .breadcrumb a { text-decoration: none; }
        .post-page h1 { font-size: 2rem; margin-bottom: 0.5rem; line-height: 1.3; }
        .post-meta { display: flex; flex-wrap: wrap; gap: 1rem; opacity: 0.8; margin-bottom: 1rem; }
        .post-tags a { margin-right: 0.5rem; padding: 0.1rem 0.5rem; border: 1px solid rgba(122, 197, 90, 0.3); border-radius: 4px; text-decoration: none; display: inline-block; margin-bottom: 0.4rem; }
        .post-body { line-height: 1.8; }
        .post-body h3 { margin: 1.5rem 0 0.5rem; color: var(--secondary-color); }
        .post-body pre { overflow-x: auto; padding: 1rem; background: var(--terminal-bg); border-radius: 4px; }
        .post-body code { font-family: 'JetBrains Mono', monospace; }
        .post-author { margin-top: 2.5rem; padding: 1rem 1.2rem; border: 1px solid rgba(122, 197, 90, 0.3); border-radius: 6px; line-height: 1.7; }
        .post-related { margin-top: 2rem; }
        .post-related h2 { font-size: 1.2rem; color: var(--secondary-color); }
        .post-related ul { list-style: none; padding: 0; margin: 0; }
        .post-related li { margin-bottom: 0.7rem; }
        .post-related span { display: block; opacity: 0.75; font-size: 0.9rem; }
        .post-pager { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem; }
        .post-pager a { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.8rem 1rem; border: 1px solid rgba(122, 197, 90, 0.3); border-radius: 8px; text-decoration: none; transition: border-color 0.2s ease; }
        .post-pager a:hover, .post-pager a:focus-visible { border-color: var(--primary-color); }
        .pager-next { text-align: right; align-items: flex-end; }
        .pager-label { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--primary-color); }
        .pager-title { color: var(--text-color); line-height: 1.4; }
        @media (max-width: 600px) { .post-pager { grid-template-columns: 1fr; } .pager-next { text-align: left; align-items: flex-start; } }
        .post-back { margin-top: 2rem; font-family: 'JetBrains Mono', monospace; }
        .code-block { margin: 1rem 0; border: 1px solid rgba(122, 197, 90, 0.25); border-radius: 8px; overflow: hidden; background: var(--terminal-bg); }
        .code-head { display: flex; justify-content: space-between; align-items: center; padding: 0.3rem 0.75rem; background: rgba(122, 197, 90, 0.1); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--secondary-color); }
        .code-copy { background: transparent; color: var(--primary-color); border: 1px solid rgba(122, 197, 90, 0.4); border-radius: 4px; padding: 0.15rem 0.6rem; font: inherit; cursor: pointer; transition: background-color 0.2s ease, color 0.2s ease; }
        .code-copy:hover, .code-copy:focus-visible { background: var(--primary-color); color: var(--dark-color); }
        .code-block pre { margin: 0; border-radius: 0; background: transparent; font-size: 0.85rem; line-height: 1.6; }
        .hljs { background: transparent; color: #e6e6e6; }
        .hljs-comment, .hljs-quote { color: #7f8c8d; font-style: italic; }
        .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-doctag { color: #ff7b72; }
        .hljs-string, .hljs-regexp, .hljs-addition { color: #e9c46a; }
        .hljs-number, .hljs-symbol, .hljs-bullet { color: #f4a261; }
        .hljs-title, .hljs-section, .hljs-function .hljs-title { color: #7aa2f7; }
        .hljs-built_in, .hljs-type, .hljs-class .hljs-title { color: #bb9af7; }
        .hljs-attr, .hljs-attribute, .hljs-variable, .hljs-template-variable, .hljs-params { color: #7dcfff; }
        .hljs-meta, .hljs-name, .hljs-selector-id, .hljs-selector-class { color: #c3db65; }
        .hljs-deletion { color: #ff7b72; background: rgba(255, 123, 114, 0.12); }
        .hljs-addition { background: rgba(122, 197, 90, 0.12); }
    </style>"""


# ---------------------------------------------------------------- data

def load_posts():
    index = json.loads((ROOT / "blog" / "posts" / "index.json").read_text(encoding="utf-8"))
    posts = []
    for entry in index["posts"]:
        posts.append(json.loads((ROOT / "blog" / "posts" / entry["file"]).read_text(encoding="utf-8")))
    posts.sort(key=lambda p: (p["date"], p["id"]), reverse=True)
    return posts


def post_url(p):
    return f"{BASE_URL}/blog/{p['id']}/"


def og_path(p):
    return f"assets/images/og/{p['id']}.png"


def og_url(p):
    return f"{BASE_URL}/{og_path(p)}"


def slug(tag):
    return re.sub(r"[^a-z0-9]+", "-", tag.lower()).strip("-")


def tags_index(posts):
    index = {}
    for p in posts:
        for t in p["tags"]:
            index.setdefault(slug(t), {"name": t, "posts": []})["posts"].append(p)
    return index


MIN_TAG_POSTS = 2


def indexable_tags(posts):
    """Halaman tag hanya dibuat untuk tag dengan cukup artikel; tag tunggal akan menjadi thin content."""
    return {sl: info for sl, info in tags_index(posts).items() if len(info["posts"]) >= MIN_TAG_POSTS}


def tag_chip(tag, linkable, cls=""):
    sl = slug(tag)
    attr = f' class="{cls}"' if cls else ""
    if sl in linkable:
        return f'<a{attr} href="/blog/tag/{sl}/">{escape(tag)}</a>'
    return f'<span{attr}>{escape(tag)}</span>'


def meta_description(text, limit=155):
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[:limit - 1].rsplit(" ", 1)[0].rstrip(",;:") + "…"


def title_tag(title):
    full = f"{title} | {SITE_NAME}"
    return full if len(full) <= 70 else title


def date_id(iso):
    d = date.fromisoformat(iso)
    return f"{d.day} {MONTHS[d.month - 1]} {d.year}"


def word_count(html):
    return len(re.sub(r"<[^>]+>", " ", html).split())


def related(p, posts, limit=3):
    others = [q for q in posts if q["id"] != p["id"]]
    return sorted(others, key=lambda q: (len(set(q["tags"]) & set(p["tags"])), q["date"]), reverse=True)[:limit]


def ld(obj):
    return json.dumps(obj, ensure_ascii=False).replace("</", "<\\/")


def person_ref():
    return {"@type": "Person", "@id": PERSON_ID, "name": AUTHOR_NAME, "alternateName": ["Ahadizapto", "hadymaggot"],
            "url": f"{BASE_URL}/"}


# ---------------------------------------------------------------- markdown

def html_to_md(h):
    blocks = []

    def keep(text):
        blocks.append(text)
        return f"\x00{len(blocks) - 1}\x00"

    h = re.sub(r"<pre><code>(.*?)</code></pre>", lambda m: keep("\n```\n" + unescape(m.group(1)) + "\n```\n"), h, flags=re.S)
    h = re.sub(r"<code>(.*?)</code>", lambda m: keep("`" + unescape(m.group(1)) + "`"), h, flags=re.S)
    h = re.sub(r"<h3>(.*?)</h3>", r"\n### \1\n", h, flags=re.S)
    h = re.sub(r"<li>(.*?)</li>", r"\n- \1", h, flags=re.S)
    h = re.sub(r"</?[uo]l>", "\n", h)
    h = re.sub(r"<a [^>]*href=\"([^\"]+)\"[^>]*>(.*?)</a>", r"[\2](\1)", h, flags=re.S)
    h = re.sub(r"<strong>(.*?)</strong>", r"**\1**", h, flags=re.S)
    h = re.sub(r"<p>(.*?)</p>", r"\n\1\n", h, flags=re.S)
    h = unescape(re.sub(r"<[^>]+>", "", h))
    h = re.sub(r"\x00(\d+)\x00", lambda m: blocks[int(m.group(1))], h)
    return re.sub(r"\n{3,}", "\n\n", h).strip() + "\n"


def render_markdown(p):
    return (f"# {p['title']}\n\n"
            f"- URL: {post_url(p)}\n- Tanggal: {p['date']}\n- Penulis: {AUTHOR_NAME} (Ahadizapto)\n"
            f"- Tag: {', '.join(p['tags'])}\n\n> {p['excerpt']}\n\n{html_to_md(p['content'])}")


# ---------------------------------------------------------------- halaman

def tag_links(p, linkable):
    return "".join(tag_chip(t, linkable) for t in p["tags"])


def render_page(p, posts):
    url = post_url(p)
    desc = meta_description(p["excerpt"])
    ordered = sorted(posts, key=lambda q: (q["date"], q["id"]))
    pos = [q["id"] for q in ordered].index(p["id"])
    older = ordered[pos - 1] if pos > 0 else None
    newer = ordered[pos + 1] if pos + 1 < len(ordered) else None

    article_ld = {
        "@context": "https://schema.org", "@type": "BlogPosting", "@id": f"{url}#article", "headline": p["title"],
        "description": desc, "image": [og_url(p)], "datePublished": p["date"], "dateModified": p["date"],
        "inLanguage": "id", "wordCount": word_count(p["content"]), "keywords": ", ".join(p["tags"]),
        "articleSection": p["tags"][0], "url": url, "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "author": person_ref(), "publisher": person_ref(), "isPartOf": {"@id": BLOG_ID},
    }
    crumbs_ld = {
        "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Beranda", "item": f"{BASE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{BASE_URL}/blog.html"},
            {"@type": "ListItem", "position": 3, "name": p["title"], "item": url}]}

    rel_html = "".join(
        f'<li><a href="/blog/{q["id"]}/">{escape(q["title"])}</a><span>{escape(meta_description(q["excerpt"], 110))}</span></li>'
        for q in related(p, posts))
    pager = ""
    if older or newer:
        left = (f'<a class="pager-prev" href="/blog/{older["id"]}/" rel="prev"><span class="pager-label">&larr; Sebelumnya</span>'
                f'<span class="pager-title">{escape(older["title"])}</span></a>') if older else "<span></span>"
        right = (f'<a class="pager-next" href="/blog/{newer["id"]}/" rel="next"><span class="pager-label">Berikutnya &rarr;</span>'
                 f'<span class="pager-title">{escape(newer["title"])}</span></a>') if newer else "<span></span>"
        pager = f'        <nav class="post-pager" aria-label="Artikel sebelum dan sesudah">{left}{right}</nav>\n'
    code_scripts = ('    <script src="/assets/js/vendor/highlight.min.js" defer></script>\n'
                    '    <script src="/assets/js/code.js" defer></script>\n') if "<pre" in p["content"] else ""
    tag_meta = "".join(f'    <meta property="article:tag" content="{escape(t, quote=True)}">\n' for t in p["tags"])

    return f"""<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(title_tag(p["title"]))}</title>
    <meta name="description" content="{escape(desc, quote=True)}">
    <link rel="canonical" href="{url}">
    <link rel="alternate" type="text/markdown" href="{url}index.md">
{HEAD_COMMON.format(fa_sri=FA_SRI)}
    <meta name="keywords" content="{escape(", ".join(p["tags"]), quote=True)}">
    <meta property="og:site_name" content="{SITE_NAME}">
    <meta property="og:locale" content="id_ID">
    <meta property="og:type" content="article">
    <meta property="og:title" content="{escape(p["title"], quote=True)}">
    <meta property="og:description" content="{escape(desc, quote=True)}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{og_url(p)}">
    <meta property="og:image:width" content="{OG_W}">
    <meta property="og:image:height" content="{OG_H}">
    <meta property="og:image:alt" content="{escape(p["title"], quote=True)}">
    <meta property="article:published_time" content="{p["date"]}">
    <meta property="article:author" content="{BASE_URL}/">
{tag_meta}    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@hadymaggot">
    <meta name="twitter:creator" content="@hadymaggot">
    <meta name="twitter:title" content="{escape(p["title"], quote=True)}">
    <meta name="twitter:description" content="{escape(desc, quote=True)}">
    <meta name="twitter:image" content="{og_url(p)}">
{STYLE}
{code_scripts}    <script type="application/ld+json">{ld(article_ld)}</script>
    <script type="application/ld+json">{ld(crumbs_ld)}</script>
</head>

<body>
    <main class="post-page">
        <nav class="post-nav" aria-label="Navigasi">
            <a href="/">~/ahadizapto</a>
            <a href="/blog.html">/blog</a>
            <a href="/feed.xml">rss</a>
        </nav>
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Beranda</a> &rsaquo; <a href="/blog.html">Blog</a> &rsaquo; {escape(p["title"])}</nav>
        <article>
            <h1>{escape(p["title"])}</h1>
            <div class="post-meta">
                <span><i class="far fa-calendar" aria-hidden="true"></i> <time datetime="{p["date"]}">{date_id(p["date"])}</time></span>
                <span><i class="far fa-clock" aria-hidden="true"></i> {p["readTime"]} menit baca</span>
            </div>
            <div class="post-tags">{tag_links(p, indexable_tags(posts))}</div>
            <div class="post-body">
                {p["content"]}
            </div>
            <aside class="post-author">Ditulis oleh <strong>{AUTHOR_NAME}</strong> (Ahadizapto), engineer di bidang security, operations, dan GIS. Lihat <a href="/">profil</a> atau <a href="/blog.html">artikel lainnya</a>.</aside>
        </article>
        <section class="post-related">
            <h2>Artikel terkait</h2>
            <ul>{rel_html}</ul>
        </section>
{pager}        <p class="post-back"><a href="/blog.html">&larr; Semua artikel</a></p>
    </main>
</body>

</html>
"""


def render_tag_page(slug_name, info):
    name, items = info["name"], info["posts"]
    url = f"{BASE_URL}/blog/tag/{slug_name}/"
    title = f"Artikel tentang {name}"
    desc = meta_description(f"Kumpulan {len(items)} artikel Ahadizapto dengan topik {name}: "
                            + "; ".join(q["title"] for q in items[:3]) + ".")
    lst = "".join(
        f'<li><a href="/blog/{q["id"]}/">{escape(q["title"])}</a><span>{date_id(q["date"])}. {escape(meta_description(q["excerpt"], 120))}</span></li>'
        for q in items)
    coll_ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": title, "url": url,
               "description": desc, "inLanguage": "id", "isPartOf": {"@id": BLOG_ID},
               "mainEntity": {"@type": "ItemList", "itemListElement": [
                   {"@type": "ListItem", "position": i + 1, "url": post_url(q), "name": q["title"]}
                   for i, q in enumerate(items)]}}
    crumbs_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Beranda", "item": f"{BASE_URL}/"},
        {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{BASE_URL}/blog.html"},
        {"@type": "ListItem", "position": 3, "name": name, "item": url}]}
    default_og = f"{BASE_URL}/{OG_DEFAULT}"
    return f"""<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(title_tag(title))}</title>
    <meta name="description" content="{escape(desc, quote=True)}">
    <link rel="canonical" href="{url}">
{HEAD_COMMON.format(fa_sri=FA_SRI)}
    <meta property="og:site_name" content="{SITE_NAME}">
    <meta property="og:locale" content="id_ID">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{escape(title, quote=True)}">
    <meta property="og:description" content="{escape(desc, quote=True)}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{default_og}">
    <meta property="og:image:width" content="{OG_W}">
    <meta property="og:image:height" content="{OG_H}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{default_og}">
{STYLE}
    <script type="application/ld+json">{ld(coll_ld)}</script>
    <script type="application/ld+json">{ld(crumbs_ld)}</script>
</head>

<body>
    <main class="post-page">
        <nav class="post-nav" aria-label="Navigasi">
            <a href="/">~/ahadizapto</a>
            <a href="/blog.html">/blog</a>
            <a href="/feed.xml">rss</a>
        </nav>
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Beranda</a> &rsaquo; <a href="/blog.html">Blog</a> &rsaquo; {escape(name)}</nav>
        <h1>{escape(title)}</h1>
        <p>{len(items)} artikel dengan topik {escape(name)}.</p>
        <section class="post-related">
            <ul>{lst}</ul>
        </section>
        <p class="post-back"><a href="/blog.html">&larr; Semua artikel</a></p>
    </main>
</body>

</html>
"""


# ---------------------------------------------------------------- feed, sitemap, llms

def render_feed(posts):
    items = []
    for p in posts:
        dt = datetime.strptime(p["date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        url = post_url(p)
        cats = "".join(f"      <category>{escape(t)}</category>\n" for t in p["tags"])
        items.append(
            "    <item>\n"
            f"      <title>{escape(p['title'])}</title>\n"
            f"      <link>{url}</link>\n"
            f"      <guid isPermaLink=\"true\">{url}</guid>\n"
            f"      <pubDate>{format_datetime(dt)}</pubDate>\n"
            f"      <dc:creator>{AUTHOR_NAME}</dc:creator>\n"
            f"{cats}"
            f"      <description>{escape(p['excerpt'])}</description>\n"
            f"      <content:encoded><![CDATA[{p['content'].replace(']]>', ']]&gt;')}]]></content:encoded>\n"
            "    </item>")
    newest = (datetime.strptime(posts[0]["date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
              if posts else datetime.now(timezone.utc))
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" '
        'xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">\n'
        "  <channel>\n"
        "    <title>Blog Ahadizapto</title>\n"
        f"    <link>{BASE_URL}/blog.html</link>\n"
        f'    <atom:link href="{BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>\n'
        "    <description>Catatan teknis seputar cybersecurity, operations, GIS, dan web development.</description>\n"
        "    <language>id</language>\n"
        f"    <lastBuildDate>{format_datetime(newest)}</lastBuildDate>\n"
        + "\n".join(items) + "\n"
        "  </channel>\n"
        "</rss>\n"
    )


def render_sitemap(posts):
    newest = posts[0]["date"] if posts else date.today().isoformat()
    urls = [(f"{BASE_URL}/", newest, "weekly", "1.0"), (f"{BASE_URL}/blog.html", newest, "weekly", "0.9")]
    urls += [(post_url(p), p["date"], "yearly", "0.7") for p in posts]
    for sl, info in sorted(indexable_tags(posts).items()):
        urls.append((f"{BASE_URL}/blog/tag/{sl}/", max(q["date"] for q in info["posts"]), "weekly", "0.5"))
    body = "\n".join(
        "   <url>\n"
        f"      <loc>{loc}</loc>\n"
        f"      <lastmod>{lastmod}</lastmod>\n"
        f"      <changefreq>{freq}</changefreq>\n"
        f"      <priority>{prio}</priority>\n"
        "   </url>"
        for loc, lastmod, freq, prio in urls
    )
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            f"{body}\n"
            "</urlset>\n")


def render_llms_full(posts):
    parts = [f"# Blog {SITE_NAME}: seluruh artikel\n\n"
             f"Sumber: {BASE_URL}/blog.html. Penulis: {AUTHOR_NAME} (Ahadizapto), engineer security, operations, dan GIS. "
             "Setiap artikel juga tersedia sebagai Markdown pada alamat artikelnya ditambah index.md.\n"]
    for p in posts:
        parts.append("\n---\n\n" + render_markdown(p))
    return "".join(parts)


# ---------------------------------------------------------------- bagian yang disisipkan

def post_card(p, linkable, first=False):
    tags = "".join(tag_chip(t, linkable, "blog-tag") for t in p["tags"][:3])
    search = escape(" ".join([p["title"], p["excerpt"], " ".join(p["tags"])]).lower(), quote=True)
    cls = "blog-post blog-post-featured" if first else "blog-post"
    return (
        f'<article class="{cls}" data-search="{search}">\n'
        '    <div class="blog-post-body">\n'
        '        <div class="blog-post-meta">\n'
        f'            <span><i class="far fa-calendar" aria-hidden="true"></i> <time datetime="{p["date"]}">{date_id(p["date"])}</time></span>\n'
        f'            <span><i class="far fa-clock" aria-hidden="true"></i> {p["readTime"]} menit baca</span>\n'
        '        </div>\n'
        f'        <h2><a href="/blog/{p["id"]}/">{escape(p["title"])}</a></h2>\n'
        f'        <p class="blog-post-excerpt">{escape(p["excerpt"])}</p>\n'
        f'        <div class="blog-post-tags">{tags}</div>\n'
        '    </div>\n'
        '</article>')


def blog_jsonld(posts):
    blog = {"@context": "https://schema.org", "@type": "Blog", "@id": BLOG_ID, "name": "Blog Ahadizapto",
            "description": "Catatan teknis seputar cybersecurity, operations, GIS, dan web development.",
            "url": f"{BASE_URL}/blog.html", "inLanguage": "id", "author": person_ref(), "publisher": person_ref(),
            "blogPost": [{"@type": "BlogPosting", "headline": p["title"], "url": post_url(p), "datePublished": p["date"],
                          "description": meta_description(p["excerpt"]), "image": og_url(p)} for p in posts]}
    return f'<script type="application/ld+json">{ld(blog)}</script>'


def tag_cloud(posts):
    items = sorted(indexable_tags(posts).items(), key=lambda kv: (-len(kv[1]["posts"]), kv[1]["name"]))
    return ('<nav class="blog-topics" aria-label="Topik">' +
            "".join(f'<a class="blog-tag" href="/blog/tag/{sl}/">{escape(i["name"])} ({len(i["posts"])})</a>' for sl, i in items) +
            "</nav>")


def latest_list(posts, n=6):
    return "<ul>" + "".join(f'<li><a href="/blog/{p["id"]}/">{escape(p["title"])}</a></li>' for p in posts[:n]) + "</ul>"


def articles_markdown(posts):
    lines = [f"- [Blog]({BASE_URL}/blog.html): daftar semua artikel; RSS di {BASE_URL}/feed.xml; seluruh artikel dalam satu "
             f"berkas Markdown di {BASE_URL}/llms-full.txt"]
    lines += [f"- [{p['title']}]({post_url(p)}): {p['excerpt']}" for p in posts]
    return "\n".join(lines)


INJECTIONS = {
    "blog.html": [("POSTS", lambda ps: "\n".join(post_card(p, indexable_tags(ps), i == 0) for i, p in enumerate(ps))), ("JSONLD", blog_jsonld), ("TAGS", tag_cloud)],
    "index.html": [("LATEST", latest_list)],
    "llms.txt": [("ARTICLES", articles_markdown)],
}


def inject(text, name, value):
    pat = re.compile(rf"(<!--{name}:START-->)(.*?)(<!--{name}:END-->)", re.S)
    if not pat.search(text):
        raise ValueError(f"penanda {name} tidak ditemukan")
    return pat.sub(lambda m: f"{m.group(1)}\n{value}\n{m.group(3)}", text, count=1)


def injected_text(path, posts):
    text = (ROOT / path).read_text(encoding="utf-8")
    for name, fn in INJECTIONS[path]:
        text = inject(text, name, fn(posts))
    return text


# ---------------------------------------------------------------- keluaran

def generated_files(posts):
    files = {}
    for p in posts:
        files[f"blog/{p['id']}/index.html"] = render_page(p, posts)
        files[f"blog/{p['id']}/index.md"] = render_markdown(p)
    for sl, info in indexable_tags(posts).items():
        files[f"blog/tag/{sl}/index.html"] = render_tag_page(sl, info)
    files["feed.xml"] = render_feed(posts)
    files["sitemap.xml"] = render_sitemap(posts)
    files["llms-full.txt"] = render_llms_full(posts)
    return files


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


# ---------------------------------------------------------------- gambar pratinjau sosial

def _font(size):
    from PIL import ImageFont
    for c in ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/Library/Fonts/Arial Bold.ttf"]:
        if Path(c).is_file():
            return ImageFont.truetype(c, size)
    return ImageFont.load_default(size=size)


def _wrap(draw, text, font, width, max_lines):
    lines, cur = [], ""
    for w in text.split():
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= width:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip(" ,.;:") + "…"
    return lines


def make_card(path, title, subtitle):
    from PIL import Image, ImageDraw
    img = Image.new("RGB", (OG_W, OG_H), "#121212")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 14, OG_H], fill="#7AC55A")
    d.text((70, 60), "ahadizapto", font=_font(34), fill="#7AC55A")
    f_title = _font(68)
    y = 150
    for ln in _wrap(d, title, f_title, OG_W - 160, 4):
        d.text((70, y), ln, font=f_title, fill="#FFFFFF")
        y += 86
    d.text((70, OG_H - 110), subtitle, font=_font(32), fill="#C3DB65")
    d.text((70, OG_H - 62), "hadymaggot.github.io", font=_font(28), fill="#8a8a8a")
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, optimize=True)


def ensure_og_images(posts):
    try:
        import PIL  # noqa: F401
    except ImportError:
        print("Pillow tidak terpasang; gambar pratinjau tidak dibuat.")
        return
    if not (ROOT / OG_DEFAULT).exists():
        make_card(ROOT / OG_DEFAULT, "Security, Operations, dan GIS", "Sapto Hadi (Ahadizapto)")
    for p in posts:
        if not (ROOT / og_path(p)).exists():
            make_card(ROOT / og_path(p), p["title"], " · ".join(p["tags"]))


def main():
    posts = load_posts()
    files = generated_files(posts)
    for rel, text in files.items():
        write(ROOT / rel, text)
    for path in INJECTIONS:
        write(ROOT / path, injected_text(path, posts))
    ensure_og_images(posts)
    print(f"{len(posts)} artikel, {len(indexable_tags(posts))} halaman tag, {len(files)} berkas dibangun.")


if __name__ == "__main__":
    main()
