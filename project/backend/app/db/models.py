from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base
from app.utils.roles import Role

class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Senha pode ser None para contas OAuth
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)

    role: Mapped[Role] = mapped_column(Enum(Role), nullable=False, default=Role.user)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    oauth_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    oauth_sub: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)