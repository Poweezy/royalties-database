// One-shot D2 migration: extract inline <script> blocks from royalties.html
// into external files (byte-perfect), replace with <script src> tags.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const htmlPath = resolve('royalties.html');
const html = readFileSync(htmlPath, 'utf8');

// target mapping keyed by the block's start line (from scripts/csp-hashes.mjs)
const targets = {
  83: { file: 'js/bootstrap/register-service-worker.js', tag: '<script src="js/bootstrap/register-service-worker.js"></script>' },
  3969: { file: null, tag: '' }, // comments-only block — delete
  3975: { file: 'js/bootstrap/communication-hub.js', tag: '<script src="js/bootstrap/communication-hub.js"></script>' },
  4198: { file: 'js/legacy/nomodule-fallback.js', tag: '<script nomodule src="js/legacy/nomodule-fallback.js"></script>' },
  4595: { file: 'js/bootstrap/dashboard-init.js', tag: '<script src="js/bootstrap/dashboard-init.js"></script>' },
  4670: { file: 'js/bootstrap/global-error-handler.js', tag: '<script src="js/bootstrap/global-error-handler.js"></script>' },
};

const header = (src) =>
  `// Extracted from royalties.html inline script (D2 inline-script extraction).\n` +
  `// Legacy glue script: classic script on purpose (same parse-time execution\n` +
  `// order as the original inline block) — see APPLICATION_REVIEW.md.\n\n`;

const scriptTagRe = /<script\b([^>]*)>/gi;
const edits = []; // { start, end, tag, content, file }
let match;
while ((match = scriptTagRe.exec(html)) !== null) {
  const attrs = match[1] || '';
  if (/\bsrc\s*=/.test(attrs)) continue;
  const openTagEnd = match.index + match[0].length;
  const closeIdx = html.indexOf('</script>', openTagEnd);
  if (closeIdx === -1) continue;
  const startLine = html.slice(0, match.index).split('\n').length;
  const target = targets[startLine];
  if (!target) continue;
  edits.push({
    start: match.index,
    end: closeIdx + '</script>'.length,
    tag: target.tag,
    content: html.slice(openTagEnd, closeIdx),
    file: target.file,
    startLine,
  });
}

if (edits.length !== Object.keys(targets).length) {
  console.error(`Expected ${Object.keys(targets).length} blocks, found ${edits.length}: ` +
    edits.map((e) => e.startLine).join(', '));
  process.exit(1);
}

// Write extracted files
for (const e of edits) {
  if (!e.file) continue;
  mkdirSync(resolve(e.file, '..'), { recursive: true });
  writeFileSync(resolve(e.file), header(e.file) + e.content.trimStart() + '\n', 'utf8');
  console.log(`extracted L${e.startLine} -> ${e.file} (${e.content.length} bytes)`);
}

// Rebuild HTML applying edits from the end (indices stay valid)
let out = html;
for (const e of [...edits].sort((a, b) => b.start - a.start)) {
  out = out.slice(0, e.start) + e.tag + out.slice(e.end);
}
writeFileSync(htmlPath, out, 'utf8');
console.log('royalties.html updated');
