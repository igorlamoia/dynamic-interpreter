import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from httpx import AsyncClient

from app.models.exercise import Exercise
from app.models.exercise_list import ExerciseList
from app.models.exercise_list_item import ExerciseListItem
from app.models.language import Language, LanguagePolicy
from app.models.user import UserRole
from app.modules.languages.policy import resolve_effective_language
from tests.factories import (
    create_class,
    create_class_exercise_list,
    create_exercise,
    create_exercise_list,
    create_organization,
    create_user,
)


def _lang(name: str) -> Language:
    return Language(id=1, owner_id=1, name=name, customization={"n": name})


def _exercise(policy: LanguagePolicy, language: Language | None) -> Exercise:
    ex = Exercise(teacher_id=1, title="t", description="d", attachments="")
    ex.language_policy = policy
    ex.locked_language = language
    ex.locked_language_id = language.id if language else None
    return ex


def _list(policy: LanguagePolicy, language: Language | None) -> ExerciseList:
    el = ExerciseList(teacher_id=1, title="t", description="d")
    el.language_policy = policy
    el.locked_language = language
    el.locked_language_id = language.id if language else None
    return el


class TestResolveEffectiveLanguage:
    def test_exercise_lock_wins_over_list_lock(self):
        x, y = _lang("X"), _lang("Y")
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.LOCKED, y), _list(LanguagePolicy.LOCKED, x)
        )
        assert effective is y
        assert source == "exercise"

    def test_open_exercise_inherits_list_lock(self):
        x = _lang("X")
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.OPEN, None), _list(LanguagePolicy.LOCKED, x)
        )
        assert effective is x
        assert source == "list"

    def test_exercise_lock_applies_with_open_list(self):
        y = _lang("Y")
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.LOCKED, y), _list(LanguagePolicy.OPEN, None)
        )
        assert effective is y
        assert source == "exercise"

    def test_both_open_leaves_student_free(self):
        effective, source = resolve_effective_language(
            _exercise(LanguagePolicy.OPEN, None), _list(LanguagePolicy.OPEN, None)
        )
        assert effective is None
        assert source is None

    def test_no_list_falls_back_to_exercise_only(self):
        y = _lang("Y")
        assert resolve_effective_language(_exercise(LanguagePolicy.LOCKED, y), None) == (y, "exercise")
        assert resolve_effective_language(_exercise(LanguagePolicy.OPEN, None), None) == (None, None)


CUSTOM = {"mappings": [{"original": "if", "custom": "se", "tokenId": 28}]}


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _login(async_client: AsyncClient, email: str, password: str = "secret") -> str:
    r = await async_client.post("/auth/login", json={"email": email, "password": password})
    return r.json()["accessToken"]


async def _teacher(async_client, async_session, email="tl@x.com"):
    org = await create_organization(async_session)
    user = await create_user(
        async_session, org, email=email, password="secret", role=UserRole.TEACHER
    )
    return user, await _login(async_client, email), org


async def _language(async_session, owner, name="Portugolzinho") -> Language:
    lang = Language(owner_id=owner.id, name=name, customization=CUSTOM)
    async_session.add(lang)
    await async_session.flush()
    return lang


class TestPatchExerciseList:
    async def test_owner_locks_the_list(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session)
        lang = await _language(async_session, teacher)
        el = await create_exercise_list(async_session, teacher)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"languagePolicy": "LOCKED", "lockedLanguageId": lang.id},
            headers=_auth(token),
        )
        assert r.status_code == 200
        data = r.json()
        assert data["languagePolicy"] == "LOCKED"
        assert data["lockedLanguageId"] == lang.id
        assert data["lockedLanguage"]["customization"] == CUSTOM

    async def test_non_owner_gets_404(self, async_client, async_session):
        teacher, _, _ = await _teacher(async_client, async_session, email="owner@x.com")
        _, other_token, _ = await _teacher(async_client, async_session, email="other@x.com")
        el = await create_exercise_list(async_session, teacher)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"title": "roubado"},
            headers=_auth(other_token),
        )
        assert r.status_code == 404

    async def test_locked_without_language_returns_400(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session)
        el = await create_exercise_list(async_session, teacher)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"languagePolicy": "LOCKED"},
            headers=_auth(token),
        )
        assert r.status_code == 400

    async def test_open_with_language_returns_400(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session)
        lang = await _language(async_session, teacher)
        el = await create_exercise_list(async_session, teacher)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"languagePolicy": "OPEN", "lockedLanguageId": lang.id},
            headers=_auth(token),
        )
        assert r.status_code == 400

    async def test_other_teachers_language_returns_403(self, async_client, async_session):
        teacher_a, _, _ = await _teacher(async_client, async_session, email="a2@x.com")
        teacher_b, token_b, _ = await _teacher(async_client, async_session, email="b2@x.com")
        lang = await _language(async_session, teacher_a)
        el = await create_exercise_list(async_session, teacher_b)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"languagePolicy": "LOCKED", "lockedLanguageId": lang.id},
            headers=_auth(token_b),
        )
        assert r.status_code == 403

    async def test_partial_patch_preserves_policy(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session)
        lang = await _language(async_session, teacher)
        el = await create_exercise_list(
            async_session, teacher, language_policy=LanguagePolicy.LOCKED,
            locked_language_id=lang.id,
        )

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"title": "novo titulo"},
            headers=_auth(token),
        )
        assert r.status_code == 200
        data = r.json()
        assert data["title"] == "novo titulo"
        assert data["languagePolicy"] == "LOCKED"
        assert data["lockedLanguageId"] == lang.id

    async def test_published_list_can_still_change_language(self, async_client, async_session):
        teacher, token, org = await _teacher(async_client, async_session, email="pub@x.com")
        lang = await _language(async_session, teacher)
        el = await create_exercise_list(async_session, teacher)
        cls = await create_class(async_session, org, teacher)
        await create_class_exercise_list(async_session, el, cls)

        r = await async_client.patch(
            f"/exercise-lists/{el.id}",
            json={"languagePolicy": "LOCKED", "lockedLanguageId": lang.id},
            headers=_auth(token),
        )
        assert r.status_code == 200


class TestEffectiveLanguageEndpoint:
    async def _list_with_exercise(self, async_session, teacher, **list_kwargs):
        el = await create_exercise_list(async_session, teacher, **list_kwargs)
        ex = await create_exercise(async_session, teacher)
        async_session.add(
            ExerciseListItem(
                exercise_list_id=el.id, exercise_id=ex.id, grade_weight=1.0, order_index=0
            )
        )
        await async_session.flush()
        return el, ex

    async def test_open_exercise_inherits_list_language(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff1@x.com")
        lang = await _language(async_session, teacher)
        el, ex = await self._list_with_exercise(
            async_session, teacher,
            language_policy=LanguagePolicy.LOCKED, locked_language_id=lang.id,
        )

        r = await async_client.get(
            f"/exercises/{ex.id}", params={"listId": el.id}, headers=_auth(token)
        )
        assert r.status_code == 200
        data = r.json()
        assert data["effectiveLanguage"]["id"] == lang.id
        assert data["effectiveLanguageSource"] == "list"

    async def test_exercise_lock_wins(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff2@x.com")
        list_lang = await _language(async_session, teacher, name="DaLista")
        ex_lang = await _language(async_session, teacher, name="DoExercicio")
        el, ex = await self._list_with_exercise(
            async_session, teacher,
            language_policy=LanguagePolicy.LOCKED, locked_language_id=list_lang.id,
        )
        ex.language_policy = LanguagePolicy.LOCKED
        ex.locked_language_id = ex_lang.id
        await async_session.flush()

        r = await async_client.get(
            f"/exercises/{ex.id}", params={"listId": el.id}, headers=_auth(token)
        )
        assert r.status_code == 200
        data = r.json()
        assert data["effectiveLanguage"]["id"] == ex_lang.id
        assert data["effectiveLanguageSource"] == "exercise"

    async def test_both_open_returns_null(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff3@x.com")
        el, ex = await self._list_with_exercise(async_session, teacher)

        r = await async_client.get(
            f"/exercises/{ex.id}", params={"listId": el.id}, headers=_auth(token)
        )
        assert r.status_code == 200
        data = r.json()
        assert data["effectiveLanguage"] is None
        assert data["effectiveLanguageSource"] is None

    async def test_without_list_id_resolves_from_exercise_only(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff4@x.com")
        lang = await _language(async_session, teacher)
        el, ex = await self._list_with_exercise(
            async_session, teacher,
            language_policy=LanguagePolicy.LOCKED, locked_language_id=lang.id,
        )

        r = await async_client.get(f"/exercises/{ex.id}", headers=_auth(token))
        assert r.status_code == 200
        assert r.json()["effectiveLanguage"] is None

    async def test_unknown_list_id_returns_400(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff5@x.com")
        ex = await create_exercise(async_session, teacher)

        r = await async_client.get(
            f"/exercises/{ex.id}", params={"listId": 999999}, headers=_auth(token)
        )
        assert r.status_code == 400

    async def test_exercise_not_in_list_returns_400(self, async_client, async_session):
        teacher, token, _ = await _teacher(async_client, async_session, email="eff6@x.com")
        el = await create_exercise_list(async_session, teacher)
        outsider = await create_exercise(async_session, teacher)

        r = await async_client.get(
            f"/exercises/{outsider.id}", params={"listId": el.id}, headers=_auth(token)
        )
        assert r.status_code == 400
