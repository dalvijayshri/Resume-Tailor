'use client';

import { useState } from 'react';

const PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'upwork', label: 'Upwork' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'hubstaff', label: 'Hubstaff' },
  { value: 'other', label: 'Other' },
];

const TABS = [
  { id: 'match', label: 'Match Analysis' },
  { id: 'resume', label: 'Tailored Resume' },
  { id: 'proposal', label: 'Proposal / Message' },
  { id: 'interview', label: 'Interview Prep' },
];

const SAMPLE_RESUME_PLACEHOLDER =
  '(Paste your latest resume here. You can copy text from any of the downloads on the home page — open .docx in Word, select all, copy.)';

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
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [platform, setPlatform] = useState('linkedin');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [activeTab, setActiveTab] = useState('match');
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});

  const canSubmit = resume.trim().length > 0 && jobDescription.trim().length > 0 && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resume, jobDescription, platform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tailoring failed');
      setResult(data);
      setActiveTab('match');
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

  return (
    <main className="container">
      <header className="hero">
        <h1>Tailor a Resume for a JD</h1>
        <p className="subtle">
          Paste your base resume and a job description. AI analyzes match, rewrites the
          resume truthfully, drafts the application message, and preps you for the interview.
        </p>
      </header>

      {error ? <div className="error-banner" role="alert">{error}</div> : null}

      <section className="form-section">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="resume">
              Your current resume (plain text — paste from .docx, LinkedIn, anywhere)
            </label>
            <textarea
              id="resume"
              rows={14}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume here..."
            />
            <button
              type="button"
              className="link-btn"
              onClick={() => setResume(SAMPLE_RESUME_PLACEHOLDER)}
            >
              [ Use sample resume ]
            </button>
          </div>

          <div className="field">
            <label htmlFor="jd">
              Job description (paste from LinkedIn / Upwork / company site / wherever)
            </label>
            <textarea
              id="jd"
              rows={12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
            />
          </div>

          <div className="field">
            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn" disabled={!canSubmit}>
              {loading ? 'Analyzing…' : 'Analyze & Tailor'}
            </button>
            {loading ? (
              <span className="loading-status">Analyzing… this usually takes 5-15 seconds.</span>
            ) : null}
          </div>
        </form>
      </section>

      {result ? (
        <section className="results-section">
          <div className="tab-bar" role="tablist">
            {TABS.map((t) => (
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
        </section>
      ) : null}

      <footer className="footer">
        <a href="/">← Back to resume variants</a>
      </footer>
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
            {data.projects.map((p, i) => (
              <div key={i} className="experience-item">
                <div className="experience-header">
                  <strong>{p.name}</strong>
                  <span className="experience-dates">{p.dates}</span>
                </div>
                {p.stack ? <div className="experience-role"><em>{p.stack}</em></div> : null}
                {Array.isArray(p.bullets) && p.bullets.length ? (
                  <ul>
                    {p.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                ) : null}
              </div>
            ))}
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
