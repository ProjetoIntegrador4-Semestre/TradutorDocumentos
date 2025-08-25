from fastapi import FastAPI
from app.routes import routes_translation
from app.config.settings import settings
from app.db import engine
from app.models.entities import Base

app = FastAPI(title=settings.PROJECT_NAME)


app.include_router(routes_translation.router, prefix="/api", tags=["Translation"])

@app.get("/")
def home():
    return {"message": "Translation API is running!"}
