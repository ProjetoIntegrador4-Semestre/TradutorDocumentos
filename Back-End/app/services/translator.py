from deep_translator import GoogleTranslator
from langdetect import detect

def translate_text(text: str, target_lang: str):
    try:
        detected_lang = detect(text)

        # Quebrar em blocos (linhas)
        lines = text.split("\n")
        translated_lines = []

        for line in lines:
            if line.strip():  # só traduz se não for vazio
                translated_line = GoogleTranslator(source="auto", target=target_lang).translate(line)
                translated_lines.append(translated_line)
            else:
                translated_lines.append("")

        translated_text = "\n".join(translated_lines)

        return {
            "original_text": text,
            "detected_lang": detected_lang,
            "translated_text": translated_text,
            "target_lang": target_lang
        }
    except Exception as e:
        return {
            "error": f"Translation failed: {str(e)}"
        }
