import pytest
from httpx import AsyncClient

from tests.factories import create_organization


async def test_list_organizations_returns_only_system_when_no_orgs_created(
    async_client: AsyncClient, async_session
):
    """Baseline has the seeded System organization; no other orgs are visible."""
    response = await async_client.get("/organizations")
    assert response.status_code == 200
    data = response.json()
    names = {item["name"] for item in data}
    assert names == {"System"}


async def test_list_organizations_returns_all_orgs(async_client: AsyncClient, async_session):
    org1 = await create_organization(async_session, name="Org Alpha")
    org2 = await create_organization(async_session, name="Org Beta")

    response = await async_client.get("/organizations")
    assert response.status_code == 200

    data = response.json()
    ids = {item["id"] for item in data}
    names = {item["name"] for item in data}

    assert org1.id in ids
    assert org2.id in ids
    assert "Org Alpha" in names
    assert "Org Beta" in names
    # System organization is part of the baseline seed.
    assert "System" in names


async def test_list_organizations_no_auth_required(async_client: AsyncClient):
    # No Authorization header — endpoint must still return 200
    response = await async_client.get("/organizations")
    assert response.status_code == 200
