import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
const redirects = JSON.parse(readFileSync('config/legacy-urls.json', 'utf8'));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
for (const [from, to] of Object.entries(redirects)) {
  if (!/^\/tech\/[A-Za-z0-9_-]+\/$/.test(from) || !/^\/posts\/[A-Za-z0-9_-]+$/.test(to)) throw new Error(`Invalid legacy mapping: ${from}`);
  if (!existsSync(`out${to}.html`)) throw new Error(`Missing legacy target: ${to}`);
  const file = join('out', from, 'index.html');
  if (existsSync(file)) throw new Error(`Refusing to overwrite route: ${from}`);
  mkdirSync(dirname(file), { recursive: true });
  const target = escape(`https://junhyungkang.github.io${to}`);
  // GitHub Pages cannot configure HTTP redirects. An immediate HTML redirect
  // preserves navigation; it is not an HTTP 301. Only targets enter the sitemap.
  writeFileSync(file, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="${target}"><title>글 주소가 변경되었습니다</title></head><body><p>글 주소가 변경되었습니다. <a href="${target}">현재 글로 이동</a></p></body></html>`);
}
