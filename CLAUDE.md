# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal tech blog (JH's Tech Log) built with **Next.js 16**, **React 19**, and **TypeScript**. Statically exported and deployed to GitHub Pages at https://junhyungkang.github.io. Blog posts are bilingual (Korean/English) and focus on AI engineering, LLMs, and deep learning.

## Commands

- **Dev server**: `npm run dev` (port 7424)
- **Build**: `npm run build` (static export to `out/`, auto-generates sitemap via postbuild)
- **Lint**: `npm run lint`
- **No test suite** configured

## Architecture

### Content Pipeline

Blog posts are Markdown files with YAML frontmatter stored in `content/posts/{year}/`. The filename (minus `.md`) becomes the URL slug. Slugs must be unique across all year directories.

`lib/posts.ts` handles all content processing:
1. Recursively discovers `.md` files from `content/posts/`
2. Parses frontmatter with `gray-matter`
3. Converts Markdown to HTML via remark/rehype pipeline (GFM, KaTeX math, auto heading slugs)
4. Extracts H2/H3 headings for table of contents using `github-slugger`

### Post Frontmatter Format

```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
teaser: "Brief description for cards and SEO"
image: "/images/posts/YYYY/image.png"
tags:
  - Tag1
  - Tag2
---
```

If `image` is not in frontmatter, the first Markdown image in the body is used as the thumbnail.

### App Structure (Next.js App Router)

- `app/page.tsx` — Home: featured post + recent posts grid
- `app/posts/page.tsx` — Archive listing all posts
- `app/posts/[slug]/page.tsx` — Individual post with TOC sidebar, comments, share buttons, related posts
- `app/about/page.tsx` — About/CV page
- `app/feed.xml/route.ts` — RSS feed (dynamic route handler)
- `components/` — Reusable UI components (Navbar, CommandMenu, ArticleCard, TableOfContents, Comments, etc.)
- `lib/posts.ts` — Content processing and post queries

### Key Integrations

- **Giscus** for GitHub-based comments (`components/Comments.tsx`)
- **Google AdSense** (`components/AdBanner.tsx`, `components/GoogleAdSense.tsx`)
- **Command palette** search via `cmdk` (`components/CommandMenu.tsx`, triggered by Cmd+K)
- **RSS feed** generated at `/feed.xml` via route handler

### Styling

- Tailwind CSS v4 with `@tailwindcss/typography` for prose content
- Dark theme: background `#020617`, slate grays, blue accents
- Framer Motion for animations (navbar, mobile menu)
- Geist font family (sans & mono)

### Static Export & Deployment

- `next.config.ts`: `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`, `reactCompiler: true`
- GitHub Actions (`.github/workflows/nextjs.yml`) builds and deploys to GitHub Pages on push to `master`
- Post images go in `public/images/posts/{year}/`

### Publishing Gotchas

- `image: "/images/posts/{year}/{slug}/file.png"` - 실제 파일은 `public/images/posts/{year}/{slug}/file.png`에 있어야 정적 배포에서 노출됨 (`images/` 루트는 미노출).
- `![...](/images/posts/{year}/{slug}/file.png)` - 본문 인라인 이미지도 동일하게 `public/images/...`에 파일이 있어야 깨지지 않음.
- `new post checklist` - 포스트 파일 생성 시 `frontmatter.image` 경로와 `public/images/posts/{year}/{slug}/` 실제 파일 존재를 함께 확인.
- `git add <specific files>` - 포스트 커밋 시 관련 파일만 스테이징(로컬 미추적 디렉터리 혼입 방지).

### SEO

- `next-sitemap` generates sitemap in `out/` during postbuild
- Each post page generates OpenGraph metadata and JSON-LD BlogPosting schema
- Google and Naver search console verification in root layout
