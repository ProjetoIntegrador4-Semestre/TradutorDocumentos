from __future__ import annotations

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Response, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import os
import traceback

from app.services.auth import get_current_user, require_admin
from app.models.entities import User, TranslationRecord
from fastapi import Query


from app.db import get_db
from app.services.translator import translate_text
from app.services.extractor import extract_text
from app.services.generator import generate_file

# ORM do teste (SQLite/Postgres)
from app.models.records import TranslationRecordOut

router = APIRouter()
os.makedirs("temp", exist_ok=True)

ALLOWED_EXTS = {".docx", ".pptx", ".pdf"}

def infer_file_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".docx":
        return "DOCX"
    if ext == ".pptx":
        return "PPTX"
    if ext == ".pdf":
        return "PDF"
    return "UNKNOWN"

def infer_media_type(filepath: str) -> str:
    ext = Path(filepath).suffix.lower()
    if ext == ".docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    if ext == ".pptx":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    if ext == ".pdf":
        return "application/pdf"
    return "application/octet-stream"

@router.post("/translate-file")
async def translate_file(
    file: UploadFile = File(...),
    target_lang: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Recebe um DOCX/PPTX/PDF, extrai texto, traduz e retorna o arquivo traduzido para download.
    Também salva um registro simples na tabela TranslationRecord.
    """
    try:
        # ---- validações iniciais
        original_name = file.filename or "upload.bin"
        ext = Path(original_name).suffix.lower()
        if ext not in ALLOWED_EXTS:
            if ext == ".ppt":
                raise HTTPException(status_code=400, detail="Formato .ppt não é suportado. Converta para .pptx.")
            raise HTTPException(status_code=400, detail="Formato não suportado. Envie .docx, .pptx ou .pdf.")

        # ---- salvar temporário
        tmp_path = Path("temp") / original_name
        contents = await file.read()
        with open(tmp_path, "wb") as fh:
            fh.write(contents)

        # ---- processar
        extracted_text = extract_text(str(tmp_path))
        result = translate_text(extracted_text, target_lang)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        output_path = generate_file(str(tmp_path), result["translated_text"])

        # ---- persistir registro simples (teste)
        rec = TranslationRecord(
            original_filename=original_name,
            file_type=infer_file_type(original_name),
            detected_lang=result.get("detected_lang"),
            target_lang=target_lang,
            user_id=current_user.id,
        )
        db.add(rec)
        db.commit()

        # Nome exibido no download (sem duplicar "translated_")
        download_name = Path(output_path).name  # já vem como translated_<original>.<ext>
        media_type = infer_media_type(output_path)

        return FileResponse(
            output_path,
            media_type=media_type,
            filename=download_name,
        )

    except HTTPException:
        # reapresenta erro conhecido
        raise
    except Exception as e:
        # log detalhado no console e erro claro para o cliente
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Falha ao processar arquivo: {e}")

@router.get("/records", response_model=list[TranslationRecordOut])
def list_records(
    mine: bool = True,                      
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(TranslationRecord).order_by(TranslationRecord.id.desc())

    if mine:
        q = q.filter(TranslationRecord.user_id == current_user.id)
    else:
        # só admin pode ver tudo
        if current_user.role != "admin":
            raise HTTPException(403, "Somente admin pode listar todos os registros.")

    rows = q.offset(offset).limit(limit).all()
    return rows

@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rec = db.get(TranslationRecord, record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Registro não encontrado.")
    db.delete(rec)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
