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
 * Derive a unique filename for the tailored resume.
 *
 * Preference order:
 *   1. payload.filenameSlug (the AI is asked to produce this from the JD)
 *   2. derive from name + title as fallback
 *
 * The slug is sanitized to alphanumerics + hyphens only.
 * Output format: "<FirstLast>-<Slug>.docx"
 *   e.g. "Jayshri-Dalvi-levate-senior-net-developer.docx"
 */
function buildFilename(payload) {
  const personSlug = personSlugFromName(payload.name);
  let jobSlug = slugify(payload.filenameSlug || payload.title || '');
  if (!jobSlug) jobSlug = 'tailored';

  // Defensive: if the AI leaked any of the candidate's name tokens into the
  // job slug, strip them so we don't get "jayshri-dalvi-levate-jayshri-dalvi".
  const nameTokens = personSlug.split('-').filter((t) => t.length > 1);
  for (const tok of nameTokens) {
    jobSlug = jobSlug
      .replace(new RegExp(`(^|-)${tok}(-|$)`, 'gi'), '$1$2')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  if (!jobSlug) jobSlug = 'tailored';

  // Cap length so the filename stays reasonable.
  if (jobSlug.length > 60) jobSlug = jobSlug.slice(0, 60).replace(/-+$/, '');

  return `${personSlug}-${jobSlug}.docx`;
}

/**
 * Format the candidate's name as "First-Last" (title case, drop middle initial
 * / middle names). Falls back to "Resume" if the input is unusable.
 */
function personSlugFromName(name) {
  if (typeof name !== 'string') return 'Resume';
  const tokens = name
    .replace(/[^A-Za-z\s.\-]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => t.replace(/\./g, '').length > 1); // drop "C" / "C."
  if (tokens.length === 0) return 'Resume';
  const first = titleCase(tokens[0]);
  const last = titleCase(tokens[tokens.length - 1]);
  return tokens.length === 1 ? first : `${first}-${last}`;
}

function titleCase(s) {
  if (!s) return '';
  return s[0].toUpperCase() + s.slice(1).toLowerCase();
}

function slugify(str) {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')      // strip punctuation / accents
    .trim()
    .replace(/[\s_]+/g, '-')        // spaces/underscores -> hyphen
    .replace(/-+/g, '-')            // collapse runs
    .replace(/^-|-$/g, '');         // trim hyphens
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
