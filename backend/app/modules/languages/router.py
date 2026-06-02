from fastapi import APIRouter

from app.core.dependencies import CurrentUserIdDep, SessionDep
from app.modules.languages.service import (
    clone_language,
    create_language,
    delete_language,
    get_language,
    list_my_languages,
    update_language,
)
from app.schemas.languages import (
    LanguageCreate,
    LanguageResponse,
    LanguageSummary,
    LanguageUpdate,
)

router = APIRouter(prefix="/languages", tags=["languages"])


@router.get("", response_model=list[LanguageSummary])
async def list_endpoint(user_id: CurrentUserIdDep, session: SessionDep):
    return await list_my_languages(user_id, session)


@router.post("", response_model=LanguageResponse, status_code=201)
async def create_endpoint(
    data: LanguageCreate, user_id: CurrentUserIdDep, session: SessionDep
):
    return await create_language(data, user_id, session)


@router.get("/{language_id}", response_model=LanguageResponse)
async def get_endpoint(
    language_id: int, user_id: CurrentUserIdDep, session: SessionDep
):
    return await get_language(language_id, user_id, session)


@router.patch("/{language_id}", response_model=LanguageResponse)
async def update_endpoint(
    language_id: int,
    data: LanguageUpdate,
    user_id: CurrentUserIdDep,
    session: SessionDep,
):
    return await update_language(language_id, data, user_id, session)


@router.delete("/{language_id}", status_code=204)
async def delete_endpoint(
    language_id: int, user_id: CurrentUserIdDep, session: SessionDep
):
    await delete_language(language_id, user_id, session)


@router.post("/{language_id}/clone", response_model=LanguageResponse, status_code=201)
async def clone_endpoint(
    language_id: int, user_id: CurrentUserIdDep, session: SessionDep
):
    return await clone_language(language_id, user_id, session)
