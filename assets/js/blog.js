// Blog: daftar artikel sudah dirender di blog.html oleh scripts/build_blog.py (terbaca crawler tanpa JavaScript).
// Skrip ini hanya menambah pencarian dan tombol "tampilkan lebih banyak".
document.addEventListener('DOMContentLoaded', () => {
    const PAGE = 9;
    const container = document.getElementById('blog-posts');
    const cards = [...container.querySelectorAll('article.blog-post')];
    if (!cards.length) {
        container.innerHTML = '<div class="blog-error"><h2>Artikel tidak dapat dimuat</h2><p>Coba muat ulang halaman.</p></div>';
        return;
    }

    const input = document.getElementById('blog-search');
    const count = document.getElementById('blog-count');
    const more = document.getElementById('blog-more');
    const empty = document.getElementById('blog-empty');
    let shown = PAGE;
    let query = '';

    const render = () => {
        const matches = cards.filter(card => !query || card.dataset.search.includes(query));
        cards.forEach(card => { card.hidden = true; });
        matches.slice(0, shown).forEach(card => { card.hidden = false; });
        count.textContent = `Menampilkan ${Math.min(shown, matches.length)} dari ${matches.length} artikel`;
        more.hidden = matches.length <= shown;
        more.textContent = `Tampilkan lebih banyak (${matches.length - shown})`;
        empty.hidden = matches.length !== 0;
    };

    input.hidden = false;
    input.addEventListener('input', () => {
        query = input.value.trim().toLowerCase();
        shown = PAGE;
        render();
    });
    more.addEventListener('click', () => {
        shown += PAGE;
        render();
    });
    render();
});
