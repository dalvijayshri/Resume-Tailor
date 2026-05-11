# Resume Tailor

A small Next.js web app for downloading tailored resume variants on demand. Resume content is defined in code (using [`docx`](https://www.npmjs.com/package/docx)), so I keep multiple variants — Standard, Freelance, Slim — without hand-editing Word documents.

**Live demo:** [resume-tailor.vercel.app](https://resume-tailor.vercel.app) *(update after deploying)*

## Variants

| Variant | Best for |
|---|---|
| `v3` | Standard 2-page resume with ElixaX featured near the top |
| `v3-elixax-last` | Same as Standard but with ElixaX moved to the bottom as a personal project — better for corporate / enterprise applications |
| `freelance` | Long-form Upwork / marketplace variant with detailed services, core skills, and environment lines per role |
| `freelance-slim` | Compact freelance variant with Services + Core Skills sections |

## Stack

- **Next.js 14** (App Router)
- **React 18**
- **[`docx`](https://docx.js.org)** — Word document generation
- Deployed to **Vercel**

## How it works

1. Each builder under `lib/builders/` exports a `buildDocument()` function returning a `docx` `Document`
2. The API route at `app/api/resume/[variant]/route.js` packs the document to a buffer and streams it as a `.docx` attachment
3. The home page reads the variant catalog and renders a download card per variant

## Local development

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Adding a new variant

1. Create `lib/builders/<id>.js`, export `buildDocument()` and a `meta` object with `id`, `name`, `description`, `filename`
2. Register it in `lib/builders/index.js`
3. It automatically appears on the home page and at `/api/resume/<id>`

## Why programmatic resumes

- Single source of truth — no Word-document drift between variants
- Easy to diff revisions in git
- Fast to spin up a new tailored variant for a specific role / JD
- Layout choices (spacing, fonts, section borders) are explicit and reproducible
