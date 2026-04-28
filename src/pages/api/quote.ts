// POST /api/quote
//
// Quote-form submissions land here. Primary path: GoHighLevel (LeadConnector)
// contacts API. Fallback path: Web3Forms email-only delivery, so leads never
// disappear silently if GHL is down / rate-limiting / mis-configured.
//
// Returns JSON: { ok: true, source: 'ghl' | 'web3forms-fallback' }
//                 or { ok: false, error: string } on total failure.
import type { APIRoute } from 'astro';

// Mark this route as server-rendered so the Vercel adapter deploys it as a
// serverless function rather than trying to prerender at build time.
export const prerender = false;

interface QuoteBody {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  services?: string[] | string;
  message?: string;
  source?: string;
  // form-load timestamp (ms epoch) — used for a too-fast-to-be-human check
  _t?: number | string;
}

const GHL_ENDPOINT = 'https://services.leadconnectorhq.com/contacts/';
const GHL_VERSION = '2021-07-28';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

// Form may be served from rcsgutters.com (apex) or www.rcsgutters.com. The
// browser treats those as different origins, so a same-origin POST from apex
// to /api/quote that ends up at www would be a cross-origin call requiring
// CORS. Wildcard is safe here: no credentials, no auth cookies, public lead form.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '86400',
} as const;

function corsJson(body: unknown, init?: ResponseInit) {
  const merged: ResponseInit = { ...init, headers: { ...CORS_HEADERS, ...(init?.headers || {}) } };
  return Response.json(body, merged);
}

function toE164(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  return raw || '';
}

function splitName(full: string, first?: string, last?: string) {
  if (first || last) return { firstName: (first || '').trim(), lastName: (last || '').trim() };
  const parts = (full || '').trim().split(/\s+/);
  if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) {
    return { firstName: '', lastName: '' };
  }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function citySlug(city: string): string {
  return (city || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function asArray(v: string[] | string | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  // FormData with multiple checkboxes named "services" arrives as repeated entries;
  // a single value comes through as a string.
  return [v];
}

async function readBody(request: Request): Promise<QuoteBody> {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await request.json()) as QuoteBody;
  }
  // FormData / x-www-form-urlencoded
  const form = await request.formData();
  const body: QuoteBody = {};
  const services: string[] = [];
  for (const [k, v] of form.entries()) {
    if (k === 'services') {
      services.push(String(v));
    } else {
      (body as any)[k] = String(v);
    }
  }
  if (services.length) body.services = services;
  return body;
}

export const POST: APIRoute = async ({ request }) => {
  let body: QuoteBody;
  try {
    body = await readBody(request);
  } catch (err) {
    return corsJson({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  // Time-based bot check. The form stamps Date.now() on load and submits it
  // back as _t; a real human takes well over 1.5s to fill out a form, bots
  // fire instantly. Skip the check entirely if _t is missing or unparseable
  // so we never falsely block someone whose page came out of bfcache or
  // cached HTML predates this field.
  const tNum = typeof body._t === 'string' ? Number(body._t) : body._t;
  if (typeof tNum === 'number' && Number.isFinite(tNum) && tNum > 0) {
    const deltaMs = Date.now() - tNum;
    if (deltaMs >= 0 && deltaMs < 1500) {
      console.log('[quote] too-fast submit blocked, deltaMs=', deltaMs);
      return corsJson({ ok: false, error: 'too_fast' }, { status: 400 });
    }
  }

  const { firstName, lastName } = splitName(body.name || '', body.firstName, body.lastName);
  const phone = toE164(body.phone || '');
  const email = (body.email || '').trim();
  const address1 = (body.address || '').trim();
  const city = (body.city || '').trim();
  const services = asArray(body.services);
  const message = (body.message || '').trim();
  const source = (body.source || 'rcsgutters.com').trim();

  // Tags
  const tags = ['lead-website'];
  const slug = citySlug(city);
  if (slug) tags.push(`city-${slug}`);
  for (const s of services) {
    const sslug = (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (sslug) tags.push(`service-${sslug}`);
  }

  const ghlToken = import.meta.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const ghlLocationId = import.meta.env.GHL_LOCATION_ID;
  const web3FormsKey = import.meta.env.WEB3FORMS_KEY;

  // ---- Primary: GHL contacts API ------------------------------------------
  if (ghlToken && ghlLocationId) {
    try {
      const ghlPayload: Record<string, unknown> = {
        firstName,
        lastName,
        name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address1: address1 || undefined,
        city: city || undefined,
        state: (body.state || 'VA').toUpperCase(),
        postalCode: body.postalCode || undefined,
        source,
        locationId: ghlLocationId,
        tags,
      };
      // Drop undefined for a cleaner request
      Object.keys(ghlPayload).forEach((k) => ghlPayload[k] === undefined && delete ghlPayload[k]);

      const ghlRes = await fetch(GHL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghlToken}`,
          'Content-Type': 'application/json',
          'Version': GHL_VERSION,
        },
        body: JSON.stringify(ghlPayload),
      });

      if (ghlRes.ok) {
        return corsJson({ ok: true, source: 'ghl' });
      }
      // Log non-OK status for ops visibility (Vercel function logs)
      const errText = await ghlRes.text().catch(() => '<no body>');
      console.error('[quote] GHL non-OK', ghlRes.status, errText.slice(0, 500));
      // GHL rejects duplicate contacts (same phone or email) with 400. From
      // the customer's POV their info reached us — treat as success so they
      // don't see a scary error for legitimately re-submitting their details.
      if (ghlRes.status === 400 && /duplicated|matchingField/i.test(errText)) {
        return corsJson({ ok: true, source: 'ghl', duplicate: true });
      }
    } catch (err) {
      console.error('[quote] GHL fetch error', err);
    }
  } else {
    console.error('[quote] GHL env vars missing — skipping primary path');
  }

  // ---- Fallback: Web3Forms (email delivery so the lead is never lost) -----
  if (web3FormsKey) {
    try {
      const w3Payload = {
        access_key: web3FormsKey,
        subject: 'New RCS Gutters Quote Request (GHL fallback)',
        from_name: 'rcsgutters.com',
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        address: address1,
        city,
        state: body.state || 'VA',
        postal_code: body.postalCode || '',
        services: services.join(', '),
        message,
        source,
        _note: 'GHL primary path failed — see Vercel function logs for the GHL error.',
      };
      const w3Res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(w3Payload),
      });
      if (w3Res.ok) {
        return corsJson({ ok: true, source: 'web3forms-fallback' });
      }
      const errText = await w3Res.text().catch(() => '<no body>');
      console.error('[quote] Web3Forms non-OK', w3Res.status, errText.slice(0, 500));
    } catch (err) {
      console.error('[quote] Web3Forms fetch error', err);
    }
  } else {
    console.error('[quote] WEB3FORMS_KEY missing — fallback unavailable');
  }

  // Both failed — surface this so the client UI can show a phone-call CTA.
  return corsJson(
    { ok: false, error: 'delivery_failed', message: 'Lead delivery failed; please call us directly.' },
    { status: 502 }
  );
};

// CORS preflight for the quote-form POST. Browsers fire this when the page
// origin (e.g. https://rcsgutters.com) differs from the API origin
// (https://www.rcsgutters.com), or when the POST sends a Content-Type other
// than the simple types. Reply 204 + the same headers we set on POST.
export const OPTIONS: APIRoute = async () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

// Allow simple GET for healthcheck (returns whether env vars are present;
// never echoes the values themselves).
export const GET: APIRoute = async () =>
  corsJson({
    ok: true,
    ghl_token_present: !!import.meta.env.GHL_PRIVATE_INTEGRATION_TOKEN,
    ghl_location_id_present: !!import.meta.env.GHL_LOCATION_ID,
    web3forms_key_present: !!import.meta.env.WEB3FORMS_KEY,
  });
