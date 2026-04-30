import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Slim progress bar pinned to the top of the viewport that fills as the
 * visitor scrolls. Spring-damped so it reads as smooth motion, not jitter.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 22, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0% 50%' }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-brand-primary z-[60] pointer-events-none"
      aria-hidden="true"
    />
  );
}
