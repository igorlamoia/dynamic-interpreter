import os

# MUST be set before any app import — secret_key has no default in Settings
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from collections.abc import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Import all models so Base knows about them
import app.models  # noqa: F401
from app.db.base import Base
from app.db.session import get_session
from app.main import app

# In-memory SQLite engine for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, expire_on_commit=False)


@pytest.fixture(scope="session", autouse=True)
async def setup_database():
    """Create all tables before tests and drop them at the end."""
    from app.models.organization import Organization
    from app.models.user import User, UserRole

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed system organization + system user (mirrors migration behavior).
    async with TestSessionLocal() as session:
        async with session.begin():
            org = Organization(name="System")
            session.add(org)
            await session.flush()
            session.add(
                User(
                    organization_id=org.id,
                    role=UserRole.SYSTEM,
                    email="system@internal",
                    password="!disabled",
                    name="System",
                )
            )

    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def async_session() -> AsyncGenerator[AsyncSession, None]:
    """Isolated DB session with rollback after each test."""
    async with TestSessionLocal() as session:
        async with session.begin():
            yield session
            await session.rollback()


@pytest.fixture
async def async_client(async_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client with get_session dependency overridden."""

    async def override_get_session():
        yield async_session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client

    app.dependency_overrides.clear()
