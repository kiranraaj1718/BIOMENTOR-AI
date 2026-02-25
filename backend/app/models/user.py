"""User database models."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Float, Integer
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    learning_progress = relationship("LearningProgress", back_populates="user", cascade="all, delete-orphan")


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    topic_id = Column(String, nullable=False)
    topic_name = Column(String, nullable=False)
    mastery_level = Column(Float, default=0.0)  # 0.0 - 1.0
    questions_answered = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    quiz_scores = Column(String, default="[]")  # JSON array of scores
    time_spent_minutes = Column(Integer, default=0)
    last_studied = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign key
    from sqlalchemy import ForeignKey
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="learning_progress")
