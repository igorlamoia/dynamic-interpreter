from fastapi import APIRouter

from app.core.dependencies import SessionDep, CurrentUserIdDep
from app.modules.languages.service import get_active_language, set_active_language
from app.modules.users.service import get_user_by_id, update_user, list_users
from app.schemas.languages import ActiveLanguageUpdate, LanguageResponse
from app.schemas.users import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
async def list_users_endpoint(user_id: CurrentUserIdDep, session: SessionDep):
    return await list_users(user_id, session)


@router.get("/me/active-language", response_model=LanguageResponse | None)
async def get_active_language_endpoint(user_id: CurrentUserIdDep, session: SessionDep):
    return await get_active_language(user_id, session)


@router.put("/me/active-language", response_model=LanguageResponse | None)
async def set_active_language_endpoint(
    data: ActiveLanguageUpdate, user_id: CurrentUserIdDep, session: SessionDep
):
    return await set_active_language(user_id, data.language_id, session)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, current_user_id: CurrentUserIdDep, session: SessionDep):
    return await get_user_by_id(user_id, session)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user_endpoint(
    user_id: int, data: UserUpdate, current_user_id: CurrentUserIdDep, session: SessionDep
):
    return await update_user(user_id, current_user_id, data, session)
