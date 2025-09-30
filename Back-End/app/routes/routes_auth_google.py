
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

FRONTEND_URL = os.getenv("FRONTEND_URL", "")                     # ex.: "http://localhost:8081"
FRONTEND_REDIRECT_PATH = os.getenv("FRONTEND_REDIRECT_PATH", "/oauth-google")
# Para forçar resposta em JSON (sem redirecionar), defina FRONTEND_MODE=disabled
FRONTEND_MODE = os.getenv("FRONTEND_MODE", "").lower()

logger = logging.getLogger(__name__)


def _backend_only_mode(request: Request) -> bool:
    """Retorna True quando devemos responder em JSON em vez de redirecionar."""
    # query param raw=1 força JSON
    if request.query_params.get("raw") == "1":
        return True
    # variável de ambiente força JSON
    if FRONTEND_MODE == "disabled":
        return True
    # Se não temos nem FRONTEND_URL/DEFAULT_PATH nem redirect salvo em sessão,
    # não temos para onde redirecionar: mantém JSON.
    if not FRONTEND_URL and not request.session.get("oauth_redirect_to"):
        return True
    return False


@router.get("/login")
async def google_login(request: Request, redirect: str | None = None):
    """
    Inicia o OAuth no Google.
    Aceita ?redirect=<url_do_front> para guardar na sessão e priorizar no callback.
    """
    if redirect:
        # salva o destino para usar no callback
        request.session["oauth_redirect_to"] = redirect

    # URL de callback do PRÓPRIO backend (deve estar registrada no Google Console)
    # Ex.: http://localhost:8000/auth/google/callback
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    # 1) Troca code -> token
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
        userinfo = token.get("userinfo") if isinstance(token, dict) else None
        if not userinfo:
            resp = await oauth.google.get("userinfo", token=token)
            userinfo = resp.json()
    except Exception as e:
        logger.exception("Fetching userinfo failed")
        return JSONResponse({"error": "userinfo_failed", "detail": str(e)}, status_code=500)

    email = (userinfo or {}).get("email")
    name = (userinfo or {}).get("name")
    if not email:
        raise HTTPException(status_code=400, detail="Google não retornou e-mail verificado.")

    # 3) Upsert do usuário local
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, password_hash="", role="user")
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4) Gera JWT local
    jwt_str = create_access_token({"sub": email, "role": getattr(user, "role", "user")})

    # 5) Se estivermos em modo backend-only, devolve JSON (comporta-se como antes)
    if _backend_only_mode(request):
        return JSONResponse(
            {
                "access_token": jwt_str,
                "token_type": "bearer",
                "email": email,
                "name": name,
                "backend_only": True,
            }
        )

    # 6) Monta URL de redirecionamento para o front
    redirect_override = request.session.pop("oauth_redirect_to", None)
    if redirect_override:
        frontend_cb = redirect_override
    else:
        base = FRONTEND_URL.rstrip("/") + "/" if FRONTEND_URL else ""
        path = FRONTEND_REDIRECT_PATH.lstrip("/")
        frontend_cb = urljoin(base, path) if base else ""

    # Preferimos devolver no hash (#) para não expor o token nos logs de servidor/proxy
    if frontend_cb:
        redirect_url = f"{frontend_cb}#access_token={jwt_str}&token_type=bearer&email={email}"
        logger.info("OAuth Google redirect -> %s", redirect_url)
        return RedirectResponse(redirect_url, status_code=302)

    # Fallback final: Se ainda assim não temos destino, responde JSON
    return JSONResponse({"access_token": jwt_str, "token_type": "bearer", "email": email, "name": name})
