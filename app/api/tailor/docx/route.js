import { Packer } from 'docx';
import { buildDocument } from '@/lib/builders/tailored';

export const runtime = 'nodejs';

/**
 * POST /api/tailor/docx
 *
 * Body: the full TailoredResume JSON object — see lib/builders/tailored.js
 * for the expected shape. Returns the rendered .docx as an attachment.
 */
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Request body must be valid JSON.', 400);
  }

  const validationError = validateTailoredResume(payload);
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

  return new Response(buffer, {
    status: 200,
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'content-disposition': 'attachment; filename="Jayshri-Dalvi-Tailored-Resume.docx"',
      'cache-control': 'no-store',
    },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function validateTailoredResume(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'Request body must be a TailoredResume object.';
  }

  const requiredStrings = ['name', 'title', 'tagline', 'contact', 'summary', 'education'];
  for (const key of requiredStrings) {
    if (typeof data[key] !== 'string' || data[key].trim() === '') {
      return `Field "${key}" is required and must be a non-empty string.`;
    }
  }

  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    return 'Field "skills" is required and must be a non-empty array.';
  }
  for (const [i, group] of data.skills.entries()) {
    if (!group || typeof group !== 'object') {
      return `skills[${i}] must be an object.`;
    }
    if (typeof group.category !== 'string' || group.category.trim() === '') {
      return `skills[${i}].category must be a non-empty string.`;
    }
    if (typeof group.items !== 'string') {
      return `skills[${i}].items must be a string.`;
    }
  }

  if (!Array.isArray(data.experience) || data.experience.length === 0) {
    return 'Field "experience" is required and must be a non-empty array.';
  }
  for (const [i, job] of data.experience.entries()) {
    if (!job || typeof job !== 'object') {
      return `experience[${i}] must be an object.`;
    }
    for (const key of ['company', 'dates', 'role']) {
      if (typeof job[key] !== 'string' || job[key].trim() === '') {
        return `experience[${i}].${key} must be a non-empty string.`;
      }
    }
    if (!Array.isArray(job.bullets)) {
      return `experience[${i}].bullets must be an array.`;
    }
    for (const [j, b] of job.bullets.entries()) {
      if (typeof b !== 'string') {
        return `experience[${i}].bullets[${j}] must be a string.`;
      }
    }
  }

  if (data.projects !== undefined) {
    if (!Array.isArray(data.projects)) {
      return 'Field "projects" must be an array when provided.';
    }
    for (const [i, p] of data.projects.entries()) {
      if (!p || typeof p !== 'object') {
        return `projects[${i}] must be an object.`;
      }
      for (const key of ['name', 'dates', 'stack']) {
        if (typeof p[key] !== 'string') {
          return `projects[${i}].${key} must be a string.`;
        }
      }
      if (!Array.isArray(p.bullets)) {
        return `projects[${i}].bullets must be an array.`;
      }
    }
  }

  return null;
}
