"""Quiz router — adaptive quiz generation and management."""

import uuid
import json
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.database import get_db
from app.models.user import User, LearningProgress
from app.models.quiz import QuizAttempt
from app.routers.auth import get_current_user
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service
from app.curriculum import CURRICULUM_TOPICS

router = APIRouter(prefix="/api/quiz", tags=["Quiz"])

# In-memory store for quiz data (supports anonymous users)
_quiz_store: dict = {}


class QuizGenerateRequest(BaseModel):
    topic: str
    difficulty: str = "medium"  # easy, medium, hard, adaptive
    num_questions: int = 5

class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: dict  # {question_id: selected_answer}
    time_taken_seconds: int = 0


@router.get("/topics")
async def get_quiz_topics():
    """Get available quiz topics."""
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "difficulty": t["difficulty"],
            "subtopics": t["subtopics"]
        }
        for t in CURRICULUM_TOPICS
    ]


@router.post("/generate")
async def generate_quiz(
    request: QuizGenerateRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user)
):
    """Generate an adaptive quiz based on topic and student performance."""
    # Get student performance data for adaptive difficulty
    student_performance = None
    if user:
        result = await db.execute(
            select(LearningProgress).where(
                LearningProgress.user_id == user.id,
                LearningProgress.topic_name.ilike(f"%{request.topic}%")
            )
        )
        progress = result.scalar_one_or_none()
        if progress:
            student_performance = {
                "mastery_level": progress.mastery_level,
                "last_score": progress.correct_answers / max(progress.questions_answered, 1),
                "weak_areas": [],
                "strong_areas": []
            }

    # Retrieve curriculum context
    retrieved_docs = await rag_service.retrieve(query=request.topic, top_k=8)
    context = rag_service.get_context_string(retrieved_docs)

    # Generate quiz using LLM
    quiz_data = await llm_service.generate_quiz(
        topic=request.topic,
        difficulty=request.difficulty,
        num_questions=request.num_questions,
        context=context,
        student_performance=student_performance
    )

    # Save quiz attempt
    quiz_id = str(uuid.uuid4())

    # Always store full quiz data in memory (for answer checking at submit time)
    _quiz_store[quiz_id] = quiz_data

    # Also persist to DB for logged-in users
    if user:
        attempt = QuizAttempt(
            id=quiz_id,
            user_id=user.id,
            topic=request.topic,
            difficulty=request.difficulty,
            total_questions=len(quiz_data.get("questions", [])),
            questions_data=json.dumps(quiz_data)
        )
        db.add(attempt)

    # Build options map so frontend can display full answer text in results
    questions_response = []
    for q in quiz_data.get("questions", []):
        # Build a lookup from option letter -> full option text
        options_map = {}
        for opt in q.get("options", []):
            if opt and len(opt) >= 1:
                letter = opt[0].upper()
                options_map[letter] = opt
        questions_response.append({
            "id": q["id"],
            "question": q["question"],
            "type": q.get("type", "multiple_choice"),
            "options": q["options"],
            "options_map": options_map,
            "difficulty": q.get("difficulty", request.difficulty),
            "bloom_level": q.get("bloom_level", "understand")
        })

    return {
        "quiz_id": quiz_id,
        "topic": request.topic,
        "difficulty": request.difficulty,
        "questions": questions_response
    }


@router.post("/submit")
async def submit_quiz(
    request: QuizSubmitRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user)
):
    """Submit quiz answers and get results with feedback."""
    # Get quiz data — first try in-memory store, then DB
    questions_data = _quiz_store.pop(request.quiz_id, None)

    quiz_attempt = None
    if not questions_data and user:
        result = await db.execute(
            select(QuizAttempt).where(QuizAttempt.id == request.quiz_id)
        )
        quiz_attempt = result.scalar_one_or_none()
        if quiz_attempt and quiz_attempt.questions_data:
            questions_data = json.loads(quiz_attempt.questions_data)
    elif user:
        # Still fetch the DB record for updating
        result = await db.execute(
            select(QuizAttempt).where(QuizAttempt.id == request.quiz_id)
        )
        quiz_attempt = result.scalar_one_or_none()

    if not questions_data:
        raise HTTPException(status_code=404, detail="Quiz not found or expired. Please generate a new quiz.")

    questions = questions_data.get("questions", [])
    results = []
    correct_count = 0

    for q in questions:
        q_id = str(q["id"])
        user_answer = request.answers.get(q_id, request.answers.get(int(q_id) if q_id.isdigit() else q_id, ""))
        correct_answer = str(q.get("correct_answer", "")).strip().upper()
        user_answer_letter = str(user_answer).strip().upper()

        # Normalize: extract just the letter for comparison (handles "A", "A)", "A) text", etc.)
        if correct_answer and len(correct_answer) > 0:
            correct_answer_letter = correct_answer[0]
        else:
            correct_answer_letter = correct_answer
        if user_answer_letter and len(user_answer_letter) > 0:
            user_answer_compare = user_answer_letter[0]
        else:
            user_answer_compare = user_answer_letter

        is_correct = user_answer_compare == correct_answer_letter

        if is_correct:
            correct_count += 1

        # Build options map for looking up full text
        options_map = {}
        for opt in q.get("options", []):
            if opt and len(opt) >= 1:
                letter = opt[0].upper()
                options_map[letter] = opt

        # Get full text for display
        user_answer_text = options_map.get(user_answer_compare, str(user_answer))
        correct_answer_text = options_map.get(correct_answer_letter, str(q.get("correct_answer", "")))

        results.append({
            "question_id": q["id"],
            "question": q["question"],
            "your_answer": user_answer_text,
            "your_answer_letter": user_answer_compare,
            "correct_answer": correct_answer_text,
            "correct_answer_letter": correct_answer_letter,
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
            "difficulty": q.get("difficulty", "medium"),
            "options": q.get("options", [])
        })

    total = len(questions) if questions else 1
    score = round((correct_count / total) * 100, 1)

    # Update quiz attempt in DB
    if quiz_attempt and user:
        quiz_attempt.correct_answers = correct_count
        quiz_attempt.score = score
        quiz_attempt.time_taken_seconds = request.time_taken_seconds
        quiz_attempt.answers_data = json.dumps(request.answers)
        quiz_attempt.is_completed = True
        quiz_attempt.completed_at = datetime.utcnow()

        # Update learning progress
        await _update_learning_progress(db, user.id, quiz_attempt.topic, score, total)

    # Generate performance feedback
    if score >= 90:
        feedback = "🌟 Excellent! You've demonstrated mastery of this topic. Consider advancing to more challenging material."
    elif score >= 70:
        feedback = "👍 Good job! You have a solid understanding. Review the questions you missed to strengthen your knowledge."
    elif score >= 50:
        feedback = "📚 You're making progress! Focus on reviewing the concepts in the questions you got wrong."
    else:
        feedback = "💪 Keep studying! Review the curriculum material for this topic and try again. Every attempt helps you learn."

    return {
        "quiz_id": request.quiz_id,
        "score": score,
        "correct": correct_count,
        "total": total,
        "feedback": feedback,
        "results": results,
        "time_taken_seconds": request.time_taken_seconds
    }


async def _update_learning_progress(db: AsyncSession, user_id: str, topic: str, score: float, num_questions: int):
    """Update the user's learning progress for a topic."""
    result = await db.execute(
        select(LearningProgress).where(
            LearningProgress.user_id == user_id,
            LearningProgress.topic_name == topic
        )
    )
    progress = result.scalar_one_or_none()

    if progress:
        progress.questions_answered += num_questions
        progress.correct_answers += int(score * num_questions / 100)
        # Update mastery using exponential moving average
        alpha = 0.3
        progress.mastery_level = alpha * (score / 100) + (1 - alpha) * progress.mastery_level
        progress.last_studied = datetime.utcnow()
        # Store score history
        scores = json.loads(progress.quiz_scores) if progress.quiz_scores else []
        scores.append({"score": score, "date": datetime.utcnow().isoformat()})
        progress.quiz_scores = json.dumps(scores[-20:])  # Keep last 20 scores
    else:
        progress = LearningProgress(
            id=str(uuid.uuid4()),
            user_id=user_id,
            topic_id=topic.lower().replace(" ", "_"),
            topic_name=topic,
            mastery_level=score / 100,
            questions_answered=num_questions,
            correct_answers=int(score * num_questions / 100),
            quiz_scores=json.dumps([{"score": score, "date": datetime.utcnow().isoformat()}])
        )
        db.add(progress)


@router.get("/history")
async def get_quiz_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get quiz attempt history for the current user."""
    if not user:
        return []

    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == user.id, QuizAttempt.is_completed == True)
        .order_by(desc(QuizAttempt.completed_at))
        .limit(20)
    )
    attempts = result.scalars().all()
    return [
        {
            "id": a.id,
            "topic": a.topic,
            "difficulty": a.difficulty,
            "score": a.score,
            "correct": a.correct_answers,
            "total": a.total_questions,
            "time_taken_seconds": a.time_taken_seconds,
            "completed_at": a.completed_at.isoformat() if a.completed_at else None
        }
        for a in attempts
    ]
