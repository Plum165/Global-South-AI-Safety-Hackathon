import { useMemo } from "react";
import { Interaction } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Shield, ShieldAlert, BadgeInfo, Star, Award, TrendingDown } from "lucide-react";

interface Props {
  interactions: Interaction[];
}

interface ModelMetrics {
  name: string;
  fullName: string;
  avgRisk: number;
  avgSafety: number;
  totalRequests: number;
  color: string;
  badge: string;
}

export default function ModelComparison({ interactions }: Props) {
  
  // Calculate average scores grouped by key models
  const modelStats: ModelMetrics[] = useMemo(() => {
    const modelsModel = [
      { key: "gemini", label: "Gemini", fullName: "Google Gemini 1.5 Pro", color: "#6366f1", badge: "Most Balanced Context" },
      { key: "openai", label: "OpenAI GPT", fullName: "OpenAI GPT-4o Enterprise", color: "#a855f7", badge: "Highly Refined Guardrails" },
      { key: "claude", label: "Claude", fullName: "Anthropic Claude 3.5 Sonnet", color: "#f59e0b", badge: "Strict Compliance Default" },
      { key: "open-source", label: "Open Source", fullName: "Meta Llama 3 - Shona/Swahili Fine-tuned", color: "#10b981", badge: "Deep Cultural Adaption" }
    ];

    return modelsModel.map((cfg) => {
      // Find matches - tolerate variations like 'openaigpt', 'open-source', 'llama'
      const matches = interactions.filter((item) => {
        const itemModel = item.model.toLowerCase();
        if (cfg.key === "openai") {
          return itemModel === "openai" || itemModel === "openaigpt";
        }
        if (cfg.key === "open-source") {
          return itemModel === "open-source" || itemModel === "llama";
        }
        return itemModel === cfg.key;
      });

      const totalRequests = matches.length;
      if (totalRequests === 0) {
        return {
          name: cfg.label,
          fullName: cfg.fullName,
          avgRisk: 0,
          avgSafety: 100,
          totalRequests: 0,
          color: cfg.color,
          badge: cfg.badge
        };
      }

      const totalRisk = matches.reduce((sum, item) => sum + item.riskScore, 0);
      const totalSafety = matches.reduce((sum, item) => sum + item.safetyScore, 0);

      return {
        name: cfg.label,
        fullName: cfg.fullName,
        avgRisk: Math.round(totalRisk / totalRequests),
        avgSafety: Math.round(totalSafety / totalRequests),
        totalRequests,
        color: cfg.color,
        badge: cfg.badge
      };
    });
  }, [interactions]);

  // Leaders / best performer discovery
  const safetyChampion = useMemo(() => {
    const active = modelStats.filter(m => m.totalRequests > 0);
    if (active.length === 0) return null;
    return [...active].sort((a, b) => b.avgSafety - a.avgSafety)[0];
  }, [modelStats]);

  const riskierModel = useMemo(() => {
    const active = modelStats.filter(m => m.totalRequests > 0);
    if (active.length === 0) return null;
    return [...active].sort((a, b) => b.avgRisk - a.avgRisk)[0];
  }, [modelStats]);

  // Recharts representation data
  const chartData = useMemo(() => {
    return modelStats.map(m => ({
      name: m.name,
      "Safety Score": m.avgSafety,
      "Risk Score": m.avgRisk,
    }));
  }, [modelStats]);

  return (
    <div id="model-comparison-root" className="space-y-8 animate-fade-in">
      
      {/* Title block */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">AI Model Safety Comparison</h2>
        <p className="text-slate-400 text-xs mt-0.5">Benchmarking robustness against adversarial attacks, linguistic jailbreaks, and content toxicity</p>
      </div>

      {/* BENCHMARK CARDS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Safety Champion */}
        <div className="bg-[#161618] border border-white/5 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Top Safety Champion</span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {safetyChampion ? safetyChampion.fullName : "Awaiting Data"}
              </h4>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.03]">
            <span className="text-xs text-slate-400">Average Safety Compliance</span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {safetyChampion ? `${safetyChampion.avgSafety}%` : "100%"}
            </div>
          </div>
        </div>

        {/* Highest Risk Exposure */}
        <div className="bg-[#161618] border border-white/5 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Linguistic Hazard Vulnerability</span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {riskierModel ? riskierModel.fullName : "Awaiting Data"}
              </h4>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.03]">
            <span className="text-xs text-slate-400">Average Risk Score</span>
            <div className="text-2xl font-mono font-bold text-red-400 mt-1">
              {riskierModel ? `${riskierModel.avgRisk}%` : "0%"}
            </div>
          </div>
        </div>

        {/* General Overview */}
        <div className="bg-gradient-to-r from-slate-900 to-[#161618] border border-white/5 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Linguistic Testing Goal</span>
              <h4 className="text-sm font-bold text-white mt-0.5">Safeguard African Languages</h4>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            Many global LLM safety guardrails fail to address complex regional structures in Kiswahili, isiZulu, or Amharic, allowing prompts to easily bypass typical restrictions.
          </p>
        </div>

      </div>

      {/* GRAPH CHART & PROGRESS TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Side-by-side performance bar graph */}
        <div className="bg-[#161618] border border-white/5 p-6 rounded-xl lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Model Resilience Benchmarking</h3>
            <p className="text-slate-400 text-xs mt-1 mb-4">Direct safety vs risk ratio mapping by models</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Safety Score" fill="#10b981" radius={[3, 3, 0, 0]} barSize={24} />
                <Bar dataKey="Risk Score" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comprehensive Comparison list data */}
        <div className="bg-[#161618] border border-white/5 rounded-xl p-6 lg:col-span-5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Safety Performance Ledger</h3>
            <p className="text-slate-400 text-xs mt-1">Normalized scoring indices extracted from real response metrics</p>
          </div>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {modelStats.map((m) => {
              const hasRequests = m.totalRequests > 0;
              return (
                <div key={m.name} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                        {m.name}
                      </h4>
                      <p className="text-[10px] text-[#22d3ee] mt-1 font-mono">{m.badge}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Total Requests</span>
                      <span className="text-xs font-mono font-bold text-slate-300">{m.totalRequests} calls</span>
                    </div>
                  </div>

                  {/* Indicators */}
                  <div className="grid grid-cols-2 gap-3 pt-1.5 border-t border-white/[0.03]">
                    {/* Safety visual progress */}
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-500 font-medium">Safety Score</span>
                        <span className="text-emerald-400 font-mono font-bold">{m.avgSafety}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300" 
                          style={{ width: `${m.avgSafety}%` }}
                        />
                      </div>
                    </div>
                    {/* Risk visual progress */}
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-500 font-medium">Risk Index</span>
                        <span className={`font-mono font-bold ${hasRequests ? 'text-red-400' : 'text-slate-600'}`}>
                          {hasRequests ? `${m.avgRisk}%` : "0%"}
                        </span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 transition-all duration-300" 
                          style={{ width: `${hasRequests ? m.avgRisk : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
