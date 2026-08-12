import os
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.factories import create_organization, create_user
from app.models.user import UserRole


async def get_token(async_client: AsyncClient, email: str, password: str) -> str:
    """Helper para obter token JWT via login."""
    response = await async_client.post(
        "/auth/login", json={"email": email, "password": password}
    )
    return response.json()["accessToken"]


class TestGetUser:
    async def test_get_user_by_id_returns_profile(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        user = await create_user(async_session, org, email="getuser@example.com", password="secret")
        token = await get_token(async_client, "getuser@example.com", "secret")

        # Act
        response = await async_client.get(
            f"/users/{user.id}", headers={"Authorization": f"Bearer {token}"}
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user.id
        assert data["email"] == "getuser@example.com"

    async def test_get_user_not_found(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        await create_user(async_session, org, email="requester@example.com", password="secret")
        token = await get_token(async_client, "requester@example.com", "secret")

        # Act
        response = await async_client.get(
            "/users/999999", headers={"Authorization": f"Bearer {token}"}
        )

        # Assert
        assert response.status_code == 404

    async def test_get_user_requires_auth(self, async_client: AsyncClient, async_session: AsyncSession):
        # Arrange
        org = await create_organization(async_session)
        user = await create_user(async_session, org)

        # Act
        response = await async_client.get(f"/users/{user.id}")

        # Assert
        assert response.status_code == 403


class TestUpdateUser:
    async def test_user_can_update_own_profile(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        user = await create_user(async_session, org, email="updateme@example.com", password="secret")
        token = await get_token(async_client, "updateme@example.com", "secret")

        # Act
        response = await async_client.patch(
            f"/users/{user.id}",
            json={"name": "Updated Name", "bio": "My new bio"},
            headers={"Authorization": f"Bearer {token}"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["bio"] == "My new bio"

    async def test_student_cannot_update_other_user(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        student = await create_user(async_session, org, role=UserRole.STUDENT, email="student2@example.com", password="secret")
        other = await create_user(async_session, org, email="other2@example.com", password="secret")
        token = await get_token(async_client, "student2@example.com", "secret")

        # Act
        response = await async_client.patch(
            f"/users/{other.id}",
            json={"name": "Hacked Name"},
            headers={"Authorization": f"Bearer {token}"},
        )

        # Assert
        assert response.status_code == 403

    async def test_community_can_update_only_own_profile(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        community = await create_user(
            async_session,
            org,
            role=UserRole.COMMUNITY,
            email="community-profile@example.com",
            password="secret",
        )
        other = await create_user(async_session, org)
        token = await get_token(async_client, community.email, "secret")

        own = await async_client.patch(
            f"/users/{community.id}",
            json={"bio": "Criador de linguagens"},
            headers={"Authorization": f"Bearer {token}"},
        )
        other_response = await async_client.patch(
            f"/users/{other.id}",
            json={"bio": "Não permitido"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert own.status_code == 200
        assert other_response.status_code == 403


class TestListUsers:
    async def test_admin_can_list_users(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        admin = await create_user(async_session, org, role=UserRole.ADMIN, email="admin@example.com", password="secret")
        await create_user(async_session, org, email="member@example.com", password="secret")
        token = await get_token(async_client, "admin@example.com", "secret")

        # Act
        response = await async_client.get(
            "/users", headers={"Authorization": f"Bearer {token}"}
        )

        # Assert
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    async def test_student_cannot_list_users(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.STUDENT, email="student3@example.com", password="secret")
        token = await get_token(async_client, "student3@example.com", "secret")

        # Act
        response = await async_client.get(
            "/users", headers={"Authorization": f"Bearer {token}"}
        )

        # Assert
        assert response.status_code == 403
