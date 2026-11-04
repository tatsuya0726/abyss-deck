'use strict';
// Checks that the English language layer is wired up and that dist/i18n-en.js
// is the current build of tools/i18n-en.tsv.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const assert = (v, m) => { if (!v) throw new Error(m); };
const dist = f => fs.readFileSync(path.join(root, 'dist', f), 'utf8');
for (const page of ['index.html', 'game.html']) {
  const html = dist(page);
  assert(html.includes('i18n.js?v='), page + ' does not load i18n.js');
  assert(html.includes('i18n-en.js?v='), page + ' does not load i18n-en.js');
}
const before = dist('i18n-en.js');
cp.execFileSync(process.execPath, [path.join(__dirname, 'build-i18n.cjs')], { stdio: 'ignore' });
assert(dist('i18n-en.js') === before, 'dist/i18n-en.js is stale: run node tools/build-i18n.cjs');
const dict = JSON.parse(before.replace(/^window\.ABYSS_EN_DICT=/, '').replace(/;\s*$/, ''));
for (const [jp, en] of Object.entries(dict)) {
  const n = (jp.match(/\{#?\}/g) || []).length, used = [...en.matchAll(/\{(\d+)\}/g)].map(m => +m[1]);
  assert(used.every(i => i < n), 'placeholder out of range: ' + jp);
}
assert(dist('title-tools.js').includes('settingsLang'), 'language button is missing from settings');
console.log('i18n ok:', Object.keys(dict).length, 'entries');
