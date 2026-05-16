// Pre-generate .docx resume variants at build time so they can be served
// as static files from /public/downloads/. This avoids the ~50ms per-request
// cost of packing the document in the API route and lets Vercel's CDN
// cache the files at the edge.
//
// All variants are now produced by builders under lib/builders/ — the
// enterprise master profile is itself a builder, so no static asset
// copy is required.

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
    // Allow variants to override the on-disk filename (e.g. so the URL is
    // /downloads/Jayshri_Dalvi_Resume_Original.docx instead of /downloads/v3-elixax-last.docx).
    const publicName = meta.publicFilename || `${meta.id}.docx`;
    const outPath = resolve(outDir, publicName);
    await writeFile(outPath, buffer);

    console.log(`wrote ${outPath} (${buffer.length} bytes)`);
  }
}

main().catch((err) => {
  console.error('prebuild failed:', err);
  process.exit(1);
});
