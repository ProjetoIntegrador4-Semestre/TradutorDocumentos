from fastapi import APIRouter, Depends, HTTPException, Request
from starlette.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.entities import User
from app.services.auth import create_access_token
from app.services.oauth_google import oauth
from app.config.settings import settings

router = APIRouter(prefix="/auth/google", tags=["auth-google"])

@router.get("/login")
async def google_login(request: Request):
    # redireciona para o Google
    return await oauth.google.authorize_redirect(
        request, settings.GOOGLE_REDIRECT_URI
    )

@router.get("/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)

    # Em OIDC, o userinfo pode não vir no token; buscamos explicitamente:
    userinfo = token.get("userinfo")
    if not userinfo:
        resp = await oauth.google.get("userinfo", token=token)
        userinfo = resp.json()

    email = userinfo.get("email")
    if not email:
        raise HTTPException(400, detail="Google não retornou e-mail verificado")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, password_hash="", role="user")
        db.add(user); db.commit(); db.refresh(user)

    app_token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": app_token, "token_type": "bearer"}
