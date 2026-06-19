# Setup Instructions

## Requirements

- **Node.js** v20+ (v18 minimum)
- **npm** v9+
- Git

Optional (for real AI responses):
- Google Gemini API key
- OpenAI API key
- Anthropic API key

The system works fully offline without any API keys using the built-in `LocalProvider`.

---

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd <repo-name>

# Install dependencies (run from src/ directory)
cd src
npm install
```

If you are on a university or corporate network with SSL proxy issues:
```bash
npm config set strict-ssl false
npm install
```

---

## Configuration

Create a `.env` file inside `src/`:

```bash
cp src/.env.example src/.env
```

Edit `src/.env` and add any API keys you have (all are optional):

```
PORT=3000

# AI Provider keys — leave blank to use offline LocalProvider fallback
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# CORS — set to your frontend URL if deploying separately
CORS_ORIGIN=*

# Set on Vercel if deploying frontend separately from backend
# VITE_API_URL=https://your-backend.onrender.com
```

---

## Running the Project

### Development (recommended)

```bash
cd src
npm run dev
```

Opens at **http://localhost:3000** — both the API and the React dashboard are served from the same port.

### Production Build

```bash
cd src
npm run build        # compiles to dist/ and dist/server.cjs
node dist/server.cjs # run the production server
```

### Docker

```bash
# Build image
docker build -t ai-safety-observatory .

# Run container
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e OPENAI_API_KEY=your_key \
  -e ANTHROPIC_API_KEY=your_key \
  ai-safety-observatory
```

---

## Verifying the Setup

Once the server is running, check:

```bash
# Health check
curl http://localhost:3000/api/health
# → {"status":"ok","timestamp":"..."}

# List demo interactions (8 pre-loaded)
curl http://localhost:3000/api/interactions
# → [{id, prompt, response, model, language, riskScore, ...}, ...]

# Aggregate metrics
curl http://localhost:3000/api/metrics
# → {totalRequests, avgRiskScore, avgSafetyScore, languageBreakdown, ...}
```

Then open **http://localhost:3000** in a browser — the dashboard should load with 8 demo interactions already visible.

---

## Windows-Specific Note

If `tsx` fails to run via the `.bin` wrapper, use:

```cmd
cd src
npx tsx backend/server.ts
```

This is only needed if you want to run the backend manually without `npm run dev`.
