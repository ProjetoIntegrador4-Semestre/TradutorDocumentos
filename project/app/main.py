from fastapi import FastAPI
from app.api.v1.auth import router as auth_router

app = FastAPI(title="Sistema de Autenticação JWT")

app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "Bem-vindo à API de autenticação"}