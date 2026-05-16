// lib/builders/individual-proposal.js
// Renders a stand-alone business letter .docx for individual job
// applications. Used as the attachment alongside the tailored resume —
// senior cover letter for a 10+ year full stack developer.
//
// Layout (executive cover-letter style):
//
//   ┌──────────────────────────────────────────────────────────────────┐
//   │ NAME                                          email              │
//   │ Title (Senior Full Stack Developer · 10+ Years)  phone           │
//   │                                               location           │
//   │ ────────────────────────────────────────── (thin accent rule) ── │
//   │                                                                  │
//   │                                              Date (right-aligned)│
//   │                                                                  │
//   │ Hiring Team                                                      │
//   │ Client Company                                                   │
//   │                                                                  │
//   │ Re: Subject line (bold)                                          │
//   │                                                                  │
//   │ Dear Hiring Team,                                                │
//   │                                                                  │
//   │ Body paragraph 1 — hook, 10+ years, JD match.                    │
//   │                                                                  │
//   │ Body paragraph 2 — proof point from resume.                      │
//   │                                                                  │
//   │ Body paragraph 3 — relevant accomplishment.                      │
//   │                                                                  │
//   │ Body paragraph 4 — curiosity + attached-resume reference.        │
//   │                                                                  │
//   │ Body paragraph 5 — call to action.                               │
//   │                                                                  │
//   │ Closing sentence.                                                │
//   │                                                                  │
//   │ Sincerely,                                                       │
//   │ Jayshri Dalvi                                                    │
//   └──────────────────────────────────────────────────────────────────┘

import {
  Document, Paragraph, TextRun, AlignmentType,
  BorderStyle, WidthType,
  Table, TableRow, TableCell,
} from 'docx';

const FONT = 'Calibri';
const ACCENT = '1F4E79';
const MUTED = '475569';

const BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

const tr = (text, extra = {}) => new TextRun({
  text,
  font: FONT,
  size: extra.size ?? 22,
  bold: extra.bold,
  italics: extra.italics,
  color: extra.color,
  break: extra.break,
});

function para(children, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120, line: opts.line ?? 300 },
    alignment: opts.alignment,
    children,
  });
}

function safeString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

// Executive header: name + title left, contact stacked right.
function buildHeader({ name, title, contact }) {
  const leftCells = [];
  if (name) {
    leftCells.push(new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({
        text: String(name).toUpperCase(),
        bold: true, size: 36, font: FONT, color: ACCENT,
      })],
    }));
  }
  if (title) {
    leftCells.push(new Paragraph({
      spacing: { after: 0 },
      children: [tr(title, { bold: true, size: 22, color: MUTED })],
    }));
  }

  const contactLines = String(contact || '')
    .split(/\s*[·|\n]\s*|\s+\|\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const rightCells = (contactLines.length > 0 ? contactLines : [String(contact || '')])
    .filter(Boolean)
    .map((line, i, arr) => new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: i === arr.length - 1 ? 0 : 30 },
      children: [tr(line, { size: 18, color: MUTED })],
    }));

  const borders = { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 60, type: WidthType.PERCENTAGE },
          margins: { top: 0, bottom: 0, left: 0, right: 80 },
          borders,
          verticalAlign: 'top',
          children: leftCells.length ? leftCells : [new Paragraph({ children: [] })],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          margins: { top: 0, bottom: 0, left: 80, right: 0 },
          borders,
          verticalAlign: 'top',
          children: rightCells.length ? rightCells : [new Paragraph({ children: [] })],
        }),
      ],
    })],
  });
}

const accentRule = () => new Paragraph({
  spacing: { before: 80, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 4 } },
  children: [],
});

/**
 * Build a cover-letter .docx from a payload.
 *
 * @param {object} payload
 * @param {string} payload.applicantName     Candidate's name (e.g. "Jayshri Dalvi")
 * @param {string} payload.applicantTitle    e.g. "Senior Full Stack Developer · 10+ Years"
 * @param {string} payload.contact           Single string; the builder splits on
 *                                           common separators for the right column.
 * @param {string} [payload.date]            Optional date string (e.g. "May 16, 2026").
 *                                           Defaults to today's date in US format.
 * @param {string} [payload.recipientName]   e.g. "Hiring Team" or "Sarah, Talent Acquisition"
 * @param {string} payload.clientName        Hiring company name
 * @param {string} payload.subject           Subject line (without "Re:" prefix)
 * @param {string} payload.greeting          "Dear Hiring Team,"
 * @param {string[]} payload.body            Paragraphs (3-5)
 * @param {string} payload.closing           Closing sentence
 * @param {string} payload.signature         Two-line sign-off
 * @returns {Document}
 */
export function buildDocument(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('individual-proposal: payload must be an object.');
  }

  const applicantName = safeString(payload.applicantName, 'Jayshri Dalvi');
  const applicantTitle = safeString(payload.applicantTitle, 'Senior Full Stack Developer · 10+ Years');
  const contact = safeString(payload.contact, '');
  const date = safeString(payload.date, defaultDate());
  const recipientName = safeString(payload.recipientName, 'Hiring Team');
  const clientName = safeString(payload.clientName, '');
  const subject = safeString(payload.subject, '');
  const greeting = safeString(payload.greeting, 'Dear Hiring Team,');
  const body = asArray(payload.body).map((p) => safeString(p, '')).filter(Boolean);
  const closing = safeString(payload.closing, '');
  const signature = safeString(payload.signature, 'Sincerely,\nJayshri Dalvi');

  const children = [
    buildHeader({ name: applicantName, title: applicantTitle, contact }),
    accentRule(),
  ];

  // Date — right-aligned, slightly muted
  children.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 200 },
    children: [tr(date, { size: 20, color: MUTED })],
  }));

  // Recipient block (recipient name + client name on two lines)
  const recipientChildren = [];
  if (recipientName) recipientChildren.push(tr(recipientName, { size: 22 }));
  if (clientName) {
    if (recipientChildren.length) recipientChildren.push(tr('', { break: 1 }));
    recipientChildren.push(tr(clientName, { size: 22 }));
  }
  if (recipientChildren.length) {
    children.push(new Paragraph({
      spacing: { after: 200, line: 280 },
      children: recipientChildren,
    }));
  }

  // Subject line — bold, with "Re:" prefix
  if (subject) {
    children.push(new Paragraph({
      spacing: { after: 200 },
      children: [
        tr('Re: ', { bold: true, size: 22 }),
        tr(subject, { bold: true, size: 22 }),
      ],
    }));
  }

  // Greeting
  if (greeting) {
    children.push(para([tr(greeting, { size: 22 })], { after: 200 }));
  }

  // Body — one Paragraph per array entry, justified for letter look
  for (const paragraph of body) {
    children.push(new Paragraph({
      spacing: { after: 200, line: 320 },
      alignment: AlignmentType.JUSTIFIED,
      children: [tr(paragraph, { size: 22 })],
    }));
  }

  // Closing line
  if (closing) {
    children.push(para([tr(closing, { size: 22 })], { after: 200 }));
  }

  // Signature — sign-off line + name, on separate Paragraphs for spacing
  const sigLines = signature.split('\n').map((s) => s.trim()).filter(Boolean);
  if (sigLines.length) {
    children.push(new Paragraph({
      spacing: { before: 80, after: 0 },
      children: [tr(sigLines[0], { size: 22 })],
    }));
    if (sigLines[1]) {
      children.push(new Paragraph({
        spacing: { before: 60, after: 0 },
        children: [tr(sigLines[1], { bold: true, size: 22, color: ACCENT })],
      }));
    }
  }

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 },
        },
      },
      children,
    }],
  });
}

function defaultDate() {
  const d = new Date();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const meta = {
  id: 'individual-proposal',
  name: 'Individual Cover Letter',
  description: 'Stand-alone cover letter .docx for individual job applications, generated per-request from /api/proposal/individual/docx.',
  filename: 'Cover-Letter.docx',
};

export default buildDocument;
