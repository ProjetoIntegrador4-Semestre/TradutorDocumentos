from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
import logging
import os
from urllib.parse import urljoin

from app.db import get_db
from app.models.entities import User
from app.services.auth import create_access_token
from app.services.oauth_google import oauth
from app.config.settings import settings

router = APIRouter(prefix="/auth/google", tags=["auth-google"])

# Config do front (pode ficar vazio em dev/backend-only)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
FRONTEND_REDIRECT_PATH = os.getenv("FRONTEND_REDIRECT_PATH", "/oauth/callback")
FRONTEND_MODE = os.getenv("FRONTEND_MODE", "").lower()  # "disabled" para forçar JSON

logger = logging.getLogger(__name__)

def _backend_only_mode(request: Request) -> bool:
    # Ativa modo JSON se:
    # - query param raw=1
    # - FRONTEND_MODE=disabled
    # - faltam FRONTEND_URL ou FRONTEND_REDIRECT_PATH
    raw = request.query_params.get("raw")
    if raw == "1":
        return True
    if FRONTEND_MODE == "disabled":
        return True
    if not FRONTEND_URL or not FRONTEND_REDIRECT_PATH:
        return True
    return False

@router.get("/login")
async def google_login(request: Request):
    """
    Inicia o OAuth no Google.
    Aceita ?redirect=<url_do_front> para guardar na sessão e priorizar no callback.
    """
    redirect_to = request.query_params.get("redirect")
    if redirect_to:
        request.session["oauth_redirect_to"] = redirect_to

    # URL de callback do PRÓPRIO backend (deve estar no Google Console)
    redirect_uri = settings.GOOGLE_REDIRECT_URI  # ex.: http://localhost:8000/auth/google/callback
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    # 1) Troca code -> token (instrumentado p/ mostrar erro real se falhar)
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        body = getattr(getattr(e, "response", None), "text", None)
        logger.exception("OAuth code->token failed. Body: %s", body)
        return JSONResponse(
            {"error": "oauth_exchange_failed", "detail": str(e), "body": body},
            status_code=500,
        )

    # 2) Userinfo
    try:
        userinfo = token.get("userinfo")
        if not userinfo:
            resp = await oauth.google.get("userinfo", token=token)
            userinfo = resp.json()
    except Exception as e:
        logger.exception("Fetching userinfo failed")
        return JSONResponse({"error": "userinfo_failed", "detail": str(e)}, status_code=500)

    email = userinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google não retornou e-mail verificado.")

    # 3) Upsert do usuário local
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, password_hash="", role="user")
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_str = create_access_token({"sub": email, "role": getattr(user, "role", "user")})

    # 4) Se estiver em modo backend-only → devolve JSON em vez de redirecionar
    if _backend_only_mode(request):
        return JSONResponse(
            {
                "access_token": jwt_str,
                "token_type": "bearer",
                "email": email,
                "name": userinfo.get("name"),
                "backend_only": True,
            }
        )

    # 5) Redireciono para o front quando houver
    redirect_override = request.session.pop("oauth_redirect_to", None)
    base = FRONTEND_URL.rstrip("/") + "/"
    path = (redirect_override or FRONTEND_REDIRECT_PATH).lstrip("/")
    frontend_cb = urljoin(base, path)
    redirect_url = f"{frontend_cb}#access_token={jwt_str}&token_type=bearer"
    logger.info("OAuth Google redirect -> %s", redirect_url)
    return JSONResponse({"access_token": jwt_str, "token_type": "bearer", "email": email})

