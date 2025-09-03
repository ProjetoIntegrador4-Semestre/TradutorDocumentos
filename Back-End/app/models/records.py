from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Literal, Optional



class TranslationRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # permite devolver objetos ORM direto
    id: int
    original_filename: str
    file_type: Literal["DOCX", "PPTX", "PDF", "UNKNOWN"]
    detected_lang: Optional[str] = None
    target_lang: str
    created_at: datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str | None = "user"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"