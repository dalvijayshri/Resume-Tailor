// app/api/parse-resume/route.js
// POST /api/parse-resume
// Body: multipart/form-data with a single file field named "file".
//       Accepts .docx and .pdf resumes.
// Returns: { text: string, filename: string, bytes: number, type: "docx" | "pdf" }
// On error:  { error: string } with a 4xx status.

import mammoth from 'mammoth';
import { extractText, getDocumentProxy } from 'unpdf';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Vercel hobby tier has a ~4.5 MB request body limit; cap at 4 MB to leave
// headroom for the multipart boundary overhead.
const MAX_BYTES = 4 * 1024 * 1024;

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PDF_MIME = 'application/pdf';

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function detectType(filename, contentType) {
  const name = (filename || '').toLowerCase();
  const ct = (contentType || '').toLowerCase();
  if (name.endsWith('.docx') || ct === DOCX_MIME) return 'docx';
  if (name.endsWith('.pdf') || ct === PDF_MIME) return 'pdf';
  return null;
}

// Collapse runs of 3+ newlines to 2, trim, normalize Windows newlines.
function tidyText(raw) {
  if (!raw) return '';
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function parseDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value || '';
}

async function parsePdf(buffer) {
  const uint8 = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(uint8);
  const { text } = await extractText(pdf, { mergePages: true });
  if (Array.isArray(text)) return text.join('\n\n');
  return text || '';
}

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return jsonError('Request must be multipart/form-data.', 400);
  }

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return jsonError('Missing "file" field in form data.', 400);
  }

  const filename = file.name || 'upload';
  const contentType = file.type || '';
  const type = detectType(filename, contentType);

  if (!type) {
    return jsonError(
      'Unsupported file type. Please upload a .docx or .pdf resume.',
      415
    );
  }

  // Read the body. The Web File interface gives us a size hint; reject early
  // if it's clearly too big to avoid pulling the whole buffer into memory.
  if (typeof file.size === 'number' && file.size > MAX_BYTES) {
    return jsonError('File too large (max 4 MB)', 413);
  }

  let buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return jsonError('File too large (max 4 MB)', 413);
    }
    buffer = Buffer.from(arrayBuffer);
  } catch (err) {
    return jsonError(`Failed to read uploaded file: ${err?.message || 'unknown error'}`, 400);
  }

  let extracted = '';
  try {
    if (type === 'docx') {
      extracted = await parseDocx(buffer);
    } else {
      extracted = await parsePdf(buffer);
    }
  } catch (err) {
    const reason = err?.message || 'parsing failed';
    return jsonError(`Could not parse ${type.toUpperCase()}: ${reason}`, 422);
  }

  const text = tidyText(extracted);
  if (!text) {
    return jsonError(
      `The ${type.toUpperCase()} parsed empty — it may be image-only or password-protected.`,
      422
    );
  }

  return new Response(
    JSON.stringify({
      text,
      filename,
      bytes: buffer.length,
      type,
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }
  );
}
