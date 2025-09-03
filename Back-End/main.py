from fastapi import FastAPI
from app.routes import routes_translation
import os
from app.db import engine
from app.models.entities import Base
from app.routes import routes_auth
from app.routes import routes_auth_google
from starlette.middleware.sessions import SessionMiddleware
from app.config.settings import settings  


PROJECT_NAME = os.getenv("PROJECT_NAME", "Translation API")
app = FastAPI(title=PROJECT_NAME)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,  
    same_site="lax",                 
    https_only=False                 
)

app.include_router(routes_auth.router)
app.include_router(routes_translation.router, prefix="/api", tags=["Translation"])
app.include_router(routes_auth_google.router)


@app.get("/")
def home():
    return {"message": "Translation API is running!"}
