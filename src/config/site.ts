/**
 * Single source of truth for site-wide values.
 * Edit here, propagate everywhere.
 */
export const siteConfig = {
  name: 'Right Choice Seamless Gutters',
  shortName: 'RCS Gutters',
  // Public canonical URL. Currently the Vercel production alias because the
  // rcsgutters.com domain hasn't been pointed at this build yet. Switch back to
  // 'https://www.rcsgutters.com' the moment the DNS flip happens, and add a
  // 301 redirect map from the vercel.app URL to the canonical at the same time.
  url: 'https://rcs-website-justin-morris-projects-f0ac0487.vercel.app',
  canonicalUrl: 'https://www.rcsgutters.com', // intended final canonical
  homeAdvisorProfileUrl: 'https://www.homeadvisor.com/rated.RightChoiceSeamless.42532376.html',
  reviewCount: 217,
  reviewAverage: 4.74, // live aggregateRating from the HomeAdvisor profile (rounded display: 4.7)

  foundingYear: 2014, // confirmed by Scott

  // Primary number = Charlottesville. Used as default phoneRaw / phoneDisplay
  // for backward compatibility (sticky CTAs, header, default callouts).
  phoneRaw: '+14342025666',
  phoneDisplay: '(434) 202-5666',

  // Four regional numbers all ring through to RCS. Each one signals to a
  // local-area customer that we're answering "their" line and reduces the
  // hesitation about "is this an out-of-area call." Use the right number on
  // the right page; toll-free is the universal fallback.
  phones: {
    charlottesville: { display: '(434) 202-5666', raw: '+14342025666', label: 'Charlottesville' },
    culpeperFredericksburg: { display: '(540) 431-3353', raw: '+15404313353', label: 'Culpeper & Fredericksburg' },
    richmond: { display: '(804) 372-0089', raw: '+18043720089', label: 'Richmond' },
    tollFree: { display: '(844) 744-4824', raw: '+18447444824', label: 'Toll-free' },
  },

  email: 'sales@rcsgutters.com', // confirmed by Scott
  address: {
    street: '249 Greenwood Farms Ct',
    city: 'Barboursville',
    state: 'VA',
    zip: '22923',
  },
  hours: {
    weekdays: '9:00 AM – 5:00 PM',
    saturday: '9:00 AM – 12:00 PM',
    sunday: 'Closed',
  },
  socials: {
    facebook: '', // PROVIDE
    instagram: '', // PROVIDE
    youtube: '', // PROVIDE — Scott's YouTube channel for amplification
    google: 'https://www.google.com/maps/place/?q=place_id:CHANGE_ME',
  },
  // Google Tag Manager container (scraped from the live rcsgutters.com WordPress
  // site). All Google Ads conversion tags, phone-call conversions, and any future
  // analytics tags are configured INSIDE this GTM container on Google's servers,
  // not in this codebase. To wire a new conversion (or change AW- IDs), edit the
  // GTM dashboard — no code change here. The `phone_call_click` dataLayer event
  // fired by BaseLayout is the trigger Scott uses for the phone-conversion tag.
  googleTagManagerId: 'GTM-ND38S235',

  // Scott's Virginia contractor license is currently INACTIVE (terminated by
  // Diana). Phase 1 license recovery is in progress. Intentionally empty;
  // do NOT print a license number anywhere on the public site until the
  // recovery clears. The footer says "Licensed and insured" without a number.
  licenseNumber: '',
  serviceRadiusMiles: 30,
  serviceCenterCoords: {
    lat: 38.1518,
    lng: -78.2789, // Approx Barboursville
  },
} as const;

export type SiteConfig = typeof siteConfig;
