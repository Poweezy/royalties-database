// One-shot D2 post-processing: convert the extracted notification template
// to DOM building (textContent sink + addEventListener, no inline handler).
import { readFileSync, writeFileSync } from 'fs';

const path = 'js/bootstrap/communication-hub.js';
let src = readFileSync(path, 'utf8');

const startMarker = 'notification.innerHTML = `';
const startIdx = src.indexOf(startMarker);
const endMarker = '`;';
const endIdx = src.indexOf(endMarker, startIdx);
if (startIdx === -1 || endIdx === -1) {
  console.error('markers not found');
  process.exit(1);
}
const block = src.slice(startIdx, endIdx + endMarker.length);

// Extract the static icon expression (first ${...} span) and the close glyph
const iconMatch = block.match(/<span>\$\{(.+?)\}<\/span>/);
const glyphMatch = block.match(/margin-left:\s*auto;">([\s\S]*?)<\/button>/);
if (!iconMatch || !glyphMatch) {
  console.error('icon/glyph extraction failed', Boolean(iconMatch), Boolean(glyphMatch));
  process.exit(1);
}
const iconExpr = iconMatch[1];
const closeGlyph = glyphMatch[1];

const replacement = `// H1/CSP: build the notification via DOM APIs — textContent sink for the
        // message (no innerHTML interpolation) and addEventListener instead of
        // an inline event handler (required for hash-based CSP).
        const iconSpan = document.createElement("span");
        iconSpan.innerHTML = ${iconExpr};
        const messageSpan = document.createElement("span");
        messageSpan.textContent = message;
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Close notification");
        closeButton.style.cssText =
          "background: none; border: none; cursor: pointer; margin-left: auto;";
        closeButton.textContent = ${JSON.stringify(closeGlyph)};
        closeButton.addEventListener("click", () => notification.remove());
        notification.append(iconSpan, messageSpan, closeButton);`;

src = src.slice(0, startIdx) + replacement + src.slice(endIdx + endMarker.length);
writeFileSync(path, src, 'utf8');
console.log('communication-hub.js: notification converted to DOM building');
console.log('icon expr preserved:', iconExpr.slice(0, 60));
console.log('onclick remaining:', (src.match(/onclick=/g) || []).length);
