from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exercise import Exercise
from app.models.exercise_list import ExerciseList
from app.models.language import Language, LanguagePolicy
from app.models.user import User, UserRole

EffectiveSource = Literal["exercise", "list"]


async def validate_language_policy(
    teacher_id: int,
    policy: LanguagePolicy,
    locked_language_id: int | None,
    session: AsyncSession,
) -> None:
    """Valida o par (política, linguagem) de um exercício ou de uma lista.

    Mesma regra nos dois níveis: só o dono da linguagem, ou qualquer um sobre
    uma linguagem do usuário SYSTEM, pode travar nela.
    """
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


def resolve_effective_language(
    exercise: Exercise,
    exercise_list: ExerciseList | None,
) -> tuple[Language | None, EffectiveSource | None]:
    """Qual linguagem o aluno usa para resolver este exercício nesta lista.

    O mais específico vence: a trava do exercício sobrepõe a da lista, porque
    o mesmo exercício é reusável em várias listas e a trava dele costuma ser
    parte do enunciado. A lista trava apenas os itens OPEN.

    `None` significa livre: o aluno usa a linguagem ativa dele.

    Pura e síncrona de propósito — as duas entidades chegam com
    `locked_language` já carregada por `selectinload`.
    """
    if (
        exercise.language_policy == LanguagePolicy.LOCKED
        and exercise.locked_language is not None
    ):
        return exercise.locked_language, "exercise"
    if (
        exercise_list is not None
        and exercise_list.language_policy == LanguagePolicy.LOCKED
        and exercise_list.locked_language is not None
    ):
        return exercise_list.locked_language, "list"
    return None, None
