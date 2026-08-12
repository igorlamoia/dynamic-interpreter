"""Factories for creating test data."""
from datetime import datetime, timezone
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.models.class_ import Class, ClassStatus
from app.models.exercise import Exercise
from app.models.exercise_list import ExerciseList
from app.models.class_exercise_list import ClassExerciseList
from app.models.language import LanguagePolicy

fake = Faker("pt_BR")


async def create_organization(session: AsyncSession, **kwargs) -> Organization:
    org = Organization(
        name=kwargs.get("name", fake.company()),
    )
    session.add(org)
    await session.flush()
    return org


async def create_user(
    session: AsyncSession,
    organization: Organization,
    role: UserRole = UserRole.STUDENT,
    **kwargs,
) -> User:
    user = User(
        organization_id=organization.id,
        role=role,
        email=kwargs.get("email", fake.unique.email()),
        password=hash_password(kwargs.get("password", "secret123")),
        name=kwargs.get("name", fake.name()),
        avatar_url=kwargs.get("avatar_url", None),
        bio=kwargs.get("bio", None),
    )
    session.add(user)
    await session.flush()
    return user


async def create_class(session: AsyncSession, org, teacher, **kwargs) -> Class:
    cls = Class(
        organization_id=org.id,
        teacher_id=teacher.id,
        name=kwargs.get("name", fake.word()),
        description=kwargs.get("description", fake.sentence()),
        access_code=kwargs.get("access_code", fake.lexify("????????").upper()),
    )
    session.add(cls)
    await session.flush()
    return cls


async def create_exercise(session: AsyncSession, teacher, **kwargs) -> Exercise:
    ex = Exercise(
        teacher_id=teacher.id,
        title=kwargs.get("title", fake.sentence()),
        description=kwargs.get("description", fake.sentence()),
        attachments=kwargs.get("attachments", ""),
    )
    session.add(ex)
    await session.flush()
    return ex


async def create_exercise_list(session: AsyncSession, teacher, **kwargs) -> ExerciseList:
    el = ExerciseList(
        teacher_id=teacher.id,
        title=kwargs.get("title", fake.sentence()),
        description=kwargs.get("description", fake.sentence()),
        language_policy=kwargs.get("language_policy", LanguagePolicy.OPEN),
        locked_language_id=kwargs.get("locked_language_id", None),
    )
    session.add(el)
    await session.flush()
    return el


async def create_class_exercise_list(
    session: AsyncSession,
    exercise_list,
    cls,
    **kwargs,
) -> ClassExerciseList:
    cel = ClassExerciseList(
        exercise_list_id=exercise_list.id,
        class_id=cls.id,
        deadline=kwargs.get("deadline", datetime(2030, 12, 31, tzinfo=timezone.utc)),
        total_grade=kwargs.get("total_grade", 10.0),
        min_required=kwargs.get("min_required", 1),
    )
    session.add(cel)
    await session.flush()
    return cel
