from pydantic import BaseModel, ConfigDict
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
