# Post visibility and legacy URLs

Post frontmatter fields are independent:

- `noindex`: exclude from search and sitemap (default false).
- `listed`: show in the site's lists, search menu, related posts and feed. Omitted values retain the old default `!noindex`.
- `adsEnabled`: load the AdSense script. Omitted values retain the old default `!noindex`.

Restored historical articles explicitly set `listed: true`, `noindex: false`, and `adsEnabled: false`. New visibility changes should set all three fields intentionally. Editorial labels and evidence describe the article; they do not prove Google indexing or ad approval.

`legacy-urls.json` contains only mappings supported by repository history. Both current entries derive from `_config.yml` (`/:categories/:title/`) and the `tech` category in the pre-migration posts at `aa815aeb^`. Their current destinations remain archived; restoring access does not change their indexing policy.

Postbuild generates immediate HTML redirects with a canonical and a clickable fallback after sitemap generation. These are **not HTTP 301 redirects**. GitHub Pages handles the directory URL. Keep aliases out of the sitemap; never overwrite an existing route or target another alias. Add additional mappings only after confirming historical URL identity.
