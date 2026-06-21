import { useMemo } from "react";
import { Interaction, Tabs } from "../types";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  BarChart, Bar
} from "recharts";
import { Shield, ShieldAlert, Cpu, Globe, Activity, ArrowRight, Trash2, Sparkles } from "lucide-react";

interface Props {
  interactions: Interaction[];
  onNavigate: (tab: string) => void;
  onReset: () => void;
  isDark: boolean;
}

const LANGUAGE_FLAGS: Record<string, { flag: string; label: string }> = {
  swahili:   { flag: "SW", label: "Swahili" },
  zulu:      { flag: "ZU", label: "Zulu" },
  yoruba:    { flag: "YO", label: "Yoruba" },
  afrikaans: { flag: "AF", label: "Afrikaans" },
  amharic:   { flag: "AM", label: "Amharic" },
  shona:     { flag: "SN", label: "Shona" },
  english:   { flag: "EN", label: "English" },
};

export default function DashboardOverview({ interactions, onNavigate, onReset, isDark }: Props) {
  // 1. Math counters
  const totalPrompts = interactions.length;
  
  const totalModels = useMemo(() => {
    const models = new Set(interactions.map(i => i.model.toLowerCase()));
    return models.size;
  }, [interactions]);

  const avgRiskScore = useMemo(() => {
    if (totalPrompts === 0) return 0;
    const sum = interactions.reduce((acc, i) => acc + i.riskScore, 0);
    return Math.round(sum / totalPrompts);
  }, [interactions, totalPrompts]);

  const avgSafetyScore = useMemo(() => {
    if (totalPrompts === 0) return 0;
    const sum = interactions.reduce((acc, i) => acc + i.safetyScore, 0);
    return Math.round(sum / totalPrompts);
  }, [interactions, totalPrompts]);

  const topLanguage = useMemo(() => {
    if (totalPrompts === 0) return { lang: "None", count: 0 };
    const freqs: Record<string, number> = {};
    interactions.forEach(i => {
      const l = (i.language || "english").toLowerCase();
      freqs[l] = (freqs[l] || 0) + 1;
    });
    let top = "english";
    let max = 0;
    for (const [k, v] of Object.entries(freqs)) {
      if (v > max) {
        max = v;
        top = k;
      }
    }
    return { lang: top, count: max };
  }, [interactions, totalPrompts]);

  // 2. Risk Level Pie Chart Data
  // Low: <= 39, Medium: 40-74, High: >= 75
  const pieData = useMemo(() => {
    let lowCount = 0;
    let medCount = 0;
    let highCount = 0;

    interactions.forEach(i => {
      const r = i.riskScore;
      if (r <= 39) lowCount++;
      else if (r <= 74) medCount++;
      else highCount++;
    });

    return [
      { name: "Low Risk (0-39)", value: lowCount, color: "#10b981" }, // Emerald 500
      { name: "Medium Risk (40-74)", value: medCount, color: "#f59e0b" }, // Amber 500
      { name: "High Risk (75-100)", value: highCount, color: "#ef4444" }, // Red 500
    ].filter(d => d.value > 0);
  }, [interactions]);

  // 3. Requests over time Line Chart Data
  const timelineData = useMemo(() => {
    const dates: Record<string, number> = {};
    interactions.forEach(i => {
      // Format to YYYY-MM-DD
      const dateStr = new Date(i.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      });
      dates[dateStr] = (dates[dateStr] || 0) + 1;
    });

    // Make chronological (approximation based on timestamps)
    const sortedDates = Object.entries(dates).sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    return sortedDates.map(([date, count]) => ({
      date,
      "Requests": count
    }));
  }, [interactions]);

  // 4. Model usage distribution Data
  const modelData = useMemo(() => {
    const counts: Record<string, number> = {};
    interactions.forEach(i => {
      let m = i.model.toLowerCase();
      // capitalize nicely
      if (m === "gemini") m = "Gemini";
      else if (m === "openai" || m === "openaigpt") m = "OpenAI GPT";
      else if (m === "claude") m = "Claude";
      else if (m === "open-source" || m === "llama") m = "Open Source (Llama)";
      else m = m.charAt(0).toUpperCase() + m.slice(1);
      
      counts[m] = (counts[m] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      "Evaluations": count
    }));
  }, [interactions]);

  // Vibe Check scores
  const vibeScores = useMemo(() => {
    const n = interactions.length || 1;
    const safety          = +((interactions.reduce((s, i) => s + i.safetyScore, 0) / n) / 10).toFixed(1);
    const trustworthiness = +((interactions.filter(i => i.safetyScore > 60).length / n) * 10).toFixed(1);
    const transparency    = +((interactions.filter(i => i.categories.length > 0).length / n) * 10).toFixed(1);
    const confidence      = +((1 - interactions.filter(i => i.riskScore > 39 && i.riskScore < 74).length / n) * 10).toFixed(1);
    return [
      { label: 'Safety',          value: safety,          desc: 'Average safety compliance'       },
      { label: 'Trustworthiness', value: trustworthiness, desc: 'Responses above safety threshold' },
      { label: 'Transparency',    value: transparency,    desc: 'Interactions with category labels' },
      { label: 'Confidence',      value: confidence,      desc: 'Decisive non-ambiguous scoring'   },
    ];
  }, [interactions]);

  // Language rendering with flag
  const renderLanguageName = (lang: string) => {
    const cleaned = lang.toLowerCase();
    if (LANGUAGE_FLAGS[cleaned]) {
      return (
        <span className="flex items-center gap-1.5 justify-center">
          <span className="text-[9px] font-mono font-bold bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded">
            {LANGUAGE_FLAGS[cleaned].flag}
          </span>
          <span className="capitalize">{cleaned}</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 justify-center">
        <span className="text-[9px] font-mono font-bold bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded">??</span>
        <span className="capitalize">{lang}</span>
      </span>
    );
  };

  return (
    <div id="dashboard-overview-root" className="space-y-8 animate-fade-in">

      {/* HERO STRIP */}
      <div className={`rounded-2xl p-6 flex items-center justify-between gap-6 border ${isDark ? 'bg-gradient-to-r from-[#0d1117] via-[#161618] to-[#0d1117] border-white/5' : 'bg-gradient-to-r from-amber-50 via-white to-emerald-50 border-slate-200'}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>AI Safety Observatory · Africa</span>
            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shrink-0 border ${isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-100 border-emerald-200'}`}>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
              Active
            </span>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Language Safety Observatory</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Evaluating AI safety across African languages, models, and harm categories</p>
        </div>
        <div className={`hidden md:flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 shrink-0 ${isDark ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-300 bg-emerald-50'}`}>
          <span className={`text-3xl font-mono font-bold tabular-nums ${avgSafetyScore >= 70 ? 'text-emerald-400' : avgSafetyScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
            {avgSafetyScore}%
          </span>
          <span className={`text-[9px] uppercase tracking-wider mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Safety</span>
        </div>
      </div>

      {/* 1. KEY INFORMATION METRICS ROWS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Metric 1 */}
        <div id="stat-processed" className={`border p-5 rounded-xl shadow-sm flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`flex items-center justify-between mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-xs font-semibold tracking-wider uppercase">Prompts Processed</span>
            <Activity className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <div className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalPrompts}</div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total interactions monitored</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div id="stat-models" className={`border p-5 rounded-xl shadow-sm flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`flex items-center justify-between mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-xs font-semibold tracking-wider uppercase">Models Monitored</span>
            <Cpu className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalModels}</div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Gemini, OpenAI, Claude, Local</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div id="stat-safety" className={`border p-5 rounded-xl shadow-sm flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`flex items-center justify-between mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-xs font-semibold tracking-wider uppercase">Avg Safety Score</span>
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className={`text-3xl font-bold tracking-tight ${avgSafetyScore >= 70 ? "text-emerald-400" : avgSafetyScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
              {avgSafetyScore}%
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Target benchmark: 80%</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div id="stat-risk" className={`border p-5 rounded-xl shadow-sm flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`flex items-center justify-between mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-xs font-semibold tracking-wider uppercase">Avg Risk Index</span>
            <ShieldAlert className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <div className={`text-3xl font-bold tracking-tight ${avgRiskScore >= 60 ? "text-red-400" : avgRiskScore >= 30 ? "text-amber-400" : "text-emerald-400"}`}>
              {avgRiskScore}%
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Average risk exposure</p>
          </div>
        </div>

        {/* Metric 5 */}
        <div id="stat-lang" className={`border p-5 rounded-xl shadow-sm flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`flex items-center justify-between mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-xs font-semibold tracking-wider uppercase">Primary Language</span>
            <Globe className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <div className={`text-xl font-bold tracking-tight flex items-center justify-start h-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {renderLanguageName(topLanguage.lang)}
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{topLanguage.count} safety evaluations</p>
          </div>
        </div>

      </div>

      {/* 2. MAIN VISUALISATION CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Line Chart: Requests timeline */}
        <div className={`border p-6 rounded-xl shadow-lg lg:col-span-8 flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h3 className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Evaluation Timeline</h3>
            <p className={`text-xs mt-0.5 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Volume of safety evaluations over time</p>
          </div>
          <div className="h-72 w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: isDark ? "#0f172a" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0", borderRadius: "8px" }}
                    labelStyle={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: "600" }}
                  />
                  <Line type="monotone" dataKey="Requests" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-full flex items-center justify-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No timeline data yet. Submit a prompt to get started.</div>
            )}
          </div>
        </div>

        {/* Pie Chart: Risk dispersion */}
        <div className={`border p-6 rounded-xl shadow-lg lg:col-span-4 flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h3 className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Risk Distribution</h3>
            <p className={`text-xs mt-0.5 mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Prompt classification by hazard severity</p>
          </div>
          <div className="h-60 w-full relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: isDark ? "#0f172a" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0", borderRadius: "8px" }}
                    itemStyle={{ color: isDark ? "#fff" : "#1c1917" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-full flex items-center justify-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No classification data.</div>
            )}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Avg Safety</span>
              <span className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{avgSafetyScore}%</span>
            </div>
          </div>
          <div className={`flex justify-around text-xs mt-2 pt-2 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-200'}`}>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Low</span></div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /><span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Medium</span></div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /><span className={isDark ? 'text-slate-300' : 'text-slate-600'}>High</span></div>
          </div>
        </div>

      </div>

      {/* 3. SECONDARY ANALYSIS ROW: MODEL USAGE & ACTION BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Model Volume distribution */}
        <div className={`border p-6 rounded-xl shadow-lg lg:col-span-7 flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h3 className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Model Evaluation Volume</h3>
            <p className={`text-xs mt-0.5 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Requests evaluated per model</p>
          </div>
          <div className="h-60 w-full">
            {modelData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                    contentStyle={{ backgroundColor: isDark ? "#0f172a" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0", borderRadius: "8px" }}
                  />
                  <Bar dataKey="Evaluations" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-full flex items-center justify-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No model data available.</div>
            )}
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className={`border p-6 rounded-xl shadow-lg lg:col-span-5 flex flex-col justify-between space-y-4 ${isDark ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-slate-800' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'}`}>
          <div className="space-y-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>Analyze Prompts</span>
            <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Run Safety Analysis</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Submit prompts in African languages — Swahili, isiZulu, Yorùbá, Afrikaans and more — to measure how well AI models handle safety in your language.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => onNavigate(Tabs.ANALYZER)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition duration-200 flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              Launch Live Analyzer <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-lg text-xs transition duration-200 flex items-center justify-center gap-1.5 active:scale-95"
              title="Restores corpus to initial demo dataset"
            >
              <Trash2 className="h-3.5 w-3.5" /> Restore Demo Corpus
            </button>
          </div>
        </div>

      </div>

      {/* VIBE CHECK */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Vibe Report</h3>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Trust signals derived from live response analysis</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {vibeScores.map(score => {
            const good = score.value >= 7;
            const mid  = score.value >= 5;
            const textCls = good ? 'text-emerald-400' : mid ? 'text-amber-400' : 'text-red-400';
            const barCls  = good ? 'bg-emerald-500'   : mid ? 'bg-amber-500'   : 'bg-red-500';
            const borderCls = good ? 'border-emerald-500/20' : mid ? 'border-amber-500/20' : 'border-red-500/20';
            return (
              <div key={score.label} className={`border ${borderCls} rounded-xl p-5 flex flex-col items-center text-center gap-2 ${isDark ? 'bg-[#161618]' : 'bg-white'}`}>
                <span className={`text-4xl font-mono font-bold tabular-nums ${textCls}`}>{score.value}</span>
                <span className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ 10</span>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{score.label}</span>
                <span className={`text-[10px] leading-tight ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{score.desc}</span>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                  <div className={`h-full ${barCls} rounded-full transition-all duration-700`} style={{ width: `${score.value * 10}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
