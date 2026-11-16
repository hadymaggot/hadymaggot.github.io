// Blog.js - Dynamic Blog Post Loader
class BlogLoader {
    constructor() {
        this.postsContainer = document.getElementById('blog-posts');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.postsCache = new Map();
    }

    async init() {
        try {
            this.showLoading();
            const index = await this.fetchPostsIndex();
            await this.loadAndRenderPosts(index.posts);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading blog posts:', error);
            this.showError();
        }
    }

    async fetchPostsIndex() {
        const response = await fetch('/blog/posts/index.json');
        if (!response.ok) throw new Error('Failed to load posts index');
        return await response.json();
    }

    async fetchPost(filename) {
        if (this.postsCache.has(filename)) {
            return this.postsCache.get(filename);
        }
        
        const response = await fetch(`/blog/posts/${filename}`);
        if (!response.ok) throw new Error(`Failed to load post: ${filename}`);
        const post = await response.json();
        this.postsCache.set(filename, post);
        return post;
    }

    async loadAndRenderPosts(postsList) {
        // Sort posts by date (newest first)
        const posts = await Promise.all(
            postsList.map(p => this.fetchPost(p.file))
        );
        
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.postsContainer.innerHTML = '';
        posts.forEach(post => {
            this.postsContainer.appendChild(this.createPostCard(post));
        });
    }

    createPostCard(post) {
        const article = document.createElement('article');
        article.className = 'blog-post';
        article.setAttribute('data-post-id', post.id);
        
        const date = new Date(post.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        article.innerHTML = `
            <div class="blog-post-meta">
                <span><i class="far fa-calendar"></i> ${formattedDate}</span>
                <span><i class="far fa-clock"></i> ${post.readTime} min read</span>
            </div>
            <h2><a href="/blog/${post.id}/">${this.escapeHtml(post.title)}</a></h2>
            <div class="blog-post-excerpt">
                <p>${this.escapeHtml(post.excerpt)}</p>
            </div>
            <div class="blog-post-tags">
                ${post.tags.map(tag => `<span class="blog-tag">${this.escapeHtml(tag)}</span>`).join('')}
            </div>
            <a href="/blog/${post.id}/" class="read-more">Read More →</a>
        `;

        return article;
    }

    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
    }

    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    showError() {
        this.postsContainer.innerHTML = `
            <div class="blog-error">
                <h2>Error Loading Posts</h2>
                <p>Unable to load blog posts. Please try again later.</p>
            </div>
        `;
        this.hideLoading();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize blog when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const blogLoader = new BlogLoader();
    blogLoader.init();
});
