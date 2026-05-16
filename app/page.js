import { variants } from '@/lib/builders';

export default function HomePage() {
  return (
    <main className="container">
      <header className="hero">
        <h1>Resume Tailor</h1>
        <p>Jayshri Dalvi — Senior Full Stack Developer</p>
        <p className="subtle">Pick a variant and download as a Word document.</p>
      </header>

      <a href="/tailor" className="tailor-banner">
        <div className="tailor-banner-text">
          <strong>Tailor a resume or generate an agency proposal →</strong>
          <span>Paste a JD and get an AI-tailored resume (individual) or a full proposal — Executive Summary, Scope, Timeline, Investment (agency).</span>
        </div>
        <span className="btn">Try it</span>
      </a>

      <a href="/portfolio" className="tailor-banner">
        <div className="tailor-banner-text">
          <strong>Enterprise Implementation Portfolio →</strong>
          <span>Operational dashboards, workflow screens, and architecture overviews across 9 enterprise engagements — Healthcare, Banking, AI Automation, SaaS Modernization.</span>
        </div>
        <span className="btn">View</span>
      </a>

      <section className="grid">
        {variants.map(v => (
          <article key={v.id} className="card">
            <h2>{v.name}</h2>
            <p className="desc">{v.description}</p>
            <p className="meta">{v.filename}</p>
            <a className="btn" href={`/downloads/${v.publicFilename || v.id + '.docx'}`} download>
              Download .docx
            </a>
          </article>
        ))}
      </section>

      <footer className="footer">
        Built with Next.js + <a href="https://docx.js.org" target="_blank" rel="noreferrer">docx</a>. Source on{' '}
        <a href="https://github.com/dalvijayshri/Resume-Tailor" target="_blank" rel="noreferrer">GitHub</a>.
      </footer>
    </main>
  );
}
