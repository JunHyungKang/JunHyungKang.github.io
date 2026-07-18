import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { URL } from 'node:url';

const siteUrl = 'https://junhyungkang.github.io';
const requiredFiles = [
  'out/index.html',
  'out/about.html',
  'out/posts.html',
  'out/projects.html',
  'out/privacy-policy.html',
  'out/terms-of-service.html',
  'out/robots.txt',
  'out/ads.txt',
  'out/sitemap.xml',
];
const excludedPaths = new Set([
  '/posts/2022-07-01-pip_trusted_host',
  '/posts/2022-08-16-RL_basic',
  '/posts/2022-10-27-matplotlib',
  '/posts/2022-11-01-creative_problem_solving',
]);
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

if (existsSync('out/sitemap.xml')) {
  const sitemap = readFileSync('out/sitemap.xml', 'utf8');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  if (locations.length === 0) failures.push('Sitemap contains no URLs');
  if (new Set(locations).size !== locations.length) failures.push('Sitemap contains duplicate URLs');

  for (const location of locations) {
    const url = new URL(location);
    if (url.origin !== siteUrl) failures.push(`Unexpected sitemap origin: ${location}`);
    if (url.pathname !== '/' && url.pathname.endsWith('/')) failures.push(`Trailing slash in sitemap URL: ${location}`);
    if (excludedPaths.has(url.pathname)) failures.push(`Noindex post appears in sitemap: ${location}`);
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
  ['out/projects.html', `${siteUrl}/projects`],
  ['out/privacy-policy.html', `${siteUrl}/privacy-policy`],
]) {
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) failures.push(`Unexpected canonical in ${file}; expected ${canonical}`);
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

for (const path of excludedPaths) {
  const file = `out${path}.html`;
  if (!existsSync(file)) {
    failures.push(`Missing noindex post export: ${file}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (!/<meta name="robots" content="noindex, follow"\s*\/>/.test(html)) {
    failures.push(`Missing noindex directive: ${file}`);
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Static export verification passed.');
