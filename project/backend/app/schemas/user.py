from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.utils.roles import Role

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(min_length=8)

class UserOut(UserBase):
    id: int
    role: Role
    is_active: bool

class Config:
    from_attributes = True