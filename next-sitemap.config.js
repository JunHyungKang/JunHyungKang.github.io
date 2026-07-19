/** @type {import('next-sitemap').IConfig} */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

function getMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? getMarkdownFiles(fullPath) : [fullPath];
  }).filter((file) => file.endsWith('.md'));
}

const noindexPostPaths = getMarkdownFiles(path.join(process.cwd(), 'content/posts'))
  .filter((file) => matter.read(file).data.noindex === true)
  .map((file) => `/posts/${path.basename(file, '.md')}`);

const postLastModified = new Map(
  getMarkdownFiles(path.join(process.cwd(), 'content/posts')).map((file) => {
    const data = matter.read(file).data;
    const postPath = `/posts/${path.basename(file, '.md')}`;
    return [postPath, data.updated || data.date];
  }),
);

module.exports = {
  siteUrl: 'https://junhyungkang.github.io',
  generateRobotsTxt: true,
  outDir: 'out',
  generateIndexSitemap: false,
  trailingSlash: false,
  autoLastmod: false,
  exclude: noindexPostPaths,
  transform: async (_config, urlPath) => {
    const lastmod = postLastModified.get(urlPath);
    return {
      loc: urlPath,
      ...(lastmod ? { lastmod } : {}),
    };
  },
};
