from datetime import datetime
from typing import Any

from app.schemas.base import CamelModel


class LanguageCreate(CamelModel):
    name: str
    description: str | None = None
    customization: dict[str, Any]
    image_url: str | None = None
    image_query: str | None = None
    preset_id: str | None = None


class LanguageUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    customization: dict[str, Any] | None = None
    image_url: str | None = None
    image_query: str | None = None
    preset_id: str | None = None


class LanguageSummary(CamelModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    image_url: str | None
    cloned_from_id: int | None
    updated_at: datetime


class LanguageResponse(CamelModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    customization: dict[str, Any]
    image_url: str | None
    image_query: str | None
    preset_id: str | None
    cloned_from_id: int | None
    created_at: datetime
    updated_at: datetime


class ActiveLanguageUpdate(CamelModel):
    language_id: int | None = None
