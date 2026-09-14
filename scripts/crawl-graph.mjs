import { parse } from 'parse5';

// Inspect pre-rendered HTML, not serialized React props or data-href lookalikes.
// This checks discovery markup, not CSS visibility or Google's crawl decisions.
export function inspectHtml(html, pageUrl) {
  const anchors = [];
  const hrefs = [];
  const robots = {};
  const articleText = [];
  function visit(node, inArticle = false) {
    if (['script', 'style', 'template'].includes(node.tagName)) return;
    const attrs = Object.fromEntries((node.attrs || []).map(({ name, value }) => [name, value]));
    if (node.tagName === 'meta' && ['robots', 'googlebot'].includes(attrs.name?.toLowerCase())) {
      const key = attrs.name.toLowerCase();
      robots[key] = [robots[key], attrs.content].filter(Boolean).join(', ');
    }
    if (attrs.href) {
      const url = new URL(attrs.href, pageUrl);
      if (['http:', 'https:'].includes(url.protocol)) {
        url.hash = '';
        hrefs.push(url.href);
        if (node.tagName === 'a') anchors.push({ url: url.href, nofollow: /\bnofollow\b/i.test(attrs.rel || '') });
      }
    }
    const article = inArticle || node.tagName === 'article';
    if (article && node.nodeName === '#text') articleText.push(node.value);
    for (const child of node.childNodes || []) visit(child, article);
  }
  visit(parse(html));
  return { anchors, hrefs, robots, articleText: articleText.join('').trim() };
}

export function reachablePages(pages, root) {
  const reachable = new Set([new URL(root).href]);
  const queue = [...reachable];
  for (const url of queue) {
    const page = pages.get(url);
    if (!page || Object.values(page.robots).some(value => /\b(nofollow|none)\b/i.test(value))) continue;
    for (const anchor of page.anchors) {
      if (!anchor.nofollow && pages.has(anchor.url) && !reachable.has(anchor.url)) {
        reachable.add(anchor.url);
        queue.push(anchor.url);
      }
    }
  }
  return reachable;
}
