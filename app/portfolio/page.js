// app/portfolio/page.js
//
// Enterprise implementation portfolio: 9 projects, each rendered with a
// consistent operational-dashboard mockup + a layered architecture
// diagram. The mockups are intentionally HTML+CSS (no images), so they:
//   - load instantly,
//   - print cleanly into PDFs,
//   - screenshot well for proposal attachments,
//   - remain editable as the candidate's positioning evolves.
//
// All 9 projects render on one scrollable page with a sticky side-nav.
// No interactive state — this is a portfolio asset, not an app.

import projects from '@/lib/portfolio/projects';

export const metadata = {
  title: 'Enterprise Implementation Portfolio — Jayshri Dalvi',
  description: 'Operational dashboards, workflow screens, and architecture diagrams across 9 enterprise engagements in Healthcare, Banking, AI Automation, and SaaS Modernization.',
};

export default function PortfolioPage() {
  return (
    <main className="portfolio-shell">
      <PortfolioHeader />
      <div className="portfolio-grid">
        <aside className="portfolio-nav" aria-label="Projects">
          <div className="portfolio-nav-title">Projects</div>
          <ul>
            {projects.map((p) => (
              <li key={p.id}>
                <a href={`#${p.id}`} className="portfolio-nav-link">
                  <span className="portfolio-nav-dot" style={{ background: p.primaryColor }} />
                  <span className="portfolio-nav-text">
                    <span className="portfolio-nav-name">{p.shortName}</span>
                    <span className="portfolio-nav-domain">{p.domain}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a className="portfolio-back" href="/">← Back to home</a>
        </aside>

        <section className="portfolio-main">
          {projects.map((p) => <ProjectShowcase key={p.id} project={p} />)}
        </section>
      </div>
      <footer className="portfolio-footer">
        Enterprise Implementation Portfolio · Jayshri Dalvi · Senior Healthcare & Enterprise Full Stack Consultant
      </footer>
    </main>
  );
}

function PortfolioHeader() {
  return (
    <header className="portfolio-hero">
      <div>
        <h1>Enterprise Implementation Portfolio</h1>
        <p className="portfolio-sub">
          Operational dashboards, workflow screens, and architecture
          overviews across 9 enterprise engagements in Healthcare,
          Banking, AI Automation, and SaaS Modernization.
        </p>
      </div>
      <div className="portfolio-stats">
        <div className="portfolio-stat">
          <span className="portfolio-stat-value">13+</span>
          <span className="portfolio-stat-label">Years</span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-value">9</span>
          <span className="portfolio-stat-label">Projects</span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-value">6</span>
          <span className="portfolio-stat-label">Domains</span>
        </div>
      </div>
    </header>
  );
}

function ProjectShowcase({ project }) {
  const accent = project.primaryColor;
  return (
    <article id={project.id} className="project" style={{ '--accent': accent }}>
      <header className="project-header">
        <div className="project-titles">
          <span className="project-domain">{project.domain}</span>
          <h2>{project.name}</h2>
          <p className="project-tagline">{project.tagline}</p>
        </div>
        <div className="project-stack">
          {project.stack.map((s) => (
            <span key={s} className="stack-pill">{s}</span>
          ))}
        </div>
      </header>

      <DashboardMockup project={project} />

      <div className="project-second-row">
        <ArchitectureDiagram project={project} />
        <FeatureBullets project={project} />
      </div>
    </article>
  );
}

function DashboardMockup({ project }) {
  const { metrics, queue, activity } = project;
  return (
    <div className="dashboard-mockup" role="img" aria-label={`${project.name} operational dashboard mockup`}>
      <div className="dashboard-topbar">
        <span className="dashboard-app-name">{project.shortName} · Operations Console</span>
        <span className="dashboard-env">PROD</span>
        <span className="dashboard-user">JD · Operator</span>
      </div>

      <div className="dashboard-body">
        <nav className="dashboard-sidebar" aria-hidden="true">
          <ul>
            <li className="active">Dashboard</li>
            <li>Work Queue</li>
            <li>Lookup</li>
            <li>Reports</li>
            <li>Audit</li>
            <li>Settings</li>
          </ul>
        </nav>

        <div className="dashboard-main">
          <div className="dashboard-breadcrumb">
            Home <span>·</span> Operations <span>·</span> <strong>Today</strong>
            <div className="dashboard-actions">
              <button type="button" className="dash-btn">Filter</button>
              <button type="button" className="dash-btn">Export</button>
              <button type="button" className="dash-btn dash-btn-primary">+ New</button>
            </div>
          </div>

          <div className="kpi-row">
            {metrics.map((m, i) => (
              <div className="kpi-tile" key={i}>
                <span className="kpi-label">{m.label}</span>
                <span className="kpi-value">{m.value}</span>
                <span className={`kpi-delta ${m.good ? 'good' : 'neutral'}`}>{m.delta}</span>
              </div>
            ))}
          </div>

          <div className="dashboard-content">
            <div className="dashboard-queue">
              <div className="dashboard-section-title">{queue.title}</div>
              <table className="dash-table">
                <thead>
                  <tr>
                    {queue.columns.map((c) => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {queue.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>{
                          // Render any cell that contains an SLA-ish word as a pill.
                          /^(On Track|At Risk|Delayed|Ready|Today|High|Normal|Approved|Pending|N\/A)$/.test(String(cell))
                            ? <span className={`pill pill-${slug(cell)}`}>{cell}</span>
                            : cell
                        }</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="dashboard-activity">
              <div className="dashboard-section-title">Operational Activity</div>
              <ul className="activity-feed">
                {activity.map((a, i) => (
                  <li key={i}>
                    <span className="activity-time">{a.time}</span>
                    <span className="activity-text">{a.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchitectureDiagram({ project }) {
  const { architecture } = project;
  return (
    <div className="architecture" role="img" aria-label={`${project.name} architecture overview`}>
      <div className="dashboard-section-title">Architecture Overview</div>
      <div className="arch-stack">
        {architecture.layers.map((layer, i) => (
          <div className="arch-layer" key={i}>
            <div className="arch-layer-name">{layer.name}</div>
            <div className="arch-layer-tech">{layer.tech}</div>
            {i < architecture.layers.length - 1 ? <div className="arch-arrow" aria-hidden="true">▼</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureBullets({ project }) {
  return (
    <div className="project-features">
      <div className="dashboard-section-title">Implementation Highlights</div>
      <ul>
        {project.features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
    </div>
  );
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
