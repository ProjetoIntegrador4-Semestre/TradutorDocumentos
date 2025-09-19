from typing import List, Optional
from deep_translator import GoogleTranslator
from langdetect import detect, LangDetectException

def _normalize_lang(code: str) -> str:
    c = (code or "").strip().lower().replace("_", "-")
    return {"pt-br": "pt", "en-us": "en"}.get(c, c or "pt")

def _safe_translate(p: str, tr: GoogleTranslator) -> str:
    if not p.strip():
        return ""
    try:
        out: Optional[str] = tr.translate(p)
        return out if isinstance(out, str) else p
    except Exception:
        return p

def translate_text(text: str, target_lang: str):
    try:
        detected_lang = detect(text) if (text and text.strip()) else "unknown"
    except LangDetectException:
        detected_lang = "unknown"

    tgt = _normalize_lang(target_lang)
    tr = GoogleTranslator(source="auto", target=tgt)

    lines = (text or "").split("\n")
    paras: List[str] = []
    buf: List[str] = []
    for ln in lines:
        if ln.strip() == "":       
            if buf:
                paras.append(" ".join(buf).strip())
                buf = []
            paras.append("")       
        else:
            buf.append(ln.strip())
    if buf:
        paras.append(" ".join(buf).strip())

    # traduz cada parágrafo inteiro
    translated: List[str] = [_safe_translate(p, tr) if p != "" else "" for p in paras]
    translated_text = "\n".join(translated)

    return {
        "original_text": text,
        "detected_lang": detected_lang,
        "translated_text": translated_text,
        "target_lang": tgt,
    }
