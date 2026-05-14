// app/api/tailor/route.js
// POST /api/tailor
// Body:
//   {
//     mode?: "individual" | "agency",   // default "individual"
//     resume?: string,                  // required in individual mode
//     agencyProfile?: string,           // required in agency mode
//     jobDescription: string,
//     platform: string,
//   }
// Returns: TailoringResult JSON (see lib/prompts/tailor-system.js for schema).

import { generateTailoring } from '@/lib/ai/llm';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_LEN = 50000;
const ALLOWED_PLATFORMS = new Set([
  'linkedin',
  'upwork',
  'freelancer',
  'hubstaff',
  'other',
]);
const ALLOWED_MODES = new Set(['individual', 'agency']);

function badRequest(message) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'content-type': 'application/json' },
  });
}

function serverError(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Request body must be valid JSON.');
  }

  if (!body || typeof body !== 'object') {
    return badRequest('Request body must be a JSON object.');
  }

  const { resume, agencyProfile, jobDescription, platform } = body;
  const rawMode = typeof body.mode === 'string' ? body.mode.trim().toLowerCase() : 'individual';
  const mode = rawMode || 'individual';

  if (!ALLOWED_MODES.has(mode)) {
    return badRequest(`Field "mode" must be one of: ${[...ALLOWED_MODES].join(', ')}.`);
  }

  if (mode === 'agency') {
    if (typeof agencyProfile !== 'string' || agencyProfile.trim().length === 0) {
      return badRequest('Field "agencyProfile" is required in agency mode and must be a non-empty string.');
    }
    if (agencyProfile.length > MAX_LEN) {
      return badRequest(`Field "agencyProfile" exceeds max length of ${MAX_LEN} characters.`);
    }
  } else {
    if (typeof resume !== 'string' || resume.trim().length === 0) {
      return badRequest('Field "resume" is required and must be a non-empty string.');
    }
    if (resume.length > MAX_LEN) {
      return badRequest(`Field "resume" exceeds max length of ${MAX_LEN} characters.`);
    }
  }

  if (typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
    return badRequest('Field "jobDescription" is required and must be a non-empty string.');
  }
  if (typeof platform !== 'string' || platform.trim().length === 0) {
    return badRequest('Field "platform" is required and must be a non-empty string.');
  }

  if (jobDescription.length > MAX_LEN) {
    return badRequest(`Field "jobDescription" exceeds max length of ${MAX_LEN} characters.`);
  }
  if (platform.length > 64) {
    return badRequest('Field "platform" is unreasonably long.');
  }

  const normalizedPlatform = platform.trim().toLowerCase();
  if (!ALLOWED_PLATFORMS.has(normalizedPlatform)) {
    return badRequest(
      `Field "platform" must be one of: ${[...ALLOWED_PLATFORMS].join(', ')}.`
    );
  }

  try {
    const result = await generateTailoring({
      mode,
      resume: mode === 'individual' ? resume : undefined,
      agencyProfile: mode === 'agency' ? agencyProfile : undefined,
      jobDescription,
      platform: normalizedPlatform,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    const message = err?.message || 'Unknown error';

    // Map known error shapes from the LLM wrapper to appropriate HTTP codes.
    if (/GROQ_API_KEY is not set|GEMINI_API_KEY is not set/i.test(message)) {
      return serverError(message, 500);
    }
    if (/quota|rate.?limit|429/i.test(message)) {
      return serverError(message, 429);
    }
    if (/unauthorized|api key|rejected/i.test(message)) {
      return serverError(message, 502);
    }
    if (/overloaded|503|502/i.test(message)) {
      return serverError(message, 503);
    }
    if (/parse|JSON/i.test(message)) {
      return serverError(`Model returned malformed output: ${message}`, 502);
    }
    return serverError(`Tailoring failed: ${message}`, 500);
  }
}
