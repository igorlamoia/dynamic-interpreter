import os
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.factories import create_organization, create_user
from app.models.user import UserRole


async def get_token(client: AsyncClient, email: str, password: str) -> str:
    r = await client.post("/auth/login", json={"email": email, "password": password})
    return r.json()["accessToken"]


class TestCreateClass:
    async def test_teacher_can_create_class(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher1@ex.com", password="secret")
        token = await get_token(async_client, "teacher1@ex.com", "secret")

        response = await async_client.post(
            "/classes",
            json={"name": "Java Basics", "description": "Intro", "access_code": "ABC123"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Java Basics"
        assert data["teacherId"] == teacher.id

    async def test_student_cannot_create_class(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_c1@ex.com", password="secret")
        token = await get_token(async_client, "student_c1@ex.com", "secret")

        response = await async_client.post(
            "/classes",
            json={"name": "Bad", "description": "no", "access_code": "X9"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403

    async def test_duplicate_access_code_fails(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher2@ex.com", password="secret")
        token = await get_token(async_client, "teacher2@ex.com", "secret")

        await async_client.post(
            "/classes",
            json={"name": "First", "description": "d", "access_code": "DUP999"},
            headers={"Authorization": f"Bearer {token}"},
        )
        response = await async_client.post(
            "/classes",
            json={"name": "Second", "description": "d", "access_code": "DUP999"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 409


class TestListClasses:
    async def test_teacher_sees_own_classes(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher3@ex.com", password="secret")
        token = await get_token(async_client, "teacher3@ex.com", "secret")

        await async_client.post(
            "/classes",
            json={"name": "My Class", "description": "d", "access_code": "MY001"},
            headers={"Authorization": f"Bearer {token}"},
        )

        response = await async_client.get("/classes", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert any(c["name"] == "My Class" for c in data)

    async def test_list_classes_returns_member_and_list_counts(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        from tests.factories import (
            create_class,
            create_class_exercise_list,
            create_exercise_list,
        )
        from app.models.class_member import ClassMember

        org = await create_organization(async_session)
        teacher = await create_user(
            async_session,
            org,
            role=UserRole.TEACHER,
            email="teacher_counts@ex.com",
            password="secret",
        )
        student = await create_user(
            async_session,
            org,
            role=UserRole.STUDENT,
            email="student_counts@ex.com",
            password="secret",
        )
        token = await get_token(async_client, "teacher_counts@ex.com", "secret")
        cls = await create_class(async_session, org, teacher, access_code="CNT001")
        async_session.add(ClassMember(class_id=cls.id, student_id=student.id))
        exercise_list = await create_exercise_list(async_session, teacher)
        await create_class_exercise_list(async_session, exercise_list, cls)

        response = await async_client.get(
            "/classes",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        listed = next(c for c in data if c["id"] == cls.id)
        assert listed["_count"] == {"members": 1, "exerciseLists": 1}
        assert listed["teacher"]["name"] == teacher.name
        assert "exercises" not in listed["_count"]


class TestJoinClass:
    async def test_student_can_join_with_valid_code(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher4@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_c2@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher4@ex.com", "secret")
        student_token = await get_token(async_client, "student_c2@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Join Test", "description": "d", "access_code": "JOIN1"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        response = await async_client.post(
            "/classes/join",
            json={"access_code": "JOIN1"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        assert response.status_code == 200

    async def test_join_fails_with_wrong_code(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher5@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_c3@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher5@ex.com", "secret")
        student_token = await get_token(async_client, "student_c3@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Wrong Code Test", "description": "d", "access_code": "CORRECT1"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        response = await async_client.post(
            "/classes/join",
            json={"access_code": "WRONG"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        assert response.status_code == 404


class TestGetClass:
    async def test_get_class_by_id(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher6@ex.com", password="secret")
        token = await get_token(async_client, "teacher6@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Detail Test", "description": "d", "access_code": "DET001"},
            headers={"Authorization": f"Bearer {token}"},
        )
        class_id = create_resp.json()["id"]

        response = await async_client.get(
            f"/classes/{class_id}", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        assert response.json()["id"] == class_id
        assert response.json()["name"] == "Detail Test"

    async def test_get_class_not_found(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher7@ex.com", password="secret")
        token = await get_token(async_client, "teacher7@ex.com", "secret")

        response = await async_client.get(
            "/classes/999999", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 404


class TestRemoveMember:
    async def test_teacher_can_remove_member(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher8@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_r1@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher8@ex.com", "secret")
        student_token = await get_token(async_client, "student_r1@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Remove Test", "description": "d", "access_code": "REM001"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        join_resp = await async_client.post(
            "/classes/join",
            json={"access_code": "REM001"},
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert join_resp.status_code == 200

        # Pegar o student_id do token de login
        me_resp = await async_client.get(
            "/auth/me", headers={"Authorization": f"Bearer {student_token}"}
        )
        student_id = me_resp.json()["id"]

        response = await async_client.delete(
            f"/classes/{class_id}/members/{student_id}",
            headers={"Authorization": f"Bearer {teacher_token}"},
        )

        assert response.status_code == 204

    async def test_student_cannot_remove_member(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher9@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_r2@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_r3@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher9@ex.com", "secret")
        s2_token = await get_token(async_client, "student_r2@ex.com", "secret")
        s3_token = await get_token(async_client, "student_r3@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Remove Forbidden", "description": "d", "access_code": "REM002"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        await async_client.post(
            "/classes/join",
            json={"access_code": "REM002"},
            headers={"Authorization": f"Bearer {s2_token}"},
        )
        await async_client.post(
            "/classes/join",
            json={"access_code": "REM002"},
            headers={"Authorization": f"Bearer {s3_token}"},
        )

        me_resp = await async_client.get("/auth/me", headers={"Authorization": f"Bearer {s2_token}"})
        s2_id = me_resp.json()["id"]

        response = await async_client.delete(
            f"/classes/{class_id}/members/{s2_id}",
            headers={"Authorization": f"Bearer {s3_token}"},
        )

        assert response.status_code == 403


class TestJoinClassByCode:
    async def test_join_class_success(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_jc1@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_jc1@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher_jc1@ex.com", "secret")
        student_token = await get_token(async_client, "student_jc1@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Join By Code", "description": "d", "access_code": "JBC001"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        assert create_resp.status_code == 201
        class_id = create_resp.json()["id"]

        response = await async_client.post(
            "/classes/join",
            json={"accessCode": "JBC001"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["classId"] == class_id

    async def test_join_class_not_found(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_jc2@ex.com", password="secret")
        token = await get_token(async_client, "student_jc2@ex.com", "secret")

        response = await async_client.post(
            "/classes/join",
            json={"accessCode": "NONEXISTENT"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404

    async def test_join_class_as_teacher_forbidden(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_jc3@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_jc4@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher_jc3@ex.com", "secret")
        other_teacher_token = await get_token(async_client, "teacher_jc4@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Teacher Join Test", "description": "d", "access_code": "JBC003"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        assert create_resp.status_code == 201

        response = await async_client.post(
            "/classes/join",
            json={"accessCode": "JBC003"},
            headers={"Authorization": f"Bearer {other_teacher_token}"},
        )

        assert response.status_code == 403

    async def test_join_class_already_member(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_jc2@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_jc3@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher_jc2@ex.com", "secret")
        student_token = await get_token(async_client, "student_jc3@ex.com", "secret")

        await async_client.post(
            "/classes",
            json={"name": "Already Member", "description": "d", "access_code": "JBC002"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )

        await async_client.post(
            "/classes/join",
            json={"accessCode": "JBC002"},
            headers={"Authorization": f"Bearer {student_token}"},
        )
        response = await async_client.post(
            "/classes/join",
            json={"accessCode": "JBC002"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        assert response.status_code == 409


class TestGetClassMembers:
    async def test_get_class_members_as_teacher(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_m1@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_m1@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher_m1@ex.com", "secret")
        student_token = await get_token(async_client, "student_m1@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Members Test", "description": "d", "access_code": "MEM001"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        await async_client.post(
            "/classes/join",
            json={"accessCode": "MEM001"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        response = await async_client.get(
            f"/classes/{class_id}/members",
            headers={"Authorization": f"Bearer {teacher_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "members" in data
        assert "teacher" in data
        assert len(data["members"]) >= 1

    async def test_get_class_members_forbidden_for_non_teacher(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_m2@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_m2@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_m3@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher_m2@ex.com", "secret")
        student_token = await get_token(async_client, "student_m2@ex.com", "secret")
        other_token = await get_token(async_client, "student_m3@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Forbidden Members", "description": "d", "access_code": "MEM002"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        await async_client.post(
            "/classes/join",
            json={"accessCode": "MEM002"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        response = await async_client.get(
            f"/classes/{class_id}/members",
            headers={"Authorization": f"Bearer {other_token}"},
        )

        assert response.status_code == 403


class TestGetClassExerciseLists:
    async def test_get_class_exercise_lists_empty(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el1@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_el1@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher_el1@ex.com", "secret")
        student_token = await get_token(async_client, "student_el1@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "EL Empty Test", "description": "d", "access_code": "EL001"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        await async_client.post(
            "/classes/join",
            json={"accessCode": "EL001"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        response = await async_client.get(
            f"/classes/{class_id}/exercise-lists",
            headers={"Authorization": f"Bearer {student_token}"},
        )

        assert response.status_code == 200
        assert response.json() == []

    async def test_get_class_exercise_lists_with_progress(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        from tests.factories import (
            create_class, create_exercise, create_exercise_list,
            create_class_exercise_list
        )
        from app.models.class_member import ClassMember
        from app.models.exercise_list_item import ExerciseListItem
        from app.models.submission import Submission

        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el2@ex.com", password="secret")
        student = await create_user(async_session, org, role=UserRole.STUDENT, email="student_el2@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher_el2@ex.com", "secret")
        student_token = await get_token(async_client, "student_el2@ex.com", "secret")

        cls = await create_class(async_session, org, teacher, access_code="EL002")

        # Add student as member
        member = ClassMember(class_id=cls.id, student_id=student.id)
        async_session.add(member)
        await async_session.flush()

        exercise = await create_exercise(async_session, teacher)
        ex_list = await create_exercise_list(async_session, teacher)

        item = ExerciseListItem(
            exercise_list_id=ex_list.id,
            exercise_id=exercise.id,
            grade_weight=1.0,
            order_index=0,
        )
        async_session.add(item)
        await async_session.flush()

        cel = await create_class_exercise_list(async_session, ex_list, cls)

        submission = Submission(
            exercise_id=exercise.id,
            exercise_list_id=ex_list.id,
            class_id=cls.id,
            student_id=student.id,
            code_snapshot="public void main() {}",
        )
        async_session.add(submission)
        await async_session.flush()

        response = await async_client.get(
            f"/classes/{cls.id}/exercise-lists",
            headers={"Authorization": f"Bearer {student_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        cel_data = data[0]
        assert cel_data["exerciseListId"] == ex_list.id
        assert cel_data["classId"] == cls.id
        assert cel_data["totalCount"] == 1
        assert cel_data["completedCount"] == 1
        items = cel_data["exerciseList"]["items"]
        assert len(items) == 1
        assert items[0]["submitted"] is True
