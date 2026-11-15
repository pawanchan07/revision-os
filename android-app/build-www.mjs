/**
 * Assembles the web files that get packaged inside the APK.
 * Nothing is rewritten for Android: it is the same ../os app and the content it reads,
 * plus native.js, minus the service worker and web manifest (the APK ships its own files).
 */
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const here = new URL('.', import.meta.url).pathname, root = join(here, '..'), out = join(here, 'build', 'assets', 'www');
rmSync(join(here, 'build', 'assets'), { recursive: true, force: true });
mkdirSync(join(out, 'os'), { recursive: true });
mkdirSync(join(out, 'guide'), { recursive: true });

for (const f of readdirSync(join(root, 'os'))) {
  if (f === 'sw.js' || f === 'manifest.json') continue;
  cpSync(join(root, 'os', f), join(out, 'os', f));
}
cpSync(join(root, 'guide', 'data'), join(out, 'guide', 'data'), { recursive: true });
cpSync(join(here, 'native.js'), join(out, 'os', 'native.js'));

let html = readFileSync(join(out, 'os', 'index.html'), 'utf8');
const marker = '<script src="app.js"></script>';
if (!html.includes(marker)) throw new Error('os/index.html changed: cannot find the app.js script tag');
html = html.replace(marker, '<script src="native.js"></script>\n' + marker).replace('<link rel="manifest" href="manifest.json">\n', '');
writeFileSync(join(out, 'os', 'index.html'), html);

let bytes = 0, files = 0;
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f), s = statSync(p); if (s.isDirectory()) walk(p); else { bytes += s.size; files++; } } })(out);
console.log(`web assets: ${files} files, ${(bytes / 1048576).toFixed(1)} MB`);
