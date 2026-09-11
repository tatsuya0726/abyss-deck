const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(root)) throw new Error(`dist folder not found: ${root}`);

const files = fs.readdirSync(root, { recursive: true })
  .filter(file => fs.statSync(path.join(root, file)).isFile());
const references = new Map();
const syntaxErrors = [];

for (const file of files.filter(file => /\.(html|js|css)$/i.test(file))) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of text.matchAll(/(?:assets\/)[a-zA-Z0-9_./-]+\.(?:webp|png|jpg|jpeg|svg|mp3|ogg|wav|woff2?)/g)) {
    if (!references.has(match[0])) references.set(match[0], []);
    references.get(match[0]).push(file);
  }
  if (file.endsWith('.html')) {
    for (const match of text.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
      const ref = match[1].split('?')[0];
      if (!/^(https?:|data:|#|\$)/.test(ref)) {
        if (!references.has(ref)) references.set(ref, []);
        references.get(ref).push(file);
      }
    }
  }
  try {
    if (file.endsWith('.js')) new vm.Script(text, { filename: file });
    if (file.endsWith('.html')) {
      for (const match of text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
        if (match[1].trim()) new vm.Script(match[1], { filename: file });
      }
    }
  } catch (error) {
    syntaxErrors.push(error.message);
  }
}

const report = {
  root,
  files: files.length,
  images: files.filter(file => /\.(webp|png|jpg|jpeg|svg)$/i.test(file)).length,
  audio: files.filter(file => /\.(mp3|ogg|wav)$/i.test(file)).length,
  uniqueReferences: references.size,
  missing: [...references].filter(([ref]) => !fs.existsSync(path.join(root, ref)))
    .map(([ref, from]) => ({ path: ref, from: [...new Set(from)] })),
  empty: files.filter(file => fs.statSync(path.join(root, file)).size === 0),
  syntaxErrors
};

fs.writeFileSync(path.resolve(__dirname, '..', 'verify-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.missing.length || report.empty.length || report.syntaxErrors.length ? 1 : 0;
