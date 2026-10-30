#  full Stack Agentic Researcher

A full-stack agentic AI application: you give it a research topic, and a LangGraph agent validates the topic, breaks it into sub-questions, searches the web (up to 20 URLs), optionally queries a local knowledge base, and writes a structured research report — all while streaming every step to your screen in real time, just like Claude Code shows its thinking.

**What I have done in this project new:**
- **LangGraph**: building multi-node agent graphs with conditional routing and state
- **Topic validation**: using the LLM as a gate before doing expensive work
- **Server-Sent Events (SSE)**: streaming real-time updates from server to browser
- **Research history**: storing past reports in SQLite
- **PDF export**: generating downloadable PDFs with `reportlab`

---

## Project Structure

```
Agentic-Research-Assistant/
├── backend/
│   ├── main.py              ← FastAPI app (port 8002) — SSE + history endpoints
│   ├── requirements.txt
│   ├── .env                 ← Your API keys (you create this)
│   ├── research_history.db  ← SQLite database (auto-created on first run)
│   └── app/
│       ├── config.py        ← Settings from .env
│       ├── models.py        ← Pydantic models
│       ├── routes.py        ← URL routing
│       ├── api.py           ← SSE event generator + history handlers
│       ├── agent.py         ← LangGraph research agent (all nodes + graph)
│       ├── database.py      ← SQLite CRUD for research history
│       └── pdf_generator.py ← Markdown → PDF using reportlab
│
└── frontend/
    ├── package.json         ← Node dependencies (Vite, React, Tailwind)
    ├── vite.config.ts       ← Vite configuration
    ├── index.html           ← App entry point
    └── src/                 ← React components and pages
```

---

## The Agent Graph

```
Your topic
    ↓
[validate_topic]      ← Is this a real research topic?
    ↓
    ├─ Invalid → ERROR (stops here, shows reason)
    └─ Valid   ↓
[analyze_query]       ← Break into 3 sub-questions + pick strategy
    ↓
[decide_search_strategy]
    ↓
[web_search]          ← Tavily search (up to 20 URLs across sub-questions)
    ↓
[kb_search]           ← Qdrant knowledge base (skips if not configured)
    ↓
[synthesize]          ← LLM writes the full structured report
    ↓
  Report saved to SQLite → streamed to browser
```

---

## Prerequisites

| Requirement | Why |
|---|---|
| Python 3.10+ | Backend runtime |
| Node.js 18+ | Frontend runtime (Vite + React) |
| Gemini API key | Powers the LLM for validation, planning, and report writing |
| Tavily API key | Powers the web search (free tier available) |
| Qdrant Cloud *(optional)* | Only needed if you want knowledge base search |

**Get Node.js:** https://nodejs.org (download the LTS version)  
**Get an Gemini API key:** https://aistudio.google.com/apikey  
**Get a free Tavily API key:** https://tavily.com (sign up, it's free for students)  
**Get a free Qdrant Cloud cluster *(optional)*:** https://cloud.qdrant.io

---

## Backend Setup

### Step 1 — Open a terminal in the backend folder

```bash
cd Agentic-Research-Assistant/backend
```

### Step 2 — Create a virtual environment

```bash
python -m venv venv

# Activate on Windows:
venv\Scripts\activate

# Activate on Mac / Linux:
source venv/bin/activate
```

### Step 3 — Install Python dependencies

```bash
pip install -r requirements.txt
```

> First run may take a few minutes — `sentence-transformers` downloads a local model.

### Step 4 — Create your `.env` file

Create a file called `.env` inside `Agentic-Research-Assistant/backend/`:

```env
# Required — Gemini (for LLM: validation, planning, synthesis)
GEMINI_API_KEY=sk-proj-...

# Required for web search — get a free key at https://tavily.com
TAVILY_API_KEY=tvly-...

# Optional — only needed for knowledge base search
# If you leave these blank, the kb_search step is automatically skipped
QDRANT_URL=https://xxxx.us-east-1-0.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=eyJhbGciO...
QDRANT_COLLECTION=rag_uploads

# Optional — change the model or port if needed
LLM_MODEL=gemini-2.5-flash
PORT=8002
```

> **Minimum to get started:** You only need `GEMINI_API_KEY` and `TAVILY_API_KEY`.  
> The Qdrant settings are optional — the agent skips KB search if they are not set.

### Step 5 — Start the backend server

```bash
uvicorn main:app --reload --port 8002
```

You should see:
```
INFO     | Initializing SQLite database...
INFO     | Building research agent...
INFO     | Research agent ready. Server is up at http://localhost:8002
INFO     | API docs: http://localhost:8002/docs
```

**Backend is now running at:** `http://localhost:8002`  
**API docs (Swagger UI):** `http://localhost:8002/docs`

---

## Frontend Setup

> Open a **second terminal** — keep the backend running in the first one.

### Step 1 — Open a terminal in the frontend folder

```bash
cd Agentic-Research-Assistant/frontend
```

### Step 2 — Install Node dependencies

```bash
npm install
```

### Step 3 — Start the development server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 4 — Open the app

Go to **http://localhost:5173** in your browser.

---

## Using the App

### Research tab

1. **Type a research topic** in the input bar  
   Example: `"Impact of AI on healthcare in 2025"`

2. **Click Research** (or press Enter)

3. Watch the **Agent Thinking panel** (left side) stream each step in real time:
   - `Validating research topic...` — is this a valid topic?
   - `Analyzing research topic...` — breaking into sub-questions
   - `Searching the web...` — Tavily finds up to 20 relevant URLs
   - `Searching knowledge base...` — queries Qdrant (if configured)
   - `Writing research report...` — LLM synthesizes all findings

4. The **Research Report** appears on the right when complete

5. Click **Download PDF** to save the report as a PDF file

6. Click **Print** to print or save as PDF via the browser print dialog

### History tab

- Click **📚 History** in the top navigation
- All past research sessions are listed with topic, date, and URL count
- Click **👁️ View** to load a past report back into the Research panel
- Click **⬇️ PDF** to download a past report as PDF
- Click **🗑️** to permanently delete a report

---

## What Happens When a Topic is Invalid?

If you type something like `"asdfgh"` or a single meaningless word, the `validate_topic` node detects this and the agent stops immediately:

```
🛡️ Validate  [running...]
› Evaluating topic: "asdfgh"
✗  Invalid topic — "asdfgh" does not represent a meaningful research subject
```

This prevents wasting API calls on nonsensical input.

---

## API Reference (Backend)

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/research` | Start researching a topic (SSE stream) |
| `GET` | `/history` | List all past research reports |
| `GET` | `/history/{id}` | Get the full text of one past report |
| `GET` | `/history/{id}/pdf` | Download a report as a PDF |
| `DELETE` | `/history/{id}` | Delete a report |
| `GET` | `/health` | Server status |

---

## Common Issues

**Backend won't start — `GEMINI_API_KEY` required**
→ Make sure `.env` is inside `backend/` and the key starts with `sk-`.

**Web search returns no results**
→ Check `TAVILY_API_KEY` in `.env`. Get a free key at https://tavily.com.

**Frontend shows "Connection error"**
→ The backend isn't running. Start it first: `uvicorn main:app --reload --port 8002`

**`npm install` fails**
→ Check Node.js version: `node --version` — needs 18 or higher.

**Port 5173 already in use**
→ Vite will try the next available port (5174, 5175...). Check the terminal output.

**PDF download fails**
→ Make sure `reportlab` installed successfully: `pip show reportlab`

**KB search always skips**
→ Normal if `QDRANT_URL` is not set in `.env`. This is expected — it's optional.

**Agent produces no report**
→ Check the backend terminal for error messages. Usually a missing or invalid API key.

---

## SSE Streaming — How It Works



The browser does not use the native `EventSource` API (which only supports GET requests). Instead, the frontend uses `fetch()` with a `ReadableStream`:

```javascript
// WHY fetch() and not EventSource?
// EventSource only supports GET. We need POST to send the topic in the body.
const response = await fetch('/research', {
  method: 'POST',
  body: JSON.stringify({ topic }),
});

// Read the SSE stream manually
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  // Parse "data: {...}\n\n" events and update the UI
}
```

The backend yields events as the agent progresses:
```json
{"event": "node_start", "node": "validate_topic", "display": "Validating research topic"}
{"event": "thinking",   "node": "web_search",     "message": "Found 7 results for sub-question 1"}
{"event": "complete",   "report": "# Report...",  "report_id": "a1b2c3d4"}
```

---

## Running Both Servers (Summary)

| Terminal | Command | URL |
|----------|---------|-----|
| Terminal 1 (Backend) | `cd backend && uvicorn main:app --reload --port 8002` | http://localhost:8002/docs |
| Terminal 2 (Frontend) | `cd frontend && npm run dev` | http://localhost:5173 |

---

## Stopping Everything

- **Backend:** Press `Ctrl + C` in Terminal 1
- **Frontend:** Press `Ctrl + C` in Terminal 2
- **Deactivate venv:** `deactivate` in Terminal 1
