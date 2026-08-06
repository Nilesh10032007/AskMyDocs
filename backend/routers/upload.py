from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from backend.services.document_parser import parse_file
from backend.services.document_processor import process_document
from backend.database import docs_collection
import uuid
import datetime

router = APIRouter()

@router.post("/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        file_size = len(file_bytes)
        
        # Parse file immediately so we can return 400 if it fails
        text = parse_file(file.filename, file_bytes)
        
        # Generate ID
        doc_id = str(uuid.uuid4())
        
        # Save file to disk
        import os
        ext = os.path.splitext(file.filename)[1]
        upload_dir = os.path.join("backend", "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"{doc_id}{ext}")
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        
        # Initial DB entry
        await docs_collection.insert_one({
            "_id": doc_id,
            "filename": file.filename,
            "size": file_size,
            "status": "UPLOADED",
            "uploaded_at": datetime.datetime.utcnow()
        })
        
        # Process in background
        background_tasks.add_task(process_document, doc_id, file.filename, text, file_size)
        
        return {"doc_id": doc_id, "filename": file.filename, "status": "PROCESSING"}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
