# MindScribe — Frontend

React (Vite) frontend for the MindScribe NLP mental wellness journal analyzer. Talks to
the FastAPI backend (`app.py` + `nlp_pipeline.py`) over `/health` and `/analyze`.

## Setup

```bash
npm install
cp .env.example .env   # edit if your backend isn't on localhost:8000
npm run dev
```

Then run the FastAPI backend separately (from the `backend/` folder):

```bash
uvicorn app:app --reload
```

The nav bar shows a live "Engine online / offline" indicator from `/health`, so you'll
know immediately if the frontend can reach the backend.

## Pages

- `/` — Home: product intro, rotating sample-entry demo, how-it-works
- `/journal` — write an entry, submits to `POST /analyze`
- `/results` — the clean report: `report.dominant_emotion`, `writing_tone`,
  `key_emotional_words`, `possible_themes`
- `/pipeline` — the full `pipeline` object rendered stage-by-stage (1–8), for
  explainability / faculty review

`/results` and `/pipeline` read from shared React context (`src/context/AnalysisContext.jsx`)
populated by the last successful analysis — there's no server-side history, so refreshing
those pages directly (without analyzing first) shows an empty state pointing back to
`/journal`.

## Structure

```
src/
  api.js                    fetch wrapper for /health and /analyze
  constants/emotions.js     color + label per emotion class
  context/AnalysisContext.jsx
  components/Nav.jsx, Footer.jsx, EmotionBadge.jsx, StatusIndicator.jsx
  pages/Home.jsx, Journal.jsx, Results.jsx, PipelineTrace.jsx
```

## Notes

- CORS is already open (`allow_origins=["*"]`) on the backend for local dev.
- If you deploy the backend somewhere other than localhost, just update
  `VITE_API_BASE_URL` in `.env`.
