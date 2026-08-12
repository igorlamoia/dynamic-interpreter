import os

os.environ.setdefault(
    "SECRET_KEY", "test-secret-key-for-testing-only-not-for-production"
)
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from sqlalchemy import select

from app.models.language import Language
from app.models.user import User, UserRole
from scripts.community_language_presets import (
    COMMUNITY_LANGUAGE_PRESETS,
    TOKEN_IDS,
)
from scripts.seed import seed_community_languages


async def test_seed_creates_complete_public_system_languages(async_session):
    system_user = (
        await async_session.execute(select(User).where(User.role == UserRole.SYSTEM))
    ).scalar_one()

    languages = await seed_community_languages(async_session, system_user)

    assert len(languages) == len(COMMUNITY_LANGUAGE_PRESETS) == 5
    assert {language.name for language in languages} == {
        "Didática em Português",
        "Pythonica",
        "Minimalista",
        "Ruby-like",
        "Minerês",
    }
    assert all(language.owner_id == system_user.id for language in languages)
    assert all(language.is_public for language in languages)
    assert all(language.published_at is not None for language in languages)

    for language in languages:
        customization = language.customization
        assert len(customization["mappings"]) == len(TOKEN_IDS)
        assert {item["original"] for item in customization["mappings"]} == set(
            TOKEN_IDS
        )
        assert customization["operatorWordMap"]
        assert customization["booleanLiteralMap"]
        assert customization["modes"] == language.dna
        assert "languageDocumentation" in customization


async def test_seed_is_idempotent_and_reconciles_official_languages(async_session):
    system_user = (
        await async_session.execute(select(User).where(User.role == UserRole.SYSTEM))
    ).scalar_one()
    first_run = await seed_community_languages(async_session, system_user)
    ids = {language.name: language.id for language in first_run}

    pythonica = next(language for language in first_run if language.name == "Pythonica")
    pythonica.is_public = False
    pythonica.customization = {}
    await async_session.flush()

    second_run = await seed_community_languages(async_session, system_user)

    assert {language.name: language.id for language in second_run} == ids
    assert len(
        (
            await async_session.execute(
                select(Language).where(Language.owner_id == system_user.id)
            )
        )
        .scalars()
        .all()
    ) == len(COMMUNITY_LANGUAGE_PRESETS)
    restored = next(language for language in second_run if language.name == "Pythonica")
    assert restored.is_public is True
    assert restored.customization["modes"] == {
        "semicolon": "optional-eol",
        "block": "indentation",
        "typing": "untyped",
        "array": "dynamic",
    }
