"""FastAPI main application — BioMentor AI Backend."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import auth, chat, quiz, analytics, report, features
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("🧬 Starting BioMentor AI...")

    # Initialize database
    await init_db()
    logger.info("✅ Database initialized")

    # Initialize services
    await rag_service.initialize()
    logger.info("✅ RAG service initialized")

    await llm_service.initialize()
    logger.info("✅ LLM service initialized")

    logger.info("🚀 BioMentor AI is ready!")
    yield

    logger.info("👋 BioMentor AI shutting down...")


app = FastAPI(
    title="BioMentor AI",
    description="AI-powered biotechnology tutoring platform with RAG-enhanced learning",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "https://frontend-sooty-six-45.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(quiz.router)
app.include_router(analytics.router)
app.include_router(report.router)
app.include_router(features.router)


@app.get("/")
async def root():
    return {
        "name": "BioMentor AI",
        "version": "1.0.0",
        "description": "AI-powered biotechnology tutoring platform",
        "endpoints": {
            "docs": "/docs",
            "auth": "/api/auth",
            "chat": "/api/chat",
            "quiz": "/api/quiz",
            "analytics": "/api/analytics",
            "curriculum": "/api/curriculum",
            "learning_path": "/api/learning-path"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "BioMentor AI"}
