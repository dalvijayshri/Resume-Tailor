import {
  Document, Paragraph, TextRun, AlignmentType,
  LevelFormat, BorderStyle, TabStopType, Packer,
  Table, TableRow, TableCell, WidthType,
} from 'docx';

const FONT = 'Calibri';
const ACCENT = '1F4E79';
const MUTED = '475569';

const sectionHeader = (text) => new Paragraph({
  spacing: { before: 160, after: 40 },
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
  spacing: { after: opts.after ?? 20 },
  children,
});

const tr = (text, extra = {}) => new TextRun({
  text,
  font: FONT,
  size: extra.size ?? 20,
  bold: extra.bold,
  italics: extra.italics,
  color: extra.color,
});

const jobHeader = (company, location, dates) => new Paragraph({
  spacing: { before: 100, after: 20 },
  tabStops: [{ type: TabStopType.RIGHT, position: 10080 }],
  children: [
    tr(company, { bold: true, size: 22 }),
    tr(location ? `  ·  ${location}` : '', { size: 20, color: MUTED }),
    new TextRun({ text: '\t', font: FONT, size: 20 }),
    tr(dates, { bold: true, italics: true, size: 18, color: MUTED }),
  ],
});

const roleLine = (text) => new Paragraph({
  spacing: { after: 20 },
  children: [tr(text, { italics: true, color: MUTED })],
});

const projectDescriptionLine = (text) => new Paragraph({
  spacing: { after: 30 },
  children: [tr(text, { italics: true, color: MUTED, size: 18 })],
});

// Cell border style: subtle grey horizontal dividers between rows, no vertical
// lines or outer box — keeps the skills section visually clean while still
// reading as a table in Word.
const CELL_BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const CELL_BORDER_ROW = { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' };

function skillCell({ children, width, bold = false, color, italics = false }) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    borders: {
      top: CELL_BORDER_ROW,
      bottom: CELL_BORDER_ROW,
      left: CELL_BORDER_NONE,
      right: CELL_BORDER_NONE,
    },
    children: [new Paragraph({
      spacing: { after: 0 },
      children: [tr(children, { bold, color, italics, size: 20 })],
    })],
  });
}

function buildSkillsTable(skills) {
  const rows = skills.map((group) => new TableRow({
    children: [
      skillCell({ children: group?.category ?? '', width: 28, bold: true, color: ACCENT }),
      skillCell({ children: group?.items ?? '', width: 72 }),
    ],
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

/**
 * Build a docx Document from an AI-tailored resume JSON payload.
 *
 * @param {object} tailoredResume - See TailoredResume shape in
 *   app/api/tailor/docx/route.js documentation.
 * @returns {Document}
 */
export function buildDocument(tailoredResume) {
  if (!tailoredResume || typeof tailoredResume !== 'object') {
    throw new Error('buildDocument: tailoredResume payload is required.');
  }

  const {
    name,
    title,
    tagline,
    contact,
    summary,
    skills = [],
    experience = [],
    education,
    projects,
  } = tailoredResume;

  const children = [];

  // ── Header ───────────────────────────────────────────────────────────────
  children.push(
    center(
      [new TextRun({ text: String(name).toUpperCase(), bold: true, size: 36, font: FONT, color: ACCENT })],
      { after: 20 },
    ),
  );
  children.push(center([tr(title, { bold: true, size: 22 })], { after: 20 }));
  children.push(center([tr(tagline, { size: 18 })], { after: 20 }));
  children.push(center([tr(contact, { italics: true, size: 18, color: MUTED })], { after: 60 }));

  // ── PROFILE ──────────────────────────────────────────────────────────────
  children.push(sectionHeader('PROFILE'));
  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [tr(summary)],
    }),
  );

  // ── CORE SKILLS (2-column table) ─────────────────────────────────────────
  if (skills.length > 0) {
    children.push(sectionHeader('CORE SKILLS'));
    children.push(buildSkillsTable(skills));
    // Trailing spacer so the next section header has breathing room.
    children.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
  }

  // ── PROFESSIONAL EXPERIENCE ──────────────────────────────────────────────
  if (experience.length > 0) {
    children.push(sectionHeader('PROFESSIONAL EXPERIENCE'));
    for (const job of experience) {
      children.push(jobHeader(job.company, job.location ?? null, job.dates));
      children.push(roleLine(job.role));
      if (job.projectDescription) {
        children.push(projectDescriptionLine(job.projectDescription));
      }
      const jobBullets = Array.isArray(job.bullets) ? job.bullets : [];
      for (const b of jobBullets) {
        children.push(bullet([tr(b)]));
      }
    }
  }

  // ── EDUCATION ────────────────────────────────────────────────────────────
  if (education) {
    children.push(sectionHeader('EDUCATION'));
    children.push(
      new Paragraph({
        spacing: { after: 0 },
        children: [tr(education)],
      }),
    );
  }

  // ── PROJECTS (optional) ──────────────────────────────────────────────────
  if (Array.isArray(projects) && projects.length > 0) {
    children.push(sectionHeader('PROJECTS'));
    for (const project of projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          tabStops: [{ type: TabStopType.RIGHT, position: 10080 }],
          children: [
            tr(project.name, { bold: true, size: 22 }),
            new TextRun({ text: '\t', font: FONT, size: 20 }),
            tr(project.dates, { bold: true, italics: true, size: 18, color: MUTED }),
          ],
        }),
      );
      if (project.stack) {
        children.push(projectDescriptionLine(project.stack));
      }
      const projectBullets = Array.isArray(project.bullets) ? project.bullets : [];
      for (const b of projectBullets) {
        children.push(bullet([tr(b)]));
      }
    }
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
  id: 'tailored',
  name: 'AI-Tailored Resume',
  description: 'Resume tailored by AI to a specific job description.',
  filename: 'Jayshri-Dalvi-Tailored-Resume.docx',
};

// Re-export Packer for callers that prefer a one-stop import.
export { Packer };
