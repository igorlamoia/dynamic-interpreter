from typing import Annotated, Literal

from fastapi import APIRouter, Query

from app.core.dependencies import CurrentUserIdDep, SessionDep
from app.modules.languages.service import (
    clone_language,
    create_language,
    delete_language,
    get_language,
    list_public_languages,
    list_my_languages,
    set_language_publication,
    update_language,
)
from app.schemas.languages import (
    LanguageCreate,
    LanguageResponse,
    LanguagePublicationUpdate,
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


@router.get("/community", response_model=list[LanguageSummary])
async def community_list_endpoint(
    user_id: CurrentUserIdDep,
    session: SessionDep,
    q: Annotated[str | None, Query(max_length=100)] = None,
    typing: Literal["typed", "untyped"] | None = None,
    array: Literal["fixed", "dynamic"] | None = None,
    block: Literal["delimited", "indentation"] | None = None,
    semicolon: Literal["optional-eol", "required"] | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 24,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    del user_id  # autenticação obrigatória; o catálogo é igual para todos.
    return await list_public_languages(
        session,
        query=q,
        typing=typing,
        array=array,
        block=block,
        semicolon=semicolon,
        limit=limit,
        offset=offset,
    )


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


@router.put("/{language_id}/publication", response_model=LanguageResponse)
async def publication_endpoint(
    language_id: int,
    data: LanguagePublicationUpdate,
    user_id: CurrentUserIdDep,
    session: SessionDep,
):
    return await set_language_publication(
        language_id, data.is_public, user_id, session
    )


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


@router.post("/{language_id}/import", response_model=LanguageResponse, status_code=201)
async def import_endpoint(
    language_id: int, user_id: CurrentUserIdDep, session: SessionDep
):
    return await clone_language(language_id, user_id, session)
