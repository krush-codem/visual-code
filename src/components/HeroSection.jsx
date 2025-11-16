import React from "react";
import { Sparkles, ArrowRight, Play } from "lucide-react";

export default function HeroSection({ isDark }) {
  return (
    <section className="relative pt-32 pb-20 px-6 sm:px-8 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #0046FF 0%, transparent 70%)" }}
        />
        <div 
          className="absolute top-20 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #FF8040 0%, transparent 70%)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
            style={{ 
              background: isDark ? "rgba(0,70,255,0.1)" : "rgba(0,70,255,0.08)",
              border: isDark ? "1px solid rgba(0,70,255,0.2)" : "1px solid rgba(0,70,255,0.15)"
            }}
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDark ? "text-blue-300" : "text-blue-700"}`}>
              The future of code visualization
            </span>
          </div>

          {/* Main Heading */}
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Code meets
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              instant clarity
            </span>
          </h1>

          <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Build, visualize, and collaborate in real-time. CodeVisualizer transforms your development workflow with live previews, AST insights, and seamless team collaboration.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#workspace"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl"
              style={{ background: "linear-gradient(90deg,#0046FF 0%, #2b78ff 100%)" }}
            >
              Start Building Free
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#demo"
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                isDark 
                  ? "bg-white/5 text-white hover:bg-white/10 border border-white/10" 
                  : "bg-white text-slate-900 hover:bg-gray-50 border border-gray-200 shadow-md"
              }`}
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "50K+", label: "Projects Created" },
              { value: "99.9%", label: "Uptime" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{stat.value}</div>
                <div className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 relative">
          <div 
            className={`rounded-2xl overflow-hidden shadow-2xl border ${
              isDark ? "bg-[#0a0f1e] border-white/10" : "bg-white border-gray-200"
            }`}
            style={{ boxShadow: isDark ? "0 25px 50px -12px rgba(0,70,255,0.15)" : "0 25px 50px -12px rgba(0,0,0,0.1)" }}
          >
            <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className={`text-xs ml-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>workspace.js</div>
            </div>
            <div className="grid md:grid-cols-2 gap-px" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
              <div className={`p-6 ${isDark ? "bg-[#0a0f1e]" : "bg-white"}`}>
                <div className={`text-xs mb-3 font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>CODE EDITOR</div>
                <pre className={`font-mono text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}>
{`const visualize = (data) => {
  return {
    ast: parseAST(data),
    output: execute(data),
    metrics: analyze(data)
  };
};

console.log(visualize(code));`}
                </pre>
              </div>
              <div className={`p-6 ${isDark ? "bg-[#0a0f1e]" : "bg-white"}`}>
                <div className={`text-xs mb-3 font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>LIVE OUTPUT</div>
                <div className="space-y-2">
                  <div className={`p-3 rounded-lg ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                    <div className={`text-sm font-mono ${isDark ? "text-blue-300" : "text-blue-700"}`}>✓ AST Generated</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? "bg-green-500/10" : "bg-green-50"}`}>
                    <div className={`text-sm font-mono ${isDark ? "text-green-300" : "text-green-700"}`}>✓ Code Executed</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
                    <div className={`text-sm font-mono ${isDark ? "text-purple-300" : "text-purple-700"}`}>✓ Metrics Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}