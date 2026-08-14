from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.language import LanguagePolicy, language_policy_type  # noqa: F401

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.test_case import TestCase
    from app.models.submission import Submission
    from app.models.exercise_list_item import ExerciseListItem
    from app.models.language import Language


# `LanguagePolicy` mora em `models/language.py`; o re-export mantém os imports
# existentes de `app.models.exercise` funcionando.
__all__ = ["Exercise", "LanguagePolicy"]


class Exercise(Base):
    __tablename__ = "exercises"
    __table_args__ = (
        Index("ix_exercises_teacher_id", "teacher_id"),
        CheckConstraint(
            "(language_policy = 'LOCKED') = (locked_language_id IS NOT NULL)",
            name="ck_exercises_locked_language_consistency",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    teacher_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    attachments: Mapped[str] = mapped_column(String, nullable=False, default="")
    language_policy: Mapped[LanguagePolicy] = mapped_column(
        language_policy_type, nullable=False, default=LanguagePolicy.OPEN, server_default="OPEN"
    )
    locked_language_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("languages.id", ondelete="RESTRICT"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    teacher: Mapped["User"] = relationship("User", back_populates="exercises")
    test_cases: Mapped[list["TestCase"]] = relationship("TestCase", back_populates="exercise", cascade="all, delete-orphan")
    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="exercise")
    list_items: Mapped[list["ExerciseListItem"]] = relationship("ExerciseListItem", back_populates="exercise")
    locked_language: Mapped["Language | None"] = relationship("Language")
