import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { URL } from 'node:url';
import { basename } from 'node:path';
import matter from 'gray-matter';

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
  'out/privacy-policy.html',
  'out/terms-of-service.html',
  'out/robots.txt',
  'out/ads.txt',
  'out/sitemap.xml',
];
const failures = [];

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

if (existsSync('out/sitemap.xml')) {
  const sitemap = readFileSync('out/sitemap.xml', 'utf8');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
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

  for (const location of locations) {
    const url = new URL(location);
    if (url.origin !== siteUrl) failures.push(`Unexpected sitemap origin: ${location}`);
    if (url.pathname !== '/' && url.pathname.endsWith('/')) failures.push(`Trailing slash in sitemap URL: ${location}`);
  }

  for (const post of sourcePosts) {
    const output = `out/posts/${post.slug}.html`;
    if (!existsSync(output)) {
      failures.push(`Missing post export: ${output}`);
      continue;
    }
    const html = readFileSync(output, 'utf8');
    const canonicalPath = `/posts/${post.slug}`;
    const hasNoindex = /<meta name="robots" content="noindex, follow"\s*\/>/.test(html);
    const hasAds = html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');

    if (post.noindex !== hasNoindex) failures.push(`Source/output noindex mismatch: ${post.file}`);
    if (post.noindex && sitemapPaths.has(canonicalPath)) failures.push(`Noindex post appears in sitemap: ${canonicalPath}`);
    if (post.noindex && hasAds) failures.push(`AdSense loads on noindex post: ${output}`);
    if (!post.noindex && !sitemapPaths.has(canonicalPath)) failures.push(`Indexable post missing from sitemap: ${canonicalPath}`);
    if (!post.noindex && !hasAds) failures.push(`AdSense missing from indexable post: ${output}`);
    if (!post.noindex) {
      const expectedLastmod = post.updated || post.date;
      const actualLastmod = sitemapEntries.get(canonicalPath)?.lastmod;
      if (actualLastmod !== expectedLastmod) {
        failures.push(`Incorrect sitemap lastmod for ${canonicalPath}; expected ${expectedLastmod}, received ${actualLastmod}`);
      }
      if (!html.includes('"@type":"BlogPosting"')) failures.push(`BlogPosting JSON-LD missing from ${output}`);
      if (!html.includes('"@type":"BreadcrumbList"')) failures.push(`Breadcrumb JSON-LD missing from ${output}`);
      if (!html.includes('rel="author"') || !html.includes('href="/about"')) failures.push(`Visible author link missing from ${output}`);
      if (!html.includes('"image":["https://')) failures.push(`Absolute BlogPosting image missing from ${output}`);
      if (!html.includes('<meta property="og:image" content="https://')) failures.push(`Open Graph image missing from ${output}`);
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
  ['out/privacy-policy.html', `${siteUrl}/privacy-policy`],
]) {
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) failures.push(`Unexpected canonical in ${file}; expected ${canonical}`);
}

if (existsSync('out/index.html')) {
  const home = readFileSync('out/index.html', 'utf8');
  if (!home.includes('"@type":"WebSite"')) failures.push('WebSite JSON-LD missing from homepage');
  if (!home.includes('type="application/rss+xml"')) failures.push('RSS discovery link missing from homepage');
}

for (const file of getFiles('out').filter((path) => path.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);

  for (const link of links) {
    if (!link.startsWith('/') || link.startsWith('//')) continue;
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

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Static export verification passed.');
