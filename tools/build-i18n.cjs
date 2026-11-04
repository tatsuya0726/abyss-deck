'use strict';
// Builds dist/i18n-en.js from tools/i18n-en.tsv (JP key <TAB> EN text).
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const dict = {};
for (const line of fs.readFileSync(path.join(root, 'tools/i18n-en.tsv'), 'utf8').split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  const i = line.indexOf('\t');
  if (i < 0) throw new Error('bad line: ' + line);
  dict[line.slice(0, i)] = line.slice(i + 1);
}
// "ただし、…" (However, …) is shown without the connective where the UI splits it into its own row.
for (const [jp, en] of Object.entries({ ...dict })) {
  if (jp.startsWith('ただし、') && !dict[jp.slice(4)]) {
    const t = en.replace(/^However,\s*/i, '');
    dict[jp.slice(4)] = t.charAt(0).toUpperCase() + t.slice(1);
  }
}
fs.writeFileSync(path.join(root, 'dist/i18n-en.js'), 'window.ABYSS_EN_DICT=' + JSON.stringify(dict) + ';\n');
console.log('i18n-en.js:', Object.keys(dict).length, 'entries');
