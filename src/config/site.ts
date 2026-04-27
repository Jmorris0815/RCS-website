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
  foundingYear: 2014, // CONFIRM with Scott
  phoneRaw: '+14342025666',
  phoneDisplay: '(434) 202-5666',
  email: 'info@rcsgutters.com', // CONFIRM with Scott
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
  licenseNumber: '', // FILL IN once licensing is resolved
  serviceRadiusMiles: 30,
  serviceCenterCoords: {
    lat: 38.1518,
    lng: -78.2789, // Approx Barboursville
  },
} as const;

export type SiteConfig = typeof siteConfig;
