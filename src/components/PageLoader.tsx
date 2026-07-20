"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// A brief, reliable intro veil. Dismisses on a single short timer (independent
// of requestAnimationFrame, which is throttled in background tabs) so it never
// gets stuck and keeps LCP low.
export default function PageLoader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-canvas"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-accent to-lilac" />
            <span className="font-display text-3xl tracking-tight text-ink">
              Berkshire Oncology<span className="text-accent">.</span>
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
