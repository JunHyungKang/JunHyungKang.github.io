# AGENTS.md

Codex-facing guidance for the public personal blog repository.

## Project Boundary

- This repo is public-facing: blog, portfolio, about page, and recruiter-safe material.
- Private job-search and application artifacts belong in `../career-ops`.
- Do not add private resume PDFs/HTML, recruiter messages, rejection emails, compensation notes, phone numbers, or private ATS data.

## Skills

- Use `triage` for GitHub issue creation, TODO capture, deduplication, labeling, updates, closure, and backlog summaries.
- Use `edit-article` when revising Markdown articles, improving Korean/English prose, or restructuring technical writing.
- Use `korean-editorial-check` for Korean spelling, spacing, title/teaser clarity, public tone, and count-limit checks.
- Use `publish-post` when creating or publishing posts, moving drafts, adding images, or checking static-export paths.
- Use `source-research` when a draft needs current public sources, citations, or claim verification before publication.
- Use `humanizer` for prose tone/structure polishing when the task is specifically about making generated writing sound more natural.
- Use `technical-blog-writing-core` for technical deep dives, benchmarks, architecture articles, and postmortems that need explicit evidence, reproducibility, and tradeoff analysis.

## Commands

- `npm run dev`: local dev server on port 7424.
- `npm run build`: static export plus sitemap generation.
- `npm run lint`: quality signal; existing lint debt may fail unrelated files, so report pre-existing failures separately.

## Publishing Rules

- Posts live under `content/posts/YYYY/YYYY-MM-DD-Slug.md`.
- Drafts live under `content/drafts/`.
- Post assets live under `public/images/posts/YYYY/YYYY-MM-DD-Slug/`.
- Markdown and frontmatter image paths should use `/images/posts/YYYY/YYYY-MM-DD-Slug/file.ext`.

## Technical Credibility and Distribution

- Apply the `technical-blog-writing-core` credibility gate before publishing or substantially revising a technical deep dive, benchmark, architecture article, or postmortem.
- Keep reusable/public baselines, the author's owned contribution, evidence strength, and reproducible artifacts explicit; do not let scale metrics obscure the technical contribution.
- For Korean technical writing, lead with the author's concrete observation, failed check, or changed judgment. Use `humanizer` before publication, remove translated jargon where Korean is clearer, and avoid the repeated `summary table → numbered sections → exhaustive checklist` shape that reads like an AI-generated release-note recap.
- For LinkedIn technical posts, use one focused build note, technical note, correction, or question; do not imitate follower-dependent length or authority.
- Treat AI slop as a credibility failure, not a cosmetic issue. Benchmark strong public posts only for information order; do not copy a polished `hook → numbered list → checklist → moral` template. If two parallel lists appear, keep the one that carries evidence and rewrite the other as the author's concrete reasoning.
- For LinkedIn, source blank lines and editor text are not render evidence. After saving, reload the real feed and inspect the first fold, middle, ending, link preview, and attached media. Make semantic blocks visibly separate in the rendered UI; do not approve spacing from Markdown, `innerText`, or a DOM snapshot alone.
- Before publishing a Korean technical excerpt, read it once as a standalone skeptical developer. Replace vague referents such as `첫 번째 경로`, `이 결과`, or `이 비율` when the same paragraph does not name the concrete component, action, and reason.
- Assume a technical reader may know the domain but not the package-level method. Explain the service-level effect before introducing an API name, expand an acronym on first use or remove it from a short social post, and never use an unexplained term such as `TOCTOU` or `token introspection` as the conclusion.
- Treat versions as typed identifiers: distinguish package versions, SDK major versions, protocol revisions, and specification status. Lead prose with the reader-facing SDK or package version, and keep date-form protocol revisions where exact negotiation or wire evidence is being reported.
- Treat every SVG label and caption as a technical claim. Apply the same version and evidence-scope checks as prose, distinguish an observed reproduction result from a protocol guarantee, then rasterize and inspect the target aspect ratio before publication.
- Evaluate social distribution with an explicit impression-to-outcome funnel and account baseline. Do not infer sentiment or credibility from reactions alone, especially when the linked article received little traffic.
