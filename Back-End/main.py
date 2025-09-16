from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.routes import routes_translation
import os
from app.db import engine
from app.models.entities import Base
from app.routes import routes_auth
from app.routes import routes_auth_google
from app.routes import routes_password
from starlette.middleware.sessions import SessionMiddleware
from app.config.settings import settings  


PROJECT_NAME = os.getenv("PROJECT_NAME", "Translation API")
app = FastAPI(title=PROJECT_NAME, swagger_ui_parameters={"persistAuthorization": True},)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,  
    same_site="lax",                 
    https_only=False                 
)

app.include_router(routes_auth.router)
app.include_router(routes_translation.router, tags=["Translation"])
app.include_router(routes_auth_google.router)
app.include_router(routes_password.router)

@app.get("/")
def home():
    return {"message": "Translation API is running!"}


def add_bearer_to_openapi(app: FastAPI):
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        schema = get_openapi(title=app.title, version=app.version, routes=app.routes)
        schema["security"] = [{"HTTPBearer": []}]
        app.openapi_schema = schema
        return app.openapi_schema

    app.openapi = custom_openapi

add_bearer_to_openapi(app)
