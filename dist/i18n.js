/* ABYSS DECK language layer.
 * Japanese stays the source language of the game data and logic. In English
 * mode the visible text is translated at the DOM level (text nodes and a few
 * attributes), so card/enemy/relic ids and save data are never touched.
 * Dictionary: i18n-en.js (window.ABYSS_EN_DICT). A key containing "{}" is a
 * template whose placeholders are numbered {0},{1},… in the translation. */
(() => {
  'use strict';
  const KEY = 'abyssLang';
  const readLang = () => { try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'ja'; } catch (e) { return 'ja'; } };
  const lang = readLang();
  window.abyssLang = () => lang;
  window.abyssSetLang = next => {
    try { localStorage.setItem(KEY, next === 'en' ? 'en' : 'ja'); } catch (e) {}
    location.reload();
  };
  window.abyssToggleLang = () => window.abyssSetLang(lang === 'en' ? 'ja' : 'en');
  window.abyssTr = text => text;
  if (lang !== 'en') return;

  const root = document.documentElement;
  root.lang = 'en';
  root.classList.add('lang-en');
  {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'lang-en.css?v=2';
    (document.head || root).appendChild(link);
  }

  const CJK = /[぀-ヿ㐀-鿿＀-￯]/;
  const dict = window.ABYSS_EN_DICT || {};
  const exact = new Map(), patterns = [];
  for (const [jp, en] of Object.entries(dict)) {
    if (jp.includes('{}') || jp.includes('{#}')) {
      // {} = any text, {#} = a run of digits
      const toks = jp.split(/(\{\}|\{#\})/);
      const src = toks.map(t => t === '{}' ? '([^。\\n]+?)' : t === '{#}' ? '([0-9０-９]+(?:[.,][0-9]+)?)' : t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
      patterns.push({ re: new RegExp('^' + src + '$'), en, weight: jp.replace(/\{#?\}/g, '').length });
    } else exact.set(jp, en);
  }
  patterns.sort((a, b) => b.weight - a.weight);
  const fragKeys = [...exact.keys()].filter(k => k.length >= 2).sort((a, b) => b.length - a.length);

  const FULL = { '、': ', ', '。': '. ', '（': ' (', '）': ')', '：': ': ', '・': ' · ', '「': '"', '」': '"', '『': '"', '』': '"', '！': '!', '？': '?', '％': '%', '＋': '+', '－': '-', '−': '-', '×': '×', '～': '~', '〜': '~', '　': ' ', '…': '…', '／': '/' };
  const normalize = s => s
    .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[、。（）：・「」『』！？％＋－−～〜　／]/g, c => FULL[c])
    .replace(/ {2,}/g, ' ').replace(/\( /g, '(').replace(/ ([.,!?])/g, '$1')
    // "3 card(s)" -> "3 cards" / "1 card"; "every 1 turn(s)" -> "every turn"
    .replace(/\b(\d+)((?: [A-Za-z'’-]+)*?) ([A-Za-z]+)\(s\)/g, (m, n, mid, w) => `${n}${mid} ${w}${n === '1' ? '' : 's'}`)
    .replace(/\b(every|per|each) 1 (time|turn|hit|card)\b/gi, '$1 $2');

  const cache = new Map();
  const misses = (window.ABYSS_I18N_MISS = new Set());

  function fill(tpl, groups) {
    return tpl.replace(/\{(\d+)\}/g, (_, i) => translateCore(groups[+i] ?? ''));
  }

  // leading symbols/emoji (⚠ ☠ 🔥 …) are kept as they are, the rest is translated
  const LEAD = /^([^\p{L}\p{N}「『（(\[{]+)(.+)$/su;

  function translateCore(core) {
    if (!core || !CJK.test(core)) return core;
    const hit = cache.get(core);
    if (hit !== undefined) return hit;
    let out = exact.get(core);
    if (out === undefined) {
      for (const p of patterns) {
        const m = p.re.exec(core);
        if (m) { out = fill(p.en, m.slice(1)); break; }
      }
    }
    if (out === undefined) {
      const m = LEAD.exec(core);
      if (m && CJK.test(m[2])) {
        const rest = translateCore(m[2]);
        out = normalize(m[1]).replace(/\s+$/, ' ') + rest;
        cache.set(core, out);
        return out;
      }
    }
    if (out === undefined) {
      // 「quoted text」
      const q = /^[「『]([^「『」』]+)[」』]$/.exec(core);
      if (q) {
        const inner = translateCore(q[1]);
        if (!CJK.test(inner)) { out = '"' + inner + '"'; cache.set(core, out); return out; }
      }
    }
    if (out === undefined) {
      // "Label：text" (e.g. card name：effect)
      const m = /^([^：。\n]{1,30})：(.+)$/s.exec(core);
      if (m) {
        const left = translateCore(m[1]), right = translateCore(m[2]);
        out = left + ': ' + right;
        if (!CJK.test(out)) { cache.set(core, out); return out; }
        out = undefined;
      }
    }
    if (out === undefined && /[。\n]./.test(core)) {
      // several sentences: translate each, keeping the order
      const bits = core.split(/(?<=。)|\n/).map(s => s.trim()).filter(Boolean);
      if (bits.length > 1) out = bits.map(translateCore).join(' ');
    }
    if (out === undefined) {
      // fall back to replacing known fragments, longest first
      let t = core, changed = false;
      for (const k of fragKeys) {
        if (t.includes(k)) { t = t.split(k).join(exact.get(k)); changed = true; }
      }
      out = changed ? t : core;
    }
    out = normalize(out).trim();
    if (CJK.test(out)) misses.add(core);
    cache.set(core, out);
    return out;
  }

  function translate(text) {
    if (!text || !CJK.test(text)) return text;
    const lead = /^\s*/.exec(text)[0], trail = /\s*$/.exec(text)[0];
    return lead + translateCore(text.trim()) + trail;
  }
  window.abyssTr = translate;

  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT']);
  const skipped = n => {
    for (let e = n.nodeType === 1 ? n : n.parentElement; e; e = e.parentElement) {
      if (SKIP.has(e.tagName)) return true;
      if (e.hasAttribute && e.hasAttribute('data-no-i18n')) return true;
    }
    return false;
  };
  const ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];

  function visit(node) {
    if (node.nodeType === 3) {
      if (CJK.test(node.nodeValue) && !skipped(node)) {
        let next = translate(node.nodeValue);
        if (next !== node.nodeValue) {
          // Japanese needs no spaces between neighbouring nodes; English does
          const prev = node.previousSibling, after = node.nextSibling;
          if (after && /[.!?:]$/.test(next) && !/^\s/.test(after.textContent || '')) next += ' ';
          if (prev && /^[A-Za-z0-9]/.test(next) && !/[\s(“‘\[]$/.test(prev.textContent || '')) next = ' ' + next;
          node.nodeValue = next;
        }
      }
      return;
    }
    if (node.nodeType !== 1 || skipped(node)) return;
    for (const a of ATTRS) {
      const v = node.getAttribute(a);
      if (v && CJK.test(v)) { const t = translate(v); if (t !== v) node.setAttribute(a, t); }
    }
    for (let c = node.firstChild; c; c = c.nextSibling) visit(c);
  }

  const observer = new MutationObserver(records => {
    for (const r of records) {
      if (r.type === 'characterData') visit(r.target);
      else if (r.type === 'attributes') { const v = r.target.getAttribute(r.attributeName); if (v && CJK.test(v)) { const t = translate(v); if (t !== v) r.target.setAttribute(r.attributeName, t); } }
      else r.addedNodes.forEach(visit);
    }
  });
  observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  visit(root);

  for (const fn of ['alert', 'confirm', 'prompt']) {
    const orig = window[fn];
    if (typeof orig === 'function') window[fn] = function (msg, ...rest) { return orig.call(window, translate(String(msg ?? '')), ...rest); };
  }
})();
