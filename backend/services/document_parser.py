import fitz  # PyMuPDF
import docx
import io

def parse_pdf(file_bytes: bytes) -> list:
    pages = []
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for i, page in enumerate(doc):
            pages.append({"page": i + 1, "text": page.get_text() + "\n"})
    return pages

def parse_docx(file_bytes: bytes) -> list:
    doc = docx.Document(io.BytesIO(file_bytes))
    return [{"page": 1, "text": "\n".join([paragraph.text for paragraph in doc.paragraphs])}]

def parse_txt(file_bytes: bytes) -> list:
    return [{"page": 1, "text": file_bytes.decode("utf-8")}]

def parse_file(file_name: str, file_bytes: bytes) -> list:
    if file_name.endswith(".pdf"):
        return parse_pdf(file_bytes)
    elif file_name.endswith(".docx"):
        return parse_docx(file_bytes)
    elif file_name.endswith(".txt"):
        return parse_txt(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {file_name}")
