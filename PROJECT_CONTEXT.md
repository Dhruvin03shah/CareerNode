# CareerNode - Project Context

This file is the **single source of truth** for the CareerNode project. It contains the complete context, architecture, flow, and decisions to allow any AI or developer to continue development without confusion.

> **📝 Maintenance Rule**: This file MUST be updated with every code change — small or large — to reflect the current state of the project at all times.

---

## Changelog

| Date | Phase | What Changed |
|---|---|---|
| Session 1–5 | Phase 1–5 | Backend architecture, PostgreSQL, Groq LLM, RAG system, real interview flow |
| Session 6 | Phase 6 | Production React SaaS frontend (Dashboard, Analytics, Learning Hub, Settings) |
| Session 7 | Phase 7 | Gamification (XP, Levels, Badges) + Company Prep Mode |
| Session 8 | Phase 8 | Agentic UX (Agent Orchestrator, Thinking Loader, Adaptive Badges) + SSE streaming |
| Session 9 | Phase 9 | Expert prompt engineering — topic diversity, conversational pushback |
| Session 10 | Phase 10 | 3D immersive UI — React Three Fiber background, HeroOrb, floating nodes, neural lines |
| Session 11 | Phase 11 | Multi-account isolation — scoped all localStorage keys by user email |
| Session 12 | Phase 12 | **Adaptive Interview Engine** — dynamic question count (3–10), real-time depth-aware follow-up probing (max 2 follow-ups per topic), conversational adaptability, weak topic detection, personalized learning path |
| Session 13 | Phase 13 | **Agentic Backend Logging** — Custom colored console logging for API requests, LLM streaming, and step-by-step agent workflow execution visibility |
| Session 14 | Phase 14 | **Premium SaaS Landing Page** — Framer Motion animations, dark theme, Recharts analytics preview, interactive chat mockups, 9 modular landing components |
| Session 15 | Phase 15 | Landing Page Routing Fix — protected route, login → `/`, sidebar Home link, CTA → `/interview` |
| Session 16 | Phase 16 | **Video-Based AI Interview System** — Complete overhaul to 50/50 split-screen voice-only mode. Removed text input. Added AI Text-to-Speech (TTS), auto-mic recording, and Sarvam AI STT. Implemented heuristic confidence scoring (WPM, filler words) with a circular gauge UI. |
| Session 17 | Phase 17 | **Resume ATS Scoring System** — Integrated rigorous 5-criteria ATS evaluation in backend. Persists scores and missing keywords to `resume_evaluations` PostgreSQL table. Built `ATSReviewPhase.jsx` UI to visualize scores using circular gauges before live interview. |
| Session 18 | Phase 18 | **HextaAI Hero Component Integration** — Imported custom glassmorphic Hero component to `src/components/ui/hero-1.tsx`, configured default paths, set up `lucide-react` icons, and established `/hero-demo` route. |

---

## 1. Project Overview

* **Name**: CareerNode
* **Description**: A production-ready, agentic AI interview preparation platform with a full React frontend and FastAPI backend.
* **Goal**: Provide users with a real, interactive interview experience by extracting skills from their resume, asking diverse AI-generated questions, evaluating their typed answers, and generating a personalized learning path.
* **Key Features**:
  * Multi-agent orchestration using LangGraph
  * Groq Llama3 integration for intelligent dynamic responses
  * PostgreSQL database persistence for tracking interview sessions
  * Local RAG system (FAISS + sentence-transformers) for context-aware questions
  * **Real-time Video-Based AI Interview (Phase 16)**: Voice-only interaction with AI TTS, auto-mic recording, and split-screen 50/50 UI.
  * PDF resume upload with browser-side caching (localStorage)
  * Conversational AI that pushes back on bad or evasive answers
  * Real-time token streaming via SSE (ChatGPT typewriter effect)
  * Gamification — XP, levels, day streak, 6 badges
  * Agentic UX — visual agent orchestrator panel, thinking loader, adaptive toasts
  * **Heuristic Confidence Engine (Phase 16)**: Real-time analysis of speaking speed (WPM) and filler words with visual gauge feedback.
  * **Resume ATS Scoring System (Phase 17)**: Deep evaluation of uploaded resumes against the target role, providing Keyword Match, Overall ATS Score, and AI rewritten bullet points before the interview starts.
  * **HextaAI Hero UI Integration (Phase 18)**: Interactive landing components isolated in `components/ui` for modularity.

---

## 2. Architecture

* **High-level Design**: A modular backend built with FastAPI, utilizing LangGraph for complex agentic workflows, Groq for LLM generation, and PostgreSQL for data persistence. A Vite+React frontend consumes two API endpoints via Axios.
* **Flow**:
  `User (Browser) → React UI → FastAPI (POST /run or /answer) → LangGraph → Agents → Groq API → PostgreSQL DB → JSON Response → React UI Updates`

---

## 3. Folder Structure

```
backend/
├── agents/          # Contains all agent nodes used in LangGraph
│   ├── planner_agent.py      # ★ UPDATED Phase 12 — uses should_continue()
│   ├── resume_agent.py
│   ├── interview_agent.py    # ★ UPDATED Phase 12 v2 — depth-aware: stays on topic for follow-ups, probes deeper before switching
│   ├── evaluator_agent.py    # ★ UPDATED Phase 16 — computes voice confidence (WPM, fillers) and structured JSON scoring
│   ├── learning_agent.py     # ★ UPDATED Phase 12 — personalised path using weak_topics
│   └── adaptive_logic.py     # ★ NEW Phase 12 — should_continue(), compute_difficulty()
├── api/             # FastAPI routers and endpoint definitions
│   └── routes.py              # ★ UPDATED Phase 12 v2 — seeds depth_level, follow_up_count, current_topic; exposes in SSE meta
├── graph/           # LangGraph setup, state definition, and workflow
│   ├── state.py               # ★ UPDATED Phase 16 — new fields: confidence_data, speaking_duration_s
│   └── workflow.py            # ★ UPDATED Phase 12 — routes updated
├── rag/             # Retrieval-Augmented Generation implementation
│   ├── data/          # Stores text documents used as the knowledge base
│   ├── embeddings.py
│   ├── retriever.py
│   └── vector_store.py
├── tools/           # Utility functions (DB connections, Groq LLM API)
│   ├── db.py
│   ├── dummy_tools.py
│   ├── llm.py
│   ├── logger.py              # ★ NEW Phase 13 — ANSI-colored logging utility
│   └── sarvam_stt.py          # ★ UPDATED Phase 16 — Multi-mime support (webm/wav/mp3) for Sarvam AI STT
└── main.py          # FastAPI application entry point with CORS
frontend/
├── src/
│   ├── components/
│   │   ├── three/              # ★ NEW — Phase 10: React Three Fiber 3D components
│   │   │   ├── Scene3D.jsx     #   Full-screen background canvas (stars + nodes + lines)
│   │   │   ├── FloatingNodes.jsx  #   30 instanced icosahedron meshes (GPU efficient)
│   │   │   ├── NeuralLines.jsx    #   Animated neural network connection lines
│   │   │   └── HeroOrb.jsx        #   Dashboard hero — mouse-reactive 3D orb + rings
│   │   ├── ui/        # Glassmorphic UI primitives (Button, Card, Input, Textarea, Badge)
│   │   ├── Sidebar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── AIAvatarPanel.jsx   # ★ NEW Phase 16 — Animated AI interviewer with TTS & subtitle display
│   │   ├── VideoInterview.jsx  # ★ OVERHAULED Phase 16 — Full webcam, waveform, gauge, auto-mic-start
│   │   ├── Sidebar.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── InterviewContext.jsx
│   │   └── GamificationContext.jsx
│   ├── components/
│   │   └── landing/            # ★ NEW Phase 14 — 9 modular landing page components
│   │       ├── HeroSection.jsx
│   │       ├── SocialProof.jsx
│   │       ├── Features.jsx
│   │       ├── HowItWorks.jsx
│   │       ├── DemoPreview.jsx
│   │       ├── AnalyticsPreview.jsx
│   │       ├── Comparison.jsx
│   │       ├── CTASection.jsx
│   │       └── Footer.jsx
│   ├── layouts/
│   │   └── AppLayout.jsx       # ★ UPDATED — Phase 10: Now renders Scene3D background
│   ├── pages/
│   │   ├── Landing.jsx         # ★ NEW Phase 14, UPDATED Phase 15 — Protected landing/home page (inside AppLayout)
│   │   ├── Login.jsx           # ★ UPDATED — Phase 10: Scene3D backdrop; Phase 15: redirects to / after login
│   │   ├── Dashboard.jsx       # ★ UPDATED — Phase 10: HeroOrb in immersive hero section
│   │   ├── Interview.jsx       # ★ OVERHAULED Phase 16 — 50/50 split-screen, voice-only interview loop
│   │   ├── Results.jsx
│   │   ├── Analytics.jsx
│   │   ├── Learning.jsx
│   │   ├── History.jsx
│   │   └── Settings.jsx
│   ├── App.jsx                 # ★ UPDATED Phase 15 — / is now a protected route inside AppLayout
│   ├── main.jsx
│   └── index.css               # ★ UPDATED — Phase 10: canvas pointer-events, glass-dark utility
├── vite.config.js
└── package.json                # ★ UPDATED — Phase 10: three, @react-three/fiber, @react-three/drei added
.env               # Environment variables (DB credentials, Groq API key)
requirements.txt   # Python dependencies
test_run.py        # End-to-end CLI testing script
PROJECT_CONTEXT.md # This file — project central context
```

---

## 4. Agents (LangGraph Nodes)

* **Planner Agent** (`planner_agent.py`)
  * **Purpose**: Decides the execution flow dynamically.
  * **Logic**: Evaluates array lengths (`questions`, `answers`, `feedback`) to route to `resume_agent`, `interview_agent`, `evaluator_agent`, or `learning_agent`. If `len(answers) < len(questions)`, returns `__end__` to pause the graph and wait for the user's real input from the frontend. Loop runs for 5 questions.

* **Resume Agent** (`resume_agent.py`)
  * **Purpose**: Extracts skills from the user's resume.
  * **Output**: `skills` list (deduped, top 10) and `resume_feedback` string.
  * **Logic**: Uses Groq LLM to extract technical and soft skills. Falls back gracefully if API fails.

* **Interview Agent** (`interview_agent.py`)
  * **Purpose**: Generates a diverse, high-quality interview question.
  * **Expert Prompt Rules**:
    1. Must NOT repeat topics already asked (list of `used_topics` injected).
    2. Must choose from 7 topic areas: ML fundamentals, Deep Learning/NLP, SQL/Data Analysis, System Design, Real-world projects, Problem-solving, Behavioral.
    3. Tests depth, not just definitions.
    4. Difficulty progression: easy → medium → hard.
    5. Avoids repeated focus on the same concept (e.g. DistilBERT).
    6. Questions kept concise (max 3–4 lines).
    7. **Questions MUST be INTERMEDIATE to ADVANCED level** — no basic "What is X?" definitions.
    8. **Fundamentals must be wrapped in real-world scenarios**.
  * **Conversational Pushback**: If the candidate's previous answer was short/evasive, the agent refuses to move on and pushes back demanding elaboration.

* **Evaluator Agent** (`evaluator_agent.py`)
  * **Purpose**: Evaluates the user's typed answer and gives structured feedback.
  * **Output**: Appends to `scores` (float, 1–10) and `feedback` (structured string).
  * **Strict Rubric**: Scores based on 4 criteria — Technical Accuracy, Depth of Explanation, Clarity & Structure, Use of Examples/Real-world Thinking.
  * **Scoring Rules**: Average answers score 5–7. Only strong, detailed, well-reasoned answers score 8–10.
  * **Output Format**: `SCORE: X` followed by `FEEDBACK:` with bullet-pointed Strengths, Weaknesses, How to Improve.
  * **Default**: Falls back to score 5.0 with actionable improvement message if parsing fails.

* **Learning Agent** (`learning_agent.py`)
  * **Purpose**: Final node — generates learning path and saves to DB.
  * **Output**: `learning_path` bullet points. Calls `save_interview()` to persist session.

* **~~User Simulator~~** (`user_simulator.py`) — **REMOVED** from the workflow. The graph now pauses and waits for the human user's real input via the `/answer` API endpoint.

---

## 5. Tools

* **DB Tool** (`db.py`): PostgreSQL persistence via psycopg2. Auto-creates tables. Exposes `save_interview(state)`.
* **LLM Tool** (`llm.py`): Interfaces with Groq SDK (`llama3-70b-8192`). Includes fallback protection on API failure.
* **Logger Tool** (`logger.py`): Custom ANSI-colored logging utility to explicitly visualize agent operations, API requests, and errors in the backend terminal.

---

## 6. LangGraph Flow

* **State** (`graph/state.py`): A `TypedDict` with `user_id`, `resume_text`, `skills`, `resume_feedback`, `role`, `company`, `questions`, `answers`, `scores`, `feedback`, `learning_path`, `current_question`, `current_answer`, `question_count`, `difficulty`.
* **Nodes**: `resume_agent`, `interview_agent`, `evaluator_agent`, `learning_agent`.
* **Edges**: `START` → conditional `planner_router`. Every node (except `learning_agent`) routes back through `planner_router`. `learning_agent` → `END`.
* **Stateless Pause Pattern**: The graph runs until `len(answers) < len(questions)`, at which point it stops execution and returns the current state to the frontend. When the user submits an answer, the full state + new answer is sent to `/answer`, which re-invokes the graph to continue.

---

## 7. API Endpoints

* **`POST /run`** — Starts a new interview session.
  * **Input**: `multipart/form-data` with `resume` (UploadFile, PDF/TXT) OR `resume_text` (Form string), plus `role` and `company` fields.
  * **Output**: Initial state with extracted `skills`, first `question`, and `resume_text` (for frontend caching).

* **`POST /answer`** — Submits a human answer and resumes the graph.
  * **Input**: JSON `{"state": <current_state_dict>, "answer": <user_typed_answer>}`.
  * **Output**: Updated state with new question (or completed results if the interview is done).

* **`POST /stream-answer`** — SSE streaming endpoint (Phase 8).
  * Runs evaluation, then streams next AI question token-by-token.
  * **Phase 16**: Accepts `speaking_duration_s` to compute voice confidence metrics.

---

## 8. Database Design

* **Database**: `CareerNode` (PostgreSQL)
* **Table**: `interview_sessions`
* **Schema**: `id` (SERIAL PK), `user_id` (INT), `question` (TEXT), `answer` (TEXT), `score` (FLOAT), `created_at` (TIMESTAMP)

---

## 9. RAG System

* **Knowledge Base**: Text files in `backend/rag/data/`.
* **Embeddings**: `sentence-transformers` `all-MiniLM-L6-v2` model (runs locally).
* **Vector Store**: `faiss-cpu` `IndexFlatL2` for local similarity search.
* **Retrieval**: `interview_agent` queries the retriever with skills/role/company, fetches top 3 chunks, and injects them into the LLM prompt.

---

## 10. Frontend

* **Tech Stack**: Vite + React + React Router v6, Tailwind CSS v3, Framer Motion, Axios, Recharts, Lucide React, **Three.js + React Three Fiber + @react-three/drei (Phase 10)**.
* **Auth**: Mock authentication via `AuthContext`. Any email + 4+ char password works. Session stored in `localStorage`. Protected routes redirect to `/login`.
* **State Management**: `AuthContext` (session) + `InterviewContext` (interview data + history + `clearHistory`) + `GamificationContext` (XP, streak, badges).
* **Sidebar**: Three section groups — **Main** (Dashboard, Interview, Analytics), **Growth** (Learning Hub, History), **System** (Settings). Uses Lucide icons, active-link highlight, section labels.

### Pages & Routes

| Route | Component | Auth | Description |
|---|---|---|---|
| `/login` | `Login.jsx` | Public | Login card with 3D Scene backdrop. Redirects to `/` on success. |
| `/` | `Landing.jsx` | **Protected** | Default home page after login — full SaaS landing inside AppLayout with Sidebar + 3D background. |
| `/dashboard` | `Dashboard.jsx` | **Protected** | Immersive hero with 3D HeroOrb + stats + sessions |
| `/interview` | `Interview.jsx` | **Protected** | Resume upload, real-time chat, agent panel, streaming |
| `/analytics` | `Analytics.jsx` | **Protected** | Score trend, skill radar, skill gap analyzer |
| `/learning` | `Learning.jsx` | **Protected** | Skill bands, AI learning path, curated resources |
| `/results` | `Results.jsx` | **Protected** | Score, radar, expandable Q&A + "Improve My Answer" |
| `/history` | `History.jsx` | **Protected** | All past sessions, color-coded |
| `/settings` | `Settings.jsx` | **Protected** | Profile, dark mode toggle, danger zone |

### Phase 15 — Landing Page Routing Fix (current)

* Moved `Landing.jsx` **inside** the `ProtectedRoute + AppLayout` — it now renders with the full Sidebar and 3D background.
* Removed duplicate `Scene3D` from `Landing.jsx` (AppLayout already provides it).
* Login (`Login.jsx`) now redirects to `/` (Landing) instead of `/dashboard` after successful authentication.
* Sidebar (`Sidebar.jsx`) gains a **Home** `NavLink` at the top of the Main nav group pointing to `/`.
* CTA buttons in `HeroSection.jsx` and `CTASection.jsx` now navigate to `/interview` (user is authenticated).

### Phase 14 — Premium SaaS Landing Page

* Built 9 modular landing components in `src/components/landing/`.
* `HeroSection`: animated headline, live-badge, gradient CTA buttons.
* `SocialProof`: tech company logo band (Amazon, Google, Meta, Microsoft, Netflix).
* `Features`: 6 glassmorphism cards with hover glow — Adaptive Engine, Real-Time Eval, Skill Analytics, FAANG Questions, etc.
* `HowItWorks`: 3-step staggered vertical flow (Upload → Interview → Feedback).
* `DemoPreview`: Mock chat UI with simulated typing cursor and pushback AI bubble.
* `AnalyticsPreview`: Live Recharts Radar + Area charts with mock skill gap data.
* `Comparison`: Side-by-side Traditional vs CareerNode AI with ✓/✗ indicators.
* `CTASection`: Large gradient glow card with white glowing button.
* `Footer`: Structured 4-column footer with platform and connect links.

### Phase 13 — Agentic Backend Logging

* Introduced a dedicated `logger.py` to trace LangGraph steps.
* Backend terminal now displays colored logs for `[AGENT]`, `[API CALL]`, `[INFO]`, and `[ERROR]`.
* Replaced silent operations and raw `print` statements in agents with descriptive logs (e.g. "Generating next question for topic", "Routing to evaluator_agent", "Extracting skills from resume").

### Phase 10 — 3D Immersive UI

#### New Components (`src/components/three/`)

| File | Role |
|---|---|
| `Scene3D.jsx` | Full-screen fixed Three.js `<Canvas>` at `z-0`. Contains `StarField` (120 pts), `SceneGroup` (parallax mouse rotation wrapper), `FloatingNodes`, `NeuralLines`. Lazy-loaded via `React.lazy` + `Suspense`. |
| `FloatingNodes.jsx` | 30 icosahedron meshes rendered as a single `instancedMesh` (1 GPU draw call). Each node bobs vertically with a unique sine-wave phase + slow rotation. Emissive indigo/blue material. |
| `NeuralLines.jsx` | Finds the 22 nearest node pairs. Renders each connection as a thin `CylinderGeometry` mesh. `useFrame` pulses opacity between 0.04–0.25 on a per-line phase offset. |
| `HeroOrb.jsx` | Dashboard-only. A metallic sphere with 3 `TorusGeometry` orbital rings at different inclinations. Mouse-reactive tilt via `useFrame + mouse`. Outer glow sphere pulses with sine wave. Two point lights (blue + purple) for dramatic lighting. |

#### Modified Files — Phase 10

| File | Change |
|---|---|
| `AppLayout.jsx` | Lazy-loads `Scene3D` as a fixed `z-0` background behind all protected-route pages. Keeps existing UI at `z-10`. CSS blur orbs kept at `z-1` as subtle color accent on top. |
| `Login.jsx` | Replaces CSS blur-orb background with lazy-loaded `Scene3D`. Added `relative` positioning on wrapper. |
| `Dashboard.jsx` | Hero section replaced: text + CTA buttons on left, `HeroOrb` Canvas on right in a `w-64` absolute container. Framer Motion fade-in on text. "AI Career Coach" badge tag added. |
| `index.css` | Added global `canvas { pointer-events: none }` rule. Added `.pointer-events-auto canvas` override for interactive inline canvases. Added `.glass-dark` utility (65% dark BG + 16px blur) for cards above the 3D scene. |
| `package.json` | Added `three`, `@react-three/fiber`, `@react-three/drei` as dependencies. |

#### Performance Guarantees

| Concern | Mitigation |
|---|---|
| Frame rate | `frameloop` defaults to `always` but `powerPreference: "low-power"` throttles GPU usage |
| Draw calls | `instancedMesh` for all 30 floating nodes = 1 draw call |
| Bundle size | Scene3D is `React.lazy` + `Suspense` — zero impact on first paint |
| Pixel ratio | `dpr={[1, 1.5]}` — caps at 1.5x on retina displays |
| Geometry complexity | All low-poly: icosahedron(detail=0), sphere(32 segs), torus(8 tube segs) |
| Interactivity | `pointer-events: none` on the canvas — all UI clicks pass through |

### Agentic UX (Phase 8, still active)

* **AgentPanel**: Visualizes active/idle/done states for Evaluator, Planner, Interviewer, and Learning agents.
* **ThinkingLoader**: 3-step progress flow (Evaluating → Planning → Generating) with rotating thinking messages.
* **AdaptiveBadge**: Toast notifications for dynamic changes (e.g., "Difficulty → Advanced", "Follow-up triggered").
* **DecisionExplanation**: Collapsible "Why this question?" section explaining AI reasoning.
* **DebugPanel**: Collapsible sidebar panel showing exact internal state (avg score, difficulty, detected skills, topics).
* **Conversational Pushback**: AI follow-up bubble glows orange to visually signal a warning/pushback state.
* **Streaming AI Questions**: SSE endpoint streams next question token-by-token via `stream_llm()` (Groq streaming API). AI bubble grows in real-time with a blinking cursor.

### Gamification (Phase 7, still active)

* `GamificationContext.jsx` + `GamificationPanel.jsx`
* XP system, levels, 6 badges, day streak tracking.
* Company Prep Mode — Amazon, Google, Microsoft, Meta brand logos.

* **Run**: `cd frontend && npm run dev` → `http://localhost:5173` (or `5174` if port taken)

---

## 11. Current State of Project

### ✅ Completed

| Phase | Description |
|---|---|
| Phase 1 | Backend architecture setup (FastAPI, folder structure) |
| Phase 2 | PostgreSQL integration, `interview_sessions` table, `save_interview()` |
| Phase 3 | Groq LLM integration (`llama3-70b-8192`), fallback protection |
| Phase 4 | Local RAG system (FAISS + sentence-transformers, top-3 retrieval) |
| Phase 5 | Real interview flow — 5-question loop, difficulty progression, scoring, follow-up logic |
| Phase 6 | Production React SaaS frontend — Dashboard, Analytics, Learning Hub, Settings, History |
| Phase 7 | Gamification (XP, Levels, Badges), Company Prep Mode |
| Phase 8 | Agentic UX (AgentPanel, ThinkingLoader, AdaptiveBadge) + Real-time SSE token streaming |
| Phase 9 | Expert prompt engineering — topic diversity enforcement, conversational pushback |
| Phase 10 | React Three Fiber 3D immersive UI — Scene3D background, FloatingNodes, NeuralLines, HeroOrb on Dashboard |
| Phase 11 | Multi-account localStorage isolation — all keys scoped by user email |
| Phase 12 | Adaptive Interview Engine — dynamic question count, depth-aware follow-ups, weak topic detection |
| Phase 13 | Agentic Backend Logging — ANSI-colored logs for all agents, API calls, LLM requests |
| Phase 14 | Premium SaaS Landing Page — 9 modular components, Framer Motion, Recharts, mock demo preview |
| Phase 15 | Landing Page Routing Fix — protected route, login → `/`, sidebar Home link, CTA → `/interview` |
| **Phase 16** | **Video-Based AI Interview System — Voice-only interaction, AI TTS, 50/50 split UI, confidence gauge, Sarvam STT** |

### 🔲 Pending / Future Ideas

* User authentication system (login/signup, `users` table in DB)
* Interview history dashboard pulling from DB (not just localStorage)
* Video-based confidence (eye contact, head stability) using MediaPipe

---

## 12. How to Run

### Backend
```bash
# From the root: AI Career CoPilot/
python -m backend.main
# Server runs at http://0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Website at http://localhost:5173 (or 5174 if port is in use)
```

---

## 13. Important Decisions

* **Stateless Pause Pattern**: Instead of WebSocket or checkpointer, we pass the full state as JSON back to the frontend after each question. The frontend re-sends it on answer. Simple, robust, no extra infrastructure.
* **`user_simulator` Removal**: The graph no longer uses the auto-simulator. The frontend IS the user. Do not add `user_simulator` back.
* **Expert Prompt with `used_topics`**: The list of previously asked questions is injected verbatim into the interviewer prompt to prevent topic repetition.
* **Resume Caching via localStorage**: Avoids building a login system while still solving the "re-upload on every visit" friction. Trash icon lets users clear the cache.
* **`operator.add` reducers**: Agents must return only new items in a list (e.g., `{"questions": [new_q]}`), not the full list. This prevents exponential duplication.
* **3D Scene Lazy Loading (Phase 10)**: `Scene3D` is wrapped in `React.lazy` + `Suspense` so the ~220KB Three.js bundle downloads *after* first paint. The fallback is `null` — a transparent no-op.
* **`instancedMesh` for FloatingNodes (Phase 10)**: All 30 floating nodes are rendered in a single GPU draw call. Avoids the common trap of creating 30 separate `<mesh>` components.
* **`pointer-events: none` on Canvas (Phase 10)**: The global CSS rule `canvas { pointer-events: none }` ensures the 3D canvas never intercepts mouse clicks meant for UI elements above it.
* **Multi-Account LocalStorage Isolation (Phase 11)**: All `localStorage` items (`careernode_history`, `careernode_gamification`, `careernode_profile`) are dynamically suffixed with the logged-in user's email (e.g., `careernode_history_neelesh.shah22@gmail.com`). This ensures the app behaves correctly for multiple users logging into the same browser without building a full backend `users` table.
* **Landing Page as Protected Route (Phase 15)**: The landing/home page (`/`) lives inside the `ProtectedRoute + AppLayout` wrapper so it inherits the sidebar and 3D background. Unauthenticated users are redirected to `/login`, and after login the user lands on `/` instead of `/dashboard`. This makes the landing page the canonical home page of the app, not a public marketing page.
* **Agentic Backend Logging (Phase 13)**: All `print()` calls in agents replaced with structured `log_agent()`, `log_api()`, `log_info()`, and `log_error()` from `backend/tools/logger.py`. Each function uses ANSI color codes so agent steps are instantly visible in the backend terminal during development.
