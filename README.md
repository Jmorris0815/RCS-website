# RCS Gutters Website

Production website for **Right Choice Seamless Gutters** (Barboursville, VA). Astro + Tailwind, deployed to Vercel.

> **Claude Code:** Read `CLAUDE.md` first, every session. Read `PROJECT_BRIEF.md` for full context.

---

## What's in this repo

| File | What it is |
|---|---|
| `PROJECT_BRIEF.md` | The master PRD. Strategy, architecture, phases, definition of done. |
| `CLAUDE.md` | Operating rules for Claude Code. Brand, voice, AI guardrails, conventions. |
| `CONTENT_TASKS.md` | Dennis Yu task library — 100+ specific content production tasks. |
| `SCOTT_CHECKLIST.md` | Open items we need from Scott to launch. |
| `src/content/config.ts` | Zod schemas for every content collection. |
| `src/components/` | Astro UI components. |
| `src/layouts/` | Page layouts. |
| `src/pages/` | Route definitions. |
| `scripts/` | Build-time audits (page similarity, internal linking). |

## Getting started

```bash
npm install
npm run dev          # http://localhost:4321
```

## Build & deploy

```bash
npm run build        # static output in dist/
npm run preview      # local preview of production build
```

Connect this repo to Vercel and every push to `main` deploys; every PR gets a preview URL.

## Audits before merging

```bash
npm run check:similarity    # No pair of location pages can exceed 30% text similarity
npm run check:links         # Verify internal link density
npm run lighthouse          # Local Lighthouse run
```

## What lives where

- **Service pages:** `src/content/services/`
- **Location pages:** `src/content/locations/` (one per city, must be uniquely written)
- **Product pages:** `src/content/products/` (Leaf Solution lines)
- **Case studies:** `src/content/caseStudies/`
- **Blog:** `src/content/posts/`
- **Author bios:** `src/content/authors/`
- **Testimonials:** `src/content/testimonials/` (only with `permissionGranted: true`)

## Contact

- **Owner:** Scott Morris (Right Choice Seamless Gutters)
- **Project lead:** Justin Morris
- **Repo agent:** Claude Code (read `CLAUDE.md` first)

---

*This site is built to win Google's post-Helpful-Content-Update ranking environment by producing genuinely useful, locally specific, expert-authored content. Templated city pages and AI fluff are explicitly forbidden — see `CLAUDE.md` for guardrails.*
