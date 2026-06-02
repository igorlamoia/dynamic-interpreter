import os
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.factories import (
    create_organization, create_user,
    create_class, create_exercise, create_exercise_list, create_class_exercise_list,
)
from app.models.user import UserRole


async def get_token(client: AsyncClient, email: str, password: str) -> str:
    r = await client.post("/auth/login", json={"email": email, "password": password})
    return r.json()["accessToken"]


class TestCreateSubmission:
    async def test_student_can_submit(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_s1@ex.com", password="secret")
        student = await create_user(async_session, org, role=UserRole.STUDENT, email="student_s1@ex.com", password="secret")
        cls = await create_class(async_session, org, teacher)
        exercise = await create_exercise(async_session, teacher)
        ex_list = await create_exercise_list(async_session, teacher)
        await create_class_exercise_list(async_session, ex_list, cls)

        student_token = await get_token(async_client, "student_s1@ex.com", "secret")

        # Act
        response = await async_client.post(
            "/submissions",
            json={
                "exercise_id": exercise.id,
                "exercise_list_id": ex_list.id,
                "class_id": cls.id,
                "code_snapshot": "public void main() {}",
                "language_snapshot": {},
                "status": "SUBMITTED",
            },
            headers={"Authorization": f"Bearer {student_token}"},
        )

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["studentId"] == student.id
        assert data["codeSnapshot"] == "public void main() {}"

    async def test_submit_requires_auth(self, async_client: AsyncClient):
        response = await async_client.post(
            "/submissions",
            json={"exercise_id": "x", "exercise_list_id": "x", "class_id": "x", "code_snapshot": "x"},
        )
        assert response.status_code == 403


class TestListSubmissions:
    async def test_student_sees_own_submissions(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_s2@ex.com", password="secret")
        student = await create_user(async_session, org, role=UserRole.STUDENT, email="student_s2@ex.com", password="secret")
        cls = await create_class(async_session, org, teacher)
        exercise = await create_exercise(async_session, teacher)
        ex_list = await create_exercise_list(async_session, teacher)
        await create_class_exercise_list(async_session, ex_list, cls)

        student_token = await get_token(async_client, "student_s2@ex.com", "secret")

        await async_client.post(
            "/submissions",
            json={"exercise_id": exercise.id, "exercise_list_id": ex_list.id, "class_id": cls.id, "code_snapshot": "x", "language_snapshot": {}, "status": "SUBMITTED"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        response = await async_client.get("/submissions", headers={"Authorization": f"Bearer {student_token}"})

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(s["studentId"] == student.id for s in data)


class TestGradeSubmission:
    async def test_teacher_can_grade_submission(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_s3@ex.com", password="secret")
        student = await create_user(async_session, org, role=UserRole.STUDENT, email="student_s3@ex.com", password="secret")
        cls = await create_class(async_session, org, teacher)
        exercise = await create_exercise(async_session, teacher)
        ex_list = await create_exercise_list(async_session, teacher)
        await create_class_exercise_list(async_session, ex_list, cls)

        teacher_token = await get_token(async_client, "teacher_s3@ex.com", "secret")
        student_token = await get_token(async_client, "student_s3@ex.com", "secret")

        sub_resp = await async_client.post(
            "/submissions",
            json={"exercise_id": exercise.id, "exercise_list_id": ex_list.id, "class_id": cls.id, "code_snapshot": "x", "language_snapshot": {}, "status": "SUBMITTED"},
            headers={"Authorization": f"Bearer {student_token}"},
        )
        sub_id = sub_resp.json()["id"]

        # Act
        response = await async_client.patch(
            f"/submissions/{sub_id}/grade",
            json={"score": 9.5, "teacher_feedback": "Great work!"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["score"] == 9.5
        assert data["status"] == "GRADED"

    async def test_student_cannot_grade(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_s4@ex.com", password="secret")
        student = await create_user(async_session, org, role=UserRole.STUDENT, email="student_s4@ex.com", password="secret")
        cls = await create_class(async_session, org, teacher)
        exercise = await create_exercise(async_session, teacher)
        ex_list = await create_exercise_list(async_session, teacher)
        await create_class_exercise_list(async_session, ex_list, cls)

        student_token = await get_token(async_client, "student_s4@ex.com", "secret")

        sub_resp = await async_client.post(
            "/submissions",
            json={"exercise_id": exercise.id, "exercise_list_id": ex_list.id, "class_id": cls.id, "code_snapshot": "x", "language_snapshot": {}, "status": "SUBMITTED"},
            headers={"Authorization": f"Bearer {student_token}"},
        )
        sub_id = sub_resp.json()["id"]

        response = await async_client.patch(
            f"/submissions/{sub_id}/grade",
            json={"score": 5.0},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        assert response.status_code == 403


class TestGetSubmission:
    async def test_student_can_get_own_submission(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_s5@ex.com", password="secret")
        student = await create_user(async_session, org, role=UserRole.STUDENT, email="student_s5@ex.com", password="secret")
        cls = await create_class(async_session, org, teacher)
        exercise = await create_exercise(async_session, teacher)
        ex_list = await create_exercise_list(async_session, teacher)
        await create_class_exercise_list(async_session, ex_list, cls)

        student_token = await get_token(async_client, "student_s5@ex.com", "secret")

        sub_resp = await async_client.post(
            "/submissions",
            json={"exercise_id": exercise.id, "exercise_list_id": ex_list.id, "class_id": cls.id, "code_snapshot": "x", "language_snapshot": {}, "status": "SUBMITTED"},
            headers={"Authorization": f"Bearer {student_token}"},
        )
        sub_id = sub_resp.json()["id"]

        response = await async_client.get(
            f"/submissions/{sub_id}", headers={"Authorization": f"Bearer {student_token}"}
        )

        assert response.status_code == 200
        assert response.json()["id"] == sub_id

    async def test_get_submission_not_found(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_s6@ex.com", password="secret")
        token = await get_token(async_client, "student_s6@ex.com", "secret")

        response = await async_client.get(
            "/submissions/999999", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 404

    async def test_student_cannot_see_other_student_submission(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_s6@ex.com", password="secret")
        s1 = await create_user(async_session, org, role=UserRole.STUDENT, email="student_s7@ex.com", password="secret")
        s2 = await create_user(async_session, org, role=UserRole.STUDENT, email="student_s8@ex.com", password="secret")
        cls = await create_class(async_session, org, teacher)
        exercise = await create_exercise(async_session, teacher)
        ex_list = await create_exercise_list(async_session, teacher)
        await create_class_exercise_list(async_session, ex_list, cls)

        s1_token = await get_token(async_client, "student_s7@ex.com", "secret")
        s2_token = await get_token(async_client, "student_s8@ex.com", "secret")

        sub_resp = await async_client.post(
            "/submissions",
            json={"exercise_id": exercise.id, "exercise_list_id": ex_list.id, "class_id": cls.id, "code_snapshot": "s1 code", "language_snapshot": {}, "status": "SUBMITTED"},
            headers={"Authorization": f"Bearer {s1_token}"},
        )
        sub_id = sub_resp.json()["id"]

        response = await async_client.get(
            f"/submissions/{sub_id}", headers={"Authorization": f"Bearer {s2_token}"}
        )

        assert response.status_code == 403
