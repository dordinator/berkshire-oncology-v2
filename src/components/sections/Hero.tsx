"use client";

import { motion } from "framer-motion";
import Button from "../ui/Button";
import HeroSketch from "../HeroSketch";
import HeroSwoosh from "../HeroSwoosh";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden mesh-bg noise pt-28"
    >
      {/* pale swoosh strands + line-sketch of the clinic */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroSwoosh />
        <HeroSketch />
      </div>

      {/* readability veil — kept light so the swoosh stays visible */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-canvas/25 via-transparent to-canvas/55" />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="mb-8"
        >
          <span className="eyebrow rounded-full border border-black/10 bg-white/60 px-4 py-2 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Consultant-led private oncology · Reading, Berkshire
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="heading-xl max-w-5xl"
        >
          <span className="block">Exceptional care,</span>
          <span className="block text-gradient-strong">personal to you.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.7 }}
          className="body-lg mt-8 max-w-2xl"
        >
          Berkshire Oncology Partnership is a group of ten consultant oncologists
          providing private diagnosis, treatment and care across Reading, Berkshire
          and the surrounding area.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.7 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Button href="/consultants" variant="primary">
            Meet our consultants
          </Button>
          <Button href="/contact#guidance" variant="ghost" arrow={false}>
            Contact the practice
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
