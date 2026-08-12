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

    async def test_list_includes_normalized_dna(self, async_client, async_session):
        _, token, _ = await _login_user(async_client, async_session)
        await async_client.post(
            "/languages",
            json={
                "name": "DNA",
                "customization": {
                    "modes": {
                        "typing": "untyped",
                        "array": "dynamic",
                        "block": "indentation",
                        "semicolon": "required",
                    }
                },
            },
            headers=_auth(token),
        )

        response = await async_client.get("/languages", headers=_auth(token))

        assert response.status_code == 200
        assert response.json()[0]["dna"] == {
            "typing": "untyped",
            "array": "dynamic",
            "block": "indentation",
            "semicolon": "required",
        }

    async def test_legacy_customization_uses_dna_defaults(
        self, async_client, async_session
    ):
        _, token, _ = await _login_user(async_client, async_session)
        await async_client.post(
            "/languages",
            json={"name": "Legacy", "customization": {}},
            headers=_auth(token),
        )

        response = await async_client.get("/languages", headers=_auth(token))

        assert response.json()[0]["dna"] == {
            "typing": "typed",
            "array": "fixed",
            "block": "delimited",
            "semicolon": "optional-eol",
        }


class TestCommunityAccess:
    async def test_community_can_manage_languages_but_not_academic_modules(
        self, async_client, async_session
    ):
        registered = await async_client.post(
            "/auth/register",
            json={
                "email": "community-access@example.com",
                "password": "secret123",
                "name": "Community",
                "role": "community",
                "organizationId": None,
            },
        )
        token = registered.json()["accessToken"]

        created = await async_client.post(
            "/languages",
            json={"name": "CommunityLang", "customization": {}},
            headers=_auth(token),
        )

        assert created.status_code == 201
        language_id = created.json()["id"]
        assert (await async_client.get("/languages", headers=_auth(token))).status_code == 200
        assert (
            await async_client.get(
                f"/languages/{language_id}", headers=_auth(token)
            )
        ).status_code == 200
        assert (
            await async_client.patch(
                f"/languages/{language_id}",
                json={"description": "Atualizada"},
                headers=_auth(token),
            )
        ).status_code == 200
        assert (
            await async_client.put(
                "/users/me/active-language",
                json={"languageId": language_id},
                headers=_auth(token),
            )
        ).status_code == 200
        clone = await async_client.post(
            f"/languages/{language_id}/clone", headers=_auth(token)
        )
        assert clone.status_code == 201
        assert (
            await async_client.delete(
                f"/languages/{clone.json()['id']}", headers=_auth(token)
            )
        ).status_code == 204
        assert (await async_client.get("/classes", headers=_auth(token))).status_code == 403
        assert (await async_client.get("/exercises", headers=_auth(token))).status_code == 403
        assert (await async_client.get("/exercise-lists", headers=_auth(token))).status_code == 403
        assert (await async_client.get("/submissions", headers=_auth(token))).status_code == 403


class TestCommunityCatalog:
    async def _publish_language(
        self,
        async_client,
        token: str,
        name: str,
        customization: dict,
    ) -> dict:
        created = await async_client.post(
            "/languages",
            json={"name": name, "customization": customization},
            headers=_auth(token),
        )
        response = await async_client.put(
            f"/languages/{created.json()['id']}/publication",
            json={"isPublic": True},
            headers=_auth(token),
        )
        assert response.status_code == 200
        return response.json()

    async def test_community_user_can_publish_and_unpublish_own_language(
        self, async_client, async_session
    ):
        owner, token, _ = await _login_user(
            async_client,
            async_session,
            email="publisher@example.com",
            role=UserRole.COMMUNITY,
        )
        created = await async_client.post(
            "/languages",
            json={"name": "Linguagem Pública", "customization": {}},
            headers=_auth(token),
        )

        published = await async_client.put(
            f"/languages/{created.json()['id']}/publication",
            json={"isPublic": True},
            headers=_auth(token),
        )

        assert published.status_code == 200
        assert published.json()["isPublic"] is True
        assert published.json()["publishedAt"] is not None
        assert published.json()["ownerName"] == owner.name

        unpublished = await async_client.put(
            f"/languages/{created.json()['id']}/publication",
            json={"isPublic": False},
            headers=_auth(token),
        )
        assert unpublished.status_code == 200
        assert unpublished.json()["isPublic"] is False
        assert unpublished.json()["publishedAt"] is None

    async def test_only_community_user_can_publish(
        self, async_client, async_session
    ):
        _, token, _ = await _login_user(
            async_client,
            async_session,
            email="student-publisher@example.com",
            role=UserRole.STUDENT,
        )
        created = await async_client.post(
            "/languages",
            json={"name": "Privada", "customization": {}},
            headers=_auth(token),
        )

        response = await async_client.put(
            f"/languages/{created.json()['id']}/publication",
            json={"isPublic": True},
            headers=_auth(token),
        )

        assert response.status_code == 403

    async def test_catalog_lists_only_public_languages_and_supports_search(
        self, async_client, async_session
    ):
        owner, owner_token, _ = await _login_user(
            async_client,
            async_session,
            email="catalog-owner@example.com",
            role=UserRole.COMMUNITY,
        )
        _, visitor_token, _ = await _login_user(
            async_client,
            async_session,
            email="catalog-visitor@example.com",
        )
        published = await async_client.post(
            "/languages",
            json={
                "name": "Script Lunar",
                "description": "Uma linguagem indentada",
                "customization": {"modes": {"block": "indentation"}},
            },
            headers=_auth(owner_token),
        )
        await async_client.post(
            "/languages",
            json={"name": "Segredo", "customization": {}},
            headers=_auth(owner_token),
        )
        await async_client.put(
            f"/languages/{published.json()['id']}/publication",
            json={"isPublic": True},
            headers=_auth(owner_token),
        )

        response = await async_client.get(
            "/languages/community?q=lunar", headers=_auth(visitor_token)
        )

        assert response.status_code == 200
        assert len(response.json()) == 1
        language = response.json()[0]
        assert language["name"] == "Script Lunar"
        assert language["ownerName"] == owner.name
        assert language["isPublic"] is True
        assert language["dna"]["block"] == "indentation"
        assert "customization" not in language

    async def test_catalog_combines_dna_filters_with_and_semantics(
        self, async_client, async_session
    ):
        _, owner_token, _ = await _login_user(
            async_client,
            async_session,
            email="dna-filter-owner@example.com",
            role=UserRole.COMMUNITY,
        )
        _, visitor_token, _ = await _login_user(
            async_client,
            async_session,
            email="dna-filter-visitor@example.com",
        )
        await self._publish_language(
            async_client,
            owner_token,
            "Tipada Indentada",
            {
                "modes": {
                    "typing": "typed",
                    "array": "dynamic",
                    "block": "indentation",
                    "semicolon": "required",
                }
            },
        )
        await self._publish_language(
            async_client,
            owner_token,
            "Não Tipada Indentada",
            {"modes": {"typing": "untyped", "block": "indentation"}},
        )
        await self._publish_language(
            async_client,
            owner_token,
            "Tipada Delimitada",
            {"modes": {"typing": "typed", "block": "delimited"}},
        )

        response = await async_client.get(
            "/languages/community?typing=typed&block=indentation",
            headers=_auth(visitor_token),
        )

        assert response.status_code == 200
        assert [item["name"] for item in response.json()] == ["Tipada Indentada"]

    async def test_catalog_dna_filters_use_defaults_for_legacy_customization(
        self, async_client, async_session
    ):
        _, owner_token, _ = await _login_user(
            async_client,
            async_session,
            email="legacy-dna-owner@example.com",
            role=UserRole.COMMUNITY,
        )
        _, visitor_token, _ = await _login_user(
            async_client,
            async_session,
            email="legacy-dna-visitor@example.com",
        )
        await self._publish_language(
            async_client, owner_token, "Legada Padrão", {}
        )

        response = await async_client.get(
            "/languages/community?typing=typed&array=fixed&block=delimited&semicolon=optional-eol",
            headers=_auth(visitor_token),
        )

        assert response.status_code == 200
        assert [item["name"] for item in response.json()] == ["Legada Padrão"]

    async def test_catalog_rejects_unknown_dna_filter(
        self, async_client, async_session
    ):
        _, token, _ = await _login_user(
            async_client,
            async_session,
            email="invalid-dna-filter@example.com",
        )

        response = await async_client.get(
            "/languages/community?typing=loosely-typed", headers=_auth(token)
        )

        assert response.status_code == 422

    async def test_public_language_can_be_read_and_imported_by_another_user(
        self, async_client, async_session
    ):
        _, owner_token, _ = await _login_user(
            async_client,
            async_session,
            email="import-owner@example.com",
            role=UserRole.COMMUNITY,
        )
        _, visitor_token, _ = await _login_user(
            async_client,
            async_session,
            email="import-visitor@example.com",
        )
        created = await async_client.post(
            "/languages",
            json={
                "name": "Compartilhada",
                "customization": SAMPLE_CUSTOMIZATION,
            },
            headers=_auth(owner_token),
        )
        language_id = created.json()["id"]
        await async_client.put(
            f"/languages/{language_id}/publication",
            json={"isPublic": True},
            headers=_auth(owner_token),
        )

        detail = await async_client.get(
            f"/languages/{language_id}", headers=_auth(visitor_token)
        )
        imported = await async_client.post(
            f"/languages/{language_id}/import", headers=_auth(visitor_token)
        )

        assert detail.status_code == 200
        assert detail.json()["customization"] == SAMPLE_CUSTOMIZATION
        assert imported.status_code == 201
        assert imported.json()["clonedFromId"] == language_id
        assert imported.json()["isPublic"] is False
        assert imported.json()["publishedAt"] is None

    async def test_unpublished_language_is_removed_from_catalog_and_read_gate(
        self, async_client, async_session
    ):
        _, owner_token, _ = await _login_user(
            async_client,
            async_session,
            email="unpublish-owner@example.com",
            role=UserRole.COMMUNITY,
        )
        _, visitor_token, _ = await _login_user(
            async_client,
            async_session,
            email="unpublish-visitor@example.com",
        )
        created = await async_client.post(
            "/languages",
            json={"name": "Temporária", "customization": {}},
            headers=_auth(owner_token),
        )
        language_id = created.json()["id"]
        await async_client.put(
            f"/languages/{language_id}/publication",
            json={"isPublic": True},
            headers=_auth(owner_token),
        )
        await async_client.put(
            f"/languages/{language_id}/publication",
            json={"isPublic": False},
            headers=_auth(owner_token),
        )

        catalog = await async_client.get(
            "/languages/community", headers=_auth(visitor_token)
        )
        detail = await async_client.get(
            f"/languages/{language_id}", headers=_auth(visitor_token)
        )

        assert all(item["id"] != language_id for item in catalog.json())
        assert detail.status_code == 403


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
