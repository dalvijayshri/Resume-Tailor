import { variants } from '@/lib/builders';

export default function HomePage() {
  return (
    <main className="container">
      <header className="hero">
        <h1>Resume Tailor</h1>
        <p>Jayshri Dalvi — Senior Full Stack Developer</p>
        <p className="subtle">Pick a variant and download as a Word document.</p>
      </header>

      <section className="grid">
        {variants.map(v => (
          <article key={v.id} className="card">
            <h2>{v.name}</h2>
            <p className="desc">{v.description}</p>
            <p className="meta">{v.filename}</p>
            <a className="btn" href={`/api/resume/${v.id}`} download>
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
