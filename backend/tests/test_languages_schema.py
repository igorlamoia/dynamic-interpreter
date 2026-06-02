"""Smoke tests for the languages table and related schema changes."""
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models.exercise import Exercise, LanguagePolicy
from app.models.language import Language
from app.models.submission import Submission
from app.models.user import User, UserRole
from tests.factories import create_exercise, create_organization, create_user


@pytest.mark.asyncio
async def test_system_user_seeded(async_session):
    """The session-scoped setup seeds a SYSTEM user (mirrors the migration)."""
    result = await async_session.execute(
        select(User).where(User.role == UserRole.SYSTEM)
    )
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.email == "system@internal"


@pytest.mark.asyncio
async def test_language_create_minimal(async_session):
    org = await create_organization(async_session)
    user = await create_user(async_session, org)
    lang = Language(
        owner_id=user.id,
        name="PortuJava",
        customization={"mappings": [], "modes": {}},
    )
    async_session.add(lang)
    await async_session.flush()
    assert lang.id is not None
    assert lang.owner_id == user.id


@pytest.mark.asyncio
async def test_language_unique_per_owner(async_session):
    org = await create_organization(async_session)
    user = await create_user(async_session, org)
    async_session.add(Language(owner_id=user.id, name="L1", customization={}))
    await async_session.flush()
    async_session.add(Language(owner_id=user.id, name="L1", customization={}))
    with pytest.raises(IntegrityError):
        await async_session.flush()


@pytest.mark.asyncio
async def test_users_active_language_fk(async_session):
    org = await create_organization(async_session)
    user = await create_user(async_session, org)
    lang = Language(owner_id=user.id, name="L", customization={})
    async_session.add(lang)
    await async_session.flush()

    user.active_language_id = lang.id
    await async_session.flush()
    await async_session.refresh(user)
    assert user.active_language_id == lang.id


@pytest.mark.asyncio
async def test_exercise_locked_requires_language(async_session):
    """CHECK: policy=LOCKED iff locked_language_id IS NOT NULL."""
    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, role=UserRole.TEACHER)
    ex = Exercise(
        teacher_id=teacher.id,
        title="t",
        description="d",
        attachments="",
        language_policy=LanguagePolicy.LOCKED,
        locked_language_id=None,
    )
    async_session.add(ex)
    with pytest.raises(IntegrityError):
        await async_session.flush()


@pytest.mark.asyncio
async def test_exercise_open_rejects_locked_language(async_session):
    """CHECK: policy=OPEN must not have locked_language_id set."""
    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, role=UserRole.TEACHER)
    lang = Language(owner_id=teacher.id, name="L", customization={})
    async_session.add(lang)
    await async_session.flush()

    ex = Exercise(
        teacher_id=teacher.id,
        title="t",
        description="d",
        attachments="",
        language_policy=LanguagePolicy.OPEN,
        locked_language_id=lang.id,
    )
    async_session.add(ex)
    with pytest.raises(IntegrityError):
        await async_session.flush()


@pytest.mark.asyncio
async def test_exercise_locked_with_language_ok(async_session):
    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, role=UserRole.TEACHER)
    lang = Language(owner_id=teacher.id, name="L", customization={"k": "v"})
    async_session.add(lang)
    await async_session.flush()

    ex = await create_exercise(async_session, teacher)
    ex.language_policy = LanguagePolicy.LOCKED
    ex.locked_language_id = lang.id
    await async_session.flush()
    await async_session.refresh(ex)
    assert ex.language_policy == LanguagePolicy.LOCKED
    assert ex.locked_language_id == lang.id


@pytest.mark.asyncio
async def test_submission_language_snapshot_persists(async_session):
    """submission.language_snapshot stores arbitrary JSON and survives reads."""
    from app.models.class_ import Class
    from app.models.exercise_list import ExerciseList
    from tests.factories import (
        create_class,
        create_class_exercise_list,
        create_exercise_list,
    )

    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, role=UserRole.TEACHER)
    student = await create_user(async_session, org)
    cls = await create_class(async_session, org, teacher)
    el = await create_exercise_list(async_session, teacher)
    ex = await create_exercise(async_session, teacher)
    await create_class_exercise_list(async_session, el, cls)

    snap = {"mappings": [{"original": "if", "custom": "se"}], "modes": {"semicolon": "optional-eol"}}
    sub = Submission(
        exercise_id=ex.id,
        exercise_list_id=el.id,
        class_id=cls.id,
        student_id=student.id,
        code_snapshot="print(1)",
        language_snapshot=snap,
    )
    async_session.add(sub)
    await async_session.flush()
    await async_session.refresh(sub)
    assert sub.language_snapshot == snap
