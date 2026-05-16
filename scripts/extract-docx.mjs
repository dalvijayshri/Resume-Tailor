// Quick one-off: extract raw text from a .docx using the project's
// already-installed mammoth dep. Usage:
//   node scripts/extract-docx.mjs "<absolute path to .docx>"
import { readFile } from 'node:fs/promises';
import mammoth from 'mammoth';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node scripts/extract-docx.mjs <path-to-docx>');
  process.exit(1);
}

const buffer = await readFile(path);
const { value } = await mammoth.extractRawText({ buffer });
process.stdout.write(value);
