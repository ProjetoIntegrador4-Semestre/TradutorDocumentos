from fastapi import FastAPI
from app.routes import routes_translation
import os
from app.db import engine
from app.models.entities import Base

PROJECT_NAME = os.getenv("PROJECT_NAME", "Translation API")
app = FastAPI(title=PROJECT_NAME)


app.include_router(routes_translation.router, prefix="/api", tags=["Translation"])

@app.get("/")
def home():
    return {"message": "Translation API is running!"}
