import os
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from tests.factories import create_organization, create_user
from app.models.user import User, UserRole


class TestRegister:
    async def test_register_creates_user_and_returns_token(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        payload = {
            "email": "new@example.com",
            "password": "secret123",
            "name": "New User",
            "organization_id": org.id,
        }

        # Act
        response = await async_client.post("/auth/register", json=payload)

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert "accessToken" in data
        assert data["tokenType"] == "bearer"

    @pytest.mark.parametrize(
        ("role", "expected_role"),
        [
            ("student", UserRole.STUDENT),
            ("teacher", UserRole.TEACHER),
            ("community", UserRole.COMMUNITY),
        ],
    )
    async def test_register_persists_public_role(
        self,
        role: str,
        expected_role: UserRole,
        async_client: AsyncClient,
        async_session: AsyncSession,
    ):
        org = await create_organization(async_session)
        payload = {
            "email": f"{role}@example.com",
            "password": "secret123",
            "name": role.title(),
            "role": role,
            "organizationId": org.id,
        }

        response = await async_client.post("/auth/register", json=payload)

        assert response.status_code == 201
        result = await async_session.execute(
            select(User).where(User.email == payload["email"])
        )
        assert result.scalar_one().role == expected_role

    async def test_community_can_register_without_organization(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        response = await async_client.post(
            "/auth/register",
            json={
                "email": "community-no-org@example.com",
                "password": "secret123",
                "name": "Community Member",
                "role": "community",
                "organizationId": None,
            },
        )

        assert response.status_code == 201
        token = response.json()["accessToken"]
        profile = await async_client.get(
            "/auth/me", headers={"Authorization": f"Bearer {token}"}
        )
        assert profile.json()["role"] == "COMMUNITY"
        assert profile.json()["organizationId"] is None

    @pytest.mark.parametrize("role", ["student", "teacher"])
    async def test_academic_roles_require_organization(
        self, role: str, async_client: AsyncClient
    ):
        response = await async_client.post(
            "/auth/register",
            json={
                "email": f"missing-org-{role}@example.com",
                "password": "secret123",
                "name": "Missing Org",
                "role": role,
                "organizationId": None,
            },
        )

        assert response.status_code == 422

    async def test_register_rejects_internal_role(self, async_client: AsyncClient):
        response = await async_client.post(
            "/auth/register",
            json={
                "email": "admin-register@example.com",
                "password": "secret123",
                "name": "Not Admin",
                "role": "ADMIN",
                "organizationId": None,
            },
        )

        assert response.status_code == 422

    async def test_register_fails_for_duplicate_email(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        await create_user(async_session, org, email="duplicate@example.com")
        payload = {
            "email": "duplicate@example.com",
            "password": "secret123",
            "name": "Another User",
            "organization_id": org.id,
        }

        # Act
        response = await async_client.post("/auth/register", json=payload)

        # Assert
        assert response.status_code == 409

    async def test_register_fails_for_invalid_organization(
        self, async_client: AsyncClient
    ):
        # Arrange
        payload = {
            "email": "user@example.com",
            "password": "secret123",
            "name": "User",
            "organization_id": 999999,
        }

        # Act
        response = await async_client.post("/auth/register", json=payload)

        # Assert
        assert response.status_code == 404


class TestLogin:
    async def test_login_returns_token(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        await create_user(async_session, org, email="login@example.com", password="mypassword")
        payload = {"email": "login@example.com", "password": "mypassword"}

        # Act
        response = await async_client.post("/auth/login", json=payload)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "accessToken" in data
        assert data["tokenType"] == "bearer"

    async def test_login_fails_for_wrong_password(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        await create_user(async_session, org, email="wrongpw@example.com", password="correct")
        payload = {"email": "wrongpw@example.com", "password": "wrong"}

        # Act
        response = await async_client.post("/auth/login", json=payload)

        # Assert
        assert response.status_code == 401

    async def test_login_fails_for_unknown_email(
        self, async_client: AsyncClient
    ):
        # Arrange
        payload = {"email": "nobody@example.com", "password": "secret"}

        # Act
        response = await async_client.post("/auth/login", json=payload)

        # Assert
        assert response.status_code == 401


class TestMe:
    async def test_me_returns_current_user(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        user = await create_user(async_session, org, email="me@example.com", password="secret")
        login_response = await async_client.post(
            "/auth/login", json={"email": "me@example.com", "password": "secret"}
        )
        token = login_response.json()["accessToken"]

        # Act
        response = await async_client.get(
            "/auth/me", headers={"Authorization": f"Bearer {token}"}
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "me@example.com"
        assert data["id"] == user.id

    async def test_me_fails_without_token(self, async_client: AsyncClient):
        # Act
        response = await async_client.get("/auth/me")

        # Assert
        assert response.status_code == 403

    async def test_me_fails_with_invalid_token(self, async_client: AsyncClient):
        # Act
        response = await async_client.get(
            "/auth/me", headers={"Authorization": "Bearer invalid.token.here"}
        )

        # Assert
        assert response.status_code == 401
