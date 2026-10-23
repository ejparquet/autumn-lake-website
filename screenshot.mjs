// Usage: node screenshot.mjs <url> [label] [--width=1440] [--dark]
// Saves full-page PNGs to ./temporary screenshots/screenshot-N[-label].png
import { mkdir, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const PUPPETEER_DIR = process.env.PUPPETEER_DIR;
const puppeteer = require(PUPPETEER_DIR ? join(PUPPETEER_DIR, 'node_modules/puppeteer-core') : 'puppeteer-core');

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--')) || 'http://localhost:3000';
const label = args.filter(a => !a.startsWith('--'))[1];
const width = Number((args.find(a => a.startsWith('--width=')) || '--width=1440').split('=')[1]);
const dark = args.includes('--dark');

// Newest Chrome in the Puppeteer cache
const cache = join(homedir(), '.cache/puppeteer/chrome');
const build = readdirSync(cache).sort().pop();
const executablePath = join(cache, build, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
if (!existsSync(executablePath)) throw new Error(`Chrome not found at ${executablePath}`);

const outDir = join(fileURLToPath(new URL('.', import.meta.url)), 'temporary screenshots');
await mkdir(outDir, { recursive: true });
const n = (await readdir(outDir)).filter(f => f.startsWith('screenshot-')).length + 1;
const out = join(outDir, `screenshot-${n}${label ? `-${label}` : ''}.png`);

const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]);
await page.goto(url, { waitUntil: 'networkidle0' });
// Scroll through so lazy images load
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); }
  window.scrollTo(0, 0);
});
await page.waitForNetworkIdle({ idleTime: 400 }).catch(() => {});
// Reveal scroll-triggered content before capturing
await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in')));
await new Promise(r => setTimeout(r, 900));
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(out);
