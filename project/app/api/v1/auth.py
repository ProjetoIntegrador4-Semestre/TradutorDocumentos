from fastapi import APIRouter, Depends
from app.models.user import UserCreate, Token
from app.services.auth_service import register_user, authenticate_user
from app.db.base import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=dict)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await register_user(user, db)

@router.post("/login", response_model=Token)
async def login(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await authenticate_user(user.email, user.password, db)