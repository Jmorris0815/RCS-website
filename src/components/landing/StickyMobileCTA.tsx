import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Bottom-pinned CTA that appears on mobile after the hero scrolls past, and
 * hides itself when the lead form is in view (otherwise it competes with the
 * actual form CTA). Tap → smooth-scroll to the form.
 */
export default function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const form = document.getElementById('rcs-fe-form');
    let formInView = false;

    const onScroll = () => {
      const past = window.scrollY > 600;
      setShow(past && !formInView);
    };

    let observer: IntersectionObserver | null = null;
    if (form && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          formInView = entries[0]?.isIntersecting ?? false;
          onScroll();
        },
        { threshold: 0.2 },
      );
      observer.observe(form);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer?.disconnect();
    };
  }, []);

  const handleClick = () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'sticky_cta_click',
      page_path: window.location.pathname,
    });
    const target = document.getElementById('rcs-fe-form');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-brand-primary text-white shadow-[0_-8px_24px_rgba(0,0,0,0.18)]"
        >
          <button
            type="button"
            onClick={handleClick}
            className="w-full py-3.5 px-4 font-bold text-base tracking-tight flex items-center justify-center gap-2"
          >
            Get My Free Estimate
            <span aria-hidden="true">→</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
