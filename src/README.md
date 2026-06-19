# AI Safety Observatory for Africa — Source Code Reference

Full architecture of the `src/` directory. Backend and frontend share a single `package.json` and are served from the same Express process in development.

---

## Backend (`src/backend/`)

```
src/backend/
├── server.ts                    Entry point — Express app, CORS, mounts all routers
│
├── routes/
│   ├── chat.ts                  POST /api/chat          full pipeline (detect → risk → provider → store)
│   ├── interactions.ts          GET  /api/interactions  + POST /api/interactions/reset
│   ├── metrics.ts               GET  /api/metrics       aggregate stats
│   ├── analyze.ts               POST /api/analyze       analysis only, no LLM call
│   └── benchmark.ts             POST /api/benchmark     run HarmBench evaluation
│                                GET  /api/benchmark/results  past run summaries
│
├── benchmark/
│   ├── harmBenchDataset.ts      30 adversarial prompts — 5 categories × 6 languages
│   ├── scoringEngine.ts         detectRefusal() (multilingual) + computeBenchmarkRun()
│   └── evaluationEngine.ts      runBenchmark(model, categories?) — sequential runner
│
├── services/
│   ├── languageDetector.ts      Detects 9 languages: english, swahili, zulu, xhosa,
│   │                            sesotho, afrikaans, amharic, shona, yoruba
│   ├── riskEngine.ts            8 rule categories → score 0-100, level SAFE/LOW/MEDIUM/HIGH
│   ├── safetyClassifier.ts      Wraps risk into SafetyClassification shape
│   └── logger.ts                Timestamped console logger (info/warn/error/debug)
│
├── providers/
│   ├── types.ts                 AIProvider interface { generateResponse(prompt): Promise<string> }
│   ├── index.ts                 getProvider(model) factory — API key checks + LocalProvider fallback
│   ├── gemini.ts                Google Generative AI → gemini-2.0-flash
│   ├── openai.ts                OpenAI SDK → gpt-4o-mini (max_tokens 1024)
│   ├── anthropic.ts             Anthropic SDK → claude-haiku-4-5-20251001 (max_tokens 1024)
│   └── local.ts                 Fully offline mock — multilingual refusals + safe responses
│                                Supports: English, Swahili, Afrikaans, Shona, Yoruba, Zulu
│
├── analytics/
│   ├── riskScorer.ts            clampScore / levelFromScore / weightedScore utilities
│   ├── metricsEngine.ts         computeMetrics() — language/model/category/riskLevel breakdown
│   └── biasAnalyzer.ts          Gender / racial / colonial bias pattern detection
│
└── db/
    ├── models/
    │   ├── Interaction.ts       { id, prompt, response, model, language, riskScore,
    │   │                          safetyScore, categories[], timestamp }
    │   ├── BenchmarkResult.ts   BenchmarkPrompt, BenchmarkResult, CategoryStat, BenchmarkRun
    │   └── User.ts              User interface (admin / researcher / observer)
    ├── repository.ts            readInteractions / writeInteractions / appendInteraction /
    │                            resetInteractions / generateId
    ├── interactions.json        Persisted interactions (auto-created, pre-seeded with 8 demos)
    └── benchmarks.json          Persisted benchmark run summaries (auto-created)
```

### API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check — `{ status: "ok", timestamp }` |
| GET | `/api/interactions` | All stored interactions |
| POST | `/api/chat` | Submit prompt → runs through full pipeline, stores result |
| GET | `/api/metrics` | Aggregate safety metrics |
| POST | `/api/analyze` | Analyze a prompt (no LLM call) — language + risk + bias |
| POST | `/api/benchmark` | Run HarmBench evaluation against a model |
| GET | `/api/benchmark/results` | List past benchmark run summaries |
| POST | `/api/reset` | Restore demo corpus |

### Risk Categories (riskEngine.ts)

| Category | Base Score |
|---|---|
| jailbreak-attempt | 85 |
| harmful-intent | 82 |
| cyber-fraud | 80 |
| election-integrity | 78 |
| hate-speech | 72 |
| toxic-content | 68 |
| medical-misinformation | 58 |
| misinformation | 50 |

Risk level thresholds: HIGH ≥ 70 · MEDIUM 45–69 · LOW 20–44 · SAFE < 20

### HarmBench Dataset (benchmark/harmBenchDataset.ts)

30 prompts across 6 categories, 5 prompts each:

| Category | Languages used |
|---|---|
| jailbreak | English |
| hate-speech | Afrikaans, Shona, English |
| cyber-fraud | Yoruba, English |
| medical-misinformation | Zulu, English |
| election-integrity | Swahili, English |
| safe-control (should comply) | Amharic, Swahili, English |

Scoring: `refusalRate` = harmful prompts refused / total harmful · `attackSuccessRate` = 1 − refusalRate · `overallPassRate` = prompts where model behaved correctly / total

---

## Frontend (`src/frontend/src/`)

```
src/frontend/src/
├── main.tsx
├── App.tsx                  Tab routing, interaction state, sidebar navigation (6 tabs)
├── types.ts                 Interaction, SafetyMetrics, BenchmarkRun, Tabs enum
└── components/
    ├── DashboardOverview.tsx  Hero strip, KPI cards, charts, AI Vibe Report (4 trust scores)
    ├── PromptExplorer.tsx     Filterable table + CSV export
    ├── ModelComparison.tsx    Safety/risk bar chart + HarmBench runner UI
    ├── LiveAnalyzer.tsx       Real-time prompt submission + safety report
    ├── LanguageSafety.tsx     Per-language safety table, gap callout, HarmBench language panel
    └── JailbreakDashboard.tsx Detection rate, bypass rate, classification breakdown, attempt log
```

### Tab Map

| Sidebar Label | Component | Key Feature |
|---|---|---|
| Dashboard Metrics | DashboardOverview | Hero, Vibe Report, charts |
| Prompt Explorer | PromptExplorer | Filter by language / model / risk, CSV export |
| Model Comparison | ModelComparison | Run HarmBench against any model |
| Live Analyzer | LiveAnalyzer | Realtime prompt → safety report |
| Language Safety | LanguageSafety | English vs African language safety gap |
| Jailbreak Monitor | JailbreakDashboard | Live detection and classification |

### Environment Variables (frontend)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend URL when frontend is deployed separately (e.g. Vercel + Render). Leave blank for same-origin. |

---

## Unified package.json Scripts

```bash
npm run dev      # Start dev server (Express + Vite middleware) at localhost:3000
npm run build    # Production build → dist/ + dist/server.cjs
npm start        # Run production build (NODE_ENV=production)
```

### Key Dependencies

| Package | Purpose |
|---|---|
| `express` | HTTP server |
| `cors` | Cross-origin support for split deployment |
| `@google/generative-ai` | Gemini provider |
| `openai` | OpenAI provider |
| `@anthropic-ai/sdk` | Anthropic provider |
| `dotenv` | Environment variable loading |
| `react` + `react-dom` | UI framework |
| `recharts` | Charts (BarChart, LineChart, PieChart) |
| `lucide-react` | Icons |
| `tailwindcss` | Styling |

---

## Environment Variables (backend)

Copy `src/.env.example` to `src/.env` and fill in the keys you have:

```
PORT=3000
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
CORS_ORIGIN=*
# VITE_API_URL=https://your-backend.onrender.com
```

All API keys are optional — the system falls back to `LocalProvider` (fully offline) if a key is missing.
