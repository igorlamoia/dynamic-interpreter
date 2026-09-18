from typing import Generic, TypeVar
from app.schemas.base import CamelModel

T = TypeVar("T")


class PaginatedResponse(CamelModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
