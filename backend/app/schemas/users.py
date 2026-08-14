from app.schemas.base import CamelModel
from app.models.user import UserRole


class UserResponse(CamelModel):
    id: int
    organization_id: int | None
    role: UserRole
    email: str
    name: str
    avatar_url: str | None = None
    bio: str | None = None


class UserUpdate(CamelModel):
    name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
