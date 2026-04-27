# RCS Website — Open TODOs

Living list. Tackle top-down. Keep entries terse — link to the relevant file or commit when possible.

## Blockers (must do before public launch)

- [ ] **Disable Vercel Deployment Protection.** Settings → Deployment Protection → Vercel Authentication: **Disabled** for Production. Until that's flipped, the `*.vercel.app` URL returns HTTP 401 and no anonymous visitor (or external Lighthouse run) can reach the site.
- [ ] **Email Leaf Solution to confirm dealer-asset rights** for the photos and panel-line diagrams pulled from leafsolution.com (`public/images/products/`). RCS is an authorized dealer so use is likely permitted, but get it in writing before launch.
- [ ] **Web3Forms access key** — `src/pages/quote.astro` and `src/components/Footer.astro` (newsletter) both reference `value="REPLACE_WITH_WEB3FORMS_KEY"`. Sign up at web3forms.com (free), paste the key, both forms start delivering.

## Confirm with Scott

- [ ] **Founding year.** `siteConfig.foundingYear = 2014` — currently a guess. Appears in About, footer, schema, byline, the "12+ years" stat (calculated as 2026−2014).
- [ ] **License number.** `siteConfig.licenseNumber` is empty; footer + LocalBusiness schema currently omit it.
- [ ] **Email address.** `info@rcsgutters.com` is a placeholder.
- [ ] **Shop address.** `249 Greenwood Farms Ct, Barboursville VA 22923` carried over from the scaffold — verify before launch (it's in schema and footer).
- [ ] **Scott's bio.** `src/content/authors/scott.json` says `PLACEHOLDER` — drives every blog/case-study byline.
- [ ] **Customer-quote permissions.** All 4 case studies have `permissionGranted: false`. Quotes exist in frontmatter but won't render until each customer's OK is on file.
- [ ] **Social URLs.** `siteConfig.socials` (facebook, instagram, youtube, google) are all empty — footer renders empty `#` links and labels them as "TODO link" until provided.
- [ ] **Review platform URLs** for the social-proof section (Google Business, Yelp, Angi). Currently labeled "TODO link" honestly rather than faked.

## Photo backlog (decorative AI-slots that need real photos)

The site currently uses 5 cropped jobsite photos (extracted from Scott's old Rhino-era ads — Scott was on the Rhino crew, all branding stripped) plus 6 Leaf Solution dealer assets. Where no honest photo fit, decorative AI-slots are used and clearly labeled:

- [x] ~~**Scott's portrait**~~ — wired. Real headshot lives at `public/images/team/scott.{jpg,webp,avif}` and renders in the homepage owner-intro section.
- [ ] **RCS-branded parts diagram** — slot expected at `public/images/products/rcs-parts-diagram.jpg`, intended to replace the Leaf Solution panel-line diagrams on the products hub and the gutter-guards service page. File not present in repo as of this commit; product pages still show the Leaf Solution dealer diagrams.
- [ ] **Truck + jobsite photos** — slots expected at `public/images/jobs/truck-jobsite-barn.jpg` (home hero or about hero) and `public/images/jobs/truck-shop.jpg` (about secondary or homepage trust strip). Neither file is present yet, so the home hero still uses the Leaf Solution corner-miter shot and the about page has no hero photo.

### Raw photo inbox (gitignored — review and rename before wiring)

There's a local `public/images/Inbox/` directory with raw photos staged for review (gitignored, so they don't ship to Vercel until moved). Candidates I noticed:
- `gutters box truck.jpg` — likely fits the `truck-jobsite-barn.jpg` slot
- `Right choice gutters.jpg` — may be the RCS brand asset / parts diagram source
- `man-cleaning-gutter.jpg`, `downspouts.jpg`, several `copper-gutter-installation*.jpg` and `new-home-gutter-installation*.jpg` shots
- A couple of generated/screenshot images that probably shouldn't ship

To use any of these: rename + crop to the slot's expected filename, drop into the appropriate `public/images/` subfolder (which is tracked), and re-run the build. The `scripts/generate-hero-formats.mjs` script will produce AVIF/WebP variants.
- [ ] **Per-location hero photos.** All 8 location pages currently use a decorative `ai-slot` background. As Scott shoots one signature job per city — Charlottesville, Albemarle, Barboursville, Orange, Madison, Greene, Fluvanna, Louisa — drop the photo into `public/images/jobs/locations/` and replace the slot in `src/pages/locations/[slug].astro` (the hero section's first `<div class="absolute inset-0 ai-slot">`).
- [ ] **Two service-tile slots** on the home page — Half-Round and Commercial currently render as `ai-slot` because we have no clean photos. Tiles in `src/pages/index.astro` `tiles` array, `aiSlot` prop.
- [ ] **Process steps 2 + 3** (Written quote, Schedule) — currently `ai-slot` with calendar/document icons. Could remain as-is (they're abstract concepts) or get real photos of Scott handing a quote, etc.
- [ ] **Albemarle vineyard case study** still has no hero photo wired.
- [ ] **The 3 manual photos** referenced in earlier briefs (RCS truck, residential white half-round downspout, commercial flat-roof gutter) were never present at `public/images/jobs/manual-{1,2,3}.jpg`. Drop them in and they can backfill the home-page tiles + about-page trust block.
- [ ] **OG default image.** No `/og-default.jpg` — social-share previews lack thumbnails. Drop a 1200×630 JPG; passing `image="/og-default.jpg"` from `BaseLayout` (or page-by-page) will opt back in.
- [ ] **Real logo.** `public/logo.svg` is the placeholder red checkmark + Times New Roman wordmark. Replace with Scott's actual wordmark.

## Image-gen note

Round 2 brief asked for 8 location AI background hero images, 5 process icons, an abstract noise texture, and a labeled gutter-guard cross-section diagram. **No image-gen tool was available in this environment.** Where the brief asked for AI imagery, the site currently uses CSS/SVG decorative `ai-slot` placeholders that are clearly labeled "TODO replace" so they don't pretend to be real photos. To execute Round 2's image-gen plan, run a separate pass with whatever image-gen pipeline you have (Midjourney / Veo / Nano Banana / etc.) and drop outputs into `public/images/ai/`, then swap the `ai-slot` blocks for real `<picture>` elements.

## Sources tried previously (still valid)

- **HomeAdvisor** — page returns generic Angi stock illustrations only; real photos are behind their bot-protected API.
- **Facebook page** — login wall, HTTP 400.

## Scope-creep candidates (not blocking launch)

- [ ] Move public/ images into `src/assets/` and use Astro's `<Image />` component natively for AVIF + WebP + responsive srcset (currently using a hand-rolled `PictureHero` + sharp pre-gen via `scripts/generate-hero-formats.mjs`).
- [ ] Real `/privacy/` and `/terms/` pages — footer links to them but they 404 today.
- [ ] Real reviews carousel powered by Google Business Profile API once review URLs are confirmed.
- [ ] Newsletter actually wired into a Mailchimp/Buttondown/Beehiiv list (currently posts to placeholder Web3Forms key).
- [ ] 14 npm vulnerabilities (7 low, 7 moderate) — mostly transitive in lhci/sharp/pdf-poppler dev deps.
