import os
import smtplib
import secrets
import hashlib
from email.message import EmailMessage
from typing import Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, EmailStr, constr
from sqlalchemy.orm import Session

from app.models.entities import User
from app.models.password_reset import PasswordResetToken
from app.services.auth import get_password_hash  
from app.db import get_db  

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: constr(min_length=8)

# ---------- Helpers ----------
def _sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def _make_token() -> str:
    # seguro e curto o suficiente para URL
    return secrets.token_urlsafe(48)

def create_reset_token(db: Session, user: User, ttl_minutes: int = None) -> str:
    token_plain = _make_token()
    token_hash = _sha256_hex(token_plain)

    minutes = ttl_minutes or int(os.getenv("RESET_TOKEN_EXPIRES_MIN", "30"))

    prt = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=minutes),
    )
    db.add(prt)
    db.commit()
    db.refresh(prt)
    return token_plain  # só retornamos o PLAIN para mandar por e-mail

def verify_reset_token(db: Session, token_plain: str) -> Optional[PasswordResetToken]:
    token_hash = _sha256_hex(token_plain)
    prt = (
        db.query(PasswordResetToken)
          .filter(PasswordResetToken.token_hash == token_hash,
                  PasswordResetToken.used == False)  # noqa: E712
          .first()
    )
    if not prt:
        return None
    if prt.expires_at < datetime.now(timezone.utc):
        return None
    return prt

def mark_token_used(db: Session, prt: PasswordResetToken) -> None:
    prt.used = True
    db.add(prt)
    db.commit()

def send_reset_email(to_email: str, reset_link: str) -> None:
    """
    Envia via SMTP se configurado; em dev, apenas imprime no console.
    """
    from_email = os.getenv("EMAIL_FROM", "no-reply@example.com")
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    pwd  = os.getenv("SMTP_PASSWORD")

    if not host or not user or not pwd:
        print(f"[DEV] Password reset link for {to_email}: {reset_link}")
        return

    msg = EmailMessage()
    msg["Subject"] = "Reset your password"
    msg["From"] = from_email
    msg["To"] = to_email
    msg.set_content(
        f"Olá!\n\nRecebemos um pedido para redefinir sua senha.\n"
        f"Acesse o link abaixo (válido por tempo limitado):\n\n{reset_link}\n\n"
        f"Se você não solicitou, ignore este e-mail."
    )

    with smtplib.SMTP(host, port) as s:
        s.starttls()
        s.login(user, pwd)
        s.send_message(msg)
