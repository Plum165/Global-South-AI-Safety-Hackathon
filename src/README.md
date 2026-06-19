# AI Safety Observatory for Africa

The **AI Safety Observatory for Africa** is a comprehensive full-stack research dashboard and live testing system engineered to monitor, analyze, and visualize the safety of AI model responses across different regional languages (including Swahili, Zulu, Yoruba, Afrikaans, Amharic, and Shona), risk levels, and commercial/open-source architectures. 

## 🌍 Why This App Exists
Many global LLM safety guardrails fail to address complex regional structures in African languages, allowing dangerous prompts to easily bypass typical restrictions (linguistic jailbreaks). This observatory serves to:
* **Track AI Behavior**: Monitors model output resilience against adversarial prompts.
* **Detect & Estimate Risks**: Generates real-time safety scores and risk metrics.
* **Support African Contexts**: Focused on tracking and securing language variants like Swahili, Zulu, Yoruba, Afrikaans, Amharic, and Shona.
* **Provide Transparency**: Compares safety profiles across different standard models (Gemini, Claude, GPT, and Llama).

---

## 📂 Project Folder Structure

```txt
src/backend/
├── server.ts                    ← Rewritten: mounts all routers, loads dotenv
│
├── routes/
│   ├── chat.ts                  ← POST /api/chat  (full pipeline)
│   ├── interactions.ts          ← GET /api/interactions + POST /api/interactions/reset
│   ├── metrics.ts               ← GET /api/metrics
│   └── analyze.ts               ← POST /api/analyze (analysis only, no LLM call)
│
├── services/
│   ├── languageDetector.ts      ← Detects English / Swahili / Zulu / Xhosa /
│   │                               Sesotho / Afrikaans / Amharic / Shona / Yoruba
│   ├── riskEngine.ts            ← 8 rule categories → score 0-100, level SAFE/LOW/MEDIUM/HIGH
│   ├── safetyClassifier.ts      ← Wraps risk into SafetyClassification shape
│   └── logger.ts                ← Timestamped console logger (info/warn/error/debug)
│
├── providers/
│   ├── types.ts                 ← AIProvider interface { generateResponse(prompt) }
│   ├── index.ts                 ← getProvider(model) factory — key-checks + fallback
│   ├── gemini.ts                ← GoogleGenAI → gemini-2.0-flash
│   ├── openai.ts                ← OpenAI SDK → gpt-4o-mini
│   ├── anthropic.ts             ← Anthropic SDK → claude-haiku-4-5-20251001
│   └── local.ts                 ← Fully offline mock (multilingual refusals + safe responses)
│
├── analytics/
│   ├── riskScorer.ts            ← clampScore / levelFromScore / weightedScore utilities
│   ├── metricsEngine.ts         ← computeMetrics() — language/model/category/risk breakdown
│   └── biasAnalyzer.ts          ← Gender / racial / colonial bias pattern detection
│
└── db/
    ├── models/
    │   ├── Interaction.ts       ← Interaction interface
    │   └── User.ts              ← User interface (admin / researcher / observer)
    └── repository.ts            ← readInteractions / writeInteractions / appendInteraction /
                                    resetInteractions / generateId

```

---

## 🛠️ Key Architectural Features
1. **Dynamic Dashboard Overview**:
   * Displays general KPIs such as total prompts, average safety score, average risk ratio, and top evaluated language.
   * Leverages `recharts` for visual representation (chronological trends, risk distribution, and volume).
2. **Interactive Prompt Explorer**:
   * Complete searchable database with filtering by model, detected language, and risk category levels.
   * Includes data exportability to **CSV format** for external modeling and research.
3. **Structured Model Comparison**:
   * Side-by-side bar graph analytics mapping safety resilience across Google Gemini, OpenAI GPT, Anthropic Claude, and custom open-source models (Llama).
4. **Live Guardrail Analyzer**:
   * Interactive input form allowing users to test adversarial prompts in African languages and receive a structured safety report detailing risk flags, classification categories, and simulated or real model refusal responses.
