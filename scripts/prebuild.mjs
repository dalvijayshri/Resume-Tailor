// Pre-generate .docx resume variants at build time so they can be served
// as static files from /public/downloads/. This avoids the ~50ms per-request
// cost of packing the document in the API route and lets Vercel's CDN
// cache the files at the edge.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Packer } from 'docx';
import { builders, variants } from '../lib/builders/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'downloads');

async function main() {
  await mkdir(outDir, { recursive: true });

  for (const meta of variants) {
    const builder = builders[meta.id];
    if (!builder || typeof builder.buildDocument !== 'function') {
      throw new Error(`Builder for variant "${meta.id}" is missing buildDocument()`);
    }

    const doc = builder.buildDocument();
    const buffer = await Packer.toBuffer(doc);
    const outPath = resolve(outDir, `${meta.id}.docx`);
    await writeFile(outPath, buffer);

    console.log(`wrote ${outPath} (${buffer.length} bytes)`);
  }
}

main().catch((err) => {
  console.error('prebuild failed:', err);
  process.exit(1);
});
