"""Chat router — handles Q&A conversations with RAG-enhanced responses."""

import uuid
import json
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.routers.auth import get_current_user
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    topic_filter: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    sources: List[dict] = []
    message_id: str


@router.post("/send", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user)
):
    """Send a message and get an AI-powered response with RAG context."""
    # Create or get session
    session_id = request.session_id
    if not session_id:
        session_id = str(uuid.uuid4())
        if user:
            session = ChatSession(id=session_id, user_id=user.id, title=request.message[:50])
            db.add(session)
            await db.flush()

    # Retrieve relevant context using RAG
    retrieved_docs = await rag_service.retrieve(
        query=request.message,
        topic_filter=request.topic_filter
    )
    context = rag_service.get_context_string(retrieved_docs)

    # Get chat history if session exists
    chat_history = []
    if user and request.session_id:
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at)
            .limit(20)
        )
        messages = result.scalars().all()
        chat_history = [{"role": m.role, "content": m.content} for m in messages]

    # Generate AI response
    ai_response = await llm_service.chat(
        user_message=request.message,
        context=context,
        chat_history=chat_history
    )

    # Extract source references
    sources = [
        {
            "topic": doc["metadata"].get("topic_name", ""),
            "subtopic": doc["metadata"].get("subtopic", ""),
            "relevance": round(doc["relevance_score"], 2)
        }
        for doc in retrieved_docs[:3]
    ]

    # Save messages to database
    user_msg_id = str(uuid.uuid4())
    ai_msg_id = str(uuid.uuid4())

    if user:
        user_msg = ChatMessage(
            id=user_msg_id,
            session_id=session_id,
            role="user",
            content=request.message
        )
        ai_msg = ChatMessage(
            id=ai_msg_id,
            session_id=session_id,
            role="assistant",
            content=ai_response,
            sources=json.dumps(sources)
        )
        db.add(user_msg)
        db.add(ai_msg)

    return ChatResponse(
        response=ai_response,
        session_id=session_id,
        sources=sources,
        message_id=ai_msg_id
    )


@router.get("/sessions")
async def get_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all chat sessions for the current user."""
    if not user:
        return []

    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user.id)
        .order_by(desc(ChatSession.updated_at))
        .limit(50)
    )
    sessions = result.scalars().all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "topic": s.topic,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user)
):
    """Get all messages in a chat session."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    messages = result.scalars().all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "sources": json.loads(m.sources) if m.sources else [],
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]
