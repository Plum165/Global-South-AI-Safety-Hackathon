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
├── .env.example               # Documentation of required environment parameters
├── .gitignore                 # Excludes compiled files and local system binaries
├── index.html                 # Central HTML viewport entry pointing to the frontend
├── metadata.json              # Applet metadata, frame privileges, and capabilities
├── package.json               # Full lifecycle build scripts and system dependencies
├── tsconfig.json              # TypeScript engine compiler options
├── vite.config.ts             # Vite server controls and path resolution configuration
│
├── backend/                   # SERVER-SIDE CONTROLS
│   └── server.ts              # Express API hosting static assets, metrics calculations,
│                              # and lazy evaluation requests to the Google GenAI SDK.
│
└── frontend/
    └── src/                   # CLIENT-SIDE ENGINE
        ├── App.tsx            # Root component driving app state, tabs, and synchronization
        ├── index.css          # Styled tailwind layout directives
        ├── main.tsx           # Primary virtual react DOM mount point
        ├── types.ts           # Shared TypeScript interfaces (Metrics, Interaction, Tabs, etc.)
        │
        └── components/        # CORE PRESENTATION LAYER (Modularity First)
            ├── DashboardOverview.tsx   # Visual charts (Timeline, Pie, Metrics card highlights)
            ├── PromptExplorer.tsx      # Comprehensive datatable filterable by model, score, or language
            ├── ModelComparison.tsx     # Direct side-by-side benchmark comparing safety across LLMs
            └── LiveAnalyzer.tsx        # Submit custom prompts to audit live response mitigations
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
