import enum
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.class_ import Class
    from app.models.class_member import ClassMember
    from app.models.exercise import Exercise
    from app.models.exercise_list import ExerciseList
    from app.models.submission import Submission
    from app.models.language import Language


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"
    SYSTEM = "SYSTEM"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(Integer, ForeignKey("organizations.id"), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    bio: Mapped[str | None] = mapped_column(String, nullable=True)
    active_language_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("languages.id", ondelete="SET NULL", use_alter=True, name="fk_users_active_language_id"),
        nullable=True,
    )

    organization: Mapped["Organization"] = relationship("Organization", back_populates="users")
    classes_taught: Mapped[list["Class"]] = relationship("Class", back_populates="teacher", foreign_keys="Class.teacher_id")
    memberships: Mapped[list["ClassMember"]] = relationship("ClassMember", back_populates="student")
    exercises: Mapped[list["Exercise"]] = relationship("Exercise", back_populates="teacher")
    exercise_lists: Mapped[list["ExerciseList"]] = relationship("ExerciseList", back_populates="teacher")
    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="student")
    languages: Mapped[list["Language"]] = relationship(
        "Language",
        back_populates="owner",
        foreign_keys="Language.owner_id",
        cascade="all, delete-orphan",
    )
    active_language: Mapped["Language | None"] = relationship(
        "Language", foreign_keys=[active_language_id], post_update=True
    )
