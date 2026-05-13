import {
  Document, Paragraph, TextRun, AlignmentType,
  LevelFormat, BorderStyle, TabStopType, Packer,
  Table, TableRow, TableCell, WidthType,
} from 'docx';

const FONT = 'Calibri';
const ACCENT = '1F4E79';
const MUTED = '475569';

// Section heading: ALL-CAPS bold accent label with a 1pt accent rule beneath.
// The recruiter's eye should hit these first when scanning the page.
const sectionHeader = (text) => new Paragraph({
  spacing: { before: 220, after: 60 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: ACCENT, space: 3 } },
  children: [new TextRun({ text, bold: true, size: 24, font: FONT, color: ACCENT })],
});

const bullet = (children, opts = {}) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: opts.after ?? 30, line: 280 },
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

// Company on the left (bold), dates right-aligned (muted italic). This is the
// "spine" line of each experience entry — it sets up scanning by employer.
const jobHeader = (company, location, dates) => new Paragraph({
  spacing: { before: 140, after: 30 },
  tabStops: [{ type: TabStopType.RIGHT, position: 10080 }],
  children: [
    tr(company, { bold: true, size: 22 }),
    tr(location ? `  ·  ${location}` : '', { size: 20, color: MUTED }),
    new TextRun({ text: '\t', font: FONT, size: 20 }),
    tr(dates, { bold: true, italics: true, size: 18, color: MUTED }),
  ],
});

// Role title sits just under the company — italicized so it's a clear
// subordinate, but on its own line so the reader can grab it in one glance.
const roleLine = (text) => new Paragraph({
  spacing: { after: 20 },
  children: [tr(text, { italics: true, bold: true, color: MUTED, size: 20 })],
});

const projectDescriptionLine = (text) => new Paragraph({
  spacing: { after: 40 },
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

// Borderless header: name + title + tagline left, contact stacked right.
// This is the executive layout — recruiters anchor on the name (top-left),
// then jump to the right column for how to reach you. Cleaner and more
// confident than centered-everything.
function buildHeader({ name, title, tagline, contact }) {
  const borderNone = {
    top: CELL_BORDER_NONE,
    bottom: CELL_BORDER_NONE,
    left: CELL_BORDER_NONE,
    right: CELL_BORDER_NONE,
  };

  const leftChildren = [];
  if (name) {
    leftChildren.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({
        text: String(name).toUpperCase(),
        bold: true,
        size: 40,
        font: FONT,
        color: ACCENT,
      })],
    }));
  }
  if (title) {
    leftChildren.push(new Paragraph({
      spacing: { after: 40 },
      children: [tr(title, { bold: true, size: 24 })],
    }));
  }
  if (tagline) {
    leftChildren.push(new Paragraph({
      spacing: { after: 0 },
      children: [tr(tagline, { italics: true, size: 18, color: MUTED })],
    }));
  }

  // Split the contact string into one line per token so it stacks cleanly
  // on the right. Accept `·`, `|`, `,`, and newlines as separators — common
  // formats out of the AI ("Remote · email · LinkedIn", "Remote | email").
  const contactLines = String(contact || '')
    .split(/\s*[·|\n]\s*|\s+\|\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const rightChildren = (contactLines.length > 0 ? contactLines : [String(contact || '')])
    .filter(Boolean)
    .map((line, i, arr) => new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: i === arr.length - 1 ? 0 : 40 },
      children: [tr(line, { size: 18, color: MUTED })],
    }));

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 62, type: WidthType.PERCENTAGE },
          margins: { top: 0, bottom: 0, left: 0, right: 80 },
          borders: borderNone,
          verticalAlign: 'top',
          children: leftChildren.length ? leftChildren : [new Paragraph({ children: [] })],
        }),
        new TableCell({
          width: { size: 38, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 0, left: 80, right: 0 },
          borders: borderNone,
          verticalAlign: 'bottom',
          children: rightChildren.length ? rightChildren : [new Paragraph({ children: [] })],
        }),
      ],
    })],
  });

  // Thin accent rule below the header — gives the page a clear "top of
  // document" boundary and pulls the reader's eye into the PROFILE section.
  const rule = new Paragraph({
    spacing: { before: 60, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } },
    children: [],
  });

  return [headerTable, rule];
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

  // ── Header (executive two-column layout) ─────────────────────────────────
  for (const block of buildHeader({ name, title, tagline, contact })) {
    children.push(block);
  }

  // ── PROFILE ──────────────────────────────────────────────────────────────
  children.push(sectionHeader('PROFILE'));
  children.push(
    new Paragraph({
      spacing: { after: 80, line: 280 },
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
      const datesStr = typeof project.dates === 'string' ? project.dates.trim() : '';
      // When dates is empty (typical for ElixaX in non-healthcare framing,
      // where the project is presented as ongoing learning), render only the
      // project name — no tab stop, no muted dates run, no awkward gap.
      const headerChildren = datesStr
        ? [
            tr(project.name, { bold: true, size: 22 }),
            new TextRun({ text: '\t', font: FONT, size: 20 }),
            tr(datesStr, { bold: true, italics: true, size: 18, color: MUTED }),
          ]
        : [tr(project.name, { bold: true, size: 22 })];

      children.push(
        new Paragraph({
          spacing: { before: 140, after: 30 },
          ...(datesStr ? { tabStops: [{ type: TabStopType.RIGHT, position: 10080 }] } : {}),
          children: headerChildren,
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
