import os
from docx import Document
from pptx import Presentation
from PyPDF2 import PdfReader

SLIDE_BREAK = "\n\n---SLIDE_BREAK---\n\n"

def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".docx":
        doc = Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs)

    if ext == ".pptx":
        prs = Presentation(file_path)
        slides_out = []
        for slide in prs.slides:
            lines = []
            for shape in slide.shapes:
                if hasattr(shape, "has_text_frame") and shape.has_text_frame:
                    for para in shape.text_frame.paragraphs:
                        # some PPTX guard: joins runs if exist, else para.text
                        txt = "".join(run.text for run in para.runs) or (para.text or "")
                        if txt.strip():
                            lines.append(txt)
            slides_out.append("\n".join(lines))
        return SLIDE_BREAK.join(slides_out)

    if ext == ".pdf":
        reader = PdfReader(file_path)
        return "\n".join((page.extract_text() or "") for page in reader.pages)

    # se for .ppt (antigo), rejeita explicitamente
    if ext == ".ppt":
        raise ValueError("Formato .ppt não suportado. Converta para .pptx.")

    raise ValueError("Formato de arquivo não suportado. Use .docx, .pptx ou .pdf.")
