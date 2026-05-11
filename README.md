# Resume-Tailor

Programmatic resume generation in JavaScript using [`docx`](https://www.npmjs.com/package/docx).

Each script builds a tailored variant of my resume as a `.docx` file. I keep multiple
variants so I can apply to different roles (freelance, full-time, slim, full) without
hand-editing Word documents.

## Variants

| Script | Output |
|---|---|
| `build_resume_v3.js` | Main 2-page resume |
| `build_resume_v3_elixax_last.js` | Same as v3 but with ElixaX Health placed at the bottom |
| `build_freelance_resume.js` | Long-form freelance-focused resume with competency sections |
| `build_freelance_resume_slim.js` | Compact 1-page freelance variant |

## Usage

```bash
npm install docx
node build_resume_v3.js
```

The script writes a `.docx` file to the current directory.

## Why programmatic

- Single source of truth for resume content (no Word-document drift between variants)
- Easy to diff between revisions in git
- Fast to spin up a new tailored variant for a specific role / job description
- Layout choices (spacing, font sizes, section borders) are explicit and reproducible

## Stack

- Node.js
- [`docx`](https://www.npmjs.com/package/docx) — Word document generation
