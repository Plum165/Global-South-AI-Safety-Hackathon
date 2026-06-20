import { useState, useEffect } from "react";
import { Tabs, Interaction } from "./types";
import DashboardOverview from "./components/DashboardOverview";
import PromptExplorer from "./components/PromptExplorer";
import ModelComparison from "./components/ModelComparison";
import LiveAnalyzer from "./components/LiveAnalyzer";
import LanguageSafety from "./components/LanguageSafety";
import JailbreakDashboard from "./components/JailbreakDashboard";
import {
  Database, BarChart3, PlayCircle, Activity,
  RefreshCw, AlertCircle, Globe2, ShieldOff, Sun, Moon,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    async function fetchInteractions() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`${API_BASE}/api/interactions`);
        if (!res.ok) throw new Error("Could not retrieve interactions.");
        const data = await res.json();
        setInteractions(data);
      } catch (err: any) {
        console.error("API error:", err);
        setErrorMessage("Warning: Server not fully initialized yet. Falling back to local dataset.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInteractions();
  }, [refreshTrigger]);

  const handleInteractionAdded = (newInteraction: Interaction) => {
    setInteractions((prev) => [newInteraction, ...prev]);
  };

  const handleResetCorpus = async () => {
    if (!window.confirm("Reset the observatory to the initial sample dataset?")) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/reset`, { method: "POST" });
      if (res.ok) setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to reset", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <DashboardOverview
            interactions={interactions}
            onNavigate={(tab) => setActiveTab(tab)}
            onReset={handleResetCorpus}
            isDark={isDark}
          />
        );
      case "explorer":   return <PromptExplorer interactions={interactions} />;
      case "comparison": return <ModelComparison interactions={interactions} />;
      case "analyzer":   return <LiveAnalyzer onInteractionAdded={handleInteractionAdded} />;
      case "languages":  return <LanguageSafety interactions={interactions} />;
      case "jailbreak":  return <JailbreakDashboard interactions={interactions} />;
      default:
        return (
          <DashboardOverview
            interactions={interactions}
            onNavigate={(tab) => setActiveTab(tab)}
            onReset={handleResetCorpus}
            isDark={isDark}
          />
        );
    }
  };

  /* ── Shared nav button ─────────────────────────────────────────────────── */
  const navBtn = (tab: string, label: string, Icon: any, accent = false) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
        activeTab === tab
          ? isDark
            ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
            : "bg-amber-100 text-amber-800 border border-amber-200"
          : isDark
            ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${
        accent
          ? "text-emerald-500"
          : activeTab === tab
            ? isDark ? "text-amber-400" : "text-amber-600"
            : isDark ? "text-slate-500" : "text-slate-400"
      }`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div
      id="app-root"
      className={`min-h-screen font-sans flex flex-col md:flex-row ${
        isDark ? "dark bg-[#0A0A0B] text-slate-100" : "bg-[#F5F0E8] text-slate-900"
      }`}
    >

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`w-full md:w-64 border-r flex flex-col shrink-0 md:min-h-screen ${
        isDark ? "bg-[#0F0F11] border-white/5" : "bg-white border-slate-200"
      }`}>

        {/* Pan-African accent stripe */}
        <div className="h-0.5 w-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />

        {/* Branding */}
        <div className={`p-6 border-b ${isDark ? "border-white/5" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A11.955 11.955 0 003 12c0 5.523 4.477 10 9 10a9.956 9.956 0 005.618-1.727" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className={`text-sm font-bold tracking-tight uppercase leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                Safety Africa
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                  Observatory
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1.5 flex flex-col">

          {navBtn("overview",   "DASHBOARD METRICS", Activity)}
          {navBtn("explorer",   "PROMPT EXPLORER",   Database)}
          {navBtn("comparison", "MODEL COMPARISON",  BarChart3)}
          {navBtn("analyzer",   "LIVE ANALYZER",     PlayCircle, true)}

          <div className="pt-2 pb-1">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-3 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              Analysis
            </span>
          </div>

          {navBtn("languages", "LANGUAGE SAFETY",   Globe2)}
          {navBtn("jailbreak", "JAILBREAK MONITOR", ShieldOff)}

        </nav>


      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className={`h-14 border-b flex items-center justify-between px-6 md:px-8 sticky top-0 z-10 backdrop-blur-sm ${
          isDark ? "border-white/5 bg-[#0A0A0B]/70" : "border-slate-200 bg-[#F5F0E8]/80"
        }`}>

          <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <Globe2 className="h-3.5 w-3.5" />
            <span>African Language Safety Research</span>
          </div>

          <button
            onClick={() => setIsDark(d => !d)}
            className={`p-2 rounded-lg border transition-all ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-400 hover:text-amber-300 hover:bg-white/10 hover:border-amber-500/30"
                : "border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

        </header>

        {/* Page content */}
        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">

          {errorMessage && (
            <div className={`p-3 border border-amber-500/20 text-amber-400 text-xs rounded-lg font-medium flex items-center gap-2 ${isDark ? "bg-amber-950/20" : "bg-amber-50"}`}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoading && interactions.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
              <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Loading observatory data…
              </p>
            </div>
          ) : (
            renderActiveTabContent()
          )}

        </div>

      </main>

    </div>
  );
}
