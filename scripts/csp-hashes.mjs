#!/usr/bin/env node
/**
 * CSP inline-script hash generator
 *
 * Lists every inline <script> block (no src attribute) in an HTML file with its
 * line range, size, and SHA-256 hash so the hashes can be added to a
 * script-src CSP directive as 'sha256-<base64>' entries. This lets a page keep
 * a strict CSP (no 'unsafe-inline') while allowing its declarative inline
 * scripts (import maps, tiny compatibility shims).
 *
 * Usage: node scripts/csp-hashes.mjs [path/to/page.html]
 * (defaults to royalties.html)
 *
 * D2 tooling — see APPLICATION_REVIEW.md.
 */

import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { resolve } from 'path';

const file = resolve(process.argv[2] || 'royalties.html');
const html = readFileSync(file, 'utf8');
const lines = html.split('\n');

const scriptTagRe = /<script\b([^>]*)>/gi;
const results = [];

let match;
while ((match = scriptTagRe.exec(html)) !== null) {
  const attrs = match[1] || '';
  const openTagEnd = match.index + match[0].length;

  // Only inline scripts (no src=) are relevant
  if (/\bsrc\s*=/.test(attrs)) continue;

  const closeIdx = html.indexOf('</script>', openTagEnd);
  if (closeIdx === -1) continue;

  const content = html.slice(openTagEnd, closeIdx);
  const startLine = html.slice(0, match.index).split('\n').length;
  const endLine = html.slice(0, closeIdx).split('\n').length;

  // CSP hashes the exact raw bytes of the element's content
  const hash = createHash('sha256').update(content, 'utf8').digest('base64');
  const type = /type\s*=\s*["']?([\w/-]+)/i.exec(attrs)?.[1] || 'classic';

  results.push({ startLine, endLine, type, bytes: content.length, hash });
}

console.log(`Inline <script> blocks in ${process.argv[2] || 'royalties.html'}: ${results.length}`);
for (const r of results) {
  console.log(`  L${r.startLine}-${r.endLine}  type=${r.type}  ${r.bytes} bytes`);
  console.log(`    'sha256-${r.hash}'`);
}
const csp = results.map((r) => `'sha256-${r.hash}'`).join(' ');
console.log(`\nscript-src additions:\n  ${csp}`);
