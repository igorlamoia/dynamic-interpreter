from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.class_exercise_list import ClassExerciseList
from app.models.class_member import ClassMember
from app.models.exercise import Exercise
from app.models.exercise_list_item import ExerciseListItem
from app.models.language import Language
from app.models.user import User, UserRole
from app.schemas.languages import LanguageCreate, LanguageUpdate


async def _user_can_read_language(
    language: Language, user_id: int, session: AsyncSession
) -> bool:
    if language.owner_id == user_id:
        return True
    owner = await session.get(User, language.owner_id)
    if owner is not None and owner.role == UserRole.SYSTEM:
        return True
    # Any exercise accessible to this user that locks on this language grants read.
    stmt = (
        select(Exercise.id)
        .join(ExerciseListItem, ExerciseListItem.exercise_id == Exercise.id)
        .join(
            ClassExerciseList,
            ClassExerciseList.exercise_list_id == ExerciseListItem.exercise_list_id,
        )
        .join(
            ClassMember,
            and_(
                ClassMember.class_id == ClassExerciseList.class_id,
                ClassMember.student_id == user_id,
            ),
        )
        .where(Exercise.locked_language_id == language.id)
        .limit(1)
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none() is not None


async def list_my_languages(user_id: int, session: AsyncSession) -> list[Language]:
    result = await session.execute(
        select(Language).where(Language.owner_id == user_id).order_by(Language.updated_at.desc())
    )
    return list(result.scalars().all())


async def get_language(language_id: int, user_id: int, session: AsyncSession) -> Language:
    language = await session.get(Language, language_id)
    if language is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Language not found")
    if not await _user_can_read_language(language, user_id, session):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return language


async def create_language(
    data: LanguageCreate, user_id: int, session: AsyncSession
) -> Language:
    language = Language(
        owner_id=user_id,
        name=data.name,
        description=data.description,
        customization=data.customization,
    )
    session.add(language)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A language with this name already exists for this user",
        )
    return language


async def update_language(
    language_id: int, data: LanguageUpdate, user_id: int, session: AsyncSession
) -> Language:
    language = await session.get(Language, language_id)
    if language is None or language.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Language not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(language, field, value)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Name conflict"
        )
    await session.refresh(language)
    return language


async def delete_language(language_id: int, user_id: int, session: AsyncSession) -> None:
    language = await session.get(Language, language_id)
    if language is None or language.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Language not found")
    in_use = (
        await session.execute(
            select(Exercise.id).where(Exercise.locked_language_id == language_id).limit(1)
        )
    ).scalar_one_or_none()
    if in_use is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Language is locked by at least one exercise and cannot be deleted",
        )
    # Detach from this user's active_language if it points here.
    user = await session.get(User, user_id)
    if user is not None and user.active_language_id == language_id:
        user.active_language_id = None
        await session.flush()
    await session.delete(language)
    await session.flush()


async def clone_language(
    language_id: int, user_id: int, session: AsyncSession
) -> Language:
    source = await get_language(language_id, user_id, session)  # applies read-gate
    base_name = f"{source.name} (cópia)"
    name = base_name
    suffix = 2
    while (
        await session.execute(
            select(Language.id).where(
                Language.owner_id == user_id, Language.name == name
            )
        )
    ).scalar_one_or_none() is not None:
        name = f"{base_name} {suffix}"
        suffix += 1

    clone = Language(
        owner_id=user_id,
        name=name,
        description=source.description,
        customization=source.customization,
        cloned_from_id=source.id,
    )
    session.add(clone)
    await session.flush()
    return clone


async def get_active_language(user_id: int, session: AsyncSession) -> Language | None:
    user = await session.get(User, user_id)
    if user is None or user.active_language_id is None:
        return None
    return await session.get(Language, user.active_language_id)


async def set_active_language(
    user_id: int, language_id: int | None, session: AsyncSession
) -> Language | None:
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if language_id is not None:
        language = await session.get(Language, language_id)
        if language is None or language.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Language not owned by user",
            )
    user.active_language_id = language_id
    await session.flush()
    if language_id is None:
        return None
    return await session.get(Language, language_id)
