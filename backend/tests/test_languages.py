import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exercise import Exercise, LanguagePolicy
from app.models.language import Language
from app.models.user import UserRole
from tests.factories import (
    create_class,
    create_class_exercise_list,
    create_exercise,
    create_exercise_list,
    create_organization,
    create_user,
)


async def get_token(async_client: AsyncClient, email: str, password: str) -> str:
    response = await async_client.post(
        "/auth/login", json={"email": email, "password": password}
    )
    return response.json()["accessToken"]


async def _login_user(async_client, async_session, email="u@example.com", role=UserRole.STUDENT):
    org = await create_organization(async_session)
    user = await create_user(async_session, org, email=email, password="secret", role=role)
    token = await get_token(async_client, email, "secret")
    return user, token, org


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


SAMPLE_CUSTOMIZATION = {
    "mappings": [{"original": "if", "custom": "se", "tokenId": 28}],
    "modes": {"semicolon": "optional-eol"},
}


class TestCreate:
    async def test_create_language(self, async_client, async_session):
        user, token, _ = await _login_user(async_client, async_session)
        response = await async_client.post(
            "/languages",
            json={"name": "PortuJava", "description": "PT-BR", "customization": SAMPLE_CUSTOMIZATION},
            headers=_auth(token),
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "PortuJava"
        assert data["ownerId"] == user.id
        assert data["customization"] == SAMPLE_CUSTOMIZATION

    async def test_create_duplicate_name_returns_409(self, async_client, async_session):
        _, token, _ = await _login_user(async_client, async_session)
        body = {"name": "L1", "customization": {}}
        r1 = await async_client.post("/languages", json=body, headers=_auth(token))
        assert r1.status_code == 201
        r2 = await async_client.post("/languages", json=body, headers=_auth(token))
        assert r2.status_code == 409


class TestList:
    async def test_list_returns_only_my_languages(self, async_client, async_session):
        user_a, token_a, _ = await _login_user(async_client, async_session, email="a@x.com")
        await _login_user(async_client, async_session, email="b@x.com")  # other user
        # A creates one
        await async_client.post("/languages", json={"name": "A1", "customization": {}}, headers=_auth(token_a))
        response = await async_client.get("/languages", headers=_auth(token_a))
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "A1"
        assert data[0]["ownerId"] == user_a.id


class TestGet:
    async def test_owner_can_read_full_customization(self, async_client, async_session):
        _, token, _ = await _login_user(async_client, async_session)
        created = await async_client.post(
            "/languages",
            json={"name": "X", "customization": SAMPLE_CUSTOMIZATION},
            headers=_auth(token),
        )
        lid = created.json()["id"]
        response = await async_client.get(f"/languages/{lid}", headers=_auth(token))
        assert response.status_code == 200
        assert response.json()["customization"] == SAMPLE_CUSTOMIZATION

    async def test_other_user_gets_403(self, async_client, async_session):
        _, token_a, _ = await _login_user(async_client, async_session, email="a@x.com")
        _, token_b, _ = await _login_user(async_client, async_session, email="b@x.com")
        created = await async_client.post(
            "/languages", json={"name": "X", "customization": {}}, headers=_auth(token_a)
        )
        lid = created.json()["id"]
        response = await async_client.get(f"/languages/{lid}", headers=_auth(token_b))
        assert response.status_code == 403


class TestUpdate:
    async def test_owner_can_update(self, async_client, async_session):
        _, token, _ = await _login_user(async_client, async_session)
        created = await async_client.post(
            "/languages", json={"name": "X", "customization": {}}, headers=_auth(token)
        )
        lid = created.json()["id"]
        response = await async_client.patch(
            f"/languages/{lid}",
            json={"description": "new desc"},
            headers=_auth(token),
        )
        assert response.status_code == 200
        assert response.json()["description"] == "new desc"

    async def test_non_owner_gets_404(self, async_client, async_session):
        _, token_a, _ = await _login_user(async_client, async_session, email="a@x.com")
        _, token_b, _ = await _login_user(async_client, async_session, email="b@x.com")
        created = await async_client.post(
            "/languages", json={"name": "X", "customization": {}}, headers=_auth(token_a)
        )
        lid = created.json()["id"]
        response = await async_client.patch(
            f"/languages/{lid}", json={"description": "x"}, headers=_auth(token_b)
        )
        assert response.status_code == 404


class TestDelete:
    async def test_owner_can_delete(self, async_client, async_session):
        _, token, _ = await _login_user(async_client, async_session)
        created = await async_client.post(
            "/languages", json={"name": "X", "customization": {}}, headers=_auth(token)
        )
        lid = created.json()["id"]
        response = await async_client.delete(f"/languages/{lid}", headers=_auth(token))
        assert response.status_code == 204

    async def test_delete_in_use_returns_409(self, async_client, async_session):
        teacher, token, org = await _login_user(
            async_client, async_session, email="t@x.com", role=UserRole.TEACHER
        )
        lang = Language(owner_id=teacher.id, name="L", customization={})
        async_session.add(lang)
        await async_session.flush()
        ex = await create_exercise(async_session, teacher)
        ex.language_policy = LanguagePolicy.LOCKED
        ex.locked_language_id = lang.id
        await async_session.flush()
        response = await async_client.delete(f"/languages/{lang.id}", headers=_auth(token))
        assert response.status_code == 409


class TestClone:
    async def test_clone_by_owner(self, async_client, async_session):
        _, token, _ = await _login_user(async_client, async_session)
        created = await async_client.post(
            "/languages",
            json={"name": "X", "customization": SAMPLE_CUSTOMIZATION},
            headers=_auth(token),
        )
        lid = created.json()["id"]
        response = await async_client.post(f"/languages/{lid}/clone", headers=_auth(token))
        assert response.status_code == 201
        clone = response.json()
        assert clone["name"] == "X (cópia)"
        assert clone["clonedFromId"] == lid
        assert clone["customization"] == SAMPLE_CUSTOMIZATION

    async def test_clone_generates_unique_name(self, async_client, async_session):
        _, token, _ = await _login_user(async_client, async_session)
        created = await async_client.post(
            "/languages", json={"name": "X", "customization": {}}, headers=_auth(token)
        )
        lid = created.json()["id"]
        first = await async_client.post(f"/languages/{lid}/clone", headers=_auth(token))
        second = await async_client.post(f"/languages/{lid}/clone", headers=_auth(token))
        assert first.json()["name"] == "X (cópia)"
        assert second.json()["name"] == "X (cópia) 2"

    async def test_clone_by_unrelated_user_403(self, async_client, async_session):
        _, token_a, _ = await _login_user(async_client, async_session, email="a@x.com")
        _, token_b, _ = await _login_user(async_client, async_session, email="b@x.com")
        created = await async_client.post(
            "/languages", json={"name": "X", "customization": {}}, headers=_auth(token_a)
        )
        lid = created.json()["id"]
        response = await async_client.post(f"/languages/{lid}/clone", headers=_auth(token_b))
        assert response.status_code == 403

    async def test_clone_system_language_allowed(self, async_client, async_session):
        from sqlalchemy import select
        from app.models.user import User

        result = await async_session.execute(select(User).where(User.role == UserRole.SYSTEM))
        system_user = result.scalar_one()
        sys_lang = Language(owner_id=system_user.id, name="Oficial", customization={"k": 1})
        async_session.add(sys_lang)
        await async_session.flush()

        _, token, _ = await _login_user(async_client, async_session)
        response = await async_client.post(
            f"/languages/{sys_lang.id}/clone", headers=_auth(token)
        )
        assert response.status_code == 201
        assert response.json()["customization"] == {"k": 1}

    async def test_clone_via_locked_exercise_in_my_class(self, async_client, async_session):
        # Teacher with language; student member of class with exercise locked on that language.
        teacher_org = await create_organization(async_session)
        teacher = await create_user(
            async_session, teacher_org, email="teach@x.com", password="secret", role=UserRole.TEACHER
        )
        student, token_s, _ = await _login_user(
            async_client, async_session, email="stud@x.com"
        )

        lang = Language(owner_id=teacher.id, name="L", customization={"v": 1})
        async_session.add(lang)
        await async_session.flush()

        cls = await create_class(async_session, teacher_org, teacher)
        from app.models.class_member import ClassMember

        async_session.add(ClassMember(class_id=cls.id, student_id=student.id))
        el = await create_exercise_list(async_session, teacher)
        ex = await create_exercise(async_session, teacher)
        ex.language_policy = LanguagePolicy.LOCKED
        ex.locked_language_id = lang.id
        from app.models.exercise_list_item import ExerciseListItem

        async_session.add(
            ExerciseListItem(
                exercise_list_id=el.id, exercise_id=ex.id, grade_weight=1.0, order_index=0
            )
        )
        await create_class_exercise_list(async_session, el, cls)
        await async_session.flush()

        response = await async_client.post(
            f"/languages/{lang.id}/clone", headers=_auth(token_s)
        )
        assert response.status_code == 201


class TestActiveLanguage:
    async def test_get_returns_null_when_not_set(self, async_client, async_session):
        _, token, _ = await _login_user(async_client, async_session)
        response = await async_client.get("/users/me/active-language", headers=_auth(token))
        assert response.status_code == 200
        assert response.json() is None

    async def test_set_and_get(self, async_client, async_session):
        _, token, _ = await _login_user(async_client, async_session)
        created = await async_client.post(
            "/languages", json={"name": "X", "customization": {"a": 1}}, headers=_auth(token)
        )
        lid = created.json()["id"]
        put = await async_client.put(
            "/users/me/active-language", json={"languageId": lid}, headers=_auth(token)
        )
        assert put.status_code == 200
        assert put.json()["id"] == lid
        get = await async_client.get("/users/me/active-language", headers=_auth(token))
        assert get.json()["id"] == lid

    async def test_set_to_other_users_language_returns_403(self, async_client, async_session):
        _, token_a, _ = await _login_user(async_client, async_session, email="a@x.com")
        _, token_b, _ = await _login_user(async_client, async_session, email="b@x.com")
        created = await async_client.post(
            "/languages", json={"name": "X", "customization": {}}, headers=_auth(token_a)
        )
        lid = created.json()["id"]
        response = await async_client.put(
            "/users/me/active-language", json={"languageId": lid}, headers=_auth(token_b)
        )
        assert response.status_code == 403

    async def test_set_to_null(self, async_client, async_session):
        _, token, _ = await _login_user(async_client, async_session)
        created = await async_client.post(
            "/languages", json={"name": "X", "customization": {}}, headers=_auth(token)
        )
        lid = created.json()["id"]
        await async_client.put(
            "/users/me/active-language", json={"languageId": lid}, headers=_auth(token)
        )
        clear = await async_client.put(
            "/users/me/active-language", json={"languageId": None}, headers=_auth(token)
        )
        assert clear.status_code == 200
        assert clear.json() is None
