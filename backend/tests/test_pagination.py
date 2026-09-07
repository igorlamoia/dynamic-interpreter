import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserRole
from tests.factories import create_organization, create_user


async def get_token(client: AsyncClient, email: str, password: str) -> str:
    r = await client.post("/auth/login", json={"email": email, "password": password})
    return r.json()["accessToken"]


class TestPaginationEndpoints:
    async def test_exercises_pagination_and_search(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(
            async_session, org, role=UserRole.TEACHER, email="teacher_pg@ex.com", password="secret"
        )
        token = await get_token(async_client, "teacher_pg@ex.com", "secret")
        headers = {"Authorization": f"Bearer {token}"}

        # Create 3 exercises
        for i in range(1, 4):
            await async_client.post(
                "/exercises",
                json={"title": f"Exercise {i} Alpha", "description": f"Description {i}", "attachments": ""},
                headers=headers,
            )

        # Page 1 with pageSize 2
        r1 = await async_client.get("/exercises?page=1&pageSize=2", headers=headers)
        assert r1.status_code == 200
        data1 = r1.json()
        assert "items" in data1
        assert len(data1["items"]) == 2
        assert data1["total"] == 3
        assert data1["page"] == 1
        assert data1["pageSize"] == 2
        assert data1["totalPages"] == 2

        # Page 2
        r2 = await async_client.get("/exercises?page=2&pageSize=2", headers=headers)
        assert r2.status_code == 200
        data2 = r2.json()
        assert len(data2["items"]) == 1
        assert data2["page"] == 2

        # Search query q
        r_search = await async_client.get("/exercises?page=1&pageSize=10&q=Exercise 1", headers=headers)
        assert r_search.status_code == 200
        data_search = r_search.json()
        assert data_search["total"] == 1
        assert data_search["items"][0]["title"] == "Exercise 1 Alpha"

        # Backward compatibility without page parameter returns plain list
        r_plain = await async_client.get("/exercises", headers=headers)
        assert r_plain.status_code == 200
        assert isinstance(r_plain.json(), list)
        assert len(r_plain.json()) >= 3

    async def test_exercise_lists_pagination(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(
            async_session, org, role=UserRole.TEACHER, email="teacher_lists_pg@ex.com", password="secret"
        )
        token = await get_token(async_client, "teacher_lists_pg@ex.com", "secret")
        headers = {"Authorization": f"Bearer {token}"}

        for i in range(1, 4):
            await async_client.post(
                "/exercise-lists",
                json={"title": f"List {i}", "description": f"List Desc {i}"},
                headers=headers,
            )

        r = await async_client.get("/exercise-lists?page=1&pageSize=2", headers=headers)
        assert r.status_code == 200
        data = r.json()
        assert "items" in data
        assert len(data["items"]) == 2
        assert data["total"] == 3
        assert data["totalPages"] == 2

    async def test_languages_and_community_pagination(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        user = await create_user(
            async_session, org, role=UserRole.COMMUNITY, email="community_pg@ex.com", password="secret"
        )
        token = await get_token(async_client, "community_pg@ex.com", "secret")
        headers = {"Authorization": f"Bearer {token}"}

        # Create 3 languages and make 2 public
        for i in range(1, 4):
            created = await async_client.post(
                "/languages",
                json={
                    "name": f"Lang {i}",
                    "description": f"Desc {i}",
                    "customization": {
                        "name": f"Lang {i}",
                        "mappings": [],
                        "modes": {
                            "typing": "typed",
                            "array": "fixed",
                            "block": "delimited",
                            "semicolon": "required",
                        },
                    },
                },
                headers=headers,
            )
            lang_id = created.json()["id"]
            if i <= 2:
                await async_client.put(
                    f"/languages/{lang_id}/publication",
                    json={"isPublic": True},
                    headers=headers,
                )

        # /languages with page
        r_mine = await async_client.get("/languages?page=1&pageSize=2", headers=headers)
        assert r_mine.status_code == 200
        data_mine = r_mine.json()
        assert len(data_mine["items"]) == 2
        assert data_mine["total"] == 3
        assert data_mine["totalPages"] == 2

        # /languages/community with page
        r_comm = await async_client.get("/languages/community?page=1&pageSize=1", headers=headers)
        assert r_comm.status_code == 200
        data_comm = r_comm.json()
        assert "items" in data_comm
        assert len(data_comm["items"]) == 1
        assert data_comm["pageSize"] == 1
        assert data_comm["page"] == 1
        assert data_comm["total"] >= 2

    async def test_submissions_pagination(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        from tests.factories import create_exercise, create_exercise_list, create_class, create_class_exercise_list

        org = await create_organization(async_session)
        teacher = await create_user(
            async_session, org, role=UserRole.TEACHER, email="teacher_sub_pg@ex.com", password="secret"
        )
        student1 = await create_user(
            async_session, org, role=UserRole.STUDENT, email="student_sub_pg1@ex.com", password="secret"
        )
        student2 = await create_user(
            async_session, org, role=UserRole.STUDENT, email="student_sub_pg2@ex.com", password="secret"
        )
        token = await get_token(async_client, "teacher_sub_pg@ex.com", "secret")
        s1_token = await get_token(async_client, "student_sub_pg1@ex.com", "secret")
        s2_token = await get_token(async_client, "student_sub_pg2@ex.com", "secret")

        cls = await create_class(async_session, org, teacher)
        ex = await create_exercise(async_session, teacher)
        ex_list = await create_exercise_list(async_session, teacher)
        await create_class_exercise_list(async_session, ex_list, cls)

        # Student 1 submits
        await async_client.post(
            "/submissions",
            json={
                "exercise_id": ex.id,
                "exercise_list_id": ex_list.id,
                "class_id": cls.id,
                "code_snapshot": "print(1);",
                "language_snapshot": {},
                "status": "SUBMITTED",
            },
            headers={"Authorization": f"Bearer {s1_token}"},
        )
        # Student 2 submits
        await async_client.post(
            "/submissions",
            json={
                "exercise_id": ex.id,
                "exercise_list_id": ex_list.id,
                "class_id": cls.id,
                "code_snapshot": "print(2);",
                "language_snapshot": {},
                "status": "SUBMITTED",
            },
            headers={"Authorization": f"Bearer {s2_token}"},
        )

        r = await async_client.get(
            f"/submissions?exerciseListId={ex_list.id}&page=1&pageSize=1",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200
        data = r.json()
        assert "items" in data
        assert len(data["items"]) == 1
        assert data["total"] == 2
        assert data["totalPages"] == 2
