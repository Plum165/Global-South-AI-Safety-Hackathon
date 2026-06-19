# AI Safety Observatory for Africa

A full-stack platform that evaluates, monitors, and visualises the safety of Large Language Models (LLMs) across African languages, risk categories, and commercial/open-source model architectures — built for the Global South AI Safety Hackathon.

---

## What It Does

Most LLM safety guardrails are trained and tested primarily on English data. This observatory exposes the gap: harmful prompts in Swahili, isiZulu, Afrikaans, Shona, Yoruba, and Amharic can bypass safeguards that correctly block the same content in English.

The platform provides:
- Real-time safety scoring of prompts and responses across 4 AI models
- Per-language safety comparison (English vs African languages)
- Adversarial benchmark evaluation (30-prompt HarmBench suite)
- Jailbreak detection with live classification
- AI "Vibe Report" — trust and confidence metrics for judges

---

## Repository Structure

```
├── assets/                  Static assets (images, datasets)
├── demo/                    Demo video, presentation, overview
├── docs/
│   ├── SETUP.md             Installation and run instructions
│   ├── USAGE.md             How to use the dashboard
│   ├── TEAM.md              Team members and roles
│   └── ACKNOWLEDGEMENTS.md  Third-party libraries and references
├── scripts/                 Utility and automation scripts
├── src/
│   ├── backend/             Express.js API — routes, services, providers, analytics, db
│   ├── frontend/            React + TypeScript + Vite dashboard
│   ├── package.json         Unified dependencies
│   └── README.md            Full architecture reference
├── vendor/                  Self-included third-party modules
├── Dockerfile               Multi-stage Node 20 Alpine production build
├── render.yaml              One-click Render.com deployment config
├── .dockerignore
├── .gitignore
└── LICENSE
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide |
| Backend | Node.js, Express.js, TypeScript (tsx) |
| AI Providers | Google Gemini 2.0 Flash, OpenAI GPT-4o-mini, Anthropic Claude Haiku, Local offline fallback |
| Storage | File-based JSON (interactions.json, benchmarks.json) |
| Deployment | Docker (multi-stage), Render.com (backend), Vercel (frontend) |

---

## Dashboard Tabs

| Tab | What It Shows |
|---|---|
| Dashboard Metrics | Hero strip, KPI cards, timeline, risk distribution, model volume, AI Vibe Report |
| Prompt Explorer | Searchable/filterable interaction table with CSV export |
| Model Comparison | Safety vs risk bar chart, HarmBench evaluation runner |
| Live Analyzer | Submit prompts in any African language, get instant safety report |
| Language Safety | Per-language safety scores, gap callout, HarmBench language breakdown |
| Jailbreak Monitor | Detection rate, bypass rate, live attempt log with classification |

---

## Quick Start

See [docs/SETUP.md](docs/SETUP.md) for full instructions.

```bash
cd src
npm install
npm run dev          # starts at http://localhost:3000
```

---

## Team

- Moegamat Samsodien — [LinkedIn](https://www.linkedin.com/in/moegamatsamsodien/) · [Portfolio](https://moegamat-samsodien-portfolio.vercel.app/)
