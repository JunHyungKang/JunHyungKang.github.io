/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://junhyungkang.github.io',
  generateRobotsTxt: true,
  outDir: 'out',
  generateIndexSitemap: false,
  trailingSlash: false,
  exclude: [
    '/posts/2022-07-01-pip_trusted_host',
    '/posts/2022-08-16-RL_basic',
    '/posts/2022-10-27-matplotlib',
    '/posts/2022-11-01-creative_problem_solving',
  ],
};
