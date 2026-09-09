from datetime import datetime
from pydantic import Field
from app.schemas.base import CamelModel
from app.models.class_ import ClassStatus
from app.models.user import UserRole


class ClassCreate(CamelModel):
    name: str
    description: str
    access_code: str


class ClassUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    status: ClassStatus | None = None


class ClassCount(CamelModel):
    members: int = 0
    exercise_lists: int = 0


class TeacherBrief(CamelModel):
    id: int
    name: str
    email: str
    avatar_url: str | None = None
    role: UserRole


class ClassResponse(CamelModel):
    id: int
    organization_id: int
    teacher_id: int
    name: str
    description: str
    access_code: str
    created_at: datetime
    status: ClassStatus


class ClassSummaryResponse(ClassResponse):
    count_: ClassCount = Field(default_factory=ClassCount, alias="_count")
    teacher: TeacherBrief | None = None


class JoinClassRequest(CamelModel):
    access_code: str


class JoinClassResponse(CamelModel):
    class_id: int


class ExerciseItemProgress(CamelModel):
    exercise_id: int
    order_index: int
    grade_weight: float
    exercise: dict  # { id: int, title: str }
    submitted: bool


class ExerciseListBrief(CamelModel):
    id: int
    title: str
    description: str | None
    items: list[ExerciseItemProgress]


class MemberProgress(CamelModel):
    completed: int
    total: int
    percentage: int


class MemberWithProgress(CamelModel):
    id: int
    organization_id: int
    role: UserRole
    email: str
    name: str
    avatar_url: str | None = None
    bio: str | None = None
    joined_at: datetime
    progress: MemberProgress


class ClassMembersResponse(CamelModel):
    teacher: TeacherBrief | None
    members: list[MemberWithProgress]


class ClassExerciseListWithProgress(CamelModel):
    exercise_list_id: int
    class_id: int
    total_grade: float
    min_required: float
    deadline: datetime
    exercise_list: ExerciseListBrief
    completed_count: int
    total_count: int
