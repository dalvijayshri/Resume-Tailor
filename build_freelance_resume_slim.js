const path = require('path');
const fs = require('fs');
const docx = require(path.join('C:\\Users\\jadha\\AppData\\Roaming\\npm\\node_modules', 'docx'));

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  LevelFormat, BorderStyle, TabStopType,
} = docx;

const FONT = 'Calibri';

function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 120, after: 40 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 } },
    children: [new TextRun({ text, bold: true, size: 22, font: FONT })],
  });
}

function center(textRuns, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: opts.after ?? 30 },
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

function jobHeader(company, dates) {
  return new Paragraph({
    spacing: { before: 80, after: 20 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
    children: [
      tr(company, { bold: true }),
      new TextRun({ text: '\t', font: FONT, size: 20 }),
      tr(dates, { bold: true, italics: true, size: 18, color: '475569' }),
    ],
  });
}

function roleLine(text) {
  return new Paragraph({
    spacing: { after: 20 },
    children: [tr(text, { italics: true })],
  });
}

// ---------------- Content ----------------

const sections = [{
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 720, right: 1080, bottom: 720, left: 1080 },
    },
  },
  children: [
    // Header
    center([new TextRun({ text: 'JAYSHRI C DALVI', bold: true, size: 34, font: FONT })], { after: 30 }),
    center([tr('Senior Full Stack Developer  ·  Healthcare & Banking Domain Expert', { bold: true, size: 22 })], { after: 30 }),
    center([tr('.NET  |  Angular  |  React  |  Python / FastAPI  |  SQL Server / Oracle', { size: 20 })], { after: 30 }),
    center([tr('Remote · Hourly / Fixed-Price / Contract-to-Hire  ·  dalvi.jayshri24@gmail.com', { italics: true, size: 20, color: '475569' })], { after: 100 }),

    // Profile Overview
    sectionHeader('PROFILE'),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        tr('Senior Full Stack Developer with 10+ years of production experience across '),
        tr('Banking & Financial Services', { bold: true }),
        tr(' (Discover / CapitalOne, Bank of America) and '),
        tr('US Healthcare Payers', { bold: true }),
        tr(' (TriZetto Facets, MMIS, EDI 834/820). End-to-end delivery — requirements, data modeling, RESTful APIs, SPA frontends, CI/CD, and Tier-2 production support. Comfortable as an individual contributor or technical lead of 5–6 devs.'),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        tr('Recently founded and shipped '),
        tr('ElixaX Health', { bold: true }),
        tr(', a multi-tenant healthcare SaaS, solo (React + FastAPI + PostgreSQL on Render/Vercel). Use AI-assisted tooling (Copilot, Claude, ChatGPT) day-to-day to ship faster with high code quality.'),
      ],
    }),

    // Services Offered
    sectionHeader('SERVICES'),
    bullet([tr('Full Stack web apps — ', { bold: true }), tr('.NET (C# / MVC / Core), Angular, React + TypeScript, FastAPI, Spring Boot')]),
    bullet([tr('Healthcare integrations — ', { bold: true }), tr('TriZetto Facets, EDI 834 / 820, 999 / TA1, MMIS, HIPAA workflows')]),
    bullet([tr('Banking & fintech — ', { bold: true }), tr('post-merger data migration, loan origination, student loans, escrow analysis')]),
    bullet([tr('Database engineering — ', { bold: true }), tr('SQL Server / Oracle stored procs, query tuning, indexing, data modeling, ETL')]),
    bullet([tr('API + SaaS architecture — ', { bold: true }), tr('REST, OAuth, JWT, multi-tenant isolation, WhatsApp/payment/maps integrations')]),
    bullet([tr('DevOps — ', { bold: true }), tr('Jenkins, GitHub Actions, Docker, Render, Vercel, AutoSys')]),
    bullet([tr('Tech lead — ', { bold: true }), tr('HLD/LLD, design & code reviews, Tier-2 production support, KT, mentoring')]),

    // Featured Project
    sectionHeader('FEATURED PROJECT — ElixaX Health (Founder, Solo Build)'),
    new Paragraph({
      spacing: { after: 50 },
      children: [tr('Multi-tenant healthcare SaaS  ·  React + TypeScript + Ant Design (Vercel)  ·  FastAPI + SQLAlchemy + PostgreSQL + Redis (Render, Docker)', { italics: true, color: '475569', size: 20 })],
    }),
    bullet([tr('Shipped end-to-end SaaS for clinics (OPD, IPD, billing, lab, pharmacy, ANC) with sub-5-second prescription generation as headline promise.')]),
    bullet([tr('Architected '), tr('multi-tenant data isolation', { bold: true }), tr(' with per-clinic scoping, slug-based tenant URLs, JWT auth, role-based admin; under 800 ms p95 latency.')]),
    bullet([tr('Integrated WhatsApp Business API, SMS fallback, Google Maps; hardened public booking flow for Indian market (slot validation, ABHA ID, holiday blocking).')]),

    // Core Skills
    sectionHeader('CORE SKILLS'),
    competency('Banking & Fintech', 'Post-Merger Data Migration, Loan Origination, Student Loans, DDI, FHA/DOJ Escrow Analysis, Account Reconciliation'),
    competency('Healthcare Payer', 'TriZetto Facets + Extensions, Subscriber/Member, Group/Class/Plan, Billing, Claims, MMIS'),
    competency('EDI / HIPAA', 'EDI 834, EDI 820, 999/TA1, inbound/outbound processing, enrollment reconciliation'),
    competency('Languages', 'C#, ASP.NET (MVC, Core), Java/J2EE, Python 3.12, TypeScript, JavaScript, SQL, T-SQL, PL/SQL'),
    competency('Frameworks', '.NET Framework + Core, FastAPI, Spring Boot/MVC/REST, Entity Framework, SQLAlchemy'),
    competency('Front End', 'Angular, React + TypeScript, Ant Design, HTML5, CSS3, Bootstrap, SPA'),
    competency('Databases', 'SQL Server, Oracle, PostgreSQL, MySQL, SSIS, SSRS — stored procs, query tuning, indexing, data modeling'),
    competency('DevOps & Tools', 'Jenkins (Groovy), GitHub Actions, Docker, Render, Vercel, Git, AutoSys, Splunk, Postman'),
    competency('AI Coding', 'GitHub Copilot, Claude, ChatGPT — generation, refactoring, code review, unit tests'),

    // Professional Experience
    sectionHeader('PROFESSIONAL EXPERIENCE'),

    jobHeader('Discover Financial Services / CapitalOne', 'Mar 2022 – May 2026'),
    roleLine('Senior Full Stack Developer  |  Discover-to-CapitalOne Data Migration  &  Student Loans'),
    bullet([tr('Designed and built a reusable Python 3.12 data migration framework for post-merger Customer, Bank, Phone, and Email domains — Oracle ETL with reconciliation and unit-test framework.')]),
    bullet([tr('Authored complex SQL / PL/SQL for cross-system reconciliation, transformation, and migration validation; partnered with business analysts on domain mapping.')]),
    bullet([tr('On Discover Student Loans: led ASP.NET MVC / C# / SQL Server modules across Application Submission, Credit Check, Reporting, and DSL Text Extract; tuned stored procs, built Jenkins/Groovy CI/CD, and managed AutoSys batch jobs.')]),

    jobHeader('Bank of America, Plano, TX', 'Sep 2020 – Feb 2022'),
    roleLine('Senior Full Stack Developer  |  DDI & Escrow Analysis Systems  ·  Core Java / J2EE'),
    bullet([tr('Built '), tr('Core Java / J2EE', { bold: true }), tr(' REST APIs with Spring Boot, Spring MVC, and Spring REST (OAuth) for the DDI loan-exception evaluation engine and FHA Mock / DOJ Physical Escrow Analysis flows.')]),
    bullet([tr('Developed Angular + TypeScript SPAs and JSON/XML/SOAP integrations on top of the Java services; authored complex Oracle PL/SQL, stored procedures, views, and indexes.')]),
    bullet([tr('Built Jenkins CI/CD pipelines with jUnit; Splunk-based production support and incident resolution.')]),

    jobHeader('HPE (Hewlett Packard Enterprise), El Paso, TX', 'Jan 2015 – Aug 2020'),
    roleLine('Senior Developer / Module Lead  |  Healthcare Payer — Facets, MMIS, EDI'),
    bullet([tr('Module lead for Member Enrollment + Eligibility on TriZetto Facets across multiple release cycles; built Facets Extensions in C# / .NET for custom enrollment, eligibility, and reporting workflows.')]),
    bullet([tr('Designed inbound EDI 834 and outbound EDI 820 processing — 834 parsing with add/change/term logic into Facets Member, 999/TA1 acknowledgments, and 820 reconciliation against Facets Premium Billing.')]),
    bullet([tr('Authored complex SQL Server stored procs, views, and indexes against Facets schemas; led query optimization that cut batch run times significantly.')]),
    bullet([tr('Mentored 4–6 devs across Enrollment / Eligibility workstreams; ran design & code reviews, Tier-2 production support, HLD/LLD authoring, and KT for QA / business / downstream teams.')]),

    // Education
    sectionHeader('EDUCATION'),
    new Paragraph({
      spacing: { after: 60 },
      children: [tr("Bachelor's Degree in Computer Science / Engineering")],
    }),

  ],
}];

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 22 } } } },
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '•',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 240 } } },
      }],
    }],
  },
  sections,
});

const outPath = 'C:\\Users\\jadha\\Downloads\\Jayshri Dalvi Resume Freelance Upwork Slim V2.docx';
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('Wrote', outPath, buf.length, 'bytes');
});
