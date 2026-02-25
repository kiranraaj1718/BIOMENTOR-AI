# BioMentor AI — AI-Powered Biotechnology Tutoring Platform

A production-ready web-based AI tutoring platform for biotechnology students, powered by a Large Language Model (LLM) integrated with Retrieval-Augmented Generation (RAG).

## 🧬 Features

### AI Tutor Chat
- **RAG-Enhanced Q&A**: Ask any biotechnology question and get accurate, curriculum-aligned answers
- **Context-Aware Responses**: Answers are grounded in verified curriculum content using vector similarity search
- **Source Citations**: Every answer includes references to curriculum sources
- **Chat History**: Persistent conversations with session management

### Adaptive Quiz System
- **AI-Generated Questions**: Dynamic quiz generation using LLM with curriculum context
- **Adaptive Difficulty**: Questions adjust based on student performance and mastery levels
- **Bloom's Taxonomy Alignment**: Questions tagged by cognitive level (remember, understand, apply, analyze, evaluate, create)
- **Detailed Feedback**: Explanations for every answer with concept reinforcement

### Performance Analytics Dashboard
- **Score Tracking**: Visualize quiz performance trends over time
- **Topic Mastery Radar**: See strengths and weaknesses across all topics
- **Progress Metrics**: Questions answered, accuracy rates, study time tracking
- **Learning Streak**: Track consistent engagement

### Personalized Learning Path
- **AI-Powered Recommendations**: Personalized study plan generated from performance data
- **Knowledge Gap Analysis**: Identifies weak areas and suggests targeted review
- **Prerequisite Awareness**: Respects topic dependencies in recommendations
- **Milestone Tracking**: Clear goals and progress indicators

## 📚 Curriculum Coverage

| Topic | Difficulty | Key Subtopics |
|-------|-----------|---------------|
| Molecular Biology Fundamentals | Beginner | DNA, RNA, Proteins, Gene Expression, Central Dogma |
| Genetic Engineering | Intermediate | CRISPR-Cas9, PCR, Gene Therapy, Recombinant DNA |
| Bioinformatics | Intermediate | Sequence Alignment, Genomics, Proteomics |
| Bioprocess Engineering | Advanced | Fermentation, Downstream Processing |
| Immunology & Vaccines | Advanced | Innate/Adaptive Immunity, mRNA Vaccines, CAR-T |
| Industrial Biotechnology | Intermediate | Enzyme Engineering, Metabolic Engineering |

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────┐
│   React + Vite   │────▶│   FastAPI Backend     │
│   Tailwind CSS   │◀────│                      │
│   Recharts       │     │  ┌────────────────┐  │
└─────────────────┘     │  │  LLM Service    │  │
                        │  │  (OpenAI GPT)   │  │
                        │  └───────┬────────┘  │
                        │          │           │
                        │  ┌───────▼────────┐  │
                        │  │  RAG Pipeline   │  │
                        │  │  ChromaDB       │  │
                        │  │  Embeddings     │  │
                        │  └────────────────┘  │
                        │                      │
                        │  ┌────────────────┐  │
                        │  │  SQLite DB      │  │
                        │  │  Users, Quizzes │  │
                        │  │  Progress       │  │
                        │  └────────────────┘  │
                        └──────────────────────┘
```

### Tech Stack

**Backend:**
- **FastAPI** — Async Python web framework
- **LangChain** — LLM orchestration and RAG pipeline
- **ChromaDB** — Vector database for curriculum embeddings
- **OpenAI GPT** — LLM for chat, quiz generation, and learning paths
- **SQLAlchemy** — Async ORM with SQLite (upgradeable to PostgreSQL)
- **Pydantic** — Data validation and settings management

**Frontend:**
- **React 19** — UI library
- **Vite** — Build tool
- **Tailwind CSS** — Utility-first styling
- **Recharts** — Analytics visualizations
- **React Router** — Client-side routing
- **React Markdown** — Rendering AI responses
- **Axios** — HTTP client

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API key (optional — runs in demo mode without it)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
python run.py
```

The backend will start at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`.

### Demo Mode

The platform works **without an OpenAI API key** in demo mode:
- Chat uses curriculum content for keyword-based responses
- Quiz generates pre-built demo questions
- Learning path provides sample recommendations
- All UI features are fully functional

To enable full AI capabilities, add your OpenAI API key to `backend/.env`.

## 📁 Project Structure

```
bio mentor ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Settings & configuration
│   │   ├── database.py          # Async SQLAlchemy setup
│   │   ├── models/              # Database models
│   │   │   ├── user.py          # User & LearningProgress
│   │   │   ├── chat.py          # ChatSession & ChatMessage
│   │   │   └── quiz.py          # QuizAttempt
│   │   ├── routers/             # API endpoints
│   │   │   ├── auth.py          # Authentication (register/login)
│   │   │   ├── chat.py          # Chat Q&A with RAG
│   │   │   ├── quiz.py          # Quiz generation & submission
│   │   │   └── analytics.py     # Dashboard & learning path
│   │   ├── services/            # Business logic
│   │   │   ├── rag_service.py   # RAG pipeline (embeddings + retrieval)
│   │   │   └── llm_service.py   # LLM interactions (chat, quiz, paths)
│   │   └── curriculum/          # Biotechnology content
│   │       └── __init__.py      # Full curriculum data
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
└── frontend/
    ├── src/
    │   ├── App.jsx              # Routes
    │   ├── main.jsx             # Entry point
    │   ├── index.css            # Tailwind + custom styles
    │   ├── api/client.js        # API client (Axios)
    │   ├── context/AuthContext.jsx
    │   ├── components/          # Shared UI
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   └── pages/               # Page components
    │       ├── HomePage.jsx     # Landing page
    │       ├── AuthPage.jsx     # Login/Register
    │       ├── ChatPage.jsx     # AI Tutor chat
    │       ├── QuizPage.jsx     # Adaptive quiz
    │       ├── DashboardPage.jsx # Analytics dashboard
    │       └── LearningPathPage.jsx
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/chat/send` | Send message, get RAG-enhanced response |
| GET | `/api/chat/sessions` | List chat sessions |
| GET | `/api/chat/sessions/:id/messages` | Get chat history |
| GET | `/api/quiz/topics` | List available quiz topics |
| POST | `/api/quiz/generate` | Generate adaptive quiz |
| POST | `/api/quiz/submit` | Submit quiz answers |
| GET | `/api/quiz/history` | Get quiz history |
| GET | `/api/analytics/dashboard` | Get dashboard analytics |
| GET | `/api/learning-path` | Get personalized learning path |
| GET | `/api/curriculum` | Get curriculum structure |

## 🔧 Configuration

Environment variables (`.env`):

```env
OPENAI_API_KEY=sk-...          # OpenAI API key (optional for demo mode)
OPENAI_MODEL=gpt-4o-mini       # LLM model to use
SECRET_KEY=your-secret-key     # JWT secret (change in production)
DATABASE_URL=sqlite+aiosqlite:///./biomentor.db
CHROMA_PERSIST_DIR=./chroma_data
FRONTEND_URL=http://localhost:5173
```

## 🛡️ Production Deployment

For production:
1. Set a strong `SECRET_KEY`
2. Switch to PostgreSQL: `DATABASE_URL=postgresql+asyncpg://...`
3. Use a dedicated vector database (Pinecone, Weaviate)
4. Deploy behind Nginx/Traefik reverse proxy
5. Add rate limiting and request validation
6. Enable HTTPS
7. Set up proper CORS origins

## License

MIT
