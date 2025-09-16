from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.orm import Session
import os

from app.db import get_db
from app.services.auth_reset import (
    ForgotPasswordRequest, ResetPasswordRequest,
    create_reset_token, verify_reset_token, mark_token_used, send_reset_email
)
from app.models.entities import User
from app.services.auth import get_password_hash  # já usado no login/register

router = APIRouter(tags=["auth"])

def _get_frontend_reset_url(token_plain: str) -> str:
    # Rota do seu front: ex. http://localhost:5173/reset?token=...
    base = os.getenv("FRONTEND_RESET_URL", "http://localhost:5173/reset-password")
    sep = "&" if "?" in base else "?"
    return f"{base}{sep}token={token_plain}"

@router.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest,
                    background: BackgroundTasks,
                    db: Session = Depends(get_db)):
    user: User | None = db.query(User).filter(User.email == payload.email).first()

    # Resposta sempre 200 para evitar enumeração de e-mail
    if user:
        token_plain = create_reset_token(db, user)
        link = _get_frontend_reset_url(token_plain)
        background.add_task(send_reset_email, user.email, link)

    return {"message": "Se o e-mail existir, enviaremos instruções para redefinir a senha."}

@router.post("/auth/reset-password")
def reset_password(payload: ResetPasswordRequest,
                   db: Session = Depends(get_db)):
    prt = verify_reset_token(db, payload.token)
    if not prt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Token inválido ou expirado.")

    user: User | None = db.query(User).filter(User.id == prt.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    user.password_hash = get_password_hash(payload.new_password)


    db.add(user)
    mark_token_used(db, prt)

    return {"message": "Senha alterada com sucesso."}
