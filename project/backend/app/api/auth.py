from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import Token
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/sign-up", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def sign_up(payload: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(models.User).filter(models.User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email já está em uso")

    user = models.User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),    
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/sign-in")

@router.post("/sign-in", response_model=Token)
def sign_in(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm usa campo "username" (aqui tratamos como email)
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Conta desativada")

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return Token(access_token=access, refresh_token=refresh)

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    # Validação simples via decode em dependency (implementado em deps)
    from app.api.deps import get_user_from_refresh_token

    user = get_user_from_refresh_token(refresh_token, db)
    access = create_access_token(str(user.id))
    new_refresh = create_refresh_token(str(user.id))
    return Token(access_token=access, refresh_token=new_refresh)