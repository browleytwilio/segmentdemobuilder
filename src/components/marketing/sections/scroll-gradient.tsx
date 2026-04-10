"use client";

import { useScroll, useTransform, motion } from "framer-motion";

export function ScrollGradient() {
  const { scrollYProgress } = useScroll();

  // Opacity of each colour layer transitions in/out as scroll progresses
  const blueOpacity    = useTransform(scrollYProgress, [0, 0.2, 0.45, 0.7],  [0.12, 0.06, 0.02, 0.04]);
  const purpleOpacity  = useTransform(scrollYProgress, [0.1, 0.35, 0.6, 0.85], [0.0,  0.10, 0.12, 0.04]);
  const cyanOpacity    = useTransform(scrollYProgress, [0.4, 0.6, 0.8, 1.0],  [0.0,  0.04, 0.08, 0.03]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Blue layer */}
      <motion.div
        style={{ opacity: blueOpacity }}
        className="absolute -top-1/4 left-1/2 h-[120vh] w-[120vw] -translate-x-1/2 rounded-full bg-marketing-blue blur-[160px]"
      />
      {/* Purple layer */}
      <motion.div
        style={{ opacity: purpleOpacity }}
        className="absolute top-1/4 right-[-20vw] h-[100vh] w-[100vw] rounded-full bg-marketing-purple blur-[180px]"
      />
      {/* Cyan layer */}
      <motion.div
        style={{ opacity: cyanOpacity }}
        className="absolute bottom-0 left-[-10vw] h-[80vh] w-[80vw] rounded-full bg-marketing-cyan blur-[160px]"
      />
    </div>
  );
}
