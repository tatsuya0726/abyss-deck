'use strict';
// Release-only cache stamp: keep the URLs and save-data origin unchanged.
const fs = require('node:fs');
const path = require('node:path');
const revision = process.env.GITHUB_SHA || '';
if (!/^[0-9a-f]{40}$/i.test(revision)) {
  throw new Error('GITHUB_SHA must be the full commit SHA for this release');
}
const dist = path.resolve(__dirname, '..', 'dist');
const edits = ['index.html', 'game.html'].map(name => {
  const file = path.join(dist, name);
  const source = fs.readFileSync(file, 'utf8');
  let count = 0;
  const content = source.replace(/(\bsrc=["']responsive-shell\.js\?v=)[^"']+/g, (_, prefix) => {
    count++;
    return prefix + revision;
  });
  if (count !== 1) throw new Error(`${name}: expected exactly one responsive-shell script, found ${count}`);
  return { file, name, content };
});
for (const { file, name, content } of edits) {
  fs.writeFileSync(file, content);
  console.log(`${name}: responsive-shell.js?v=${revision}`);
}
