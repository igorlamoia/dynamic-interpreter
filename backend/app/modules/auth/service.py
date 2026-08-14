from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password, create_access_token
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse


async def register_user(data: RegisterRequest, session: AsyncSession) -> TokenResponse:
    if data.organization_id is not None:
        org = await session.get(Organization, data.organization_id)
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found",
            )

    # Verificar email duplicado
    existing = await session.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # Criar usuário
    user = User(
        organization_id=data.organization_id,
        role={
            "student": UserRole.STUDENT,
            "teacher": UserRole.TEACHER,
            "community": UserRole.COMMUNITY,
        }[data.role],
        email=data.email,
        password=hash_password(data.password),
        name=data.name,
    )
    session.add(user)
    await session.flush()

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


async def login_user(data: LoginRequest, session: AsyncSession) -> TokenResponse:
    result = await session.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


async def get_current_user(user_id: str, session: AsyncSession) -> User:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
