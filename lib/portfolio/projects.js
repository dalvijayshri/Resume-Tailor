// lib/portfolio/projects.js
//
// Data for the /portfolio enterprise mockups. Each project gets a
// consistent shape so the renderer can stay generic:
//
//   id, name, shortName, domain, tagline, stack[], primaryColor,
//   metrics[]    — 4 KPI tiles (label, value, delta, good)
//   queue        — { title, columns[], rows[] }
//   activity[]   — operational feed (time, text)
//   architecture — { layers[] (name, tech), integrations[] (optional) }
//   features[]   — 3-4 bullet highlights for the proposal-style summary

export const projects = [
  {
    id: 'pdms',
    name: 'Provider Data Management System (PDMS)',
    shortName: 'PDMS',
    domain: 'Healthcare · Medicaid',
    tagline: 'Multi-state provider lifecycle, credentialing & screening platform',
    stack: ['C# / .NET', 'ASP.NET', 'SQL Server', 'T-SQL', 'SSIS', 'SSRS', 'REST APIs'],
    primaryColor: '#1F4E79',
    metrics: [
      { label: 'Active Providers',     value: '18,402', delta: '+ 132 this week',     good: true  },
      { label: 'Pending Enrollment',   value: '267',    delta: 'Avg 3.2 days open',   good: false },
      { label: 'Revalidations Due',    value: '88',     delta: 'Next 30 days',        good: false },
      { label: 'Screening Pass Rate',  value: '94.6%',  delta: '+ 0.8% MoM',          good: true  },
    ],
    queue: {
      title: 'Provider Enrollment Queue',
      columns: ['NPI', 'Provider', 'Type', 'State', 'Stage', 'Days Open', 'Owner'],
      rows: [
        ['1881824721', 'Marquez Family Medicine', 'Group',     'NE', 'CAQH Attestation', '2', 'L. Patel'],
        ['1457293841', 'Dr. Hyun Kim, MD',         'Individual','DC', 'License Screening', '4', 'L. Patel'],
        ['1326758140', 'Cornerstone Therapy LLC',  'Group',     'NE', 'Site Visit',       '6', 'A. Rao'],
        ['1990038211', 'Dr. Ana Sosa, DO',         'Individual','NE', 'Owner Screening',  '1', 'A. Rao'],
        ['1672394810', 'Riverside Pediatrics',     'Group',     'DC', 'State Validation', '7', 'M. Chen'],
      ],
    },
    activity: [
      { time: '12:48', text: 'CAQH attestation refreshed for NPI 1881824721' },
      { time: '11:22', text: 'Medicaid ID generated for Dr. Marquez (NE)' },
      { time: '10:05', text: 'Site-visit completed for Cornerstone Therapy LLC' },
      { time: '09:31', text: 'Revalidation notice batch — 88 letters queued' },
      { time: '08:58', text: 'State denial received: NPI 1226453910 — appeal opened' },
    ],
    architecture: {
      layers: [
        { name: 'Provider & Operator Portal',     tech: 'Angular · TypeScript · JWT' },
        { name: 'Provider Services API',          tech: 'C# / .NET · ASP.NET · REST' },
        { name: 'Workflow & Rules Engine',        tech: 'Enrollment · Credentialing · Audit Trail' },
        { name: 'Data Layer',                     tech: 'SQL Server · T-SQL · Stored Procedures' },
        { name: 'External Integrations',          tech: 'CAQH · NPPES · State MMIS · License Boards' },
        { name: 'Batch, Notification & Reporting',tech: 'SQL Server Jobs · SSIS · SSRS · AutoSys' },
      ],
    },
    features: [
      'Multi-state support (NE, DC) with state-specific screening rule sets',
      'CAQH integration for attestation, demographic, and license sync',
      'Provider lifecycle: enrollment → screening → revalidation → termination, fully audited',
      'Batch generation of Medicaid IDs, revalidation notices, and SSRS operational reports',
    ],
  },

  {
    id: 'credentialing',
    name: 'Provider Enrollment & Credentialing Platform',
    shortName: 'Credentialing',
    domain: 'Healthcare · Credentialing Operations',
    tagline: 'Application intake, primary-source verification, and committee workflow',
    stack: ['C# / .NET', 'ASP.NET', 'SQL Server', 'SSIS', 'SSRS', 'REST APIs'],
    primaryColor: '#0F766E',
    metrics: [
      { label: 'Applications In-Flight', value: '412',    delta: 'Across 6 networks',  good: false },
      { label: 'Avg Time-to-Decision',   value: '14 days',delta: '- 3 days QoQ',       good: true  },
      { label: 'Recredentialing Due',    value: '63',     delta: 'Next 60 days',       good: false },
      { label: 'Source-Verified',        value: '99.2%',  delta: 'Primary-source rate',good: true  },
    ],
    queue: {
      title: 'Credentialing Committee Queue',
      columns: ['App #', 'Provider', 'Specialty', 'Stage', 'PSV Status', 'SLA', 'Reviewer'],
      rows: [
        ['CR-24891', 'Dr. Priya Anand, MD',      'Internal Medicine', 'PSV Complete',  '✓ NPDB · ✓ Board · ✓ License', 'On Track', 'R. Vega'],
        ['CR-24906', 'Dr. James Otieno, DPT',    'Physical Therapy',  'License Pending','⏳ State Board',                'At Risk',  'R. Vega'],
        ['CR-24912', 'Dr. Lin Wei, MD',          'Cardiology',        'Committee Ready','✓ All sources',                'On Track', 'S. Kim'],
        ['CR-24917', 'Dr. Tomas Reyes, DO',      'Family Medicine',   'Recredentialing','✓ Attestation refreshed',      'On Track', 'S. Kim'],
        ['CR-24922', 'Dr. Naomi Park, PsyD',     'Behavioral Health', 'Insurance Verif','⏳ COI received',                'On Track', 'J. Owens'],
      ],
    },
    activity: [
      { time: '13:14', text: 'NPDB query returned clean for CR-24891' },
      { time: '12:48', text: 'Committee meeting packet generated (8 files)' },
      { time: '11:30', text: 'COI uploaded for CR-24922 — auto-validated' },
      { time: '10:51', text: 'Attestation refresh nudge sent to 23 providers' },
      { time: '09:18', text: 'License expiration warning queued: 4 providers' },
    ],
    architecture: {
      layers: [
        { name: 'Credentialing Operator Portal',  tech: 'Angular · TypeScript · RBAC' },
        { name: 'Credentialing Services API',     tech: 'ASP.NET · REST · JWT' },
        { name: 'Primary-Source Verification',    tech: 'NPDB · State Boards · DEA · License Sources' },
        { name: 'Committee Workflow',             tech: 'Queue · Scoring · Decisioning · Audit' },
        { name: 'Data Layer',                     tech: 'SQL Server · Encrypted PII · Retention Policies' },
        { name: 'Notifications & Reporting',      tech: 'SSIS · SSRS · Email/SMS Triggers' },
      ],
    },
    features: [
      'Primary-source verification flow with NPDB, board, license, DEA, and education sources',
      'Committee-ready packet generation — single click, audit-stamped',
      'Recredentialing automation with attestation refresh nudges and SLA tracking',
      'Encrypted PII at rest, role-based access, full immutable audit trail',
    ],
  },

  {
    id: 'mmis',
    name: 'MMIS Claims Processing System',
    shortName: 'MMIS Claims',
    domain: 'Healthcare · Medicaid · Enterprise',
    tagline: 'Enterprise claims adjudication and payment processing',
    stack: ['C# / .NET', 'ASP.NET', 'SQL Server', 'T-SQL', 'Facets', 'REST APIs'],
    primaryColor: '#7C3AED',
    metrics: [
      { label: 'Claims Today',          value: '142,378', delta: '+ 8% vs last Mon',   good: true  },
      { label: 'Auto-Adjudication',     value: '87.4%',   delta: '+ 1.2% MoM',         good: true  },
      { label: 'Pended for Review',     value: '4,802',   delta: 'Avg 2.4 hrs in queue',good: false },
      { label: 'Denial Rate',           value: '6.1%',    delta: '- 0.3% MoM',         good: true  },
    ],
    queue: {
      title: 'Pended Claims Review Queue',
      columns: ['Claim #', 'Member', 'Provider', 'Reason', 'Amount', 'Aging', 'Owner'],
      rows: [
        ['CLM-880214', 'MEMBER-44218',   'Mercy Hospital',     'Duplicate suspect',     '$2,140.00', '2h 14m', 'D. Hall'],
        ['CLM-880231', 'MEMBER-91044',   'Westside Pediatrics','Eligibility pending',   '$486.50',   '1h 09m', 'D. Hall'],
        ['CLM-880259', 'MEMBER-30922',   'Dr. Lin Wei',        'Provider not enrolled', '$1,825.00', '4h 32m', 'T. Singh'],
        ['CLM-880263', 'MEMBER-17751',   'Cornerstone Therapy','COB mismatch',          '$320.00',   '3h 08m', 'T. Singh'],
        ['CLM-880278', 'MEMBER-22018',   'Riverside Imaging',  'Auth required',         '$3,950.00', '5h 22m', 'M. Cole'],
      ],
    },
    activity: [
      { time: '13:32', text: 'Daily auto-adjudication batch complete: 124,310 claims' },
      { time: '13:14', text: 'COB reconciliation against secondary payer — 902 cleared' },
      { time: '12:48', text: 'Duplicate-claim rule fired: CLM-880214 flagged' },
      { time: '11:55', text: 'Provider eligibility refresh from PDMS (delta 18 NPIs)' },
      { time: '10:22', text: 'Payment cycle confirmed — $14.2M dispatched to ACH' },
    ],
    architecture: {
      layers: [
        { name: 'Claims Operator Console',        tech: 'Angular · TypeScript · Queue UI' },
        { name: 'Claims Processing API',          tech: 'C# / .NET · ASP.NET · REST' },
        { name: 'Adjudication & Rules Engine',    tech: 'Facets · Custom rules · Override audit' },
        { name: 'Eligibility & Provider Lookup',  tech: 'PDMS · Member services · COB' },
        { name: 'Data Layer',                     tech: 'SQL Server · Partitioned tables' },
        { name: 'Payment & Reporting',            tech: 'EFT / ACH · SSRS · Audit pack' },
      ],
    },
    features: [
      'High-volume daily adjudication (140K+ claims/day) with sub-hour batch SLA',
      'Pended-claim queue with reason-code routing and SLA-aware aging',
      'Real-time eligibility and provider-enrollment validation against PDMS',
      'Payment cycle audit trail and SSRS reporting for finance and compliance',
    ],
  },

  {
    id: 'hospital',
    name: 'Hospital Management SaaS Platform',
    shortName: 'Hospital SaaS',
    domain: 'Healthcare · Multi-Tenant SaaS',
    tagline: 'Multi-clinic OPD/IPD, billing, pharmacy, and patient communication',
    stack: ['React 18', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Twilio', 'WhatsApp', 'Vercel', 'Render'],
    primaryColor: '#0EA5E9',
    metrics: [
      { label: 'Active Clinics',        value: '47',     delta: '+ 4 this month',     good: true  },
      { label: 'Appointments Today',    value: '1,238',  delta: 'Across all tenants', good: true  },
      { label: 'Pharmacy SLA',          value: '4.6 min',delta: 'Median fulfillment', good: true  },
      { label: 'No-Show Rate',          value: '7.2%',   delta: '- 1.1% with reminders',good: true},
    ],
    queue: {
      title: 'Live Clinic Operations — Mercy Care, Pune (Tenant 04)',
      columns: ['Time', 'Patient', 'Type', 'Doctor', 'Status', 'Insurance', 'Room'],
      rows: [
        ['09:00', 'Anita Sharma',     'OPD',   'Dr. Karthik',  'Checked-In', 'CGHS · Verified', 'OPD-3'],
        ['09:15', 'Rohit Bhosle',     'OPD',   'Dr. Rao',      'In Consult', 'Self-Pay',         'OPD-1'],
        ['09:30', 'Sneha Patil',      'ANC',   'Dr. Joshi',    'Vitals Done','Maternity Plan',   'OPD-4'],
        ['10:00', 'Ravi Mehta',       'IPD',   'Dr. Karthik',  'Admitted',   'Star Health',      'Ward-2A'],
        ['10:15', 'Sara Khan',        'Lab',   '—',            'Sample Drawn','Self-Pay',        'Lab-1'],
      ],
    },
    activity: [
      { time: '09:42', text: 'WhatsApp reminder sent: 14 patients · tomorrow 09:00 slot' },
      { time: '09:18', text: 'Prescription generated in 4.1s — Dr. Rao → Rohit Bhosle' },
      { time: '08:56', text: 'New clinic onboarded: Lakeside Wellness (Tenant 47)' },
      { time: '08:31', text: 'ABHA ID linked for 6 walk-in registrations' },
      { time: '08:02', text: 'Inventory low: Amoxicillin 500mg (Mercy Care, Pune)' },
    ],
    architecture: {
      layers: [
        { name: 'Tenant Web App',                 tech: 'React 18 · TypeScript · Ant Design (Vercel)' },
        { name: 'Tenant-Aware API',               tech: 'FastAPI · SQLAlchemy · JWT (Render)' },
        { name: 'Multi-Tenant Isolation',         tech: 'Row-level scoping · Slug-based tenant URLs · RBAC' },
        { name: 'Data Layer',                     tech: 'PostgreSQL · Redis cache · S3 attachments' },
        { name: 'Patient Communication',          tech: 'Twilio SMS · WhatsApp Business · OCR' },
        { name: 'Integrations & Identity',        tech: 'ABHA · Google Maps · Payment gateway' },
      ],
    },
    features: [
      'Multi-tenant by design — each clinic gets isolated data, branding, and RBAC',
      'Sub-5-second prescription generation as the headline product promise',
      'WhatsApp + SMS patient communication, ABHA-ready identity flow',
      'Public booking with real-time slot validation, senior-priority, holiday blocking',
    ],
  },

  {
    id: 'studentloan',
    name: 'Student Loan Servicing Platform',
    shortName: 'Student Loan',
    domain: 'Banking · Loan Servicing',
    tagline: 'Borrower / co-signer workflow, promissory notes, migration',
    stack: ['C# / .NET', 'ASP.NET', 'Python', 'SQL Server', 'SSIS', 'AutoSys', 'REST APIs'],
    primaryColor: '#B45309',
    metrics: [
      { label: 'Loans In Servicing',    value: '286,140',delta: 'Active portfolio',   good: true  },
      { label: 'Apps Today',            value: '912',    delta: '+ 14% WoW',          good: true  },
      { label: 'Promissory Note Sign-Off', value: '88.4%',delta: '7-day completion', good: true  },
      { label: 'Migration Reconciled',  value: '99.97%', delta: 'Customer domain',    good: true  },
    ],
    queue: {
      title: 'Application Processing Queue',
      columns: ['App #', 'Borrower', 'Co-Signer', 'Stage', 'Amount', 'SLA', 'Owner'],
      rows: [
        ['LN-90218', 'Maria Lopez',      '✓ Linked',           'Promissory Note',    '$24,500', '2 days', 'L. Wright'],
        ['LN-90234', 'Daniel Park',      '⏳ Invite sent',      'Co-Signer Pending',  '$18,000', '4 days', 'L. Wright'],
        ['LN-90249', 'Aisha Hassan',     '✓ Linked',           'Credit Check',       '$32,000', '1 day',  'P. Singh'],
        ['LN-90262', 'Ethan O\'Brien',   'N/A',                'Application Review', '$15,500', '3 days', 'P. Singh'],
        ['LN-90278', 'Sofia Garcia',     '✓ Linked',           'Disbursement Ready', '$28,000', 'Today',  'M. Lee'],
      ],
    },
    activity: [
      { time: '13:25', text: 'AutoSys nightly batch complete — 4,810 status notifications' },
      { time: '12:48', text: 'Promissory note signed: LN-90218 → disbursement queue' },
      { time: '11:22', text: 'Migration cohort 12 reconciled: phone domain · 99.99%' },
      { time: '10:08', text: 'SMS sent: 312 borrowers · status change → "Approved"' },
      { time: '09:14', text: 'L2 ticket resolved: AutoSys job DISB-04 backlog cleared' },
    ],
    architecture: {
      layers: [
        { name: 'Borrower & Servicing Portal',    tech: 'ASP.NET · Angular · JWT' },
        { name: 'Servicing API',                  tech: 'C# / .NET · REST · Auth' },
        { name: 'Application & Status Engine',    tech: 'Credit · Underwriting · Promissory Notes' },
        { name: 'Data Layer',                     tech: 'SQL Server · Encrypted PII' },
        { name: 'Migration & Reconciliation',     tech: 'Python framework · Oracle source · CapitalOne target' },
        { name: 'Batch, SMS & Reporting',         tech: 'AutoSys · SSIS · SSRS · Twilio' },
      ],
    },
    features: [
      'Borrower + co-signer linkage, promissory notes, status-driven SMS',
      'Python migration framework — customer / bank / phone / email domains',
      'AutoSys batch orchestration with idempotent re-runs and L2/L3 support',
      'Full SSRS operational reporting and audit pack for compliance',
    ],
  },

  {
    id: 'mortgage',
    name: 'Mortgage Escrow Analysis Platform',
    shortName: 'Mortgage Escrow',
    domain: 'Banking · Mortgage Servicing',
    tagline: 'FHA / DOJ escrow analysis with SAML-secured enterprise access',
    stack: ['Java', 'C# / .NET', 'ASP.NET', 'SQL Server', 'REST APIs', 'JWT', 'SAML'],
    primaryColor: '#0F4C75',
    metrics: [
      { label: 'Loans Under Analysis', value: '92,310', delta: 'Active portfolio',   good: true  },
      { label: 'Escrow Shortages',     value: '4,210',  delta: 'Avg $1,243',         good: false },
      { label: 'FHA Mock Cases',       value: '128',    delta: 'This cycle',         good: true  },
      { label: 'Recurring Audit Pass', value: '100%',   delta: 'Last 4 quarters',    good: true  },
    ],
    queue: {
      title: 'Escrow Analysis Workload',
      columns: ['Loan #', 'Borrower', 'Type', 'Status', 'Variance', 'Cycle', 'Owner'],
      rows: [
        ['ML-44820', 'Carla Mendoza',    'FHA Mock',     'In Analysis', '+ $182.40',  'Apr 2026', 'R. Hayes'],
        ['ML-44833', 'Mehmet Yilmaz',    'DOJ Physical', 'Variance Hold','- $1,108.20','Apr 2026', 'R. Hayes'],
        ['ML-44848', 'Linda Petersen',   'Standard',     'Statement Sent','+ $14.00', 'Apr 2026', 'J. Patel'],
        ['ML-44857', 'Devin Hughes',     'FHA Mock',     'Customer Inquiry','- $402.00','Apr 2026', 'J. Patel'],
        ['ML-44869', 'Esme Allard',      'Standard',     'Approved',    '+ $0.00',    'Apr 2026', 'M. Sun'],
      ],
    },
    activity: [
      { time: '13:55', text: 'FHA Mock cycle exported to SSRS audit pack' },
      { time: '12:41', text: 'SAML SSO test → success: secondary IdP healthy' },
      { time: '11:18', text: 'Borrower notified: ML-44857 inquiry response sent' },
      { time: '10:09', text: 'DOJ Physical case ML-44833 escalated to L2 review' },
      { time: '09:02', text: 'Daily reconciliation: 92,310 loans, 4,210 variances tagged' },
    ],
    architecture: {
      layers: [
        { name: 'Servicing Operator Console',     tech: 'Angular · TypeScript · SAML SSO' },
        { name: 'Escrow Services API',            tech: 'Core Java · Spring · REST + JWT' },
        { name: 'Analysis Engine',                tech: 'FHA Mock · DOJ Physical · Variance rules' },
        { name: 'Data Layer',                     tech: 'SQL Server · Oracle PL/SQL · Stored Procs' },
        { name: 'Integrations',                   tech: 'Tax · Insurance · Disbursement systems' },
        { name: 'Reporting & Audit',              tech: 'SSRS · Splunk · Audit retention' },
      ],
    },
    features: [
      'FHA Mock and DOJ Physical escrow analysis flows under SAML / JWT',
      'Variance-driven workload queue with cycle-aware aging and SLA tracking',
      'Borrower communication, audit-stamped statements, and customer inquiry flow',
      'Recurring audit pack via SSRS with 100% pass rate over last 4 quarters',
    ],
  },

  {
    id: 'voiceagent',
    name: 'AI Voice Agent — Restaurant Automation',
    shortName: 'Voice Agent',
    domain: 'AI Automation · Restaurant Operations',
    tagline: 'Conversational voice + chat ordering with kitchen sync',
    stack: ['Python', 'FastAPI', 'Twilio', 'WhatsApp Business', 'Conversational AI', 'PostgreSQL'],
    primaryColor: '#16A34A',
    metrics: [
      { label: 'Orders Today',          value: '1,184', delta: 'Voice · WhatsApp · Web', good: true  },
      { label: 'AI Containment',        value: '91.2%', delta: 'No human handoff',     good: true  },
      { label: 'Avg Order Time',        value: '2m 14s',delta: 'Voice → kitchen',      good: true  },
      { label: 'Pickup Notif. Sent',    value: '1,032', delta: 'WhatsApp · Twilio SMS',good: true  },
    ],
    queue: {
      title: 'Live Orders — Bella Verde, Austin',
      columns: ['Order #', 'Channel', 'Items', 'Customer', 'Stage', 'Kitchen ETA', 'Status'],
      rows: [
        ['ORD-2841', 'Voice (Twilio)',    '2x Margherita · 1x Tiramisu', 'Mark T.',  'Cooking',  '7 min', 'On Track'],
        ['ORD-2842', 'WhatsApp',           '1x Carbonara · 1x Bruschetta','Aisha R.', 'Plating',  '2 min', 'On Track'],
        ['ORD-2843', 'Voice (Twilio)',    '3x Pepperoni',                 'Jordan K.','Queued',   '12 min','At Risk'],
        ['ORD-2844', 'Web',                '1x Caesar · 1x Lasagna',      'Sarah V.', 'Cooking',  '5 min', 'On Track'],
        ['ORD-2845', 'WhatsApp',           '2x Tiramisu',                  'Devon H.', 'Pickup',   'Now',   'Ready'],
      ],
    },
    activity: [
      { time: '13:48', text: 'Pickup notification sent: ORD-2845 → Devon H. (WhatsApp)' },
      { time: '13:32', text: 'AI containment success: ORD-2843 — 0 human turns' },
      { time: '12:55', text: 'Kitchen overload signal — voice agent throttled to "12 min" ETA' },
      { time: '12:14', text: 'New venue onboarded: Bella Verde Westside (slug: bv-west)' },
      { time: '11:42', text: 'Conversation log archived: 184 turns, 0 PII flags' },
    ],
    architecture: {
      layers: [
        { name: 'Customer Channels',              tech: 'Twilio Voice · WhatsApp Business · Web Order Page' },
        { name: 'Conversational AI Layer',        tech: 'NLU · Intent routing · Dialogue policy · Fallback' },
        { name: 'Orchestration API',              tech: 'FastAPI · Python · REST · Async tasks' },
        { name: 'Restaurant Backend',             tech: 'Order model · Menu · Pricing · POS sync' },
        { name: 'Kitchen Display Sync',           tech: 'WebSocket · ETA recompute · Priority queue' },
        { name: 'Notifications & Data',           tech: 'Twilio SMS · WhatsApp callbacks · PostgreSQL' },
      ],
    },
    features: [
      'Voice + WhatsApp + Web ordering, single canonical order model',
      'AI containment metric (91%+) reducing manual order-taking effort',
      'Kitchen sync with live ETA recompute under load',
      'Multi-venue onboarding via tenant slug, isolated menus and PII',
    ],
  },

  {
    id: 'snap',
    name: 'SNAP & Case Management Platform',
    shortName: 'SNAP / Case Mgmt',
    domain: 'Government Benefits · Social Services',
    tagline: 'Eligibility rule engine, intake, referrals, and case worker tasks',
    stack: ['C# / .NET', 'ASP.NET', 'SQL Server', 'SSIS', 'SSRS', 'SQL Server Jobs'],
    primaryColor: '#9333EA',
    metrics: [
      { label: 'Cases Open',            value: '38,210', delta: 'Across 12 counties', good: true  },
      { label: 'Eligibility Decisions', value: '4,118', delta: 'Today',               good: true  },
      { label: 'Avg Decision Time',     value: '38 min',delta: '- 12 min QoQ',        good: true  },
      { label: 'Referrals Sent',        value: '986',   delta: 'Today',               good: true  },
    ],
    queue: {
      title: 'Case Worker Task Queue',
      columns: ['Case #', 'Household', 'Stage', 'Rule Outcome', 'Aging', 'Worker', 'Priority'],
      rows: [
        ['CS-72018', 'Williams family (4)',  'Intake Review',    '— pending',           '1 day',  'K. Bell',   'Normal'],
        ['CS-72031', 'Patel household (3)',  'Eligibility',      'Approved',            '2 days', 'K. Bell',   'Normal'],
        ['CS-72047', 'Rivera family (5)',    'Recertification',  'Income variance',     '4 days', 'D. Cole',   'High'],
        ['CS-72061', 'O\'Neil (1)',          'Referral Pending', 'WIC referral sent',   '1 day',  'D. Cole',   'Normal'],
        ['CS-72078', 'Khan household (2)',   'Review Required',  'Address validation',  '3 days', 'A. Singh',  'High'],
      ],
    },
    activity: [
      { time: '14:02', text: 'Rule engine recompute: 4,118 decisions in 38 min' },
      { time: '13:08', text: 'Referral to WIC dispatched for CS-72061' },
      { time: '12:31', text: 'Income-variance rule fired: CS-72047 routed to supervisor' },
      { time: '11:18', text: 'SSRS county dashboard refreshed — 12 counties live' },
      { time: '10:02', text: 'New intake batch: 218 applications via web portal' },
    ],
    architecture: {
      layers: [
        { name: 'Case Worker Console',            tech: 'ASP.NET MVC · Angular · RBAC' },
        { name: 'Intake & Eligibility API',       tech: 'C# / .NET · REST · JWT' },
        { name: 'Eligibility Rule Engine',        tech: 'Rule sets · Decision audit · Versioning' },
        { name: 'Referral Workflow',              tech: 'WIC · TANF · Medicaid handoff' },
        { name: 'Data Layer',                     tech: 'SQL Server · PII encryption · Retention' },
        { name: 'Reporting & Batch',              tech: 'SSIS · SSRS · SQL Server Jobs' },
      ],
    },
    features: [
      'Versioned eligibility rule engine with decision audit per case',
      'Case worker task queue, priority-aware, with recertification cycles',
      'Cross-program referrals (WIC, TANF, Medicaid) with confirmation receipt',
      'County-level SSRS dashboards for supervisors and compliance',
    ],
  },

  {
    id: 'realestate',
    name: 'Real Estate Workflow Platform',
    shortName: 'Real Estate',
    domain: 'Real Estate · Transaction Operations',
    tagline: 'Listing, offer, negotiation, mortgage coordination, closing',
    stack: ['React 18', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Twilio'],
    primaryColor: '#DC2626',
    metrics: [
      { label: 'Active Listings',       value: '184',    delta: '+ 12 this week',     good: true  },
      { label: 'Pending Offers',        value: '42',     delta: '7 above ask',        good: true  },
      { label: 'Avg Days to Close',     value: '34',     delta: '- 4 vs last quarter',good: true  },
      { label: 'Client NPS',            value: '74',     delta: '+ 6 YoY',            good: true  },
    ],
    queue: {
      title: 'Active Transaction Pipeline',
      columns: ['Property', 'Buyer', 'Stage', 'Offer', 'Mortgage', 'Close Date', 'Owner'],
      rows: [
        ['1842 Oak Ridge Dr',  'Patel family',     'Under Contract',   '$485,000', 'Conditional Approval', 'May 30',  'J. Dalvi'],
        ['96 Westwind Ln',     'Carter household', 'Inspection',       '$612,500', 'Pre-Approved',         'Jun 6',   'J. Dalvi'],
        ['415 Marlowe Ct',     'Rivera couple',    'Offer Submitted',  '$369,000', 'TBD',                  'Pending', 'J. Dalvi'],
        ['2207 Birchwood',     'Singh family',     'Closing Scheduled','$725,000', 'Locked 6.4%',          'May 24',  'J. Dalvi'],
        ['78 Eastbrook Way',   'Owens (1)',        'Listed',           '—',        '—',                     'New',    'J. Dalvi'],
      ],
    },
    activity: [
      { time: '14:18', text: 'Inspection report uploaded: 96 Westwind Ln' },
      { time: '13:42', text: 'Mortgage broker callback scheduled: Rivera couple, Thu 11am' },
      { time: '12:14', text: 'Offer submitted: 1842 Oak Ridge Dr — $485,000 (ask $479,000)' },
      { time: '11:08', text: 'SMS dispatched: 9 clients — open house Sat 10am' },
      { time: '09:52', text: 'New listing added: 78 Eastbrook Way — $399,500' },
    ],
    architecture: {
      layers: [
        { name: 'Agent & Client Portal',          tech: 'React 18 · TypeScript · Mobile-first' },
        { name: 'Transactions API',               tech: 'FastAPI · Python · REST + JWT' },
        { name: 'Workflow & Document Engine',     tech: 'Listing → Offer → Contract → Close · E-sign' },
        { name: 'Data Layer',                     tech: 'PostgreSQL · Document storage' },
        { name: 'Communication',                  tech: 'Twilio SMS · Email · Calendar sync' },
        { name: 'Integrations',                   tech: 'MLS · Mortgage broker · Title · Inspection' },
      ],
    },
    features: [
      'Listing → offer → contract → close transaction pipeline with stage-aware views',
      'Mortgage coordination with broker callbacks and pre-approval tracking',
      'Client and agent communication via SMS, email, and calendar sync',
      'Realistic of the real-estate operational pain points — built by an active realtor',
    ],
  },
];

export default projects;
