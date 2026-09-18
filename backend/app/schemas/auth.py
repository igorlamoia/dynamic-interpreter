from typing import Literal

from pydantic import EmailStr, model_validator
from app.schemas.base import CamelModel
from app.schemas.users import UserResponse


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class RegisterRequest(CamelModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["student", "teacher", "community"] = "student"
    organization_id: int | None = None

    @model_validator(mode="after")
    def validate_organization_for_role(self):
        if self.role != "community" and self.organization_id is None:
            raise ValueError("organizationId is required for students and teachers")
        return self


class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"
    # O frontend ja lia `data.user` em login.tsx:48 e register.tsx:50, e o
    # AuthContext curto-circuita quando o recebe. Sem este campo ele era
    # sempre undefined, forcando um GET /auth/me logo apos o register --
    # requisicao que corria com o commit e devolvia 404 em ~7% dos cadastros,
    # fazendo o AuthContext limpar o token e jogar o usuario de volta ao login.
    user: UserResponse
