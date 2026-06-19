import { useState, useMemo } from "react";
import { Interaction, RiskLevel } from "../types";
import { Search, SlidersHorizontal, Download, ArrowUpDown, HelpCircle, ShieldAlert, ShieldCheck } from "lucide-react";

interface Props {
  interactions: Interaction[];
}

const LANGUAGE_FLAGS: Record<string, { flag: string; label: string }> = {
  swahili: { flag: "🇰🇪/🇹🇿", label: "Swahili" },
  zulu: { flag: "🇿🇦", label: "Zulu" },
  yoruba: { flag: "🇳🇬", label: "Yoruba" },
  afrikaans: { flag: "🇿🇦", label: "Afrikaans" },
  amharic: { flag: "🇪🇹", label: "Amharic" },
  shona: { flag: "🇿🇼", label: "Shona" },
  english: { flag: "🇬🇧", label: "English" },
};

export default function PromptExplorer({ interactions }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>("all");
  
  // Sorting state
  const [orderField, setOrderField] = useState<"timestamp" | "riskScore" | "safetyScore">("timestamp");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Available unique languages & models for filter select options
  const languages = useMemo(() => {
    const set = new Set(interactions.map(item => (item.language || "english").toLowerCase()));
    return Array.from(set);
  }, [interactions]);

  const models = useMemo(() => {
    const set = new Set(interactions.map(item => item.model));
    return Array.from(set);
  }, [interactions]);

  // Filtered & Sorted datasets
  const filteredInteractions = useMemo(() => {
    return interactions
      .filter((item) => {
        // 1. Search Query
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          item.prompt.toLowerCase().includes(term) ||
          item.response.toLowerCase().includes(term) ||
          (item.categories && item.categories.some(c => c.toLowerCase().includes(term)));

        // 2. Language Filter
        const matchesLanguage = selectedLanguage === "all" || (item.language || "english").toLowerCase() === selectedLanguage;

        // 3. Model Filter
        const matchesModel = selectedModel === "all" || item.model.toLowerCase() === selectedModel.toLowerCase();

        // 4. Risk Level Filter
        let matchesRisk = true;
        const r = item.riskScore;
        if (selectedRisk === "low") {
          matchesRisk = r <= 39;
        } else if (selectedRisk === "medium") {
          matchesRisk = r >= 40 && r <= 74;
        } else if (selectedRisk === "high") {
          matchesRisk = r >= 75;
        }

        return matchesSearch && matchesLanguage && matchesModel && matchesRisk;
      })
      .sort((a, b) => {
        let valA: number | string = a[orderField];
        let valB: number | string = b[orderField];

        if (orderField === "timestamp") {
          valA = new Date(a.timestamp).getTime();
          valB = new Date(b.timestamp).getTime();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [interactions, searchTerm, selectedLanguage, selectedModel, selectedRisk, orderField, sortAsc]);

  const toggleSort = (field: "timestamp" | "riskScore" | "safetyScore") => {
    if (orderField === field) {
      setSortAsc(!sortAsc);
    } else {
      setOrderField(field);
      setSortAsc(false);
    }
  };

  const getRiskBadge = (score: number) => {
    if (score <= 39) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
          Low
        </span>
      );
    } else if (score <= 74) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
          Medium
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
          High
        </span>
      );
    }
  };

  const getModelLabel = (modelID: string) => {
    const id = modelID.toLowerCase();
    if (id === "gemini") return <span className="text-indigo-400 font-mono font-bold">Gemini 1.5 Pro</span>;
    if (id === "openai" || id === "openaigpt") return <span className="text-purple-400 font-mono font-bold">GPT-4o</span>;
    if (id === "claude") return <span className="text-amber-400 font-mono font-bold">Claude 3.5 Sonnet</span>;
    if (id === "open-source" || id === "llama") return <span className="text-emerald-400 font-mono font-bold">Llama 3 (70B)</span>;
    return <span className="text-slate-400 font-mono capitalize">{modelID}</span>;
  };

  const renderLanguageCell = (lang: string) => {
    const cleaned = lang.toLowerCase();
    const match = LANGUAGE_FLAGS[cleaned];
    if (match) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg" title={match.label}>{match.flag}</span>
          <span className="capitalize text-slate-300 font-medium">{cleaned}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span>🌍</span>
        <span className="capitalize text-slate-300 font-medium">{lang}</span>
      </div>
    );
  };

  // CSV export handler
  const exportToCSV = () => {
    const headers = ["Prompt", "Model", "Language", "Risk Score", "Safety Score", "Categories", "Response", "Created Date"];
    const rows = filteredInteractions.map(item => [
      `"${item.prompt.replace(/"/g, '""')}"`,
      item.model,
      item.language,
      item.riskScore,
      item.safetyScore,
      `"${item.categories?.join(', ')}"`,
      `"${item.response.replace(/"/g, '""')}"`,
      item.timestamp
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ai_safety_african_observatory_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="prompt-explorer-root" className="space-y-6 animate-fade-in">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Prompt Explorer Database</h2>
          <p className="text-slate-400 text-xs mt-0.5">Filter, search, and audit response profiles across natural sub-national contexts</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredInteractions.length === 0}
          className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-white/20 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-2 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Download className="h-4 w-4" /> Export Filtered to CSV
        </button>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-[#161618] border border-white/5 p-4 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search prompts, categories, responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-white/5 focus:border-indigo-500/50 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Language filter */}
          <div className="md:col-span-2 relative">
            <label className="absolute -top-2 left-2 px-1 bg-[#161618] text-[9px] font-bold text-slate-500 tracking-wider uppercase">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-white/5 focus:border-indigo-500/40 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none capitalize"
            >
              <option value="all">All Languages</option>
              {languages.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Model filter */}
          <div className="md:col-span-2 relative">
            <label className="absolute -top-2 left-2 px-1 bg-[#161618] text-[9px] font-bold text-slate-500 tracking-wider uppercase">AI Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-white/5 focus:border-indigo-500/40 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none capitalize"
            >
              <option value="all">All Models</option>
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Risk Level filter */}
          <div className="md:col-span-2 relative">
            <label className="absolute -top-2 left-2 px-1 bg-[#161618] text-[9px] font-bold text-slate-500 tracking-wider uppercase">Risk Severity</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as RiskLevel)}
              className="w-full bg-[#0A0A0B] border border-white/5 focus:border-indigo-500/40 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk (0 - 39)</option>
              <option value="medium">Medium Risk (40 - 74)</option>
              <option value="high">High Risk (75 - 100)</option>
            </select>
          </div>

          {/* Active Counters info */}
          <div className="md:col-span-2 flex items-center justify-end text-slate-400 text-xs">
            <span className="font-semibold text-indigo-400">{filteredInteractions.length}</span>
            <span className="ml-1 text-slate-500">of {interactions.length} matched</span>
          </div>

        </div>
      </div>

      {/* TABLE DATA LIST CONTAINER */}
      <div className="bg-[#161618] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/5 select-none">
              <tr>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Model</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-1/4">Prompt Text</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-1/4">AI Response</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Language</th>
                <th 
                  onClick={() => toggleSort("riskScore")}
                  className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center cursor-pointer hover:text-white transition group"
                >
                  <div className="flex items-center justify-center gap-1">
                    Risk 
                    <ArrowUpDown className="h-3 w-3 text-slate-600 group-hover:text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort("safetyScore")}
                  className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right cursor-pointer hover:text-white transition group"
                >
                  <div className="flex items-center justify-end gap-1">
                    Safety
                    <ArrowUpDown className="h-3 w-3 text-slate-600 group-hover:text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort("timestamp")}
                  className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right cursor-pointer hover:text-white transition group"
                >
                  <div className="flex items-center justify-end gap-1">
                    Audited
                    <ArrowUpDown className="h-3 w-3 text-slate-600 group-hover:text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredInteractions.length > 0 ? (
                filteredInteractions.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    
                    {/* Model */}
                    <td className="p-4">
                      <div className="space-y-1">
                        {getModelLabel(item.model)}
                        <div className="flex flex-wrap gap-1">
                          {item.categories && item.categories.map((c) => (
                            <span 
                              key={c} 
                              className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                c === "safe" 
                                  ? "bg-emerald-500/10 text-emerald-400" 
                                  : "bg-red-500/15 text-red-300 border border-red-500/10"
                              }`}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Prompt */}
                    <td className="p-4 text-xs">
                      <p className="text-slate-100 font-medium line-clamp-3 leading-relaxed" title={item.prompt}>
                        {item.prompt}
                      </p>
                    </td>

                    {/* AI Response */}
                    <td className="p-4 text-xs font-light">
                      <p className="text-slate-400 line-clamp-3 leading-relaxed" title={item.response}>
                        {item.response}
                      </p>
                    </td>

                    {/* Language */}
                    <td className="p-4 text-xs">
                      {renderLanguageCell(item.language)}
                    </td>

                    {/* Risk Level & Score */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className={`text-xs font-mono font-bold ${
                          item.riskScore >= 75 ? "text-red-400" : item.riskScore >= 40 ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {item.riskScore}%
                        </span>
                        {getRiskBadge(item.riskScore)}
                      </div>
                    </td>

                    {/* Safety Score */}
                    <td className="p-4 text-right font-mono text-xs font-semibold text-slate-300">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={item.safetyScore >= 80 ? "text-emerald-400" : "text-slate-400"}>
                          {item.safetyScore}%
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                          <div 
                            className={`h-full ${item.safetyScore >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                            style={{ width: `${item.safetyScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="p-4 text-right text-[10px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 text-xs">
                    <p className="font-semibold text-slate-400">No interaction matching current filters.</p>
                    <p className="mt-1">Try relaxing terms, selecting all models, or running a live check inside the Live Analyzer.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
