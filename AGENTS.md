# AGENTS.md

Codex-facing guidance for the public personal blog repository.

## Project Boundary

- This repo is public-facing: blog, portfolio, about page, and recruiter-safe material.
- Private job-search and application artifacts belong in `../career-ops`.
- Do not add private resume PDFs/HTML, recruiter messages, rejection emails, compensation notes, phone numbers, or private ATS data.

## Skills

- Use `edit-article` when revising Markdown articles, improving Korean/English prose, or restructuring technical writing.
- Use `korean-editorial-check` for Korean spelling, spacing, title/teaser clarity, public tone, and count-limit checks.
- Use `publish-post` when creating or publishing posts, moving drafts, adding images, or checking static-export paths.
- Use `source-research` when a draft needs current public sources, citations, or claim verification before publication.
- Use `humanizer` for prose tone/structure polishing when the task is specifically about making generated writing sound more natural.

## Commands

- `npm run dev`: local dev server on port 7424.
- `npm run build`: static export plus sitemap generation.
- `npm run lint`: quality signal; existing lint debt may fail unrelated files, so report pre-existing failures separately.

## Publishing Rules

- Posts live under `content/posts/YYYY/YYYY-MM-DD-Slug.md`.
- Drafts live under `content/drafts/`.
- Post assets live under `public/images/posts/YYYY/YYYY-MM-DD-Slug/`.
- Markdown and frontmatter image paths should use `/images/posts/YYYY/YYYY-MM-DD-Slug/file.ext`.
