# CLAUDE.md — RCS Gutters Website

This file is the operating manual for Claude Code working on this repo.
**Read this every session before making changes.** Read PROJECT_BRIEF.md if you need full context.

---

## What this project is

A production website for Right Choice Seamless Gutters (RCS) in Barboursville, VA. Built with Astro + Tailwind + content collections, deployed to Vercel. The site exists to (a) rank for local Central-VA gutter searches and (b) convert visitors to quote requests.

**Owner:** Scott (Justin's uncle). Justin is the project manager. Both are non-technical. Communicate decisions in plain language in PR descriptions and commit messages.

## Brand rules (NEVER violate)

1. **Keep Scott's existing logo and colors.** Do not invent new brand colors. If exact hex codes aren't in `tailwind.config.mjs` yet, use the placeholder tokens and flag in your PR that real values are needed.
2. **Don't change the company name.** It's "Right Choice Seamless Gutters" or "RCS Gutters" — never abbreviate further, never restyle.
3. **Voice:** Confident, friendly, plainspoken. Sounds like a competent local contractor — not a national franchise, not a marketing agency. Avoid corporate-speak ("solutions," "experiences," "elevate") and avoid hype ("the BEST," "#1," "unbeatable"). Use "we," "us," "our crew," "Scott's team."

## Content rules (HCU-proofing)

The site lives or dies by content quality. Google's Helpful Content Update has been brutal to templated and AI-fluff sites. Apply these rules every time you write or commit content:

### Required for every page

- **Original first-person voice.** Pages should read like Scott personally wrote them. If you can't tell whether Scott or ChatGPT wrote a paragraph, rewrite it.
- **Specific local detail.** A Charlottesville page mentions tulip poplars, UVA-area neighborhoods, the Rivanna river floodplain. A Madison page mentions farmhouse rooflines and cedar trees. Generic "in [city] we serve homeowners…" copy is forbidden.
- **Real data when claimed.** Don't write "we've completed thousands of jobs" unless that's true. Use ranges Scott can verify ("over 500 installs since 2018").
- **Author byline.** Every blog post and case study links to an `authors/` entry. Default author is Scott.
- **Schema markup matching the actual page content.** No FAQ schema if there's no visible FAQ. No Review schema if the reviews aren't real and on-page.

### AI usage guardrails

AI is a tool, not a content factory. Permitted and forbidden uses:

**Permitted:**
- First drafts of FAQ answers (Scott reviews and personalizes).
- Rewriting Scott's voice memos into clean prose.
- Generating diagram illustrations (e.g., gutter cross-sections).
- Decorative hero backgrounds, abstract textures.
- B-roll cutaways for video edits (rain, leaves, generic suburb).
- Photo retouching and cleanup.
- Code, configs, schemas, scripts — all fair game.

**Forbidden:**
- Fake before/after photos. EVER.
- Fabricated case studies, customer quotes, or reviews.
- AI-generated headshots posing as Scott, crew, or customers.
- AI-voiceover impersonating Scott unless Scott has personally approved that specific clip.
- Auto-generated "city information" filler paragraphs.
- Mass-templated location pages where only the city name changes.

**Smell test:** Before committing AI-touched content, ask: "If a Google quality rater knew an LLM helped write this, would they still rate it useful, original, and trustworthy?" If no, kill it.

## Page uniqueness rule

Run `npm run check:similarity` before merging any new location, service, or product page. Any pair of pages with >30% text similarity gets rejected. Variation must come from real local detail — not a thesaurus pass.

## Internal linking rule

Every new content page must include:
- At least 3 inbound contextual links (added to existing high-authority pages).
- At least 5 outbound contextual links (to other relevant pages in the cluster).
- A "Related" footer module showing 3–6 nearest neighbors.

Run `npm run check:links` to audit.

## File and naming conventions

- Markdown content files: kebab-case (`gutter-cleaning-charlottesville.md`).
- Astro components: PascalCase (`QuoteForm.astro`).
- Pages: kebab-case routes, lowercase URLs.
- Image filenames: `[city]-[type]-[shortdesc]-[date].jpg`. Example: `charlottesville-install-redbrick-2025-09.jpg`.
- Image alt text: descriptive, includes location and product when relevant. Never "image" or "photo".

## Commit and PR conventions

- Conventional commits (`feat:`, `fix:`, `content:`, `chore:`, `docs:`).
- One concern per PR.
- PR description includes: what changed, screenshots if visual, lighthouse delta, and a one-sentence "why this matters to ranking."
- Never commit secrets, API keys, or Scott's personal phone/email in code. Use environment variables.

## Performance targets (do not regress)

- LCP < 2.0s mobile.
- INP < 200ms.
- CLS < 0.05.
- Total initial page weight < 600KB.
- Lighthouse mobile: 95+ Performance, 100 SEO, 100 Accessibility, 100 Best Practices.

If a change drops Lighthouse below targets on the homepage, the change reverts.

## Questions you must ask before guessing

When in doubt, surface it in the PR rather than ship a guess. Specifically:
- Brand color hex codes — wait for real values.
- Real review counts and ratings — never invent.
- Customer quotes — only with a `permissionGranted: true` flag in the testimonial frontmatter.
- Phone numbers and addresses — pull from a single config file; don't hardcode.
- Service area boundaries — confirm with Scott.

## Working with Scott's content inputs

Scott's content arrives in messy real-world forms: phone videos, voice memos, photos with no captions, text-message testimonials. Build pipelines that gracefully accept these:

- Voice memo → transcribe (Whisper) → slot into a post draft for Scott to edit.
- Phone video → upload to YouTube (unlisted) → embed via lite-youtube → repurpose audio for a podcast clip and stills for blog hero.
- Phone photos → run through `scripts/process-photos.mjs` (resize, EXIF strip, geo-extract, generate alt-text candidates for human review).
- Text testimonial → require Scott to confirm permission flag before it ships.

## When to escalate

Surface to Justin (in PR or chat) if:
- A schema you're about to ship references unverifiable data.
- A page would launch with placeholder content.
- A change risks SEO regression.
- Scott has provided content that conflicts with another part of the site (e.g., a service description that doesn't match the services list).
- Any decision involves brand identity, business pricing, or legal claims.

## Quick start commands

```bash
npm install                 # First-time setup
npm run dev                 # Local dev server at :4321
npm run build               # Production build
npm run preview             # Preview the production build locally
npm run check:similarity    # Cross-page duplication audit
npm run check:links         # Internal link density audit
npm run lighthouse          # Local Lighthouse audit on key pages
```
