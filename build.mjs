// Builds every page from src/layout.html + src/pages/*.html.
// Usage: node build.mjs
// Each page starts with a JSON comment: <!-- {"title":"...","description":"...","nav":"about","preload":"/path.jpg"} -->
// home.html -> /index.html, <slug>.html -> /<slug>/index.html (matches the live site's URLs)
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const layout = await readFile(join(root, 'src/layout.html'), 'utf8');

const navItems = [
  ['home', '/', 'Home'],
  ['about', '/about-us/', 'About Us'],
  ['services', '/services-minimalist/', 'Services'],
  ['careers', '/careers/', 'Careers'],
  ['wellness', '/wellness-resources/', 'Wellness Resources'],
  ['contact', '/contact-us/', 'Contact Us'],
];

const desktopNav = (active) => navItems.map(([key, href, label]) =>
  `          <li><a class="nav-link" href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n');
const mobileNav = (active) => navItems.map(([key, href, label]) =>
  `          <li><a class="flex min-h-[48px] items-center rounded-2xl px-4 font-bold hover:bg-surface-2 active:opacity-70${key === active ? ' bg-sun-soft' : ''}" href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n');
const indent = (s, n) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

for (const file of (await readdir(join(root, 'src/pages'))).filter((f) => f.endsWith('.html'))) {
  const raw = await readFile(join(root, 'src/pages', file), 'utf8');
  const match = raw.match(/^<!--\s*(\{.*?\})\s*-->\n/s);
  if (!match) throw new Error(`${file}: missing front-matter comment`);
  const meta = JSON.parse(match[1]);
  const body = raw.slice(match[0].length).trimEnd();

  const html = layout
    .replace('{{title}}', meta.title)
    .replace('{{description}}', meta.description)
    .replace('{{preload}}', meta.preload ? `  <link rel="preload" as="image" href="${meta.preload}">` : '')
    .replace('{{nav_desktop}}', desktopNav(meta.nav))
    .replace('{{nav_mobile}}', mobileNav(meta.nav))
    .replace('{{content}}', indent(body, 4));

  const slug = file.replace(/\.html$/, '');
  const outDir = slug === 'home' ? root : join(root, slug);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'index.html'), html);
  console.log(`built ${slug === 'home' ? '/' : `/${slug}/`}`);
}
