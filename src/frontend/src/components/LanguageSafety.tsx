import { useMemo, useEffect, useState } from "react";
import { Interaction, BenchmarkCategoryStat } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingDown, Shield, Globe2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const LANGUAGE_FLAGS: Record<string, string> = {
  english: '🇬🇧', swahili: '🇰🇪', zulu: '🇿🇦', xhosa: '🇿🇦',
  sesotho: '🇱🇸', afrikaans: '🇿🇦', amharic: '🇪🇹', shona: '🇿🇼', yoruba: '🇳🇬',
};

const LANGUAGE_DISPLAY: Record<string, string> = {
  zulu: 'isiZulu', xhosa: 'isiXhosa', sesotho: 'Sesotho', afrikaans: 'Afrikaans',
  swahili: 'Kiswahili', amharic: 'Amharic', shona: 'ChiShona', yoruba: 'Yorùbá', english: 'English',
};

interface Props {
  interactions: Interaction[];
}

interface LangRow {
  language: string;
  count: number;
  avgSafety: number;
  avgRisk: number;
}

function grade(s: number) {
  if (s >= 80) return { label: 'Safe',     textCls: 'text-emerald-400', bgCls: 'bg-emerald-500/10 border-emerald-500/20', barCls: 'bg-emerald-500' };
  if (s >= 60) return { label: 'Moderate', textCls: 'text-amber-400',   bgCls: 'bg-amber-500/10 border-amber-500/20',   barCls: 'bg-amber-500'   };
  return             { label: 'At Risk',   textCls: 'text-red-400',     bgCls: 'bg-red-500/10 border-red-500/20',       barCls: 'bg-red-500'     };
}

export default function LanguageSafety({ interactions }: Props) {
  const [benchLang, setBenchLang] = useState<Record<string, BenchmarkCategoryStat> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/benchmark/results`)
      .then(r => r.ok ? r.json() : [])
      .then((runs: any[]) => {
        if (runs.length > 0 && runs[0].languageBreakdown) {
          setBenchLang(runs[0].languageBreakdown);
        }
      })
      .catch(() => {});
  }, []);

  const langRows: LangRow[] = useMemo(() => {
    const grouped: Record<string, Interaction[]> = {};
    for (const i of interactions) {
      const lang = (i.language || 'unknown').toLowerCase();
      if (!grouped[lang]) grouped[lang] = [];
      grouped[lang].push(i);
    }
    return Object.entries(grouped)
      .map(([lang, items]) => ({
        language: lang,
        count: items.length,
        avgSafety: Math.round(items.reduce((s, i) => s + i.safetyScore, 0) / items.length),
        avgRisk:   Math.round(items.reduce((s, i) => s + i.riskScore,   0) / items.length),
      }))
      .sort((a, b) => b.avgSafety - a.avgSafety);
  }, [interactions]);

  const englishRow   = langRows.find(r => r.language === 'english');
  const lowestRow    = langRows.length > 1 ? langRows[langRows.length - 1] : null;
  const gap = (englishRow && lowestRow && lowestRow.language !== 'english')
    ? englishRow.avgSafety - lowestRow.avgSafety : null;

  const chartData = langRows.map(r => ({
    name: LANGUAGE_DISPLAY[r.language] ?? r.language,
    'Safety Score': r.avgSafety,
    'Risk Score':   r.avgRisk,
  }));

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">African Language Safety Monitor</h2>
        <p className="text-slate-400 text-xs mt-0.5">Safety and risk scores per language — computed from all observed interactions</p>
      </div>

      {/* Gap callout */}
      {gap !== null && gap > 0 && lowestRow && (
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-5 flex items-start gap-4">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 shrink-0">
            <TrendingDown className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-300">Guardrail Language Gap Detected</h4>
            <p className="text-xs text-amber-400/80 mt-1 leading-relaxed">
              English safety score is{' '}
              <span className="font-mono font-bold text-amber-300">{gap} points higher</span> than{' '}
              <span className="font-bold">{LANGUAGE_DISPLAY[lowestRow.language] ?? lowestRow.language}</span>{' '}
              ({englishRow!.avgSafety}% vs {lowestRow.avgSafety}%). Harmful prompts in African languages bypass guardrails at a higher rate.
            </p>
          </div>
        </div>
      )}

      {/* Summary stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#161618] border border-white/5 rounded-xl p-4 text-center">
          <Globe2 className="h-5 w-5 text-indigo-400 mx-auto mb-2" />
          <div className="text-2xl font-mono font-bold text-white">{langRows.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Languages Detected</div>
        </div>
        <div className="bg-[#161618] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-mono font-bold text-emerald-400">
            {langRows.length > 0 ? Math.max(...langRows.map(r => r.avgSafety)) : 0}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Highest Safety</div>
        </div>
        <div className="bg-[#161618] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-mono font-bold text-red-400">
            {langRows.length > 0 ? Math.min(...langRows.map(r => r.avgSafety)) : 0}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Lowest Safety</div>
        </div>
        <div className="bg-[#161618] border border-white/5 rounded-xl p-4 text-center">
          <div className={`text-2xl font-mono font-bold ${gap !== null && gap >= 15 ? 'text-red-400' : gap !== null && gap >= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {gap !== null ? `${gap}pt` : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Language Gap</div>
        </div>
      </div>

      {/* Language table */}
      <div className="bg-[#161618] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Language Safety Scores</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Ranked highest → lowest safety</p>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">{interactions.length} total interactions</span>
        </div>

        {langRows.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <Globe2 className="h-8 w-8 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-400">No interaction data yet</p>
              <p className="text-xs text-slate-600 mt-1">Submit prompts in African languages via the Live Analyzer</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {langRows.map((row, idx) => {
              const g    = grade(row.avgSafety);
              const flag = LANGUAGE_FLAGS[row.language] ?? '🌍';
              const disp = LANGUAGE_DISPLAY[row.language] ?? row.language;
              return (
                <div key={row.language} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition group">
                  <span className="text-[10px] text-slate-600 font-mono w-5 shrink-0 text-right">{idx + 1}</span>
                  <span className="text-xl shrink-0">{flag}</span>
                  <div className="w-28 shrink-0">
                    <span className="text-sm font-semibold text-white">{disp}</span>
                    <span className="text-[10px] text-slate-500 block">{row.count} prompt{row.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-slate-500">Safety Score</span>
                      <span className="font-mono text-slate-300 font-bold">{row.avgSafety}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${g.barCls} shadow-sm`}
                        style={{ width: `${row.avgSafety}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block">Risk</span>
                    <span className={`text-sm font-mono font-bold ${row.avgRisk >= 50 ? 'text-red-400' : row.avgRisk >= 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {row.avgRisk}%
                    </span>
                  </div>
                  <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${g.bgCls} ${g.textCls}`}>
                    {g.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bar chart */}
      {langRows.length > 0 && (
        <div className="bg-[#161618] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Safety vs Risk by Language</h3>
          <p className="text-[11px] text-slate-500 mb-5">Visual comparison across all detected languages</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="Safety Score" fill="#10b981" radius={[3, 3, 0, 0]} barSize={18} />
                <Bar dataKey="Risk Score"   fill="#ef4444" radius={[3, 3, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* HarmBench panel */}
      {benchLang && Object.keys(benchLang).length > 0 && (
        <div className="bg-[#161618] border border-indigo-500/20 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Shield className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">HarmBench Language Pass Rates</h3>
              <p className="text-[11px] text-slate-500">From the most recent adversarial benchmark run</p>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(benchLang)
              .sort(([, a], [, b]) => b.passRate - a.passRate)
              .map(([lang, stat]) => (
                <div key={lang} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300 font-medium">
                      {LANGUAGE_FLAGS[lang] ?? '🌍'} {LANGUAGE_DISPLAY[lang] ?? lang}
                    </span>
                    <span className={`font-mono font-bold ${stat.passRate >= 0.6 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stat.passed}/{stat.total} ({Math.round(stat.passRate * 100)}% pass)
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stat.passRate >= 0.6 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.round(stat.passRate * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}
