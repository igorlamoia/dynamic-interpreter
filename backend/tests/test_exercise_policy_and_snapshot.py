import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from sqlalchemy import select

from app.models.language import Language
from app.models.user import User, UserRole
from tests.factories import (
    create_class,
    create_class_exercise_list,
    create_exercise,
    create_exercise_list,
    create_organization,
    create_user,
)


async def get_token(async_client, email: str, password: str) -> str:
    r = await async_client.post("/auth/login", json={"email": email, "password": password})
    return r.json()["accessToken"]


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


CUSTOM = {"mappings": [{"original": "if", "custom": "se", "tokenId": 28}]}


async def _teacher_with_token(async_client, async_session, email="t@x.com"):
    org = await create_organization(async_session)
    user = await create_user(
        async_session, org, email=email, password="secret", role=UserRole.TEACHER
    )
    token = await get_token(async_client, email, "secret")
    return user, token, org


class TestExerciseLanguagePolicy:
    async def test_create_open_default(self, async_client, async_session):
        _, token, _ = await _teacher_with_token(async_client, async_session)
        r = await async_client.post(
            "/exercises",
            json={"title": "t", "description": "d"},
            headers=_auth(token),
        )
        assert r.status_code == 201
        data = r.json()
        assert data["languagePolicy"] == "OPEN"
        assert data["lockedLanguageId"] is None
        assert data["lockedLanguage"] is None

    async def test_create_open_with_locked_id_returns_400(self, async_client, async_session):
        _, token, _ = await _teacher_with_token(async_client, async_session)
        r = await async_client.post(
            "/exercises",
            json={"title": "t", "description": "d", "lockedLanguageId": 1},
            headers=_auth(token),
        )
        assert r.status_code == 400

    async def test_create_locked_without_id_returns_400(self, async_client, async_session):
        _, token, _ = await _teacher_with_token(async_client, async_session)
        r = await async_client.post(
            "/exercises",
            json={"title": "t", "description": "d", "languagePolicy": "LOCKED"},
            headers=_auth(token),
        )
        assert r.status_code == 400

    async def test_create_locked_with_other_teachers_language_returns_403(
        self, async_client, async_session
    ):
        teacher_a, _, _ = await _teacher_with_token(async_client, async_session, email="a@x.com")
        _, token_b, _ = await _teacher_with_token(async_client, async_session, email="b@x.com")
        lang = Language(owner_id=teacher_a.id, name="L", customization=CUSTOM)
        async_session.add(lang)
        await async_session.flush()
        r = await async_client.post(
            "/exercises",
            json={
                "title": "t",
                "description": "d",
                "languagePolicy": "LOCKED",
                "lockedLanguageId": lang.id,
            },
            headers=_auth(token_b),
        )
        assert r.status_code == 403

    async def test_create_locked_with_own_language_ok_and_expands(
        self, async_client, async_session
    ):
        teacher, token, _ = await _teacher_with_token(async_client, async_session)
        lang = Language(owner_id=teacher.id, name="L", customization=CUSTOM)
        async_session.add(lang)
        await async_session.flush()
        r = await async_client.post(
            "/exercises",
            json={
                "title": "t",
                "description": "d",
                "languagePolicy": "LOCKED",
                "lockedLanguageId": lang.id,
            },
            headers=_auth(token),
        )
        assert r.status_code == 201
        data = r.json()
        assert data["languagePolicy"] == "LOCKED"
        assert data["lockedLanguageId"] == lang.id
        assert data["lockedLanguage"] is not None
        assert data["lockedLanguage"]["customization"] == CUSTOM

    async def test_create_locked_with_system_language_ok(self, async_client, async_session):
        _, token, _ = await _teacher_with_token(async_client, async_session)
        result = await async_session.execute(
            select(User).where(User.role == UserRole.SYSTEM)
        )
        system_user = result.scalar_one()
        sys_lang = Language(owner_id=system_user.id, name="Oficial", customization=CUSTOM)
        async_session.add(sys_lang)
        await async_session.flush()
        r = await async_client.post(
            "/exercises",
            json={
                "title": "t",
                "description": "d",
                "languagePolicy": "LOCKED",
                "lockedLanguageId": sys_lang.id,
            },
            headers=_auth(token),
        )
        assert r.status_code == 201

    async def test_get_exercise_expands_locked_language(self, async_client, async_session):
        teacher, token, _ = await _teacher_with_token(async_client, async_session)
        lang = Language(owner_id=teacher.id, name="L", customization=CUSTOM)
        async_session.add(lang)
        await async_session.flush()
        created = await async_client.post(
            "/exercises",
            json={
                "title": "t",
                "description": "d",
                "languagePolicy": "LOCKED",
                "lockedLanguageId": lang.id,
            },
            headers=_auth(token),
        )
        ex_id = created.json()["id"]
        r = await async_client.get(f"/exercises/{ex_id}", headers=_auth(token))
        assert r.status_code == 200
        data = r.json()
        assert data["lockedLanguage"]["id"] == lang.id
        assert data["lockedLanguage"]["customization"] == CUSTOM


class TestSubmissionSnapshot:
    async def _setup_submission_target(self, async_session, with_lock_language=False):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, email="t_sub@x.com", role=UserRole.TEACHER)
        student = await create_user(async_session, org, email="s_sub@x.com")
        cls = await create_class(async_session, org, teacher)
        from app.models.class_member import ClassMember

        async_session.add(ClassMember(class_id=cls.id, student_id=student.id))
        el = await create_exercise_list(async_session, teacher)
        ex = await create_exercise(async_session, teacher)
        lock_lang = None
        if with_lock_language:
            from app.models.exercise import LanguagePolicy

            lock_lang = Language(owner_id=teacher.id, name="Lock", customization=CUSTOM)
            async_session.add(lock_lang)
            await async_session.flush()
            ex.language_policy = LanguagePolicy.LOCKED
            ex.locked_language_id = lock_lang.id
        await create_class_exercise_list(async_session, el, cls)
        await async_session.flush()
        return teacher, student, cls, el, ex, lock_lang

    async def test_open_exercise_keeps_client_snapshot(self, async_client, async_session):
        _, student, cls, el, ex, _ = await self._setup_submission_target(async_session)
        token = await get_token(async_client, student.email, "secret123")

        client_snap = {"hello": "world"}
        r = await async_client.post(
            "/submissions",
            json={
                "exercise_id": ex.id,
                "exercise_list_id": el.id,
                "class_id": cls.id,
                "code_snapshot": "code",
                "language_snapshot": client_snap,
                "status": "SUBMITTED",
            },
            headers=_auth(token),
        )
        assert r.status_code == 201
        assert r.json()["languageSnapshot"] == client_snap

    async def test_locked_exercise_overrides_snapshot(self, async_client, async_session):
        _, student, cls, el, ex, lang = await self._setup_submission_target(
            async_session, with_lock_language=True
        )
        token = await get_token(async_client, student.email, "secret123")

        client_snap = {"client": "tries-to-bypass"}
        r = await async_client.post(
            "/submissions",
            json={
                "exercise_id": ex.id,
                "exercise_list_id": el.id,
                "class_id": cls.id,
                "code_snapshot": "code",
                "language_snapshot": client_snap,
                "status": "SUBMITTED",
            },
            headers=_auth(token),
        )
        assert r.status_code == 201
        # Server replaced with the locked language's customization.
        assert r.json()["languageSnapshot"] == CUSTOM

    async def test_snapshot_immutable_after_language_update(self, async_client, async_session):
        _, student, cls, el, ex, lang = await self._setup_submission_target(
            async_session, with_lock_language=True
        )
        token = await get_token(async_client, student.email, "secret123")

        r = await async_client.post(
            "/submissions",
            json={
                "exercise_id": ex.id,
                "exercise_list_id": el.id,
                "class_id": cls.id,
                "code_snapshot": "code",
                "language_snapshot": {},
                "status": "SUBMITTED",
            },
            headers=_auth(token),
        )
        assert r.status_code == 201
        sub_id = r.json()["id"]
        original_snap = r.json()["languageSnapshot"]

        # Mutate the source language and reload submission — the snapshot must not change.
        lang.customization = {"completely": "different"}
        await async_session.flush()

        from app.models.submission import Submission

        sub = await async_session.get(Submission, sub_id)
        await async_session.refresh(sub)
        assert sub.language_snapshot == original_snap
