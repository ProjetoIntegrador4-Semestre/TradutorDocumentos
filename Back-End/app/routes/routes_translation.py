from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
from app.services.translator import translate_text
from app.services.extractor import extract_text
from app.services.generator import generate_file
import os

router = APIRouter()

@router.post("/translate-file")
async def translate_file(
    file: UploadFile = File(...),
    target_lang: str = Form(...)
):
    # salvar temporariamente o arquivo
    contents = await file.read()
    file_path = f"temp/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(contents)

    # extrair texto do arquivo
    extracted_text = extract_text(file_path)

    # traduzir o texto
    result = translate_text(extracted_text, target_lang)

    if "error" in result:
        return result  # retorna erro em JSON

    # gerar novo arquivo traduzido
    output_file = generate_file(file_path, result["translated_text"])

    # retorna o arquivo para download
    return FileResponse(
        output_file,
        media_type="application/octet-stream",
        filename=f"translated_{os.path.basename(output_file)}"
    )
