from sqlalchemy.orm import Session
from app.db import models
from app.utils.roles import Role
from app.core.security import get_password_hash

def init_db(db: Session, init_admin_email: str | None, init_admin_password: str | None):
    if not init_admin_email or not init_admin_password:
        return
    admin = db.query(models.User).filter(models.User.email == init_admin_email).first()
    if not admin:
        admin = models.User(
            email=init_admin_email,
            full_name="Admin",
            role=Role.admin,
            hashed_password=get_password_hash(init_admin_password),
        )
        db.add(admin)
        db.commit()