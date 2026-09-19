from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_session
from app.models.user import User, UserRole

# auto_error=False so we can distinguish missing credentials (403) from invalid token (401)
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> int:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    try:
        payload = decode_access_token(credentials.credentials)
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return int(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# scope="function": o teardown do get_session (o commit) roda logo que a
# funcao da rota retorna, ANTES de a resposta ser enviada. Com o escopo padrao
# ("request") o commit rodava depois do envio, e o cliente podia receber o 201
# de uma escrita e disparar a proxima requisicao antes de o commit ficar
# visivel para outra conexao do pool -- a leitura seguinte dava 404. Medido
# na suite E2E: ~37% das rodadas tinham ao menos um 404 desse tipo.
SessionDep = Annotated[AsyncSession, Depends(get_session, scope="function")]
CurrentUserIdDep = Annotated[int, Depends(get_current_user_id)]


async def get_current_academic_user_id(
    user_id: CurrentUserIdDep,
    session: SessionDep,
) -> int:
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role not in (UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Academic access is not available for this account",
        )
    return user_id


AcademicUserIdDep = Annotated[int, Depends(get_current_academic_user_id)]
