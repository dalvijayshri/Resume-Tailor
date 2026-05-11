const path = require('path');
const fs = require('fs');
const docx = require(path.join('C:\\Users\\jadha\\AppData\\Roaming\\npm\\node_modules', 'docx'));

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  LevelFormat, BorderStyle, TabStopType,
} = docx;

const FONT = 'Calibri';
const ACCENT = '1F4E79';   // deep blue for section titles
const MUTED = '475569';    // muted grey for dates/subtitles

// ---------- helpers ----------
function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 160, after: 40 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 2 } },
    children: [new TextRun({ text, bold: true, size: 22, font: FONT, color: ACCENT })],
  });
}

function center(textRuns, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: opts.after ?? 20 },
    children: textRuns,
  });
}

function bullet(children, opts = {}) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: opts.after ?? 20 },
    children,
  });
}

function tr(text, extra = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: extra.size ?? 20,
    bold: extra.bold,
    italics: extra.italics,
    color: extra.color,
  });
}

function competency(label, body) {
  return bullet([tr(`${label}: `, { bold: true }), tr(body)]);
}

function jobHeader(company, location, dates) {
  return new Paragraph({
    spacing: { before: 100, after: 20 },
    tabStops: [{ type: TabStopType.RIGHT, position: 10080 }],
    children: [
      tr(company, { bold: true, size: 22 }),
      tr(location ? `  ·  ${location}` : '', { size: 20, color: MUTED }),
      new TextRun({ text: '\t', font: FONT, size: 20 }),
      tr(dates, { bold: true, italics: true, size: 18, color: MUTED }),
    ],
  });
}

function roleLine(text) {
  return new Paragraph({
    spacing: { after: 20 },
    children: [tr(text, { italics: true, color: MUTED })],
  });
}

// ---------- content ----------

const sections = [{
  properties: {
    page: {
      size: { width: 12240, height: 15840 },             // US Letter
      margin: { top: 720, right: 1080, bottom: 720, left: 1080 }, // 0.5"/0.75"
    },
  },
  children: [
    // ─────────── Header ───────────
    center([new TextRun({ text: 'JAYSHRI C DALVI', bold: true, size: 36, font: FONT, color: ACCENT })], { after: 20 }),
    center([tr('Senior Full Stack Developer  ·  Banking & Healthcare Domain Expert', { bold: true, size: 22 })], { after: 20 }),
    center([tr('.NET (C# / Core)  |  Java / Spring Boot  |  Angular / React  |  Python / FastAPI  |  SQL Server / Oracle', { size: 18 })], { after: 20 }),
    center([tr('Remote  ·  Hourly  ·  Fixed-Price  ·  Contract-to-Hire  ·  dalvi.jayshri24@gmail.com', { italics: true, size: 18, color: MUTED })], { after: 60 }),

    // ─────────── Profile ───────────
    sectionHeader('PROFILE'),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        tr('Senior Full Stack Developer with '),
        tr('10+ years', { bold: true }),
        tr(' shipping production systems across '),
        tr('Banking & Financial Services', { bold: true }),
        tr(' (Discover / CapitalOne, Bank of America) and '),
        tr('US Healthcare Payers', { bold: true }),
        tr(' (TriZetto Facets, MMIS, EDI 834/820). Strong in '),
        tr('.NET, Java/Spring, Python, Angular, React', { bold: true }),
        tr(', and high-volume '),
        tr('SQL Server / Oracle', { bold: true }),
        tr('. Equally effective as an IC or as a technical lead of 5–6 developers; recently founded '),
        tr('ElixaX Health', { bold: true }),
        tr(' — a multi-tenant healthcare SaaS shipped solo on React + FastAPI + Postgres.'),
      ],
    }),

    // ─────────── Core Strengths ───────────
    sectionHeader('CORE STRENGTHS'),
    bullet([tr('Banking & Fintech: ', { bold: true }), tr('post-merger data migration, loan origination, student loans, FHA/DOJ escrow analysis, reconciliation, batch processing')]),
    bullet([tr('Healthcare Payer: ', { bold: true }), tr('TriZetto Facets + Extensions, Member Enrollment, Eligibility, Claims, MMIS, EDI 834 / 820, 999/TA1, HIPAA')]),
    bullet([tr('Backend & APIs: ', { bold: true }), tr('C# / ASP.NET MVC / .NET Core, Core Java / J2EE, Spring Boot / MVC / REST, Python 3.12, FastAPI, REST, OAuth, JWT, SOAP')]),
    bullet([tr('Front End: ', { bold: true }), tr('Angular, React + TypeScript, Ant Design, HTML5/CSS3, Bootstrap, SPA architecture')]),
    bullet([tr('Data: ', { bold: true }), tr('SQL Server, Oracle, PostgreSQL, MySQL — stored procs, query tuning, execution plans, indexing, SSIS / Informatica ETL, Alembic')]),
    bullet([tr('DevOps & Tooling: ', { bold: true }), tr('Jenkins (Groovy CI/CD), GitHub Actions, Docker, Render, Vercel, AutoSys, Splunk, Postman, MSBuild')]),
    bullet([tr('Leadership & AI: ', { bold: true }), tr('design & code reviews, mentoring 5–6 devs, HLD/LLD, Tier-2 production support; daily AI-assisted coding with Copilot, Claude, ChatGPT')]),

    // ─────────── Experience ───────────
    sectionHeader('PROFESSIONAL EXPERIENCE'),

    jobHeader('Discover Financial Services / CapitalOne', null, 'Mar 2022 – May 2026'),
    roleLine('Senior Full Stack Developer  ·  Discover→CapitalOne Data Migration  ·  Discover Student Loans'),
    bullet([tr('Designed and built a reusable '), tr('Python 3.12 data migration framework', { bold: true }), tr(' covering Customer / Bank / Phone / Email domains for the post-merger Discover→CapitalOne migration; framework reused across all migration modules and accelerated new-domain onboarding.')]),
    bullet([tr('Built Python ETL connectors to Oracle for extract, transform, and load against the CapitalOne target model; authored complex SQL / PL/SQL for cross-system reconciliation and a Python unit-test framework for pre-cutover validation.')]),
    bullet([tr('On '), tr('Discover Student Loans', { bold: true }), tr(': led ASP.NET MVC / C# / SQL Server modules across Application Submission, Credit Check, Reporting, AOD, and DSL Text Extract; tuned stored procedures, built Jenkins/Groovy CI/CD, owned AutoSys batch and outbound SMS jobs.')]),

    jobHeader('Bank of America', 'Plano, TX', 'Sep 2020 – Feb 2022'),
    roleLine('Senior Full Stack Developer  ·  DDI & Escrow Analysis Systems  ·  Core Java / J2EE'),
    bullet([tr('Built '), tr('Core Java / J2EE REST APIs', { bold: true }), tr(' with Spring Boot / Spring MVC / Spring REST and OAuth for the DDI (Dynamic Data Interchange) loan-exception engine and the FHA Mock / DOJ Physical Escrow Analysis flows.')]),
    bullet([tr('Delivered '), tr('Angular + TypeScript SPAs', { bold: true }), tr(' on top of the Java services; authored complex Oracle PL/SQL, stored procedures, views, and indexes for reporting and performance optimization.')]),
    bullet([tr('Built Jenkins CI/CD pipelines with jUnit; ran Splunk-based production support, RCA, and incident resolution; authored HLD/LLD and sequence diagrams in Visio.')]),

    jobHeader('HPE (Hewlett Packard Enterprise)', 'El Paso, TX', 'Jan 2015 – Aug 2020'),
    roleLine('Senior Developer / Module Lead  ·  Healthcare Payer — Facets, MMIS, EDI'),
    bullet([tr('Module lead for '), tr('Member Enrollment + Eligibility on TriZetto Facets', { bold: true }), tr(' across multiple release cycles; built Facets Extensions in C# / .NET for custom enrollment workflows, member maintenance, and downstream reporting.')]),
    bullet([tr('Designed inbound '), tr('EDI 834', { bold: true }), tr(' and outbound '), tr('EDI 820', { bold: true }), tr(' processing — 834 parsing with add/change/term logic into Facets Member, 999/TA1 acknowledgments, and 820 reconciliation against Facets Premium Billing.')]),
    bullet([tr('Authored complex SQL Server stored procedures and indexes against Facets schemas; '), tr('led query optimization that significantly reduced batch run times', { bold: true }), tr('. Mentored a team of 4–6 developers — design & code reviews, Tier-2 production support, HLD/LLD, and KT for QA / business / downstream teams.')]),

    // ─────────── Education ───────────
    sectionHeader('EDUCATION'),
    new Paragraph({
      spacing: { after: 60 },
      children: [tr("Bachelor's Degree in Computer Science / Engineering")],
    }),

    // ─────────── Personal Project (moved to end) ───────────
    sectionHeader('PERSONAL PROJECT — ElixaX Health  ·  Founder, Solo Build  ·  Jan 2026 – Present'),
    new Paragraph({
      spacing: { after: 30 },
      children: [tr('Multi-tenant healthcare SaaS — React + TypeScript + Ant Design (Vercel)  ·  FastAPI + SQLAlchemy + PostgreSQL + Redis (Docker / Render)', { italics: true, color: MUTED, size: 18 })],
    }),
    bullet([tr('Shipped end-to-end clinic SaaS — OPD, IPD, billing, lab, pharmacy, ANC — with '), tr('sub-5-second prescription generation', { bold: true }), tr(' as the headline product promise.')]),
    bullet([tr('Architected '), tr('strict multi-tenant data isolation', { bold: true }), tr(' (per-clinic scoping on every query, slug-based tenant URLs, JWT auth, role-based admin); end-to-end latency under 800 ms p95.')]),
    bullet([tr('Integrated WhatsApp Business API + SMS fallback + Google Maps; hardened public booking flow for Indian market (real-time slot validation, ABHA ID, senior-citizen priority, holiday blocking).')]),
  ],
}];

const doc = new Document({
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

const outPath = 'C:\\Users\\jadha\\Downloads\\Jayshri Dalvi Resume - 2 Page (ElixaX last).docx';
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('Wrote', outPath, buf.length, 'bytes');
});
