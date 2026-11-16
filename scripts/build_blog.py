"""Bangun halaman statis tiap artikel blog, feed RSS, dan sitemap dari blog/posts/*.json.

Jalankan dari root repo setelah menambah atau mengubah artikel: python scripts/build_blog.py
Hasilnya (blog/<id>/index.html, feed.xml, sitemap.xml) ikut di-commit karena GitHub Pages
melayani berkas apa adanya.
"""
import json
from datetime import datetime, timezone
from email.utils import format_datetime
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://hadymaggot.github.io"
FA_SRI = "sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="

PAGE = """<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Ahadizapto</title>
    <link rel="icon" href="/assets/images/ico2.png" type="image/png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="{fa_sri}" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/main.css">
    <link rel="canonical" href="{url}">
    <link rel="alternate" type="application/rss+xml" title="Blog Ahadizapto" href="/feed.xml">
    <meta name="theme-color" content="#7AC55A">
    <meta name="description" content="{excerpt}">
    <meta name="author" content="{author}">
    <meta name="robots" content="index, follow">
    <meta property="og:site_name" content="Ahadizapto">
    <meta property="og:type" content="article">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{excerpt}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{base}/assets/images/ico2.png">
    <meta name="twitter:card" content="summary">
    <style>
        body {{ background-color: var(--dark-color); color: var(--text-color); font-family: 'Poppins', sans-serif; margin: 0; }}
        .post-page {{ max-width: 800px; margin: 0 auto; padding: 2rem 1rem 4rem; }}
        .post-nav {{ display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; font-family: 'JetBrains Mono', monospace; }}
        .post-nav a, .post-body a {{ color: var(--primary-color); }}
        .post-page h1 {{ font-size: 2rem; margin-bottom: 0.5rem; }}
        .post-meta {{ display: flex; flex-wrap: wrap; gap: 1rem; opacity: 0.8; margin-bottom: 1.5rem; }}
        .post-tags span {{ margin-right: 0.5rem; padding: 0.1rem 0.5rem; border: 1px solid rgba(122, 197, 90, 0.3); border-radius: 4px; }}
        .post-back {{ margin-top: 3rem; font-family: 'JetBrains Mono', monospace; }}
        .post-body {{ line-height: 1.8; }}
        .post-body h3 {{ margin: 1.5rem 0 0.5rem; color: var(--secondary-color); }}
        .post-body pre {{ overflow-x: auto; padding: 1rem; background: var(--terminal-bg); border-radius: 4px; }}
        .post-body code {{ font-family: 'JetBrains Mono', monospace; }}
    </style>
    <script type="application/ld+json">
    {jsonld}
    </script>
</head>

<body>
    <main class="post-page">
        <nav class="post-nav" aria-label="Navigasi">
            <a href="/">~/ahadizapto</a>
            <a href="/blog.html">/blog</a>
            <a href="/feed.xml">rss</a>
        </nav>
        <article>
            <h1>{title}</h1>
            <div class="post-meta">
                <span><i class="far fa-calendar" aria-hidden="true"></i> {date}</span>
                <span><i class="far fa-clock" aria-hidden="true"></i> {read_time} menit baca</span>
                <span class="post-tags">{tags}</span>
            </div>
            <div class="post-body">
                {content}
            </div>
        </article>
        <p class="post-back"><a href="/blog.html">&larr; Semua artikel</a></p>
    </main>
</body>

</html>
"""


def load_posts():
    index = json.loads((ROOT / "blog" / "posts" / "index.json").read_text(encoding="utf-8"))
    posts = []
    for entry in index["posts"]:
        post = json.loads((ROOT / "blog" / "posts" / entry["file"]).read_text(encoding="utf-8"))
        posts.append(post)
    posts.sort(key=lambda p: p["date"], reverse=True)
    return posts


def render_page(post):
    url = f"{BASE_URL}/blog/{post['id']}/"
    jsonld = json.dumps({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post["title"],
        "datePublished": post["date"],
        "author": {"@type": "Person", "name": post["author"], "url": BASE_URL},
        "description": post["excerpt"],
        "mainEntityOfPage": url,
        "keywords": ", ".join(post["tags"]),
    }, ensure_ascii=False).replace("</", "<\\/")
    return PAGE.format(
        title=escape(post["title"]),
        excerpt=escape(post["excerpt"], quote=True),
        author=escape(post["author"]),
        url=url,
        base=BASE_URL,
        fa_sri=FA_SRI,
        jsonld=jsonld,
        date=escape(post["date"]),
        read_time=post["readTime"],
        tags="".join(f"<span>{escape(t)}</span>" for t in post["tags"]),
        content=post["content"],
    )


def render_feed(posts):
    items = []
    for p in posts:
        dt = datetime.strptime(p["date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        url = f"{BASE_URL}/blog/{p['id']}/"
        items.append(
            "    <item>\n"
            f"      <title>{escape(p['title'])}</title>\n"
            f"      <link>{url}</link>\n"
            f"      <guid isPermaLink=\"true\">{url}</guid>\n"
            f"      <pubDate>{format_datetime(dt)}</pubDate>\n"
            f"      <description>{escape(p['excerpt'])}</description>\n"
            "    </item>"
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0">\n'
        "  <channel>\n"
        "    <title>Blog Ahadizapto</title>\n"
        f"    <link>{BASE_URL}/blog.html</link>\n"
        "    <description>Catatan teknis seputar cybersecurity, operations, dan web development.</description>\n"
        "    <language>id</language>\n"
        + "\n".join(items) + "\n"
        "  </channel>\n"
        "</rss>\n"
    )


def render_sitemap(posts):
    newest = posts[0]["date"] if posts else datetime.now(timezone.utc).strftime("%Y-%m-%d")
    urls = [(f"{BASE_URL}/", newest, "monthly", "1.0"), (f"{BASE_URL}/blog.html", newest, "monthly", "0.8")]
    urls += [(f"{BASE_URL}/blog/{p['id']}/", p["date"], "yearly", "0.6") for p in posts]
    body = "\n".join(
        "   <url>\n"
        f"      <loc>{loc}</loc>\n"
        f"      <lastmod>{lastmod}</lastmod>\n"
        f"      <changefreq>{freq}</changefreq>\n"
        f"      <priority>{prio}</priority>\n"
        "   </url>"
        for loc, lastmod, freq, prio in urls
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n"
        "</urlset>\n"
    )


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def main():
    posts = load_posts()
    for post in posts:
        write(ROOT / "blog" / post["id"] / "index.html", render_page(post))
    write(ROOT / "feed.xml", render_feed(posts))
    write(ROOT / "sitemap.xml", render_sitemap(posts))
    print(f"{len(posts)} artikel dibangun.")


if __name__ == "__main__":
    main()
