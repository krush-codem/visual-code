// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Layers, 
  Bot, 
  ChevronRight, 
  Zap, 
  CodeSquare, 
  Cpu, 
  GitBranch 
} from "lucide-react";

const FeaturePoint = ({ text }) => (
  <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300 transition-colors">
    <Zap className="w-3 h-3 text-indigo-500" />
    <span className="text-xs font-medium">{text}</span>
  </div>
);

const ToolCard = ({ title, subLabel, description, icon: Icon, features, link, colorClass, buttonText }) => (
  <Link to={link} className="group relative flex-1">
    {/* Glowing Background Effect */}
    <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-r ${colorClass} opacity-20 blur group-hover:opacity-40 transition duration-500`} />
    
    <div className="relative h-full bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col transition-all duration-300 transform group-hover:-translate-y-2 group-hover:bg-slate-900 group-hover:border-white/20">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${colorClass.includes('indigo') ? 'bg-indigo-600 shadow-indigo-900/20' : 'bg-blue-600 shadow-blue-900/20'}`}>
        <Icon className="text-white w-8 h-8" />
      </div>
      
      <div className="mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 opacity-80">{subLabel}</span>
        <h3 className="text-2xl font-bold text-white mt-1">{title}</h3>
      </div>
      
      <p className="text-slate-400 text-sm leading-relaxed mb-8">
        {description}
      </p>
      
      <div className="space-y-3 mb-10">
        {features.map((f, i) => <FeaturePoint key={i} text={f} />)}
      </div>
      
      <div className="mt-auto flex items-center justify-between group/btn">
        <span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform flex items-center gap-2">
          {buttonText} <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
        <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover/btn:border-white/30 transition-colors`}>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover/btn:text-white transition-colors" />
        </div>
      </div>
    </div>
  </Link>
);

const HomePage = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start md:justify-center p-6 py-12 md:py-6 selection:bg-indigo-500/30 overflow-y-auto">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        {/* Hero Header */}
        <header className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Architecture v2.0 Active</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] md:leading-none italic">
            Visualize Your <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Logic.</span>
          </h1>
          
          <p className="max-w-2xl text-slate-400 text-base md:text-xl font-medium leading-relaxed mx-auto px-4">
            Deep architectural mapping and logic sequencing for modern engineering. 
            Stop reading code. Start seeing it.
          </p>
        </header>

        {/* Tool Cards Container */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in fade-in zoom-in-95 duration-1000 delay-300 px-2 sm:px-0">
          <ToolCard 
            title="ReactArchitect"
            subLabel="Project Engine"
            description="Complete architectural mapping for React projects. Visualize component trees, hooks, and prop-drilling in real-time."
            icon={Layers}
            features={["Component Blueprints", "Usage Archetypes", "Hot-Reloading Graph"]}
            link="/project"
            colorClass="from-indigo-600 to-violet-600"
            buttonText="Launch ReactArchitect"
          />
          
          <ToolCard 
            title="PyViz"
            subLabel="Logic Engine"
            description="Deep logic sequencing for Python. Analyze complex DSA problems with step-by-step execution ordering and AST mapping."
            icon={Bot}
            features={["DSA Sequencing", "Recursion Detection", "Interactive Node Insights"]}
            link="/live"
            colorClass="from-blue-600 to-indigo-600"
            buttonText="Launch PyViz"
          />
        </div>

        {/* Footer info */}
        <footer className="mt-20 flex items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-700">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <GitBranch className="w-3 h-3" /> Built for Scale
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <CodeSquare className="w-3 h-3" /> AST Integrated
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
