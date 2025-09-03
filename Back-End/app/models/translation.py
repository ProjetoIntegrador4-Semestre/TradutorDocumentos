from pydantic import BaseModel

class TranslationRequest(BaseModel):
    text: str
    target_lang: str

class TranslationResponse(BaseModel):
    original_text: str
    detected_lang: str
    translated_text: str
    target_lang: str
