from fastapi import APIRouter, Depends
from starlette.requests import Request
from starlette.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth, OAuthError
from urllib.parse import quote
from starlette.status import HTTP_302_FOUND

from app.core.config import settings
from app.db.session import get_db
from app.db import models
from app.core.security import create_access_token, create_refresh_token
from app.utils.roles import Role

router = APIRouter(tags=["oauth"])

oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
    api_base_url="https://openidconnect.googleapis.com/v1/",
)

@router.get("/auth/google/login")
async def google_login(request: Request):
    # Se quiser forçar id_token, use nonce (ver bloco opcional mais abaixo)
    return await oauth.google.authorize_redirect(request, settings.GOOGLE_REDIRECT_URI)

@router.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as e:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error={quote(str(e.error))}"
        )

    # 1) Tenta via id_token (só se existir)
    user_info = None
    if token and token.get("id_token"):
        try:
            user_info = await oauth.google.parse_id_token(request, token)
        except Exception:
            user_info = None

    # 2) Fallback: chama o endpoint /userinfo (sempre funciona com access_token)
    if not user_info:
        try:
            resp = await oauth.google.get("userinfo", token=token)
            user_info = resp.json()
        except Exception:
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/login?error={quote('Falha ao obter userinfo')}",
                status_code=HTTP_302_FOUND,
            )

    email = user_info.get("email")
    sub = user_info.get("sub") or user_info.get("id")
    name = user_info.get("name") or user_info.get("given_name")

    if not email or not sub:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error={quote('Resposta do Google incompleta')}"
        )

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            email=email,
            full_name=name,
            role=Role.user,
            oauth_provider="google",
            oauth_sub=sub,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.oauth_provider:
            user.oauth_provider = "google"
            user.oauth_sub = sub
            db.commit()

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))

    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth/google/callback?token={quote(access)}&refresh={quote(refresh)}"
    )
