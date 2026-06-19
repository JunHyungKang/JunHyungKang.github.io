---
name: korean-editorial-check
description: Review Korean blog or portfolio copy for spelling, spacing, character count, tone, and publishability in JunHyungKang.github.io. Use when polishing Korean posts, teasers, titles, meta descriptions, profile copy, or public career/AI engineering writing.
---

# Korean Editorial Check

Check Korean text for public readability without changing the technical claim.

## Workflow

1. Read the target file and identify the exact public surface: post body, title, teaser, metadata, about page, or portfolio copy.
2. Preserve code, math, API names, model names, citations, and English technical terms.
3. Check:
   - spacing and obvious spelling issues
   - sentence length and paragraph breaks
   - title/teaser length and search-result readability
   - whether Korean and English terms are mixed intentionally
   - whether any phrase sounds like machine translation
4. If a field has a limit, report character count and byte count.
5. Prefer small edits over rewriting the author's voice.
6. If the text came from `../career-ops`, confirm private details were sanitized before publishing.

## Output

When reviewing without directly editing, return:

1. `Issues`
2. `Suggested rewrite`
3. `Count check` when relevant
