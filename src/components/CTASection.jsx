import React from "react";
import { ArrowRight } from "lucide-react";

export default function CTASection({ isDark }) {
  return (
    <section className={`py-24 px-6 sm:px-8 ${isDark ? "bg-[#0a0f1e]" : "bg-white"}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
          Ready to transform your workflow?
        </h2>
        <p className={`text-lg mb-10 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Join thousands of developers who are building better, faster with CodeVisualizer
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#workspace"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all transform hover:scale-105 shadow-xl"
            style={{ background: "linear-gradient(90deg,#0046FF 0%, #2b78ff 100%)" }}
          >
            Start Building Now
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#contact"
            className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
              isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-gray-100 text-slate-900 hover:bg-gray-200"
            }`}
          >
            Talk to Sales
          </a>
        </div>
      </div>
    </section>
  );
}