from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import UserCreate
from app.db.models import User
import logging

# Configurar logging para depuração
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def register_user(user: UserCreate, db: AsyncSession):
    logger.info(f"Tentando registrar usuário com email: {user.email}")
    # Verificar se o email já existe
    result = await db.execute(select(User).filter(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        logger.warning(f"Email já cadastrado: {user.email}")
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Criar novo usuário
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    try:
        await db.commit()
        await db.refresh(db_user)
        logger.info(f"Usuário registrado com sucesso: {db_user.email}")
        return {"email": db_user.email}
    except Exception as e:
        logger.error(f"Erro ao salvar usuário: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar usuário: {str(e)}")

async def authenticate_user(email: str, password: str, db: AsyncSession):
    logger.info(f"Tentando autenticar usuário com email: {email}")
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if not user or not verify_password(password, user.hashed_password):
        logger.warning(f"Falha na autenticação para email: {email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    logger.info(f"Token gerado para usuário: {email}")
    return {"access_token": access_token, "token_type": "bearer"}