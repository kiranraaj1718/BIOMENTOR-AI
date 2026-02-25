"""Study Report router — generates concise study material reports/summaries on biotech topics."""

import logging
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service
from app.curriculum import CURRICULUM_TOPICS

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/report", tags=["Study Report"])


class StudyReportRequest(BaseModel):
    topic: str
    subtopic: str = ""  # optional: specific subtopic to focus on
    report_type: str = "summary"  # summary, detailed, revision, exam_prep


@router.get("/topics")
async def get_report_topics():
    """Get available topics for study report generation."""
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "difficulty": t["difficulty"],
            "subtopics": t["subtopics"],
        }
        for t in CURRICULUM_TOPICS
    ]


@router.post("/generate")
async def generate_study_report(
    request: StudyReportRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
):
    """Generate a concise study report/summary on a biotechnology topic."""
    if not request.topic or len(request.topic.strip()) < 2:
        return {
            "report": "Please select a topic to generate a study report.",
            "topic": "",
            "report_type": request.report_type,
        }

    # Retrieve curriculum context for the topic
    query = request.topic
    if request.subtopic:
        query = f"{request.topic} {request.subtopic}"

    retrieved_docs = await rag_service.retrieve(query=query, top_k=10)
    context = rag_service.get_context_string(retrieved_docs)

    result = await llm_service.generate_study_report(
        topic=request.topic,
        subtopic=request.subtopic,
        report_type=request.report_type,
        context=context,
    )
    return result
