// Fails the build if an em-dash or en-dash appears in a copy string file.
// Per FR-DS-004. Extend `files` as more content modules are added.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = [path.join(dir, '..', 'src', 'content', 'copy.ts')];

const DASH_PATTERN = /[–—]/;
let failed = false;

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (DASH_PATTERN.test(line)) {
      failed = true;
      console.error(`${file}:${i + 1}: em-dash or en-dash found: ${line.trim()}`);
    }
  });
}

if (failed) {
  console.error('\nCopy lint failed: remove em-dashes and en-dashes (FR-DS-004).');
  process.exit(1);
}

console.log('Copy lint passed.');
