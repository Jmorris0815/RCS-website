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
  // Which on-site form posted this lead (e.g. "free-estimate-landing").
  // Becomes a contact tag (`source-<slug>`) so dealers can filter leads by
  // landing page in GHL — without changing existing forms that omit it.
  formSource?: string;
  // form-load timestamp (ms epoch) — used for a too-fast-to-be-human check
  _t?: number | string;
}

// Contacts: we POST to /contacts/upsert (not /contacts/) so a duplicate
// phone/email returns the existing contact id instead of a 400. Without this,
// duplicate submitters land on /thank-you but never get an opportunity created
// → W1 never fires → silent lead loss. Critical with the 8k-contact GHL import.
const GHL_CREATE_ENDPOINT = 'https://services.leadconnectorhq.com/contacts/';
const GHL_UPSERT_ENDPOINT = 'https://services.leadconnectorhq.com/contacts/upsert';
const GHL_OPPORTUNITIES_ENDPOINT = 'https://services.leadconnectorhq.com/opportunities/';
const GHL_PIPELINES_ENDPOINT = 'https://services.leadconnectorhq.com/opportunities/pipelines';
const GHL_VERSION = '2021-07-28';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

// Module-scoped cache for the resolved "New Lead" stage id. Vercel reuses warm
// function instances, so we only hit the pipelines API once per cold start.
let resolvedStageId: string | null = null;
let resolvedStageIdAt = 0;
const STAGE_CACHE_TTL_MS = 60 * 60 * 1000; // 1h — pipelines change rarely

// Always create an opportunity after the contact is upserted — for both new
// contacts AND re-submits of existing contacts. This is what fires W1
// (Scott + Myriam alert). Best-effort: any failure logs and we still return
// success because the contact already landed; ops can recover from the log.
async function createOpportunity(
  contactId: string,
  ghlToken: string,
  ghlLocationId: string,
  contactName: string,
): Promise<void> {
  const pipelineId = import.meta.env.GHL_PIPELINE_ID;
  if (!pipelineId) {
    console.warn('[quote] GHL_PIPELINE_ID env var missing — skipping opportunity creation');
    return;
  }

  const stageId = await resolveNewLeadStageId(ghlToken, ghlLocationId, pipelineId);
  if (!stageId) {
    console.warn('[quote] Could not resolve "New Lead" stage ID — skipping opportunity');
    return;
  }

  try {
    const oppRes = await fetch(GHL_OPPORTUNITIES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlToken}`,
        'Content-Type': 'application/json',
        'Version': GHL_VERSION,
      },
      body: JSON.stringify({
        locationId: ghlLocationId,
        pipelineId,
        pipelineStageId: stageId,
        name: `${contactName || 'Web Lead'} — Web Form`,
        status: 'open',
        contactId,
        monetaryValue: 0,
        source: 'Website Lead Form',
      }),
    });

    if (!oppRes.ok) {
      const errText = await oppRes.text().catch(() => '<no body>');
      // GHL refuses to create a second open opportunity for the same contact
      // ("Can not create duplicate opportunity for the contact"). This is
      // expected behavior when a contact resubmits while their previous opp
      // is still open — Scott has already been alerted on the existing one
      // and the timeline note above records the resubmit. Log at INFO level
      // so it doesn't clutter ops alerting.
      if (oppRes.status === 400 && /duplicate opportunity/i.test(errText)) {
        console.log('[quote] Opportunity already open for contact', contactId, '— skipped (resubmit, note added to timeline)');
      } else {
        console.error('[quote] Opportunity create failed', oppRes.status, errText.slice(0, 500));
      }
    }
  } catch (err) {
    console.error('[quote] Opportunity create threw', err);
  }
}

async function resolveNewLeadStageId(token: string, locationId: string, pipelineId: string): Promise<string | null> {
  if (resolvedStageId && Date.now() - resolvedStageIdAt < STAGE_CACHE_TTL_MS) {
    return resolvedStageId;
  }
  try {
    const url = `${GHL_PIPELINES_ENDPOINT}?locationId=${encodeURIComponent(locationId)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': GHL_VERSION,
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '<no body>');
      console.error('[quote] pipelines fetch non-OK', res.status, errText.slice(0, 300));
      return null;
    }
    const data: any = await res.json().catch(() => null);
    const pipelines: any[] = data?.pipelines || [];
    const pipeline = pipelines.find((p) => p?.id === pipelineId);
    if (!pipeline) {
      console.error('[quote] pipeline id not found in pipelines response', pipelineId);
      return null;
    }
    const stage = (pipeline.stages || []).find((s: any) => /new lead/i.test(s?.name || ''));
    if (!stage?.id) {
      console.error('[quote] no stage matching /new lead/i in pipeline', pipelineId, 'stages:', (pipeline.stages || []).map((s: any) => s?.name));
      return null;
    }
    resolvedStageId = stage.id as string;
    resolvedStageIdAt = Date.now();
    return resolvedStageId;
  } catch (err) {
    console.error('[quote] pipelines fetch error', err);
    return null;
  }
}

// GHL custom field id for "Services Needed" — created via API on 2026-04-28.
// fieldKey: contact.services_needed (LARGE_TEXT). Stable infrastructure value.
const GHL_FIELD_ID_SERVICES_NEEDED = 'mBRnVJy37TCxM1RTDaqL';

// Map the form's checkbox slug values back to readable labels for the alert
// email + the contact's "Services Needed" custom field. Unknown slugs pass
// through unchanged so no lead detail is silently dropped.
const SERVICE_LABELS: Record<string, string> = {
  install: 'Seamless gutter installation',
  guards: 'Gutter guards',
  cleaning: 'Gutter cleaning',
  repair: 'Gutter repair',
  halfround: 'Half-round / copper',
  commercial: 'Commercial',
  fascia: 'Fascia / soffit',
  drainage: 'Drainage / underground',
};
function labelForService(slug: string): string {
  const k = (slug || '').toLowerCase().trim();
  return SERVICE_LABELS[k] || slug;
}

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

  // Required-field validation BEFORE we hit GHL. If we let GHL reject a bad
  // email it returns a 422 and our fallback path may not be configured —
  // resulting in a lost lead. Validate here so the form can highlight the
  // problem field cleanly instead of showing a generic error.
  const fieldErrors: Record<string, string> = {};

  const fullNameForValidation = (body.name || `${body.firstName || ''} ${body.lastName || ''}`).trim();
  if (!fullNameForValidation) fieldErrors.name = 'Name is required';

  const phoneDigits = (body.phone || '').replace(/\D/g, '');
  if (!phoneDigits) fieldErrors.phone = 'Phone is required';
  else if (phoneDigits.length < 10) fieldErrors.phone = 'Please enter a 10-digit phone number';

  const emailVal = (body.email || '').trim();
  // Pragmatic email regex: requires local@domain.tld, no spaces, TLD ≥ 2 chars.
  // Rejects "Google Ads", "asdf", missing TLD, etc. Doesn't try to catch every
  // edge case — server is the safety net; GHL still gets the final say.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailVal) fieldErrors.email = 'Email is required';
  else if (!EMAIL_RE.test(emailVal)) fieldErrors.email = 'Please enter a valid email address';

  const addressVal = (body.address || '').trim();
  if (!addressVal) fieldErrors.address = 'Property address is required';

  if (Object.keys(fieldErrors).length) {
    return corsJson(
      { ok: false, error: 'validation_failed', fields: fieldErrors },
      { status: 400 },
    );
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
  // Tag by which form sent this lead (e.g. `source-free-estimate-landing`).
  const formSourceSlug = (body.formSource || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (formSourceSlug) tags.push(`source-${formSourceSlug}`);

  const ghlToken = import.meta.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const ghlLocationId = import.meta.env.GHL_LOCATION_ID;
  const ghlPipelineId = import.meta.env.GHL_PIPELINE_ID;
  const web3FormsKey = import.meta.env.WEB3FORMS_KEY;

  // Human-readable services list for the custom field + the timeline note.
  const serviceLabels = services.map(labelForService).filter(Boolean);
  const servicesNeeded = serviceLabels.join(' · ');

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
        customFields: servicesNeeded
          ? [{ id: GHL_FIELD_ID_SERVICES_NEEDED, field_value: servicesNeeded }]
          : undefined,
      };
      // Drop undefined for a cleaner request
      Object.keys(ghlPayload).forEach((k) => ghlPayload[k] === undefined && delete ghlPayload[k]);

      const ghlRes = await fetch(GHL_UPSERT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghlToken}`,
          'Content-Type': 'application/json',
          'Version': GHL_VERSION,
        },
        body: JSON.stringify(ghlPayload),
      });

      if (ghlRes.ok) {
        const created = await ghlRes.json().catch(() => null);
        const contactId: string | undefined = created?.contact?.id;
        // Upsert response includes `new: true` for fresh contacts and
        // `new: false` (or omits it) when matching an existing record.
        const wasExisting = created?.new === false;

        if (!contactId) {
          console.error('[quote] GHL upsert returned 200 but no contact.id', JSON.stringify(created).slice(0, 300));
          return corsJson({ ok: false, error: 'no_contact_id' }, { status: 502 });
        }

        // Timeline note — runs for both new and existing contacts. Resubmits
        // get an extra marker line so Scott can tell them apart on the
        // contact's activity timeline. Best-effort.
        try {
          const noteLines: string[] = [];
          if (servicesNeeded) noteLines.push(`Services requested: ${servicesNeeded}`);
          if (message) noteLines.push('', message);
          if (wasExisting) noteLines.push('', '(Resubmitted via web form — existing contact)');
          if (noteLines.length) {
            await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${ghlToken}`,
                'Content-Type': 'application/json',
                'Version': GHL_VERSION,
              },
              body: JSON.stringify({ body: noteLines.join('\n') }),
            }).catch((err) => console.error('[quote] GHL note POST failed', err));
          }
        } catch (err) {
          console.error('[quote] post-create note step errored', err);
        }

        // CRITICAL: opportunity is created for BOTH new and existing contacts.
        // Every submit gets a fresh opportunity in "New Lead" stage, which
        // fires W1 (Scott + Myriam alert).
        const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
          || email || phone || 'Web Lead';
        await createOpportunity(contactId, ghlToken, ghlLocationId, fullName);

        return corsJson({
          ok: true,
          source: 'ghl',
          contactId,
          duplicate: wasExisting,
        });
      }
      // Log non-OK status for ops visibility (Vercel function logs)
      const errText = await ghlRes.text().catch(() => '<no body>');
      console.error('[quote] GHL non-OK', ghlRes.status, errText.slice(0, 500));

      // 422 = GHL validation error (e.g. malformed email that slipped through
      // our pre-check, or a field GHL didn't like). Surface the problem field
      // to the form instead of falling through to the unconfigured fallback.
      if (ghlRes.status === 422) {
        let ghlMsg = 'One of the fields needs another look.';
        try {
          const j = JSON.parse(errText);
          if (Array.isArray(j?.message) && j.message.length) ghlMsg = j.message.join(' · ');
          else if (typeof j?.message === 'string') ghlMsg = j.message;
        } catch {}
        return corsJson(
          { ok: false, error: 'ghl_validation', detail: ghlMsg },
          { status: 400 },
        );
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
        services: serviceLabels.join(', '),
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

  // Last resort: log the full lead so it can be recovered from Vercel logs
  // even if both GHL and Web3Forms paths failed. We'd rather have ops noise
  // than a lost lead — Justin can scrape this line from logs to manually
  // recover any leads that fell through during a GHL outage.
  console.error('[quote] ALERT_LOST_LEAD', JSON.stringify({
    firstName,
    lastName,
    email,
    phone,
    address1,
    city,
    services,
    message,
    source,
    formSource: body.formSource || null,
    ts: new Date().toISOString(),
  }));

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
    pipeline_id_present: !!import.meta.env.GHL_PIPELINE_ID,
    stage_id_resolved: !!resolvedStageId,
    web3forms_key_present: !!import.meta.env.WEB3FORMS_KEY,
    // Flip this to false once Justin sets WEB3FORMS_KEY in Vercel — until
    // then, GHL outages mean lost leads (only the ALERT_LOST_LEAD log line
    // can recover them).
    web3forms_recommended: !import.meta.env.WEB3FORMS_KEY,
  });
