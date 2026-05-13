// lib/builders/agency-proposal.js
// Renders an agency-proposal payload (see lib/prompts/tailor-system.js for
// the schema) into a Word .docx via the `docx` library.
//
// Intentionally NOT registered in lib/builders/index.js — agency proposals
// are per-request, generated from user input on /api/proposal/docx, and are
// not part of the prebuilt resume variant catalog served from /downloads/.

import {
  Document, Paragraph, TextRun, AlignmentType,
  LevelFormat, BorderStyle, TabStopType,
} from 'docx';

const FONT = 'Calibri';
const ACCENT = '1F4E79';
const MUTED = '475569';

const tr = (text, extra = {}) => new TextRun({
  text,
  font: FONT,
  size: extra.size ?? 20,
  bold: extra.bold,
  italics: extra.italics,
  color: extra.color,
});

const sectionHeader = (text) => new Paragraph({
  spacing: { before: 200, after: 60 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 2 } },
  children: [new TextRun({ text, bold: true, size: 22, font: FONT, color: ACCENT })],
});

const center = (textRuns, opts = {}) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: opts.after ?? 20 },
  children: textRuns,
});

const bullet = (children, opts = {}) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: opts.after ?? 30 },
  children,
});

const para = (children, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 60 },
  children,
});

const phaseLine = (phase, duration) => new Paragraph({
  spacing: { before: 80, after: 20 },
  tabStops: [{ type: TabStopType.RIGHT, position: 10080 }],
  children: [
    tr(phase || '', { bold: true, size: 22 }),
    new TextRun({ text: '\t', font: FONT, size: 20 }),
    tr(duration || '', { bold: true, italics: true, size: 18, color: MUTED }),
  ],
});

const subLine = (text) => new Paragraph({
  spacing: { after: 40 },
  children: [tr(text, { italics: true, color: MUTED })],
});

function safeString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function buildDocument(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('agency-proposal builder: payload must be an object.');
  }

  const agencyName = safeString(payload.agencyName, 'Our Agency');
  const clientName = safeString(payload.clientName, 'Client');
  const projectTitle = safeString(payload.projectTitle, 'Proposal');
  const executiveSummary = safeString(payload.executiveSummary, '');
  const approach = asArray(payload.approach);
  const scopeOfWork = asArray(payload.scopeOfWork);
  const deliverables = asArray(payload.deliverables);
  const timeline = asArray(payload.timeline);
  const investment = payload.investment && typeof payload.investment === 'object' ? payload.investment : {};
  const whyUs = asArray(payload.whyUs);
  const contact = safeString(payload.contact, '');

  const children = [
    // ---------- Title block ----------
    center([new TextRun({ text: agencyName.toUpperCase(), bold: true, size: 36, font: FONT, color: ACCENT })], { after: 40 }),
    center([tr(`Proposal for ${clientName}`, { bold: true, size: 24 })], { after: 20 }),
    center([tr(projectTitle, { italics: true, size: 20, color: MUTED })], { after: 80 }),
  ];

  // ---------- Executive Summary ----------
  if (executiveSummary) {
    children.push(sectionHeader('EXECUTIVE SUMMARY'));
    children.push(para([tr(executiveSummary)]));
  }

  // ---------- Approach ----------
  if (approach.length) {
    children.push(sectionHeader('OUR APPROACH'));
    for (const item of approach) {
      if (typeof item === 'string' && item.trim()) {
        children.push(bullet([tr(item)]));
      }
    }
  }

  // ---------- Scope of Work ----------
  if (scopeOfWork.length) {
    children.push(sectionHeader('SCOPE OF WORK'));
    for (const group of scopeOfWork) {
      if (!group || typeof group !== 'object') continue;
      const title = safeString(group.title, '');
      if (title) {
        children.push(para([tr(title, { bold: true, size: 22, color: ACCENT })], { after: 20 }));
      }
      for (const item of asArray(group.items)) {
        if (typeof item === 'string' && item.trim()) {
          children.push(bullet([tr(item)]));
        }
      }
    }
  }

  // ---------- Deliverables ----------
  if (deliverables.length) {
    children.push(sectionHeader('DELIVERABLES'));
    for (const item of deliverables) {
      if (typeof item === 'string' && item.trim()) {
        children.push(bullet([tr(item)]));
      }
    }
  }

  // ---------- Timeline ----------
  if (timeline.length) {
    children.push(sectionHeader('TIMELINE'));
    for (const phase of timeline) {
      if (!phase || typeof phase !== 'object') continue;
      const phaseName = safeString(phase.phase, '');
      const duration = safeString(phase.duration, '');
      const description = safeString(phase.description, '');
      if (phaseName || duration) {
        children.push(phaseLine(phaseName, duration));
      }
      if (description) {
        children.push(subLine(description));
      }
    }
  }

  // ---------- Investment ----------
  if (investment.model || investment.range || investment.notes) {
    children.push(sectionHeader('INVESTMENT'));
    const investmentRuns = [];
    if (investment.model) {
      investmentRuns.push(tr('Model: ', { bold: true }), tr(safeString(investment.model, '')));
    }
    if (investmentRuns.length) children.push(para(investmentRuns, { after: 20 }));

    if (investment.range) {
      children.push(para([
        tr('Range: ', { bold: true }),
        tr(safeString(investment.range, '')),
      ], { after: 20 }));
    }
    if (investment.notes) {
      children.push(para([tr(safeString(investment.notes, ''), { italics: true, color: MUTED, size: 18 })]));
    }
  }

  // ---------- Why Us ----------
  if (whyUs.length) {
    children.push(sectionHeader('WHY US'));
    for (const item of whyUs) {
      if (typeof item === 'string' && item.trim()) {
        children.push(bullet([tr(item)]));
      }
    }
  }

  // ---------- Contact ----------
  if (contact) {
    children.push(sectionHeader('CONTACT'));
    children.push(para([tr(contact)]));
  }

  const sections = [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 720, right: 1080, bottom: 720, left: 1080 },
      },
    },
    children,
  }];

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 320, hanging: 220 } } },
        }],
      }],
    },
    sections,
  });
}

export const meta = {
  id: 'agency-proposal',
  name: 'Agency Proposal',
  description: 'Multi-section vendor proposal generated per-request from /api/proposal/docx. Not part of the prebuilt resume catalog.',
  filename: 'Agency-Proposal.docx',
};

export default buildDocument;
