from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db import models
from app.db.session import get_db
from app.schemas.user import UserOut
from app.api.deps import get_current_user, require_roles
from app.utils.roles import Role

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_roles(Role.admin)),
):
    return db.query(models.User).all()

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_roles(Role.admin)),
):
    user = db.get(models.User, user_id)
    if not user:
        return {"deleted": False, "reason": "not_found"}
    db.delete(user)
    return {"deleted": True}