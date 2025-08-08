from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserCreate, Token
from app.services.auth_service import register_user, authenticate_user
from app.db.base import get_db
from app.core.config import settings
from app.core.security import oauth2_scheme, create_access_token
from app.db.models import User
from sqlalchemy.future import select
import httpx

router = APIRouter(prefix="/auth", tags=["auth"])

# Endpoint existente de cadastro
@router.post("/register", response_model=dict)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await register_user(user, db)

# Endpoint existente de login
@router.post("/login", response_model=Token)
async def login(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await authenticate_user(user.email, user.password, db)

# Endpoint para iniciar o fluxo OAuth2 (Google)
@router.get("/google/login")
async def google_login():
    return {
        "url": f"https://accounts.google.com/o/oauth2/v2/auth?"
               f"client_id={settings.GOOGLE_CLIENT_ID}&"
               f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
               f"response_type=code&"
               f"scope=openid%20email%20profile&"
               f"access_type=offline"
    }

# Endpoint para lidar com o callback do Google
@router.get("/google/callback", response_model=Token)
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    # Trocar o código por um token de acesso
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Falha ao obter token do Google")

        token_data = token_response.json()
        access_token = token_data.get("access_token")

        # Obter informações do usuário
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Falha ao obter informações do usuário")

        user_data = user_response.json()
        email = user_data.get("email")

        # Verificar se o usuário existe no banco
        result = await db.execute(select(User).filter(User.email == email))
        user = result.scalars().first()

        # Se o usuário não existe, criar um novo (com senha fictícia, já que é OAuth)
        if not user:
            hashed_password = get_password_hash("oauth_dummy_password")  # Senha fictícia
            user = User(email=email, hashed_password=hashed_password)
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # Gerar token JWT
        jwt_token = create_access_token(data={"sub": email})
        return {"access_token": jwt_token, "token_type": "bearer"}