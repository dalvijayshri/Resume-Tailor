// lib/ai/llm.js
// Provider-agnostic wrapper for the JD-tailoring pipeline. Routes to
// Google Gemini or Groq based on which API key is set.
//
// Selection order (highest priority first):
//   1. LLM_PROVIDER env var ("gemini" or "groq") — explicit override.
//   2. GEMINI_API_KEY set         → Gemini.
//   3. GROQ_API_KEY set           → Groq.
//   4. Neither set                → throw a helpful error.
//
// Both providers expose the same shape via generateTailoring(), so
// app/api/tailor/route.js never needs to know which one is in use.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TAILOR_SYSTEM_PROMPT } from '@/lib/prompts/tailor-system';

const GEMINI_MODEL = 'gemini-flash-latest';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Build the user-facing message that pairs the resume/agency profile, JD,
 * platform, and mode. Same shape for both providers.
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
 * Decide which provider to use. Throws a descriptive error when nothing
 * is configured so the route handler can surface it cleanly.
 */
function pickProvider() {
  const explicit = String(process.env.LLM_PROVIDER || '').trim().toLowerCase();
  if (explicit === 'gemini') {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        'LLM_PROVIDER=gemini but GEMINI_API_KEY is not set. Get a key at https://aistudio.google.com/app/apikey or unset LLM_PROVIDER to auto-detect.'
      );
    }
    return 'gemini';
  }
  if (explicit === 'groq') {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        'LLM_PROVIDER=groq but GROQ_API_KEY is not set. Get a key at https://console.groq.com/keys or unset LLM_PROVIDER to auto-detect.'
      );
    }
    return 'groq';
  }

  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.GROQ_API_KEY) return 'groq';

  throw new Error(
    'No LLM API key configured. Set GEMINI_API_KEY (https://aistudio.google.com/app/apikey) or GROQ_API_KEY (https://console.groq.com/keys). See .env.example.'
  );
}

/**
 * Parse the model's response string into JSON. Tolerates code-fence
 * wrapping if the model ignores JSON-mode hints.
 */
function parseJsonStrict(text, providerLabel) {
  if (!text || typeof text !== 'string') {
    throw new Error(`${providerLabel} returned an empty response.`);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    const stripped = text
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    try {
      return JSON.parse(stripped);
    } catch {
      throw new Error(
        `Failed to parse ${providerLabel} response as JSON: ${err.message}. First 200 chars: ${text.slice(0, 200)}`
      );
    }
  }
}

// ─── Gemini ──────────────────────────────────────────────────────────────────

async function generateWithGemini(params) {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: TAILOR_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      // Low temperature → deterministic, fewer typos. Same as before.
      temperature: 0.25,
    },
  });

  const userContent = buildUserContent(params);

  let result;
  try {
    result = await model.generateContent(userContent);
  } catch (err) {
    const msg = String(err?.message || err);
    if (/quota|rate.?limit|429/i.test(msg)) {
      throw new Error(
        'Gemini quota exceeded or rate-limited. Wait a minute and retry, or check your free-tier limits.'
      );
    }
    if (/api key|unauthorized|permission|403/i.test(msg)) {
      throw new Error(
        'Gemini rejected the API key (unauthorized). Verify GEMINI_API_KEY is valid and has access to gemini-flash-latest.'
      );
    }
    throw new Error(`Gemini request failed: ${msg}`);
  }

  const text = result?.response?.text?.();
  return parseJsonStrict(text, 'Gemini');
}

// ─── Groq ────────────────────────────────────────────────────────────────────

async function generateWithGroq(params) {
  const apiKey = process.env.GROQ_API_KEY;
  const userContent = buildUserContent(params);

  const requestBody = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: TAILOR_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    temperature: 0.25,
    response_format: { type: 'json_object' },
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

  if (!res.ok) {
    let errBody = {};
    try { errBody = await res.json(); } catch { /* not json */ }
    const msg = errBody?.error?.message || `HTTP ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Groq rejected the API key (unauthorized). Verify GROQ_API_KEY. (${msg})`);
    }
    if (res.status === 429) {
      throw new Error(`Groq quota exceeded or rate-limited. (${msg})`);
    }
    if (res.status === 503 || res.status === 502) {
      throw new Error(`Groq model temporarily overloaded. Retry shortly. (${msg})`);
    }
    throw new Error(`Groq request failed: ${msg}`);
  }

  let payload;
  try { payload = await res.json(); } catch (err) {
    throw new Error(`Groq returned a non-JSON envelope: ${err?.message ?? String(err)}`);
  }
  const text = payload?.choices?.[0]?.message?.content;
  return parseJsonStrict(text, 'Groq');
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a tailored resume + match analysis + proposal + interview prep.
 *
 * @param {object} params
 * @param {string} [params.resume]
 * @param {string} [params.agencyProfile]
 * @param {string} params.jobDescription
 * @param {string} params.platform
 * @param {string} [params.mode] "individual" (default) or "agency".
 * @returns {Promise<object>} Parsed TailoringResult JSON object.
 */
export async function generateTailoring({ resume, agencyProfile, jobDescription, platform, mode = 'individual' }) {
  const provider = pickProvider();
  const params = { resume, agencyProfile, jobDescription, platform, mode };
  return provider === 'gemini'
    ? generateWithGemini(params)
    : generateWithGroq(params);
}

export default generateTailoring;
