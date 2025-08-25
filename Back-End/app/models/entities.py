# app/models/entities.py
from __future__ import annotations
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, DateTime, Integer, func

class Base(DeclarativeBase):
    """Base do SQLAlchemy para mapear as tabelas."""
    pass

class TranslationRecord(Base):
    __tablename__ = "translation_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False)     # DOCX/PPTX/PDF/UNKNOWN
    detected_lang: Mapped[str | None] = mapped_column(String(8))
    target_lang: Mapped[str] = mapped_column(String(8), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
