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
 * Build a unique filename for the tailored resume.
 *
 * Format: "<First-Last>_<Company>_<Role>.docx"
 *   e.g. "Jayshri-Dalvi_LEvate_Senior-NET-Software-Developer.docx"
 *
 * Three sections separated by underscores; within each section, words are
 * joined with hyphens. This makes the filename visually parseable in Explorer
 * / Finder (you can tell at a glance which part is the company vs the role)
 * while staying safe across Windows/macOS/Linux.
 */
function buildFilename(payload) {
  const personPart = filenamePart(payload.name || '', 'Resume');
  const companyPart = filenamePart(payload.targetCompany || '', 'Company');
  let rolePart = filenamePart(payload.targetRole || payload.title || '', 'Role');

  // Cap length so the filename stays reasonable.
  if (rolePart.length > 60) rolePart = rolePart.slice(0, 60).replace(/-+$/, '');

  return `${personPart}_${companyPart}_${rolePart}.docx`;
}

/**
 * Convert a natural-language string into a filename-safe section:
 *   - preserve word casing
 *   - spaces -> hyphens
 *   - strip everything except letters, digits, hyphens, periods (for ".NET")
 *   - collapse consecutive hyphens
 *   - fall back to `fallback` if the result is empty
 *
 * Examples:
 *   "Senior .NET Software Developer" -> "Senior-.NET-Software-Developer"
 *   "L'EVATE"                        -> "LEVATE"
 *   "Jayshri C Dalvi"                -> "Jayshri-C-Dalvi"  (handled below)
 */
function filenamePart(input, fallback) {
  if (typeof input !== 'string') return fallback;
  let s = input.normalize('NFKD');

  // Preserve "." inside acronyms like ".NET" by replacing only spaces/underscores
  s = s.replace(/[\s_]+/g, '-');

  // Strip anything that isn't a letter, digit, hyphen, or dot.
  s = s.replace(/[^A-Za-z0-9.\-]/g, '');

  // Collapse and trim hyphens / leading dots.
  s = s.replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');

  // For the name section specifically, drop single-letter middle initials
  // (e.g. "Jayshri-C-Dalvi" -> "Jayshri-Dalvi").
  const tokens = s.split('-');
  if (tokens.length >= 3 && tokens.some((t) => t.replace(/\./g, '').length === 1)) {
    const compact = tokens.filter((t) => t.replace(/\./g, '').length > 1);
    if (compact.length >= 2) s = compact.join('-');
  }

  return s || fallback;
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
