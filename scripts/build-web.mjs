import { mkdir, readFile, copyFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const webDir = new URL('../www/', import.meta.url);
await mkdir(webDir, { recursive: true });

for (const file of ['icon-180.png', 'icon-512.png', 'manifest.webmanifest']) {
  await copyFile(new URL(`../${file}`, import.meta.url), new URL(file, webDir));
}

let html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const appScript = /<script>\s*\(\(\)=>\{/;
if (!appScript.test(html)) {
  throw new Error('Could not find the Road Rater app script in index.html.');
}
html = html.replace(appScript, '<script src="./native-bridge.js"></script>\n<script>\n(()=>{');
await writeFile(new URL('index.html', webDir), html);

await build({
  entryPoints: [fileURLToPath(new URL('../src/native-bridge.js', import.meta.url))],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: ['chrome100'],
  outfile: fileURLToPath(new URL('native-bridge.js', webDir)),
});
