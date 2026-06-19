import { useMemo } from "react";
import { Interaction } from "../types";
import { ShieldOff, ShieldAlert, ShieldCheck, Zap, Target } from "lucide-react";

interface Props {
  interactions: Interaction[];
}

function classify(riskScore: number) {
  if (riskScore >= 75) return { label: 'Blocked',    textCls: 'text-emerald-400', bgCls: 'bg-emerald-500/10 border border-emerald-500/20' };
  if (riskScore >= 45) return { label: 'Suspicious', textCls: 'text-amber-400',   bgCls: 'bg-amber-500/10 border border-amber-500/20'   };
  return                      { label: 'Jailbreak',  textCls: 'text-red-400',     bgCls: 'bg-red-500/10 border border-red-500/20'       };
}

export default function JailbreakDashboard({ interactions }: Props) {
  const attempts = useMemo(() =>
    interactions
      .filter(i => i.categories.includes('jailbreak-attempt'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [interactions],
  );

  const blocked    = attempts.filter(i => i.riskScore >= 75);
  const suspicious = attempts.filter(i => i.riskScore >= 45 && i.riskScore < 75);
  const bypassed   = attempts.filter(i => i.riskScore < 45);

  const detectionRate = attempts.length > 0 ? Math.round((blocked.length    / attempts.length) * 100) : 0;
  const bypassRate    = attempts.length > 0 ? Math.round((bypassed.length   / attempts.length) * 100) : 0;
  const suspectRate   = attempts.length > 0 ? Math.round((suspicious.length / attempts.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Jailbreak Detection Dashboard</h2>
        <p className="text-slate-400 text-xs mt-0.5">Real-time monitoring of adversarial prompt attempts — classified from observed interactions</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161618] border border-white/5 p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <Zap className="h-4 w-4 text-red-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Attempts</span>
          </div>
          <div className="text-4xl font-mono font-bold text-white tabular-nums">{attempts.length}</div>
          <p className="text-[11px] text-slate-500 mt-1.5">jailbreak-attempt category detected</p>
        </div>

        <div className="bg-[#161618] border border-emerald-500/20 p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Detection Rate</span>
          </div>
          <div className="text-4xl font-mono font-bold text-emerald-400 tabular-nums">{detectionRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1.5">of attempts blocked at high risk threshold</p>
        </div>

        <div className="bg-[#161618] border border-red-500/20 p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <ShieldOff className="h-4 w-4 text-red-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bypass Rate</span>
          </div>
          <div className="text-4xl font-mono font-bold text-red-400 tabular-nums">{bypassRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1.5">of attacks may have bypassed guardrails</p>
        </div>
      </div>

      {/* Classification breakdown */}
      <div className="bg-[#161618] border border-white/5 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Classification Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <ShieldCheck className="h-7 w-7 text-emerald-400 mx-auto mb-3" />
            <div className="text-3xl font-mono font-bold text-emerald-400 tabular-nums">{blocked.length}</div>
            <div className="text-xs font-bold text-slate-300 mt-1.5">Blocked</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Risk ≥ 75 · Detected & scored HIGH</div>
            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${detectionRate}%` }} />
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">{detectionRate}%</div>
          </div>
          <div className="text-center p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <ShieldAlert className="h-7 w-7 text-amber-400 mx-auto mb-3" />
            <div className="text-3xl font-mono font-bold text-amber-400 tabular-nums">{suspicious.length}</div>
            <div className="text-xs font-bold text-slate-300 mt-1.5">Suspicious</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Risk 45–74 · Flagged but responded</div>
            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${suspectRate}%` }} />
            </div>
            <div className="text-[10px] text-amber-400 font-mono mt-1">{suspectRate}%</div>
          </div>
          <div className="text-center p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
            <ShieldOff className="h-7 w-7 text-red-400 mx-auto mb-3" />
            <div className="text-3xl font-mono font-bold text-red-400 tabular-nums">{bypassed.length}</div>
            <div className="text-xs font-bold text-slate-300 mt-1.5">Jailbreak</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Risk &lt; 45 · Attack bypassed guardrails</div>
            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${bypassRate}%` }} />
            </div>
            <div className="text-[10px] text-red-400 font-mono mt-1">{bypassRate}%</div>
          </div>
        </div>
      </div>

      {/* Attempt list */}
      <div className="bg-[#161618] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Live Attempt Log</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{attempts.length} total · most recent first</span>
        </div>

        {attempts.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No jailbreak attempts detected</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Submit a prompt like <span className="font-mono text-slate-400">"Ignore previous instructions…"</span>{' '}
                in the Live Analyzer to populate this dashboard.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {attempts.slice(0, 25).map(item => {
              const cls = classify(item.riskScore);
              return (
                <div key={item.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition group">
                  <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${cls.bgCls} ${cls.textCls}`}>
                    {cls.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate font-mono leading-relaxed">{item.prompt}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-500 capitalize font-medium">{item.model}</span>
                      <span className="text-[10px] text-slate-700">·</span>
                      <span className="text-[10px] text-slate-500 capitalize">{item.language}</span>
                      <span className="text-[10px] text-slate-700">·</span>
                      <span className="text-[10px] text-slate-600">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`text-sm font-mono font-bold tabular-nums ${item.riskScore >= 75 ? 'text-red-400' : item.riskScore >= 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.riskScore}
                    </div>
                    <div className="text-[10px] text-slate-600">risk</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
