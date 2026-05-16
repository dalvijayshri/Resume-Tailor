// lib/builders/enterprise-master-profile.js
//
// Enterprise Master Profile — Jayshri Dalvi.
//
// This is NOT a 2-page submittable resume. It's a comprehensive
// consultant-grade master profile (~3-4 pages) covering:
//
//   Executive Summary → Capability Matrix → Domain Expertise →
//   Signature Projects → Technology Matrix → Architecture &
//   Operational Expertise → Enterprise Workflow Expertise →
//   Healthcare / Banking / AI / Production Support / Modernization
//   sub-expertise → Business Impact
//
// Positioning: Senior Healthcare & Enterprise Full Stack Consultant.
// Used as the source-of-truth corpus that auto-loads into /tailor,
// and as a stand-alone downloadable artifact from the home page.

import {
  Document, Paragraph, TextRun, AlignmentType,
  LevelFormat, BorderStyle, TabStopType,
  Table, TableRow, TableCell, WidthType, ShadingType,
} from 'docx';

const FONT = 'Calibri';
const ACCENT = '1F4E79';        // deep blue
const ACCENT_LIGHT = 'EAF0F7';  // very pale blue used for capability-matrix row bands
const MUTED = '475569';
const DIVIDER = 'CBD5E1';

const tr = (text, extra = {}) => new TextRun({
  text,
  font: FONT,
  size: extra.size ?? 20,
  bold: extra.bold,
  italics: extra.italics,
  color: extra.color,
  break: extra.break,
});

const para = (children, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 80, line: opts.line ?? 280 },
  alignment: opts.alignment,
  children,
});

// Big bold accent label with a thick rule under it — the recruiter's eye
// hops between these.
const sectionHeader = (text) => new Paragraph({
  spacing: { before: 240, after: 60 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 4 } },
  children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, font: FONT, color: ACCENT })],
});

// Sub-section header for the within-expertise sub-headings.
const subSectionHeader = (text) => new Paragraph({
  spacing: { before: 140, after: 40 },
  children: [new TextRun({ text, bold: true, size: 22, font: FONT, color: ACCENT })],
});

const bullet = (children, opts = {}) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: opts.after ?? 30, line: 280 },
  children: Array.isArray(children) ? children : [children],
});

// Borders for the matrix tables — subtle horizontal dividers only.
const CELL_BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const CELL_BORDER_ROW = { style: BorderStyle.SINGLE, size: 4, color: DIVIDER };

function matrixCell({ runs, width, shade = null, paddingLeft = 100 }) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    margins: { top: 100, bottom: 100, left: paddingLeft, right: 120 },
    borders: {
      top: CELL_BORDER_ROW,
      bottom: CELL_BORDER_ROW,
      left: CELL_BORDER_NONE,
      right: CELL_BORDER_NONE,
    },
    shading: shade ? { type: ShadingType.CLEAR, color: 'auto', fill: shade } : undefined,
    children: [new Paragraph({ spacing: { after: 0, line: 280 }, children: runs })],
  });
}

/**
 * Build a 2-column capability/technology/domain matrix table.
 *
 * @param {Array<{label: string, body: string}>} rows
 * @param {object} [opts]
 * @param {number} [opts.labelWidth=28]  Left column width in %
 * @param {boolean} [opts.zebra=false]    Alternate row shading for visual rhythm
 */
function matrixTable(rows, { labelWidth = 28, zebra = false } = {}) {
  const bodyWidth = 100 - labelWidth;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row, i) => new TableRow({
      children: [
        matrixCell({
          runs: [tr(row.label, { bold: true, color: ACCENT, size: 20 })],
          width: labelWidth,
          shade: zebra && i % 2 === 0 ? ACCENT_LIGHT : null,
          paddingLeft: 120,
        }),
        matrixCell({
          runs: [tr(row.body, { size: 20 })],
          width: bodyWidth,
          shade: zebra && i % 2 === 0 ? ACCENT_LIGHT : null,
        }),
      ],
    })),
  });
}

// Header row line for a project entry — project name left, domain right.
const projectHeader = (name, domain) => new Paragraph({
  spacing: { before: 160, after: 40 },
  tabStops: [{ type: TabStopType.RIGHT, position: 10080 }],
  children: [
    tr(name, { bold: true, size: 22, color: ACCENT }),
    new TextRun({ text: '\t', font: FONT, size: 20 }),
    tr(domain, { bold: true, italics: true, size: 18, color: MUTED }),
  ],
});

const projectStackLine = (text) => new Paragraph({
  spacing: { after: 40 },
  children: [tr(text, { italics: true, color: MUTED, size: 18 })],
});

// Bullet with a bold "Category: " prefix.
const labelBullet = (label, body) => bullet([
  tr(`${label}: `, { bold: true }),
  tr(body),
]);

// Plain trailing spacer so the next section header has breathing room
// after a table.
const spacer = (twips = 60) => new Paragraph({
  spacing: { after: twips, line: 200 },
  children: [],
});

// Borderless header table: name + title left, contact right.
function headerBlock() {
  const left = [
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({
        text: 'JAYSHRI DALVI',
        bold: true, size: 44, font: FONT, color: ACCENT,
      })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [tr('Senior Healthcare & Enterprise Full Stack Consultant', { bold: true, size: 24, color: MUTED })],
    }),
    new Paragraph({
      spacing: { after: 0 },
      children: [tr(
        'Healthcare  ·  Banking  ·  AI Automation  ·  Enterprise Workflow Systems  ·  SaaS Modernization',
        { italics: true, size: 18, color: MUTED },
      )],
    }),
  ];

  const right = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 40 },
      children: [tr('13+ Years of Enterprise Experience', { bold: true, size: 18, color: ACCENT })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 30 },
      children: [tr('US Market  ·  Remote / Hybrid', { size: 18, color: MUTED })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 30 },
      children: [tr('dalvi.jayshri24@gmail.com', { size: 18, color: MUTED })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0 },
      children: [tr('Available: Hourly  ·  Fixed-Price  ·  Contract', { size: 18, color: MUTED })],
    }),
  ];

  const borders = { top: CELL_BORDER_NONE, bottom: CELL_BORDER_NONE, left: CELL_BORDER_NONE, right: CELL_BORDER_NONE };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 62, type: WidthType.PERCENTAGE },
          margins: { top: 0, bottom: 0, left: 0, right: 100 },
          borders,
          verticalAlign: 'top',
          children: left,
        }),
        new TableCell({
          width: { size: 38, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 0, left: 100, right: 0 },
          borders,
          verticalAlign: 'bottom',
          children: right,
        }),
      ],
    })],
  });
}

const accentRule = () => new Paragraph({
  spacing: { before: 80, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: ACCENT, space: 6 } },
  children: [],
});

// ─── Section content builders ────────────────────────────────────────────────

function executiveSummary() {
  return [
    sectionHeader('Executive Summary'),
    new Paragraph({
      spacing: { after: 120, line: 300 },
      alignment: AlignmentType.JUSTIFIED,
      children: [tr(
        'Senior consultant with 13+ years building and modernizing enterprise systems across Healthcare (Medicaid, MMIS, Provider Enrollment & Credentialing, Hospital Management), Banking (Mortgage Servicing, Student Loan Servicing), Insurance, Government Benefits (SNAP), AI Automation, and Multi-Tenant SaaS platforms. Strong blend of architectural depth, hands-on full-stack delivery, and operational credibility — trusted across the SDLC from requirement-gathering and solution design through deployment, L1/L2/L3 production support, and post-production enhancements.',
      )],
    }),
    new Paragraph({
      spacing: { after: 0, line: 300 },
      alignment: AlignmentType.JUSTIFIED,
      children: [tr(
        'Effective in regulated, high-volume environments where workflow correctness, audit traceability, and operational resilience matter. Equally comfortable owning a modernization initiative end-to-end, leading a small team of engineers, or running tier-3 production support on a live enterprise platform.',
      )],
    }),
  ];
}

function capabilityMatrix() {
  return [
    sectionHeader('Capability Matrix'),
    matrixTable([
      { label: 'Solution Architecture', body: 'Multi-tenant SaaS design, modernization strategy, integration architecture, audit-trail patterns, scalability & failure-domain planning.' },
      { label: 'Full-Stack Delivery', body: 'Angular / React 18 / TypeScript UI through C# .NET, ASP.NET, Python / FastAPI, and Java back-ends, on SQL Server and PostgreSQL.' },
      { label: 'Business Workflow Engineering', body: 'Provider lifecycle, claims adjudication, loan origination & servicing, eligibility rules, benefits adjudication, escrow analysis, case management.' },
      { label: 'Backend Processing & Automation', body: 'AutoSys, SQL Server Jobs, SSIS pipelines, EDI parsing, reconciliation, large-table migrations, Python automation frameworks.' },
      { label: 'Production Support & Reliability', body: 'L1 / L2 / L3 ownership, RCA, Splunk-based incident response, batch-job recovery, runbook authoring, enterprise change discipline.' },
      { label: 'Enterprise Modernization', body: 'WinForms → SaaS, monolith → service-oriented, on-prem → cloud, legacy decommission, post-merger consolidation, data migration with reconciliation.' },
      { label: 'AI Workflow Automation', body: 'AI voice agents, conversational AI, AI-assisted development (Claude / ChatGPT / Copilot in daily design + review), LLM-augmented productivity.' },
      { label: 'Operational Domain Expertise', body: 'Provider credentialing, MMIS workflows, CAQH integration, EDI 834 / 820, claims processing, mortgage escrow, SNAP eligibility, real-estate transactions.' },
    ], { zebra: true }),
    spacer(80),
  ];
}

function domainExpertise() {
  return [
    sectionHeader('Domain Expertise'),
    matrixTable([
      { label: 'Healthcare & Medicaid', body: 'PDMS, MMIS, Provider Enrollment, Credentialing, Recredentialing, Revalidation, HCBS, Medicaid ID generation, CAQH integration, Provider Screening (Annual / License / Owner / Site Visit), State Denial & Appeal, Provider Termination & Disenrollment.' },
      { label: 'Hospital Management', body: 'OPD / IPD, Appointment Registration & Scheduling, Billing & Insurance, Prescription, Lab integration, Pharmacy, Inventory, Doctor Onboarding, ABHA integration, WhatsApp & SMS communication.' },
      { label: 'Banking & Financial', body: 'Mortgage Escrow Analysis, Student Loan Servicing (borrower / co-signer / promissory notes / SMS workflows), Enterprise migration & legacy decommission, Backend financial reporting.' },
      { label: 'Insurance & Benefits', body: 'Benefits Enrollment, Insurance Eligibility Processing, Operational Reporting, Customer Servicing Operations.' },
      { label: 'Government Benefits', body: 'SNAP intake & onboarding, Eligibility Determination, Rule Engine processing, Referral Workflows, Worker Task Management, Case Review & Approval.' },
      { label: 'AI Automation', body: 'AI Voice Agents, Conversational AI workflows, Restaurant Ordering automation, Kitchen synchronization, Pickup notification workflows, AI Chatbot automation.' },
      { label: 'Multi-Tenant SaaS', body: 'Per-clinic onboarding, per-tenant configuration, role-based access control, slug-based tenant URLs, tenant-scoped data isolation.' },
      { label: 'Real Estate Operations', body: 'Active realtor operational understanding — buying / selling, offer & negotiation, mortgage coordination, transaction lifecycle, closing workflows.' },
    ], { zebra: false }),
    spacer(80),
  ];
}

// Single signature project: header + tech stack line + content matrix +
// business-value bullet block.
function signatureProject({ name, domain, lead, content, stack, businessValue }) {
  const out = [
    projectHeader(name, domain),
    projectStackLine(`Stack: ${stack}`),
  ];
  if (lead) {
    out.push(new Paragraph({
      spacing: { after: 80, line: 280 },
      alignment: AlignmentType.JUSTIFIED,
      children: [tr(lead)],
    }));
  }
  for (const row of content) {
    out.push(labelBullet(row.label, row.body));
  }
  if (businessValue) {
    out.push(new Paragraph({
      spacing: { before: 60, after: 20, line: 280 },
      children: [tr('Business Value  ·  ', { bold: true, size: 18, color: ACCENT }), tr(businessValue, { size: 18 })],
    }));
  }
  return out;
}

function signatureProjects() {
  return [
    sectionHeader('Signature Projects'),

    ...signatureProject({
      name: 'Provider Data Management & Credentialing Platform',
      domain: 'Healthcare · Medicaid · Provider Enrollment',
      stack: 'C# / .NET, ASP.NET, SQL Server, T-SQL, SSIS, SSRS, SQL Server Jobs, REST APIs',
      lead: 'Long-running engagement on Medicaid Provider Data Management Systems across multiple state ecosystems — Nebraska and Washington DC — covering the full provider lifecycle from initial enrollment through credentialing, screening, revalidation, and termination.',
      content: [
        { label: 'Provider Lifecycle', body: 'New enrollment, re-enrollment, revalidation, updates & maintenance, credentialing & recredentialing, provider termination & disenrollment, Medicaid ID generation, HCBS & MMIS provider workflows.' },
        { label: 'Screening Workflows', body: 'Annual screening, license screening, owner screening, site-visit workflows, background verification, state denial & appeal handling.' },
        { label: 'CAQH Integration', body: 'Profile synchronization, credential data retrieval, demographic validation, license & certification workflows, attestation tracking.' },
        { label: 'Batch Processing', body: 'Send Provider Jobs, Receive Medicaid ID Jobs, Revalidation Notification Jobs, Screening Validation Jobs — orchestrated via SQL Server Jobs and SSIS.' },
        { label: 'Operational Insight', body: 'Strong understanding of why applications stall — CAQH mismatches, taxonomy / NPI validation failures, ownership-validation gaps, missing documentation, credential-expiration bottlenecks.' },
      ],
      businessValue: 'Improved provider workflow visibility, reduced operational processing delays, supported state Medicaid operations at scale.',
    }),

    ...signatureProject({
      name: 'Hospital Management System Modernization',
      domain: 'Healthcare · SaaS Modernization',
      stack: 'C# / .NET, WinForms → React 18 + TypeScript, Python / FastAPI, SQL Server + PostgreSQL, SSIS, SSRS, REST, Twilio, WhatsApp, Render, Vercel',
      lead: 'Modernized a legacy WinForms hospital management application into a scalable multi-tenant healthcare SaaS — covering OPD / IPD operations, billing, lab, pharmacy, ABHA integration, and patient communication.',
      content: [
        { label: 'Core Modules', body: 'OPD & IPD management, appointment registration & scheduling, billing & insurance processing, prescription management, lab integration, pharmacy integration, inventory management, doctor onboarding.' },
        { label: 'Multi-Tenant Architecture', body: 'Multi-clinic onboarding, per-tenant clinic configuration, provider & staff onboarding, role-based access control, centralized healthcare administration, tenant-scoped data isolation.' },
        { label: 'AI & Automation', body: 'OCR-based document extraction, automated patient communication via SMS + WhatsApp, appointment reminder workflows, real-time slot validation.' },
        { label: 'Patient & Provider UX', body: 'ABHA-ready patient identity flow, public booking with senior-citizen priority and holiday blocking, secure provider workflows under JWT-based auth.' },
      ],
      businessValue: 'Modernized a legacy healthcare application, reduced manual operational effort, enabled scalable healthcare-SaaS workflows.',
    }),

    ...signatureProject({
      name: 'Student Loan Servicing & Enterprise Migration Platform',
      domain: 'Banking · Student Loan Servicing',
      stack: 'C# / .NET, ASP.NET, Python, SQL Server, SSIS, SSRS, AutoSys, REST APIs',
      lead: 'Enterprise student-loan servicing platform supporting borrower onboarding, co-signer workflows, promissory notes, SMS communication, and a multi-domain migration off a legacy stack.',
      content: [
        { label: 'Servicing Workflows', body: 'Student loan application processing, borrower & co-signer workflows, promissory note processing, application status tracking, SMS notifications across application milestones.' },
        { label: 'Migration & Decommission', body: 'Built a Python automation framework that covered customer, bank, phone, and email domains; reconciliation reporting against the target model; zero-surprise cutovers and post-cutover validation.' },
        { label: 'Production Support', body: 'L1 / L2 / L3 ownership of the live platform, batch-job monitoring, RCA, Splunk-based incident response, production deployments under enterprise change management.' },
      ],
      businessValue: 'Improved backend automation, supported enterprise servicing workflows, executed large-scale migration with reconciliation.',
    }),

    ...signatureProject({
      name: 'AI Voice Agent & Conversational AI Platform',
      domain: 'AI Automation · Restaurant Operations',
      stack: 'Python, FastAPI, REST APIs, Twilio, WhatsApp, Conversational AI workflows',
      lead: 'AI-powered voice agent and chatbot for restaurant ordering, integrated end-to-end with kitchen synchronization and pickup-ready notification workflows.',
      content: [
        { label: 'AI Interaction', body: 'Voice-based food ordering, conversational AI flows, AI chatbot automation, real-time customer communication.' },
        { label: 'Operations Sync', body: 'Kitchen-order synchronization, pickup-readiness notifications, automated upstream / downstream messaging.' },
      ],
      businessValue: 'Reduced manual order-taking effort, improved customer communication, streamlined restaurant operations.',
    }),
  ];
}

function technologyMatrix() {
  return [
    sectionHeader('Technology Matrix'),
    matrixTable([
      { label: 'Frontend', body: 'Angular, React 18, TypeScript, JavaScript, HTML5, CSS3, WinForms.' },
      { label: 'Backend', body: 'C# / .NET, ASP.NET, Python, FastAPI, Java.' },
      { label: 'Database & Reporting', body: 'SQL Server, PostgreSQL, T-SQL, SSIS, SSRS, query tuning & indexing.' },
      { label: 'Security', body: 'JWT, SAML, Role-Based Access Control, OAuth patterns, audit-trail design.' },
      { label: 'Batch & Automation', body: 'AutoSys, SQL Server Jobs, enterprise batch processing, scheduled reconciliation, Python automation frameworks.' },
      { label: 'Integrations', body: 'REST APIs, Twilio, WhatsApp Business API, CAQH, ABHA, OCR, EDI 834 / 820 patterns.' },
      { label: 'Cloud & Deployment', body: 'Render, Vercel, Docker, CI/CD pipelines, enterprise deployment & change management.' },
      { label: 'AI / LLM Workflow', body: 'Daily AI-assisted development with Claude, ChatGPT, and GitHub Copilot — design, code, and review.' },
    ], { zebra: true }),
    spacer(80),
  ];
}

function architectureAndOperationalExpertise() {
  return [
    sectionHeader('Architecture & Operational Expertise'),
    bullet([tr('Multi-tenant SaaS isolation: ', { bold: true }), tr('per-tenant scoping on every query, slug-based tenant URLs, JWT-bounded access, role-based admin boundaries.')]),
    bullet([tr('Modernization paths: ', { bold: true }), tr('WinForms → web SaaS, ASP.NET MVC → modern .NET, on-prem → cloud-native, monolith → service-oriented decomposition.')]),
    bullet([tr('Batch processing architecture: ', { bold: true }), tr('AutoSys job graphs, SQL Server Jobs, SSIS pipelines, idempotent re-runs, failure isolation, recovery checkpoints.')]),
    bullet([tr('Integration architecture: ', { bold: true }), tr('REST APIs with JWT / SAML, EDI 834 / 820 file processing, CAQH and ABHA integrations, third-party messaging via Twilio / WhatsApp.')]),
    bullet([tr('Compliance-driven design: ', { bold: true }), tr('audit-trail patterns, role-based access, regulated-environment workflows, deny / appeal trace, attestation tracking.')]),
    bullet([tr('Production resilience: ', { bold: true }), tr('observability via Splunk, runbook-driven incident response, RCA discipline, controlled rollout & rollback playbooks.')]),
  ];
}

function enterpriseWorkflowExpertise() {
  return [
    sectionHeader('Enterprise Workflow Expertise'),
    bullet([tr('Provider lifecycle: ', { bold: true }), tr('Submission → Provider Review → Screening → State Validation → Medicaid ID Generation → Activation; revalidation and termination loops included.')]),
    bullet([tr('Claims processing: ', { bold: true }), tr('Submission → Adjudication → Approval / Denial → Payment dependency processing; duplicate-claim handling and provider validation.')]),
    bullet([tr('Loan servicing: ', { bold: true }), tr('Application → Borrower / Co-signer onboarding → Promissory Note → Status Tracking → Servicing → Migration / Decommission.')]),
    bullet([tr('Eligibility & rules: ', { bold: true }), tr('SNAP intake → Eligibility determination via rule engine → Benefits processing → Referrals → Worker review & approval.')]),
    bullet([tr('Escrow analysis: ', { bold: true }), tr('FHA Mock / DOJ physical escrow analysis flows behind SAML / JWT secured REST APIs, with operational reporting and reconciliation.')]),
    bullet([tr('Operational pain-point understanding: ', { bold: true }), tr('why provider files get pended, why claims duplicate, why migrations stall — the kind of insight that only comes from running these systems in production.')]),
  ];
}

function healthcareOperationalExpertise() {
  return [
    sectionHeader('Healthcare Operational Expertise'),
    bullet([tr('PDMS at scale across multiple state Medicaid ecosystems (Nebraska, Washington DC).')]),
    bullet([tr('Provider Enrollment, Credentialing, Recredentialing, and Revalidation workflows end-to-end.')]),
    bullet([tr('MMIS workflows — provider, claims, eligibility, and HCBS-specific paths.')]),
    bullet([tr('CAQH integration: profile sync, credential retrieval, demographic validation, attestation tracking.')]),
    bullet([tr('Provider screening — annual, license, owner, site visit, background verification.')]),
    bullet([tr('State denial & appeal flows, provider termination & disenrollment lifecycle.')]),
    bullet([tr('Hospital management — OPD / IPD, billing, lab, pharmacy, inventory, ABHA integration.')]),
    bullet([tr('Multi-tenant healthcare SaaS — multi-clinic onboarding, per-tenant config, RBAC, slug-based isolation.')]),
  ];
}

function bankingOperationalExpertise() {
  return [
    sectionHeader('Banking Operational Expertise'),
    bullet([tr('Student Loan Servicing — borrower & co-signer workflows, promissory notes, application status, SMS communication.')]),
    bullet([tr('Mortgage Escrow Analysis — FHA Mock / DOJ flows under SAML auth, JWT-secured REST APIs, role-based access.')]),
    bullet([tr('Backend financial workflows — reconciliation reporting, payment-dependent processing, operational visibility.')]),
    bullet([tr('Enterprise migration & decommission — multi-domain (customer, bank, phone, email), Python automation framework, reconciliation discipline.')]),
    bullet([tr('Production servicing — L1 / L2 / L3 support, batch-job monitoring, RCA, controlled production deployments.')]),
  ];
}

function aiAndAutomationExpertise() {
  return [
    sectionHeader('AI & Automation Expertise'),
    bullet([tr('AI voice agents on FastAPI + Twilio + WhatsApp for ordering automation.')]),
    bullet([tr('Conversational AI workflow design — chatbot automation, real-time customer messaging, intent routing.')]),
    bullet([tr('Notification automation — SMS / WhatsApp reminders, appointment notifications, application-status alerts.')]),
    bullet([tr('OCR-based document extraction for healthcare onboarding workflows.')]),
    bullet([tr('AI-assisted development workflow — Claude, ChatGPT, GitHub Copilot used daily across design, code, and review.')]),
    bullet([tr('LLM-augmented productivity — schema design, query refinement, refactor proposals, test scaffolding.')]),
  ];
}

function productionSupportExperience() {
  return [
    sectionHeader('Production Support Experience'),
    bullet([tr('L1 — ', { bold: true }), tr('incident triage, ticket review, first-line operational response, customer-impact assessment.')]),
    bullet([tr('L2 — ', { bold: true }), tr('investigation, log analysis, root-cause identification, coordination with development for fixes.')]),
    bullet([tr('L3 — ', { bold: true }), tr('deep diagnostic work, batch-job failure resolution, code-level fixes under enterprise change discipline.')]),
    bullet([tr('Splunk-based observability — query design, dashboard ownership, alert tuning.')]),
    bullet([tr('Batch-job monitoring & recovery — AutoSys, SQL Server Jobs, idempotent re-runs.')]),
    bullet([tr('Runbook authoring and on-call rotation experience across multiple enterprise platforms.')]),
  ];
}

function enterpriseModernizationExperience() {
  return [
    sectionHeader('Enterprise Modernization Experience'),
    bullet([tr('WinForms → web-based healthcare SaaS — full architectural refresh with multi-tenant primitives.')]),
    bullet([tr('Legacy ASP.NET MVC → modern .NET — incremental migration, parallel-run validation, controlled cutover.')]),
    bullet([tr('On-prem → cloud (Render, Vercel) — deployment automation, environment parity, secret management.')]),
    bullet([tr('Post-merger consolidation — Python migration framework covering customer / bank / phone / email domains, reconciliation discipline, zero-downtime cutovers.')]),
    bullet([tr('Legacy decommissioning — data migration, employee / phone / address / email re-routing, decommission verification.')]),
    bullet([tr('Architecture refresh — REST APIs, JWT / SAML auth, RBAC primitives, audit-trail patterns layered onto pre-modern systems.')]),
  ];
}

function businessImpact() {
  return [
    sectionHeader('Business Impact'),
    bullet([tr('Modernized a legacy WinForms hospital application into a scalable multi-tenant healthcare SaaS — reduced manual operational effort across OPD / IPD, billing, and pharmacy flows.')]),
    bullet([tr('Improved provider workflow visibility across state Medicaid PDMS engagements, reducing operational processing delays for enrollment, credentialing, and revalidation queues.')]),
    bullet([tr('Delivered enterprise data migrations with reconciliation reporting and controlled cutovers — Discover → CapitalOne customer / bank / phone / email domains via a reusable Python automation framework.')]),
    bullet([tr('Supported high-volume eligibility and case-management workflows in government benefits (SNAP) with rule-driven processing and worker task management.')]),
    bullet([tr('Enabled AI-driven customer communication — voice agents, conversational AI, automated reminders — reducing manual effort and improving response time across healthcare and hospitality use cases.')]),
    bullet([tr('Established production-grade observability and L1 / L2 / L3 incident response across multiple enterprise platforms, with documented runbooks and controlled deployment discipline.')]),
  ];
}

// ─── Document assembly ───────────────────────────────────────────────────────

export function buildDocument() {
  const children = [
    headerBlock(),
    accentRule(),
    ...executiveSummary(),
    ...capabilityMatrix(),
    ...domainExpertise(),
    ...signatureProjects(),
    ...technologyMatrix(),
    ...architectureAndOperationalExpertise(),
    ...enterpriseWorkflowExpertise(),
    ...healthcareOperationalExpertise(),
    ...bankingOperationalExpertise(),
    ...aiAndAutomationExpertise(),
    ...productionSupportExperience(),
    ...enterpriseModernizationExperience(),
    ...businessImpact(),
  ];

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
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 720, right: 1080, bottom: 720, left: 1080 },
        },
      },
      children,
    }],
  });
}

export const meta = {
  id: 'enterprise-master-profile',
  name: 'Enterprise Master Profile',
  description: 'Comprehensive consultant profile spanning Healthcare, Banking, AI Automation, and SaaS Modernization. Use for senior contract / consulting engagements where breadth and operational depth matter more than a 2-page submission.',
  filename: 'Jayshri-Dalvi-Enterprise-Master-Profile.docx',
  publicFilename: 'Jayshri-Dalvi-Enterprise-Master-Profile.docx',
};

export default buildDocument;
