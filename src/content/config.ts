import { defineCollection, z, reference } from 'astro:content';

// ============================================================
// SERVICES
// ============================================================
const services = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      description: z.string(),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      icon: z.string().optional(), // lucide icon name
      featuredOrder: z.number().default(99),
      faqs: z
        .array(
          z.object({
            question: z.string(),
            answer: z.string(),
          })
        )
        .default([]),
      relatedServices: z.array(reference('services')).default([]),
      relatedProducts: z.array(reference('products')).default([]),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }),
});

// ============================================================
// LOCATIONS — every page must have unique local detail
// ============================================================
const locations = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      city: z.string(),
      county: z.string(),
      lat: z.number(),
      lng: z.number(),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      populationContext: z.string(), // 1-2 sentence intro
      climateNotes: z.string(), // weather/seasonal patterns
      neighborhoods: z.array(z.string()).default([]),
      treeSpecies: z.array(z.string()).default([]),
      commonProblems: z
        .array(
          z.object({
            problem: z.string(),
            cause: z.string(),
            recommendation: z.string(),
          })
        )
        .default([]),
      localFaqs: z
        .array(
          z.object({
            question: z.string(),
            answer: z.string(),
          })
        )
        .default([]),
      featuredCaseStudies: z.array(reference('caseStudies')).default([]),
      responseTimeMinutes: z.number().default(45),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }),
});

// ============================================================
// PRODUCTS (Leaf Solution lines, etc.)
// ============================================================
const products = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      manufacturer: z.string().default('Leaf Solution'),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      tagline: z.string(),
      description: z.string(),
      gpmCapacity: z.number().optional(), // gallons per minute
      materialType: z.string(), // "Stainless steel micro-mesh", etc.
      warrantyYears: z.number().optional(),
      idealFor: z.array(z.string()).default([]),
      notIdealFor: z.array(z.string()).default([]),
      priceTier: z.enum(['economy', 'standard', 'premium', 'luxury']),
      colors: z.array(z.string()).default([]),
      relatedProducts: z.array(reference('products')).default([]),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }),
});

// ============================================================
// CASE STUDIES — real jobs, real photos
// ============================================================
const caseStudies = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      customerCity: z.string(),
      customerCounty: z.string().optional(),
      dateCompleted: z.coerce.date(),
      problem: z.string(),
      solution: z.string(),
      outcome: z.string(),
      services: z.array(reference('services')).default([]),
      products: z.array(reference('products')).default([]),
      beforePhotos: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      afterPhotos: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      author: reference('authors'),
      customerQuote: z.string().optional(),
      customerName: z.string().optional(),
      permissionGranted: z.boolean().default(false),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }),
});

// ============================================================
// BLOG POSTS
// ============================================================
const posts = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      publishedDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: reference('authors'),
      category: z.enum([
        'installation',
        'cleaning',
        'guards',
        'repair',
        'commercial',
        'seasonal',
        'comparison',
        'business',
      ]),
      tags: z.array(z.string()).default([]),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      excerpt: z.string().max(200),
      schemaType: z.enum(['Article', 'HowTo', 'FAQPage']).default('Article'),
      relatedPosts: z.array(reference('posts')).default([]),
      relatedServices: z.array(reference('services')).default([]),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      isCornerstone: z.boolean().default(false),
    }),
});

// ============================================================
// AUTHORS — every byline needs a real human
// ============================================================
const authors = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      title: z.string(),
      bio: z.string(),
      photo: image().optional(),
      credentials: z.array(z.string()).default([]),
      yearsExperience: z.number().optional(),
      socialLinks: z
        .object({
          youtube: z.string().url().optional(),
          facebook: z.string().url().optional(),
          instagram: z.string().url().optional(),
          linkedin: z.string().url().optional(),
        })
        .optional(),
    }),
});

// ============================================================
// TESTIMONIALS — only real ones, with permission flag
// ============================================================
const testimonials = defineCollection({
  type: 'data',
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    city: z.string(),
    source: z.enum(['google', 'yelp', 'angi', 'facebook', 'text', 'email', 'in-person']),
    date: z.coerce.date(),
    rating: z.number().min(1).max(5).optional(),
    permissionGranted: z.boolean(), // REQUIRED — never default to true
    associatedJobId: z.string().optional(),
    sourceUrl: z.string().url().optional(),
  }),
});

export const collections = {
  services,
  locations,
  products,
  caseStudies,
  posts,
  authors,
  testimonials,
};
