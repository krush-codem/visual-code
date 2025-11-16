import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * HowItWorksParallax
 * Props:
 *  - isDark: boolean to toggle dark/light visuals
 *
 * Usage:
 *  <HowItWorksParallax isDark={theme === 'dark'} />
 */

export default function HowItWorksParallax({ isDark = true }) {
  const steps = [
    {
      step: "01",
      title: "Write Your Code",
      desc: "Start in our ergonomic editor — autocomplete, lint hints, and instant feedback.",
      color: "#0046FF",
    },
    {
      step: "02",
      title: "Run & Preview",
      desc: "Execute safely in an isolated sandbox. See console, errors and live UI updates.",
      color: "#FF8040",
    },
    {
      step: "03",
      title: "Visualize Results",
      desc: "Auto-generate ASTs, flow diagrams and runtime maps to understand behavior instantly.",
      color: "#0046FF",
    },
    {
      step: "04",
      title: "Share & Collaborate",
      desc: "Share snapshots, invite collaborators and annotate code for effective reviews.",
      color: "#FF8040",
    },
  ];

  return (
    <section
      id="how-it-works"
      className={`relative py-24 px-6 sm:px-10 ${
        isDark ? "bg-[#06090f] text-white" : "bg-gray-50 text-slate-900"
      }`}
    >
      {/* Subtle background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: isDark
            ? "radial-gradient(600px 200px at 20% 10%, rgba(0,70,255,0.08), transparent), radial-gradient(400px 160px at 80% 90%, rgba(255,128,64,0.04), transparent)"
            : "radial-gradient(600px 200px at 20% 10%, rgba(0,70,255,0.04), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Simple workflow — powerful results
          </h2>
          <p
            className={`mt-3 max-w-2xl mx-auto ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            Scroll down to experience the 3D parallax flow — each step reveals
            itself with depth and motion.
          </p>
        </div>

        {/* Stack container */}
        <div className="space-y-12">
          {steps.map((item, idx) => (
            <ParallaxCard key={idx} index={idx} item={item} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- ParallaxCard: one card (local useScroll target) ----- */
function ParallaxCard({ item, index, isDark }) {
  const ref = useRef(null);

  // Track the scroll progress of this card itself.
  // Offsets chosen so the animation "enters" when card approaches center.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Transformations (tweak multipliers for desired intensity)
  // xOffset: small left-right drift alternating per index
  const xOffset = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [index % 2 === 0 ? -40 : 40, 0, index % 2 === 0 ? 40 : -40]
  );
  // yOffset: subtle parallax vertical shift
  const yOffset = useTransform(scrollYProgress, [0, 1], [40, -20]);
  // rotationY / rotationX for 3D tilt
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -8]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [-6, 0, 6]);
  // scale for gentle pop
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1, 0.98]);
  // opacity fade in/out
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0]
  );

  // Reduce tilt on small screens by using CSS media query (class-based)
  // We'll still apply transforms, but overall visual appears calmer on phones.

  return (
    <motion.div
      ref={ref}
      className={`relative isolate rounded-2xl p-8 md:p-10 lg:p-12 overflow-hidden
        ${
          isDark
            ? "bg-white/3 border border-white/6"
            : "bg-white shadow-md border border-slate-100"
        }`}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
    >
      {/* Animated layer */}
      <motion.div
        style={{
          x: xOffset,
          y: yOffset,
          rotateY,
          rotateX,
          scale,
          opacity,
          transformOrigin: "center",
        }}
        className="relative z-10"
      >
        {/* Accent step number (big faded background) */}
        <div
          className="absolute -top-6 -right-6 text-[8rem] font-extrabold opacity-7 select-none pointer-events-none"
          style={{
            color: item.color,
            opacity: 0.06,
            transform: "translateZ(-40px)",
            lineHeight: 1,
          }}
        >
          {item.step}
        </div>

        {/* Content */}
        <div className="relative z-20">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-md flex items-center justify-center text-white font-semibold"
              style={{
                background: item.color,
                boxShadow: `0 8px 24px ${hexToRgba(item.color, 0.18)}`,
              }}
            >
              {item.step}
            </div>

            <h3
              className={`text-xl md:text-2xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {item.title}
            </h3>
          </div>

          <p
            className={`${
              isDark ? "text-slate-300" : "text-slate-700"
            } leading-relaxed`}
          >
            {item.desc}
          </p>

          {/* Subtle CTA / micro-demo placeholder */}
          <div className="mt-6 flex items-center gap-3">
            <div
              className="text-sm rounded px-3 py-1"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#f3f7ff",
              }}
            >
              Live preview
            </div>
            <div
              className="text-sm rounded px-3 py-1"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#fff4f0",
              }}
            >
              AST insights
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating glow behind card (parallax, subtle) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
        style={{
          background: `radial-gradient(400px 160px at 10% 10%, ${hexToRgba(
            item.color,
            0.06
          )}, transparent 40%)`,
          mixBlendMode: isDark ? "screen" : "normal",
          opacity: 1,
          transform: "translateZ(-60px)",
        }}
      />
    </motion.div>
  );
}

/* utility: convert hex to rgba */
function hexToRgba(hex, alpha = 1) {
  const h = hex.replace("#", "");
  const bigint = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
