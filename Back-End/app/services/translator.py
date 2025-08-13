from deep_translator import GoogleTranslator
from langdetect import detect

def translate_text(text: str, target_lang: str):
    try:
        # Detecta o idioma automaticamente
        detected_lang = detect(text)
        
        # Tradução
        translated = GoogleTranslator(source='auto', target=target_lang).translate(text)
        
        return {
            "original_text": text,
            "detected_lang": detected_lang,
            "translated_text": translated,
            "target_lang": target_lang
        }
    except Exception as e:
        return {
            "error": f"Translation failed: {str(e)}"
        }
