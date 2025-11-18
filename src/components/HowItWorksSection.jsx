import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

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
      desc: "Start in our ergonomic editor with autocomplete, lint hints, and instant feedback for a smooth development experience.",
      color: "#0046FF",
      gradient: "from-blue-500/10 to-blue-600/5",
    },
    {
      step: "02",
      title: "Run & Preview",
      desc: "Execute safely in an isolated sandbox environment. See console output, errors and live UI updates in real-time.",
      color: "#FF8040",
      gradient: "from-orange-500/10 to-orange-600/5",
    },
    {
      step: "03",
      title: "Visualize Results",
      desc: "Auto-generate ASTs, flow diagrams and runtime maps to understand code behavior and structure instantly.",
      color: "#0046FF",
      gradient: "from-blue-500/10 to-blue-600/5",
    },
    {
      step: "04",
      title: "Share & Collaborate",
      desc: "Share snapshots, invite collaborators and annotate code together for effective reviews and teamwork.",
      color: "#FF8040",
      gradient: "from-orange-500/10 to-orange-600/5",
    },
  ];

  // Duplicate steps for seamless loop
  const duplicatedSteps = [...steps, ...steps, ...steps];

  const controls = useAnimation();
  const containerRef = useRef(null);

  useEffect(() => {
    const animate = async () => {
      const cardWidth = 420;
      const scrollDistance = steps.length * cardWidth;

      await controls.start({
        x: -scrollDistance,
        transition: {
          duration: 30,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    };

    animate();
  }, [controls, steps.length]);

  return (
    <section
      id="how-it-works"
      className={`relative py-24 overflow-hidden ${
        isDark ? "bg-[#06090f] text-white" : "bg-gray-50 text-slate-900"
      }`}
    >
      {/* Subtle background effects */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: isDark
            ? "radial-gradient(600px 200px at 20% 10%, rgba(0,70,255,0.08), transparent), radial-gradient(400px 160px at 80% 90%, rgba(255,128,64,0.04), transparent)"
            : "radial-gradient(600px 200px at 20% 10%, rgba(0,70,255,0.04), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold"
          >
            Simple workflow — powerful results
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`mt-3 max-w-2xl mx-auto ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            Watch our streamlined process flow seamlessly — each step designed
            for maximum efficiency.
          </motion.p>
        </div>

        {/* Horizontal scroll container */}
        <div className="relative">
          {/* Gradient fade edges with enhanced visibility */}

          {/* Scrolling cards */}
          <motion.div
            ref={containerRef}
            animate={controls}
            className="flex gap-6"
            style={{ width: "fit-content" }}
          >
            {duplicatedSteps.map((item, idx) => (
              <StepCard key={idx} item={item} isDark={isDark} index={idx} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ----- StepCard: premium card with floating effect ----- */
function StepCard({ item, isDark, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`relative isolate rounded-3xl p-8 overflow-hidden flex-shrink-0 backdrop-blur-sm
        ${
          isDark
            ? "bg-gradient-to-br from-white/[0.05] to-white/[0.01]"
            : "bg-gradient-to-br from-white to-gray-50/50 shadow-xl"
        }`}
      style={{
        width: "400px",
        height: "340px",
        boxShadow: isDark
          ? `0 8px 32px ${hexToRgba(item.color, 0.15)}`
          : "0 20px 60px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)",
      }}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${hexToRgba(
            item.color,
            0.15
          )}, transparent 60%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.5, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Enhanced step number background - no longer faded */}
      <div
        className="absolute top-4 right-4 text-6xl font-black select-none pointer-events-none z-0"
        style={{
          color: item.color,
          opacity: 0.12,
          lineHeight: 1,
          textShadow: `0 0 40px ${hexToRgba(item.color, 0.3)}`,
        }}
      >
        {item.step}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${
                item.color
              }, ${adjustBrightness(item.color, -20)})`,
              boxShadow: `0 10px 30px ${hexToRgba(
                item.color,
                0.4
              )}, 0 0 0 1px ${hexToRgba(item.color, 0.2)}`,
            }}
          >
            {item.step}
          </motion.div>

          <h3
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {item.title}
          </h3>
        </div>

        <p
          className={`${
            isDark ? "text-slate-300" : "text-slate-600"
          } leading-relaxed text-[15px] flex-grow`}
        >
          {item.desc}
        </p>

        {/* Enhanced tags with animations */}
        <div className="mt-6 flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`text-sm rounded-lg px-4 py-2 font-medium ${
              isDark ? "text-blue-300" : "text-blue-700"
            }`}
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(0,70,255,0.1), rgba(0,70,255,0.05))"
                : "linear-gradient(135deg, #e0edff, #f3f7ff)",
              border: `1px solid ${hexToRgba("#0046FF", 0.2)}`,
            }}
          >
            Live preview
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`text-sm rounded-lg px-4 py-2 font-medium ${
              isDark ? "text-orange-300" : "text-orange-700"
            }`}
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(255,128,64,0.1), rgba(255,128,64,0.05))"
                : "linear-gradient(135deg, #ffe8dd, #fff4f0)",
              border: `1px solid ${hexToRgba("#FF8040", 0.2)}`,
            }}
          >
            AST insights
          </motion.div>
        </div>
      </div>

      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow: `inset 0 0 60px ${hexToRgba(item.color, 0.08)}`,
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

/* utility: adjust color brightness */
function adjustBrightness(hex, percent) {
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
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  r = Math.max(0, Math.min(255, r + (r * percent) / 100));
  g = Math.max(0, Math.min(255, g + (g * percent) / 100));
  b = Math.max(0, Math.min(255, b + (b * percent) / 100));

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
