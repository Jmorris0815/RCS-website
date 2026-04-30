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

type Step = 1 | 2;
type Status = 'idle' | 'pending' | 'error';

/**
 * Two-step lead form. Step 1 gathers name + ZIP (low friction → "Continue").
 * Step 2 gathers phone, email, address, services, message → POST /api/quote.
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
  const loadedAt = useRef<number>(Date.now());

  const [name, setName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  // Bind the load timestamp on first mount only — re-renders shouldn't
  // reset the value the server uses for the bot check.
  useEffect(() => {
    loadedAt.current = Date.now();
  }, []);

  const goToStep2 = () => {
    if (!name.trim() || !postalCode.trim()) return;
    setStep(2);
  };

  const toggleService = (val: string) => {
    setServices((prev) => (prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !email.trim() || !address.trim()) return;

    setStatus('pending');
    setErrorMessage(null);

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
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({
          event: 'lead_submit',
          form_source: 'free-estimate-landing',
          value: 4200,
          currency: 'USD',
          page_path: '/free-estimate',
        });
        if (typeof w.gtag === 'function') {
          if (adsSendTo) {
            w.gtag('event', 'conversion', { send_to: adsSendTo, value: 4200, currency: 'USD' });
          }
          w.gtag('event', 'generate_lead', { value: 4200, currency: 'USD' });
        }

        const contactId = data.contactId || '';
        window.location.href = '/thank-you' + (contactId ? `?lead=${encodeURIComponent(contactId)}` : '');
        return;
      }

      console.error('[free-estimate] non-OK response', res.status, data);
      setStatus('error');
      setErrorMessage(
        data?.error === 'too_fast'
          ? 'Whoa — that was quick. Take a breath and submit again, or call us directly.'
          : 'Submission didn’t go through. The fastest fix is to call us.',
      );
    } catch (err) {
      console.error('[free-estimate] fetch error', err);
      setStatus('error');
      setErrorMessage('Network hiccup. Call us at ' + phoneDisplay + ' and we’ll get you scheduled.');
    }
  };

  const inputClass =
    'w-full rounded-lg border border-line px-3.5 py-3 text-base focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition';

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
        {/* Progress dots */}
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
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
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
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={inputClass}
                />
              </label>
              <button
                type="button"
                onClick={goToStep2}
                disabled={!name.trim() || !postalCode.trim()}
                className="btn-primary w-full text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="block text-sm font-semibold mb-1">Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="block text-sm font-semibold mb-1">Property address</span>
                <input
                  type="text"
                  required
                  autoComplete="street-address"
                  placeholder="Street, city"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                />
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
                  className={inputClass}
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
