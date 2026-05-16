// app/api/proposal/individual/docx/route.js
// POST /api/proposal/individual/docx
//
// Body: a payload combining the candidate's header info with the AI's
// coverLetter object. See lib/builders/individual-proposal.js for the
// expected shape. Returns the rendered cover-letter .docx as an attachment.

import { Packer } from 'docx';
import { buildDocument } from '@/lib/builders/individual-proposal';

export const runtime = 'nodejs';

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Request body must be valid JSON.', 400);
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return jsonError(validationError, 400);
  }

  let buffer;
  try {
    const doc = buildDocument(payload);
    buffer = await Packer.toBuffer(doc);
  } catch (err) {
    return jsonError(`Failed to build document: ${err?.message ?? 'unknown error'}`, 500);
  }

  const filename = buildFilename(payload);

  return new Response(buffer, {
    status: 200,
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  });
}

/**
 * Build a filename like:
 *   "Jayshri-Dalvi_CoverLetter_LEvate_Senior-.NET-Developer.docx"
 * Mirrors the style used by /api/tailor/docx and /api/proposal/docx.
 */
function buildFilename(payload) {
  const personPart = filenamePart(payload.applicantName || '', 'Applicant');
  const clientPart = filenamePart(payload.clientName || '', 'Company');
  let rolePart = filenamePart(payload.subject || '', 'CoverLetter');
  if (rolePart.length > 60) rolePart = rolePart.slice(0, 60).replace(/-+$/, '');
  return `${personPart}_CoverLetter_${clientPart}_${rolePart}.docx`;
}

// Sanitizer mirroring app/api/tailor/docx/route.js — preserves "." for
// acronyms like ".NET", drops single-letter middle initials in the name.
function filenamePart(input, fallback) {
  if (typeof input !== 'string') return fallback;
  let s = input.normalize('NFKD');
  s = s.replace(/[\s_]+/g, '-');
  s = s.replace(/[^A-Za-z0-9.\-]/g, '');
  s = s.replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
  const tokens = s.split('-');
  if (tokens.length >= 3 && tokens.some((t) => t.replace(/\./g, '').length === 1)) {
    const compact = tokens.filter((t) => t.replace(/\./g, '').length > 1);
    if (compact.length >= 2) s = compact.join('-');
  }
  return s || fallback;
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function validatePayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'Request body must be a cover-letter payload object.';
  }

  // Header info — name and contact are required so the letter has a
  // proper letterhead.
  const requiredStrings = ['applicantName', 'contact', 'greeting', 'closing', 'signature'];
  for (const key of requiredStrings) {
    if (typeof data[key] !== 'string' || data[key].trim() === '') {
      return `Field "${key}" is required and must be a non-empty string.`;
    }
  }

  if (!Array.isArray(data.body) || data.body.length === 0) {
    return 'Field "body" is required and must be a non-empty array of paragraph strings.';
  }
  for (const [i, paragraph] of data.body.entries()) {
    if (typeof paragraph !== 'string') {
      return `body[${i}] must be a string.`;
    }
  }

  // Optional fields that, if present, must be the right type
  for (const key of ['applicantTitle', 'date', 'recipientName', 'clientName', 'subject']) {
    if (data[key] !== undefined && typeof data[key] !== 'string') {
      return `Field "${key}" must be a string when provided.`;
    }
  }

  return null;
}
