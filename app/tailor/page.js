'use client';

import { useEffect, useRef, useState } from 'react';

// On mount we auto-load this file from /downloads/ so the textarea is
// pre-filled with the candidate's canonical resume. Generated at build
// time by scripts/prebuild.mjs from the v3-elixax-last builder.
const DEFAULT_RESUME_URL = '/downloads/Jayshri_Dalvi_Resume_Original.docx';
const DEFAULT_RESUME_FILENAME = 'Jayshri_Dalvi_Resume_Original.docx';

const PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'upwork', label: 'Upwork' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'hubstaff', label: 'Hubstaff' },
  { value: 'other', label: 'Other' },
];

// Tab catalog. The "resume" tab is swapped for "proposal-doc" in agency mode.
const TABS_INDIVIDUAL = [
  { id: 'match', label: 'Match Analysis' },
  { id: 'resume', label: 'Tailored Resume' },
  { id: 'proposal', label: 'Proposal / Message' },
  { id: 'interview', label: 'Interview Prep' },
];

const TABS_AGENCY = [
  { id: 'match', label: 'Match Analysis' },
  { id: 'proposal-doc', label: 'Agency Proposal' },
  { id: 'proposal', label: 'Proposal / Message' },
  { id: 'interview', label: 'Discovery Prep' },
];

const SAMPLE_RESUME_PLACEHOLDER =
  '(Paste your latest resume here. You can copy text from any of the downloads on the home page — open .docx in Word, select all, copy.)';

// Seed template for the agency-profile textarea. Replaces resume content when
// the user first switches to Agency mode.
const AGENCY_PROFILE_TEMPLATE = `Agency Name: [Your Agency Name]
Tagline: [e.g. Full-stack engineering for fintech & healthcare]
Headquarters / Timezone: [City, Country · TZ]
Founded: [Year]
Team Size: [e.g. 12 engineers + 2 PMs + 1 designer]

== Services ==
- [Service line 1 — e.g. .NET / Java backend platform builds]
- [Service line 2 — e.g. React / Next.js frontend & design system]
- [Service line 3 — e.g. Data engineering on SQL Server, Postgres, Snowflake]
- [Service line 4 — e.g. AI / LLM integration and RAG pipelines]

== Core Stack ==
Languages: [C# / .NET, Java / Spring Boot, Python, TypeScript]
Frontend: [React, Angular, Next.js, Ant Design]
Data: [SQL Server, Oracle, PostgreSQL, MySQL]
Cloud / DevOps: [Azure, AWS, GitHub Actions, Docker, Jenkins]

== Case Studies ==
1. [Client / industry] — [Outcome in one sentence. e.g. "Migrated a 50M-row banking ledger from Oracle to SQL Server with zero downtime over a 6-week engagement."]
2. [Client / industry] — [Outcome in one sentence.]
3. [Client / industry] — [Outcome in one sentence.]

== Engagement Models ==
- Fixed-price builds (defined scope, 4-12 weeks)
- Time & Materials (ongoing / unknown scope)
- Embedded squads (1-3 engineers, 3-6 month commitments)

== Rates ==
Blended rate: [$X/hr]
Senior engineer: [$Y/hr]
Tech lead: [$Z/hr]

== Differentiators ==
- [e.g. Each engagement has a dedicated tech lead + paired senior engineers]
- [e.g. Discovery-first: 1-week architecture review before any code]
- [e.g. Sprint demos every two weeks, full code ownership transferred to client]
- [e.g. SOC 2 Type II compliant, NDA-friendly, US/EU timezone overlap]

== Contact ==
[Your Name] · [you@agency.com] · [website / linkedin]`;

function verdictClass(verdict) {
  if (verdict === 'apply') return 'verdict-apply';
  if (verdict === 'maybe') return 'verdict-maybe';
  if (verdict === 'skip') return 'verdict-skip';
  return '';
}

function verdictLabel(verdict) {
  if (verdict === 'apply') return 'Apply';
  if (verdict === 'maybe') return 'Maybe';
  if (verdict === 'skip') return 'Skip';
  return verdict || '';
}

function platformLabel(value) {
  const p = PLATFORM_OPTIONS.find((x) => x.value === value);
  return p ? p.label : value;
}

function tailoredResumeToPlainText(r) {
  if (!r) return '';
  const lines = [];
  if (r.name) lines.push(r.name);
  if (r.title) lines.push(r.title);
  if (r.tagline) lines.push(r.tagline);
  if (r.contact) lines.push(r.contact);
  lines.push('');

  if (r.summary) {
    lines.push('SUMMARY');
    lines.push(r.summary);
    lines.push('');
  }

  if (Array.isArray(r.skills) && r.skills.length) {
    lines.push('SKILLS');
    r.skills.forEach((s) => {
      lines.push(`${s.category}: ${s.items}`);
    });
    lines.push('');
  }

  if (Array.isArray(r.experience) && r.experience.length) {
    lines.push('EXPERIENCE');
    r.experience.forEach((e) => {
      const header = [e.company, e.location, e.dates].filter(Boolean).join(' — ');
      lines.push(header);
      if (e.role) lines.push(e.role);
      if (e.projectDescription) lines.push(e.projectDescription);
      if (Array.isArray(e.bullets)) {
        e.bullets.forEach((b) => lines.push(`• ${b}`));
      }
      lines.push('');
    });
  }

  if (r.education) {
    lines.push('EDUCATION');
    lines.push(r.education);
    lines.push('');
  }

  if (Array.isArray(r.projects) && r.projects.length) {
    lines.push('PROJECTS');
    r.projects.forEach((p) => {
      const header = [p.name, p.dates].filter(Boolean).join(' — ');
      lines.push(header);
      if (p.stack) lines.push(p.stack);
      if (Array.isArray(p.bullets)) {
        p.bullets.forEach((b) => lines.push(`• ${b}`));
      }
      lines.push('');
    });
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function TailorPage() {
  const [mode, setMode] = useState('individual'); // 'individual' | 'agency'
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [platform, setPlatform] = useState('linkedin');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [activeTab, setActiveTab] = useState('match');
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingProposalDocx, setDownloadingProposalDocx] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});

  // Collapse the form once we have results, to free up viewport for the
  // tab panel. The user can click the summary bar to re-expand.
  const [formCollapsed, setFormCollapsed] = useState(false);

  // File-upload state for /api/parse-resume.
  const [uploadStatus, setUploadStatus] = useState(''); // "Uploading foo.docx..." while in flight
  const [uploadInfo, setUploadInfo] = useState(''); // success line, e.g. "Loaded foo.docx (2,341 chars)"
  const [uploading, setUploading] = useState(false);

  // Tracks the last value we auto-seeded into the textarea. Lets us swap
  // seeds on mode change without clobbering content the user actually typed.
  const seededRef = useRef('');

  // Seed initial mode from URL ?mode=agency (set by the home page chip).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const qMode = (params.get('mode') || '').toLowerCase();
    if (qMode === 'agency') setMode('agency');
  }, []);

  // Auto-load the default resume on first mount in individual mode. Skipped
  // if the user has already typed/pasted something, has uploaded a file, or
  // started in agency mode.
  useEffect(() => {
    if (mode !== 'individual') return;
    let cancelled = false;
    (async () => {
      try {
        setUploading(true);
        setUploadStatus('Loading default resume…');
        const fileRes = await fetch(DEFAULT_RESUME_URL);
        if (!fileRes.ok) throw new Error(`fetch ${fileRes.status}`);
        const blob = await fileRes.blob();
        const file = new File([blob], DEFAULT_RESUME_FILENAME, {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const form = new FormData();
        form.append('file', file);
        const parseRes = await fetch('/api/parse-resume', { method: 'POST', body: form });
        const data = await parseRes.json().catch(() => ({}));
        if (!parseRes.ok) throw new Error(data?.error || `parse ${parseRes.status}`);
        if (cancelled) return;
        const text = data.text || '';
        // Only fill if the user hasn't typed anything yet.
        setResume((prev) => {
          if (prev) return prev;
          seededRef.current = text;
          return text;
        });
        setUploadInfo(
          `✓ Loaded ${DEFAULT_RESUME_FILENAME} (${text.length.toLocaleString()} chars)`
        );
        setTimeout(() => !cancelled && setUploadInfo(''), 8000);
      } catch (err) {
        // Don't show an alarming red error for a silent default-load failure —
        // the user can still paste / upload manually.
        if (!cancelled) {
          setUploadInfo(`Default resume could not be loaded (${err.message}). Paste or upload below.`);
          setTimeout(() => !cancelled && setUploadInfo(''), 8000);
        }
      } finally {
        if (!cancelled) {
          setUploading(false);
          setUploadStatus('');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only run on first individual-mode mount. Mode switches handle their own
    // seeding below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleModeChange(nextMode) {
    if (nextMode === mode) return;
    // Swap seed text only if the textarea still holds whatever we last seeded
    // (i.e. the user hasn't edited it). Otherwise keep their content.
    const userEdited = resume && resume !== seededRef.current;
    if (nextMode === 'agency') {
      if (!resume || !userEdited) {
        setResume(AGENCY_PROFILE_TEMPLATE);
        seededRef.current = AGENCY_PROFILE_TEMPLATE;
        setUploadInfo('Seeded agency profile template — edit with your details.');
        setTimeout(() => setUploadInfo(''), 6000);
      }
    } else {
      // Switching back to individual. If the textarea still holds the agency
      // template untouched, clear it so the user can paste a resume (or the
      // auto-load mount effect would have already populated it on first
      // render in individual mode).
      if (resume === AGENCY_PROFILE_TEMPLATE) {
        setResume('');
        seededRef.current = '';
      }
    }
    setMode(nextMode);
    // Reset results: tab list and download targets differ between modes.
    setResult(null);
    setActiveTab('match');
  }

  const canSubmit =
    resume.trim().length > 0 &&
    jobDescription.trim().length > 0 &&
    !loading &&
    !uploading;

  const tabs = mode === 'agency' ? TABS_AGENCY : TABS_INDIVIDUAL;

  async function handleResumeFileChange(e) {
    const file = e.target.files && e.target.files[0];
    // Reset the input value so re-selecting the same file fires onChange again.
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadInfo('');
    setUploadStatus(`Uploading ${file.name}...`);

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Upload failed (${res.status})`);
      }
      const text = data?.text || '';
      setResume(text);
      setUploadInfo(`✓ Loaded ${data.filename || file.name} (${text.length.toLocaleString()} chars)`);
      // Clear the success line after a few seconds.
      setTimeout(() => setUploadInfo(''), 6000);
    } catch (err) {
      setError(err?.message || 'Failed to parse uploaded file.');
    } finally {
      setUploadStatus('');
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const body =
        mode === 'agency'
          ? { mode, agencyProfile: resume, jobDescription, platform }
          : { mode, resume, jobDescription, platform };
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tailoring failed');
      setResult(data);
      setActiveTab('match');
      // Collapse the form once we have something useful below it.
      setFormCollapsed(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function flashCopy(key) {
    setCopyStatus((s) => ({ ...s, [key]: 'Copied!' }));
    setTimeout(() => {
      setCopyStatus((s) => {
        const next = { ...s };
        delete next[key];
        return next;
      });
    }, 1500);
  }

  async function copyToClipboard(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      flashCopy(key);
    } catch (err) {
      setCopyStatus((s) => ({ ...s, [key]: 'Copy failed' }));
    }
  }

  async function handleDownloadProposalDocx() {
    if (!result?.agencyProposal) return;
    setDownloadingProposalDocx(true);
    setError('');
    try {
      const res = await fetch('/api/proposal/docx', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(result.agencyProposal),
      });
      if (!res.ok) {
        let msg = 'Failed to generate proposal .docx';
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch (_) { /* ignore */ }
        throw new Error(msg);
      }
      const filename =
        filenameFromContentDisposition(res.headers.get('content-disposition')) ||
        'Agency-Proposal.docx';
      const blob = await res.blob();
      triggerBlobDownload(blob, filename);
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloadingProposalDocx(false);
    }
  }

  async function handleDownloadDocx() {
    if (!result?.tailoredResume) return;
    setDownloadingDocx(true);
    setError('');
    try {
      // Pass the platform as a query param so the server can include it in
      // the filename (e.g. Jayshri-Dalvi_LinkedIn_LEvate_Senior-.NET-Dev.docx).
      const url = `/api/tailor/docx?platform=${encodeURIComponent(platform)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(result.tailoredResume),
      });
      if (!res.ok) {
        let msg = 'Failed to generate .docx';
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch (_) { /* ignore */ }
        throw new Error(msg);
      }
      // Honour whatever filename the server built — it includes platform,
      // company, and role parsed from the JD.
      const filename =
        filenameFromContentDisposition(res.headers.get('content-disposition')) ||
        'Tailored-Resume.docx';
      const blob = await res.blob();
      triggerBlobDownload(blob, filename);
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloadingDocx(false);
    }
  }

  /**
   * Parse the filename out of a Content-Disposition response header. Handles
   * both the plain `filename="..."` form and RFC 5987 `filename*=UTF-8''...`.
   */
  function filenameFromContentDisposition(header) {
    if (!header) return null;
    const star = /filename\*\s*=\s*[^']*''([^;]+)/i.exec(header);
    if (star) {
      try { return decodeURIComponent(star[1].replace(/^"|"$/g, '').trim()); } catch (_) { /* fall through */ }
    }
    const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
    if (plain) return plain[1].trim();
    return null;
  }

  function handleDownloadProposalTxt() {
    const parts = result?.proposalOrMessage?.parts || [];
    const text = parts
      .map((p) => `${(p.label || '').toUpperCase()}:\n\n${p.content || ''}\n\n`)
      .join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    triggerBlobDownload(blob, 'proposal.txt');
  }

  const showResults = !!result;
  const compactForm = showResults && formCollapsed;

  return (
    <main className={`tailor-shell${showResults ? ' has-results' : ''}`}>
      <header className="tailor-hero">
        <h1>
          {mode === 'agency'
            ? 'Generate an Agency Proposal for a JD'
            : 'Tailor a Resume for a JD'}
        </h1>
        <p className="tailor-sub">
          {mode === 'agency'
            ? 'Paste your agency profile + a JD. AI scores the fit and drafts a full proposal — Executive Summary, Approach, Scope, Deliverables, Timeline, Investment.'
            : 'Paste a resume + a JD. AI scores the match, rewrites the resume, drafts the application message, and preps you for the interview.'}
        </p>
        <div className="mode-toggle" role="tablist" aria-label="Application mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'individual'}
            className={`mode-toggle-btn${mode === 'individual' ? ' active' : ''}`}
            onClick={() => handleModeChange('individual')}
          >
            Individual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'agency'}
            className={`mode-toggle-btn${mode === 'agency' ? ' active' : ''}`}
            onClick={() => handleModeChange('agency')}
          >
            Agency
          </button>
        </div>
      </header>

      {error ? <div className="error-banner" role="alert">{error}</div> : null}

      {compactForm ? (
        <button
          type="button"
          className="form-summary"
          onClick={() => setFormCollapsed(false)}
          aria-expanded="false"
          aria-controls="tailor-form"
          title="Click to re-expand and edit inputs"
        >
          <span className="form-summary-bits">
            <span><strong>Mode:</strong> {mode === 'agency' ? 'Agency' : 'Individual'}</span>
            <span className="dot">·</span>
            <span>
              <strong>{mode === 'agency' ? 'Profile' : 'Resume'}:</strong>{' '}
              {resume.length.toLocaleString()} chars
            </span>
            <span className="dot">·</span>
            <span><strong>JD:</strong> {jobDescription.length.toLocaleString()} chars</span>
            <span className="dot">·</span>
            <span><strong>Platform:</strong> {platformLabel(platform)}</span>
          </span>
          <span className="form-summary-action">Re-analyze ▾</span>
        </button>
      ) : (
        <section
          id="tailor-form"
          className={`form-section${showResults ? ' is-secondary' : ''}`}
        >
          <form onSubmit={handleSubmit} className="tailor-form">
            <div className="tailor-grid">
              <div className="field field-resume">
                <div className="field-head">
                  <label htmlFor="resume">
                    {mode === 'agency' ? 'Your agency profile' : 'Your current resume'}
                  </label>
                  <div className="field-head-actions">
                    {mode === 'agency' ? (
                      <button
                        type="button"
                        className="link-btn upload-sample"
                        onClick={() => {
                          setResume(AGENCY_PROFILE_TEMPLATE);
                          seededRef.current = AGENCY_PROFILE_TEMPLATE;
                        }}
                      >
                        Reset template
                      </button>
                    ) : (
                      <>
                        <label className={`btn btn-secondary btn-small upload-btn${uploading ? ' is-disabled' : ''}`}>
                          {uploading ? 'Parsing…' : 'Upload .docx / .pdf'}
                          <input
                            type="file"
                            hidden
                            accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleResumeFileChange}
                            disabled={uploading}
                          />
                        </label>
                        <button
                          type="button"
                          className="link-btn upload-sample"
                          onClick={() => setResume(SAMPLE_RESUME_PLACEHOLDER)}
                        >
                          Use sample
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <textarea
                  id="resume"
                  rows={10}
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder={
                    mode === 'agency'
                      ? 'Paste your agency profile here (services, team, case studies, rates)…'
                      : 'Paste your resume here...'
                  }
                  className="tailor-textarea"
                />

                <div className="field-foot">
                  {uploadStatus ? (
                    <span className="upload-status">{uploadStatus}</span>
                  ) : uploadInfo ? (
                    <span className="upload-info">{uploadInfo}</span>
                  ) : (
                    <span className="upload-hint">
                      {mode === 'agency'
                        ? 'Edit the template above with your agency details.'
                        : 'Default resume auto-loads — edit or replace above.'}
                    </span>
                  )}
                </div>
              </div>

              <div className="field field-jd">
                <div className="field-head">
                  <label htmlFor="jd">Job description</label>
                  <span className="field-head-hint">
                    Paste from LinkedIn / Upwork / company site
                  </span>
                </div>
                <textarea
                  id="jd"
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="tailor-textarea"
                />
                <div className="field-foot">
                  <span className="upload-hint">
                    {jobDescription.length.toLocaleString()} chars
                  </span>
                </div>
              </div>
            </div>

            <div className="form-actions-row">
              <div className="form-actions-left">
                <label htmlFor="platform" className="inline-label">Platform</label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="inline-select"
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions-right">
                {loading ? (
                  <span className="loading-status">Analyzing… 5-15s</span>
                ) : null}
                {showResults && !loading ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setFormCollapsed(true)}
                  >
                    Hide form
                  </button>
                ) : null}
                <button type="submit" className="btn" disabled={!canSubmit}>
                  {loading ? 'Analyzing…' : 'Analyze & Tailor'}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {result ? (
        <section className="results-section">
          <div className="tab-bar" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                className={`tab${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="tab-panel-wrap">
            {activeTab === 'match' ? (
              <MatchAnalysisPanel data={result.matchAnalysis} />
            ) : null}

            {activeTab === 'resume' ? (
              <TailoredResumePanel
                data={result.tailoredResume}
                onCopy={() =>
                  copyToClipboard(tailoredResumeToPlainText(result.tailoredResume), 'resume')
                }
                copyStatus={copyStatus.resume}
                onDownloadDocx={handleDownloadDocx}
                downloadingDocx={downloadingDocx}
              />
            ) : null}

            {activeTab === 'proposal-doc' ? (
              <AgencyProposalPanel
                data={result.agencyProposal}
                onDownloadDocx={handleDownloadProposalDocx}
                downloadingDocx={downloadingProposalDocx}
              />
            ) : null}

            {activeTab === 'proposal' ? (
              <ProposalPanel
                data={result.proposalOrMessage}
                copyStatus={copyStatus}
                onCopyPart={(idx, content) => copyToClipboard(content, `proposal-${idx}`)}
                onDownloadAll={handleDownloadProposalTxt}
              />
            ) : null}

            {activeTab === 'interview' ? (
              <InterviewPrepPanel data={result.interviewPrep} />
            ) : null}
          </div>
        </section>
      ) : null}

      {!result ? (
        <footer className="footer tailor-footer">
          <a href="/">← Back to resume variants</a>
        </footer>
      ) : null}
    </main>
  );
}

function MatchAnalysisPanel({ data }) {
  if (!data) return null;
  const score = typeof data.score === 'number' ? data.score : 0;
  return (
    <div className="tab-panel">
      <div className="match-summary">
        <div className={`score-badge ${verdictClass(data.verdict)}`}>
          <span className="score-number">{score}</span>
          <span className="score-total">/ 100</span>
          <span className="score-verdict">{verdictLabel(data.verdict)}</span>
        </div>
        <p className="match-reasoning">{data.reasoning}</p>
      </div>

      <div className="match-columns">
        <div className="match-column">
          <h3>Matched skills</h3>
          <div className="chip-list">
            {(data.matchedSkills || []).map((s, i) => (
              <span key={i} className="chip chip-matched">{s}</span>
            ))}
            {(!data.matchedSkills || data.matchedSkills.length === 0) ? (
              <span className="chip-empty">None identified</span>
            ) : null}
          </div>
        </div>
        <div className="match-column">
          <h3>Missing skills</h3>
          <div className="chip-list">
            {(data.missingSkills || []).map((s, i) => (
              <span key={i} className="chip chip-missing">{s}</span>
            ))}
            {(!data.missingSkills || data.missingSkills.length === 0) ? (
              <span className="chip-empty">None identified</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="match-keywords">
        <h3>Missing keywords (ATS)</h3>
        <div className="chip-list">
          {(data.missingKeywords || []).map((k, i) => (
            <span key={i} className="chip chip-keyword">{k}</span>
          ))}
          {(!data.missingKeywords || data.missingKeywords.length === 0) ? (
            <span className="chip-empty">None identified</span>
          ) : null}
        </div>
      </div>

      <div className="match-rows">
        <MatchRow label="Experience" data={data.experienceMatch} />
        <MatchRow label="Domain" data={data.domainMatch} />
        <MatchRow label="Seniority" data={data.seniorityMatch} />
      </div>
    </div>
  );
}

function MatchRow({ label, data }) {
  if (!data) return null;
  return (
    <div className="match-row">
      <div className="match-row-label">{label}</div>
      <div className="match-row-cell">
        <div className="match-row-key">Required</div>
        <div>{data.required}</div>
      </div>
      <div className="match-row-cell">
        <div className="match-row-key">Candidate</div>
        <div>{data.candidate}</div>
      </div>
      <div className="match-row-cell">
        <div className="match-row-key">Verdict</div>
        <div className={`match-row-verdict v-${(data.verdict || '').toLowerCase()}`}>
          {data.verdict}
        </div>
      </div>
    </div>
  );
}

function TailoredResumePanel({ data, onCopy, copyStatus, onDownloadDocx, downloadingDocx }) {
  if (!data) return null;
  return (
    <div className="tab-panel">
      <div className="resume-actions">
        <button type="button" className="btn btn-secondary" onClick={onCopy}>
          {copyStatus || 'Copy text'}
        </button>
        <button
          type="button"
          className="btn"
          onClick={onDownloadDocx}
          disabled={downloadingDocx}
        >
          {downloadingDocx ? 'Generating…' : 'Download .docx'}
        </button>
      </div>

      <div className="resume-preview">
        <div className="resume-header">
          {data.name ? <h2 className="resume-name">{data.name}</h2> : null}
          {data.title ? <div className="resume-title">{data.title}</div> : null}
          {data.tagline ? <div className="resume-tagline">{data.tagline}</div> : null}
          {data.contact ? <div className="resume-contact">{data.contact}</div> : null}
        </div>

        {data.summary ? (
          <section className="resume-section">
            <h3>Summary</h3>
            <p>{data.summary}</p>
          </section>
        ) : null}

        {Array.isArray(data.skills) && data.skills.length ? (
          <section className="resume-section">
            <h3>Skills</h3>
            <table className="skills-table">
              <tbody>
                {data.skills.map((s, i) => (
                  <tr key={i}>
                    <th>{s.category}</th>
                    <td>{s.items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {Array.isArray(data.experience) && data.experience.length ? (
          <section className="resume-section">
            <h3>Experience</h3>
            {data.experience.map((e, i) => (
              <div key={i} className="experience-item">
                <div className="experience-header">
                  <strong>{e.company}{e.location ? `, ${e.location}` : ''}</strong>
                  <span className="experience-dates">{e.dates}</span>
                </div>
                {e.role ? <div className="experience-role"><em>{e.role}</em></div> : null}
                {e.projectDescription ? (
                  <div className="experience-project"><em>{e.projectDescription}</em></div>
                ) : null}
                {Array.isArray(e.bullets) && e.bullets.length ? (
                  <ul>
                    {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}

        {data.education ? (
          <section className="resume-section">
            <h3>Education</h3>
            <p>{data.education}</p>
          </section>
        ) : null}

        {Array.isArray(data.projects) && data.projects.length ? (
          <section className="resume-section">
            <h3>Projects</h3>
            {data.projects.map((p, i) => {
              const dates = typeof p.dates === 'string' ? p.dates.trim() : '';
              return (
                <div key={i} className="experience-item">
                  <div className="experience-header">
                    <strong>{p.name}</strong>
                    {dates ? <span className="experience-dates">{dates}</span> : null}
                  </div>
                  {p.stack ? <div className="experience-role"><em>{p.stack}</em></div> : null}
                  {Array.isArray(p.bullets) && p.bullets.length ? (
                    <ul>
                      {p.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ProposalPanel({ data, copyStatus, onCopyPart, onDownloadAll }) {
  if (!data) return null;
  const parts = data.parts || [];
  return (
    <div className="tab-panel">
      {parts.map((part, i) => (
        <div key={i} className="proposal-part">
          <div className="proposal-part-header">
            <h3>{part.label}</h3>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => onCopyPart(i, part.content || '')}
            >
              {copyStatus[`proposal-${i}`] || 'Copy'}
            </button>
          </div>
          <pre className="proposal-content">{part.content}</pre>
        </div>
      ))}
      {parts.length ? (
        <div className="proposal-actions">
          <button type="button" className="btn" onClick={onDownloadAll}>
            Download all as .txt
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AgencyProposalPanel({ data, onDownloadDocx, downloadingDocx }) {
  if (!data) {
    return (
      <div className="tab-panel">
        <p className="chip-empty">
          The model didn't return an agencyProposal block. Switch to Agency mode and re-run, or check the Proposal / Message tab.
        </p>
      </div>
    );
  }

  const {
    agencyName, clientName, projectTitle, executiveSummary,
    approach, scopeOfWork, deliverables, timeline, investment, whyUs, contact,
  } = data;

  return (
    <div className="tab-panel">
      <div className="resume-actions">
        <button
          type="button"
          className="btn"
          onClick={onDownloadDocx}
          disabled={downloadingDocx}
        >
          {downloadingDocx ? 'Generating…' : 'Download Proposal .docx'}
        </button>
      </div>

      <div className="resume-preview">
        <div className="resume-header">
          {agencyName ? <h2 className="resume-name">{agencyName}</h2> : null}
          {clientName ? (
            <div className="resume-title">Proposal for {clientName}</div>
          ) : null}
          {projectTitle ? (
            <div className="resume-tagline">{projectTitle}</div>
          ) : null}
        </div>

        {executiveSummary ? (
          <section className="resume-section">
            <h3>Executive Summary</h3>
            <p>{executiveSummary}</p>
          </section>
        ) : null}

        {Array.isArray(approach) && approach.length ? (
          <section className="resume-section">
            <h3>Our Approach</h3>
            <ul>
              {approach.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </section>
        ) : null}

        {Array.isArray(scopeOfWork) && scopeOfWork.length ? (
          <section className="resume-section">
            <h3>Scope of Work</h3>
            {scopeOfWork.map((group, i) => (
              <div key={i} className="experience-item">
                {group?.title ? (
                  <div className="experience-header">
                    <strong>{group.title}</strong>
                  </div>
                ) : null}
                {Array.isArray(group?.items) && group.items.length ? (
                  <ul>
                    {group.items.map((it, j) => <li key={j}>{it}</li>)}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}

        {Array.isArray(deliverables) && deliverables.length ? (
          <section className="resume-section">
            <h3>Deliverables</h3>
            <ul>
              {deliverables.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </section>
        ) : null}

        {Array.isArray(timeline) && timeline.length ? (
          <section className="resume-section">
            <h3>Timeline</h3>
            {timeline.map((phase, i) => (
              <div key={i} className="experience-item">
                <div className="experience-header">
                  <strong>{phase?.phase}</strong>
                  <span className="experience-dates">{phase?.duration}</span>
                </div>
                {phase?.description ? <p>{phase.description}</p> : null}
              </div>
            ))}
          </section>
        ) : null}

        {investment && (investment.model || investment.range) ? (
          <section className="resume-section">
            <h3>Investment</h3>
            <table className="skills-table">
              <tbody>
                {investment.model ? (
                  <tr><th>Model</th><td>{investment.model}</td></tr>
                ) : null}
                {investment.range ? (
                  <tr><th>Range</th><td>{investment.range}</td></tr>
                ) : null}
                {investment.notes ? (
                  <tr><th>Notes</th><td>{investment.notes}</td></tr>
                ) : null}
              </tbody>
            </table>
          </section>
        ) : null}

        {Array.isArray(whyUs) && whyUs.length ? (
          <section className="resume-section">
            <h3>Why Us</h3>
            <ul>
              {whyUs.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </section>
        ) : null}

        {contact ? (
          <section className="resume-section">
            <h3>Contact</h3>
            <p>{contact}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function InterviewPrepPanel({ data }) {
  if (!data) return null;
  return (
    <div className="tab-panel">
      {Array.isArray(data.likelyQuestions) && data.likelyQuestions.length ? (
        <section className="interview-section">
          <h3>Likely questions</h3>
          {data.likelyQuestions.map((q, i) => (
            <div key={i} className="interview-question">
              <h4>{q.question}</h4>
              <p>{q.talkingPoints}</p>
            </div>
          ))}
        </section>
      ) : null}

      {Array.isArray(data.gapHandling) && data.gapHandling.length ? (
        <section className="interview-section">
          <h3>Gap handling</h3>
          {data.gapHandling.map((g, i) => (
            <div key={i} className="interview-gap">
              <p>
                <strong>{g.gap}</strong> — {g.honestAddress}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {Array.isArray(data.thingsToLearn) && data.thingsToLearn.length ? (
        <section className="interview-section">
          <h3>Things to brush up</h3>
          <ul className="learn-list">
            {data.thingsToLearn.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
