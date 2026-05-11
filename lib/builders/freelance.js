import {
  Document, Paragraph, TextRun, AlignmentType,
  LevelFormat, BorderStyle, TabStopType, PageBreak,
} from 'docx';

const FONT = 'Calibri';

const sectionHeader = (text) => new Paragraph({
  spacing: { before: 240, after: 60 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000', space: 2 } },
  children: [new TextRun({ text, bold: true, size: 26, font: FONT })],
});

const center = (textRuns, opts = {}) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: opts.after ?? 40 },
  children: textRuns,
});

const bullet = (children, opts = {}) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: opts.after ?? 60 },
  children,
});

const tr = (text, extra = {}) => new TextRun({
  text, font: FONT,
  size: extra.size ?? 22,
  bold: extra.bold,
  italics: extra.italics,
  color: extra.color,
});

const competency = (label, body) => bullet([tr(`${label}: `, { bold: true }), tr(body)]);

const jobHeader = (company, dates) => new Paragraph({
  spacing: { before: 160, after: 40 },
  tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
  children: [
    tr(company, { bold: true }),
    new TextRun({ text: '\t', font: FONT, size: 22 }),
    tr(dates, { bold: true, italics: true, size: 20, color: '475569' }),
  ],
});

const roleLine = (text) => new Paragraph({
  spacing: { after: 60 },
  children: [tr(text, { italics: true })],
});

const projectSubtitle = (text) => new Paragraph({
  spacing: { after: 80 },
  children: [tr(text, { italics: true, color: '475569', size: 20 })],
});

const envLine = (text) => new Paragraph({
  spacing: { after: 80 },
  children: [tr('Environment: ', { bold: true }), tr(text)],
});

export function buildDocument() {
  const sections = [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 },
      },
    },
    children: [
      center([new TextRun({ text: 'JAYSHRI C DALVI', bold: true, size: 36, font: FONT })], { after: 40 }),
      center([tr('Senior Full Stack Developer  ·  Healthcare & Banking Domain Expert', { bold: true, size: 24 })], { after: 40 }),
      center([tr('.NET  |  Angular  |  React  |  Python / FastAPI  |  SQL Server / Oracle', { size: 22 })], { after: 40 }),
      center([tr('Open to Remote · Hourly / Fixed-Price / Contract-to-Hire', { italics: true, size: 20, color: '475569' })], { after: 40 }),
      center([tr('Email: dalvi.jayshri24@gmail.com', { size: 20 })], { after: 120 }),

      sectionHeader('PROFILE OVERVIEW'),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          tr('Senior Full Stack Developer with 10+ years of production experience across '),
          tr('Banking & Financial Services', { bold: true }),
          tr(' (Discover Financial Services / CapitalOne, Bank of America) and '),
          tr('US Healthcare Payers', { bold: true }),
          tr(' (TriZetto Facets, MMIS, Member Enrollment, EDI 834/820). I deliver end-to-end — requirements, data modeling, RESTful APIs, SPA frontends, CI/CD, and Tier-2 production support — and have shipped a full multi-tenant healthcare SaaS solo as a personal product (ElixaX Health).'),
        ],
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          tr('I work well as an '),
          tr('individual contributor', { bold: true }),
          tr(' or a '),
          tr('technical lead', { bold: true }),
          tr(' (have led teams of 5–6), and use modern AI-assisted tooling (Copilot, Claude, ChatGPT) to ship faster with high code quality.'),
        ],
      }),

      sectionHeader('SERVICES OFFERED'),
      bullet([tr('Full Stack web development — ', { bold: true }), tr('.NET (C# / ASP.NET MVC / .NET Core), Angular, React + TypeScript, FastAPI, Spring Boot')]),
      bullet([tr('Healthcare payer integrations — ', { bold: true }), tr('TriZetto Facets, Facets Extensions, EDI 834 / 820, 999 / TA1, MMIS, HIPAA workflows')]),
      bullet([tr('Banking & fintech delivery — ', { bold: true }), tr('post-merger data migration, loan origination, student loans, escrow analysis, account reconciliation')]),
      bullet([tr('Database engineering — ', { bold: true }), tr('SQL Server & Oracle stored procs, T-SQL / PL/SQL, query tuning, execution plans, indexing, data modeling, SSIS / Informatica ETL')]),
      bullet([tr('API design & integration — ', { bold: true }), tr('REST, SOAP, OAuth, Swagger, WhatsApp Business API, payment / mapping integrations')]),
      bullet([tr('Multi-tenant SaaS architecture — ', { bold: true }), tr('per-tenant data isolation, JWT auth, role-based admin, slug-based tenant URLs')]),
      bullet([tr('DevOps & deployment — ', { bold: true }), tr('Jenkins (Groovy), GitHub Actions, Docker, Render, Vercel, AutoSys, MSBuild')]),
      bullet([tr('Tech lead / code review / mentoring — ', { bold: true }), tr('design reviews, HLD/LLD authoring, Tier-2 production support, KT sessions')]),

      sectionHeader('FEATURED PROJECT — ElixaX Health (Founder, Solo Build)'),
      projectSubtitle('Multi-Tenant Healthcare SaaS  ·  React + TypeScript + Ant Design (Vercel)  ·  FastAPI + SQLAlchemy + PostgreSQL + Redis (Render, Docker)'),
      bullet([tr('Designed and shipped an end-to-end SaaS for clinics — OPD, IPD, billing, lab, pharmacy, ANC — with sub-5-second prescription generation as the headline product promise.')]),
      bullet([tr('Architected strict '), tr('multi-tenant data isolation', { bold: true }), tr(' with per-clinic scoping on every query, slug-based tenant URLs, JWT auth, and role-based admin.')]),
      bullet([tr('Integrated WhatsApp Business API + SMS fallback + Google Maps directions for appointment confirmations; tuned end-to-end latency to under 800 ms p95.')]),
      bullet([tr('Tier-1 hardened public booking flow for Indian market: real-time slot validation against doctor schedules, phone normalization, ABHA ID capture, senior-citizen priority, public-holiday blocking.')]),
      bullet([tr('Authored Alembic migrations, seed scripts, and a Docker-based local stack to enable fast new-clinic onboarding.')]),

      sectionHeader('CORE SKILLS'),
      competency('Banking & Financial Services', 'Post-Merger Data Migration, Loan Origination, Student Loans, DDI (Dynamic Data Interchange), FHA Mock Escrow Analysis, DOJ Physical Escrow Analysis, Customer/Bank/Phone/Email Domain Modeling, Account Reconciliation, Batch Processing'),
      competency('Healthcare Payer Platforms', 'TriZetto Facets, Facets Extensions, Subscriber/Member, Group/Class/Plan, Billing, Claims, MMIS (Medicaid Management Information System)'),
      competency('EDI / HIPAA Transactions', 'EDI 834 (Benefit Enrollment & Maintenance), EDI 820 (Premium Payment), 999/TA1 acknowledgments, inbound/outbound EDI processing, enrollment reconciliation'),
      competency('Languages', 'C#, ASP.NET, ASP.NET MVC, .NET Core, Core Java, J2EE, Python 3.12, SQL, T-SQL, PL/SQL, TypeScript, JavaScript'),
      competency('Frameworks & APIs', '.NET Framework 3.0/4.0/4.5, .NET Core, FastAPI, Spring Boot / MVC / REST / IOC, Entity Framework, SQLAlchemy, REST, SOAP, OAuth, JWT'),
      competency('Front End', 'Angular, React + TypeScript, Ant Design, HTML5, CSS3, Bootstrap, jQuery, AJAX, SPA development'),
      competency('Databases', 'SQL Server 2014/2012/2008, Oracle, PostgreSQL, MySQL, SSIS, SSRS, Stored Procedures, Triggers, Views, Query Tuning, Execution Plans, Indexing, Data Modeling'),
      competency('DevOps & Tools', 'Jenkins (Groovy CI/CD), GitHub Actions, Docker, Render, Vercel, Git, GitHub, TFS, VSTS, AutoSys, Splunk, Postman, SoapUI, PowerShell, MSBuild'),
      competency('AI-Assisted Development', 'GitHub Copilot, Claude, ChatGPT — code generation, refactoring, code review, unit-test creation'),
      competency('Lead / Delivery', 'Team Lead (5–6 devs), Mentoring, Code & Design Reviews, Tier-2 Production Support, Sprint Planning, Stakeholder Management'),
      competency('Methodologies', 'Agile, Scrum, SDLC, Waterfall, UML (Visio, Lucidchart), HLD/LLD design'),

      new Paragraph({ children: [new PageBreak()] }),

      sectionHeader('PROFESSIONAL EXPERIENCE'),

      jobHeader('Discover Financial Services / CapitalOne', 'Mar 2022 – May 2026'),
      roleLine('Senior Full Stack Developer  |  Discover-to-CapitalOne Data Migration'),
      new Paragraph({
        spacing: { after: 80 },
        children: [tr('Post-merger initiative to migrate Discover bank and account data into CapitalOne; built a new Python-based data migration framework covering Customer, Bank, Phone, and Email domains.', { italics: true })],
      }),
      bullet([tr('Designed and developed a reusable Python 3.12 data migration framework leveraged across all migration modules, reducing duplicate code and accelerating onboarding of new data domains.')]),
      bullet([tr('Built Python APIs to connect to Oracle databases, extract source data, transform per the target data model, and load into CapitalOne target systems.')]),
      bullet([tr('Authored complex SQL and PL/SQL queries, joins, and analytical scripts to reconcile data across source systems and verify migration completeness and accuracy.')]),
      bullet([tr('Developed a Python-based unit testing framework integrated with Oracle to validate data integrity, transformations, and business rules before production cutover.')]),
      bullet([tr('Partnered with business analysts to translate Customer, Bank, Phone, and Email domain rules into reusable data models and migration mappings.')]),
      envLine('Python 3.12, Oracle, SQL, PL/SQL, Informatica, Git.'),

      roleLine('Senior Full Stack Developer  |  Discover Student Loans'),
      new Paragraph({
        spacing: { after: 80 },
        children: [tr('End-to-end student loans platform covering Application Submission, Credit Check, Reporting, Data Entry, AOD, DSL Text Extract, batch processing, and Windows-based applications.', { italics: true })],
      }),
      bullet([tr('Led design and development of multiple modules using ASP.NET, ASP.NET MVC, C#, and SQL Server, partnering with product owners, scrum teams, QA, and project leadership.')]),
      bullet([tr('Designed and tuned SQL Server stored procedures, indexes, and queries to accelerate daily batch jobs and reduce report generation time.')]),
      bullet([tr('Built CI/CD pipelines in Jenkins using Groovy scripts to automate builds, unit tests, and deployments to lower environments.')]),
      bullet([tr('Implemented and maintained AutoSys jobs for scheduled processing, including outbound text-message notifications to customers.')]),
      bullet([tr('Created UML, sequence, and class diagrams in Lucidchart; authored HLD/LLD documents and conducted KT sessions for QA and business teams.')]),
      envLine('ASP.NET, ASP.NET MVC, C#, SQL Server, AutoSys, Jenkins (Groovy CI/CD), Git, nUnit.'),

      jobHeader('Bank of America, Plano, TX', 'Sep 2020 – Feb 2022'),
      roleLine('Senior Full Stack Developer  |  DDI & Escrow Analysis Systems'),
      new Paragraph({
        spacing: { after: 80 },
        children: [tr('DDI (Dynamic Data Interchange) evaluates and queues exceptions on loan portfolio and origination data; Escrow Analysis Systems handle FHA Mock Escrow Analysis and DOJ Physical Escrow Analysis modifications.', { italics: true })],
      }),
      bullet([tr('Designed and built RESTful APIs using Spring Boot, Spring MVC, and Spring REST; integrated OAuth-based authentication for secure service-to-service calls.')]),
      bullet([tr('Developed responsive Single Page Application (SPA) front ends in Angular, TypeScript, HTML5, CSS3, and Bootstrap with reusable components and client-side validation.')]),
      bullet([tr('Authored complex SQL and PL/SQL on Oracle for data extraction and reporting; created stored procedures, views, and indexes to optimize performance.')]),
      bullet([tr('Built and maintained Jenkins CI/CD pipelines automating builds, unit tests (jUnit), and deployments to lower environments.')]),
      bullet([tr('Provided production support, root-cause analysis, and incident resolution using Splunk-based log analysis.')]),
      envLine('Core Java, J2EE, Spring Boot, Spring MVC, Spring REST, Angular, TypeScript, HTML5, CSS3, Bootstrap, Oracle, PL/SQL, TFS, Jenkins, jUnit, OAuth, Splunk, UiPath.'),

      jobHeader('HPE (Hewlett Packard Enterprise), El Paso, TX', 'Jan 2015 – Aug 2020'),
      roleLine('Senior Developer / Module Lead  |  Healthcare Payer — Facets, Member Enrollment & MMIS'),
      new Paragraph({
        spacing: { after: 80 },
        children: [tr('State Medicaid program on TriZetto Facets and MMIS — Member Enrollment, Eligibility, Claims, Provider, Benefits, Premium Billing, Managed Care, Drug Rebate, Third Party Liability, Prior Authorization. Facets configuration, Facets Extensions development, and EDI 834/820 processing.', { italics: true })],
      }),
      bullet([tr('Module lead across multiple release cycles for Member Enrollment and Eligibility on TriZetto Facets — Subscriber/Member, Group, Class/Plan, and Billing configurations.')]),
      bullet([tr('Developed Facets Extensions in C# / .NET for custom enrollment workflows, member maintenance screens, eligibility verification, and downstream reporting.')]),
      bullet([tr('Designed and implemented inbound EDI 834 (Benefit Enrollment and Maintenance) processing — parsing 834 transaction sets, applying enrollment add/change/term logic into Facets Member, error-trapping, and 999/TA1 acknowledgments.')]),
      bullet([tr('Built outbound EDI 820 (Premium Payment) generation logic — aggregating Facets billing data, formatting per HIPAA X12 standards, and reconciling 820 outputs against Facets Premium Billing.')]),
      bullet([tr('Authored complex SQL Server stored procedures, views, indexes, and queries against Facets schemas; led query performance optimization initiatives that reduced batch run times significantly.')]),
      bullet([tr('Mentored a team of 4–6 developers across Member Enrollment and Eligibility — code reviews, design reviews, onboarding new joiners; authored coding standards and KT material.')]),
      bullet([tr('Provided Tier 2 production support — triaged incidents, performed root-cause analysis on Facets data, EDI processing failures, and member/claims issues; delivered defect fixes within SLA.')]),
      envLine('TriZetto Facets, Facets Extensions, EDI 834, EDI 820, MMIS, C#, ASP.NET, ASP.NET MVC, .NET Framework, SQL Server, T-SQL, Mainframe interfaces, Amisys (legacy), Visio, TFS, Jenkins.'),

      sectionHeader('EDUCATION'),
      new Paragraph({
        spacing: { after: 80 },
        children: [tr("Bachelor's Degree in Computer Science / Engineering")],
      }),

      sectionHeader('ENGAGEMENT PREFERENCES'),
      bullet([tr('Engagement types: ', { bold: true }), tr('Hourly contracts, fixed-price projects, short-term consulting, contract-to-hire.')]),
      bullet([tr('Work mode: ', { bold: true }), tr('100% remote.')]),
      bullet([tr('Comfortable with: ', { bold: true }), tr('Greenfield builds, legacy system modernization, data migration, production support, technical lead engagements.')]),
    ],
  }];

  return new Document({
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
}

export const meta = {
  id: 'freelance',
  name: 'Freelance — Full',
  description: 'Long-form freelance variant with detailed SERVICES, CORE SKILLS, environment lines per role, and engagement preferences. Best for marketplaces like Upwork.',
  filename: 'Jayshri-Dalvi-Resume-Freelance.docx',
};
