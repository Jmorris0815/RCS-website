import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface MultiStepFormProps {
  /** Pre-resolved Google Ads conversion target (e.g. `AW-XXXX/abc`). Empty string = no Ads conversion call. */
  adsSendTo?: string;
  /** Phone number to surface in the error fallback CTA. */
  phoneRaw: string;
  phoneDisplay: string;
}

const SERVICE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'install', label: 'Install' },
  { value: 'guards', label: 'Guards' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'repair', label: 'Repair' },
  { value: 'halfround', label: 'Half-round' },
  { value: 'fascia', label: 'Fascia' },
];

// Mirrors the regex in /api/quote.ts so the client and server agree.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Step = 1 | 2;
type Status = 'idle' | 'pending' | 'error';

/**
 * Two-step lead form. Step 1 gathers name + ZIP. Step 2 gathers phone, email,
 * address, services, message → POST /api/quote.
 *
 * The CRITICAL behavior preserved from the original single-step form:
 *   - Server-side time-based bot check via `_t` (form-load timestamp)
 *   - JSON POST to /api/quote (matches existing endpoint contract)
 *   - On success: gtag conversion + generate_lead + dataLayer lead_submit,
 *     then redirect to /thank-you?lead=<contactId>
 *   - `formSource: 'free-estimate-landing'` tag (becomes a GHL contact tag)
 */
export default function MultiStepForm({ adsSendTo = '', phoneRaw, phoneDisplay }: MultiStepFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Per-field error messages (server-returned validation OR client-side checks).
  // Cleared on the next keystroke in that field so we don't yell at the user
  // while they're fixing it.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const loadedAt = useRef<number>(Date.now());

  const [name, setName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadedAt.current = Date.now();
  }, []);

  // Helper: clear a single field's error (call from onChange so it disappears
  // as soon as the user starts fixing it).
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const goToStep2 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    const zipDigits = postalCode.trim().replace(/\D/g, '');
    if (!postalCode.trim()) errs.postalCode = 'ZIP code is required';
    else if (zipDigits.length < 5) errs.postalCode = 'Please enter a valid ZIP';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setStep(2);
  };

  const toggleService = (val: string) => {
    setServices((prev) => (prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation pass — same rules as the server. Catches the
    // common cases before we burn an API round-trip.
    const errs: Record<string, string> = {};
    if (!phone.trim()) errs.phone = 'Phone is required';
    else if (phone.replace(/\D/g, '').length < 10) errs.phone = 'Please enter a 10-digit phone number';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) errs.email = 'Please enter a valid email address';
    if (!address.trim()) errs.address = 'Property address is required';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setStatus('pending');
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      state: 'VA',
      services,
      message: message.trim(),
      formSource: 'free-estimate-landing',
      _t: loadedAt.current,
    };

    try {
      const res = await fetch(`${window.location.origin}/api/quote`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let data: any = null;
      try { data = await res.json(); } catch {}

      if (res.ok && data && data.ok) {
        const w = window as any;
        const contactId = data.contactId || '';
        const thankYouUrl = '/thank-you' + (contactId ? `?lead=${encodeURIComponent(contactId)}` : '');
        const goToThankYou = () => {
          window.location.href = thankYouUrl;
        };

        // Fire generate_lead and dataLayer push first — they don't gate the redirect.
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({
          event: 'lead_submit',
          form_source: 'free-estimate-landing',
          value: 4200,
          currency: 'USD',
          page_path: '/free-estimate',
        });
        if (typeof w.gtag === 'function') {
          w.gtag('event', 'generate_lead', { value: 4200, currency: 'USD' });
        }

        // Fire the Ads conversion with event_callback so the redirect waits
        // for the beacon to actually depart. Without this, the synchronous
        // navigation cancels the in-flight request to googleads.g.doubleclick.net
        // and the conversion never reaches Google — which is why "RCS Lead Form
        // Submit" stayed Inactive in Google Ads since 2026-04-29.
        if (typeof w.gtag === 'function' && adsSendTo) {
          let redirected = false;
          const safeRedirect = () => {
            if (redirected) return;
            redirected = true;
            goToThankYou();
          };
          w.gtag('event', 'conversion', {
            send_to: adsSendTo,
            value: 4200,
            currency: 'USD',
            event_callback: safeRedirect,
          });
          // Fallback: ad blocker, network glitch, or gtag never confirms — go anyway.
          setTimeout(safeRedirect, 2000);
        } else {
          goToThankYou();
        }
        return;
      }

      // Server-side field validation — surface per-field errors in the form.
      if (data?.error === 'validation_failed' && data?.fields && typeof data.fields === 'object') {
        setFieldErrors(data.fields as Record<string, string>);
        setStatus('idle');
        return;
      }

      // GHL itself rejected a field (e.g. malformed email it caught even
      // though our regex passed). Show the detail in the inline banner so
      // the user knows which field to fix.
      if (data?.error === 'ghl_validation' && typeof data?.detail === 'string') {
        setStatus('error');
        setErrorMessage(`One of the fields needs another look: ${data.detail}`);
        return;
      }

      console.error('[free-estimate] non-OK response', res.status, data);
      setStatus('error');
      setErrorMessage(
        data?.error === 'too_fast'
          ? 'Whoa — that was quick. Take a breath and submit again, or call us directly.'
          : "Couldn't submit just now. The fastest path is to call us — we'll get you scheduled.",
      );
    } catch (err) {
      console.error('[free-estimate] fetch error', err);
      setStatus('error');
      setErrorMessage('Network hiccup. Call us at ' + phoneDisplay + ' and we’ll get you scheduled.');
    }
  };

  const inputBase =
    'w-full rounded-lg border px-3.5 py-3 text-base focus:outline-none focus:ring-2 transition';
  const inputClass = (field: string) =>
    `${inputBase} ${
      fieldErrors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : 'border-line focus:border-brand-primary focus:ring-brand-primary/20'
    }`;

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <div className="text-sm text-red-600 mt-1" role="alert" aria-live="polite">
        {fieldErrors[field]}
      </div>
    ) : null;

  return (
    <form
      id="rcs-fe-form"
      onSubmit={handleSubmit}
      className="card p-6 lg:p-7 bg-white shadow-card scroll-mt-24"
      noValidate
    >
      <div className="text-center mb-4">
        <p className="kicker">Get your free estimate</p>
        <p className="text-sm text-ink-muted mt-1">
          Step <span className="font-bold text-brand-primary">{step}</span> of 2 ·
          <span className="ml-1">Takes 30 seconds.</span>
        </p>
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-brand-primary' : 'w-2 bg-line-dark'}`} />
          <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-brand-primary' : 'w-2 bg-line-dark'}`} />
        </div>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <label className="block">
                <span className="block text-sm font-semibold mb-1">Your name</span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                  className={inputClass('name')}
                  aria-invalid={!!fieldErrors.name}
                />
                <FieldError field="name" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold mb-1">ZIP code</span>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="postal-code"
                  value={postalCode}
                  onChange={(e) => { setPostalCode(e.target.value); clearFieldError('postalCode'); }}
                  className={inputClass('postalCode')}
                  aria-invalid={!!fieldErrors.postalCode}
                />
                <FieldError field="postalCode" />
              </label>
              <button
                type="button"
                onClick={goToStep2}
                className="btn-primary w-full text-base"
              >
                Continue →
              </button>
              <p className="text-xs text-ink-subtle text-center">
                30 seconds. We respond within one business day. No spam.
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-ink-muted hover:text-brand-primary transition flex items-center gap-1"
              >
                ← Back
              </button>

              <label className="block">
                <span className="block text-sm font-semibold mb-1">Phone</span>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearFieldError('phone'); }}
                  className={inputClass('phone')}
                  aria-invalid={!!fieldErrors.phone}
                />
                <FieldError field="phone" />
              </label>

              <label className="block">
                <span className="block text-sm font-semibold mb-1">Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                  className={inputClass('email')}
                  aria-invalid={!!fieldErrors.email}
                />
                <FieldError field="email" />
              </label>

              <label className="block">
                <span className="block text-sm font-semibold mb-1">Property address</span>
                <input
                  type="text"
                  required
                  autoComplete="street-address"
                  placeholder="Street, city"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); clearFieldError('address'); }}
                  className={inputClass('address')}
                  aria-invalid={!!fieldErrors.address}
                />
                <FieldError field="address" />
              </label>

              <fieldset>
                <legend className="block text-sm font-semibold mb-2">What do you need? (optional)</legend>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_OPTIONS.map((opt) => {
                    const checked = services.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${
                          checked
                            ? 'border-brand-primary bg-brand-light text-brand-primary font-semibold'
                            : 'border-line hover:border-brand-primary/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => toggleService(opt.value)}
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <label className="block">
                <span className="block text-sm font-semibold mb-1">
                  Anything we should know? <span className="text-ink-subtle font-normal">(optional)</span>
                </span>
                <textarea
                  rows={3}
                  placeholder="Replacement, new install, leak — whatever's prompting the call."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={inputBase + ' border-line focus:border-brand-primary focus:ring-brand-primary/20'}
                />
              </label>

              <button
                type="submit"
                disabled={status === 'pending'}
                className="btn-primary w-full text-base disabled:opacity-70"
              >
                {status === 'pending' ? 'Sending…' : 'Get My Free Estimate →'}
              </button>

              <p className="text-xs text-ink-subtle text-center">
                We respond within one business day. We never share your info.
              </p>

              {status === 'error' && errorMessage && (
                <div className="rounded-lg border-2 border-brand-primary/30 bg-brand-light p-4 text-sm" role="alert" aria-live="assertive">
                  <p className="font-semibold mb-2">Submission didn’t go through.</p>
                  <p className="text-ink-muted mb-3">{errorMessage}</p>
                  <a
                    href={`tel:${phoneRaw}`}
                    data-call-location="landing_form_error"
                    className="btn-primary !text-sm"
                  >
                    Call {phoneDisplay}
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
