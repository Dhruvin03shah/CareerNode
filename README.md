# CareerNode AI

CareerNode is a production-ready Generative AI interview platform that simulates realistic technical interviews, evaluates responses, and generates a personalized learning path based on performance.

It is designed to move beyond static question banks by adapting in real time to a user’s skills, responses, and weaknesses.

---

## Overview

CareerNode combines large language models, retrieval-based context, and structured evaluation to create a dynamic interview experience.

The system:

* extracts skills from a resume
* generates context-aware interview questions
* evaluates answers using a defined scoring rubric
* identifies weak areas
* produces a targeted improvement plan

---

## Demo

## Screenshots

## Key Features

### Adaptive Interview Engine

* Generates questions dynamically based on resume and role
* Adjusts difficulty as the interview progresses
* Uses follow-up probing to test depth of understanding
* Avoids repetition through topic tracking

### Resume-Aware Questioning (RAG)

* Extracts skills from uploaded resumes
* Uses FAISS-based retrieval with embeddings
* Injects relevant context into question generation
* Aligns questions with target role and company

### Video-Based Interview System

* Real-time interaction using speech instead of text
* AI-generated questions using text-to-speech
* Speech-to-text transcription using Sarvam AI
* Confidence scoring based on speaking patterns (WPM, filler usage)

### ATS Resume Evaluation

* Scores resumes across multiple criteria
* Identifies missing keywords and weak sections
* Suggests improvements aligned with job roles
* Displays results using visual gauges

### Analytics and Feedback

* Tracks performance across interviews
* Skill-level visualization using radar charts
* Detailed feedback per question
* Identifies consistent weak areas

---

## Tech Stack

### Backend

* FastAPI
* Groq (LLaMA3)
* FAISS (vector search)
* PostgreSQL
* Sentence Transformers

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion
* Recharts
* React Three Fiber

### AI Components

* Generative AI (LLM-based question + feedback generation)
* Retrieval-Augmented Generation (RAG)
* Streaming responses (SSE)
* Heuristic evaluation system

---

## Architecture

User → React Frontend → FastAPI → LLM + RAG → Evaluation → Database → UI

---

## How to Run

### Backend

```bash
python -m backend.main
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file:

```env
GROQ_API_KEY=your_key
DATABASE_URL=your_db_url
```

---

## What Makes This Different

* Not a static question bank — questions are generated dynamically
* Evaluates reasoning, not just correctness
* Adapts interview flow based on performance
* Combines resume understanding with interview logic
* Provides actionable learning paths instead of generic feedback

---

## Future Improvements

* Full authentication system
* Deployment pipeline (AWS / Vercel)
* Advanced video analysis (eye tracking, posture)
* Company-specific interview modes

---

## Author

Dhruvin Shah
