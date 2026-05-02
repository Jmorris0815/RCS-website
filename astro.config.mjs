import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Canonical schema target for AI crawlers + search engines.
  // The site is reachable at *.vercel.app until DNS flips; the schema URLs
  // point at the intended canonical domain so indexing settles on it.
  site: 'https://www.rcsgutters.com',
  // Static by default; the Vercel adapter deploys any individual route that
  // sets `export const prerender = false;` as a serverless function.
  // /api/quote.ts is the only such route today.
  output: 'static',
  adapter: vercel(),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // /thank-you/ is post-conversion (already noindex but pollutes the
      // sitemap), and /quote/ is the deprecated form route being phased out
      // in favor of /free-estimate/. Neither belongs in the sitemap submitted
      // to Google Search Console.
      filter: (page) => !page.includes('/thank-you/') && !page.includes('/quote/'),
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    domains: [],
    remotePatterns: [],
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  compressHTML: true,
});
