import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any
from sqlalchemy import Integer, String, Float, Enum, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.exercise import Exercise
    from app.models.class_exercise_list import ClassExerciseList
    from app.models.user import User


# JSONB on Postgres, JSON elsewhere (tests use SQLite).
JSONType = JSON().with_variant(JSONB(), "postgresql")


class SubmissionStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    GRADED = "GRADED"
    LATE = "LATE"


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (
        Index("ix_submissions_exercise_list_class", "exercise_list_id", "class_id"),
        Index("ix_submissions_student_id", "student_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    exercise_id: Mapped[int] = mapped_column(Integer, ForeignKey("exercises.id"), nullable=False)
    exercise_list_id: Mapped[int] = mapped_column(Integer, ForeignKey("exercise_lists.id"), nullable=False)
    class_id: Mapped[int] = mapped_column(Integer, ForeignKey("classes.id"), nullable=False)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    code_snapshot: Mapped[str] = mapped_column(String, nullable=False)
    language_snapshot: Mapped[dict[str, Any]] = mapped_column(
        JSONType, nullable=False, default=dict, server_default="{}"
    )
    status: Mapped[SubmissionStatus] = mapped_column(Enum(SubmissionStatus), default=SubmissionStatus.PENDING, nullable=False)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    teacher_feedback: Mapped[str | None] = mapped_column(String, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(default=func.now())

    exercise: Mapped["Exercise"] = relationship("Exercise", back_populates="submissions")
    publication: Mapped["ClassExerciseList"] = relationship(
        "ClassExerciseList",
        back_populates="submissions",
        primaryjoin="and_(Submission.exercise_list_id == ClassExerciseList.exercise_list_id, Submission.class_id == ClassExerciseList.class_id)",
        foreign_keys="[Submission.exercise_list_id, Submission.class_id]",
    )
    student: Mapped["User"] = relationship("User", back_populates="submissions")
