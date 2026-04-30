import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  to: number;
  duration?: number;
  /** Render formatter — defaults to `n.toLocaleString('en-US')`. */
  format?: (n: number) => string;
  className?: string;
  /** Optional prefix / suffix (★, +, etc.) rendered outside the animated number. */
  prefix?: string;
  suffix?: string;
}

/**
 * Counts up to `to` once when the element scrolls into view. Honors
 * prefers-reduced-motion by jumping straight to the target value.
 */
export default function AnimatedCounter({
  to,
  duration = 1.6,
  format,
  className,
  prefix,
  suffix,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-20%' });
  const [value, setValue] = useState(0);
  const fmt = format ?? ((n: number) => Math.round(n).toLocaleString('en-US'));

  useEffect(() => {
    if (!inView) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{fmt(value)}{suffix}
    </span>
  );
}
