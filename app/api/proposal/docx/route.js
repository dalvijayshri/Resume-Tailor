// app/api/proposal/docx/route.js
// POST /api/proposal/docx
//
// Body: an `agencyProposal` payload — see the agencyProposal block in
// lib/prompts/tailor-system.js for the schema (or lib/builders/agency-proposal.js
// for the renderer side). Returns the rendered .docx as an attachment.

import { Packer } from 'docx';
import { buildDocument } from '@/lib/builders/agency-proposal';

export const runtime = 'nodejs';

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Request body must be valid JSON.', 400);
  }

  const validationError = validateAgencyProposal(payload);
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
 * Build a filename for the agency proposal:
 *   "{Agency}_Proposal_for_{Client}.docx"
 * Words within each section are joined with hyphens; sections are separated
 * by underscores. Matches the visual style used by /api/tailor/docx.
 */
function buildFilename(payload) {
  const agencyPart = filenamePart(payload.agencyName || '', 'Agency');
  const clientPart = filenamePart(payload.clientName || '', 'Client');
  return `${agencyPart}_Proposal_for_${clientPart}.docx`;
}

/**
 * Convert a natural-language string into a filename-safe section. Mirrors the
 * sanitizer used in /api/tailor/docx so filenames look consistent across the
 * two download endpoints.
 */
function filenamePart(input, fallback) {
  if (typeof input !== 'string') return fallback;
  let s = input.normalize('NFKD');
  s = s.replace(/[\s_]+/g, '-');
  s = s.replace(/[^A-Za-z0-9.\-]/g, '');
  s = s.replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
  return s || fallback;
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function validateAgencyProposal(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'Request body must be an agencyProposal object.';
  }

  const requiredStrings = ['agencyName', 'clientName', 'projectTitle', 'executiveSummary'];
  for (const key of requiredStrings) {
    if (typeof data[key] !== 'string' || data[key].trim() === '') {
      return `Field "${key}" is required and must be a non-empty string.`;
    }
  }

  const requiredArrays = ['approach', 'scopeOfWork', 'deliverables', 'timeline', 'whyUs'];
  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) {
      return `Field "${key}" is required and must be an array.`;
    }
  }

  for (const [i, group] of data.scopeOfWork.entries()) {
    if (!group || typeof group !== 'object') {
      return `scopeOfWork[${i}] must be an object.`;
    }
    if (typeof group.title !== 'string') {
      return `scopeOfWork[${i}].title must be a string.`;
    }
    if (!Array.isArray(group.items)) {
      return `scopeOfWork[${i}].items must be an array.`;
    }
  }

  for (const [i, phase] of data.timeline.entries()) {
    if (!phase || typeof phase !== 'object') {
      return `timeline[${i}] must be an object.`;
    }
    for (const key of ['phase', 'duration', 'description']) {
      if (typeof phase[key] !== 'string') {
        return `timeline[${i}].${key} must be a string.`;
      }
    }
  }

  if (!data.investment || typeof data.investment !== 'object' || Array.isArray(data.investment)) {
    return 'Field "investment" is required and must be an object.';
  }
  for (const key of ['model', 'range']) {
    if (typeof data.investment[key] !== 'string' || data.investment[key].trim() === '') {
      return `Field "investment.${key}" is required and must be a non-empty string.`;
    }
  }
  if (data.investment.notes !== undefined && typeof data.investment.notes !== 'string') {
    return 'Field "investment.notes" must be a string when provided.';
  }

  if (typeof data.contact !== 'string') {
    return 'Field "contact" must be a string.';
  }

  return null;
}
