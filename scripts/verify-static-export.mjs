import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { URL } from 'node:url';
import { basename } from 'node:path';
import matter from 'gray-matter';
import { inspectHtml, reachablePages } from './crawl-graph.mjs';

const siteUrl = 'https://junhyungkang.github.io';
const requiredFiles = [
  'out/index.html',
  'out/about.html',
  'out/posts.html',
  'out/topics.html',
  'out/topics/ai-agents.html',
  'out/topics/agent-harness.html',
  'out/topics/llm-engineering.html',
  'out/projects.html',
  'out/editorial-policy.html',
  'out/privacy-policy.html',
  'out/terms-of-service.html',
  'out/robots.txt',
  'out/ads.txt',
  'out/sitemap.xml',
];
const failures = [];
const crawlPages = new Map();
const sitemapLocations = [];

function getFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? getFiles(path) : [path];
  });
}

for (const file of requiredFiles) {
  if (!existsSync(file)) failures.push(`Missing export file: ${file}`);
}

const postSources = getFiles('content/posts').filter((path) => path.endsWith('.md'));
const sourcePosts = postSources.map((file) => {
  const { data } = matter(readFileSync(file, 'utf8'));
  const slug = basename(file, '.md');

  for (const field of ['title', 'date', 'teaser']) {
    if (typeof data[field] !== 'string' || data[field].trim() === '') failures.push(`Invalid ${field} in ${file}`);
  }
  if (!Array.isArray(data.tags) || data.tags.length === 0) failures.push(`Invalid tags in ${file}`);
  if (typeof data.date === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) failures.push(`Invalid date format in ${file}: ${data.date}`);
  if (typeof data.date === 'string' && !slug.startsWith(data.date)) failures.push(`Filename/date mismatch in ${file}: ${data.date}`);
  if (data.noindex !== true && (typeof data.contentType !== 'string' || data.contentType.trim() === '')) {
    failures.push(`Indexable post missing contentType in ${file}`);
  }
  if (data.noindex !== true && (typeof data.evidence !== 'string' || data.evidence.trim() === '')) {
    failures.push(`Indexable post missing evidence in ${file}`);
  }

  if (typeof data.updated === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(data.updated)) {
    failures.push(`Invalid updated format in ${file}: ${data.updated}`);
  }
  if (typeof data.updated === 'string' && data.updated < data.date) {
    failures.push(`Updated date predates publication in ${file}: ${data.updated}`);
  }

  return {
    file,
    slug,
    date: data.date,
    updated: data.updated,
    noindex: data.noindex === true,
  };
});
const publicPosts = sourcePosts.filter((post) => !post.noindex);
const archivedPosts = sourcePosts.filter((post) => post.noindex);

if (existsSync('out/sitemap.xml')) {
  const sitemap = readFileSync('out/sitemap.xml', 'utf8');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  sitemapLocations.push(...locations.map(location => new URL(location).href));
  const sitemapPaths = new Set(locations.map((location) => new URL(location).pathname));
  const sitemapEntries = new Map(
    [...sitemap.matchAll(/<url>(.*?)<\/url>/gs)].map((match) => {
      const location = match[1].match(/<loc>(.*?)<\/loc>/)?.[1];
      const lastmod = match[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
      return [location ? new URL(location).pathname : '', { lastmod }];
    }),
  );
  if (locations.length === 0) failures.push('Sitemap contains no URLs');
  if (new Set(locations).size !== locations.length) failures.push('Sitemap contains duplicate URLs');
  if (/<changefreq>|<priority>/.test(sitemap)) failures.push('Sitemap contains ignored changefreq or priority hints');
  if (sitemapPaths.has('/feed.xml')) failures.push('RSS feed must not be listed as a canonical page in sitemap.xml');

  for (const location of locations) {
    const url = new URL(location);
    if (url.origin !== siteUrl) failures.push(`Unexpected sitemap origin: ${location}`);
    if (url.pathname !== '/' && url.pathname.endsWith('/')) failures.push(`Trailing slash in sitemap URL: ${location}`);
    const output = url.pathname === '/' ? 'out/index.html' : `out${decodeURIComponent(url.pathname)}.html`;
    if (!existsSync(output)) {
      failures.push(`Sitemap URL does not map to an exported HTML page: ${location}`);
      continue;
    }

    const html = readFileSync(output, 'utf8');
    if (!html.includes(`<link rel="canonical" href="${location}"`)) {
      failures.push(`Sitemap URL is not self-canonical: ${location}`);
    }
    if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html)) {
      failures.push(`Noindex page must not be listed in sitemap.xml: ${location}`);
    }
  }

  for (const post of archivedPosts) {
    const output = `out/posts/${post.slug}.html`;
    if (!existsSync(output)) {
      failures.push(`Archived URL must remain readable: ${output}`);
      continue;
    }
    const html = readFileSync(output, 'utf8');
    if (!/<meta name="robots" content="noindex, follow"/.test(html)) failures.push(`Archive must remain noindex: ${output}`);
    if (sitemapPaths.has(`/posts/${post.slug}`)) failures.push(`Archive leaked into sitemap: ${output}`);
    if (html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) failures.push(`Archive must not load ads: ${output}`);
  }

  for (const post of publicPosts) {
    const output = `out/posts/${post.slug}.html`;
    if (!existsSync(output)) {
      failures.push(`Missing post export: ${output}`);
      continue;
    }
    const html = readFileSync(output, 'utf8');
    const canonicalPath = `/posts/${post.slug}`;
    const parsed = inspectHtml(html, `${siteUrl}${canonicalPath}`);
    if (!parsed.articleText) failures.push(`Missing pre-rendered article content: ${output}`);
    if (!/\bindex\b/.test(parsed.robots.robots || '') || !/\bfollow\b/.test(parsed.robots.robots || '')) {
      failures.push(`Public post lost inherited robots metadata: ${output}`);
    }
    if (!/max-image-preview:large/.test(parsed.robots.googlebot || '')) {
      failures.push(`Public post lost Google preview metadata: ${output}`);
    }
    const hasAds = html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');

    if (!sitemapPaths.has(canonicalPath)) failures.push(`Indexable post missing from sitemap: ${canonicalPath}`);
    if (!hasAds) failures.push(`AdSense missing from indexable post: ${output}`);
    const expectedLastmod = post.updated || post.date;
    const actualLastmod = sitemapEntries.get(canonicalPath)?.lastmod;
    if (actualLastmod !== expectedLastmod) {
      failures.push(`Incorrect sitemap lastmod for ${canonicalPath}; expected ${expectedLastmod}, received ${actualLastmod}`);
    }
    if (!html.includes('"@type":"BlogPosting"')) failures.push(`BlogPosting JSON-LD missing from ${output}`);
    if (!html.includes('"@type":"BreadcrumbList"')) failures.push(`Breadcrumb JSON-LD missing from ${output}`);
    if (!html.includes('rel="author"') || !html.includes('href="/about"')) failures.push(`Visible author link missing from ${output}`);
    if (!html.includes('ABOUT THIS ARTICLE') || !html.includes('href="/editorial-policy"')) {
      failures.push(`Evidence and editorial policy block missing from ${output}`);
    }
    if ((html.match(/<h1\b/g) || []).length !== 1) failures.push(`Indexable post must render exactly one h1: ${output}`);
    if (!html.includes('"image":["https://')) failures.push(`Absolute BlogPosting image missing from ${output}`);
    if (!html.includes('<meta property="og:image" content="https://')) failures.push(`Open Graph image missing from ${output}`);
    const imageSources = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    for (const src of [...imageSources, ...(ogImage ? [ogImage] : [])]) {
      const url = new URL(src, siteUrl);
      if (url.origin === siteUrl && !existsSync(`out${decodeURIComponent(url.pathname)}`)) failures.push(`Missing image in ${output}: ${src}`);
    }
    for (const [, href] of html.matchAll(/href="#([^"]+)"/g)) {
      const id = decodeURIComponent(href);
      if (!html.includes(`id="${id}"`)) failures.push(`Missing heading target in ${output}: ${id}`);
    }
  }

  for (const topicPath of ['/topics', '/topics/ai-agents', '/topics/agent-harness', '/topics/llm-engineering']) {
    if (!sitemapPaths.has(topicPath)) failures.push(`Topic page missing from sitemap: ${topicPath}`);
  }
}

if (existsSync('out/robots.txt')) {
  const robots = readFileSync('out/robots.txt', 'utf8');
  if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) failures.push('robots.txt does not declare the production sitemap');
  if (/Disallow:\s*\/$/m.test(robots)) failures.push('robots.txt blocks the entire site');
}

for (const [file, canonical] of [
  ['out/index.html', siteUrl],
  ['out/about.html', `${siteUrl}/about`],
  ['out/posts.html', `${siteUrl}/posts`],
  ['out/topics.html', `${siteUrl}/topics`],
  ['out/topics/ai-agents.html', `${siteUrl}/topics/ai-agents`],
  ['out/topics/agent-harness.html', `${siteUrl}/topics/agent-harness`],
  ['out/topics/llm-engineering.html', `${siteUrl}/topics/llm-engineering`],
  ['out/projects.html', `${siteUrl}/projects`],
  ['out/editorial-policy.html', `${siteUrl}/editorial-policy`],
  ['out/privacy-policy.html', `${siteUrl}/privacy-policy`],
]) {
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) failures.push(`Unexpected canonical in ${file}; expected ${canonical}`);
}

if (existsSync('out/index.html')) {
  const home = readFileSync('out/index.html', 'utf8');
  if (!home.includes('<meta name="google-adsense-account" content="ca-pub-3166603343095810"')) failures.push('AdSense ownership metadata missing from homepage');
  if (!home.includes('"@type":"WebSite"')) failures.push('WebSite JSON-LD missing from homepage');
  if (!home.includes('type="application/rss+xml"')) failures.push('RSS discovery link missing from homepage');
}

for (const file of getFiles('out').filter((path) => path.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const pathname = file === 'out/index.html' ? '/' : file.slice(3, -5);
  const pageUrl = new URL(pathname, siteUrl).href;
  const parsed = inspectHtml(html, pageUrl);
  crawlPages.set(pageUrl, parsed);
  const links = parsed.hrefs;

  for (const link of links) {
    if (new URL(link).origin !== siteUrl) continue;
    const pathname = decodeURIComponent(new URL(link, siteUrl).pathname);
    if (pathname.startsWith('/_next/')) continue;

    const target = pathname === '/'
      ? 'out/index.html'
      : pathname.includes('.')
        ? `out${pathname}`
        : `out${pathname}.html`;
    if (!existsSync(target)) failures.push(`Broken internal link in ${file}: ${link}`);
  }
}

const reachable = reachablePages(crawlPages, `${siteUrl}/`);
for (const location of sitemapLocations) {
  if (!reachable.has(location)) failures.push(`Sitemap page unreachable through static anchors from home: ${location}`);
}

for (const file of ['out/index.html', 'out/posts.html']) {
  if (existsSync(file) && readFileSync(file, 'utf8').includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
    failures.push(`AdSense script must not load on navigation page: ${file}`);
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Static export verification passed.');
