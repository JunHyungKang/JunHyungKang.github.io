---
name: publish-post
description: Prepare and verify a blog post for publication in JunHyungKang.github.io. Use when creating a new post, moving a draft to content/posts, adding images, checking static export paths, or publishing blog changes to GitHub Pages.
---

# Publish Post

Prepare one publishable blog change at a time.

## Workflow

1. Create posts under `content/posts/YYYY/YYYY-MM-DD-Slug.md`; use `content/drafts/` for non-published drafts.
2. Add required frontmatter:
   - `title`
   - `date` as `YYYY-MM-DD`
   - `teaser`
   - `tags`
   - `image` when a thumbnail exists
3. Put post assets under `public/images/posts/YYYY/YYYY-MM-DD-Slug/`.
4. Reference images as `/images/posts/YYYY/YYYY-MM-DD-Slug/file.ext`.
5. Run `npm run build` for publication-impacting changes when practical. Run `npm run lint` only as a quality signal; this repo has existing lint debt, so report pre-existing failures separately.
6. Stage only the post, its assets, and directly related code/config changes.
7. Push to `master` when the user wants publication.

## Checks

- Filename slug is unique across `content/posts/**`.
- Thumbnail path in frontmatter exists in `public/`.
- Inline images render from `public/images/...`, not from repository-relative paths.
- Do not publish private resume, ATS, recruiter, or application artifacts from `../career-ops`.
