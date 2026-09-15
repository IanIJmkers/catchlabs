/* ============================================================
   RENDER — the three agenda assets, straight from the editor

   The editor page in `site/` is the only implementation of the
   design, so this does not draw anything. It serves the site over
   http (Chromium refuses @font-face over file://, and the layout
   MEASURES its type, so a fallback face would pick the wrong
   number of columns), opens each page with the format in the URL
   hash, and screenshots the artboard at 1:1.

   Without a hash the store falls back to its DEFAULTS, which is the
   agenda as supplied — so a plain `npm run render` is the client's
   card. Pass a saved JSON (Opslaan in the editor) as argv[2] to
   render what the client has edited instead.
   ============================================================ */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const OUT = path.join(ROOT, 'out');

const saved = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : {};

const JOBS = [
  { name: 'catchlabs-agenda-story',   page: 'agenda.html',   format: 'story', w: 1080, h: 1920 },
  { name: 'catchlabs-agenda-post',    page: 'agenda.html',   format: 'post',  w: 1080, h: 1350 },
  { name: 'catchlabs-2-maanden-story', page: 'snapshot.html', format: 'story', w: 1080, h: 1920 },
];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml',
};
function serve(root) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0].split('#')[0]).replace(/^\/+/, '');
    const file = path.join(root, rel);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}
const hash = (state) => Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');

fs.mkdirSync(OUT, { recursive: true });
const server = await serve(SITE);
const origin = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();

for (const j of JOBS) {
  const state = { ...saved, meta: { ...(saved.meta || {}), format: j.format } };
  const p = await browser.newPage({ viewport: { width: j.w, height: j.h } });
  await p.goto(`${origin}${j.page}#d=${hash(state)}`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const size = await p.evaluate(() => {
    document.body.classList.add('preview');
    const page = document.querySelector('.page');
    page.style.cssText += ';position:fixed;left:0;top:0;z-index:99999;transform:none;box-shadow:none;margin:0';
    return { w: page.offsetWidth, h: page.offsetHeight };
  });
  if (size.w !== j.w || size.h !== j.h) throw new Error(`${j.name}: artboard is ${size.w}×${size.h}`);
  await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(OUT, `${j.name}.png`) });
  await p.close();
  console.log(`  ✓ ${j.name}  ${j.w}×${j.h}`);
}
await browser.close();
server.close();
