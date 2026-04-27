# RCS Website — Open TODOs

Living list. Tackle top-down. Keep entries terse — link to the relevant file or commit when possible.

## Blockers (must do before public launch)

- [ ] **Disable Vercel Deployment Protection.** Settings → Deployment Protection → Vercel Authentication: **Disabled** for Production. Until that's flipped, the `*.vercel.app` URL returns HTTP 401 and no anonymous visitor (or Lighthouse run from outside) can reach the site.
- [ ] **Email Leaf Solution to confirm dealer-asset rights** for the product photos and panel-line diagrams pulled from leafsolution.com (`public/images/products/`). RCS is an authorized dealer so use is likely permitted, but get it in writing before launch. Contact: the rep at the Rochelle, VA factory.
- [ ] **Web3Forms access key.** `src/pages/quote.astro` has `value="REPLACE_WITH_WEB3FORMS_KEY"`. Sign up at web3forms.com (free), paste the key, and the form will start delivering leads to Scott's email. Until then form posts return 400.

## Confirm with Scott

- [ ] **Founding year.** `siteConfig.foundingYear = 2014` is currently a guess. Appears in About, footer, schema, byline, and the `10+ years` hero badge.
- [ ] **License number.** `siteConfig.licenseNumber` is empty; footer reads "License coming soon."
- [ ] **Email address.** `info@rcsgutters.com` is a placeholder.
- [ ] **Shop address.** `249 Greenwood Farms Ct, Barboursville VA 22923` carried over from the scaffold — verify before it hits the schema and search engines.
- [ ] **Scott's bio.** `src/content/authors/scott.json` currently has `PLACEHOLDER` text. Used by every blog and case-study byline.
- [ ] **Customer-quote permissions.** All 4 case studies have `permissionGranted: false`. Quotes exist in frontmatter but won't render until Scott confirms each customer's OK to publish.
- [ ] **Social URLs.** `siteConfig.socials` (facebook, instagram, youtube, google) are all empty.

## Photo backlog

We currently ship with 5 cropped jobsite photos (extracted from Scott's old Rhino-era ads — legitimate to reuse since Scott was on the Rhino crew, and we stripped all Rhino/Bucs branding) plus 6 Leaf Solution dealer product photos. Replace as Scott's own crew photos roll in.

- [ ] **The 3 manual photos** referenced in the design brief (RCS truck, residential white half-round downspout, commercial flat-roof gutter) were not present at `public/images/jobs/manual-1..3.jpg` when the design pass ran. Drop them in and we'll wire them into the about-page trust strip and a couple of location heroes.
- [ ] **Per-location hero photos.** All 8 location pages (`src/content/locations/`) are currently text-only. As Scott shoots one signature job per city — Charlottesville, Albemarle, Barboursville, Orange, Madison, Greene, Fluvanna, Louisa — drop the photo into `public/images/jobs/locations/` and add a `HERO_PHOTOS[slug]` entry in `src/pages/locations/[slug].astro`.
- [ ] **Real before/after photos** for the Charlottesville, Greene, and Madison case studies. Current hero photos are stand-ins from the Rhino archive. Once Scott approves real customer-job photos with permission, swap the entries in `src/pages/case-studies/[slug].astro` `HERO_PHOTOS` map.
- [ ] **Albemarle vineyard case study** (`albemarle-vineyard-multi-building-drainage`) has no hero photo wired — needs a real shot of the multi-building drainage work.
- [ ] **OG default image.** Currently no `/og-default.jpg`, so social-share previews have no thumbnail. Drop a 1200×630 JPG at `public/og-default.jpg` and pass `image="/og-default.jpg"` from `BaseLayout` (or page-by-page) to opt back in. The brand-red corner-miter Leaf Solution shot would work well.
- [ ] **Real logo.** `public/logo.svg` is the placeholder red checkmark + Times New Roman wordmark. Drop in Scott's actual wordmark SVG when available.

## Sources that were tried and didn't work

- **HomeAdvisor profile** (`https://www.homeadvisor.com/rated.RightChoiceSeamless.42532376.html`) — page returns HTTP 200 but the SPA only serves generic Angi/HomeAdvisor stock illustrations in the initial HTML. Real project photos (if any) load via subsequent API calls behind their bot protection.
- **Facebook page** (`https://www.facebook.com/rcsgutters/`) — HTTP 400, login wall as expected.

## Scope-creep candidates (not blocking launch)

- [ ] Move public/ images into `src/assets/` and use Astro's `<Image />` component for AVIF/WebP + responsive srcset. Today they're plain `<img>` tags from `public/`, which is fine for Lighthouse but leaves bandwidth on the table.
- [ ] Strip `public/images/source/extracted/` and `public/images/source/candidates/` from the deploy. Scratch work — keep in repo for re-cropping but `.vercelignore` it so it doesn't ship.
- [ ] 14 npm vulnerabilities (7 low, 7 moderate) — mostly transitive in lhci/sharp/pdf-poppler dev deps, not in the production bundle. Audit later.
