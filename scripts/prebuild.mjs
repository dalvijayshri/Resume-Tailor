// Pre-generate .docx resume variants at build time so they can be served
// as static files from /public/downloads/. This avoids the ~50ms per-request
// cost of packing the document in the API route and lets Vercel's CDN
// cache the files at the edge.
//
// Also copies static "source-of-truth" .docx files from /assets/ into
// /public/downloads/ — currently just the enterprise master profile that
// auto-loads into the /tailor textarea on first visit.

import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Packer } from 'docx';
import { builders, variants } from '../lib/builders/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'downloads');
const assetsDir = resolve(__dirname, '..', 'assets');

// Static .docx files committed to /assets/ that should also be copied
// to /public/downloads/ on every build. These are NOT produced by a
// builder — they're the candidate's source-of-truth master profile and
// any other reference document we want to surface at a stable URL.
const STATIC_DOWNLOADS = [
  'Jayshri_Dalvi_Master_Profile.docx',
];

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

  for (const filename of STATIC_DOWNLOADS) {
    const src = resolve(assetsDir, filename);
    const dest = resolve(outDir, filename);
    await copyFile(src, dest);
    console.log(`copied ${src} -> ${dest}`);
  }
}

main().catch((err) => {
  console.error('prebuild failed:', err);
  process.exit(1);
});
