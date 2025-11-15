# Blog System Documentation

## Overview
This blog system uses a dynamic, JSON-based approach to manage blog posts. Posts are stored as JSON files in the `/blog/posts/` directory and are dynamically loaded and rendered on the blog page.

## How It Works

### Architecture
- **Blog Posts**: Stored as individual JSON files in `/blog/posts/`
- **Index File**: `/blog/posts/index.json` contains a list of all posts
- **Dynamic Loading**: JavaScript fetches and renders posts client-side
- **No Backend Required**: Fully compatible with GitHub Pages static hosting

### File Structure
```
/blog/
  /posts/
    index.json                           # List of all blog posts
    2025-01-15-welcome-to-my-blog.json  # Individual post files
    2025-01-10-kubernetes-best-practices.json
```

## Adding a New Blog Post

### Step 1: Create a Post JSON File
Create a new JSON file in `/blog/posts/` with the naming convention: `YYYY-MM-DD-post-title.json`

Example: `2025-01-20-my-new-post.json`

```json
{
  "id": "my-new-post",
  "title": "My New Blog Post",
  "date": "2025-01-20",
  "author": "Ahadizapto",
  "tags": ["DevOps", "Tutorial"],
  "readTime": 5,
  "excerpt": "A short description of your post that appears on the blog listing page.",
  "content": "<p>Full HTML content of your blog post goes here.</p><h3>You can use HTML tags</h3><ul><li>Like lists</li><li>And more</li></ul>"
}
```

### Step 2: Update the Index File
Add your new post to `/blog/posts/index.json`:

```json
{
  "posts": [
    {
      "file": "2025-01-20-my-new-post.json",
      "featured": false
    },
    {
      "file": "2025-01-15-welcome-to-my-blog.json",
      "featured": true
    },
    {
      "file": "2025-01-10-kubernetes-best-practices.json",
      "featured": false
    }
  ]
}
```

### Step 3: Commit and Push
```bash
git add blog/posts/2025-01-20-my-new-post.json
git add blog/posts/index.json
git commit -m "Add new blog post: My New Blog Post"
git push
```

## Post JSON Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (lowercase, hyphens) |
| `title` | string | Yes | Post title |
| `date` | string | Yes | Publication date (YYYY-MM-DD) |
| `author` | string | Yes | Author name |
| `tags` | array | Yes | Array of tag strings |
| `readTime` | number | Yes | Estimated reading time in minutes |
| `excerpt` | string | Yes | Short description for listing page |
| `content` | string | Yes | Full HTML content of the post |

## Content Formatting

### HTML in Content
The `content` field accepts HTML. You can use:
- `<p>` for paragraphs
- `<h3>`, `<h4>` for headings
- `<ul>`, `<ol>`, `<li>` for lists
- `<strong>`, `<em>` for emphasis
- `<pre><code>` for code blocks
- `<a href="">` for links

### Example Content with Code
```json
{
  "content": "<p>Here's some text.</p><h3>Code Example</h3><pre><code>const example = 'Hello World';\nconsole.log(example);</code></pre>"
}
```

## Features

### Dynamic Loading
- Posts are loaded asynchronously from JSON files
- Sorted by date (newest first)
- Cached for better performance

### Modal View
- Clicking "Read More" opens a full-screen modal
- Smooth animations
- Close with X button, clicking outside, or pressing Escape

### Responsive Design
- Mobile-friendly
- Consistent cyberpunk/terminal theme
- Hover effects on post cards

## Troubleshooting

### Posts Not Showing
1. Check that the JSON file is valid (use a JSON validator)
2. Verify the file is listed in `index.json`
3. Check browser console for errors
4. Ensure the file path is correct

### Styling Issues
- All styles use CSS variables from the main theme
- Modal uses `var(--primary-color)` and `var(--secondary-color)`
- Consistent with the site's cyberpunk aesthetic

## Performance
- Posts are cached after first load
- Only loads index initially, then individual posts on demand
- No external API calls or rate limits
- Fast and efficient for GitHub Pages

## Future Enhancements
Potential improvements:
- Add search functionality
- Filter by tags
- Pagination for many posts
- RSS feed generation
- Social sharing buttons
