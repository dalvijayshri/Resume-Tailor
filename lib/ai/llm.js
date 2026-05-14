// lib/ai/llm.js
// Provider wrapper for the JD-tailoring pipeline. Calls Groq's
// OpenAI-compatible Chat Completions endpoint with JSON-mode forced on.
//
// Why Groq:
// - Truly free (no credit card)
// - 30 req/min on the free tier — way more than this app needs
// - Llama 3.3 70B Versatile supports JSON-mode responses, which the
//   TailoringResult schema in lib/prompts/tailor-system.js depends on
// - Fast (typically sub-2-second completions)
//
// The exported function signature matches the original Gemini wrapper so
// callers (app/api/tailor/route.js) need no other changes.

import { TAILOR_SYSTEM_PROMPT } from '@/lib/prompts/tailor-system';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
// Llama 3.3 70B Versatile — 128K context, JSON-mode, best free-tier quality.
const MODEL_NAME = 'llama-3.3-70b-versatile';

/**
 * Build the user-facing message that pairs the resume/agency profile, JD,
 * platform, and mode. Kept as plain text so the model can read it as one
 * continuous prompt alongside the structured system instruction.
 */
function buildUserContent({ resume, agencyProfile, jobDescription, platform, mode }) {
  const isAgency = mode === 'agency';
  const sourceHeader = isAgency
    ? '===== AGENCY PROFILE (verbatim from user) ====='
    : '===== RESUME (verbatim from candidate) =====';
  const sourceBody = isAgency ? (agencyProfile || '') : (resume || '');

  return [
    `MODE: ${isAgency ? 'agency' : 'individual'}`,
    `PLATFORM: ${platform}`,
    '',
    sourceHeader,
    sourceBody,
    '',
    '===== JOB DESCRIPTION (verbatim from posting) =====',
    jobDescription,
    '',
    '===== INSTRUCTION =====',
    isAgency
      ? 'Produce the TailoringResult JSON object per the schema, INCLUDING the agencyProposal block. Use first-person plural ("we", "our team") throughout. Return only JSON.'
      : 'Produce the TailoringResult JSON object per the schema. OMIT the agencyProposal key. Return only JSON.',
  ].join('\n');
}

/**
 * Generate a tailored resume + match analysis + proposal + interview prep.
 *
 * @param {object} params
 * @param {string} [params.resume]        Candidate resume as free-form text (individual mode).
 * @param {string} [params.agencyProfile] Agency capability profile (agency mode).
 * @param {string} params.jobDescription  Target JD as free-form text.
 * @param {string} params.platform        One of linkedin|upwork|freelancer|hubstaff|other.
 * @param {string} [params.mode]          "individual" (default) or "agency".
 * @returns {Promise<object>} Parsed TailoringResult JSON object.
 */
export async function generateTailoring({ resume, agencyProfile, jobDescription, platform, mode = 'individual' }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to your environment (see .env.example).'
    );
  }

  const userContent = buildUserContent({ resume, agencyProfile, jobDescription, platform, mode });

  const requestBody = {
    model: MODEL_NAME,
    messages: [
      { role: 'system', content: TAILOR_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    // Low temperature → deterministic, consistent prose. 0.25 mirrors what
    // was tuned in for Gemini after observing typos at 0.4.
    temperature: 0.25,
    // JSON-mode: Groq guarantees the response will parse as valid JSON.
    response_format: { type: 'json_object' },
    // Generous output budget — the TailoringResult JSON for a 2-page
    // resume + proposal parts + interview prep is usually 2-4K tokens.
    max_tokens: 8000,
  };

  let res;
  try {
    res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    throw new Error(`Groq request failed at the network layer: ${err?.message ?? String(err)}`);
  }

  // Map Groq's HTTP errors to the same shapes the route handler already
  // understands (quota / unauthorized / generic), so /api/tailor's status
  // mapping keeps working unchanged.
  if (!res.ok) {
    let errBody = {};
    try {
      errBody = await res.json();
    } catch {
      // Body wasn't JSON — keep going with status code alone.
    }
    const msg = errBody?.error?.message || `HTTP ${res.status}`;

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Groq rejected the API key (unauthorized). Verify GROQ_API_KEY is valid and active. (${msg})`
      );
    }
    if (res.status === 429) {
      throw new Error(
        `Groq quota exceeded or rate-limited. Free tier allows ~30 requests / minute — wait a moment and retry. (${msg})`
      );
    }
    if (res.status === 503 || res.status === 502) {
      throw new Error(
        `Groq model temporarily overloaded. Retry in a few seconds. (${msg})`
      );
    }
    throw new Error(`Groq request failed: ${msg}`);
  }

  let payload;
  try {
    payload = await res.json();
  } catch (err) {
    throw new Error(`Groq returned a non-JSON response envelope: ${err?.message ?? String(err)}`);
  }

  const text = payload?.choices?.[0]?.message?.content;
  if (!text || typeof text !== 'string') {
    throw new Error('Groq returned an empty completion.');
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    // JSON-mode should make this impossible, but stay defensive — strip
    // code fences if the model ever wraps the output.
    const stripped = text
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    try {
      return JSON.parse(stripped);
    } catch {
      throw new Error(
        `Failed to parse Groq response as JSON: ${err.message}. First 200 chars: ${text.slice(0, 200)}`
      );
    }
  }
}

export default generateTailoring;
