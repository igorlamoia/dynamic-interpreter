import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient

from app.models.user import UserRole
from tests.factories import create_organization, create_user

pytestmark = pytest.mark.asyncio

MINIMAL_CUSTOMIZATION = {
    "mappings": [],
    "operatorWordMap": {},
    "booleanLiteralMap": {"true": "true", "false": "false"},
    "statementTerminatorLexeme": ";",
    "blockDelimiters": {"open": "{", "close": "}"},
    "modes": {"semicolon": "required", "block": "braces", "typing": "static", "array": "brackets"},
    "languageDocumentation": {},
}


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _login(async_client: AsyncClient, async_session, email: str = "id@example.com") -> str:
    org = await create_organization(async_session)
    await create_user(
        async_session, org, email=email,
        password="secret123", role=UserRole.STUDENT,
    )
    response = await async_client.post(
        "/auth/login", json={"email": email, "password": "secret123"}
    )
    return response.json()["accessToken"]


class TestPresentationFields:
    async def test_create_persists_presentation_fields(self, async_client, async_session):
        token = await _login(async_client, async_session)

        response = await async_client.post(
            "/languages",
            json={
                "name": "Gatinho",
                "customization": MINIMAL_CUSTOMIZATION,
                "imageUrl": "https://cdn.example/gato.png",
                "imageQuery": "gato",
                "presetId": "ptbr",
            },
            headers=_auth(token),
        )

        assert response.status_code == 201
        body = response.json()
        assert body["imageUrl"] == "https://cdn.example/gato.png"
        assert body["imageQuery"] == "gato"
        assert body["presetId"] == "ptbr"

    async def test_presentation_fields_default_to_null(self, async_client, async_session):
        token = await _login(async_client, async_session, "null@example.com")

        response = await async_client.post(
            "/languages",
            json={"name": "Sem imagem", "customization": MINIMAL_CUSTOMIZATION},
            headers=_auth(token),
        )

        assert response.status_code == 201
        body = response.json()
        assert body["imageUrl"] is None
        assert body["imageQuery"] is None
        assert body["presetId"] is None

    async def test_update_changes_presentation_fields(self, async_client, async_session):
        token = await _login(async_client, async_session, "upd@example.com")
        created = await async_client.post(
            "/languages",
            json={
                "name": "Antes",
                "customization": MINIMAL_CUSTOMIZATION,
                "imageUrl": "https://cdn.example/antes.png",
                "presetId": "free",
            },
            headers=_auth(token),
        )
        language_id = created.json()["id"]

        response = await async_client.patch(
            f"/languages/{language_id}",
            json={"imageUrl": "https://cdn.example/depois.png"},
            headers=_auth(token),
        )

        assert response.status_code == 200
        body = response.json()
        assert body["imageUrl"] == "https://cdn.example/depois.png"
        # Campos não enviados permanecem intactos.
        assert body["presetId"] == "free"

    async def test_clone_copies_presentation_fields(self, async_client, async_session):
        token = await _login(async_client, async_session, "clone@example.com")
        created = await async_client.post(
            "/languages",
            json={
                "name": "Original",
                "customization": MINIMAL_CUSTOMIZATION,
                "imageUrl": "https://cdn.example/orig.png",
                "imageQuery": "original",
                "presetId": "ptbr",
            },
            headers=_auth(token),
        )
        language_id = created.json()["id"]

        response = await async_client.post(
            f"/languages/{language_id}/clone", headers=_auth(token)
        )

        assert response.status_code == 201
        body = response.json()
        assert body["imageUrl"] == "https://cdn.example/orig.png"
        assert body["imageQuery"] == "original"
        assert body["presetId"] == "ptbr"
        assert body["clonedFromId"] == language_id

    async def test_summary_exposes_only_image_url(self, async_client, async_session):
        token = await _login(async_client, async_session, "sum@example.com")
        await async_client.post(
            "/languages",
            json={
                "name": "Resumo",
                "customization": MINIMAL_CUSTOMIZATION,
                "imageUrl": "https://cdn.example/resumo.png",
                "imageQuery": "resumo",
                "presetId": "ptbr",
            },
            headers=_auth(token),
        )

        response = await async_client.get("/languages", headers=_auth(token))

        assert response.status_code == 200
        entry = response.json()[0]
        assert entry["imageUrl"] == "https://cdn.example/resumo.png"
        assert "imageQuery" not in entry
        assert "presetId" not in entry
        assert "customization" not in entry
