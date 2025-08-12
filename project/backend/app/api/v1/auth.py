from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserCreate, Token, UserResponse
from app.services.auth_service import register_user, authenticate_user
from app.db.base import get_db
from app.core.config import settings
from app.core.security import oauth2_scheme, create_access_token, get_password_hash
from app.db.models import User
from app.dependencies.auth import get_current_user, get_current_admin
from sqlalchemy.future import select
import httpx
from jose import JWTError, jwt

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=dict)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await register_user(user, db)

@router.post("/login", response_model=Token)
async def login(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await authenticate_user(user.email, user.password, db)

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

@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
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

        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Falha ao obter informações do usuário")

        user_data = user_response.json()
        email = user_data.get("email")
        name = user_data.get("name", "Google User")  # Default name if not provided

        result = await db.execute(select(User).filter(User.email == email))
        user = result.scalars().first()

        if not user:
            hashed_password = get_password_hash("oauth_dummy_password")
            user = User(name=name, email=email, hashed_password=hashed_password, role="employee")
            db.add(user)
            await db.commit()
            await db.refresh(user)

        jwt_token = create_access_token(data={"sub": user.email, "role": user.role})
        frontend_callback_url = f"http://localhost:3000/auth/google/callback?token={jwt_token}"
        return RedirectResponse(url=frontend_callback_url)

@router.get("/me")
async def get_current_user(user: User = Depends(get_current_user)):
    return {"name": user.name, "email": user.email, "role": user.role}

@router.get("/users", response_model=list[UserResponse])
async def list_users(_: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [{"name": user.name, "email": user.email, "role": user.role} for user in users]

@router.put("/users/{user_id}/role")
async def update_user_role(user_id: int, new_role: str, _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    if new_role not in ["admin", "employee"]:
        raise HTTPException(status_code=400, detail="Role inválido")
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    user.role = new_role
    await db.commit()
    await db.refresh(user)
    return {"name": user.name, "email": user.email, "role": user.role}