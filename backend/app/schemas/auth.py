from typing import Literal

from pydantic import EmailStr, model_validator
from app.schemas.base import CamelModel


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
