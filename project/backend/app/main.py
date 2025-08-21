from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.db.session import engine, SessionLocal
from app.db import models
from app.db.init_db import init_db

from app.api import auth as auth_router
from app.api import users as users_router
from app.api import protected as protected_router
from app.api import oauth_google as oauth_google_router

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(o) for o in settings.CORS_ORIGINS] or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ADICIONE a SessionMiddleware ASSIM (sem passar `app=...`)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.JWT_SECRET,
    # opcional:
    same_site="lax",
    https_only=False,  # True em produção com HTTPS
)

@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        init_db(db, settings.INIT_ADMIN_EMAIL, settings.INIT_ADMIN_PASSWORD)
    finally:
        db.close()

# Rotas
app.include_router(auth_router.router)
app.include_router(oauth_google_router.router)
app.include_router(users_router.router)
app.include_router(protected_router.router)

@app.get("/health")
def health():
    return {"status": "ok"}
