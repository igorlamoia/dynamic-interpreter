from datetime import datetime
from typing import Any

from app.models.submission import SubmissionStatus
from app.schemas.base import CamelModel


class SubmissionCreate(CamelModel):
    exercise_id: int
    exercise_list_id: int
    class_id: int
    code_snapshot: str
    language_snapshot: dict[str, Any]
    status: SubmissionStatus = SubmissionStatus.SUBMITTED


class SubmissionGrade(CamelModel):
    score: float
    teacher_feedback: str | None = None


class StudentSimple(CamelModel):
    id: int
    name: str
    email: str


class ExerciseSimple(CamelModel):
    id: int
    title: str
    description: str | None = None
    grade_weight: float | None = None


class SubmissionResponse(CamelModel):
    id: int
    exercise_id: int
    exercise_list_id: int
    class_id: int
    student_id: int
    code_snapshot: str
    language_snapshot: dict[str, Any]
    status: SubmissionStatus
    score: float | None = None
    teacher_feedback: str | None = None
    submitted_at: datetime
    student: StudentSimple | None = None
    exercise: ExerciseSimple | None = None
