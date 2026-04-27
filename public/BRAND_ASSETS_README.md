# public/ — Brand asset drop zone

Drop these files here. Claude Code expects them at these exact paths.

| File | What it is | Where to source it |
|---|---|---|
| `logo.svg` | The "Right Choice Seamless Gutters" wordmark with checkmark, vector format. Preferred. | Have a designer trace the wordmark from the existing image into Illustrator/Figma. |
| `logo.png` | Wordmark as a transparent-background PNG, 600px wide minimum. Fallback if no SVG. | Save the wordmark image at high resolution. |
| `logo-mark.svg` | Just the red checkmark, no text. Used at small sizes (favicons, mobile). | Crop from the wordmark; clean up the curves. |
| `favicon.svg` | 32x32 simple version of the checkmark mark. | Same as `logo-mark.svg`, simplified. |
| `favicon.ico` | Multi-size ICO for older browsers. | Generate from the PNG. |
| `og-default.jpg` | 1200x630 social-share image. Wordmark + tagline + truck photo. | Designed banner. |
| `truck-hero.jpg` | High-res Scott's truck photo (the red box truck) for hero use. | Scott's truck photo — re-shoot in better light if possible. |
| `images/jobs/` | Folder of real Scott job photos, organized by city. | Migrated from Scott's phone library. |
| `images/products/` | Leaf Solution product photography. | Mined from leafsolution.com (with their dealer permission) or shot on actual installs. |
| `images/ai/` | AI-generated decorative imagery only. NEVER fake job photos. | Generated and reviewed before commit. |

## Brand color spec (current best estimates — confirm with Scott)

| Token | Hex | Notes |
|---|---|---|
| `brand.primary` | `#D72027` | RCS red — extracted from wordmark. The truck wrap may be slightly different in print; ask the sign vendor for the exact CMYK/Pantone. |
| `brand.primary-hover` | `#B81A1F` | Darker red for hover/pressed states. |
| `brand.dark` | `#1F1F1F` | Near-black for body copy and dark sections. |
| `brand.accent` | `#0E2C4D` | Deep navy — used sparingly for complementary accents (e.g., links inside dark sections). |
| `brand.light` | `#FFF5F5` | Soft red-tinted background for callouts. |
| `brand.cream` | `#FAF7F2` | Warm neutral background panel. |

If Scott has CMYK/Pantone values from his truck-wrap vendor, drop them in `tailwind.config.mjs` and they become the source of truth instantly.

## Typography

The wordmark uses what looks like a casual italic serif/script style. We will NOT clone that for body type — it would be illegible. The wordmark is preserved as the logo image; body type uses Inter (sans). Headings use Manrope. If Scott wants a different display font, tell us before launch.
