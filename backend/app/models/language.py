from datetime import datetime
from typing import TYPE_CHECKING, Any
from sqlalchemy import Integer, String, ForeignKey, UniqueConstraint, Index, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


# JSONB on Postgres, JSON elsewhere (tests use SQLite).
JSONType = JSON().with_variant(JSONB(), "postgresql")


class Language(Base):
    __tablename__ = "languages"
    __table_args__ = (
        UniqueConstraint("owner_id", "name", name="uq_languages_owner_name"),
        Index("ix_languages_owner_id", "owner_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    customization: Mapped[dict[str, Any]] = mapped_column(JSONType, nullable=False)
    cloned_from_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("languages.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    owner: Mapped["User"] = relationship(
        "User", back_populates="languages", foreign_keys=[owner_id]
    )
    cloned_from: Mapped["Language | None"] = relationship(
        "Language", remote_side="Language.id"
    )
