from typing import NamedTuple

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload

from app.models.exercise import Exercise
from app.models.exercise_list import ExerciseList
from app.models.exercise_list_item import ExerciseListItem
from app.models.language import Language
from app.models.test_case import TestCase
from app.models.user import User, UserRole
from app.modules.languages.policy import (
    EffectiveSource,
    resolve_effective_language,
    validate_language_policy,
)
from app.modules.languages.service import user_can_read_language
from app.schemas.exercises import ExerciseCreate, ExerciseUpdate, TestCaseCreate


async def create_exercise(data: ExerciseCreate, current_user_id: int, session: AsyncSession) -> Exercise:
    user = await session.get(User, current_user_id)
    if user.role == UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can create exercises")

    await validate_language_policy(
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
    await validate_language_policy(current_user_id, next_policy, next_locked, session)

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


class ExerciseContext(NamedTuple):
    exercise: Exercise
    effective_language: Language | None
    effective_language_source: EffectiveSource | None
    can_read_locked_language: bool


async def get_exercise_in_context(
    exercise_id: int, list_id: int | None, user_id: int, session: AsyncSession
) -> ExerciseContext:
    """Carrega o exercício e resolve a linguagem no contexto de uma lista.

    `list_id` inconsistente é 400 e não silêncio: entregar ao aluno a
    linguagem de um contexto que não é o dele seria pior do que falhar.

    As linguagens que a resposta embute passam pelo mesmo read-gate de
    `GET /languages/{id}`: quem não pode lê-las recebe o exercício mesmo
    assim, só sem elas. Omitir o campo em vez de 403 no exercício inteiro
    preserva o workspace de quem chegou por outro caminho legítimo.
    """
    exercise = await get_exercise(exercise_id, session)

    exercise_list = None
    if list_id is not None:
        result = await session.execute(
            select(ExerciseList)
            .where(ExerciseList.id == list_id)
            .options(selectinload(ExerciseList.locked_language))
        )
        exercise_list = result.scalar_one_or_none()
        if exercise_list is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="list_id not found"
            )
        is_item = (
            await session.execute(
                select(ExerciseListItem.exercise_id)
                .where(
                    ExerciseListItem.exercise_list_id == list_id,
                    ExerciseListItem.exercise_id == exercise_id,
                )
                .limit(1)
            )
        ).scalar_one_or_none()
        if is_item is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exercise is not part of list_id",
            )

    effective, source = resolve_effective_language(exercise, exercise_list)

    # `source` sobrevive ao gate de propósito: o aluno precisa saber que está
    # travado mesmo quando não pode ler qual é o mapeamento.
    can_read_locked = exercise.locked_language is not None and await user_can_read_language(
        exercise.locked_language, user_id, session
    )
    if effective is not None:
        effective_readable = (
            can_read_locked
            if effective is exercise.locked_language
            else await user_can_read_language(effective, user_id, session)
        )
        if not effective_readable:
            effective = None

    return ExerciseContext(exercise, effective, source, can_read_locked)
