# RCS Gutters — Project Brief
**The master PRD. Claude Code: read this top to bottom before touching any code.**

Prepared by SONNY for Justin Morris · April 2026
Owner: Right Choice Seamless Gutters (Scott) · Barboursville, VA
Domain: rcsgutters.com (live; we build new in parallel and flip when ready)

---

## 1. Mission

Take Scott's existing site (preserved logo and color palette) and rebuild it as a content-first, hyper-local gutter authority that wins Google's post-Helpful-Content-Update ranking environment. The site must:

- Look modern, premium, and clearly local to Central Virginia.
- Establish Scott personally as the regional expert (E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness).
- Rank for service+city long-tail terms across 6–10 core cities.
- Feature Leaf Solution products (Xtreme, New Wave, Evelyn's Leaf Solution) with original case studies, not manufacturer fluff.
- Convert visitors via above-the-fold quote forms, click-to-call, and a gutter-guard configurator quiz.
- Be pre-built to absorb 2–3 videos and 15+ photos per week without code changes — the content engine, not the codebase, is what scales.

## 2. Strategic Frame: Dennis Yu Playbook + 2026 Google Reality

Dennis Yu's BlitzMetrics framework — Goals → Plays → Tasks — is the operating system for content production. Apply it to RCS as follows:

**Goal layer** (annual): Rank top 3 for "[service] [city]" across 8 Central VA cities; generate 30+ qualified leads/month from organic search; build a local YouTube authority for Scott.

**Play layer** (quarterly): Topic clusters around (1) gutter installation, (2) gutter cleaning, (3) gutter guards / Leaf Solution products, (4) seasonal Central-VA gutter problems, (5) commercial gutters, (6) financing & warranty.

**Task layer** (daily/weekly): The CONTENT_TASKS.md file enumerates specific repeatable content tasks. Scott records 1-minute video → we transcribe → we expand into a blog post → we cut into a YouTube short → we embed back on a service or location page → we amplify with $1/day Facebook boost. One input, six outputs.

Google's HCU (March 2024) and subsequent core updates demolished sites running templated AI content, generic location pages, and topic-thin blog posts. What now ranks: original first-person experience, named author bios, real photos of real jobs, original data, internal linking that mirrors topical authority. **Every page on this site must pass the "could only have been written by an actual gutter contractor in Central Virginia" smell test.**

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 5+** | Zero JS by default, content-collections built in, MDX support, ships static HTML for instant TTFB. Best-in-class for content-heavy SEO sites. |
| Styling | **Tailwind CSS** | Fast iteration, consistent design tokens, easy for Claude Code to extend. |
| Content | **Astro Content Collections + MDX** | Type-safe content with Zod schemas. Markdown for blog and case studies; JSON/YAML data for services and locations. |
| Forms | **Web3Forms** or **Formspree** (free tier) | Sends leads to Scott's email + a webhook into a CRM later. No backend to maintain. |
| Hosting | **Vercel** (primary recommendation) or Cloudflare Pages | Free tier, auto-deploy from GitHub, edge caching, preview URLs for every PR. |
| Analytics | **Plausible** or **Cloudflare Web Analytics** | Privacy-friendly, lightweight, no GDPR cookie-banner needed. (Add GA4 only if Scott explicitly wants it.) |
| Search Console | Google Search Console | Mandatory. Submit sitemap day one. |
| Image optimization | Astro's `<Image />` + Sharp | Automatic AVIF/WebP, lazy loading, srcset. |
| Maps | OpenStreetMap iframe or `leaflet.js` | Avoid Google Maps API billing. |
| Schema / SEO | `astro-seo` + custom Schema.org JSON-LD | LocalBusiness, Service, Review, FAQPage, BreadcrumbList. |
| Source control | GitHub | Branch per feature; deploy preview per PR. |

**Do not use:** WordPress, page builders (Elementor/Divi), Squarespace, Webflow, Wix. They all fight against this strategy.

## 4. Site Architecture

### 4.1 Page Map

```
/                                    Home
/about                               About Scott + the company story
/services/                           Services hub
  ├─ /seamless-gutter-installation
  ├─ /gutter-cleaning
  ├─ /gutter-guards                  Pillar page for guard products
  ├─ /half-round-gutters
  ├─ /commercial-gutters
  ├─ /fascia-and-soffit
  └─ /drainage-solutions
/products/                           Products hub
  ├─ /xtreme-gutter-guard
  ├─ /new-wave-gutter-guard
  └─ /evelyns-leaf-solution
/locations/                          Locations hub
  ├─ /barboursville
  ├─ /charlottesville
  ├─ /orange
  ├─ /madison
  ├─ /greene
  ├─ /fluvanna
  ├─ /louisa
  └─ /albemarle
/case-studies/                       Case study hub
  └─ /[slug]                          Individual job case studies
/blog/                               Blog hub
  └─ /[slug]                          Posts
/quote                               Quote form (also embedded everywhere)
/financing                           Financing options
/warranty                            Warranty + guarantees
/gallery                             Before/after photos by category
/reviews                             Imported + linked reviews
/contact                             Contact details, hours, service map
/configurator                        Interactive guard recommendation quiz
/sitemap.xml                         Auto-generated
/robots.txt
```

### 4.2 Topical Authority Network

Every service page links to:
- The 8 location pages (with anchor text varied per location).
- All relevant product pages.
- 3–5 case studies that used that service.
- 3–5 blog posts on that topic.

Every location page links to:
- All 7 services (anchored as "[service] in [city]").
- Local case studies (jobs done in or near that city).
- Blog posts about local seasonal issues.

Every product page links to:
- The relevant service page.
- Case studies that used that product.
- Comparison content vs. other guard types.

This creates the dense, hub-and-spoke topical web that Google now treats as the primary authority signal post-HCU.

## 5. Design System

**Brand preservation rule:** Keep Scott's logo and existing color palette. Justin will provide exact hex codes; until then use placeholders below and **never invent brand colors — wait for confirmation.**

```
PLACEHOLDERS — REPLACE WITH SCOTT'S ACTUAL BRAND HEX
--brand-primary:   #1B4D7A   (deep blue placeholder)
--brand-secondary: #D9A441   (warm gold placeholder)
--brand-dark:      #0F2A4A
--brand-light:     #F5F8FB
--accent-success:  #2E7D5C
--text-primary:    #1A1A1A
--text-muted:      #4A5560
--border:          #E5EAF0
```

**Typography:** Inter for body, a strong slab or geometric sans for headings (placeholder: Manrope or Sora). Clamp font sizes for fluid responsive scaling. Body 17px desktop, 16px mobile.

**Spacing:** 4-point grid. Section padding clamp(48px, 6vw, 96px) top/bottom.

**Imagery rules:**
- Real Scott job photos always preferred over stock or AI for above-the-fold and trust-critical sections.
- AI-generated imagery (Nano Banana / Veo / Kling) is allowed for: decorative backgrounds, illustrative diagrams (e.g., "how a gutter guard works"), seasonal hero overlays, abstract textures. NEVER for fake before/after or fabricated jobsite photos. (See section 9 for the AI guardrails.)

**Components must include:**
- Hero with headline + subhead + dual CTA (Quote + Call) + trust strip (years in business, jobs completed, review count).
- Service card grid with icon, headline, 1-line description, link.
- Location card grid with city name, hero photo of a real local job, link.
- Product comparison table.
- Configurator quiz (4 questions → product recommendation).
- Before/after slider (reactive, accessible).
- Sticky mobile call bar.
- Sticky desktop quote button.
- Review carousel pulling from local data file.
- FAQ accordion with FAQPage schema markup.
- Author byline (Scott's photo + bio + cred).
- Related posts/services/locations footer module on every page.

## 6. Content Collections (Data Model)

Defined in `src/content/config.ts` (file is scaffolded in this repo). Schemas:

**`services`** — id, title, slug, hero, tagline, description, icon, featuredOrder, faq[], relatedServices[], relatedProducts[], seoTitle, seoDescription.

**`locations`** — id, city, county, slug, lat, lng, hero, populationContext, climateNotes, neighborhoods[], commonProblems[] (e.g., "Charlottesville's tulip poplars drop seed pods that clog ½-round gutters"), localCaseStudies[], serviceArea (radius miles), seoTitle, seoDescription.

**`products`** — id, title, slug, manufacturer, hero, description, specs (JSON), gpmCapacity, materialType, warrantyYears, idealFor[], notIdealFor[], priceTier (relative), comparison[].

**`caseStudies`** — slug, title, customerCity, dateCompleted, problem, solution, services[], products[], beforePhotos[], afterPhotos[], outcome, customerQuote (optional, with permission flag), authorBylineId.

**`posts`** (blog) — slug, title, publishedDate, updatedDate, author, category, tags[], heroImage, excerpt, content (MDX), relatedPosts[], schema (Article|HowTo|FAQPage), readingTime.

**`authors`** — id, name, title, bio, photo, credentials[], yearsExperience, socialLinks.

**`testimonials`** — quote, name, city, source (google|yelp|angi|text), date, permissionGranted (boolean), associatedJobId.

## 7. SEO Foundation

Non-negotiable on every page:
- Unique `<title>` and `<meta name="description">`.
- Canonical URL.
- Open Graph + Twitter card tags.
- LocalBusiness JSON-LD on home and about pages.
- Service schema on every service page (with areaServed for each location).
- Product schema on product pages.
- BreadcrumbList JSON-LD on every non-home page.
- FAQPage JSON-LD on any page with an FAQ section.
- Review/AggregateRating JSON-LD where reviews are surfaced (only with real review data — never fabricate).
- Sitemap.xml auto-generated by `@astrojs/sitemap`.
- robots.txt allowing all crawlers, sitemap declared.

Performance budget (Core Web Vitals):
- LCP < 2.0s (mobile, 4G simulation).
- INP < 200ms.
- CLS < 0.05.
- Total page weight under 600KB on initial load.
- Lighthouse: 95+ Performance, 100 SEO, 100 Accessibility, 100 Best Practices.

Internal linking rule: every new page must have at least 3 inbound contextual links from existing high-authority pages, and at least 5 outbound contextual links to other pages in the cluster.

## 8. Location Page Strategy (the secret weapon)

Each of the 8 location pages must include:

1. Custom hero photo from a job in that city (NOT a stock skyline).
2. Local market context: 2–3 paragraphs about the city's home stock, common roof types, common gutter problems, tree species (this is what Google's helpful-content classifier rewards).
3. 3+ specific case studies linked from completed jobs in or near that city.
4. Service availability list with response-time promise per area.
5. A custom local FAQ (different questions per city — Charlottesville UVA neighborhood differs from rural Madison farmhouse problems).
6. Embedded map showing the service radius from Barboursville with that city pinned.
7. Google reviews filtered to that city if available.
8. Final CTA: quote form pre-filled with the city.

**Critical rule:** No two location pages may share more than 30% of their copy. Run a similarity check before merge. Each page should read like Scott personally wrote it about that specific town.

## 9. AI Content Guardrails (HCU-Proofing)

You — Justin — mentioned Nano Banana, Veo 3.1, Kling. Use them deliberately, not lazily.

**Where AI helps and is encouraged:**
- Decorative backgrounds, hero overlays, abstract textures.
- Illustrative diagrams (cross-section of a gutter guard, water flow visualizations).
- B-roll cutaways for video (10-second rain, leaves falling, etc.).
- Speeding up writing of FAQ first drafts that Scott then edits with his real words.
- Generating outlines that Scott fills in with his expertise.
- Photo restoration / cleanup of older Scott photos.
- Transcribing Scott's voice memos into rough drafts.

**Where AI is forbidden:**
- Fake before/after photos. Period.
- Fabricated case studies, fake customer quotes, fake reviews, fake jobs.
- AI-written blog posts published without Scott's editorial pass and personal anecdote.
- AI-generated headshots posing as Scott, the crew, or customers.
- AI voiceover impersonating Scott.
- Any "[city] is a wonderful community where homeowners…" generic city filler.

**The test:** Before publishing any AI-touched content, ask: "If a Google quality rater visited this page and was told an LLM helped write it, would they still consider it useful, original, and trustworthy?" If no, kill it or rewrite.

## 10. Lead Capture & Integrations

- Quote form: name, phone, email, address, service interest, photo upload (optional).
- Submit destination: Web3Forms → Scott's email + a Zapier/Make webhook for future CRM.
- Auto-responder email confirming receipt with Scott's calendar link.
- Sticky mobile call button; tel: link with click tracking.
- Live chat: deferred (don't add until lead volume justifies the support burden).
- CRM: build form integration to be CRM-agnostic — Scott may end up on Jobber, Housecall Pro, ServiceTitan, or SureFire Local.

## 11. Build Phases (Claude Code Execution Plan)

**Phase 0 — Foundation (Day 1)**
- Initialize Astro project from this scaffold.
- Wire Tailwind, content collections, layouts, header/footer.
- Deploy a "Hello world" to Vercel with the `*.vercel.app` URL working.

**Phase 1 — Core Pages (Days 2–4)**
- Home, About, Services hub, Quote, Contact.
- One sample service page (Gutter Guards) fully built as the template.
- One sample location page (Charlottesville) fully built as the template.
- One sample product page (Xtreme Gutter Guard) fully built as the template.
- One sample case study fully built as the template.
- All schema markup wired.

**Phase 2 — Replicate (Days 5–7)**
- Build remaining 6 service pages using the established template.
- Build remaining 7 location pages — each with custom local copy, NO templating.
- Build remaining 2 product pages.
- Build 8–12 case studies from Scott's job history.

**Phase 3 — Conversion + Authority (Days 8–10)**
- Configurator quiz.
- Gallery with category filters.
- Reviews page with imported testimonials (real data only).
- Financing and Warranty pages.
- Author bio pages and bylines wired site-wide.

**Phase 4 — Content Engine (Days 11–14)**
- 6 cornerstone blog posts (see CONTENT_TASKS.md for the seed list).
- RSS feed.
- Blog category and tag pages.
- Internal linking audit pass: run a script to verify every page has the required link density.

**Phase 5 — Pre-Flight + Launch (Day 15)**
- Lighthouse audit; fix anything below targets.
- Schema validator pass on every page.
- Mobile QA on real devices.
- Submit sitemap to Search Console.
- Configure 301 redirects from old URLs to new.
- Flip DNS once Scott approves.

## 12. Repository Layout

```
rcs-website/
├─ CLAUDE.md                        # Read first, every session
├─ PROJECT_BRIEF.md                 # This document
├─ CONTENT_TASKS.md                 # Dennis Yu task library
├─ SCOTT_CHECKLIST.md               # What we need from Scott
├─ package.json
├─ astro.config.mjs
├─ tailwind.config.mjs
├─ tsconfig.json
├─ public/
│  ├─ logo.svg                      # Scott's logo (placeholder until provided)
│  ├─ favicon.ico
│  └─ images/
│     ├─ jobs/                       # Real Scott job photos
│     ├─ products/                   # Mined from leafsolution.com (with permission)
│     └─ ai/                         # AI-generated B-roll and decorative
├─ src/
│  ├─ content/
│  │  ├─ config.ts                  # Zod schemas
│  │  ├─ services/*.md
│  │  ├─ locations/*.md
│  │  ├─ products/*.md
│  │  ├─ case-studies/*.mdx
│  │  ├─ posts/*.mdx
│  │  ├─ authors/*.json
│  │  └─ testimonials/*.json
│  ├─ components/
│  │  ├─ Header.astro
│  │  ├─ Footer.astro
│  │  ├─ Hero.astro
│  │  ├─ ServiceCard.astro
│  │  ├─ LocationCard.astro
│  │  ├─ QuoteForm.astro
│  │  ├─ BeforeAfterSlider.astro
│  │  ├─ Configurator.astro
│  │  ├─ FAQ.astro
│  │  ├─ AuthorByline.astro
│  │  ├─ ReviewCarousel.astro
│  │  └─ schemas/
│  │     ├─ LocalBusinessSchema.astro
│  │     ├─ ServiceSchema.astro
│  │     └─ FAQSchema.astro
│  ├─ layouts/
│  │  ├─ BaseLayout.astro
│  │  ├─ ServiceLayout.astro
│  │  ├─ LocationLayout.astro
│  │  └─ PostLayout.astro
│  └─ pages/
│     ├─ index.astro
│     ├─ about.astro
│     ├─ quote.astro
│     ├─ services/index.astro
│     ├─ services/[slug].astro
│     ├─ locations/index.astro
│     ├─ locations/[slug].astro
│     ├─ products/[slug].astro
│     ├─ case-studies/[slug].astro
│     └─ blog/[slug].astro
└─ scripts/
   ├─ check-internal-links.mjs       # Audit link density
   ├─ check-page-similarity.mjs      # Catch >30% similar pages
   └─ generate-job-list.mjs           # Convert Scott's job CSV → case studies
```

## 13. What This Site Is NOT

To stay disciplined, here's what we're explicitly not building:

- A SaaS app. No user accounts.
- A blog network across multiple sites.
- A booking calendar (yet — defer until volume justifies).
- A customer portal.
- An e-commerce store.

If the scope expands later, fine — but the build starts focused on *winning organic search and converting visitors to quote requests.* Everything else is a distraction.

## 14. Definition of Done (v1 launch)

The site is launchable when:
- All 30+ core pages built with unique content.
- Lighthouse mobile scores meet section 7 budget.
- Every schema validates on schema.org validator.
- Every form submits successfully end-to-end.
- Every internal link returns 200 (no 404s).
- 6+ cornerstone blog posts published.
- 8+ case studies published.
- All location pages have unique custom copy (verified by similarity script).
- Search Console verified, sitemap submitted.
- 301 redirect map from old site complete.
- Scott has approved on a staging URL.

After launch, the work shifts permanently to content production — see CONTENT_TASKS.md.
