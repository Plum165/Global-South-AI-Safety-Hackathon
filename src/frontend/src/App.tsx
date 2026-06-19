import { useState, useEffect } from "react";
import { Tabs, Interaction } from "./types";
import DashboardOverview from "./components/DashboardOverview";
import PromptExplorer from "./components/PromptExplorer";
import ModelComparison from "./components/ModelComparison";
import LiveAnalyzer from "./components/LiveAnalyzer";
import { 
  ShieldCheck, 
  Database, 
  BarChart3, 
  PlayCircle, 
  Activity, 
  RefreshCw, 
  Info, 
  AlertCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Load interactions from Node.js database API dynamically
  useEffect(() => {
    async function fetchInteractions() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`${API_BASE}/api/interactions`);
        if (!res.ok) {
          throw new Error("Could not retrieve interactions database.");
        }
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
    // Optimistic state update & local synchronization
    setInteractions((prev) => [newInteraction, ...prev]);
  };

  const handleResetCorpus = async () => {
    if (!window.confirm("Are you sure you want to reset the AI Safety Observatory to the initial sample dataset?")) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/reset`, { method: "POST" });
      if (res.ok) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to reset database", err);
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
          />
        );
      case "explorer":
        return <PromptExplorer interactions={interactions} />;
      case "comparison":
        return <ModelComparison interactions={interactions} />;
      case "analyzer":
        return <LiveAnalyzer onInteractionAdded={handleInteractionAdded} />;
      default:
        return (
          <DashboardOverview 
            interactions={interactions} 
            onNavigate={(tab) => setActiveTab(tab)}
            onReset={handleResetCorpus}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-white/5 bg-[#0F0F11] flex flex-col shrink-0 md:min-h-screen">
        
        {/* Logo and branding title */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/10">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.355r2.73-1.365a11.95 11.95 0 005.888-10.191V7.169m-17.176 0V11.19c0 4.27 1.44 8.207 3.847 11.355" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase leading-none">Safety Africa</h1>
              <span className="text-[9px] text-slate-500 font-medium uppercase tracking-widest block mt-1">Observatory</span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav anchors */}
        <nav className="flex-1 p-4 space-y-1.5 flex flex-col">
          
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition ${
              activeTab === "overview" 
                ? "bg-white/10 text-white" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>DASHBOARD METRICS</span>
          </button>

          <button
            onClick={() => setActiveTab("explorer")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition ${
              activeTab === "explorer" 
                ? "bg-white/10 text-white" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Database className="h-4 w-4" />
            <span>PROMPT EXPLORER</span>
          </button>

          <button
            onClick={() => setActiveTab("comparison")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition ${
              activeTab === "comparison" 
                ? "bg-white/10 text-white" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>MODEL COMPARISON</span>
          </button>

          <button
            onClick={() => setActiveTab("analyzer")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition ${
              activeTab === "analyzer" 
                ? "bg-white/10 text-white border-l-2 border-emerald-500 pl-2" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <PlayCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold underline underline-offset-4 decoration-emerald-500/20">LIVE ANALYZER</span>
          </button>

        </nav>

        {/* System gauge footer */}
        <div className="p-4 mt-auto border-t border-white/5">
          <div className="bg-emerald-900/20 p-3.5 rounded-xl border border-emerald-500/20">
            <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">System Status</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200">All Nodes Active</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1 leading-normal">Connected to local SQLite/JSON storage core securely.</p>
          </div>
        </div>

      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Live Header bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 md:px-8 bg-[#0A0A0B]/50 backdrop-blur-sm sticky top-0 z-10">
          
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span>Region: Sub-Saharan Africa</span>
            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
            <span className="hidden sm:inline">Last Sync: Just Now</span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Live Feed simulated indicator */}
            <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
              <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mr-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest">LIVE FEED</span>
            </div>

            {/* Profile trigger */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 shadow-md flex items-center justify-center text-[10px] font-bold text-white uppercase" title="Observatory Administrator">
              OA
            </div>

          </div>

        </header>

        {/* Dynamic page placement */}
        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          
          {errorMessage && (
            <div className="p-3 bg-amber-950/20 text-amber-400 border border-amber-500/20 text-xs rounded-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoading && interactions.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
              <p className="text-slate-400 text-xs font-semibold">Synchronizing with AI Safety Observatory backend servers...</p>
            </div>
          ) : (
            renderActiveTabContent()
          )}

        </div>

      </main>

    </div>
  );
}
