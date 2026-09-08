import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectHtml, reachablePages } from '../scripts/crawl-graph.mjs';

const root = 'https://example.com/';
test('only real static anchors contribute to discovery', () => {
  const page = inspectHtml(`<script>const x = '<a href="/script">x</a>'</script>
    <template><a href="/template">x</a></template>
    <div data-href="/data">x</div><link href="/stylesheet" rel="stylesheet">
    <a HREF='/post?x=1&amp;y=2#section'>Read</a><a href="mailto:a@example.com">mail</a>`, root);
  assert.deepEqual(page.anchors, [{ url: root + 'post?x=1&y=2', nofollow: false }]);
  assert.deepEqual(page.hrefs, [root + 'stylesheet', root + 'post?x=1&y=2']);
});

test('follows multi-hop anchors, not disconnected cycles or nofollow links', () => {
  const pages = new Map(Object.entries({
    '': '<a href="/list">List</a><a rel="NOFOLLOW" href="/blocked">Blocked</a>',
    list: '<a href="/post#heading">Post</a>',
    post: '<article>Server-rendered content</article>',
    blocked: '', orphan: '<a href="/cycle">Cycle</a>', cycle: '<a href="/orphan">Orphan</a>',
  }).map(([path, html]) => [root + path, inspectHtml(html, root + path)]));
  assert.deepEqual([...reachablePages(pages, root)], [root, root + 'list', root + 'post']);
});

test('combines duplicate robots directives and respects page-level nofollow', () => {
  const page = inspectHtml('<meta name="robots" content="index"><meta name="robots" content="nofollow"><a href="/post">Post</a>', root);
  assert.equal(page.robots.robots, 'index, nofollow');
  assert.deepEqual([...reachablePages(new Map([[root, page], [root + 'post', inspectHtml('', root)]]), root)], [root]);
});

test('article content excludes scripts and templates', () => {
  const page = inspectHtml('<article>Hello <b>world</b><script>fake body</script><template>hidden body</template></article>', root);
  assert.equal(page.articleText, 'Hello world');
});
