from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
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

# Para onde o backend deve devolver o usuário depois do OAuth
FRONTEND_URL = os.getenv("FRONTEND_URL")
FRONTEND_REDIRECT_PATH = os.getenv("FRONTEND_REDIRECT_PATH")

logger = logging.getLogger(__name__)

@router.get("/login")
async def google_login(request: Request):
    """
    Inicia o OAuth no Google.
    Aceita opcionalmente ?redirect=<url_do_front>, que é guardado na sessão
    e usado no callback para priorizar o destino.
    """
    redirect_to = request.query_params.get("redirect")
    if redirect_to:
        request.session["oauth_redirect_to"] = redirect_to

    # URL de callback do PRÓPRIO backend (deve estar no Google Console)
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)

    userinfo = token.get("userinfo")
    if not userinfo:
        resp = await oauth.google.get("userinfo", token=token)
        userinfo = resp.json()

    email = userinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google não retornou e-mail verificado.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, password_hash="", role="user") 
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_str = create_access_token({"sub": email, "role": getattr(user, "role", "user")})

    redirect_override = request.session.pop("oauth_redirect_to", None)
    base = FRONTEND_URL.rstrip("/") + "/"
    path = (redirect_override or FRONTEND_REDIRECT_PATH).lstrip("/")
    frontend_cb = urljoin(base, path)

    redirect_url = f"{frontend_cb}#access_token={jwt_str}&token_type=bearer"
    logger.info("OAuth Google redirect -> %s", redirect_url)
    return RedirectResponse(redirect_url, status_code=302)
