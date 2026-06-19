---
name: edit-article
description: Edit blog article drafts in JunHyungKang.github.io. Use when revising Markdown posts, tightening Korean or English prose, restructuring sections, improving clarity, or preparing AI engineering writing for publication.
---

# Edit Article

Edit the article without changing its technical meaning.

## Workflow

1. Read the target Markdown file under `content/posts/` or `content/drafts/`.
2. Confirm frontmatter stays valid: `title`, `date`, `teaser`, optional `image`, and `tags`.
3. Build a section map from headings before rewriting.
4. Preserve code blocks, equations, citations, image paths, and technical claims unless the user asks for a technical update.
5. Improve section order so prerequisites appear before conclusions.
6. Keep paragraphs short and concrete. Prefer direct wording over marketing language.
7. For Korean posts, keep Korean prose natural and avoid unnecessary English unless it is the technical term used in the code or paper.
8. For English posts, keep a professional engineering voice and remove vague hype.

## Checks

- Frontmatter still parses as YAML.
- Slug remains the filename without `.md`.
- `image` and inline image paths point under `public/images/posts/...` when used.
- No private career/application material is introduced from `../career-ops` unless sanitized first.
