from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, require_roles
from app.utils.roles import Role
from app.db import models

router = APIRouter(prefix="/protected", tags=["protected"])

@router.get("/ping")
def ping(_: models.User = Depends(get_current_user)):
    return {"message": "pong (auth ok)"}

@router.get("/admin-only")
def admin_only(_: models.User = Depends(require_roles(Role.admin))):
    return {"secret": "apenas admins"}