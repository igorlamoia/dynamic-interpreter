from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload

from app.models.exercise import Exercise, LanguagePolicy
from app.models.exercise_list_item import ExerciseListItem
from app.models.language import Language
from app.models.test_case import TestCase
from app.models.user import User, UserRole
from app.schemas.exercises import ExerciseCreate, ExerciseUpdate, TestCaseCreate


async def _validate_language_policy(
    teacher_id: int,
    policy: LanguagePolicy,
    locked_language_id: int | None,
    session: AsyncSession,
) -> None:
    if policy == LanguagePolicy.LOCKED:
        if locked_language_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="locked_language_id is required when language_policy=LOCKED",
            )
        language = await session.get(Language, locked_language_id)
        if language is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="locked_language not found"
            )
        owner = await session.get(User, language.owner_id)
        if language.owner_id != teacher_id and (owner is None or owner.role != UserRole.SYSTEM):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Locked language must be owned by the teacher or by the SYSTEM user",
            )
    else:  # OPEN
        if locked_language_id is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="locked_language_id must be null when language_policy=OPEN",
            )


async def create_exercise(data: ExerciseCreate, current_user_id: int, session: AsyncSession) -> Exercise:
    user = await session.get(User, current_user_id)
    if user.role == UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can create exercises")

    await _validate_language_policy(
        current_user_id, data.language_policy, data.locked_language_id, session
    )

    exercise = Exercise(
        teacher_id=current_user_id,
        title=data.title,
        description=data.description,
        attachments=data.attachments,
        language_policy=data.language_policy,
        locked_language_id=data.locked_language_id,
    )
    session.add(exercise)
    await session.flush()
    return await get_exercise(exercise.id, session)


async def get_exercise(exercise_id: int, session: AsyncSession) -> Exercise:
    result = await session.execute(
        select(Exercise)
        .where(Exercise.id == exercise_id)
        .options(
            selectinload(Exercise.test_cases),
            selectinload(Exercise.locked_language),
        )
    )
    exercise = result.scalar_one_or_none()
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")
    return exercise


async def list_exercises(current_user_id: int, session: AsyncSession) -> list[Exercise]:
    result = await session.execute(
        select(Exercise)
        .where(Exercise.teacher_id == current_user_id)
        .options(
            selectinload(Exercise.test_cases),
            selectinload(Exercise.locked_language),
        )
    )
    return list(result.scalars().all())


async def update_exercise(
    exercise_id: int, current_user_id: int, data: ExerciseUpdate, session: AsyncSession
) -> Exercise:
    exercise = await get_exercise(exercise_id, session)
    if exercise.teacher_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    payload = data.model_dump(exclude_unset=True)
    next_policy = payload.get("language_policy", exercise.language_policy)
    next_locked = payload.get("locked_language_id", exercise.locked_language_id)
    await _validate_language_policy(current_user_id, next_policy, next_locked, session)

    for field, value in payload.items():
        setattr(exercise, field, value)

    await session.flush()
    return await get_exercise(exercise.id, session)


async def delete_exercise(exercise_id: int, current_user_id: int, session: AsyncSession) -> None:
    exercise = await get_exercise(exercise_id, session)
    if exercise.teacher_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    # Remove from all lists before deleting (exercise_id is PK in exercise_list_items,
    # so SQLAlchemy can't null it out — must delete explicitly)
    await session.execute(
        delete(ExerciseListItem).where(ExerciseListItem.exercise_id == exercise_id)
    )
    await session.delete(exercise)
    await session.flush()


async def add_test_case(exercise_id: int, data: TestCaseCreate, current_user_id: int, session: AsyncSession) -> TestCase:
    exercise = await get_exercise(exercise_id, session)
    if exercise.teacher_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    tc = TestCase(
        exercise_id=exercise_id,
        label=data.label,
        input=data.input,
        expected_output=data.expected_output,
        order_index=data.order_index,
    )
    session.add(tc)
    await session.flush()
    return tc


async def delete_test_case(exercise_id: int, tc_id: int, current_user_id: int, session: AsyncSession) -> None:
    exercise = await get_exercise(exercise_id, session)
    if exercise.teacher_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    tc = await session.get(TestCase, tc_id)
    if not tc or tc.exercise_id != exercise_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test case not found")

    await session.delete(tc)
    await session.flush()
