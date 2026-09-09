import os
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from tests.factories import create_organization, create_user
from app.models.test_case import TestCase
from app.models.user import UserRole


async def get_token(client: AsyncClient, email: str, password: str) -> str:
    r = await client.post("/auth/login", json={"email": email, "password": password})
    return r.json()["accessToken"]


class TestCreateExercise:
    async def test_teacher_can_create_exercise(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_e1@ex.com", password="secret")
        token = await get_token(async_client, "teacher_e1@ex.com", "secret")

        response = await async_client.post(
            "/exercises",
            json={"title": "Hello World", "description": "Write hello world", "attachments": ""},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Hello World"
        assert data["teacherId"] == teacher.id

    async def test_create_exercise_persists_nested_test_cases(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(
            async_session,
            org,
            role=UserRole.TEACHER,
            email="teacher_e1_cases@ex.com",
            password="secret",
        )
        token = await get_token(async_client, "teacher_e1_cases@ex.com", "secret")

        response = await async_client.post(
            "/exercises",
            json={
                "title": "With cases",
                "description": "Persist nested cases",
                "testCases": [
                    {"label": "first", "input": "1", "expectedOutput": "one"},
                    {"label": "second", "input": "2", "expectedOutput": "two"},
                ],
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert [tc["label"] for tc in data["testCases"]] == ["first", "second"]
        assert [tc["expectedOutput"] for tc in data["testCases"]] == ["one", "two"]
        assert [tc["orderIndex"] for tc in data["testCases"]] == [0, 1]

        rows = (
            await async_session.execute(
                select(TestCase)
                .where(TestCase.exercise_id == data["id"])
                .order_by(TestCase.order_index)
            )
        ).scalars().all()
        assert [(tc.input, tc.expected_output, tc.order_index) for tc in rows] == [
            ("1", "one", 0),
            ("2", "two", 1),
        ]

    async def test_student_cannot_create_exercise(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_e1@ex.com", password="secret")
        token = await get_token(async_client, "student_e1@ex.com", "secret")

        response = await async_client.post(
            "/exercises",
            json={"title": "Bad", "description": "no", "attachments": ""},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403


class TestGetExercise:
    async def test_get_exercise_returns_with_test_cases(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_e2@ex.com", password="secret")
        token = await get_token(async_client, "teacher_e2@ex.com", "secret")

        create_resp = await async_client.post(
            "/exercises",
            json={"title": "Get Test", "description": "d", "attachments": ""},
            headers={"Authorization": f"Bearer {token}"},
        )
        ex_id = create_resp.json()["id"]

        # Add test case
        await async_client.post(
            f"/exercises/{ex_id}/test-cases",
            json={"input": "1", "expected_output": "1", "label": "tc1"},
            headers={"Authorization": f"Bearer {token}"},
        )

        response = await async_client.get(
            f"/exercises/{ex_id}", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == ex_id
        assert len(data["testCases"]) == 1

    async def test_get_exercise_not_found(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_e3@ex.com", password="secret")
        token = await get_token(async_client, "teacher_e3@ex.com", "secret")

        response = await async_client.get(
            "/exercises/999999", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 404


class TestUpdateDeleteExercise:
    async def test_teacher_can_update_own_exercise(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_e4@ex.com", password="secret")
        token = await get_token(async_client, "teacher_e4@ex.com", "secret")

        create_resp = await async_client.post(
            "/exercises",
            json={"title": "Old Title", "description": "d", "attachments": ""},
            headers={"Authorization": f"Bearer {token}"},
        )
        ex_id = create_resp.json()["id"]

        response = await async_client.patch(
            f"/exercises/{ex_id}",
            json={"title": "New Title"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["title"] == "New Title"

    async def test_teacher_can_replace_exercise_and_test_cases(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(
            async_session,
            org,
            role=UserRole.TEACHER,
            email="teacher_e4_put@ex.com",
            password="secret",
        )
        token = await get_token(async_client, "teacher_e4_put@ex.com", "secret")

        create_resp = await async_client.post(
            "/exercises",
            json={
                "title": "Old Title",
                "description": "old",
                "testCases": [
                    {
                        "input": "old 1",
                        "expectedOutput": "old out 1",
                        "label": "old 1",
                    },
                    {
                        "input": "old 2",
                        "expectedOutput": "old out 2",
                        "label": "old 2",
                    },
                ],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        ex_id = create_resp.json()["id"]

        response = await async_client.put(
            f"/exercises/{ex_id}",
            json={
                "title": "New Title",
                "description": "new",
                "testCases": [
                    {
                        "input": "new",
                        "expectedOutput": "new out",
                        "label": "new case",
                    },
                ],
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title"
        assert data["description"] == "new"
        assert [
            (tc["input"], tc["expectedOutput"], tc["orderIndex"])
            for tc in data["testCases"]
        ] == [
            ("new", "new out", 0),
        ]

        rows = (
            await async_session.execute(
                select(TestCase)
                .where(TestCase.exercise_id == ex_id)
                .order_by(TestCase.order_index)
            )
        ).scalars().all()
        assert [(tc.input, tc.expected_output, tc.order_index) for tc in rows] == [
            ("new", "new out", 0),
        ]

    async def test_teacher_can_delete_own_exercise(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_e5@ex.com", password="secret")
        token = await get_token(async_client, "teacher_e5@ex.com", "secret")

        create_resp = await async_client.post(
            "/exercises",
            json={"title": "To Delete", "description": "d", "attachments": ""},
            headers={"Authorization": f"Bearer {token}"},
        )
        ex_id = create_resp.json()["id"]

        response = await async_client.delete(
            f"/exercises/{ex_id}", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 204


class TestTestCases:
    async def test_add_test_case(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_e6@ex.com", password="secret")
        token = await get_token(async_client, "teacher_e6@ex.com", "secret")

        create_resp = await async_client.post(
            "/exercises",
            json={"title": "TC Test", "description": "d", "attachments": ""},
            headers={"Authorization": f"Bearer {token}"},
        )
        ex_id = create_resp.json()["id"]

        response = await async_client.post(
            f"/exercises/{ex_id}/test-cases",
            json={"input": "hello", "expected_output": "world", "label": "tc1"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 201
        assert response.json()["input"] == "hello"


class TestListExercises:
    async def test_teacher_can_list_own_exercises(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_e7@ex.com", password="secret")
        token = await get_token(async_client, "teacher_e7@ex.com", "secret")

        await async_client.post(
            "/exercises",
            json={"title": "List Ex 1", "description": "d", "attachments": ""},
            headers={"Authorization": f"Bearer {token}"},
        )
        await async_client.post(
            "/exercises",
            json={"title": "List Ex 2", "description": "d", "attachments": ""},
            headers={"Authorization": f"Bearer {token}"},
        )

        response = await async_client.get("/exercises", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        titles = [e["title"] for e in response.json()]
        assert "List Ex 1" in titles
        assert "List Ex 2" in titles
