// lib/ai/gemini.js
// Thin wrapper around @google/generative-ai for the JD-tailoring pipeline.
// Exposes generateTailoring({ resume, jobDescription, platform }) which returns
// a parsed JSON object matching the TailoringResult schema enforced by the
// system prompt in lib/prompts/tailor-system.js.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TAILOR_SYSTEM_PROMPT } from '@/lib/prompts/tailor-system';

// As of late 2025, Google set free-tier quota to 0 for `gemini-2.0-flash`,
// so we use the `gemini-flash-latest` alias which still has a working free
// tier and tracks the current best Flash model.
const MODEL_NAME = 'gemini-flash-latest';

/**
 * Build the user-facing message that pairs the resume, JD, and platform.
 * Kept as plain text so the model can read it as one continuous prompt
 * alongside the structured system instruction.
 */
function buildUserContent({ resume, jobDescription, platform }) {
  return [
    `PLATFORM: ${platform}`,
    '',
    '===== RESUME (verbatim from candidate) =====',
    resume,
    '',
    '===== JOB DESCRIPTION (verbatim from posting) =====',
    jobDescription,
    '',
    '===== INSTRUCTION =====',
    'Produce the TailoringResult JSON object per the schema. Return only JSON.',
  ].join('\n');
}

/**
 * Generate a tailored resume + match analysis + proposal + interview prep.
 *
 * @param {object} params
 * @param {string} params.resume          Candidate resume as free-form text.
 * @param {string} params.jobDescription  Target JD as free-form text.
 * @param {string} params.platform        One of linkedin|upwork|freelancer|hubstaff|other.
 * @returns {Promise<object>} Parsed TailoringResult JSON object.
 */
export async function generateTailoring({ resume, jobDescription, platform }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to your environment (see .env.example).'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: TAILOR_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
    },
  });

  const userContent = buildUserContent({ resume, jobDescription, platform });

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
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini returned an empty response.');
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    // Defensive fallback: if the model wraps JSON in fences despite the
    // responseMimeType hint, strip them and try once more before failing.
    const stripped = text
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    try {
      return JSON.parse(stripped);
    } catch {
      throw new Error(
        `Failed to parse Gemini response as JSON: ${err.message}. First 200 chars: ${text.slice(0, 200)}`
      );
    }
  }
}

export default generateTailoring;
