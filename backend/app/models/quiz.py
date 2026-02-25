"""Quiz database models."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    topic = Column(String, nullable=False)
    difficulty = Column(String, default="medium")  # easy, medium, hard, adaptive
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    time_taken_seconds = Column(Integer, default=0)
    questions_data = Column(Text, nullable=True)  # JSON: full quiz data
    answers_data = Column(Text, nullable=True)  # JSON: user's answers
    feedback = Column(Text, nullable=True)  # AI-generated feedback
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
