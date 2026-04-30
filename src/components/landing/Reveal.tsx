import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /**
   * `up` (default) lifts the content from below as it scrolls into view.
   * `none` keeps it stationary and only fades.
   */
  variant?: 'up' | 'none';
}

/**
 * Fade-up scroll reveal. Renders inert until intersection (handled by
 * `whileInView`), so the only cost on initial load is the framer-motion
 * runtime — which is shared across every island on the page.
 */
export default function Reveal({ children, delay = 0, className, variant = 'up' }: RevealProps) {
  const initial = variant === 'up' ? { opacity: 0, y: 24 } : { opacity: 0 };
  const animate = variant === 'up' ? { opacity: 1, y: 0 } : { opacity: 1 };
  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
