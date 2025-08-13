from fastapi import APIRouter
from app.models.translation import TranslationRequest, TranslationResponse
from app.services.translator import translate_text

router = APIRouter()

@router.post("/translate", response_model=TranslationResponse)
def translate(request: TranslationRequest):
    result = translate_text(request.text, request.target_lang)
    return result
