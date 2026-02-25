"""Advanced features router — Exam Predictor, Diagram Creator, Mistake Analyzer, Revision Mode, Study Roadmap."""

import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.user import User, LearningProgress
from app.models.quiz import QuizAttempt
from app.routers.auth import get_current_user
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service
from app.curriculum import CURRICULUM_TOPICS

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/features", tags=["Advanced Features"])


# ──────────────────────────── Request Models ────────────────────────────

class ExamPredictorRequest(BaseModel):
    topics: list[str] = []  # empty = use all studied topics

class DiagramRequest(BaseModel):
    topic: str
    diagram_type: str = "flowchart"  # flowchart, mindmap, cycle, comparison, hierarchy

class MistakeAnalyzerRequest(BaseModel):
    limit: int = 10  # how many recent quizzes to analyze

class RevisionRequest(BaseModel):
    topic: str
    duration_minutes: int = 5

class RoadmapRequest(BaseModel):
    goal: str = "exam_ready"  # exam_ready, deep_understanding, quick_overview
    weeks: int = 4


# ──────────────────────────── Exam Probability Predictor ────────────────

@router.post("/exam-predictor")
async def predict_exam_probability(
    request: ExamPredictorRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
):
    """Predict exam success probability based on learning progress and quiz history."""
    # Gather data
    progress_data = []
    quiz_data = []

    if user:
        # Get learning progress
        q = select(LearningProgress).where(LearningProgress.user_id == user.id)
        if request.topics:
            q = q.where(LearningProgress.topic_name.in_(request.topics))
        result = await db.execute(q)
        progress_records = result.scalars().all()
        progress_data = [
            {"topic": p.topic_name, "mastery": p.mastery_level,
             "questions_answered": p.questions_answered, "correct": p.correct_answers}
            for p in progress_records
        ]

        # Get recent quiz attempts
        result = await db.execute(
            select(QuizAttempt)
            .where(QuizAttempt.user_id == user.id, QuizAttempt.is_completed == True)
            .order_by(desc(QuizAttempt.completed_at))
            .limit(20)
        )
        quiz_attempts = result.scalars().all()
        quiz_data = [
            {"topic": a.topic, "score": a.score, "difficulty": a.difficulty,
             "total": a.total_questions, "correct": a.correct_answers}
            for a in quiz_attempts
        ]

    # Get curriculum context
    topics_context = json.dumps([
        {"name": t["name"], "difficulty": t["difficulty"], "subtopics": t["subtopics"]}
        for t in CURRICULUM_TOPICS
    ], indent=2)

    # Build prompt for LLM
    prompt = f"""Analyze this student's learning data and predict their exam success probability.

**Learning Progress:**
{json.dumps(progress_data, indent=2) if progress_data else "No learning progress data — new student."}

**Recent Quiz Performance:**
{json.dumps(quiz_data, indent=2) if quiz_data else "No quiz history yet."}

**Available Curriculum Topics:**
{topics_context}

Return ONLY valid JSON with this exact structure:
{{
  "overall_probability": 0.72,
  "confidence_level": "medium",
  "topic_predictions": [
    {{
      "topic": "Topic Name",
      "probability": 0.85,
      "readiness": "strong",
      "risk_factors": ["specific risk"],
      "boost_actions": ["specific action to improve"]
    }}
  ],
  "weak_areas": ["area1", "area2"],
  "strong_areas": ["area1", "area2"],
  "study_recommendations": [
    {{
      "priority": 1,
      "action": "specific study action",
      "expected_impact": "high",
      "time_needed_minutes": 30
    }}
  ],
  "score_estimate": {{
    "low": 55,
    "expected": 72,
    "high": 85
  }},
  "summary": "Brief overall assessment paragraph"
}}"""

    result = await llm_service.generate_json_response(prompt, "exam_predictor")
    return result


# ──────────────────────────── Instant Diagram Creator ───────────────────

@router.post("/diagram")
async def create_diagram(
    request: DiagramRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
):
    """Generate a Mermaid diagram for a biotechnology topic."""
    # Retrieve curriculum context
    retrieved_docs = await rag_service.retrieve(query=request.topic, top_k=6)
    context = rag_service.get_context_string(retrieved_docs)

    diagram_instructions = {
        "flowchart": "Create a Mermaid flowchart (graph TD) showing the step-by-step process or pathway.",
        "mindmap": "Create a Mermaid mindmap showing the main concept and its branches/sub-concepts.",
        "cycle": "Create a Mermaid flowchart showing a cyclical process with arrows looping back.",
        "comparison": "Create a Mermaid flowchart with two parallel columns comparing two related concepts.",
        "hierarchy": "Create a Mermaid flowchart (graph TD) showing the hierarchical classification or structure.",
    }

    instruction = diagram_instructions.get(request.diagram_type, diagram_instructions["flowchart"])

    prompt = f"""Create a detailed Mermaid.js diagram about this biotechnology topic:

**Topic:** {request.topic}
**Diagram Type:** {request.diagram_type}
**Instruction:** {instruction}

**Curriculum Context:**
{context}

Return ONLY valid JSON with this exact structure:
{{
  "mermaid_code": "graph TD\\n  A[Start] --> B[Step 1]\\n  B --> C[Step 2]",
  "title": "Diagram Title",
  "description": "Brief explanation of what the diagram shows",
  "key_concepts": ["concept1", "concept2", "concept3"],
  "study_notes": "Additional notes to help understand the diagram"
}}

IMPORTANT:
- The mermaid_code must be valid Mermaid.js syntax
- Use proper node IDs (single words or bracketed labels)
- Escape special characters in labels
- Keep node labels concise (max 6 words per node)
- Use subgraph for grouping related nodes when appropriate
- For mindmap type use: mindmap\\n  root((Topic))\\n    Branch1\\n      Leaf1"""

    result = await llm_service.generate_json_response(prompt, "diagram_creator")
    return result


# ──────────────────────────── Mistake Analyzer ──────────────────────────

@router.post("/mistake-analyzer")
async def analyze_mistakes(
    request: MistakeAnalyzerRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
):
    """Analyze quiz mistakes to identify patterns and weak areas."""
    mistakes = []

    if user:
        result = await db.execute(
            select(QuizAttempt)
            .where(QuizAttempt.user_id == user.id, QuizAttempt.is_completed == True)
            .order_by(desc(QuizAttempt.completed_at))
            .limit(request.limit)
        )
        quiz_attempts = result.scalars().all()

        for attempt in quiz_attempts:
            if attempt.questions_data:
                try:
                    qdata = json.loads(attempt.questions_data)
                    questions = qdata.get("questions", [])
                    answers = json.loads(attempt.answers_data) if attempt.answers_data else {}
                    for q in questions:
                        q_id = str(q["id"])
                        user_ans = answers.get(q_id, "")
                        correct_ans = q.get("correct_answer", "")
                        if str(user_ans).strip().upper()[:1] != str(correct_ans).strip().upper()[:1]:
                            mistakes.append({
                                "question": q["question"],
                                "your_answer": user_ans,
                                "correct_answer": correct_ans,
                                "explanation": q.get("explanation", ""),
                                "topic": q.get("topic", attempt.topic),
                                "subtopic": q.get("subtopic", ""),
                                "difficulty": q.get("difficulty", ""),
                            })
                except Exception:
                    continue

    prompt = f"""Analyze these quiz mistakes from a biotechnology student and identify patterns:

**Mistakes ({len(mistakes)} wrong answers from recent quizzes):**
{json.dumps(mistakes[:30], indent=2) if mistakes else "No mistake data available — the student hasn't taken any quizzes yet or got everything right!"}

Return ONLY valid JSON with this exact structure:
{{
  "total_mistakes_analyzed": {len(mistakes)},
  "pattern_summary": "Overall summary of mistake patterns",
  "weak_topics": [
    {{
      "topic": "Topic Name",
      "subtopic": "Subtopic",
      "mistake_count": 3,
      "common_error_type": "conceptual|factual|application|analysis",
      "explanation": "Why the student keeps getting this wrong",
      "fix_strategy": "Specific strategy to fix this"
    }}
  ],
  "error_types": {{
    "conceptual": 5,
    "factual": 3,
    "application": 2,
    "analysis": 1
  }},
  "improvement_plan": [
    {{
      "step": 1,
      "action": "specific action",
      "topic": "related topic",
      "estimated_time_minutes": 15,
      "expected_improvement": "what improvement to expect"
    }}
  ],
  "encouragement": "A motivational message acknowledging their strengths"
}}"""

    result = await llm_service.generate_json_response(prompt, "mistake_analyzer")
    return result


# ──────────────────────────── 5-Minute Revision Mode ────────────────────

@router.post("/revision")
async def generate_revision(
    request: RevisionRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
):
    """Generate a quick 5-minute revision session for a topic."""
    # Get curriculum context
    retrieved_docs = await rag_service.retrieve(query=request.topic, top_k=8)
    context = rag_service.get_context_string(retrieved_docs)

    # Get student progress if available
    student_mastery = "unknown"
    if user:
        result = await db.execute(
            select(LearningProgress).where(
                LearningProgress.user_id == user.id,
                LearningProgress.topic_name.ilike(f"%{request.topic}%")
            )
        )
        progress = result.scalar_one_or_none()
        if progress:
            student_mastery = f"{progress.mastery_level * 100:.0f}%"

    prompt = f"""Create a focused {request.duration_minutes}-minute revision session on this biotechnology topic.

**Topic:** {request.topic}
**Student Mastery Level:** {student_mastery}
**Time Budget:** {request.duration_minutes} minutes

**Curriculum Context:**
{context}

Return ONLY valid JSON with this exact structure:
{{
  "topic": "{request.topic}",
  "duration_minutes": {request.duration_minutes},
  "sections": [
    {{
      "title": "Section title",
      "time_minutes": 1,
      "type": "key_facts|mnemonics|quick_quiz|summary|diagram_review",
      "content": "The actual revision content in markdown"
    }}
  ],
  "flash_cards": [
    {{
      "front": "Question or term",
      "back": "Answer or definition"
    }}
  ],
  "quick_quiz": [
    {{
      "question": "Quick question",
      "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
      "correct": "A",
      "explanation": "Brief explanation"
    }}
  ],
  "key_takeaways": ["takeaway1", "takeaway2", "takeaway3"],
  "mnemonics": ["mnemonic tip 1", "mnemonic tip 2"]
}}"""

    result = await llm_service.generate_json_response(prompt, "revision_mode")
    return result


# ──────────────────────────── Personalized Study Roadmap ────────────────

@router.post("/roadmap")
async def generate_roadmap(
    request: RoadmapRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
):
    """Generate a personalized multi-week study roadmap."""
    # Gather student data
    progress_data = []
    quiz_data = []

    if user:
        result = await db.execute(
            select(LearningProgress).where(LearningProgress.user_id == user.id)
        )
        records = result.scalars().all()
        progress_data = [
            {"topic": p.topic_name, "mastery": p.mastery_level,
             "questions": p.questions_answered, "accuracy": p.correct_answers / max(p.questions_answered, 1)}
            for p in records
        ]

        result = await db.execute(
            select(QuizAttempt)
            .where(QuizAttempt.user_id == user.id, QuizAttempt.is_completed == True)
            .order_by(desc(QuizAttempt.completed_at))
            .limit(15)
        )
        quizzes = result.scalars().all()
        quiz_data = [
            {"topic": a.topic, "score": a.score, "difficulty": a.difficulty}
            for a in quizzes
        ]

    topics_context = json.dumps([
        {"name": t["name"], "difficulty": t["difficulty"], "subtopics": t["subtopics"], "prerequisites": t["prerequisites"]}
        for t in CURRICULUM_TOPICS
    ], indent=2)

    prompt = f"""Create a personalized {request.weeks}-week study roadmap for a biotechnology student.

**Goal:** {request.goal}
**Duration:** {request.weeks} weeks

**Current Progress:**
{json.dumps(progress_data, indent=2) if progress_data else "New student — no progress data yet."}

**Quiz History:**
{json.dumps(quiz_data, indent=2) if quiz_data else "No quiz history."}

**Available Curriculum:**
{topics_context}

Return ONLY valid JSON with this exact structure:
{{
  "goal": "{request.goal}",
  "total_weeks": {request.weeks},
  "weekly_hours_recommended": 8,
  "roadmap_summary": "Brief overview of the study plan",
  "weeks": [
    {{
      "week": 1,
      "theme": "Week theme",
      "topics": ["Topic 1", "Topic 2"],
      "daily_plan": [
        {{
          "day": "Monday",
          "tasks": [
            {{
              "type": "study|quiz|revision|practice",
              "topic": "Topic name",
              "description": "What to do",
              "duration_minutes": 45
            }}
          ]
        }}
      ],
      "milestone": "What you should know by end of this week",
      "quiz_goal": "Target quiz score for this week's topics"
    }}
  ],
  "milestones": [
    {{
      "week": 1,
      "description": "Milestone description",
      "achieved": false
    }}
  ],
  "tips": ["study tip 1", "study tip 2"]
}}"""

    result = await llm_service.generate_json_response(prompt, "study_roadmap")
    return result
