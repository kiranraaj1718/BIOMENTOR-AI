"""Learning Path and Analytics router."""

import json
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.database import get_db
from app.models.user import User, LearningProgress
from app.models.quiz import QuizAttempt
from app.models.chat import ChatSession
from app.routers.auth import get_current_user
from app.services.llm_service import llm_service
from app.curriculum import CURRICULUM_TOPICS

router = APIRouter(prefix="/api", tags=["Learning Path & Analytics"])


@router.get("/learning-path")
async def get_learning_path(
    user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get personalized learning path based on student performance."""
    student_data = await _gather_student_data(user, db)

    # Generate personalized learning path
    topics_context = json.dumps([
        {"name": t["name"], "difficulty": t["difficulty"], "subtopics": t["subtopics"], "prerequisites": t["prerequisites"]}
        for t in CURRICULUM_TOPICS
    ], indent=2)

    learning_path = await llm_service.generate_learning_path(
        student_data=student_data,
        context=topics_context
    )

    return learning_path


@router.get("/analytics/dashboard")
async def get_dashboard_analytics(
    user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive analytics dashboard data."""
    if not user:
        return _demo_dashboard_data()

    # Get learning progress for all topics
    result = await db.execute(
        select(LearningProgress).where(LearningProgress.user_id == user.id)
    )
    progress_records = result.scalars().all()

    # Get quiz history
    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == user.id, QuizAttempt.is_completed == True)
        .order_by(desc(QuizAttempt.completed_at))
        .limit(30)
    )
    quiz_attempts = result.scalars().all()

    # Calculate statistics
    total_quizzes = len(quiz_attempts)
    avg_score = sum(a.score for a in quiz_attempts) / max(total_quizzes, 1)
    total_questions = sum(a.total_questions for a in quiz_attempts)
    total_correct = sum(a.correct_answers for a in quiz_attempts)
    total_time = sum(a.time_taken_seconds for a in quiz_attempts)

    # Topic mastery
    topic_mastery = [
        {
            "topic": p.topic_name,
            "mastery": round(p.mastery_level * 100, 1),
            "questions_answered": p.questions_answered,
            "correct_answers": p.correct_answers,
            "last_studied": p.last_studied.isoformat() if p.last_studied else None,
            "score_history": json.loads(p.quiz_scores) if p.quiz_scores else []
        }
        for p in progress_records
    ]

    # Score trend
    score_trend = [
        {
            "date": a.completed_at.isoformat() if a.completed_at else None,
            "score": a.score,
            "topic": a.topic
        }
        for a in reversed(quiz_attempts[:20])
    ]

    # Chat sessions count
    result = await db.execute(
        select(func.count(ChatSession.id)).where(ChatSession.user_id == user.id)
    )
    chat_count = result.scalar() or 0

    return {
        "summary": {
            "total_quizzes": total_quizzes,
            "average_score": round(avg_score, 1),
            "total_questions_answered": total_questions,
            "total_correct_answers": total_correct,
            "accuracy": round((total_correct / max(total_questions, 1)) * 100, 1),
            "total_study_time_minutes": total_time // 60,
            "chat_sessions": chat_count,
            "topics_studied": len(progress_records)
        },
        "topic_mastery": topic_mastery,
        "score_trend": score_trend,
        "recent_activity": [
            {
                "type": "quiz",
                "topic": a.topic,
                "score": a.score,
                "date": a.completed_at.isoformat() if a.completed_at else None
            }
            for a in quiz_attempts[:5]
        ]
    }


@router.get("/curriculum")
async def get_curriculum():
    """Get the full curriculum structure."""
    return {
        "topics": CURRICULUM_TOPICS,
        "total_topics": len(CURRICULUM_TOPICS)
    }


async def _gather_student_data(user: Optional[User], db: AsyncSession) -> dict:
    """Gather comprehensive student performance data."""
    if not user:
        return {
            "is_new_student": True,
            "topics_studied": [],
            "quiz_history": [],
            "overall_mastery": 0
        }

    # Get progress
    result = await db.execute(
        select(LearningProgress).where(LearningProgress.user_id == user.id)
    )
    progress_records = result.scalars().all()

    # Get recent quizzes
    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == user.id, QuizAttempt.is_completed == True)
        .order_by(desc(QuizAttempt.completed_at))
        .limit(10)
    )
    recent_quizzes = result.scalars().all()

    topics_studied = []
    for p in progress_records:
        topics_studied.append({
            "topic": p.topic_name,
            "mastery": p.mastery_level,
            "questions_answered": p.questions_answered,
            "accuracy": p.correct_answers / max(p.questions_answered, 1)
        })

    quiz_history = [
        {"topic": q.topic, "score": q.score, "difficulty": q.difficulty}
        for q in recent_quizzes
    ]

    overall_mastery = sum(p.mastery_level for p in progress_records) / max(len(progress_records), 1)

    return {
        "is_new_student": len(progress_records) == 0,
        "topics_studied": topics_studied,
        "quiz_history": quiz_history,
        "overall_mastery": round(overall_mastery, 2)
    }


def _demo_dashboard_data():
    """Return demo dashboard data for unauthenticated users."""
    return {
        "summary": {
            "total_quizzes": 12,
            "average_score": 74.5,
            "total_questions_answered": 60,
            "total_correct_answers": 45,
            "accuracy": 75.0,
            "total_study_time_minutes": 180,
            "chat_sessions": 8,
            "topics_studied": 4
        },
        "topic_mastery": [
            {"topic": "Molecular Biology Fundamentals", "mastery": 82.0, "questions_answered": 20, "correct_answers": 16, "score_history": [{"score": 80, "date": "2025-01-15"}, {"score": 85, "date": "2025-01-20"}]},
            {"topic": "Genetic Engineering", "mastery": 68.0, "questions_answered": 15, "correct_answers": 10, "score_history": [{"score": 60, "date": "2025-01-18"}, {"score": 72, "date": "2025-01-25"}]},
            {"topic": "Bioinformatics", "mastery": 55.0, "questions_answered": 10, "correct_answers": 6, "score_history": [{"score": 50, "date": "2025-01-22"}, {"score": 60, "date": "2025-01-28"}]},
            {"topic": "Bioprocess Engineering", "mastery": 45.0, "questions_answered": 8, "correct_answers": 4, "score_history": [{"score": 40, "date": "2025-01-25"}, {"score": 50, "date": "2025-02-01"}]},
            {"topic": "Immunology and Vaccines", "mastery": 72.0, "questions_answered": 12, "correct_answers": 9, "score_history": [{"score": 65, "date": "2025-02-05"}, {"score": 78, "date": "2025-02-10"}]}
        ],
        "score_trend": [
            {"date": "2025-01-15", "score": 65, "topic": "Molecular Biology"},
            {"date": "2025-01-18", "score": 72, "topic": "Molecular Biology"},
            {"date": "2025-01-22", "score": 60, "topic": "Genetic Engineering"},
            {"date": "2025-01-25", "score": 78, "topic": "Molecular Biology"},
            {"date": "2025-01-28", "score": 68, "topic": "Bioinformatics"},
            {"date": "2025-02-01", "score": 75, "topic": "Genetic Engineering"},
            {"date": "2025-02-05", "score": 82, "topic": "Immunology"},
            {"date": "2025-02-10", "score": 85, "topic": "Molecular Biology"}
        ],
        "recent_activity": [
            {"type": "quiz", "topic": "Molecular Biology", "score": 85, "date": "2025-02-10"},
            {"type": "quiz", "topic": "Immunology", "score": 82, "date": "2025-02-05"},
            {"type": "quiz", "topic": "Genetic Engineering", "score": 75, "date": "2025-02-01"}
        ]
    }
