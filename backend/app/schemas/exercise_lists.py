from datetime import datetime

from app.models.language import LanguagePolicy
from app.schemas.base import CamelModel
from app.schemas.languages import LanguageResponse


class ExerciseListCreate(CamelModel):
    title: str
    description: str | None = None


class ExerciseListUpdate(CamelModel):
    title: str | None = None
    description: str | None = None
    language_policy: LanguagePolicy | None = None
    locked_language_id: int | None = None


class ExerciseSummary(CamelModel):
    id: int
    title: str


class ExerciseListItemResponse(CamelModel):
    exercise_id: int
    grade_weight: float
    order_index: int
    exercise: ExerciseSummary


class ClassPublicationResponse(CamelModel):
    class_id: int
    total_grade: float
    min_required: float
    deadline: datetime


class ExerciseListResponse(CamelModel):
    id: int
    teacher_id: int
    title: str
    description: str | None
    language_policy: LanguagePolicy
    locked_language_id: int | None = None
    locked_language: LanguageResponse | None = None
    created_at: datetime
    updated_at: datetime
    items: list[ExerciseListItemResponse]
    classes: list[ClassPublicationResponse]
    submitted_exercise_ids: list[int] = []


class PublishRequest(CamelModel):
    class_id: int
    total_grade: float
    min_required: float
    deadline: datetime


class AddExerciseRequest(CamelModel):
    exercise_id: int
    grade_weight: float
    order_index: int = 0


class PublishResponse(CamelModel):
    class_id: int
    exercise_list_id: int
    total_grade: float
    min_required: float
    deadline: datetime
