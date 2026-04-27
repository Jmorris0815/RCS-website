/**
 * Single source of truth for site-wide values.
 * Edit here, propagate everywhere.
 */
export const siteConfig = {
  name: 'Right Choice Seamless Gutters',
  shortName: 'RCS Gutters',
  url: 'https://www.rcsgutters.com',
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
